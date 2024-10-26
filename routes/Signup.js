const express = require("express");
const router = express.Router();
const _ = require("lodash");
const isAuthenticated = require("../routes/auth");
const bcrypt = require("bcrypt");
const collection = require("../model/user");

//SIGNUP ROUTE BEGINS
router.get("/signup", isAuthenticated, (req, res) => {
  res.render("signup");
});

//Register user
router.post("/signup", isAuthenticated, async (req, res) => {
  const data = {
    email: _.trim(req.body.email),
    password: _.trim(req.body.password),
  };

  //check if user already exist
  const existingUser = await collection.findOne({ email: data.email });
  if (existingUser) {
    res.render("signup", {
      err: "User already exists. Please choose a different name",
    });
  } else {
    //This ensures that the password is at least six characters
    // console.log(data.password.length);
    if (data.password.length < 6) {
      console.log("Password is less than 6 characters");
      res.render("signup", { error: "Password is less than 6 characters" });
    } else {
      //hash the password using bcrypt method
      const saltRounds = 10; //Number of salt round for bcrypt
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      data.password = hashedPassword; //Replace the original password with hash password
      const userData = await collection.insertMany(data);
      // console.log(userData);
      res.render("login", { created: "User account successfully created" });
    }
  }
});

module.exports = router;
