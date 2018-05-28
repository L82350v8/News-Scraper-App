var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

// Configure middleware
//===================================================================================================
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
//===================================================================================================
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes
//===================================================================================================
// A GET route for scraping the bloomberg website//
app.get("/scrape", function (req, res) {
  axios.get("http://www.bloomberg.com/").then(function (response) {
    var $ = cheerio.load(response.data);

    $("article h3").each(function (i, element) {
      var result = {};
      result.title = $(this)
        .children("a")
        .text();
      result.link = "https://www.bloomberg.com" + $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .next()
        .text();

      var titleSliced = result.title.slice(17);
      var titleSlicedAndTrimmed = titleSliced.trim();  
      result.title = titleSlicedAndTrimmed;
      // check to see if scraped summary has any content in it. 
      var str = result.summary;
      var str_esc = escape(str);
      var subStrEsc = str_esc.substr(0,69);
      
      const summaryPretext = "%0A%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%0A";
      if (subStrEsc === summaryPretext) {
        result.summary = "Article summary was not found."
      } 
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
      })
        .catch(function (err) {
          return res.json(err);
        });
    });
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("Note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for getting the Note from the db
app.get("/note/:id", function (req, res) {
 
  db.Note.findOne({ _id: req.params.id })
    .then(function (dbNote) {
      res.json(dbNote);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for updating a Comment.
app.put("/note/:id", function (req, res) {
  db.Note.findOneAndUpdate({ _id: req.params.id }, { body: req.body.body }, { new: true })
    .then(function (dbNoteData) {
      console.log("dbNoteData is " + dbNoteData);
      res.json(dbNoteData);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for deleting a Comment.
app.post("/note/:id", function (req, res) {
  db.Note.deleteOne({ _id: req.params.id })
    .then(function (dbNoteData) {
      return db.Article.findOneAndUpdate({ _id: req.body.articleId }, { note: null }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      res.json(dbNote);
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
