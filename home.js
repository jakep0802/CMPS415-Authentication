const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://testUser:myCMPS415mongoDB@cmps415.7vwmz8w.mongodb.net/?retryWrites=true&w=majority&appName=CMPS415';

const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const port = 3000;

var output = '';

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  myCookies = req.cookies;
  cookieCount = countCookies(myCookies);

  if(cookieCount == 0) {
    output = 'Not authenticated'
  } else {
    output = 'Authentication cookie exists: ' + JSON.stringify(myCookies);
  }

  res.send(output);
});

function countCookies(cookies) {
  let count = 0;
  for(key in cookies) {
    count++;
  }
  return count;
}

app.get('/set/cookie/:name', (req, res) => {
  res.cookie(req.params.name, 'Cookie', { maxAge: 20000 });
  output = 'Cookie set';
  res.send(output);
});

app.get('/api/registerUser/:username&:password', (req, res) => {
  const client = new MongoClient(uri);

  const account = {
    user_ID: req.params.username,
    password: req.params.password
  };

  async function run() {
    try {
      const database = client.db('CMPS415-Database');
      const collection = database.collection('Authentication-Assignment');

      await collection.insertOne(account);
      output = 'Account created!';
      res.send(output);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});

app.get('/api/loginUser/:username&:password', (req, res) => {
  const client = new MongoClient(uri);
  
  async function run() {
    try {
      const database = client.db('CMPS415-Database');
      const collection = database.collection('Authentication-Assignment');

      const query = {
        user_ID: req.params.username,
        password: req.params.password
      }

      const account = await collection.findOne(query);
      output = 'Account found: ' + account.user_ID;
      res.send(output);
    } finally {
      await client.close()
    }
  }
  run().catch(console.dir);
});

app.get('/api/insert/:key&:val', (req, res) => {
  console.log('Key: ' + req.params.key);
  console.log('Value: ' + req.params.val);

  const client = new MongoClient(uri);

  const testDoc = {
    name: 'Test',
    Description: 'This is a test.'
  };

  testDoc[req.params.key] = req.params.val;

  console.log('Inserting: ' + testDoc);

  async function run() {
    try {
      const database = client.db('CMPS415-Database');
      const parts = database.collection('Authentication-Assignment');

      const execute = await parts.insertOne(testDoc);
      console.log(execute);
      res.send('Entered data: ' + JSON.stringify(testDoc));
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});

app.listen(port);
console.log('Server started at http://localhost:' + port);