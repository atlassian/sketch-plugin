import sketch from 'sketch';
import { resourcePath } from '@skpm/path';
import supplyData from './supplyData';
import { randomInt, randomExponential } from '../../util/random';

const { DataSupplier } = sketch;

const TEXT_DATE = 'Other_Date';
const TEXT_VERSION_NUMBER = 'Other_Version Number';

const getDate = () => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const getPrettyDate = date => `${date.getDate()} ${months[date.getUTCMonth()]}`;

  let date = new Date();
  date = new Date(date.getTime() + randomInt(365 * 24 * 60 * 60 * 1000));
  return { primary: getPrettyDate(date) };
};

/**
 * Generate a valid semantic version, using an exponential generator to bias small numbers.
 * The numbers generated should have a mean of 5.
 *
 * @returns {string} - A valid random semantic version.
 */
const getVersionNumber = () => ({
  primary: `${randomExponential(5)}.${randomExponential(5)}.${randomExponential(5)}`,
});

const NUM_PROJECT_AVATAR = 26;
export const getProjectAvatar = () =>
  resourcePath(`data/project-avatar/project-avatar-${randomInt(NUM_PROJECT_AVATAR)}.png`);

export const onStartup = () => {
  DataSupplier.registerDataSupplier('public.text', TEXT_DATE, 'SupplyDate');
  DataSupplier.registerDataSupplier('public.text', TEXT_VERSION_NUMBER, 'SupplyVersionNumber');
};

export const onSupplyDate = context => supplyData(getDate, context, TEXT_DATE);
export const onSupplyVersionNumber = context =>
  supplyData(getVersionNumber, context, TEXT_VERSION_NUMBER);
