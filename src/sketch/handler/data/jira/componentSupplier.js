import sketch from 'sketch';
import supplyData from '../supplyData';
import { randomChoice } from '../../../util/random';
import componentData from '../../../../../assets/data/jira/components.json';

const { DataSupplier } = sketch;

const TEXT_JIRA_COMPONENT_NAME = 'Jira_Component Name';
const TEXT_JIRA_COMPONENT_DESCRIPTION = 'Jira_Component Description';
const MULTI_JIRA_COMPONENT = 'Jira_Component';

const getJiraComponent = () => randomChoice(componentData);

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_JIRA_COMPONENT_NAME,
    'SupplyJiraComponentName',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_JIRA_COMPONENT_DESCRIPTION,
    'SupplyJiraComponentDescription',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_JIRA_COMPONENT} 🔗`,
    'SupplyJiraComponentText',
  );
};

export const onSupplyJiraComponentName = context =>
  supplyData(getJiraComponent, context, TEXT_JIRA_COMPONENT_NAME, 'name');
export const onSupplyJiraComponentDescription = context =>
  supplyData(getJiraComponent, context, TEXT_JIRA_COMPONENT_DESCRIPTION, 'description');
export const onSupplyJiraComponentText = context =>
  supplyData(getJiraComponent, context, MULTI_JIRA_COMPONENT, 'name', true);
