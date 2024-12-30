const express = require("express");
const router = express.Router();
const collection = require("../model/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const isAuthenticated = require("../routes/auth");

//LOGIN ROUTE BEGINS
router.get("/login", (req, res) => {
  res.render("login");
});

//login user
router.post("/login", async (req, res) => {
  try {
    // check for user
    const check = await collection.findOne({ email: _.trim(req.body.email) });
    if (!check) {
      res.send("user does not exist");
    }

    //compare the hash password from database
    const isPasswordMatch = await bcrypt.compare(
      _.trim(req.body.password),
      check.password
    );
    if (!isPasswordMatch) {
      // return res.redirect("/login");
      return res.render("login", { error: "Invalid login credentials" });
    }
    // Store user information in session
    req.session.user = {
      id: check._id,
      email: check.email,
      roles: check.roles,
    };

    // console.log(check.roles)

    res.render("admin", {
      email: check.email,
      auth: req.session.user,
      rolePermission: check.roles,
    });
  } catch {
    res.render("login", { error: "Invalid email or password" });
  }
});

//logout
router.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Server Error");
    }
  });

  res.clearCookie("userData");
  // console.log("Cookies Cleared");
  res.redirect("/");
});

//admin panel
router.get("/admin", isAuthenticated, async (req, res) => {
  // At this point, req.session.user exists, so the user is authenticated
  res.render("admin", {
    email: req.session.user.email,
    rolePermission: req.session.user.roles,
    auth: req.session.user,
  });
});
module.exports = router;
