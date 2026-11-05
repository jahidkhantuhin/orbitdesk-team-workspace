const crypto = require("crypto");

const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mailGun = require("nodemailer-mailgun-transport");

const User = require("../models/user");

const mailgunKey = process.env.MAILGUN_API_KEY;
const mailgunDomain = process.env.MAILGUN_DOMAIN;
const appUrl = (process.env.APP_URL || "http://localhost:5000").replace(
  /\/$/,
  "",
);
const appName = process.env.APP_NAME || "OrbitDesk";
const emailFrom = process.env.EMAIL_FROM;
const transporter =
  mailgunKey && mailgunDomain
    ? nodemailer.createTransport(
        mailGun({
          auth: {
            api_key: mailgunKey,
            domain: mailgunDomain,
          },
        }),
      )
    : null;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateRequest(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = createError("Please check the provided details.", 422);
    error.data = errors.array();
    throw error;
  }
}

exports.signup = async (req, res, next) => {
  try {
    validateRequest(req);
    const user = new User({
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 12),
      name: req.body.name,
    });
    await user.save();
    res.status(201).json({ message: "User created!", userId: user._id });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "An account with this email already exists.";
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    validateRequest(req);
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      throw createError("Email or password is incorrect.", 401);
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.status(200).json({
      token,
      userId: user._id.toString(),
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    validateRequest(req);
    const allowDevelopmentLinks =
      process.env.NODE_ENV !== "production" &&
      process.env.DEV_RESET_LINKS === "true";
    if (!transporter && !allowDevelopmentLinks) {
      throw createError(
        "Password recovery email is not configured for this service.",
        503,
      );
    }

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 60 * 60 * 1000;
      await user.save();
      if (transporter) {
        await transporter.sendMail({
          from: emailFrom || `${appName} <postmaster@${mailgunDomain}>`,
          to: user.email,
          subject: `Reset your ${appName} password`,
          html: `<p>You requested a password reset.</p><p><a href="${appUrl}/reset/${token}">Choose a new password</a>. This link expires in one hour.</p>`,
        });
      }
      if (allowDevelopmentLinks) {
        req.resetUrl = `${appUrl}/reset/${token}`;
      }
    }

    res.status(200).json({
      message:
        "If an account exists for that email, a reset link is on its way.",
      ...(req.resetUrl ? { resetUrl: req.resetUrl } : {}),
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    validateRequest(req);
    const user = await User.findOne({
      resetToken: req.body.token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      throw createError(
        "This password reset link is invalid or has expired.",
        400,
      );
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.status(200).json({ message: "Your password has been updated." });
  } catch (error) {
    next(error);
  }
};
