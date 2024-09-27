const express = require("express");
const router = express.Router();

router.get("/upload", (req, res) => {
  res.render("upload");
});

//save uploaded files to mongodb database
router.post("/upload", async (req, res) => {
  const uploadedFiles = {
    file: _.trim(req.body.myFile),
    brand: _.trim(req.body.brand),
    price: _.trim(req.body.price),
  };

  const uploaded = await uploadCollection.insertMany(uploadedFiles);
  console.log(uploaded);
  // console.log(userData);
  // res.render("login", { created: "User account successfully created" });
  res.send("files have been uploaded");
});

module.exports = router;
