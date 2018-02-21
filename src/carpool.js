var defaultsDeep = require('lodash.defaultsdeep');
var domify = require('domify');

module.exports = function(options) {
  //
  //   Private Vars
  //
  //////////////////////////////////////////////////////////////////////
 
  var self = {
    cache: {}
  };
 
 
  //
  //   Public Vars
  //
  //////////////////////////////////////////////////////////////////////
 
  self.settings = defaultsDeep(options, {
    contentSelector: '.js-content',
    fetch: window.fetch,
    origin: window.location.origin
  });
 
 
  //
  //   Private Methods
  //
  //////////////////////////////////////////////////////////////////////
 
  var _loadFromUrl = function(url) {
    return new Promise(function(resolve, reject) {
      self.settings.fetch(url)
        .then(function(response) {
          return response.text();
        })
        .then(function(body) {
          self.cache[url] = body;
          resolve(body);
        });
    });
  };

  var _loadContentFromCache = function(url) {
    return new Promise(function(resolve, reject) {
      resolve(self.cache[url]);
    });
  };
 
 
  //
  //   Public Methods
  //
  //////////////////////////////////////////////////////////////////////
  
  self.load = function(url) {
    if (typeof self.cache[url] !== 'undefined') {
      return _loadContentFromCache(url);
    } else {
      return _loadFromUrl(url);
    }
  };

  self.addToCache = function(url) {
    self.cache[url] = document.documentElement.innerHTML;
  };

  self.getRouteData = function(route) {
    var fullPath = [self.settings.origin, route.pathname].join('/');
    if (route.isInitial) {
      self.addToCache(fullPath);
      return new Promise(function(resolve, reject) { resolve(); });
    }
    return self.load(fullPath);
  };

  self.replaceHtml = function(html) {
    var newHtml = domify(html);
    var contentSelector = self.settings.contentSelector;
    var newContent = newHtml.querySelectorAll(contentSelector)[0];
    var newTitle = newHtml.querySelectorAll('title')[0].textContent;
    document.querySelectorAll('title')[0].textContent = newTitle;
    document.querySelectorAll(contentSelector)[0].outerHTML = newContent.outerHTML;
  };

  self.getCache = function() {
    return self.cache;
  };
 
 
  //
  //   Initialize
  //
  //////////////////////////////////////////////////////////////////////
 
  // Return the Object
  return self;
};