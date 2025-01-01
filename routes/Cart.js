const express = require("express");
const router = express.Router();
const path = require("path");
const isAuthenticated = require("../routes/auth");
const uploadCollection = require("../model/upload");
const flash = require('connect-flash')
// const _ = require("lodash");

// Route to view the cart
router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  res.render("cart", { cart, auth: req.session.user });
});

// Route to add product to cart
router.post("/add-to-cart", async (req, res) => {
  const { productId, quantity, size } = req.body;


  // if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
  //   return res.status(400).json({ message: 'Invalid product, quantity or size' });
  // }

  if (!productId) {
    return res.status(400).json({ message: "Invalid product" });
  }


  try {
    const product = await uploadCollection.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }



    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Check if product is already in the cart
    const existingProductIndex = req.session.cart.findIndex(
      (item) => item.product._id.toString() === productId
    );
    if (existingProductIndex > -1) {
      // Update the quantity
      req.session.cart[existingProductIndex].quantity = quantity;
      req.session.cart[existingProductIndex].size = size;
    } else {
      // Add the new product to the cart
      req.session.cart.push({ product, quantity, size });
    }

    // if (existingProductIndex) {
    //   req.session.cart.push({ product });
    // }

    res.redirect(`/cart`);
  } catch (err) {
    res.status(500).send("Error adding product to cart");
  }
});

// Route to remove item from cart
router.post("/remove-from-cart", (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(
      (item) => item.product._id.toString() !== productId
    );
  }

  res.redirect("/cart");
});

module.exports = router;
