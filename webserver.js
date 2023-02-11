
// Start config
require('dotenv').config(); 
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// Connect to your MongoDB database
//mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true });

// Define a schema and model for your MongoDB data
const mySchema = new mongoose.Schema({
  // Define your schema fields here
});

const MyModel = mongoose.model('MyModel', mySchema);

// Set up your Express.js routes
app.get('/', (req, res) => {
  res.render('index', { title: 'My Website' });
});

app.post('/search', (req, res) => {
  const searchTerm = req.body.search;

  // Use Mongoose to query your MongoDB database for data based on the search term
  MyModel.find({ field: searchTerm }, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error searching database');
    }

    res.render('results', { title: 'Search Results', results });
  });
});

// Set up your Express.js middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Set up your templating engine (EJS in this example)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

module.exports = app;
