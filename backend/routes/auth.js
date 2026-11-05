const express = require("express");
const { body } = require("express-validator/check");

const authController = require("../controllers/auth");

const router = express.Router();
const emailRule = () =>
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail();

router.put(
  "/signup",
  [
    body("name").trim().isLength({ min: 1, max: 80 }),
    emailRule(),
    body("password")
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters."),
  ],
  authController.signup,
);

router.post(
  "/login",
  [emailRule(), body("password").not().isEmpty()],
  authController.login,
);

router.post("/reset", emailRule(), authController.requestPasswordReset);
router.post("/auth/reset", emailRule(), authController.requestPasswordReset);
router.post(
  "/update-password",
  [
    body("token").isHexadecimal().isLength({ min: 64, max: 64 }),
    body("password")
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters."),
  ],
  authController.updatePassword,
);

module.exports = router;
