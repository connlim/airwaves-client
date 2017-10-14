//var SOCKET_HOST = "192.168.99.100";
var SOCKET_HOST = "172.22.152.16";
var SOCKET_PORT = "10202";

var timediff = 0;
var sender = false;

var options = {
  hostname: SOCKET_HOST,
  port: SOCKET_PORT
};
var socket = socketCluster.connect(options);
socket.on('connect', function(){

});

socket.on('timeping', function(data){
  timediff = (new Date()).getTime() - data;
  console.log(timediff);
});

$('#test-play').click(function(event){
  // var audio = new Audio('test.flac');
  // audio.play();
  socket.publish('play', timediff);
  sender = true;
  setTimeout(function(){
    sender = false;
    var audio = new Audio('test.flac');
    audio.play();
  }, 5000)
});

socket.subscribe('play').watch(function(time){
  setTimeout(function(){
    if(!sender){
      var audio = new Audio('test.flac');
      audio.play();
    }

  }, 5000 - time - timediff);
});
