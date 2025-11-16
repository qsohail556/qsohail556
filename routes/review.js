const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")
const reviewControllers = require("../controllers/review.js");

//Review 
//post review route
router.post("/" ,
    isLoggedIn, 
    validateReview ,
    wrapAsync(reviewControllers.createReview)
);

// Review Delete Route
router.delete("/:reviewId", 
    isReviewAuthor, isLoggedIn, 
    wrapAsync(reviewControllers.deleteReview));

module.exports = router;