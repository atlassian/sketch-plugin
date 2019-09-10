/**
 * @file Registry of setting keys to be used with the 'sketch/settings' module.
 *
 * Please document settings with what they are used for, and their accepted/allowed values.
 */

/**
 * False by default. When the user decides they do not want to see the font install prompt again,
 * this is set to true, and the font install prompt will not be shown again.
 */

export const SETTING_SEEN_FONT_INSTALL_PROMPT = 'seen-font-install-prompt';

/**
 * Stores a list of library IDs that the plugin provides. This is set on document load, when the
 * libraries are refreshed and loaded into the plugin. It is used to determine whether a given
 * library was provided by the plugin.
 */

export const SETTING_ADG_LIBRARY_IDS = 'adg-library-ids';

/**
 * Stores an array of objects containing template metadata. Each object contains the keys "name",
 * "url" and "pubDate". This is set on document load, after pulling in the latest metadata from the
 * storage host. It is used to determine which templates are currently installed, and when they were
 * last updated on the GUI Pack server.
 */

export const SETTING_ADG_TEMPLATE_METADATA = 'adg-template-metadata';
