import sketch from 'sketch';
import { resourcePath } from '@skpm/path';
import { shuffle } from 'lodash';
import { supplyDataList } from '../supplyData';
import heroData from '../../../../../assets/data/user/heroes.json';
import humanData from '../../../../../assets/data/user/humans.json';
import meepleData from '../../../../../assets/data/user/meeple.json';

const { DataSupplier } = sketch;

const IMAGE_USER_AVATAR_HUMAN = 'User_Avatar (Human)';
const TEXT_USER_NAME_HUMAN = 'User_Name';
const TEXT_USER_USERNAME_HUMAN = 'User_Username';
const TEXT_USER_HANDLE_HUMAN = 'User_@ Handle';
const TEXT_USER_EMAIL_HUMAN = 'User_Email Address';
const MULTI_USER_HUMAN = 'User_Human';

const IMAGE_USER_AVATAR_MEEPLE = 'User_Avatar (Meeple)';
const MULTI_USER_MEEPLE = 'User_Meeple';

/**
 * Create a curve that starts at 1.0 and drops, concave up, to 0.1.
 *
 * This is used to calculate the probability that a hero image appears, which depends on its index
 * in the array. Hero images should be common at the start, and slowly drop off.
 *
 * Graphed here: https://www.desmos.com/calculator/i8or19rcw5.
 *
 * @param {number} x - Input.
 * @returns {number} - Probability between 0 and 1.
 */
const exponentialCurve = x => 0.9 * 0.8 ** x + 0.1;

/**
 * Return an array of humans and heroes, shuffled and interleaves in such a way that the heroes
 * appear more commonly near the start of the array (in such a way as to avoid duplicates as much as
 * possible).
 *
 * This works as follows:
 *  1. Shuffle the human and heroes arrays.
 *  2. Generate a blank array of the required length.
 *  3. Set the current numbers of heroes and humans to 0.
 *  4. For each item, generate a random number between 0 and 1. If it falls under the exponential
 *     dropoff curve defined above, assign a hero image. Otherwise, assign a human.
 *  5. Once assigned, pick the _next_ person from their array, and increment the counter for that
 *     array. Loop around to the start once exhausted if necessary. This mitigates duplication.
 *
 * @param {number} length - The length of the array to generate.
 * @returns {Array} - A list of person data.
 */
const getPeople = length => {
  const shuffledHeroes = shuffle(heroData);
  const shuffledHumans = shuffle(humanData);

  let numHeroes = 0;
  let numHumans = 0;
  return new Array(length).fill(0).map((_, i) => {
    if (Math.random() < exponentialCurve(i)) {
      const heroesIndex = numHeroes % shuffledHeroes.length;
      numHeroes += 1;
      return shuffledHeroes[heroesIndex];
    }
    const humansIndex = numHumans % shuffledHumans.length;
    numHumans += 1;
    return shuffledHumans[humansIndex];
  });
};

/**
 * Transform a { name, username } object into a full user.
 *
 * @param {object} data - An object in the shape { name, username }.
 * @param {string} avatarDirectory - The directory where the avatars are stored for that user type.
 * @returns {object} - Sample user data with the keys: "name", "username", "handle", "emailaddress",
 * and "avatar"
 */
const transformUser = ({ name, username }, avatarDirectory) => ({
  name,
  username,
  handle: `@${username}`,
  emailaddress: `${username}@beyondgravity.team`,
  avatar: resourcePath(`${avatarDirectory}/${username}.jpg`),
});

export const getHumans = length =>
  getPeople(length).map(user => transformUser(user, 'data/user/human-avatar'));

// slicing when length > array.length will just return the whole array

export const getMeeple = length =>
  shuffle(meepleData)
    .slice(0, length)
    .map(user => transformUser(user, 'data/user/meeple-avatar'));

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_USER_AVATAR_HUMAN,
    'SupplyUserAvatarHuman',
  );
  DataSupplier.registerDataSupplier('public.text', TEXT_USER_NAME_HUMAN, 'SupplyUserNameHuman');
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_USER_USERNAME_HUMAN,
    'SupplyUserUsernameHuman',
  );
  DataSupplier.registerDataSupplier('public.text', TEXT_USER_HANDLE_HUMAN, 'SupplyUserHandleHuman');
  DataSupplier.registerDataSupplier('public.text', TEXT_USER_EMAIL_HUMAN, 'SupplyUserEmailHuman');
  DataSupplier.registerDataSupplier(
    'public.image',
    `${MULTI_USER_HUMAN} 🔗`,
    'SupplyUserImageHuman',
  );
  DataSupplier.registerDataSupplier('public.text', `${MULTI_USER_HUMAN} 🔗`, 'SupplyUserTextHuman');

  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_USER_AVATAR_MEEPLE,
    'SupplyUserAvatarMeeple',
  );
  DataSupplier.registerDataSupplier(
    'public.image',
    `${MULTI_USER_MEEPLE} 🔗`,
    'SupplyUserImageMeeple',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_USER_MEEPLE} 🔗`,
    'SupplyUserTextMeeple',
  );
};

export const onSupplyUserAvatarHuman = context =>
  supplyDataList(getHumans, context, IMAGE_USER_AVATAR_HUMAN, 'avatar');
export const onSupplyUserNameHuman = context =>
  supplyDataList(getHumans, context, TEXT_USER_NAME_HUMAN, 'name');
export const onSupplyUserUsernameHuman = context =>
  supplyDataList(getHumans, context, TEXT_USER_USERNAME_HUMAN, 'username');
export const onSupplyUserHandleHuman = context =>
  supplyDataList(getHumans, context, TEXT_USER_HANDLE_HUMAN, 'handle');
export const onSupplyUserEmailHuman = context =>
  supplyDataList(getHumans, context, TEXT_USER_EMAIL_HUMAN, 'emailaddress');
export const onSupplyUserImageHuman = context =>
  supplyDataList(getHumans, context, MULTI_USER_HUMAN, 'avatar', true);
export const onSupplyUserTextHuman = context =>
  supplyDataList(getHumans, context, MULTI_USER_HUMAN, 'name', true);

export const onSupplyUserAvatarMeeple = context =>
  supplyDataList(getMeeple, context, IMAGE_USER_AVATAR_MEEPLE, 'avatar');
export const onSupplyUserImageMeeple = context =>
  supplyDataList(getMeeple, context, MULTI_USER_MEEPLE, 'avatar', true);
export const onSupplyUserTextMeeple = context =>
  supplyDataList(getMeeple, context, MULTI_USER_MEEPLE, 'name', true);
