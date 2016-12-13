import DiscoloveURL from 'discolove/lib/url';
import DiscoloveLocation from 'discolove/lib/discolove-location';

function inject() {
  const app = arguments[0],
        name = arguments[1],
        singletonName = Ember.String.underscore(name).replace(/_/g, '-') + ':main';

  Array.prototype.slice.call(arguments, 2).forEach(dest => app.inject(dest, name, singletonName));
}

function injectAll(app, name) {
  inject(app, name, 'controller', 'component', 'route', 'view', 'model', 'adapter');
}

export default {
  name: "inject-discolove-objects",

  initialize(container, app) {
    /*const appEvents = AppEvents.create();
    app.register('app-events:main', appEvents, { instantiate: false });
    injectAll(app, 'appEvents');
    DiscoloveURL.appEvents = appEvents;*/

    // app.register('store:main', Store);
    // inject(app, 'store', 'route', 'controller');

    /*const messageBus = window.MessageBus;
    app.register('message-bus:main', messageBus, { instantiate: false });
    injectAll(app, 'messageBus');

    const currentUser = Discolove.User.current();
    app.register('current-user:main', currentUser, { instantiate: false });

    const topicTrackingState = TopicTrackingState.create({ messageBus, currentUser });
    app.register('topic-tracking-state:main', topicTrackingState, { instantiate: false });
    injectAll(app, 'topicTrackingState');

    const site = Discolove.Site.current();
    app.register('site:main', site, { instantiate: false });
    injectAll(app, 'site');

    const siteSettings = Discolove.SiteSettings;
    app.register('site-settings:main', siteSettings, { instantiate: false });
    injectAll(app, 'siteSettings');

    app.register('search-service:main', SearchService);
    injectAll(app, 'searchService');

    const session = Session.current();
    app.register('session:main', session, { instantiate: false });
    injectAll(app, 'session');

    const screenTrack = new ScreenTrack(topicTrackingState, siteSettings, session, currentUser);
    app.register('screen-track:main', screenTrack, { instantiate: false });
    inject(app, 'screenTrack', 'component', 'route');

    if (currentUser) {
      inject(app, 'currentUser', 'component', 'route', 'controller');
    }*/

    app.register('location:discolove-location', DiscoloveLocation);

    /*const keyValueStore = new KeyValueStore("discolove_");
    app.register('key-value-store:main', keyValueStore, { instantiate: false });
    injectAll(app, 'keyValueStore');

    startTracking(topicTrackingState);*/
  }
};
