require(['jquery', 'bootstrap'], function($, bootstrap) {
  console.log($, 'test2');
  /*require(['jquery'], function ($) {
   $("#menu").on("click", function (ev) {
   var tar = ev.target,
   $tar = $(tar),
   $tarP = $tar.parent(),
   $tarpn = $tarP.siblings();
   $tarPnChild = $tarpn.find('.media'),
   isBok = $tarPnChild.css('display');
   if (tar.tagName && $tar.hasClass('panel-heading')) {
   var $tarN = $tar.next(),
   $childDiv = $tarN.children("div");
   if ($childDiv.length === 0) {
   alert('该组别没有任何文章')
   }
   $childDiv.stop().slideToggle(200, function () {
   if (isBok === "block") {
   $tarPnChild.css('display', 'none');
   }
   });
   }
   });
   });*/
});
