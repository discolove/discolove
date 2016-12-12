import { buildResolver } from 'discolove-common/resolver';
import { default as computed, observes } from 'ember-addons/ember-computed-decorators';

const _pluginCallbacks = [];

const Discolove = Ember.Application.extend({
  rootElement: '#main',
  _docTitle: document.title,
  __TAGS_INCLUDED__: true,

  getURL(url) {
    if (!url) return url;

    // if it's a non relative URL, return it.
    if (url !== '/' && !/^\/[^\/]/.test(url)) return url;

    if (url.indexOf(Discolove.BaseUri) !== -1) return url;
    if (url[0] !== "/") url = "/" + url;

    return Discolove.BaseUri + url;
  },

  getURLWithCDN(url) {
    url = Discolove.getURL(url);
    // only relative urls
    if (Discolove.CDN && /^\/[^\/]/.test(url)) {
      url = Discolove.CDN + url;
    } else if (Discolove.S3CDN) {
      url = url.replace(Discolove.S3BaseUrl, Discolove.S3CDN);
    }
    return url;
  },

  Resolver: buildResolver('discolove'),

  @observes('_docTitle', 'hasFocus', 'notifyCount')
  _titleChanged() {
    let title = this.get('_docTitle') || Discolove.SiteSettings.title;

    // if we change this we can trigger changes on document.title
    // only set if changed.
    if ($('title').text() !== title) {
      $('title').text(title);
    }

    const notifyCount = this.get('notifyCount');
    if (notifyCount > 0 && !Discolove.User.currentProp('dynamic_favicon')) {
      title = `(${notifyCount}) ${title}`;
    }

    document.title = title;
  },

  @observes('notifyCount')
  faviconChanged() {
    if (Discolove.User.currentProp('dynamic_favicon')) {
      let url = Discolove.SiteSettings.favicon_url;
      if (/^http/.test(url)) {
        url = Discolove.getURL("/favicon/proxied?" + encodeURIComponent(url));
      }
      new window.Favcount(url).set(this.get('notifyCount'));
    }
  },

  // The classes of buttons to show on a post
  @computed
  postButtons() {
    return Discolove.SiteSettings.post_menu.split("|").map(function(i) {
      return i.replace(/\+/, '').capitalize();
    });
  },

  notifyTitle(count) {
    this.set('notifyCount', count);
  },

  notifyBackgroundCountIncrement() {
    if (!this.get('hasFocus')) {
      this.set('backgroundNotify', true);
      this.set('notifyCount', (this.get('notifyCount') || 0) + 1);
    }
  },

  @observes('hasFocus')
  resetBackgroundNotifyCount() {
    if (this.get('hasFocus') && this.get('backgroundNotify')) {
      this.set('notifyCount', 0);
    }
    this.set('backgroundNotify', false);
  },

  authenticationComplete(options) {
    // TODO, how to dispatch this to the controller without the container?
    const loginController = Discolove.__container__.lookup('controller:login');
    return loginController.authenticationComplete(options);
  },

  // Start up the Discolove application by running all the initializers we've defined.
  start() {

    $('noscript').remove();

    Object.keys(requirejs._eak_seen).forEach(function(key) {
      if (/\/pre\-initializers\//.test(key)) {
        const module = require(key, null, null, true);
        if (!module) { throw new Error(key + ' must export an initializer.'); }

        const init = module.default;
        const oldInitialize = init.initialize;
        init.initialize = function() {
          oldInitialize.call(this, Discolove.__container__, Discolove);
        };

        Discolove.initializer(init);
      }
    });

    Object.keys(requirejs._eak_seen).forEach(function(key) {
      if (/\/initializers\//.test(key)) {
        const module = require(key, null, null, true);
        if (!module) { throw new Error(key + ' must export an initializer.'); }

        const init = module.default;
        const oldInitialize = init.initialize;
        init.initialize = function() {
          oldInitialize.call(this, Discolove.__container__, Discolove);
        };

        Discolove.instanceInitializer(init);
      }
    });

  },

  @computed('currentAssetVersion', 'desiredAssetVersion')
  requiresRefresh(currentAssetVersion, desiredAssetVersion) {
    return desiredAssetVersion && currentAssetVersion !== desiredAssetVersion;
  },

  _registerPluginCode(version, code) {
    _pluginCallbacks.push({ version, code });
  },

  assetVersion: Ember.computed({
    get() {
      return this.get("currentAssetVersion");
    },
    set(key, val) {
      if(val) {
        if (this.get("currentAssetVersion")) {
          this.set("desiredAssetVersion", val);
        } else {
          this.set("currentAssetVersion", val);
        }
      }
      return this.get("currentAssetVersion");
    }
  })
}).create();

export default Discolove;
