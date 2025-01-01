const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cookies = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const connection = require("./database/connection");
const flash = require('connect-flash');
const path = require("path");

dotenv.config({ path: "config.env" });

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
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);

//Middleware for flash messages
app.use(flash());

//import routes
const userRoutes = require("./routes/User"); //root route
const loginRoutes = require("./routes/Login"); //login route
const signupRoutes = require("./routes/Signup"); //signup route
const uploadRoutes = require("./routes/Upload");
const DeleteRoutes = require("./routes/Delete-item");
const CartRoutes = require("./routes/Cart"); //cart route

//use routes
app.use(userRoutes); //root route
app.use(loginRoutes); //login route
app.use(signupRoutes); //signup route
app.use(uploadRoutes); //upload route
app.use(DeleteRoutes); //upload route
app.use(CartRoutes); //upload route

app.listen(port, () => console.log(`server is running at port ${port}`));
