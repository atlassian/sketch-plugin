/**
 * @file Functions for synchronising the GUI Pack.
 */

import Async from 'sketch/async';
import UI from 'sketch/ui';
import syncLibraries, { forceSyncLibraries } from './syncLibraries';
import syncTemplates, { forceSyncTemplates } from './syncTemplates';
import event, { CATEGORY_OPEN, LABEL_GUI_PACK } from '../../util/analytics/analytics';
import manifest from '../../util/manifest';

/**
 * Get the URL of the GUI Pack index.
 *
 * @param {object} context - Sketch context.
 * @returns {string} - URL to the library index.
 */
const getLibraryIndexUrl = context => `${manifest(context).urlBase}/gui-pack/index.json`;

/**
 * Fetch an index of remote libraries and templates, and add each one to Sketch automatically.
 *
 * @param {object} context - Sketch context.
 */
const syncGuiPack = async context => {
  const fiber = Async.createFiber();
  try {
    const { libraries, templates } = await (await fetch(getLibraryIndexUrl(context))).json();
    await Promise.all([syncLibraries(libraries), syncTemplates(templates)]);
  } catch (error) {
    if (error.code() !== -1009 && error.code() !== -1003) {
      // -1009: Internet connection is offline
      // -1003: Can't reach URL

      UI.message(
        "⛔️ ADG Sketch Plugin can't sync the GUI pack! Make sure you're on the Atlassian network and try restarting. ⛔️",
      );
    }
  } finally {
    fiber.cleanup();
  }
};

/**
 * Forcibly sync the GUI Pack by removing it and re-adding it.
 *
 * @param {object} context - Sketch context.
 */
export const forceSyncGuiPack = async context => {
  event(context, CATEGORY_OPEN, 'Force Synchronise GUI Pack', LABEL_GUI_PACK);
  const fiber = Async.createFiber();
  try {
    const { libraries, templates } = await (await fetch(getLibraryIndexUrl(context))).json();
    await Promise.all([forceSyncLibraries(libraries), forceSyncTemplates(templates)]);
  } finally {
    fiber.cleanup();
  }
};

/**
 * Sync the GUI Pack with a plug for analytics.
 *
 * @param {object} context - Sketch context.
 */
export const syncGuiPackWithAnalytics = async context => {
  event(context, CATEGORY_OPEN, 'Synchronise GUI Pack', LABEL_GUI_PACK);
  await syncGuiPack(context);
};

export default syncGuiPack;
