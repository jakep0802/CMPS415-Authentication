const { MongoClient } = require('mongodb');

const uri = '';

const express = require('express');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const myQuery = req.query;
  var output = 'Starting...';
  res.send(output);
});
