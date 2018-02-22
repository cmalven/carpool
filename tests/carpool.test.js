var Carpool = require('../dist/carpool.js')

var getHtml = function(title, content) {
  return '<!doctype html><html lang=en><head><meta charset=utf-8><title>' + title + '</title></head><body><div class="js-content"><p>' + content + '</p></div></body></html>';
}

beforeEach(function() {
  carpool = new Carpool({
    origin: 'http://foo.com',
    fetch: function(url) {
      return new Promise(function(resolve, reject) {
        resolve({
          text: function() { return getHtml('New Title', 'new content') }
        });
      });
    }
  });
});

test('add to cache', () => {
  var path = '/foo';
  var pageTitle = 'foo title';
  var pageContent = 'foo content';
  document.body.innerHTML = getHtml(pageTitle, pageContent);
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
  var newTitle = 'New Title';
  var newContent = 'new content';
  document.body.innerHTML = getHtml('Existing Title', 'existing content');
  carpool.replaceHtml(getHtml(newTitle, newContent));
  var contentHtml = document.querySelectorAll('.js-content');

  // Replaces the body
  expect(Array.from(contentHtml)).toHaveLength(1);
  expect(document.body.innerHTML).toMatch('new content');

  // Replaces the title
  var contentTitle = document.querySelectorAll('title')[0].textContent;
  expect(contentTitle).toBe(newTitle);
});