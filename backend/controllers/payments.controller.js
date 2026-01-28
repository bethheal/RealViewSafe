import crypto from "crypto";
import https from "https";
import prisma from "../prisma/client.js";
import { getAgentProfileByUserId } from "../services/user.service.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const getPaystackSecret = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
};

const getAppBaseUrl = () => {
  const raw = process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173";
  return String(raw).replace(/\/+$/, "");
};

const planCodeFor = (planKey) => {
  const key = String(planKey || "").toUpperCase();
  if (key === "BASIC") return process.env.PAYSTACK_PLAN_STANDARD;
  if (key === "PREMIUM") return process.env.PAYSTACK_PLAN_PREMIUM;
  return null;
};

const planAmountFor = (planKey) => {
  const key = String(planKey || "").toUpperCase();
  const fromEnv =
    key === "BASIC"
      ? process.env.PAYSTACK_AMOUNT_STANDARD
      : key === "PREMIUM"
      ? process.env.PAYSTACK_AMOUNT_PREMIUM
      : null;

  if (fromEnv) {
    const num = Number(fromEnv);
    if (Number.isFinite(num) && num > 0) return Math.round(num);
  }

  // Default amounts in pesewas (GHS * 100)
  if (key === "BASIC") return 15000;
  if (key === "PREMIUM") return 25000;
  return null;
};

const isPlaceholderPlanCode = (code) =>
  !code ||
  code === "PLN_STANDARD_CODE" ||
  code === "PLN_PREMIUM_CODE" ||
  code === "PLN_PLACEHOLDER";

async function httpRequest(url, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode || 500,
          text: data,
        });
      });
    });

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

const planKeyFromCode = (code) => {
  if (!code) return null;
  if (code === process.env.PAYSTACK_PLAN_STANDARD) return "BASIC";
  if (code === process.env.PAYSTACK_PLAN_PREMIUM) return "PREMIUM";
  return null;
};

const extractPlanKey = (data) => {
  const metaPlan = data?.metadata?.planKey;
  if (metaPlan) return String(metaPlan).toUpperCase();

  const planValue =
    typeof data?.plan === "string"
      ? data.plan
      : data?.plan?.plan_code || data?.plan?.planCode || null;

  return planKeyFromCode(planValue);
};

async function paystackRequest(path, options = {}) {
  const secret = getPaystackSecret();
  const headers = {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  let statusCode = 500;
  let text = "";

  if (typeof fetch === "function") {
    const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
      ...options,
      headers,
    });
    statusCode = res.status;
    text = await res.text();
  } else {
    const response = await httpRequest(`${PAYSTACK_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body,
    });
    statusCode = response.statusCode;
    text = response.text;
  }

  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  const ok = statusCode >= 200 && statusCode < 300;
  if (!ok || !payload?.status) {
    const message = payload?.message || "Paystack request failed";
    throw new Error(message);
  }

  return payload;
}

async function activateSubscriptionForUser({
  userId,
  planKey,
  customerCode,
  subscriptionCode,
}) {
  if (!userId || !planKey) return;

  const agent = await getAgentProfileByUserId(userId);
  if (!agent) return;

  await prisma.subscription.upsert({
    where: { agentId: agent.id },
    update: { plan: planKey, expiresAt: null },
    create: { agentId: agent.id, plan: planKey, expiresAt: null },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "ACTIVE",
      paystackCustomerCode: customerCode || undefined,
      paystackSubscriptionCode: subscriptionCode || undefined,
    },
  });
}

export async function initializePaystackSubscription(req, res) {
  try {
    const { plan } = req.body || {};
    const planKey = String(plan || "").toUpperCase();
    const planCode = planCodeFor(planKey);
    const amount = planAmountFor(planKey);

    if (!planCode || isPlaceholderPlanCode(planCode)) {
      return res.status(400).json({
        message:
          "Missing Paystack plan code. Set PAYSTACK_PLAN_STANDARD and PAYSTACK_PLAN_PREMIUM in backend/.env.",
      });
    }
    if (!amount) {
      return res.status(400).json({
        message:
          "Missing Paystack amount. Set PAYSTACK_AMOUNT_STANDARD and PAYSTACK_AMOUNT_PREMIUM in backend/.env.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, fullName: true },
    });
    if (!user?.email) {
      return res.status(400).json({ message: "User email is required for Paystack" });
    }

    const agent = await getAgentProfileByUserId(req.user.id);
    if (!agent) {
      return res.status(400).json({ message: "Agent profile not found" });
    }

    const callbackUrl = `${getAppBaseUrl()}/agent/billing`;

    const payload = {
      email: user.email,
      amount: String(amount),
      currency: "GHS",
      plan: planCode,
      callback_url: callbackUrl,
      metadata: {
        userId: user.id,
        agentId: agent.id,
        planKey,
      },
    };

    const response = await paystackRequest("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return res.json({
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      reference: response.data.reference,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Paystack init failed" });
  }
}

export async function verifyPaystackTransaction(req, res) {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ message: "Reference is required" });
    }

    const response = await paystackRequest(`/transaction/verify/${reference}`, {
      method: "GET",
    });

    if (response.data?.status !== "success") {
      return res.status(400).json({ message: "Payment not successful yet" });
    }

    const planKey = extractPlanKey(response.data);
    if (!planKey) {
      return res.status(400).json({ message: "Unable to resolve plan from Paystack response" });
    }

    await activateSubscriptionForUser({
      userId: req.user.id,
      planKey,
      customerCode: response.data?.customer?.customer_code,
      subscriptionCode:
        response.data?.subscription?.subscription_code ||
        response.data?.subscription_code ||
        null,
    });

    return res.json({ status: "success", plan: planKey });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Paystack verify failed" });
  }
}

export async function handlePaystackWebhook(req, res) {
  try {
    const secret = getPaystackSecret();
    const signature = req.headers["x-paystack-signature"];
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const { event, data } = req.body || {};

    if (event === "charge.success") {
      const userId = data?.metadata?.userId;
      const planKey = extractPlanKey(data);
      if (userId && planKey) {
        await activateSubscriptionForUser({
          userId,
          planKey,
          customerCode: data?.customer?.customer_code,
          subscriptionCode:
            data?.subscription?.subscription_code || data?.subscription_code || null,
        });
      }
    }

    if (event === "subscription.create") {
      const planKey = extractPlanKey(data);
      const email = data?.customer?.email;
      let userId = data?.metadata?.userId;

      if (!userId && email) {
        const user = await prisma.user.findUnique({ where: { email } });
        userId = user?.id || null;
      }

      if (userId && planKey) {
        await activateSubscriptionForUser({
          userId,
          planKey,
          customerCode: data?.customer?.customer_code,
          subscriptionCode: data?.subscription_code || data?.subscription?.subscription_code,
        });
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return res.sendStatus(200);
  }
}
