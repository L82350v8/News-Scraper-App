var saveId = "";
var savedArticleData ={};
var savedNoteData = {};

$.getJSON("/articles", function (data) {
  // present scraped articles to client 
  for (var i = 0; i < data.length; i++) {
    $("#articles").append("<h4 class=\"mt-4 mb-0\" data-id='" + data[i]._id + "'>" + data[i].title +
      "<button type=\"button\" class=\"btn note-btn btn-info float-right\" data-id='" + data[i]._id +
      "'>See Notes</button>");
    if (data[i].summary !== "Article summary was not found.") {
      $("#articles").append("<p class=\"mb-2\">" + data[i].summary);
    }
    $("#articles").append("<a href=" + data[i].link + " target=\"blank\">" + data[i].link + "</a>");
  }
});

$(document).on("click", ".note-btn", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the data-id from the button tag
  var thisId = $(this).attr("data-id");
  console.log("thisId is " + thisId);
  console.log("stmt after thisId  /////// "); 

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);

      if (data.note) {
        console.log("data.note is true");
        $.ajax({
          method: "GET",
          url: "/note/" + data.note
        })
          // With that done, add the note information to the page
          .then(function (noteData) {
            console.log("noteData.title is " + noteData.title);
            console.log("noteDat.body is " + noteData.body);
            $("#notes").append("<h4 class=\"text-align-left\">" + noteData.title + "</h4>");
            $("#notes").append("<p class=\"text-align-left\">" + noteData.body + "</p>");
            $("#modal-article-title").text(noteData.title);
            $("#note-textarea-input").val(noteData.body);
            $("#notes").append("<button type=\"button\" class=\"btn edit-note-btn btn-info mt-3\" data-id='" + thisId +
              "' + data-toggle=\"modal\" data-target=\"#note-modal\">Edit Note</button>");  
          });
      }
      else {
        savedArticleData = data;
        console.log("thisId is " + thisId);
        $("#notes").empty();
        $("#modal-article-title").text(savedArticleData.title);
        $("#notes").prepend("<button type=\"button\" class=\"btn create-note-btn btn-info mt-3\" data-id='" + thisId +
          "' + data-toggle=\"modal\" data-target=\"#note-modal\">Create Note</button>");
        saveId = thisId;
      }
    });
});

// When you click the savenote button
$(document).on("click", "#note-save-btn", function () {
  // Grab the id associated with the article from the submit button
  var thisId = saveId;
  console.log("#note-save-btn thisId is " + thisId);
  console.log("savedArticleData is " + savedArticleData.title);
  $("#note-title-input").text("savedArticleData.title");
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: savedArticleData.title,
      body: $("#note-textarea-input").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      savedNoteData = data;


      // Empty the notes section
      $("#note-modal").hide();
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
      $(".create-note-btn").remove();
      $("#notes").empty();
      $("#notes").append("<h4 class=\"text-align-left\">" + data.title + "</h4>");
      $("#notes").append("<p class=\"text-align-left\">" + data.body + "</p>");

    });



  $(document).on("click", ".edit-note-btn", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the data-id from the button tag
    var thisId = $(this).attr("data-id");
    console.log("thisId is " + thisId);
    $("#modal-article-title").text(savedNoteData.title);
    $("#note-textarea-input").val(savedNoteData.body);
  });

});
