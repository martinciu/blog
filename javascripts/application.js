$(function() {
  $('.two-col').noisy({
      'intensity' : 1, 
      'size' : 200, 
      'opacity' : 0.08, 
      'fallback' : '', 
      'monochrome' : false
  }).css('background-color', '#eee');
  
  $(".post .content a").attr("target","_blank");

  $.getJSON("http://www.coderwall.com/martinciu.json?callback=?", function(data) {
    $.each(data.data.badges, function(i, item) {
      $("#coderwall").append(
        $("<a />")
          .attr("href", "http://www.coderwall.com/martinciu/")
          .attr("target", "_blank")
          .append(
            $("<img/>").attr("src", item.badge)
              .attr("float", "left")
              .attr("title", item.name + ": " + item.description)
              .attr("alt", item.name)
              .attr("height", 75)
              .attr("width", 75)
              .hover(
                function(){  
                  $(this).css("opacity","0.6");
                },
                function(){
                  $(this).css("opacity","1.0");
                }
              )
          )
        );
      });
  });
  $("#tweets").tweet({
    username: "martinciu",
    join_text: "auto",
    avatar_size: 32,
    count: 10,
    auto_join_text_default: "we said,", 
    auto_join_text_ed: "we",
    auto_join_text_ing: "we were",
    auto_join_text_reply: "we replied to",
    auto_join_text_url: "we were checking out",
    loading_text: "loading tweets..."
  });
});