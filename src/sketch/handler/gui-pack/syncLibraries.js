/**
 * @file Functions for synchronising GUI Pack libraries.
 */

import Settings from 'sketch/settings';
import Dom from 'sketch/dom';
import { promisify, toArray } from '@skpm/util';
import { SETTING_ADG_LIBRARY_IDS } from '../../util/settings';

const { Library } = Dom;

const getRemoteLibraryWithRSS = promisify(Library.getRemoteLibraryWithRSS);

const GIT_LIBRARY_LOCATION =
  '/Library/Application%20Support/com.bohemiancoding.sketch3/dst-libs/dst-gui-pack/libraries';

/**
 * Add libraries from a list of URLs, and return them.
 *
 * @param {Array} libraryUrls - URLs to RSS feeds for the libraries to add.
 * @returns {Array} - Libraries that were added.
 */
const addLibrariesFromUrls = async libraryUrls =>
  Promise.all(libraryUrls.map(url => getRemoteLibraryWithRSS(url)));

/**
 * This is a noop--we use it because the native API for downloading library updates requires
 * handlers for progress and completion. We can't just pass in an arrow function, however, because
 * it needs to be globally scoped.
 *
 * The following command creates an NSBlock which can be passed into a native Sketch function as a
 * callback. The first parameter is the name of the function, the second is the number of arguments
 * it expects, and the third is a data object that you're apparently able to access from inside the
 * callback. We don't need these, so we abandon them.
 */
// eslint-disable-next-line no-unused-vars
const noop_ = () => {};
const noop = __command.callback_asBlockWithArguments_data_('noop_', 0, null);

/**
 * Update the ADG libraries automatically (Sketch currently does this manually).
 *
 * `librariesController` is an instance of `MSAssetLibraryController` from the API. You can see the
 * full list of methods on that object [in the Sketch headers dump](https://github.com/abynim/Sketch-Headers/blob/master/Headers/MSAssetLibraryController.h).
 * To actually use those, you can't just call
 * `.startDownloadingAssetLibrary(library, null, null, null)`. Instead, you have to make a really
 * long function by combining the names of each parameter with underscores, and finish it off with
 * another underscore.
 *
 * The second major thing you have to work with here is Objective-C blocks. In the native Sketch
 * code, the other three callbacks have type `CFUnknownBlockType`--in Objective-C, that means
 * they're 'blocks' of code that will be run as callbacks. Here, we have three. To use them, we have
 * to create blocks in JavaScript, which we can do using a really arcane Sketch API call. Above, we
 * define a global function called `noop`, and then use the `__command` object (an alias
 * for MSPluginCommand in the Sketch headers) to create a block from the callback.
 *
 * Beyond the Sketch headers dump, the following posts were useful for getting my head around what's
 * going on here:
 * - [Distributing and Updating Sketch Libraries](https://sketchplugins.com/d/796-distributing-and-updating-sketch-libraries/)
 * - [Expose MOGetBlockForJavaScriptFunction](https://github.com/logancollins/Mocha/issues/27).
 *
 * @param {Array} libraries - Libraries to update (in the new Sketch API form).
 */
const updateLibraries = async libraries => {
  const librariesController = AppController.sharedInstance().librariesController();
  const remoteLibraries = toArray(librariesController.remoteLibraries());
  remoteLibraries
    .filter(library => libraries.map(({ sketchObject }) => sketchObject).includes(library))
    .forEach(library => {
      if (library.updateAvailable()) {
        // eslint-disable-next-line max-len
        librariesController.startDownloadingAssetLibrary_progressHandler_downloadCompletionHandler_completionHandler_(
          library,
          noop,
          noop,
          noop,
        );
      }
    });
};

/**
 * Find the libraries that appear in adgLibraryIds, but not in newAdgLibraryIds. Remove them. The
 * end result is that the user only has the libraries in the new index.
 *
 * We also remove any libraries that match the ADG IDs that are local libraries. You should only
 * have one copy of the GUI Pack at once, and it should be the remote copy.
 *
 * @param {Array} adgLibraryIds - The current list of ADG library IDs.
 * @param {Array} newAdgLibraryIds - The new list of ADG library IDs.
 */
const removeOldLibraries = async (adgLibraryIds, newAdgLibraryIds) => {
  const allLibraries = Library.getLibraries();
  const removedLibraryIds = adgLibraryIds.filter(id => !newAdgLibraryIds.includes(id));
  allLibraries
    .filter(library => {
      const isInstalledThroughGit = String(library.sketchObject.locationOnDisk()).includes(
        GIT_LIBRARY_LOCATION,
      );
      const isRemovedFromGuiPack = removedLibraryIds.includes(library.id);
      return isInstalledThroughGit || isRemovedFromGuiPack;
    })
    .forEach(library => library.remove());
};

/**
 * Add the list of library RSS feeds to Sketch. Keep track of the ones we've added in the past, and
 * remove any that don't match.
 *
 * @param {Array} libraryUrls - List of RSS feed URLs for Sketch libraries.
 */
const syncLibraries = async libraryUrls => {
  const adgLibraryIds = Settings.settingForKey(SETTING_ADG_LIBRARY_IDS);
  const newAdgLibraries = await addLibrariesFromUrls(libraryUrls);
  const newAdgLibraryIds = newAdgLibraries.map(({ id }) => id);
  Settings.setSettingForKey(SETTING_ADG_LIBRARY_IDS, newAdgLibraryIds);
  await removeOldLibraries(adgLibraryIds, newAdgLibraryIds);
  await updateLibraries(newAdgLibraries);
};

/**
 * Removes all ADG libraries, and then re-adds them.
 *
 * @param {Array} libraryUrls - List of RSS feed URLs for Sketch libraries.
 */
export const forceSyncLibraries = async libraryUrls => {
  AppController.sharedInstance().checkForAssetLibraryUpdates();
  const adgLibraryIds = Settings.settingForKey(SETTING_ADG_LIBRARY_IDS);
  await removeOldLibraries(adgLibraryIds, []);
  const newAdgLibraries = await addLibrariesFromUrls(libraryUrls);
  const newAdgLibraryIds = newAdgLibraries.map(({ id }) => id);
  Settings.setSettingForKey(SETTING_ADG_LIBRARY_IDS, newAdgLibraryIds);
};

export default syncLibraries;
