var elms = ['playBtn', 'pauseBtn', 'nextBtn', 'prevBtn', 'timer', 'duration', 'seeker', 'currentSong', 'currentArtist', 'currentAlbum'];
elms.forEach(function(elm) {
  window[elm] = $('#' + elm);
});

var allSongs = new Array();

$('.song').each(function() {
    var title = $(this).children('.song-title').text();
    var artist = $(this).children('.song-artist').text();
    var album = $(this).children('.song-album').text();
    var path = $(this).children('.song-path').text();
    var length = $(this).children('.song-length').text();
    var hash = $(this).children('.song-hash').text();
    var song = {
        title: title,
        artist: artist,
        album: album,
        path: path,
        length: length,
        hash: hash
    };
    allSongs.push(song);
});

var Player = function() {
  this.playlist = new Array();
  this.index = 0;
};
Player.prototype = {
  play: function() {
    var self = this;
    var sound;
    var currSong = self.playlist[self.index];
    $('.playlist').children().eq(self.index).addClass('blue white-text');

    if (currSong == undefined) {
        self.emptyPlaylist();
        return;
    }

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (currSong.howl) {
      sound = currSong.howl;
    } else {
      sound = currSong.howl = new Howl({
        src: [currSong.path],
        html5: false, // Force HTML5 false so that the audio can stream in (best for large files).
        onplay: function() {
          // Display the duration.
          duration.text(self.formatTime(Math.round(sound.duration())));
          currentSong.text(currSong.title);
          currentArtist.text(currSong.artist);
          currentAlbum.text(currSong.album);
          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));

        },
        onend: function() {
          // socket.emit()

          self.skip('right');
        },
        onpause: function() {

        }
      });
    }

    // Begin playing the sound.
    sound.play();

    // Show the pause button.
    // if (sound.state() === 'loaded') {
    playBtn.hide();
    pauseBtn.show();
    // } else {
    //     pauseBtn.hide();
    //     playBtn.show();
    // }

  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Puase the sound.
    sound.pause();

    // Show the play button.
    pauseBtn.hide();
    playBtn.show();
  },

  /**
   * Skip to the next or previous track.
   * @param  {String} direction 'next' or 'prev'.
   */
  skip: function(direction) {
    var self = this;

    $('.playlist').children().eq(self.index).removeClass('blue white-text');

    // Get the next track based on the direction of the track.
    var index = 0;
    if (direction === 'prev') {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    } else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }

    self.skipTo(index);
  },

  /**
   * Skip to a specific track based on its playlist index.
   * @param  {Number} index Index in the playlist.
   */
  skipTo: function(index) {
    var self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset progress.
    seeker.val(0);

    // Play the new track.
    self.index = index;
    self.play();
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} per Percentage through the song to skip.
   */
  seek: function(percentage) {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Convert the percent into a seek position.
    sound.seek(sound.duration() * percentage);
    seeker.val((percentage * seeker.attr('max')).toString())
    timer.text(self.formatTime(Math.round(sound.seek())));
  },

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  step: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    timer.text(self.formatTime(Math.round(seek)));
    seeker.val((((seek / sound.duration()) * seeker.attr('max')) || 0).toString());

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  addSong: function(song) {
      var self = this;

      self.playlist.push(song);
      self.updatePlaylist(song);
  },

  removeSong: function(index) {
      var self = this;

      // Stop the current track.
      if (self.playlist[index].howl) {
        self.playlist[index].howl.stop();
        self.skip('next');
      }
      self.playlist.splice(index, 1);

      console.log(self.playlist);
  },

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  },

  emptyPlaylist: function() {
    currentSong.text('-');
    currentArtist.text('-');
    currentAlbum.text('-');
  },

  updatePlaylist: function(song) {
      var template = '<tr class="playlist-song">\
          <td class="playlist-song-title">{{song.title}}</td>\
          <td class="playlist-song-artist">{{song.artist}}</td>\
          <td class="playlist-song-album">{{song.album}}</td>\
          <td class="playlist-song-length">{{song.length}}</td>\
          <td class="playlist-song-path">{{song.path}}</td>\
          <td class="playlist-song-hash">{{song.hash}}</td>\
      </tr>';
        var compiled = Handlebars.compile(template);
        var data = {song: song};
        var compiledhtml = compiled(data);
        $('.playlist').append(compiledhtml);
        $('.playlist').children().last().click(function(e) {
            console.log($(this).index());

            player.removeSong($(this).index());
            $(this).remove();
        });
  }
};

// Setup our new audio player class and pass it the playlist.
var player = new Player();

// Bind our player controls.
playBtn.click(function() {
  // player.play();
  socket.emit('play', {group : $('#group-id').html(), time : timediff});
});
pauseBtn.click(function() {
  player.pause();
});
prevBtn.click(function() {
  player.skip('prev');
});
nextBtn.click(function() {
  player.skip('next');
});
seeker.click(function(e) {
    var x = e.offsetX;
    var clickedValue = x / this.offsetWidth * 10000;
    console.log(clickedValue);
    player.seek(clickedValue / seeker.attr('max'));
});
$('.song').click(function(e) {
    var title = $(this).children('.song-title').text();
    var artist = $(this).children('.song-artist').text();
    var album = $(this).children('.song-album').text();
    var path = $(this).children('.song-path').text();
    var length = $(this).children('.song-length').text();
    var hash = $(this).children('.song-hash').text();
    var song = {
        title: title,
        artist: artist,
        album: album,
        path: path,
        length: length,
        hash: hash,
        howl: null
    };
    player.addSong(song);

    // data.group = $('#group-id').html();
    socket.emit('new_song', {group : $('#group-id').html(), song : song});
});
$('.playlist-song').click(function(e) {
    socket.emit('remove_song', {group : $('#group-id').html(), index : $(this).index()});
    player.removeSong($(this).index());
    $(this).remove();
});


// var SOCKET_HOST = "192.168.99.100";
var SOCKET_HOST = "http://172.22.152.16";
var SOCKET_PORT = "10202";

var timediff = 0;
// var sound = new Howl({
//   src: ['audio/emotion.flac'],
//   html5: false // Force HTML5 to false so that the audio can stream in (best for large files).
// });

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
  console.log(1000 - time - timediff);
  setTimeout(function(){
    player.play();
}, 1000 - time - timediff);
  // audio.play();
});

socket.on('new_song', function(song){
  player.addSong(song);
  //TODO: Song syncing
  var exists = false;
<<<<<<< HEAD
  allSongs.playlist.forEach(function(s){
=======
  allSongs.forEach(function(s){
>>>>>>> 5b5e6ec2d5a8534c46ecaad9693920a6fa81f949
    if(s.hash == song.hash){
      exists = true;
    }
  });
  if(!exists){
    //Download song
  }
});

socket.on('remove_song', function(index){
  player.removeSong(index);
});
