import sketch from 'sketch';
import supplyData from '../supplyData';
import { randomChoice } from '../../../util/random';
import branchData from '../../../../../assets/data/bitbucket/branches.json';

const { DataSupplier } = sketch;

const TEXT_BITBUCKET_BRANCH_NAME = 'Bitbucket_Branch Name';

const getBitbucketBranchName = () => ({ primary: randomChoice(branchData) });

export const onStartup = () =>
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_BITBUCKET_BRANCH_NAME,
    'SupplyBitbucketBranchName',
  );

export const onSupplyBitbucketBranchName = context =>
  supplyData(getBitbucketBranchName, context, TEXT_BITBUCKET_BRANCH_NAME);
