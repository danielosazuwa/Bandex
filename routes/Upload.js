const express = require("express");
const router = express.Router();
const path = require("path");
const isAuthenticated = require("../routes/auth");
const uploadCollection = require("../model/upload");
const _ = require("lodash");
const fs = require("fs");

// const methodOverride = require("method-override");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// router.use("/images", express.static(path.join(__dirname, "public/images")));

const upload = multer({
  storage: storage,
});

router.use("/images", express.static("images"));

//UPLOAD ROUTE BEGINS
router.get("/upload", isAuthenticated, (req, res) => {
  res.render("upload");
});

router.post(
  "/upload",
  isAuthenticated,
  upload.single("myFile"),
  async (req, res) => {
    try {
      // Make sure file is present
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      // Set parameters for the MongoDB schema
      const uploadedFiles = {
        file: req.file.path,
        brand: _.trim(req.body.brand),
        price: _.trim(req.body.price),
        currency: _.trim(req.body.currency),
      };

      // Insert the file data into the MongoDB collection
      const uploaded = await uploadCollection.insertMany([uploadedFiles]);

      // Respond with success message if everything goes smoothly
      res.render("admin", {
        created: "Content uploaded successfully",
        auth:req.session.user,
    rolePermission: req.session.user.roles,
    email: req.session.user.email,

      });
    } catch (error) {
      // If there's an error (file upload or database), handle it here
      console.error("Error during upload:", error);
      res.status(500).send("Something went wrong while uploading.");
    }
  }
);
// //save uploaded files to mongodb database
// router.post(
//   "/upload",
//   isAuthenticated,
//   upload.single("myFile"),
//   async (req, res) => {
//     // how to set parameters for image file MongoDB schema
//     const uploadedFiles = {
//       file: req.file.path,
//       brand: _.trim(req.body.brand),
//       price: _.trim(req.body.price),
//       currency: _.trim(req.body.currency),
//     };

//     // console.log(uploadedFiles.file);
//     const uploaded = await uploadCollection.insertMany(uploadedFiles);
//     // console.log(uploaded);

//     res.render("admin", {
//       created: "Content uploaded successfully",
//     });
//   }
// );
//UPLOAD ROUTE ENDS

//RETRIEVE THE DETAILS OF A PARTICULAR POST
router.get("/edit-upload", isAuthenticated, (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    uploadCollection
      .findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "Post not found" });
        } else {
          res.status(200).render("update-post", { data: data });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error occurred while retrieving post information",
        });
      });
  }
});

//SAVE THE CHANGES
router.put(
  "/edit-upload/:id",
  isAuthenticated,
  upload.single("myFile"),
  async (req, res) => {
    const id = req.params.id;
    const image = req.file ? req.file.path : null;
    const brand = req.body.brand;
    const price = req.body.price;
    const currency = req.body.currency;
    try {
      const updatedUpload = await uploadCollection.findByIdAndUpdate(
        id,
        {
          file: image || undefined,
          brand: brand || undefined,
          price: price || undefined,
          currency: currency || undefined,
        },
        { new: true }
      );

      if (!updatedUpload) {
        return res.status(400).send({
          message: `Cannot update, upload not found`,
        });
      } else {
        // console.log(updatedUpload);
        // res.send("changes updated");
        res
          .status(200)
          .render("admin", {
            update: "Changes updated",
            email: req.session.user.email,
            rolePermission: req.session.user.roles,
            auth:req.session.user,
          });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

// router.delete("/delete-upload/:id", isAuthenticated, async (req, res) => {
//   const id = req.params.id;
//   uploadCollection
//     .findByIdAndDelete(id)
//     .then((data) => {
//       if (!data) {
//         res.status(404).send({
//           message: `Cannot delete with ${id}, mayabe id is wrong`,
//         });
//       } else {
//         const fileName = data.file;
//         const filePath = "public" + path.join(fileName);
//         // console.log(filePath);
//         //This deletes the image file from the images folder
//         fs.unlink(filePath, (err) => {
//           if (err) {
//             console.error("Error deleting file:", err);
//             return res.status(500).send("File deletion failed.");
//           }
//         });
//         res.send({
//           message: "User was deleted successfully",
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: `Could not delete user with id= ${id}`,
//       });
//     });
// });

module.exports = router;
