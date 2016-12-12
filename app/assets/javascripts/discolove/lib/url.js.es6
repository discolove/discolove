import LockOn from 'discolove/lib/lock-on';

const rewrites = [];

// We can add links here that have server side responses but not client side.
const SERVER_SIDE_ONLY = [
  /\.rss$/,
  /\.json/,
];

let _jumpScheduled = false;
export function jumpToElement(elementId) {
  if (_jumpScheduled || Ember.isEmpty(elementId)) { return; }

  const selector = `#${elementId}, a[name=${elementId}]`;
  _jumpScheduled = true;
  Ember.run.schedule('afterRender', function() {
    const lockon = new LockOn(selector, {
      finished() {
        _jumpScheduled = false;
      }
    });
    lockon.lock();
  });
}

const DiscoloveURL = Ember.Object.extend({

  isJumpScheduled() {
    return _jumpScheduled;
  },

  // Browser aware replaceState. Will only be invoked if the browser supports it.
  replaceState(path) {
    if (window.history &&
        window.history.pushState &&
        window.history.replaceState &&
        !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/) &&
        (window.location.pathname !== path)) {

        // Always use replaceState in the next runloop to prevent weird routes changing
        // while URLs are loading. For example, while a topic loads it sets `currentPost`
        // which triggers a replaceState even though the topic hasn't fully loaded yet!
        Ember.run.next(() => {
          const location = DiscoloveURL.get('router.location');
          if (location && location.replaceURL) {
            location.replaceURL(path);
          }
        });
    }
  },

  routeToTag(a) {
    if (a && a.host !== document.location.host) {
      document.location = a.href;
      return false;
    }

    return this.routeTo(a.href);
  },

  /**
    Our custom routeTo method is used to intelligently overwrite default routing
    behavior.

    It contains the logic necessary to route within a topic using replaceState to
    keep the history intact.
  **/
  routeTo(path, opts) {
    opts = opts || {};

    if (Em.isEmpty(path)) { return; }

    if (Discolove.get('requiresRefresh')) {
      document.location.href = Discolove.getURL(path);
      return;
    }

    const serverSide = SERVER_SIDE_ONLY.some(r => {
      if (path.match(r)) {
        document.location = path;
        return true;
      }
    });

    if (serverSide) { return; }

    // Protocol relative URLs
    if (path.indexOf('//') === 0) {
      document.location = path;
      return;
    }

    // Scroll to the same page, different anchor
    const m = /^#(.+)$/.exec(path);
    if (m) {
      jumpToElement(m[1]);
      return this.replaceState(path);
    }

    const oldPath = window.location.pathname;
    path = path.replace(/(https?\:)?\/\/[^\/]+/, '');

    // handle prefixes
    if (path.match(/^\//)) {
      let rootURL = (Discolove.BaseUri === undefined ? "/" : Discolove.BaseUri);
      rootURL = rootURL.replace(/\/$/, '');
      path = path.replace(rootURL, '');
    }

    // Rewrite /my/* urls
    if (path.indexOf('/my/') === 0) {
      const currentUser = Discolove.User.current();
      if (currentUser) {
        path = path.replace('/my/', '/users/' + currentUser.get('username_lower') + "/");
      } else {
        document.location.href = "/404";
        return;
      }
    }

    rewrites.forEach(rw => path = path.replace(rw.regexp, rw.replacement));

    if (this.navigatedToPost(oldPath, path, opts)) { return; }

    if (oldPath === path) {
      // If navigating to the same path send an app event. Views can watch it
      // and tell their controllers to refresh
      this.appEvents.trigger('url:refresh');
    }

    // TODO: Extract into rules we can inject into the URL handler
    if (this.navigatedToHome(oldPath, path, opts)) { return; }

    return this.handleURL(path, opts);
  },

  rewrite(regexp, replacement) {
    rewrites.push({ regexp, replacement });
  },

  redirectTo(url) {
    window.location = Discolove.getURL(url);
  },

  /**
   * Determines whether a URL is internal or not
   *
   * @method isInternal
   * @param {String} url
  **/
  isInternal(url) {
    if (url && url.length) {
      if (url.indexOf('//') === 0) { url = "http:" + url; }
      if (url.indexOf('#') === 0) { return true; }
      if (url.indexOf('/') === 0) { return true; }
      if (url.indexOf(this.origin()) === 0) { return true; }
      if (url.replace(/^http/, 'https').indexOf(this.origin()) === 0) { return true; }
      if (url.replace(/^https/, 'http').indexOf(this.origin()) === 0) { return true; }
    }
    return false;
  },

  /**
    @private

    Handle the custom case of routing to the root path from itself.

    @param {String} oldPath the previous path we were on
    @param {String} path the path we're navigating to
  **/
  navigatedToHome(oldPath, path) {
    if (window.history &&
        window.history.pushState &&
        path === "/" &&
        oldPath === "/") {
      this.appEvents.trigger('url:refresh');
      return true;
    }

    return false;
  },

  // This has been extracted so it can be tested.
  origin() {
    return window.location.origin + (Discolove.BaseUri === "/" ? '' : Discolove.BaseUri);
  },

  /**
    @private

    Get a handle on the application's router. Note that currently it uses `__container__` which is not
    advised but there is no other way to access the router.

    @property router
  **/
  router: function() {
    return Discolove.__container__.lookup('router:main');
  }.property().volatile(),

  // Get a controller. Note that currently it uses `__container__` which is not
  // advised but there is no other way to access the router.
  controllerFor(name) {
    return Discolove.__container__.lookup('controller:' + name);
  },

  /**
    Be wary of looking up the router. In this case, we have links in our
    HTML, say form compiled markdown posts, that need to be routed.
  **/
  handleURL(path, opts) {
    opts = opts || {};

    const router = this.get('router');

    if (opts.replaceURL) {
      this.replaceState(path);
    } else {
      router.router.updateURL(path);
    }

    const split = path.split('#');
    let elementId;

    if (split.length === 2) {
      path = split[0];
      elementId = split[1];
    }

    const transition = router.handleURL(path);
    transition._discolove_intercepted = true;
    const promise = transition.promise || transition;
    promise.then(() => jumpToElement(elementId));
  }
}).create();

export default DiscoloveURL;
