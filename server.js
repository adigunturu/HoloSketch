var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(process.env.PORT || 4000, function () {
    console.log('Node app is working!');
});