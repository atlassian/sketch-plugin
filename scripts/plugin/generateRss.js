#!/usr/bin/env node
const {
  promises: { readFile, writeFile },
} = require('fs');
const { join } = require('path');
const xml2js = require('xml2js');
const argv = require('minimist')(process.argv.slice(2));

/**
 * Creates a JSON object that represents some XML. This will then be built and turned into a file,
 * for whenever a new release of the plugin occurs.
 *
 * The RSS metadata (XML namespaces etc) is the bare minimum required for Sketch to read the file.
 *
 * @param {string} name - Readable name of the library.
 * @param {string} description - Description of the plugin.
 * @param {string} url - URL where the plugin can be downloaded.
 * @param {string} version - The current version of the plugin.
 * @returns {object} - A JSON object representing an RSS feed in xml2js format.
 */
const rssTemplate = (name, description, url, version) => ({
  rss: {
    $: {
      version: '2.0',
      'xmlns:sparkle': 'http://www.andymatuschak.org/xml-namespaces/sparkle',
      'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    },
    channel: {
      title: name,
      description,
      item: [
        {
          enclosure: [
            {
              $: {
                url,
                'sparkle:version': version,
              },
            },
          ],
        },
      ],
    },
  },
});

/**
 * Return the manifest.json used to build the plugin in parsed form.
 *
 * @param {string} manifestPath - Path to the manifest.json file.
 * @returns {object} - The parsed manifest.
 */
const getManifest = async manifestPath => JSON.parse(await readFile(manifestPath));

/**
 * Generate and save the appcast RSS file.
 */
const generateRssFile = async () => {
  const manifestPath = argv.manifestPath || join('src', 'sketch', 'manifest.json');
  const { name, description, urlBase, version } = await getManifest(manifestPath);
  const pluginUrl = `${urlBase}/plugin/plugin.zip`;
  const rssXml = new xml2js.Builder().buildObject(
    rssTemplate(name, description, pluginUrl, version),
  );
  await writeFile('appcast.xml', rssXml);
};

generateRssFile();
