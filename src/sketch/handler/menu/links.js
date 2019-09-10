/**
 * @file This is a handler for the plugin menu in Sketch which opens URLs in a browser window.
 */

import event, { CATEGORY_OPEN } from '../../util/analytics/analytics';

const URL_ADG_SITE = 'https://www.atlassian.design/';
const URL_AK_SITE = 'https://atlaskit.atlassian.com/';
const URL_GITHUB_ISSUE = 'https://github.com/atlassian/sketch-plugin/issues/new';

/**
 * Opens a URL in a browser.
 *
 * @param {string} url - The URL to open.
 */
export const openURL = url => {
  const nsurl = NSURL.URLWithString(url);
  NSWorkspace.sharedWorkspace().openURL(nsurl);
};

/**
 * Open atlassian.design in the browser.
 *
 * @param {object} context - Sketch context.
 */
export const linkAtlassianDesignSite = context => {
  openURL(URL_ADG_SITE);
  event(context, CATEGORY_OPEN, URL_ADG_SITE);
};

/**
 * Open atlaskit.atlassian.com in the browser.
 *
 * @param {object} context - Sketch context.
 */
export const linkAtlaskitSite = context => {
  openURL(URL_AK_SITE);
  event(context, CATEGORY_OPEN, URL_AK_SITE);
};

/**
 * Open a new GitHub issue in the browser.
 *
 * @param {object} context - Sketch context.
 */
export const linkGitHubIssue = context => {
  openURL(URL_GITHUB_ISSUE);
  event(context, CATEGORY_OPEN, URL_GITHUB_ISSUE);
};
