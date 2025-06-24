const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth")

// Public routes
router.post("/register", userController.initiateRegistration);
router.post("/verify-otp-register", userController.verifyOTPAndRegister);
router.post("/resend-otp", userController.resendOTP);
router.post("/login", userController.login);
router.get("/verify-token", protect, userController.verifyToken);
router.post('/forgot-password', userController.forgotPassword);
router.get('/verify-reset-token', userController.verifyResetToken);
router.post('/reset-password', userController.resetPassword);
// Protected routes
router.get("/me", protect, userController.getCurrentUser);
router.put("/update/:id", protect, userController.updateUser);
router.put("/location/:userId", userController.updateLocation);
router.delete("/delete/:id", protect, userController.deleteUser);
router.post("/change-password", protect, userController.changePassword);
router.put("/change-address", protect, userController.updateUserContact);
// Admin only routes
router.get(
  "/all",
  protect,
  authorize("admin", "seller"),
  userController.getAllUsers
);
router.get("/:id", protect, userController.getUserById);

module.exports = router;
