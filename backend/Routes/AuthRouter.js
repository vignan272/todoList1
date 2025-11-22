const express = require("express");
const { signup, login } = require("../Controllers/AuthController");
const {
  signupValidation,
  loginValidation,
} = require("../Middlewares/AuthValidation");

const router = express.Router();

console.log("signupValidation is:", signupValidation);
console.log("signup is:", signup);

router.post("/login", loginValidation, login);
router.post("/signup", signupValidation, signup);

module.exports = router;
