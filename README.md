## Carpool

Tools for asynchronously updating your current HTML with HTML from another URL.

---


## Why use Carpool?

Let’s say you are building a website and you want to nicely transition between pages of that site without ever actually reloading a page, instead loading the HTML for each new page asynchronously and replacing the HTML of the existing page with the new page.

There are plenty of libraries that will handle _all_ of this for you – preventing default link behavior, updating your browser history, fetching the contents of the new page, replacing the contents of the current page, animating between pages, etc – but sometimes you don't want a library that handles _all_ of these things.

**Carpool specifically handles the loading and replacing of new HTML in the above scenario.**

If you plan to build a single-page site, you can use Carpool to fetch and update the HTML, but you'll need something else to handle routing and transitions. I personally prefer [roadtrip](https://github.com/Rich-Harris/roadtrip) for handling routing and [gsap](https://greensock.com/gsap) for handling animated transitions.


## Installing Carpool

```
yarn add carpool

or 

npm install carpool --save
```

## Using Carpool

Here's a simple, but fairly complete example of building a single page site with Carpool and [roadtrip](https://github.com/Rich-Harris/roadtrip)

```js
import Carpool from 'carpool';
import roadtrip from 'roadtrip';
import TimelineLite from 'gsap/TimelineLite';

window.APP = window.APP || {};

//
//   Carpool
//
//////////////////////////////////////////////////////////////////////

// `contentSelector` is the DOM selector for the element that will be
// replaced with new content. An element with this selector should
// exist on every page you want to load.

APP.carpool = new Carpool({
  contentSelector: '.js-content'
});

//
//   Routing
//
//////////////////////////////////////////////////////////////////////

let indexRoute = {
    beforeenter: function(route) {
      // Use Carpool to fetch the new HTML content associated with the
      // route and returns a Promise that we can use to identify
      // when the new HTML is ready to use
      route.data = APP.carpool.getRouteData(route);
    },

    enter: function(route, previousRoute) {
      // When the new HTML is ready, use Carpool to replace the existing
      // HTML with the new HTML
      route.data.then(function(response) {
        if (!route.isInitial) {
          APP.carpool.replaceHtml(response);
        }

        // Transition to this route. You can also create unique
        // transition depending on which route we're coming from
        // by using the `previousRoute` param. 

        new TimelineLite()
          .to('.heading', 1, {
            alpha: 1
          })
          .to('.text', 1, {
            alpha: 1
          });
      });
    },

    leave: function(route, nextRoute) {
      // Transition out of this route. When leaving the route
      // we need to use a Promise so we know when the out
      // animation has successfully finished. Only after the
      // promise is resolved will we transition in the new route

      return new Promise(function(resolve, reject) {
        new TimelineLite()
          .to('.heading', 1, {
            alpha: 0
          })
          .to('.text', 1, {
            alpha: 0
          })
          .eventCallback('onComplete', resolve);
      });
    }
}

let aboutRoute = {
    // Similar to indexRoute but with unique transitions
}

APP.router = roadtrip
  .add('/', indexRoute)
  .add('/about', aboutRoute);

APP.router.start();
```


## API

### Carpool(options)

Creates a new Carpool instance.

```js
let carpool = new Carpool({
    contentSelector: '.js-content' // The selector for HTML element to load/replace
});
```

### carpool.load(url)

If the url hasn't been previously loaded, this will fetch the HTML contents of the page at the given URL. If the page has been previously loaded, it will return the cached contents of that page. In either case, `.load()` will return a Promise that resolves with the page's HTML.

```js
carpool.load('http://mysite.com/about').then(function(html) {
    // Do something with `html`
});
```

### carpool.cache(url)

Immediately add the HTML for the current page to carpool's cache, using the passed `url` as a key. This can be useful for caching the contents of the initial page visit so it won't need to be fetched in the future.

```js
carpool.addToCache('http://mysite.com/about');
```

### carpool.replaceHtml(html)

Finds the element in the current document that matches the `contentSelector` selector, and replaces it with the passed `html`. This will also automatically update certain elements in the head of the document, such as `<title>`.

```js
carpool.replaceHtml('<!doctype html>…');
```

### carpool.getCache()

Returns the contents of carpool's cache, an object with keys equal to URLs and values equal to the HTML content for that URL.

```js
carpool.getCache();
```

### carpool.getRouteData(route)

**Specifically intended to be used with [roadtrip](https://github.com/Rich-Harris/roadtrip)**. This is a helper function for easy integration with roadtrip. Takes a roadtrip `route` parameter and automatically fetches the HTML content for that route and returns a Promise that resolves with that HTML content when ready. See the [Using Carpool](#using-carpool) example earlier in these docs for its usage.


## Browser Support

Carpool requires `window.fetch` and `window.Promise` which are available in most new browsers. I recommend you use the following polyfills if you need to support older browsers:

- [fetch](https://github.com/github/fetch)
- [promise-polyfill](https://github.com/taylorhakes/promise-polyfill)