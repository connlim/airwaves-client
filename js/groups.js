$('#join-group').submit(function(event){
  event.preventDefault();
  var groupid = $('#group-join-id').val();
  $('#group-join-id').val('');
  $.get(SYNC_URL + '/' + groupid + '/exists', function(data){
    if(data == '1'){
      //TODO: Get current song
      Materialize.toast("Group joined!", 2500);
      $('#group-id').html(groupid);
      socket.emit('joingroup', groupid);
      $.get(SYNC_URL + '/' + groupid + '/playlist', function(playlist){
        if(playlist){
          playlist.forEach(function(song){
            player.addSong(song);
          });
        }

      });
    }else{
      Materialize.toast("Group " + groupid + " does not exist!", 2500);
    }
  });
});

$('#group-create').click(function(event){
  $.post(SYNC_URL + '/group/genid', function(data){
    Materialize.toast("Group created!", 2500);
    $('#group-id').html(data.groupid);
    socket.emit('joingroup', data.groupid);
    Cookies.set('master', data.master);
  });
});
