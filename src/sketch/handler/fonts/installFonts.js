/**
 * @file Functions for installing the fonts that the GUI Pack depends upon.
 *
 * The fonts covered by this file are:
 * - Roboto
 * - SF Pro
 * - SF Mono.
 *
 * Due to licensing issues, each has a different install method.
 */

import Async from 'sketch/async';
import Settings from 'sketch/settings';
import { readdirSync, copyFileSync } from '@skpm/fs';
import { exec as execCallback } from '@skpm/child_process';
import { showMessageBox } from '@skpm/dialog';
import { resourcePath } from '@skpm/path';
import { homedir, tmpdir } from '@skpm/os';
import { toArray, promisify } from '@skpm/util';
import { SETTING_SEEN_FONT_INSTALL_PROMPT } from '../../util/settings';
import event, { CATEGORY_OPEN, LABEL_GUI_PACK } from '../../util/analytics/analytics';

const exec = promisify(execCallback);

const FONT_NAME_ROBOTO = 'Roboto';
const FONT_NAME_SF_MONO = 'SF Mono';
const FONT_NAME_SF_PRO_DISPLAY = 'SF Pro Display';
const FONT_NAME_SF_PRO_TEXT = 'SF Pro Text';

const PATH_FONTS_MACOS = `${homedir()}/Library/Fonts`;
const PATH_FONT_ROBOTO = resourcePath('font/roboto');
const PATH_FONT_SF_MONO = '/Applications/Utilities/Terminal.app/Contents/Resources/Fonts/';

/**
 * Given a path containing fonts, install them into the macOS directory.
 *
 * @param {string} path - A directory containing fonts.
 */
const installFontsFromPath = async path => {
  const fonts = readdirSync(path).filter(
    filename => filename.endsWith('.ttf') || filename.endsWith('.otf'),
  );
  fonts.forEach(filename => {
    copyFileSync(`${path}/${filename}`, `${PATH_FONTS_MACOS}/${filename}`);
  });
};

/**
 * Install Roboto by copying the font files from our resources to the fonts folder.
 */
const installRoboto = async () => {
  installFontsFromPath(PATH_FONT_ROBOTO);
};

/**
 * Install SF Mono by copying the font files from the Terminal app bundle to the fonts folder.
 *
 * We don't have the license to distribute SF Mono ourselves, and it does not have a publicly
 * available download. This is the most legal way we can get it into Sketch — and it's also the
 * latest version of the font.
 */
const installSFMono = async () => {
  installFontsFromPath(PATH_FONT_SF_MONO);
};

/**
 * Install SF Pro by downloading it from Apple's website and opening the disk image.
 *
 * We can't automate this process for legal reasons, so we prompt the user first.
 *
 * @param {boolean} showIgnoreCheckbox - Whether to show the checkbox that allows the user to ignore the window.
 */
const installSFPro = async (showIgnoreCheckbox = true) => {
  const options = {
    type: 'warning',
    buttons: ['Download Font...', 'Cancel'],
    defaultId: 0,
    message: 'We couldn’t find the SF Pro fonts that are needed for the ADG Sketch Plugin.',
    detail: 'To install them, double-click the font files in the window that opens.',
  };

  if (showIgnoreCheckbox) {
    options.checkboxLabel = "Don't show this message again.";
  }

  showMessageBox(options, async ({ response, checkboxChecked }) => {
    if (response === 0) {
      const tmpPath = `${tmpdir()}/SF-Font.dmg`;
      await exec(`curl -o ${tmpPath} https://developer.apple.com/design/downloads/SF-Font.dmg`);
      await exec(`open ${tmpPath}`);
    } else if (checkboxChecked) {
      Settings.setSettingForKey(SETTING_SEEN_FONT_INSTALL_PROMPT, true);
    }
  });
};

/**
 * Check if fonts are installed and install them in parallel if necessary.
 */
const installFonts = async () => {
  const fiber = Async.createFiber();

  try {
    const installedFonts = toArray(
      NSFontManager.sharedFontManager().availableFontFamilies(),
    ).map(fontName => String(fontName));
    const promises = [];

    if (!installedFonts.includes(FONT_NAME_ROBOTO)) {
      promises.push(installRoboto());
    }

    if (!installedFonts.includes(FONT_NAME_SF_MONO)) {
      promises.push(installSFMono());
    }

    if (
      !Settings.settingForKey(SETTING_SEEN_FONT_INSTALL_PROMPT) &&
      (!installedFonts.includes(FONT_NAME_SF_PRO_TEXT) ||
        !installedFonts.includes(FONT_NAME_SF_PRO_DISPLAY))
    ) {
      promises.push(installSFPro());
    }

    await Promise.all(promises);
  } finally {
    fiber.cleanup();
  }
};

export const forceInstallFonts = async context => {
  const fiber = Async.createFiber();
  event(context, CATEGORY_OPEN, 'Force Install Fonts', LABEL_GUI_PACK);
  try {
    await Promise.all([installRoboto(), installSFMono(), installSFPro(false)]);
  } finally {
    fiber.cleanup();
  }
};

export default installFonts;
