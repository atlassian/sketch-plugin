/**
 * @file Track Sketch actions related to styles.
 */

import Dom from 'sketch/dom';
import Settings from 'sketch/settings';
import event, {
  CATEGORY_TYPOGRAPHY,
  CATEGORY_COLOR,
  CATEGORY_STYLE,
  LABEL_GUI_PACK,
} from '../../util/analytics/analytics';
import { LIBRARY_COLOR, LIBRARY_TYPOGRAPHY } from '../../util/library/libraryId';
import { SETTING_ADG_LIBRARY_IDS } from '../../util/settings';

const { Document } = Dom;

/**
 * Handle the application of shared layer styles.
 *
 * @param {object} context - Sketch context.
 */
export const onApplySharedLayerStyle = context => {
  const adgLibraryIds = Settings.settingForKey(SETTING_ADG_LIBRARY_IDS);
  const document = Document.getSelectedDocument();
  const { layers } = document.selectedLayers;
  const [{ sharedStyleId }] = layers;
  const sharedStyle = document.getSharedLayerStyleWithID(sharedStyleId);
  const libraryId = sharedStyle.getLibrary().id;

  if (adgLibraryIds.includes(libraryId)) {
    if (libraryId == LIBRARY_COLOR) {
      event(
        context,
        CATEGORY_COLOR,
        sharedStyle.name.split(' / ')[-1],
        LABEL_GUI_PACK,
        layers.length,
      );
    } else {
      event(context, CATEGORY_STYLE, sharedStyle.name, LABEL_GUI_PACK, layers.length);
    }
  }
};

/**
 * Handle the application of shared text styles.
 *
 * @param {object} context - Sketch context.
 */
export const onApplySharedTextStyle = context => {
  const document = Document.getSelectedDocument();
  const { layers } = document.selectedLayers;
  const [{ sharedStyleId }] = layers;
  const sharedStyle = document.getSharedTextStyleWithID(sharedStyleId);

  if (sharedStyle.getLibrary().id == LIBRARY_TYPOGRAPHY) {
    event(context, CATEGORY_TYPOGRAPHY, sharedStyle.name, LABEL_GUI_PACK, layers.length);
  }
};
