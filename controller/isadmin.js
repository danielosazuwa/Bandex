const { forEach } = require("lodash");
const collection = require("../model/user");

exports.isAdmin = (req, res, next) => {
  collection.find().then((user) => {
    user.forEach((users) => {
      console.log(users.roles);
      if (users.roles === 0) {
        res.end("Access denied");
      }
    });
    // res.render("allusers", { users: user });
  });
  // const check = await collection.findOne({ email: _.trim(req.body.email) });
  // if (req.user.roles === 0) {
  //   return next(new ErrorResponse("Access denied, you must be an admin, 40"));
  // }
  // console.log(req.body.roles);
  next();
};
