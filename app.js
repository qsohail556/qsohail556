if(process.env.NODE_ENV != "Production"){
   require('dotenv').config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");

const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStragety = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// Importing method-override to support PUT and DELETE methods in forms
const methodOverride = require("method-override");
const user = require("./models/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";
const dbUrl = process.env.ATLASDB_URL;

// Connecting to MongoDB using async/await
main().then(() => {
    console.log("connect to db");                   
}).catch(err => {
    console.log(err); 
});

async function main() {
    try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
  } catch(err) {
    console.error("DB connection error:", err);
  }                                               
}

// Setting EJS as the templating/view engine
app.set("view engine", "ejs");

// Setting the directory where views (EJS files) are located
app.set("views", path.join(__dirname, "views"));

// Middleware to parse incoming request bodies with urlencoded payloads
app.use(express.urlencoded({ extended: true }));

// Middleware to override HTTP methods using query parameter (e.g., ?_method=DELETE)
app.use(methodOverride("_method"));

app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto :{
      secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error", (err) => {
    console.error("session store error:", err);
});
// Session options for express-session middleware
const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized : true, 
    cookie:{
        expires: Date.now() + 7 *24 * 60 * 60 * 1000,
        maxAge : 7 *24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


// Root route - basic test route
app.get("/", (req, res) => {
    res.redirect("/listings");
});


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStragety(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/review", reviewsRouter);
app.use("/", userRouter);

app.use(function(req, res, next) {
  res.status(404).send("Page not found");
});


// Error handling middleware - must be after all routes
app.use((err,req,res,next) =>{
    let {statusCode = 500 , message = "something went wrong"} = err;
    
    if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(statusCode).json({ error: message });
    }
    res.status(statusCode).render("error.ejs" , {message});
    // res.status(statusCode).send(message);
});

// Start the server on port 8080
app.listen(8080, () => {
    console.log("server running on port 8080");                       // Log server start
});
