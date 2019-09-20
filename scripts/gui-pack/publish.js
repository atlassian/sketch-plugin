#!/usr/bin/env node
const {
  promises: { writeFile, copyFile, mkdtemp, mkdir, stat },
} = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');
const fetch = require('node-fetch');
const shell = require('shelljs');
const chalk = require('chalk');
const AbstractSDK = require('abstract-sdk');
const xml2js = require('xml2js');
const dotenv = require('dotenv');

dotenv.config();

const abstract = new AbstractSDK.Client({
  transportMode: 'cli',
});

const {
  ABSTRACT_PROJECT_ID,
  REMOTE_USER,
  REMOTE_HOST,
  REMOTE_PATH_BASE,
  URL_BASE,
  SHOULD_FORCE_PUBLISH,
} = process.env;

const URL_BASE_GUI_PACK = `${URL_BASE}/gui-pack`;

const INTERVAL_POLL = 10 * 60 * 1000; // 10 minutes
const URL_ICON = `${URL_BASE_GUI_PACK}/icon.png`;

/**
 * Determine when the GUI Pack was last published by contacting the server.
 *
 * @returns {Date} - Date when the GUI Pack was last published.
 */
const getLastPublishDate = async () => {
  const response = await fetch(`${URL_BASE_GUI_PACK}/index.json`);

  if (!response.ok || SHOULD_FORCE_PUBLISH) {
    // Reupload everything
    return new Date(0);
  }

  return new Date((await response.json()).pubDate);
};

/**
 * Determine when the latest Abstract commit was made.
 *
 * This will be the publish date for this release of the GUI Pack.
 *
 * @param {string} projectId - An [Abstract project ID](https://sdk.goabstract.com/docs/abstract-api/#the-project-object).
 * @returns {Date} - The date of the latest Abstract commit.
 */
const getPublishDate = async projectId =>
  new Date(
    (await abstract.commits.list({
      projectId,
      branchId: 'master',
    }))[0].time,
  );

/**
 * Sanitize a filename like "ADG Page (Grid)" so it can be used in a URL ("ADG-Page-Grid").
 *
 * It replaces any string of non-alphanumeric characters with dashes, and then removes any string of
 * dashes at the end of the filename.
 *
 * @param {string} name - String to sanitize.
 * @returns {string} Sanitized string.
 */
const sanitize = name => name.replace(/\W+/g, '-').replace(/-+$/, '');

/**
 * Get all of the files in an Abstract project.
 *
 * @param {string} projectId - An [Abstract project ID](https://sdk.goabstract.com/docs/abstract-api/#the-project-object).
 * @returns {Array} - A list of [FileDescriptors](https://sdk.goabstract.com/docs/abstract-api/#the-file-object)
 *  for all the files in the latest commit.
 */
const getFiles = async projectId =>
  abstract.files.list({
    projectId,
    branchId: 'master',
    sha: 'latest',
  });

/**
 * Export the given files to a temporary location.
 *
 * `abstract.files.raw()` (https://sdk.goabstract.com/docs/abstract-api/#retrieve-an-sketch-file)
 * exports Sketch files.
 *
 * @param {Array} files - A list of [FileDescriptors](https://sdk.goabstract.com/docs/abstract-api/#the-file-object)
 *  to be exported.
 * @param {string} buildDirName - Path to export to.
 * @returns {string} - Path to the stored files.
 */
const exportFiles = async (files, buildDirName) =>
  Promise.all(
    files.map(({ id, sha, name, isLibrary }) =>
      (async () => {
        const subDirName = isLibrary ? 'libraries' : 'templates';
        console.log(chalk`  🖨  Exporting {yellow.bold ${name}.sketch} → {blue.bold ${subDirName}}`);
        await abstract.files.raw(
          { projectId: ABSTRACT_PROJECT_ID, branchId: 'master', sha, fileId: id },
          { filename: join(buildDirName, subDirName, sanitize(name)) },
        );
      })(),
    ),
  );

/**
 * Creates a JSON object that represents some XML. This will then be built and turned into a file,
 * for whenever a new library gets added to the GUI pack.
 *
 * The RSS metadata (XML namespaces etc) is the bare minimum required for Sketch to read the file.
 *
 * @param {string} name - Readable name of the library.
 * @param {string} url - URL where the library can be found.
 * @param {Date} date - Date object for when the library was created.
 * @param {string} sha - The hash of the appropriate Abstract commit.
 * @param {number} size - Size of the library in bytes.
 * @returns {object} - A JSON object representing an RSS feed in xml2js format.
 */
const rssTemplate = (name, url, date, sha, size) => ({
  rss: {
    $: {
      version: '2.0',
      'xmlns:sparkle': 'http://www.andymatuschak.org/xml-namespaces/sparkle',
      'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    },
    channel: {
      title: name,
      description: 'Supplied by the ADG Sketch Plugin.',
      image: { url: URL_ICON, title: name },
      item: [
        {
          title: name,
          sha,
          pubDate: date.toISOString(),
          enclosure: [
            {
              $: {
                url,
                'sparkle:version': date.getTime(),
                type: 'application/octet-stream',
                length: size,
              },
            },
          ],
        },
      ],
    },
  },
});

/**
 * Generate RSS files for the given libraries.
 *
 * @param {Array} files - A list of [FileDescriptors](https://sdk.goabstract.com/docs/abstract-api/#the-file-object)
 *  to generate RSS files for.
 * @param {string} buildDirName - Path to generate to.
 */
const generateRSSFiles = async (files, buildDirName) => {
  await mkdir(join(buildDirName, 'rss'));
  await Promise.all(
    files.map(async ({ name: libraryName, sha, updatedAt: publishDate, isLibrary }) => {
      const sanitizedLibraryName = sanitize(libraryName);
      const subDirName = isLibrary ? 'libraries' : 'templates';
      const { size } = await stat(join(buildDirName, subDirName, `${sanitizedLibraryName}.sketch`));

      const rssXml = new xml2js.Builder().buildObject(
        rssTemplate(
          libraryName,
          `${URL_BASE_GUI_PACK}/libraries/${sanitizedLibraryName}.sketch`,
          new Date(publishDate),
          sha,
          size,
        ),
      );

      return writeFile(join(buildDirName, 'rss', `${sanitizedLibraryName}.xml`), rssXml);
    }),
  );
};

/**
 * Generate a list of URLs that Sketch can consume as RSS feeds.
 *
 * @param {Array} files - A list of [FileDescriptors](https://sdk.goabstract.com/docs/abstract-api/#the-file-object)
 *  to get library names from.
 * @returns {Array} - A list of URLs to library RSS feeds.
 */
const generateLibraryIndex = async files =>
  files.map(({ name }) => `${URL_BASE_GUI_PACK}/rss/${sanitize(name)}.xml`);

/**
 * Generate an index of templates.
 *
 * Note that on Sketch's side, we can't use RSS feeds for templates. But we can totally just keep
 * the publish date in sync and check that, so that's what we do.
 *
 * @param {Array} files - A list of [FileDescriptors](https://sdk.goabstract.com/docs/abstract-api/#the-file-object)
 *  to get template details from.
 * @returns {Array} - A list of `{ name, url, pubDate }` objects representing templates.
 */
const generateTemplateIndex = async files =>
  files.map(({ name, updatedAt }) => ({
    name,
    url: `${URL_BASE_GUI_PACK}/templates/${sanitize(name)}.sketch`,
    pubDate: new Date(updatedAt).toISOString(),
  }));

/**
 * Generate an index file which is consumed by Sketch to determine:
 *  a) Where the valid libraries and templates are
 *  b) Which templates need to be updated.
 *
 * This is in the format:
 * {
 *    libraries: [ String ],
 *    templates: [
 *      {
 *        name: String,
 *        url: String,
 *        pubDate: String,
 *      }.
 *    ]
 * }.
 *
 * @param {Array} files - A list of [FileDescriptors](https://sdk.goabstract.com/docs/abstract-api/#the-file-object)
 *  hosted in Abstract.
 * @param {Date} publishDate - The date of the last Abstract commit.
 * @param {string} buildDirName - Path to export to.
 */
const generateIndex = async (files, publishDate, buildDirName) => {
  const [libraries, templates] = await Promise.all([
    generateLibraryIndex(files.filter(({ isLibrary }) => isLibrary)),
    generateTemplateIndex(files.filter(({ isLibrary }) => !isLibrary)),
  ]);
  await writeFile(
    join(buildDirName, 'index.json'),
    JSON.stringify({ pubDate: publishDate, libraries, templates }),
  );
};

const publish = async () => {
  if (!ABSTRACT_PROJECT_ID || !REMOTE_USER || !REMOTE_HOST || !REMOTE_PATH_BASE) {
    console.error(
      chalk`{red Some required environment variables were not specified!} Check if the following are in your .env at the repository root:\n  GUI_PACK_ABSTRACT_PROJECT_ID\n  GUI_PACK_REMOTE_USER\n  GUI_PACK_REMOTE_HOST\n  GUI_PACK_REMOTE_PATH_INTERNAL`,
    );
    process.exit(1);
  }

  try {
    const [buildDirName, lastPublishDate, publishDate] = await Promise.all([
      mkdtemp(tmpdir()),
      getLastPublishDate(),
      getPublishDate(ABSTRACT_PROJECT_ID),
    ]);

    console.log(
      chalk`📝  Getting files that have changed since {magenta.bold ${lastPublishDate.toLocaleString()}}`,
    );
    const files = await getFiles(ABSTRACT_PROJECT_ID);
    const changedFiles = files.filter(({ updatedAt }) => new Date(updatedAt) > lastPublishDate);

    if (changedFiles.length !== 0) {
      await Promise.all([
        (async () => {
          console.log('📦  Exporting changed files...');
          await exportFiles(changedFiles, buildDirName);
        })(),
        (async () => {
          console.log('📄  Generating index');
          await generateIndex(files, publishDate, buildDirName);
        })(),
        (async () => {
          console.log('🖼  Copying icon');
          await copyFile(join('scripts', 'gui-pack', 'icon.png'), join(buildDirName, 'icon.png'));
        })(),
      ]);

      console.log('✒️  Generating RSS files for libraries');
      await generateRSSFiles(changedFiles.filter(({ isLibrary }) => isLibrary), buildDirName);

      console.log('👆  Pushing files to remote');
      shell.exec(
        `rsync -r ${buildDirName}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH_BASE}/gui-pack`,
        {
          silent: true,
        },
      );

      console.log(chalk`✨  Shipped for {magenta.bold ${publishDate.toLocaleString()}}\n`);
    } else {
      console.log(chalk`⏳  No new changes for {magenta.bold ${new Date().toLocaleString()}}\n`);
    }
  } catch (e) {
    console.error(e);
  }
};

setImmediate(publish);
setInterval(publish, INTERVAL_POLL);
