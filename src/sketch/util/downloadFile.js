/**
 * @file For downloading files.
 */

import { writeFileSync, mkdirSync } from '@skpm/fs';
import { dirname } from '@skpm/path';

const downloadFile = async (url, path) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, await (await fetch(url)).arrayBuffer());
};

export default downloadFile;
