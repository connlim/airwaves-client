//var SOCKET_HOST = "192.168.99.100";
var SOCKET_HOST = "172.22.152.16";
var SOCKET_PORT = "10202";

var timediff = 0;
var audio = new Audio('test.flac');

var options = {
  hostname: SOCKET_HOST,
  port: SOCKET_PORT
};
var socket = socketCluster.connect(options);
socket.on('connect', function(){
  socket.emit('timeping', (new Date()).getTime());
});

socket.on('timepong', function(starttime){
  timediff = ((new Date()).getTime() - starttime) / 2;
  console.log(timediff);
});

$('#test-play').click(function(event){
  socket.publish('play', timediff);
});

socket.subscribe('play').watch(function(time){
  // setTimeout(function(){
  //   audio.play();
  // }, 5000 - time - timediff);
  audio.play();
});

//Sort out autoplay issues on mobile
// $(document).ready(function(){
//   audio.play();
//   if(audio.paused){
//     var fix = function(){
//       audio.load();
//       window.removeEventListener('keydown', fix);
//       window.removeEventListener('mousedown', fix);
//       window.removeEventListener('touchstart', fix);
//       //setTimeout()
//     }
//     window.addEventListener('keydown', fix);
//     window.addEventListener('mousedown', fix);
//     window.addEventListener('touchstart', fix);
//   }else{
//     audio.pause()
//   }
// });
