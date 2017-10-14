// var SOCKET_HOST = "192.168.99.100";
var SOCKET_HOST = "http://172.22.152.16";
var SOCKET_PORT = "10202";

var timediff = 0;
var sound = new Howl({
  src: ['audio/emotion.flac'],
  html5: false // Force HTML5 to false so that the audio can stream in (best for large files).
});

var options = {
  hostname: SOCKET_HOST,
  port: SOCKET_PORT
};

var socket = io(SOCKET_HOST + ':' + SOCKET_PORT);
socket.on('connect', function(){
  socket.emit('timeping', (new Date()).getTime());
});

socket.on('timepong', function(starttime){
  timediff = Math.floor(((new Date()).getTime() - starttime) / 2);
  console.log(timediff);
});

// $('#test-play').click(function(event){
//   socket.emit('play', {group : $('#group-id').html(), time : timediff});
// });

socket.on('play', function(time){
  console.log(1000 - time - timediff)
  setTimeout(function(){
    sound.play();
  }, 1000 - time - timediff);
});
