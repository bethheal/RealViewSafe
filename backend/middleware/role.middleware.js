export const allowRoles = (...allowed) => (req, res, next) => {
  const roles = req.user?.roles || []; // expects array like ["BUYER","AGENT"]

  const ok = roles.some((r) => allowed.includes(r));
  if (!ok) {
    return res.status(403).json({
      message: "Forbidden: insufficient role",
      allowed,
      got: roles,
    });
  }

  next();
};
