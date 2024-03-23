// Use MongoDB
const { MongoClient } = require('mongodb');

// URI link for connection to database
const uri = 'mongodb+srv://testUser:myCMPS415mongoDB@cmps415.7vwmz8w.mongodb.net/?retryWrites=true&w=majority&appName=CMPS415';

// Items for use with browser
const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Output variable to show user
var output = '';

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default route
app.get('/', (req, res, next) => {
  // Get cookies
  myCookies = req.cookies;

  // Test if authentication cookie exists in string
  var authCookie = JSON.stringify(myCookies).search('"authenticated":"true"')

  // If cookie is found, show user
  if(authCookie != -1) {
    output = 'Hi! | You\'re login cookies: ' + JSON.stringify(myCookies);
    next();
  // If cookie is not found, present login/register page to user
  } else {
    fs.readFile('index.html', 'utf-8', (err, data) => {
      if(err) {
        output = err;
        console.log(err);
      }
      output = data + '<br>';
      next();
   });
  }
});

// User registration route
app.post('/api/registerUser/', (req, res, next) => {
  // Create connection to database
  const client = new MongoClient(uri);

  // Create account variable using data submitted from form
  const account = {
    user_ID: req.body.reg_user,
    password: req.body.reg_pass
  };

  // Add account to database
  async function run() {
    try {
      const database = client.db('CMPS415-Database');
      const collection = database.collection('Authentication-Assignment');

      await collection.insertOne(account);
      output = 'Account created!';
      next();
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});

// User login route
app.post('/api/loginUser/', (req, res, next) => {
  // Connect to database
  const client = new MongoClient(uri);
  
  // Query database
  async function run() {
    try {
      const database = client.db('CMPS415-Database');
      const collection = database.collection('Authentication-Assignment');

      // Create query variable using data submitted from form to search database
      const query = {
        user_ID: req.body.login_user,
        password: req.body.login_pass
      }

      // Search database for account
      const account = await collection.findOne(query);

      // If account not found, show user
      if(account == null) {
        output = 'Unsuccessful login!';
        next();
      // If account is found, present the user with a welcome message
      } else {
        res.cookie('authenticated', 'true', {maxAge: 60000});
        res.cookie('username', account.user_ID, { maxAge: 60000 });
        myCookies = req.cookies;
  
        output = 'Hi, ' + account.user_ID + '! You are now logged in :)';
        next();
      }
    } finally {
      await client.close()
    }
  }
  run().catch(console.dir);
});

// Show all cookies route
app.get('/showAllCookies', (req, res, next) => {
  // Get cookies and convert them to a string for output
  myCookies = req.cookies;
  output = 'Active cookies: ' + JSON.stringify(myCookies);
  next();
});

// Clear all cookies route
app.get('/clearCookies', (req, res, next) => {
  // Delete cookies created from logging in
  res.clearCookie('authenticated');
  res.clearCookie('username');

  // Let the user know cookies have been deleted
  output = 'Cleared all cookies!';
  next();
});

// Footer
// Used to present "Home Page", "View All Cookies", and "Clear All Cookies" to user on every page
const footer = (req, res, next) => {
  output += '<hr>';
  output += '<a href="/">Home Page</a><br>';
  output += '<a href="/showAllCookies">View All Cookies</a><br>';
  output += '<a href="/clearCookies">Clear All Cookies</a><br>';
  res.send(output);
};

// Present footer
app.use(footer);

// Start app
app.listen(port);
console.log('Server started at http://localhost:' + port);