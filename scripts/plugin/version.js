#!/usr/bin/env node
const {
  promises: { readFile, writeFile, access },
} = require('fs');
const path = require('path');
const prettier = require('prettier');

const ECOSYSTEM_MANIFEST_PATH = path.join('src', 'sketch', 'manifest.json');
const INTERNAL_MANIFEST_PATH = path.join('..', 'sketch-plugin-internal', 'manifest.json');

/**
 * Pull in the latest version number from package.json.
 *
 * @returns {string} - Version string.
 */
const getVersion = async () => JSON.parse(await readFile('package.json')).version;

/**
 * Edit the the given manifest with the latest version.
 *
 * @param {string} manifestPath - Path to the manifest.json to update.
 * @param {string} version - Version string.
 */
const updateManifest = async (manifestPath, version) => {
  const manifest = JSON.parse(await readFile(manifestPath));
  const updatedManifest = { ...manifest, version };
  const updatedManifestString = JSON.stringify(updatedManifest);
  await writeFile(manifestPath, prettier.format(updatedManifestString, { parser: 'json' }));
};

(async () => {
  const version = await getVersion();
  await updateManifest(ECOSYSTEM_MANIFEST_PATH, version);

  // Only proceed if internal manifest is present

  try {
    await access(INTERNAL_MANIFEST_PATH);
    await updateManifest(INTERNAL_MANIFEST_PATH, version);
    console.log('Internal manifest updated — please commit and push before releasing!');
  } catch (err) {
    console.error(`Internal manifest wasn't found at ${INTERNAL_MANIFEST_PATH}, skipping...`);
  }
})();
