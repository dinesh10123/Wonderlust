const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient  = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// ✅ Fixed: Correct render function for creating a new listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");  // No need to fetch an ID
};

// ✅ Fixed: Correct show function with return to prevent further execution
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings"); // ✅ Return to stop execution
    }


    res.render("listings/show.ejs", { listing });
    

};

// ✅ Fixed: Correct function for creating a new listing
module.exports.createListing = async (req, res) => {
    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send();  
        // res.send("done");
      
       
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;
    
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// ✅ Fixed: Correct render function for editing a listing
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings"); // ✅ Return to prevent errors
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = listing.image.url.replace("/upload", "/upload/w_150,h_100,c_fill,q_50");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ✅ Fixed: Correct function for updating a listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
};

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// ✅ Fixed: Correct function for deleting a listing
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    
    if (!deletedListing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings"); // ✅ Return after redirecting
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
 