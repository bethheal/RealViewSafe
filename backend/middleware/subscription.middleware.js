import { getSubscriptionSnapshot } from "../services/subscription.service.js";

export const requireActiveSubscription = async (req, res, next) => {
  try {
    const snapshot = await getSubscriptionSnapshot(req.user.id);
    if (!snapshot) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (snapshot.subscriptionStatus === "ACTIVE" || snapshot.trialActive) {
      req.subscription = snapshot;
      return next();
    }

    return res.status(402).json({
      message: "Subscription required",
      subscriptionStatus: snapshot.subscriptionStatus,
      trialEndsAt: snapshot.trialEndsAt,
    });
  } catch (err) {
    console.error("subscription middleware error:", err);
    return res.status(500).json({ message: "Subscription check failed" });
  }
};
