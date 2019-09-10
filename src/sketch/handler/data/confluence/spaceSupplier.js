import sketch from 'sketch';
import supplyData, { supplyDataList } from '../supplyData';
import { getProjectAvatar } from '../genericSupplier';
import { getHumans, getMeeple } from '../user/userSupplier';
import { randomChoice } from '../../../util/random';
import globalSpaceData from '../../../../../assets/data/confluence/globalSpaces.json';

const { DataSupplier } = sketch;

const IMAGE_CONFLUENCE_SPACE_AVATAR_PERSONAL = 'Confluence_Space Avatar (Personal)';
const IMAGE_CONFLUENCE_SPACE_AVATAR_MEEPLE = 'Confluence_Space Avatar (Meeple)';
const IMAGE_CONFLUENCE_SPACE_AVATAR_GLOBAL = 'Confluence_Space Avatar (Global)';
const TEXT_CONFLUENCE_SPACE_NAME_PERSONAL = 'Confluence_Space Name (Personal)';
const TEXT_CONFLUENCE_SPACE_NAME_GLOBAL = 'Confluence_Space Name (Global)';
const TEXT_CONFLUENCE_SPACE_KEY_PERSONAL = 'Confluence_Space Key (Personal)';
const TEXT_CONFLUENCE_SPACE_KEY_GLOBAL = 'Confluence_Space Key (Global)';
const MULTI_CONFLUENCE_SPACE_PERSONAL = 'Confluence_Space (Personal)';
const MULTI_CONFLUENCE_SPACE_MEEPLE = 'Confluence_Space (Meeple)';
const MULTI_CONFLUENCE_SPACE_GLOBAL = 'Confluence_Space (Global)';

/**
 * Supply global space data from a list.
 *
 * @returns {object} - Data from a single global space.
 */
const getConfluenceSpaceGlobal = () => ({
  ...randomChoice(globalSpaceData),
  avatar: getProjectAvatar(),
});

/**
 * Supply personal space data by combining random human data.
 *
 * @param {number} length - Length of the array to generate.
 * @returns {object} - Data from a single personal space.
 */
const getConfluenceSpacesPersonal = length =>
  getHumans(length).map(({ name, avatar, username }) => ({
    name,
    avatar,
    key: `~${username}`,
  }));

/**
 * Supply personal space data by combining random meeple data.
 *
 * @param {number} length - Length of the array to generate.
 * @returns {object} - Data from a single meeple personal space.
 */
const getConfluenceSpacesMeeple = length =>
  getMeeple(length).map(({ name, avatar, username }) => ({
    name,
    avatar,
    key: `~${username}`,
  }));

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_CONFLUENCE_SPACE_AVATAR_GLOBAL,
    'SupplyConfluenceSpaceAvatarGlobal',
  );
  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_CONFLUENCE_SPACE_AVATAR_PERSONAL,
    'SupplyConfluenceSpaceAvatarPersonal',
  );
  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_CONFLUENCE_SPACE_AVATAR_MEEPLE,
    'SupplyConfluenceSpaceAvatarMeeple',
  );

  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_CONFLUENCE_SPACE_NAME_GLOBAL,
    'SupplyConfluenceSpaceNameGlobal',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_CONFLUENCE_SPACE_NAME_PERSONAL,
    'SupplyConfluenceSpaceNamePersonal',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_CONFLUENCE_SPACE_KEY_GLOBAL,
    'SupplyConfluenceSpaceKeyGlobal',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_CONFLUENCE_SPACE_KEY_PERSONAL,
    'SupplyConfluenceSpaceKeyPersonal',
  );

  DataSupplier.registerDataSupplier(
    'public.image',
    `${MULTI_CONFLUENCE_SPACE_GLOBAL} 🔗`,
    'SupplyConfluenceSpaceGlobalImage',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_CONFLUENCE_SPACE_GLOBAL} 🔗`,
    'SupplyConfluenceSpaceGlobalText',
  );
  DataSupplier.registerDataSupplier(
    'public.image',
    `${MULTI_CONFLUENCE_SPACE_PERSONAL} 🔗`,
    'SupplyConfluenceSpacePersonalImage',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_CONFLUENCE_SPACE_PERSONAL} 🔗`,
    'SupplyConfluenceSpacePersonalText',
  );
  DataSupplier.registerDataSupplier(
    'public.image',
    `${MULTI_CONFLUENCE_SPACE_MEEPLE} 🔗`,
    'SupplyConfluenceSpaceMeepleImage',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_CONFLUENCE_SPACE_MEEPLE} 🔗`,
    'SupplyConfluenceSpaceMeepleText',
  );
};

export const onSupplyConfluenceSpaceAvatarGlobal = context =>
  supplyData(getConfluenceSpaceGlobal, context, IMAGE_CONFLUENCE_SPACE_AVATAR_GLOBAL, 'avatar');

export const onSupplyConfluenceSpaceNameGlobal = context =>
  supplyData(getConfluenceSpaceGlobal, context, TEXT_CONFLUENCE_SPACE_NAME_GLOBAL, 'name');
export const onSupplyConfluenceSpaceKeyGlobal = context =>
  supplyData(getConfluenceSpaceGlobal, context, TEXT_CONFLUENCE_SPACE_KEY_GLOBAL, 'key');
export const onSupplyConfluenceSpaceGlobalImage = context =>
  supplyData(getConfluenceSpaceGlobal, context, MULTI_CONFLUENCE_SPACE_GLOBAL, 'avatar', true);
export const onSupplyConfluenceSpaceGlobalText = context =>
  supplyData(getConfluenceSpaceGlobal, context, MULTI_CONFLUENCE_SPACE_GLOBAL, 'name', true);

export const onSupplyConfluenceSpaceAvatarPersonal = context =>
  supplyDataList(
    getConfluenceSpacesPersonal,
    context,
    IMAGE_CONFLUENCE_SPACE_AVATAR_PERSONAL,
    'avatar',
  );
export const onSupplyConfluenceSpaceNamePersonal = context =>
  supplyDataList(getConfluenceSpacesPersonal, context, TEXT_CONFLUENCE_SPACE_NAME_PERSONAL, 'name');
export const onSupplyConfluenceSpaceKeyPersonal = context =>
  supplyDataList(getConfluenceSpacesPersonal, context, TEXT_CONFLUENCE_SPACE_KEY_PERSONAL, 'key');
export const onSupplyConfluenceSpacePersonalImage = context =>
  supplyDataList(
    getConfluenceSpacesPersonal,
    context,
    MULTI_CONFLUENCE_SPACE_PERSONAL,
    'avatar',
    true,
  );
export const onSupplyConfluenceSpacePersonalText = context =>
  supplyDataList(
    getConfluenceSpacesPersonal,
    context,
    MULTI_CONFLUENCE_SPACE_PERSONAL,
    'name',
    true,
  );

export const onSupplyConfluenceSpaceAvatarMeeple = context =>
  supplyDataList(
    getConfluenceSpacesMeeple,
    context,
    IMAGE_CONFLUENCE_SPACE_AVATAR_MEEPLE,
    'avatar',
  );
export const onSupplyConfluenceSpaceMeepleImage = context =>
  supplyDataList(getConfluenceSpacesMeeple, context, MULTI_CONFLUENCE_SPACE_MEEPLE, 'avatar', true);
export const onSupplyConfluenceSpaceMeepleText = context =>
  supplyDataList(getConfluenceSpacesMeeple, context, MULTI_CONFLUENCE_SPACE_MEEPLE, 'name', true);
