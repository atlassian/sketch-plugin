import sketch from 'sketch';
import supplyData from '../supplyData';
import { randomChoice } from '../../../util/random';
import commitData from '../../../../../assets/data/bitbucket/commits.json';

const { DataSupplier } = sketch;

const TEXT_BITBUCKET_COMMIT_NAME = 'Bitbucket_Commit Name';

const getBitbucketCommitName = () => ({ primary: randomChoice(commitData) });

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_BITBUCKET_COMMIT_NAME,
    'SupplyBitbucketCommitName',
  );
};

export const onSupplyBitbucketCommitName = context =>
  supplyData(getBitbucketCommitName, context, TEXT_BITBUCKET_COMMIT_NAME);
