import prisma from "../prisma/client.js";
import crypto from "crypto";

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
    message: "Password reset link sent",
      });
    }

    // 2️⃣ Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // 3️⃣ Remove old tokens (important)
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // 4️⃣ Save new token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // 5️⃣ Send email (Resend / Nodemailer / etc)
    // await sendResetEmail(email, token);

    return res.json({
      message: "Password reset link sent",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export default forgotPassword;
