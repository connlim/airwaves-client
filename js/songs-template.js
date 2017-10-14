$(document).ready( function () {
  // Grab the template script
  var theTemplateScript = $("#songs-template").html();

  // Compile the template
  var theTemplate = Handlebars.compile(theTemplateScript);

  // Define our data object
  var context={
    songs: [
      {title: "I Really Like You", artist: "Carly Rae Jepsen", album:"EMOTION", length:"3:25"},
      {title: "I Really Like You", artist: "Carly Rae Jepsen", album:"EMOTION", length:"3:25"},
      {title: "I Really Like You", artist: "Carly Rae Jepsen", album:"EMOTION", length:"3:25"}
    ]
  };

  // Pass our data to the template
  var theCompiledHtml = theTemplate(context);

  // Add the compiled html to the page
  $('.songs').html(theCompiledHtml);
});
