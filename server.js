// dependencies
let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let logger = require('morgan');
require("dotenv").config();


//models
let db = require("./models");

// allow mongoose to use promises
mongoose.Promise = Promise;

//express initialize and express router
let app = express();
let router = express.Router();

// Set up all functionality for app
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(express.static("public"));


// router middleware to handle every request
app.use(router);

// pass in router object to the routes file
require('./routes/scrapeRoutes.js')(router, db);

// Set up database with mongoose
if (process.env.MONGODB_URI) {
  //THIS EXECUTES IF THIS IS IN HEROKU
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect("mongodb://localhost/mongoNewsScrape")
}

// Set Handlebars.
let exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Listen on port 3000
app.listen(process.env.PORT || 8080, function () {
  console.log("App running on port 8080!");
});

