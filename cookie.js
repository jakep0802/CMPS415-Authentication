var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('...');
})

app.get('/setcookie', (req, res) => {
    console.log('Setting cookie');
    res.cookie('Cookie1', 'ABC');
    res.cookie('Cookie2', 'XYZ', { maxAge: 20000 });

    res.send('Cookies have beent set');
});

app.get('/showcookie', (req, res) => {
    myCookies = req.cookies;
    res.send(myCookies);
});

var server = app.listen(3000, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at %s:%s', host, port);
});