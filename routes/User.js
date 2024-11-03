const express = require("express");
const router = express.Router();
const uploadCollection = require("../model/upload");
const auth = require("./auth");
const path = require("path");

// connection();

//TODO Create a schema for a user to create an account and login
//TODO There should be a profile section on the homepage where a user can see his or her details and even edit
//TODO Implement the add to cart functionality
router.use("/images", express.static(path.join(__dirname, "public/images")));

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

router.get("/upload/:Id", async (req, res) => {
  if (req.params.Id) {
    const id = req.params.Id;
    uploadCollection
      .findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "Post not found" });
        } else {
          res.render("full-catalogue", { catalogue: data });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error occurred while retrieving post information",
        });
      });
  }
});
module.exports = router;
