$('#song_file').change(function(){
  var formData = new FormData();
  formData.append('file', $('#song_file')[0].files[0]);
  formData.append('groupid', $('#group-id').html());
  $.ajax({
    url : SYNC_URL + '/song',
    data : formData,
    processData: false,
    contentType: false,
    type : 'POST'
  }).done(function(res){
    Materialize.toast(res.responseText, 2500);
  }).fail(function(res){
    console.log(res);
    Materialize.toast(res.responseText, 2500);
  });
})
