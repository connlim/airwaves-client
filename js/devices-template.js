$(document).ready( function () {
  // Grab the template script
  var theTemplateScript = $("#devices-template").html();

  // Compile the template
  var theTemplate = Handlebars.compile(theTemplateScript);

  // Define our data object
  var context={
    devices: [
      {name: "First Android Device", id: "1"},
      {name: "Second Android Device", id: "2"},
      {name: "Third Android Device", id: "3"}
    ]
  };

  // Pass our data to the template
  var theCompiledHtml = theTemplate(context);

  // Add the compiled html to the page
  $('.devices').html(theCompiledHtml);
});
