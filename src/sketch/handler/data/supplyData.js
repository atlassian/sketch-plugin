import sketch from 'sketch';
import util from '@skpm/util';
import event, { CATEGORY_DATA, LABEL_PLUGIN } from '../../util/analytics/analytics';

const { DataSupplier } = sketch;

/**
 * Deregister the plugin's data suppliers.
 */
export const onShutdown = () => {
  DataSupplier.deregisterDataSuppliers();
};

/**
 * Fill a symbol's overrides with data.
 *
 * @param {object} symbolInstance - A Sketch symbol instance.
 * @param {object} linkedData - Data to fill into the symbol's overrides. It will have keys that
 *  correspond to override names, and data to fill into them (e.g. { name: "Michael Pemulis",
 *  image: "/.../peemster.jpg" }).
 */
const supplySymbolOverrides = (symbolInstance, linkedData) => {
  symbolInstance.overrides.forEach(override => {
    const { name: overrideName } = override.affectedLayer;

    Object.entries(linkedData)
      .filter(([key]) => key == overrideName.toLowerCase().replace(/\s+/g, ''))
      .forEach(([, value]) => {
        symbolInstance.setOverrideValue(override, String(value));
      });
  });
};

/**
 * Given a DataSupplier context, fill it with a list of data returned by the given function.
 * Additionally, if the context is a symbol, fill its fields with 'linked' data (such as avatars and
 * names for users).
 *
 * ! USE WITH CAUTION: This method can be slow if you pass a large list to it. Prefer the default
 * ! Single-shot export.
 *
 * @param {Function} getDataList - A function that returns a list of data objects that contains
 *  data that is logically linked together, like a user's name and avatar.
 * @param {object} context - A Sketch context from a DataSupplier.
 * @param {string} analyticsAction - The name of the action to emit, for analytics purposes.
 * @param {string=} primaryKey - The key to find the piece of data to be filled. If not supplied,
 *  assumes that the correct key is 'primary'.
 * @param {boolean=} shouldLink - Whether to fill other fields in the same symbol. If not provided,
 *  assumes false.
 */
export const supplyDataList = (
  getDataList,
  context,
  analyticsAction,
  primaryKey = 'primary',
  shouldLink = false,
) => {
  const dataKey = context.data.key;
  const items = util.toArray(context.data.items).map(sketch.fromNative);
  const data = getDataList(items.length);
  items.forEach(({ symbolInstance }, index) => {
    const linkedData = data[index % data.length];

    if (shouldLink && symbolInstance) {
      supplySymbolOverrides(symbolInstance, linkedData);
    } else {
      DataSupplier.supplyDataAtIndex(dataKey, linkedData[primaryKey], index);
    }
  });

  event(context, CATEGORY_DATA, analyticsAction, LABEL_PLUGIN, items.length);
};

/**
 * Given a DataSupplier context, fill it with data from the given function. Additionally, if the
 * context is a symbol, fill its fields with 'linked' data (such as avatars and names for users).
 *
 * Mathieu indicated [here](https://sketchplugins.com/d/1074-updating-text-and-image-concurrently-with-a-datasupplier-plugin/2)
 * that the API is likely to change when Sketch adds native support. Keep an eye out.
 *
 * @param {Function} getData - A function that returns an object on each call, that contains data
 *  that is logically linked together, like a user's name and avatar.
 * @param {object} context - A Sketch context from a DataSupplier.
 * @param {string} analyticsAction - The name of the action to emit, for analytics purposes.
 * @param {string=} primaryKey - The key to find the piece of data to be filled. If not supplied,
 *  assumes that the correct key is 'primary'.
 * @param {boolean=} shouldLink - Whether to fill other fields in the same symbol. If not provided,
 *  assumes false.
 */
export default (getData, context, analyticsAction, primaryKey = 'primary', shouldLink = false) => {
  const dataKey = context.data.key;
  const items = util.toArray(context.data.items).map(sketch.fromNative);
  items.forEach(({ symbolInstance }, index) => {
    const linkedData = getData(index);

    if (shouldLink && symbolInstance) {
      supplySymbolOverrides(symbolInstance, linkedData);
    } else {
      DataSupplier.supplyDataAtIndex(dataKey, linkedData[primaryKey], index);
    }
  });

  event(context, CATEGORY_DATA, analyticsAction, LABEL_PLUGIN, items.length);
};
