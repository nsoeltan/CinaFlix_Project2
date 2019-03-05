// Dependencies
var express = require("express");
var router = express.Router();
var request = require("request");

// Requiring our models for syncing
var db = require("../models");

// GET route calling the Sequelize method to find all movies.This route sends the data receievd to
//the handlebars index template file so that the data gets rendered to the UI
router.get("/", function(req, res) {
  db.Movie.findAll({
    order: "movie_name ASC"
  }).then(function(data) {
    var hbsObject = {
      movies: data
    };
    res.render("index", hbsObject);
  });
});

// POST route calling the Sequelize create method to search for the movie name by leveraging the OMDB API and rendering the movie's informtaion to the UI and the database
router.post("/api/new/movie", function(req, res) {
  var movieName = req.body.name;

  var queryUrl = "http://omdbapi.com/?apikey=40e9cece&t=" + movieName;

  request(queryUrl, function(error, response, body) {
    if (!error && JSON.parse(body).Response !== "False") {
      console.log(JSON.parse(body));

      var imdbId = JSON.parse(body).imdbID;

      console.log(imdbId);

      var videos = "";

      var options = {
        method: "GET",
        url: "https://api.themoviedb.org/3/movie/" + imdbId + "/videos",
        qs: {
          language: "en-US",
          api_key: "d50548305ff81a83c1c65efa4ce59583"
        },
        body: "{}"
      };

      request(options, function(error, response, result) {
        if (error) res.redirect("/");

        if (!JSON.parse(result).results) {
          res.redirect("/");
        } else {
          videos = JSON.parse(result).results[0].key;
          console.log(videos);
          db.Movie.create({
            movie_name: JSON.parse(body).Title,
            movie_poster: JSON.parse(body).Poster,
            movie_year: JSON.parse(body).Year,
            movie_time: JSON.parse(body).Runtime,
            movie_genre: JSON.parse(body).Genre,
            movie_actors: JSON.parse(body).Actors,
            movie_plot: JSON.parse(body).Plot,
            movie_trailer: videos,
            movie_ratingImdb: JSON.parse(body).Ratings[0].Value
          }).then(function() {
            res.redirect("/");
          });
        }
      });
    } else {
      console.log("Houston, something's wrong");
      res.redirect("/");
    }
  });
});

// Put route calling the Sequelize method to update the movie and add it to the watch list section in the UI
router.put("/api/new/watched/:id", function(req, res) {
  var watched = true;
  var ID = req.params.id;

  db.Movie.update(
    {
      watched: watched
    },
    { where: { id: ID } }
  ).then(function() {
    res.redirect("/");
  });
});

// Put route calling the Sequelize method to update the movie based on the id and remove it from the watched list in the UI
router.put("/:id", function(req, res) {
  var watched = false;
  var ID = req.params.id;

  db.Movie.update(
    {
      watched: watched
    },
    { where: { id: ID } }
  ).then(function() {
    res.redirect("/");
  });
});

// Delete route calling the Sequelize method to delete the movie from the data base and the watched list in the UI
router.delete("/api/new/delete/:id", function(req, res) {
  var ID = req.params.id;

  db.Movie.destroy({
    where: { id: ID }
  }).then(function() {
    res.redirect("/");
  });
});

// Export routes for server.js.
module.exports = router;
