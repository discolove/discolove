import { htmlHelper } from 'discolove-common/lib/helpers';

export default htmlHelper((key, params) => I18n.t(key, params.hash));
