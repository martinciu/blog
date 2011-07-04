$(function() {
  $('.two-col').noisy({
      'intensity' : 1, 
      'size' : 200, 
      'opacity' : 0.08, 
      'fallback' : '', 
      'monochrome' : false
  }).css('background-color', '#eee');
  
  $(".post .content a").attr("target","_blank");
});