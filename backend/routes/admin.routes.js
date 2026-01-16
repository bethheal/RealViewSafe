router.get("/dashboard", protect, allowRoles("ADMIN"), dashboard);
router.patch("/properties/:id/review", protect, allowRoles("ADMIN"), reviewProperty);
// admin.routes.js
router.get("/analytics", protect, allowRoles("ADMIN"), analyticsDashboard);
router.post("/subscriptions", protect, allowRoles("ADMIN"), assignSubscription);
