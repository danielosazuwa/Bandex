const express = require("express");
const router = express.Router();
const uploadCollection = require("../model/upload");
const auth = require("./auth");

// connection();

//TODO Create a schema for a user to create an account and login
//TODO There should be a profile section on the homepage where a user can see his or her details and even edit
//TODO Implement the add to cart functionality

router.get("/", (req, res) => {
  // var requrl = url.format({
  //   protocol: req.protocol,
  //   host: req.get("host"),
  //   pathname: req.originalUrl,
  // });

  // console.log(requrl);

  uploadCollection
    .find()
    .then((upload) => {
      res.render("root", { uploads: upload, auth: req.session.user });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error occurred while retrieving user information",
      });
    });
  // res.render("root");
});
module.exports = router;
