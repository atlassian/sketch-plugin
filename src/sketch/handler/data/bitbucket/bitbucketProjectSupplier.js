import sketch from 'sketch';
import supplyData from '../supplyData';
import { getProjectAvatar } from '../genericSupplier';
import { randomChoice } from '../../../util/random';
import projectData from '../../../../../assets/data/jira/projects.json';

const { DataSupplier } = sketch;

const IMAGE_BITBUCKET_PROJECT_AVATAR = 'Bitbucket_Project Avatar';
const TEXT_BITBUCKET_PROJECT_NAME = 'Bitbucket_Project Name';
const TEXT_BITBUCKET_PROJECT_KEY = 'Bitbucket_Project Key';
const MULTI_BITBUCKET_PROJECT = 'Bitbucket_Project';

const getBitbucketProject = () => ({
  ...randomChoice(projectData),
  avatar: getProjectAvatar(),
});

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_BITBUCKET_PROJECT_AVATAR,
    'SupplyBitbucketProjectAvatar',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_BITBUCKET_PROJECT_NAME,
    'SupplyBitbucketProjectName',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_BITBUCKET_PROJECT_KEY,
    'SupplyBitbucketProjectKey',
  );
  DataSupplier.registerDataSupplier(
    'public.image',
    `${MULTI_BITBUCKET_PROJECT} 🔗`,
    'SupplyBitbucketProjectImage',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_BITBUCKET_PROJECT} 🔗`,
    'SupplyBitbucketProjectText',
  );
};

export const onSupplyBitbucketProjectAvatar = context =>
  supplyData(getBitbucketProject, context, IMAGE_BITBUCKET_PROJECT_AVATAR, 'avatar');
export const onSupplyBitbucketProjectName = context =>
  supplyData(getBitbucketProject, context, TEXT_BITBUCKET_PROJECT_NAME, 'name');
export const onSupplyBitbucketProjectKey = context =>
  supplyData(getBitbucketProject, context, TEXT_BITBUCKET_PROJECT_KEY, 'key');
export const onSupplyBitbucketProjectImage = context =>
  supplyData(getBitbucketProject, context, MULTI_BITBUCKET_PROJECT, 'avatar', true);
export const onSupplyBitbucketProjectText = context =>
  supplyData(getBitbucketProject, context, MULTI_BITBUCKET_PROJECT, 'name', true);
