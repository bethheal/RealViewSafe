import prisma from "../prisma/client.js";

import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


dotenv.config(); // must be at the top

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const { email, name, sub } = ticket.getPayload();

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        fullName: name,
        emailVerified: true,
        roles: { connect: { name: "BUYER" } }
      }
    });
  }

  res.json({ token: signJwt(user) });
};
