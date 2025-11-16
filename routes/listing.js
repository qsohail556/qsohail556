const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const listingControllers = require("../controllers/listing.js")
const {isLoggedIn , isOwner ,validateListing} = require("../middleware.js");
const multer  = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
  .get(wrapAsync(listingControllers.index))              
  .post( 
    isLoggedIn,
    upload.single("image"), // ✅ Correct for form field name "listing[image]"
    validateListing,                     
    wrapAsync(listingControllers.createListing)
  );

    

// New route - show form to create new listing
router.get("/new", isLoggedIn , listingControllers.renderNewForm);


router.route("/:id")
    .get(wrapAsync(listingControllers.showListing))  // Show route - display details for a specific listing

// Update route - handle PUT request to update listing
   .put(  
      isLoggedIn, 
      upload.single("image"), // ✅ Same as form field name
      validateListing,
      isOwner, 
      wrapAsync(listingControllers.updateListing)
    )


// Delete route - handle deletion of a listing
    .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.deleteListing))


// Edit route - show form to edit a listing
    router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingControllers.editListing));

module.exports = router;