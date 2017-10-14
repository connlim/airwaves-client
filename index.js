'use strict';
const electron = require('electron');
var fs = require('fs');
var mm = require('musicmetadata');
var Promise = require('promise');
var handlebars = require('handlebars');
const path = require('path');

const app = electron.app;
const {dialog} = require('electron');
// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

var music = new Array();
// Prevent window being garbage collected
let mainWindow;


function onClosed() {
    // Dereference the window
    // For multiple windows store them in an array
    mainWindow = null;
    fs.unlinkSync('temp-index.html');
}

function formatTime(secs) {
  var minutes = Math.floor(secs / 60) || 0;
  var seconds = parseInt((secs - minutes * 60) || 0);

  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}


function getMusicData() {
    const exts = ['.mp3'];
    var pathToMusic = dialog.showOpenDialog({properties: ['openDirectory']})[0];
    var promises = new Array();
    fs.readdir(pathToMusic, function(err, items) {
        for (var i = 0; i < items.length; i++) {
            var filePath = path.join(pathToMusic, items[i]);
            if (exts.includes(path.extname(items[i]))) {
                console.log(filePath);
                promises.push(readFileTags(filePath));
            }
        }
        Promise.all(promises).then(values => {
            console.log("yo");
            loadWindow();
        });
    });
}

function readFileTags(filePath) {
    return new Promise(function (resolve, reject){
        var readStream = fs.createReadStream(filePath);
        mm(readStream, { duration: true }, function (err, metadata) {
            if (err) resolve("meh");
            music.push({
                title: metadata.title,
                artist: metadata.artist[0],
                album: metadata.album,
                length: formatTime(metadata.duration),
                path: filePath
            });
            resolve("ok");
            readStream.close();
        });
    });
}

function loadWindow() {
    console.log(music);
    var data = {
        songs: music
    };

    fs.readFile('index.html', 'utf-8', function(error, source){
        var template = handlebars.compile(source);
        var html = template(data);
        fs.writeFileSync('temp-index.html', html);

        const win = new electron.BrowserWindow({
            width: 1200,
            height: 600,
            'accept-first-mouse': true,
            icon: path.join(__dirname, 'icons/icon64x64.png')
        });

        win.setMenu(null);
        win.loadURL(`file://${__dirname}/temp-index.html`);
        win.webContents.on('did-finish-load', () => {
            win.show();
            win.focus();
        });
        win.on('closed', onClosed);
    });


}


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
});

app.on('ready', () => {
    getMusicData();
});
