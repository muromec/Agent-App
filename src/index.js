var app           = require('app');  // Module to control application life.
var fs = require('fs');
var ipc = require('ipc');
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var jk = require('jkurwa');
var keycoder = new jk.Keycoder(); // TODO: kill this please in jk

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

ipc.on('guess', function (event, arg) {
    fs.readFile(arg, function (err, data) {
        var p;
        try {
            p = keycoder.parse(data);
        } catch (e) {
            event.sender.send('rcert', {error: "Oops.."});
            return;
        }
        if (p.format === 'x509') {
            event.sender.send('rcert', {subject: p.subject});
        }
        if (p.format === 'IIT' || p.format === 'PBES2') {
            event.sender.send('store', {need: 'password', path: arg});
        }
    });
});
