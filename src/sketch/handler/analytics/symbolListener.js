/**
 * @file Track Sketch actions related to symbols.
 */

import Dom from 'sketch/dom';
import Settings from 'sketch/settings';
import event, {
  CATEGORY_SYMBOL,
  CATEGORY_UNLINK,
  LABEL_GUI_PACK,
  CATEGORY_LIBRARY,
} from '../../util/analytics/analytics';
import { SETTING_ADG_LIBRARY_IDS } from '../../util/settings';

const { Document } = Dom;

/**
 * Handle the 'lost focus' event.
 *
 * This is our shortcut to figuring out when a symbol has been inserted. We have to do this, because
 * there are a lot of different ways that a user might insert a symbol, and this is the only one
 * which triggers regardless.
 *
 * From here, we immediately grab the currently selected item, which 99.99% of the time will be the
 * symbol we just inserted. Then grab its master instance, find its library, check if it's one of
 * ours, and fire off the event.
 *
 * @param {object} context - Sketch context.
 */
export const onHandlerLostFocus = context => {
  if (context.actionContext.name == 'InsertSymbol') {
    const adgLibraryIds = Settings.settingForKey(SETTING_ADG_LIBRARY_IDS);
    const [{ master }] = Document.getSelectedDocument().selectedLayers.layers;
    const { name: libraryName, id: libraryId } = master.getLibrary();

    if (adgLibraryIds.includes(libraryId)) {
      event(context, CATEGORY_SYMBOL, `${libraryName} / ${master.name}`, LABEL_GUI_PACK);
    }

    event(context, CATEGORY_LIBRARY, libraryName);
  }
};

/**
 * Track the number of times users unlink each symbol.
 *
 * This gives us a good measure of which symbols aren't up to scratch --- if users feel the need to
 * customise symbols more than we offer, we should be offering more.
 *
 * Issue [#425](https://github.com/BohemianCoding/SketchAPI/issues/425) on the Sketch API repo
 * tracks a bug where clicking 'Unlink from Library' in the dialog that pops up when double-clicking
 * doesn't fire this event.
 *
 * @param {object} context - Sketch context.
 */
export const onUnlinkFromLibrary = context => {
  const adgLibraryIds = Settings.settingForKey(SETTING_ADG_LIBRARY_IDS);
  const [{ master }] = Document.getSelectedDocument().selectedLayers.layers;
  const { name: libraryName, id: libraryId } = master.getLibrary();

  if (adgLibraryIds.includes(libraryId)) {
    event(context, CATEGORY_UNLINK, `${libraryName} / ${master.name}`, LABEL_GUI_PACK);
  }
};

/**
 * Track the number of times users detach each symbol --- this is different from unlinking.
 * Unlinking merely copies the library's symbol into your document and keeps your symbol attached to
 * it. Detaching removes the reference to the base symbol, and is more common if the user wants to
 * edit their symbol.
 *
 * This gives us a good measure of which symbols aren't up to scratch --- if users feel the need to
 * customise symbols more than we offer, we should be offering more.
 *
 * @param {object} context - Sketch context.
 */
export const onConvertSymbolOrDetachInstances = context => {
  const adgLibraryIds = Settings.settingForKey(SETTING_ADG_LIBRARY_IDS);
  const [{ master }] = Document.getSelectedDocument().selectedLayers.layers;
  const library = master.getLibrary();

  if (library) {
    const { name: libraryName, id: libraryId } = library;

    if (adgLibraryIds.includes(libraryId)) {
      event(context, CATEGORY_UNLINK, `${libraryName} / ${master.name}`, LABEL_GUI_PACK);
    }
  }
};
