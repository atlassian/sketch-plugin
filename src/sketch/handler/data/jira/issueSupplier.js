import sketch from 'sketch';
import { resourcePath } from '@skpm/path';
import supplyData from '../supplyData';
import { randomChoice } from '../../../util/random';
import issueData from '../../../../../assets/data/jira/issues.json';

const { DataSupplier } = sketch;

const IMAGE_JIRA_ISSUE_TYPE_ICON = 'Jira_Issue Type Icon';
const IMAGE_JIRA_ISSUE_PRIORITY_ICON = 'Jira_Issue Priority Icon';

const TEXT_JIRA_ISSUE_SUMMARY = 'Jira_Issue Summary';
const TEXT_JIRA_ISSUE_KEY = 'Jira_Issue Key';
const TEXT_JIRA_ISSUE_DESCRIPTION = 'Jira_Issue Description';
const TEXT_JIRA_ISSUE_STATUS = 'Jira_Issue Status';
const TEXT_JIRA_ISSUE_TYPE_NAME = 'Jira_Issue Type Name';
const TEXT_JIRA_ISSUE_PRIORITY_NAME = 'Jira_Issue Priority Name';
const TEXT_JIRA_ISSUE_RESOLUTION = 'Jira_Issue Resolution';

const MULTI_JIRA_ISSUE = 'Jira_Issue';

const getJiraIssueTypeIcon = filename => resourcePath(`data/jira/issue-type-icon/${filename}.png`);

const getJiraIssuePriorityIcon = filename =>
  resourcePath(`data/jira/issue-priority-icon/${filename}.png`);

const getJiraIssue = () => {
  const issue = randomChoice(issueData.issues);
  return {
    ...issue,
    typeIcon: getJiraIssueTypeIcon(issue.typeIcon),
    priorityIcon: getJiraIssuePriorityIcon(issue.priorityIcon),
    description: randomChoice(issueData.descriptions),
  };
};

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_JIRA_ISSUE_TYPE_ICON,
    'SupplyJiraIssueTypeIcon',
  );
  DataSupplier.registerDataSupplier(
    'public.image',
    IMAGE_JIRA_ISSUE_PRIORITY_ICON,
    'SupplyJiraIssuePriorityIcon',
  );

  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_JIRA_ISSUE_SUMMARY,
    'SupplyJiraIssueSummary',
  );
  DataSupplier.registerDataSupplier('public.text', TEXT_JIRA_ISSUE_KEY, 'SupplyJiraIssueKey');
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_JIRA_ISSUE_DESCRIPTION,
    'SupplyJiraIssueDescription',
  );
  DataSupplier.registerDataSupplier('public.text', TEXT_JIRA_ISSUE_STATUS, 'SupplyJiraIssueStatus');
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_JIRA_ISSUE_TYPE_NAME,
    'SupplyJiraIssueTypeName',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_JIRA_ISSUE_PRIORITY_NAME,
    'SupplyJiraIssuePriorityName',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_JIRA_ISSUE_RESOLUTION,
    'SupplyJiraIssueResolution',
  );

  DataSupplier.registerDataSupplier(
    'public.image',
    `${MULTI_JIRA_ISSUE} 🔗`,
    'SupplyJiraIssueImage',
  );
  DataSupplier.registerDataSupplier('public.text', `${MULTI_JIRA_ISSUE} 🔗`, 'SupplyJiraIssueText');
};

export const onSupplyJiraIssueTypeIcon = context =>
  supplyData(getJiraIssue, context, IMAGE_JIRA_ISSUE_TYPE_ICON, 'typeIcon');
export const onSupplyJiraIssuePriorityIcon = context =>
  supplyData(getJiraIssue, context, IMAGE_JIRA_ISSUE_PRIORITY_ICON, 'priorityIcon');

export const onSupplyJiraIssueSummary = context =>
  supplyData(getJiraIssue, context, TEXT_JIRA_ISSUE_SUMMARY, 'summary');
export const onSupplyJiraIssueKey = context =>
  supplyData(getJiraIssue, context, TEXT_JIRA_ISSUE_KEY, 'key');
export const onSupplyJiraIssueDescription = context =>
  supplyData(getJiraIssue, context, TEXT_JIRA_ISSUE_DESCRIPTION, 'description');
export const onSupplyJiraIssueStatus = context =>
  supplyData(getJiraIssue, context, TEXT_JIRA_ISSUE_STATUS, 'status');
export const onSupplyJiraIssueTypeName = context =>
  supplyData(getJiraIssue, context, TEXT_JIRA_ISSUE_TYPE_NAME, 'typeName');
export const onSupplyJiraIssuePriorityName = context =>
  supplyData(getJiraIssue, context, TEXT_JIRA_ISSUE_PRIORITY_NAME, 'priorityName');
export const onSupplyJiraIssueResolution = context =>
  supplyData(getJiraIssue, context, TEXT_JIRA_ISSUE_RESOLUTION, 'resolution');

export const onSupplyJiraIssueImage = context =>
  supplyData(getJiraIssue, context, MULTI_JIRA_ISSUE, 'typeIcon', true);
export const onSupplyJiraIssueText = context =>
  supplyData(getJiraIssue, context, MULTI_JIRA_ISSUE, 'summary', true);
