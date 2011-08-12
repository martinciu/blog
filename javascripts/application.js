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

  			$("<img/>").attr("src", item.badge)
  			.attr("float", "left")
  			.attr("title", item.name + ": " + item.description)
  			.attr("alt", item.name)
  			.attr("height", 75)
  			.attr("width", 75)
  			.appendTo("#coderwall")
  			.hover(
  				function(){  
  					$(this).css("opacity","0.6");
  				},
  				function(){
  					$(this).css("opacity","1.0");
  				}
  			)
  			.click(
  				function(){
  					window.location = "http://www.coderwall.com/martinciu/";
  				}
  			);		
  		});
  	});
});