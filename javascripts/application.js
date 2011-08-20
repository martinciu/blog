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
    auto_join_text_default: "I said,", 
    auto_join_text_ed: "I",
    auto_join_text_ing: "I was",
    auto_join_text_reply: "I replied to",
    auto_join_text_url: "I said,",
    loading_text: "loading tweets..."
  });
  if($("#projects")) {
    var featured_projects = {
      "fuubar-cucumber": {rubygems: true}, 
      "thumbs": {rubygems: true}, 
      "pickle-mongo_mapper": {rubygems: true}, 
      "pickle-mongoid": {rubygems: true}, 
      "state_machine-mongoid": {rubygems: true},
      "Rails-I18n.tmbundle": {rubygems: false, downloads: 0, rubygems_url: "https://rubygems.org/profiles/martinciu"}
    };

    var Projects = {
      github_url: function(name) {
        return "https://api.github.com/repos/martinciu/" + name;
      },
      rubygems_url: function(name) {
        return "https://rubygems.org/api/v1/gems/" + name + ".json";
      }
    }
    var urls = "";
    $.each(featured_projects, function(name, data) {
      urls = urls + "&urls[]=" + Projects.github_url(name)
      if(data['rubygems']) {
        urls = urls + "&urls[]=" + Projects.rubygems_url(name);
      }
    });
    $.getJSON("http://bulker.herokuapp.com/?a=1" + urls + "&callback=?", function(data) {
      $.each(data, function(url, response) {
        $.each(featured_projects, function (name, attributes) {
          if(url == Projects.github_url(name)) {
            featured_projects[name]["github_url"]  = response.body.html_url;
            featured_projects[name]["name"]        = response.body.name;
            featured_projects[name]["description"] = response.body.description;
            featured_projects[name]["watchers"]    = response.body.watchers;
            featured_projects[name]["forks"]       = response.body.forks;
          } else if(url == Projects.rubygems_url(name)) {
            featured_projects[name]["downloads"]    = response.body.downloads;
            featured_projects[name]["rubygems_url"] = response.body.project_uri;
          };
        });
      });
      var projectTemplate = $("#projectTemplate").template();
      $.each(featured_projects, function(name, attributes) {
        $.tmpl( projectTemplate, attributes ).appendTo( "#projects" );
      });
    });
  }
});