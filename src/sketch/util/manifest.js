/**
 * @file Helpers for accessing the plugin's manifest.json.
 */

import fs from '@skpm/fs';

/**
 * Read and deserialize the manifest.json for this plugin.
 *
 * @param {object} context - Sketch context.
 * @returns {object} - Details from the manifest.json file.
 */
export default context => {
  const manifestPath = context.plugin
    .url()
    .URLByAppendingPathComponent('Contents')
    .URLByAppendingPathComponent('Sketch')
    .URLByAppendingPathComponent('manifest.json')
    .path();
  return JSON.parse(fs.readFileSync(manifestPath));
};
