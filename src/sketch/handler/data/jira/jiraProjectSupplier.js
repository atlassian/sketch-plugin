import sketch from 'sketch';
import supplyData from '../supplyData';
import { getProjectAvatar } from '../genericSupplier';
import { randomChoice } from '../../../util/random';
import projectData from '../../../../../assets/data/jira/projects.json';

const { DataSupplier } = sketch;

const IMAGE_JIRA_PROJECT_AVATAR = 'Jira_Project Avatar';
const TEXT_JIRA_PROJECT_NAME = 'Jira_Project Name';
const TEXT_JIRA_PROJECT_KEY = 'Jira_Project Key';
const TEXT_JIRA_PROJECT_TYPE_NAME = 'Jira_Project Type Name';
const MULTI_JIRA_PROJECT = 'Jira_Project';

const getJiraProject = () => {
  const project = randomChoice(projectData);
  return {
    ...project,
    avatar: getProjectAvatar(),
  };
};

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_JIRA_PROJECT_AVATAR,
    'SupplyJiraProjectAvatar',
  );

  DataSupplier.registerDataSupplier('public.text', TEXT_JIRA_PROJECT_NAME, 'SupplyJiraProjectName');
  DataSupplier.registerDataSupplier('public.text', TEXT_JIRA_PROJECT_KEY, 'SupplyJiraProjectKey');
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_JIRA_PROJECT_TYPE_NAME,
    'SupplyJiraProjectTypeName',
  );

  DataSupplier.registerDataSupplier(
    'public.image',
    `${MULTI_JIRA_PROJECT} 🔗`,
    'SupplyJiraProjectImage',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_JIRA_PROJECT} 🔗`,
    'SupplyJiraProjectText',
  );
};

export const onSupplyJiraProjectAvatar = context =>
  supplyData(getJiraProject, context, IMAGE_JIRA_PROJECT_AVATAR, 'avatar');
export const onSupplyJiraProjectName = context =>
  supplyData(getJiraProject, context, TEXT_JIRA_PROJECT_NAME, 'name');
export const onSupplyJiraProjectKey = context =>
  supplyData(getJiraProject, context, TEXT_JIRA_PROJECT_KEY, 'key');
export const onSupplyJiraProjectTypeName = context =>
  supplyData(getJiraProject, context, TEXT_JIRA_PROJECT_TYPE_NAME, 'typeName');
export const onSupplyJiraProjectImage = context =>
  supplyData(getJiraProject, context, MULTI_JIRA_PROJECT, 'avatar', true);
export const onSupplyJiraProjectText = context =>
  supplyData(getJiraProject, context, MULTI_JIRA_PROJECT, 'name', true);
