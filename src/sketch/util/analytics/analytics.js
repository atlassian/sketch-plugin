/**
 * @file Builder and sender for analytics events.
 */

import manifest from '../manifest';

export const CATEGORY_COLOR = 'Color';
export const CATEGORY_DATA = 'Data';
export const CATEGORY_OPEN = 'Open';
export const CATEGORY_SYMBOL = 'Symbol';
export const CATEGORY_LIBRARY = 'Library';
export const CATEGORY_TYPOGRAPHY = 'Typography';
export const CATEGORY_STYLE = 'Style';
export const CATEGORY_SYMBOL_PALETTE = 'Symbol Palette';
export const CATEGORY_SYMBOL_PALETTE_EMPTY = 'Symbol Palette Empty Searches';
export const CATEGORY_UNLINK = 'Unlink Symbol';
const CATEGORY_MISC = 'Miscellaneous';

export const LABEL_GUI_PACK = 'GUI Pack';
export const LABEL_PLUGIN = 'Plugin';

// Generate a persistent UUID on module import

const kUUIDKey = 'google.analytics.uuid';
let uuid = NSUserDefaults.standardUserDefaults().objectForKey(kUUIDKey);
if (!uuid) {
  uuid = NSUUID.UUID().UUIDString();
  NSUserDefaults.standardUserDefaults().setObject_forKey(uuid, kUUIDKey);
}

/**
 * Convert a JSON object into a URL query string.
 *
 * @param {object} json - JSON object.
 * @returns {string} - URL query string.
 */
const jsonToQueryString = json =>
  `?${Object.keys(json)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`)
    .join('&')}`;

/**
 * Get Google Analytics tracking code from the manifest JSON.
 *
 * @param {object} context - Sketch context.
 * @returns {string} - GA tracking code.
 */
const getAnalyticsCode = context => manifest(context).analyticsCode;

/**
 * Send a tracking event.
 *
 * The event category _should_ be one of:
 * - `CATEGORY_COLOR`: The color picker was used to select a specific color. Will report ADG name.
 * - `CATEGORY_DATA`: A data generator was used. Will report the type of the data (menu name).
 * - `CATEGORY_OPEN`: An item was opened or loaded (the plugin, a panel, etc.).
 * - `CATEGORY_SYMBOL`: A symbol from a library starting with 'ADG' was inserted.
 * - `CATEGORY_LIBRARY`: A symbol was inserted from any library.
 * - `CATEGORY_TYPOGRAPHY`: A typography style was applied.
 * - `CATEGORY_STYLE`: A shared style was applied.
 * - `CATEGORY_SYMBOL_PALETTE`: A symbol was inserted using the palette.
 * - `CATEGORY_SYMBOL_PALETTE_EMPTY`: A search was made in the palette that turned up empty.
 * - `CATEGORY_UNLINK`: A symbol was unlinked from its library, or detached from its master.
 * If null, will default to `CATEGORY_MISC`.
 *
 * The event label distinguishes between actions provided by the GUI pack that we're tracking (i.e.
 * Symbols, text styles, colours), and things specifically provided by the plugin (color picker).
 * - `LABEL_GUI_PACK`: The event's trigger was provided by the GUI pack.
 * - `LABEL_PLUGIN`: The event's trigger was provided by the plugin.
 *
 * Refactor the analytics as necessary, but make sure you export and use the category constants.
 * The event action is required, and _should_ be unique.
 *
 * See the [Measurement Protocol Reference](https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters)
 * for details about the parameters supplied in the payload.
 *
 * @param {object} context - Sketch context.
 * @param {string} category - Event category.
 * @param {string} action - Event action.
 * @param {string=} label - Event label.
 * @param {number=} value - Event value.
 * @param {string=} sessionControl - Session control. Accepts 'start' or 'end'.
 */
const event = (context, category, action, label, value, sessionControl) => {
  if (process.env.NODE_ENV === 'production') {
    const payload = {
      v: 1,
      tid: getAnalyticsCode(context),
      ds: `Sketch ${NSBundle.mainBundle().objectForInfoDictionaryKey(
        'CFBundleShortVersionString',
      )}`,
      cid: uuid,
      t: 'event',
      an: context.plugin.name(),
      aid: context.plugin.identifier(),
      av: context.plugin.version(),
      ul: NSLocale.currentLocale().localeIdentifier(),
    };

    if (!action) {
      throw new Error('Event action was not provided');
    } else {
      payload.ec = category || CATEGORY_MISC;
      payload.ea = action;
    }
    if (label) payload.el = label;
    if (value) payload.ev = value;
    if (sessionControl) payload.sc = sessionControl;

    fetch(`https://www.google-analytics.com/collect${jsonToQueryString(payload)}`);
  }
};

export default event;
