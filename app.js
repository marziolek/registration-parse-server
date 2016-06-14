// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express'),
    ParseServer = require('parse-server').ParseServer,
    path = require('path');

//var databaseUri = process.env.DATABASE_URI || "mongodb://localhost:27017/registrationApp";
var databaseUri = process.env.DATABASE_URI || 
    "mongodb://mo1238_jdz:JaroslawDownar-Zapolski123@mongo9.mydevil.net:27017/mo1238_jdz";

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/registrationApp',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '12345',
  javascriptKey: process.env.JAVASCRIPT_KEY || '12345',
  clientKey: process.env.CLIENT_KEY || '12345',
  masterKey: process.env.MASTER_KEY || '12345', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://marcin-ziolek.usermd.net/parse'
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Hey, parse server is up and running here! ;)');
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
  console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

// basic routing
// Define verified email url
app.get('/rejestracja/potwierdzenie-email', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/verify-email.html'));
});

// Define password reset url 
app.get('/rejestracja/reset-hasla', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/password-reset.html'));
});

