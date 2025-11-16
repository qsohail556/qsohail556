const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});                      
    res.render("listings/index.ejs", { allListings });                
}

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new");                                     
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;                                          
    const listing = await Listing.findById(id)
    .populate({path:"Reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner") ;                   
    if(!listing) {
        req.flash("error" , "Listing you requested for does not exist");
        return res.redirect("/listings"); 
    }                                    
    res.render("listings/show", { listing });                     
}

module.exports.createListing = async (req, res, next) => {
    let url= req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);           
    newListing.owner = req.user._id; 
    newListing.image = {url , filename};

    console.log(req.file);
    await newListing.save();  
    req.flash("success"  , "New Listing created!");                                 
    res.redirect("/listings");                                
}

module.exports.editListing = async (req, res) => {
    let { id } = req.params;                                  
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error" , "Listing you requested for does not exist");
        return res.redirect(`/listings/${id}`);
    }   
 
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_250");
    res.render("listings/edit", { listing , originalImageUrl });               
}

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // ✅ Use object spread to cleanly update listing fields
    const { title, description, price, location, country } = req.body.listing;
    listing.title = title;
    listing.description = description;
    listing.price = price;
    listing.location = location;
    listing.country = country;

    // ✅ If new image uploaded, replace old
    if (req.file) {
        console.log("File uploaded:", req.file);
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    } else {
        console.log("No file uploaded");
    }

    await listing.save();
    // console.log("✅ Updated listing:", listing);
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;                                     
    let deletedListing = await Listing.findByIdAndDelete(id);   
    // console.log(deletedListing);
    req.flash("success"  , "Listing deleted!");                               
    res.redirect("/listings");                               
}