const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://testUser:myCMPS415mongoDB@cmps415.7vwmz8w.mongodb.net/?retryWrites=true&w=majority&appName=CMPS415';

const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

var output = '';

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
  myCookies = req.cookies;
  var authCookie = JSON.stringify(myCookies).search('"authenticated":"true"')

  if(authCookie != -1) {
    output = 'Hi! | You\'re login cookies: ' + JSON.stringify(myCookies);
    next();
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

app.post('/api/registerUser/', (req, res, next) => {
  const client = new MongoClient(uri);

  const account = {
    user_ID: req.body.reg_user,
    password: req.body.reg_pass
  };

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

app.post('/api/loginUser/', (req, res, next) => {
  const client = new MongoClient(uri);
  
  async function run() {
    try {
      const database = client.db('CMPS415-Database');
      const collection = database.collection('Authentication-Assignment');

      const query = {
        user_ID: req.body.login_user,
        password: req.body.login_pass
      }

      const account = await collection.findOne(query);

      if(account == null) {
        output = 'Unsuccessful login!';
        next();
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

app.get('/showAllCookies', (req, res, next) => {
  myCookies = req.cookies;
  output = 'Active cookies: ' + JSON.stringify(myCookies);
  next();
});

app.get('/clearCookies', (req, res, next) => {
  res.clearCookie('authenticated');
  res.clearCookie('username');
  output = 'Cleared all cookies!';
  next();
});

const footer = (req, res, next) => {
  output += '<hr>';
  output += '<a href="/">Home Page</a><br>';
  output += '<a href="/showAllCookies">View All Cookies</a><br>';
  output += '<a href="/clearCookies">Clear All Cookies</a><br>';
  res.send(output);
};

app.use(footer);

app.listen(port);
console.log('Server started at http://localhost:' + port);