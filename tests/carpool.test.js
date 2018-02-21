var Carpool = require('../dist/carpool.js')

var getHtml = function(content) {
  return '<!doctype html><html lang=en><head><meta charset=utf-8><title>Page Title</title></head><body><div class="js-content"><p>' + content + '</p></div></body></html>';
}

beforeEach(function() {
  carpool = new Carpool({
    origin: 'http://foo.com',
    fetch: function(url) {
      return new Promise(function(resolve, reject) {
        resolve({
          text: function() { return getHtml('new content') }
        });
      });
    }
  });
});

test('add to cache', () => {
  var path = '/foo';
  var pageContent = 'foo content';
  document.body.innerHTML = getHtml(pageContent);
  carpool.addToCache(path);
  expect(carpool.getCache()[path]).toMatch(pageContent);
});

test('loads content', () => {
  var expectedText = '<!doctype';
  return carpool.load('/foo').then(function(content) {
    expect(content).toMatch(expectedText);
    expect(carpool.getCache()['/foo']).toMatch(expectedText);
  });
});

test('replaces html', () => {
  var newContent = 'new content';
  document.body.innerHTML = getHtml('existing content');
  carpool.replaceHtml(getHtml(newContent));
  var contentHtml = document.querySelectorAll('.js-content');
  expect(Array.from(contentHtml)).toHaveLength(1);
  expect(document.body.innerHTML).toMatch('new content');
});