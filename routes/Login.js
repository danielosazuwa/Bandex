const express = require("express");
const router = express.Router();

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
      return res.redirect("/login");
    }
    // Store user information in session
    req.session.user = {
      id: check._id,
      email: check.email,
    };

    res.render("home", { email: check.email });
  } catch {
    res.render("login.ejs", { error: "Invalid email or password" });
  }
});

//logout
router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    console.log("session destroyed");
  });

  res.clearCookie("userData");
  console.log("Cookies Cleared");
  res.redirect("/");
});

module.exports = router;
