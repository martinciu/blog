/**
 * Created by martinciu on 21/11/14.
 */
$(function() {
    $("#xprojects").each(function() {
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
    });
});
