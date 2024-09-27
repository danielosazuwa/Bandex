const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const _ = require("lodash");
// const axios = require("axios");
const session = require("express-session");
const cookies = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const fs = require("fs");
const connection = require("./database/connection");
const collection = require("./model/user");
const uploadCollection = require("./model/upload");
dotenv.config({ path: "config.env" });
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  // fileFilter: (req, file, cb) => {
  //   if (file.mimetype == "image/png" || file.mimetype == "image/jpg") {
  //     cb(null, true);
  //   } else {
  //     console.log("Only jpg and png files are supported!");
  //     cb(null, false);
  //   }
  // },
  // limits: {
  //   filesize: 1024 * 1024 * 2,
  // },
});
const morgan = require("morgan");
const app = express();

const port = 3000;

//MongoDB connection
connection();

//convert data into json format
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

//use EJS as a view engine
app.set("view engine", "ejs");

//static file
app.use(express.static("public"));
app.use("/images", express.static("images"));
app.use(methodOverride("_method"));
// Initialization
app.use(cookies());

app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
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

//SIGNUP ROUTE BEGINS
app.get("/signup", isAuthenticated, (req, res) => {
  res.render("signup");
});

//Register user
app.post("/signup", isAuthenticated, async (req, res) => {
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
    console.log(data.password.length);
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
//SIGNUP ROUTE ENDS

//LOGIN ROUTE BEGINS
app.get("/login", (req, res) => {
  res.render("login");
});

//login user
app.post("/login", async (req, res) => {
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
      return res.render("login", { error: "Invalid email or password" });
    }
    // Store user information in session
    req.session.user = {
      id: check._id,
      email: check.email,
    };

    res.render("home", { email: req.session.user.email });
  } catch {
    res.render("login", { error: "Invalid email or password" });
  }
});

//logout
app.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Server Error");
    }
  });

  res.clearCookie("userData");
  console.log("Cookies Cleared");
  res.redirect("/");
});
//LOGIN ROUTE ENDS

//UPLOAD ROUTE BEGINS
app.get("/upload", isAuthenticated, (req, res) => {
  res.render("upload");
});

//save uploaded files to mongodb database
app.post(
  "/upload",
  isAuthenticated,
  upload.single("myFile"),
  async (req, res) => {
    // how to set parameters for image file MongoDB schema
    const uploadedFiles = {
      file: req.file.path,
      brand: _.trim(req.body.brand),
      price: _.trim(req.body.price),
    };

    const uploaded = await uploadCollection.insertMany(uploadedFiles);
    console.log(uploaded);

    res.render("home", {
      created: "Content uploaded successfully",
    });
  }
);
//UPLOAD ROUTE ENDS

//RETRIEVE THE DETAILS OF A PARTICULAR POST
app.get("/edit-upload", isAuthenticated, (req, res) => {
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
app.put(
  "/edit-upload/:id",
  isAuthenticated,
  upload.single("myFile"),
  async (req, res) => {
    const id = req.params.id;
    const image = req.file ? req.file.path : null;
    const brand = req.body.brand;
    const price = req.body.price;
    try {
      const updatedUpload = await uploadCollection.findByIdAndUpdate(
        id,
        {
          file: image || undefined,
          brand: brand || undefined,
          price: price || undefined,
        },
        { new: true }
      );

      if (!updatedUpload) {
        return res.status(400).send({
          message: `Cannot update, upload not found`,
        });
      } else {
        // console.log(updatedUpload);
        //TODO:SET THE EDIT ROUTE SUCCESS TO A PAGE
        res.send("changes updated");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

app.delete("/delete-upload/:id", isAuthenticated, async (req, res) => {
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
        const filePath = path.join(__dirname, fileName);

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

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

app.listen(port, () => console.log(`server is running at port ${port}`));
