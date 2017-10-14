// Cache references to DOM elements.
var elms = ['playBtn', 'pauseBtn', 'nextBtn', 'prevBtn', 'timer', 'duration', 'seeker'];
elms.forEach(function(elm) {
  window[elm] = $('#' + elm);
});

var Player = function(song) {
  this.song = song;
  //this.index = 0;

  // TODO: Show the currently playing song

};
Player.prototype = {
  play: function() {
    var self = this;
    var sound;

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (self.song.howl) {
      sound = self.song.howl;
    } else {
      sound = self.song.howl = new Howl({
        src: ['audio/' + self.song.file],
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        onplay: function() {
          // Display the duration.
          duration.text(self.formatTime(Math.round(sound.duration())));

          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));

        },
        onend: function() {
          self.skip('right');
        },
        onpause: function() {

        },
        onstop: function() {

        }
      });
    }

    // Begin playing the sound.
    sound.play();

    // TODO: Update the currently playing track

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
    var sound = self.song.howl;

    // Puase the sound.
    sound.pause();

    // Show the play button.
    pauseBtn.hide();
    playBtn.show();
  },

  // /**
  //  * Skip to the next or previous track.
  //  * @param  {String} direction 'next' or 'prev'.
  //  */
  // skip: function(direction) {
  //   var self = this;
  //
  //   // Get the next track based on the direction of the track.
  //   var index = 0;
  //   if (direction === 'prev') {
  //     index = self.index - 1;
  //     if (index < 0) {
  //       index = self.playlist.length - 1;
  //     }
  //   } else {
  //     index = self.index + 1;
  //     if (index >= self.playlist.length) {
  //       index = 0;
  //     }
  //   }
  //
  //   self.skipTo(index);
  // },
  //
  // /**
  //  * Skip to a specific track based on its playlist index.
  //  * @param  {Number} index Index in the playlist.
  //  */
  // skipTo: function(index) {
  //   var self = this;
  //
  //   // Stop the current track.
  //   if (self.playlist[self.index].howl) {
  //     self.playlist[self.index].howl.stop();
  //   }
  //
  //   // Reset progress.
  //   progress.style.width = '0%';
  //
  //   // Play the new track.
  //   self.play(index);
  // },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} per Percentage through the song to skip.
   */
  seek: function(percentage) {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.song.howl;

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
    var sound = self.song.howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    timer.text(self.formatTime(Math.round(seek)));
    seeker.val((((seek / sound.duration()) * seeker.attr('max')) || 0).toString());

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  // /**
  //  * Toggle the playlist display on/off.
  //  */
  // togglePlaylist: function() {
  //   var self = this;
  //   var display = (playlist.style.display === 'block') ? 'none' : 'block';
  //
  //   setTimeout(function() {
  //     playlist.style.display = display;
  //   }, (display === 'block') ? 0 : 500);
  //   playlist.className = (display === 'block') ? 'fadein' : 'fadeout';
  // },

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
};

// Setup our new audio player class and pass it the playlist.
var player = new Player({
    title: 'Emotion',
    file: 'emotion.flac',
    howl: null
});

// Bind our player controls.
playBtn.click(function() {
  player.play();
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
