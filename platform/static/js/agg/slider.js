require(['jquery', 'reveal', 'head', 'marked'],
  function($, Reveal, head, marked) {
    Reveal.initialize({
      controls: true,
      progress: true,
      history: true,
      center: true,

      theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
      transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

      // Parallax scrolling
      // parallaxBackgroundImage: 'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg',
      // parallaxBackgroundSize: '2100px 900px',

      // Optional libraries used to extend on reveal.js
      dependencies: [{
        src: '/platform/static/js/common/reveal/classList.min.js',
        condition: function() {
          return !document.body.classList;
        }
      }, {
        src: '/platform/static/js/common/reveal/markdown.js',
        condition: function() {
          return !!document.querySelector('[data-markdown]');
        }
      }, {
        src: '/platform/static/js/common/reveal/highlight.min.js',
        async: true,
        callback: function() {
          hljs.initHighlightingOnLoad();
        }
      }, {
        src: '/platform/static/js/common/reveal/zoom.js',
        async: true,
        condition: function() {
          return !!document.body.classList;
        }
      }, {
        src: '/platform/static/js/common/reveal/notes.js',
        async: true,
        condition: function() {
          return !!document.body.classList;
        }
      }]
    });
    
    var elem = document.body
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  })
