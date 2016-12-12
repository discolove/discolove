import { registerUnbound } from 'discolove-common/lib/helpers';

registerUnbound('i18n', (key, params) => I18n.t(key, params));
