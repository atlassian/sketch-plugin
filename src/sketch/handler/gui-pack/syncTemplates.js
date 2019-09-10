/**
 * @file Functions for synchronising GUI Pack templates.
 */

import Settings from 'sketch/settings';
import { existsSync, unlinkSync, lstatSync, rmdirSync } from '@skpm/fs';
import { homedir } from '@skpm/os';
import downloadFile from '../../util/downloadFile';
import { SETTING_ADG_TEMPLATE_METADATA } from '../../util/settings';

const PATH_SKETCH_TEMPLATES = `${homedir()}/Library/Application Support/com.bohemiancoding.sketch3/Templates`;
const PATH_TEMPLATES = `${PATH_SKETCH_TEMPLATES}/💎 ADG`;

/**
 * Compare two arrays of template metadata to find out which ones need to be downloaded.
 *
 * The conditions for downloading a template are:
 * - We haven't seen this template before.
 *   - Check this by finding the difference between two the arrays.
 * - The template has been published since we last saw it.
 *   - Check this by comparing the publish dates on items with the same name.
 *
 * @param {Array} templates - Array of objects with the keys: "name" and "pubDate".
 * @param {Array} newTemplates - Array of objects with the keys: "name" and "pubDate".
 * @returns {Array} - Array of objects with the keys: "name" and "pubDate".
 */
const getTemplatesToDownload = (templates, newTemplates) =>
  newTemplates.filter(
    ({ name: newName, pubDate: newPubDate }) =>
      !templates.map(({ name }) => name).includes(newName) ||
      new Date(templates.find(({ name }) => name === newName).pubDate) < new Date(newPubDate),
  );

/**
 * Calculates new and updated templates, then downloads them to Sketch's templates folder.
 *
 * @param {Array} templates - Array of objects with the keys: "name" and "url".
 * @param {Array} newTemplates - Array of objects with the keys: "name" and "url".
 */
const addTemplates = async (templates, newTemplates) => {
  const templatesToDownload = getTemplatesToDownload(templates, newTemplates);
  await Promise.all(
    templatesToDownload.map(({ name, url }) => {
      if (existsSync(PATH_TEMPLATES) && !lstatSync(PATH_TEMPLATES).isDirectory()) {
        // if they have the old symbolic link, remove it

        unlinkSync(PATH_TEMPLATES);
      }
      return downloadFile(url, `${PATH_TEMPLATES}/${name}.sketch`);
    }),
  );
};

/**
 * Calculates the templates that were removed, then deletes them.
 *
 * @param {Array} templates - Array of objects with the key "name".
 * @param {Array} newTemplates - Array of objects with the key "name".
 */
const removeTemplates = async (templates, newTemplates) => {
  const removedTemplates = templates.filter(
    ({ name }) => !newTemplates.map(({ name: newName }) => newName).includes(name),
  );

  removedTemplates.forEach(({ name }) => {
    const path = `${PATH_TEMPLATES}/${name}.sketch`;
    try {
      unlinkSync(path);
    } catch (error) {
      if (error.code === 'EPERM') {
        // it's a directory (most likely), delete it

        rmdirSync(path);
      } else if (error.code !== 'ENOENT') {
        // the file exists but we couldn't remove it

        throw error;
      }
    }
  });
};

/**
 * Add the template index entries to Sketch. Keep track of the ones we've added in the past, and
 * remove any that don't match.
 *
 * @param {Array} newTemplates - Array of objects with the keys: "name", "url", "pubDate".
 */
const syncTemplates = async newTemplates => {
  const templates = Settings.settingForKey(SETTING_ADG_TEMPLATE_METADATA) || [];
  await Promise.all([
    addTemplates(templates, newTemplates),
    removeTemplates(templates, newTemplates),
  ]);
  Settings.setSettingForKey(SETTING_ADG_TEMPLATE_METADATA, newTemplates);
};

/**
 * Removes all ADG templates, and then re-adds them.
 *
 * @param {Array} newTemplates - Array of objects with the keys: "name", "url", "pubDate".
 */
export const forceSyncTemplates = async newTemplates => {
  const templates = Settings.settingForKey(SETTING_ADG_TEMPLATE_METADATA) || [];
  await removeTemplates(templates, []);
  await addTemplates([], newTemplates);
  Settings.setSettingForKey(SETTING_ADG_TEMPLATE_METADATA, newTemplates);
};

export default syncTemplates;
