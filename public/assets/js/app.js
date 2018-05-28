var saveId = "";
var savedArticleId = "";
var savedArticleData = {};
var savedNoteData = {};

$(document).on("click", "#scrape-btn", function () {
  $("#notes").empty();
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function (data) {

    $.getJSON("/articles", function (jsonData) {
      for (var i = 0; i < jsonData.length; i++) {
        $("#articles").append("<h4 class=\"mt-4 mb-0\" data-id='" + jsonData[i]._id + "'>" + jsonData[i].title +
          "<button type=\"button\" class=\"btn note-btn btn-info float-right\" data-id='" + jsonData[i]._id +
          "'>See Comments</button>");
        if (jsonData[i].summary !== "Article summary was not found.") {
          $("#articles").append("<p class=\"mb-2\">" + jsonData[i].summary);
        }
        $("#articles").append("<a href=" + jsonData[i].link + " target=\"blank\">" + jsonData[i].link + "</a>");
      }
    });
  });
});

$(document).on("click", ".note-btn", function () {
  $("#notes").empty();
  var thisId = $(this).attr("data-id");
  savedArticleId = thisId;

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).then(function (data) {

    if (data.note) {
      $.ajax({
        method: "GET",
        url: "/note/" + data.note
      }).then(function (noteData) {
        savedNoteData = noteData;
        $("#notes").append("<h4 class=\"text-align-left\">" + noteData.title + "</h4>");
        $("#notes").append("<p class=\"text-align-left\">" + noteData.body + "</p>");
        $("#edit-modal-article-title").text(noteData.title);
        $("#edit-note-textarea-input").val(noteData.body);
        $("#notes").append("<button type=\"button\" class=\"btn edit-note-btn btn-info\" data-id='" + noteData._id +
          "' + data-toggle=\"modal\" data-target=\"#edit-note-modal\">Edit Comments</button>");
        $("#notes").append("<button type=\"button\" class=\"btn delete-note-btn btn-info ml-3\" data-id='" + noteData._id +
          "'>Delete Comments</button>");
      });
    }
    else {
      savedArticleData = data;
      $("#notes").empty();
      $("#modal-article-title").text(savedArticleData.title);
      $("#notes").prepend("<button type=\"button\" class=\"btn create-note-btn btn-info mt-3\" data-id='" + thisId +
        "' + data-toggle=\"modal\" data-target=\"#note-modal\">Create Comment</button>");
      saveId = thisId;
    }
  });
});

$(document).on("click", "#note-save-btn", function () {
  var thisId = saveId;
  $("#note-title-input").text("savedArticleData.title");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: savedArticleData.title,
      body: $("#note-textarea-input").val()
    }
  }).then(function (data) {
    savedNoteData = data;
    $("#note-modal").modal("hide");
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $(".create-note-btn").remove();
    $("#notes").empty();
    $("#modal-article-title").text("");
    $("#note-textarea-input").val("");
    // show the newly posted note in the article notes section. 
    $("#notes").append("<h4 class=\"text-align-left\">" + data.title + "</h4>");
    $("#notes").append("<p class=\"text-align-left\">" + data.body + "</p>");
    $("#edit-modal-article-title").text(data.title);
    $("#edit-note-textarea-input").val(data.body);
    $("#notes").append("<button type=\"button\" class=\"btn edit-note-btn btn-info\" data-id='" + data._id +
      "' + data-toggle=\"modal\" data-target=\"#edit-note-modal\">Edit Comments</button>");
    $("#notes").append("<button type=\"button\" class=\"btn delete-note-btn btn-info ml-3\" data-id='" + data._id +
      "'>Delete Comments</button>");
  });
});

$(document).on("click", "#edit-note-save-btn", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  var thisId = savedNoteData._id;

  $.ajax({
    method: "PUT",
    url: "/note/" + thisId,
    data: {
      title: savedArticleData.title,
      body: $("#edit-note-textarea-input").val()
    }
  })
    .then(function (noteData) {
      savedNoteData = noteData;
      $("#edit-note-modal").modal("hide");
      $("body").removeClass("modal-open");
      $(".modal-backdrop").remove();
      $("#notes").empty();
      $("#notes").append("<h4 class=\"text-align-left\">" + noteData.title + "</h4>");
      $("#notes").append("<p class=\"text-align-left\">" + noteData.body + "</p>");
      $("#edit-modal-article-title").text(noteData.title);
      $("#edit-note-textarea-input").val(noteData.body);
      $("#notes").append("<button type=\"button\" class=\"btn edit-note-btn btn-info\" data-id='" + noteData._id +
        "' + data-toggle=\"modal\" data-target=\"#edit-note-modal\">Edit Comments</button>");
      $("#notes").append("<button type=\"button\" class=\"btn delete-note-btn btn-info ml-3\" data-id='" + noteData._id +
        "'>Delete Comments</button>");
    });
});

$(document).on("click", ".delete-note-btn", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/note/" + thisId,
    data: {
      articleId: savedArticleId
    }
  })
    .then(function (deletedNoteData) {
      $("#notes").empty();
      $("#modal-article-title").text("");
      $("#note-textarea-input").val("");
      $("#edit-modal-article-title").text("");
      $("#edit-note-textarea-input").val("");
    });
});

