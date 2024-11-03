const express = require("express");
const router = express.Router();
const path = require("path");
const isAuthenticated = require("./auth");
const uploadCollection = require("../model/upload");
const _ = require("lodash");
const fs = require("fs");

router.use("/images", express.static(path.join(__dirname, "/images")));

router.delete("/delete-upload/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  uploadCollection
    .findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete with ${id}, mayabe id is wrong`,
        });
      } else {
        const fileName = data.file;
        const filePath = `public${path.join(fileName)}`;
        // console.log(filePath);
        //This deletes the image file from the images folder
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return res.status(500).send("File deletion failed.");
          }
        });
        res.send({
          message: "User was deleted successfully",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Could not delete user with id= ${id}`,
      });
    });
});

module.exports = router;
