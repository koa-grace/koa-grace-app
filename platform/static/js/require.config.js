requirejs.config({
  baseUrl: '/',
  shim: {
    'bootstrap': ['jquery'],
    'jsonEdit': ['jquery'],
  },
  map: {
    '*': {
      'common:': 'platform/static/js',
      'platform:': 'platform/static/js'
    }
  },
  paths: {
    'bootstrap': 'platform/static/js/common/bootstrap.min',
    'reveal': 'platform/static/js/common/reveal/reveal',
    'head': 'platform/static/js/common/reveal/head.min',
    'marked': 'platform/static/js/common/reveal/marked',
    'domReady': 'platform/static/js/lib/domReady',
    'jquery': 'platform/static/js/lib/jquery-2.1.3.min',
    'jsonEdit': 'platform/static/js/lib/jquery.jsonEdit',
    'zepto': 'platform/static/js/lib/zepto.min',
    'underscore': 'platform/static/js/lib/underscore-min',
    'simplemde': 'platform/static/js/lib/simplemde.min',
    'highlight': 'platform/static/js/lib/highlight.min',
    'webuploader': 'platform/static/js/lib/webuploader.min',
    'log': 'platform/static/js/lib/log.min'
  }
});
