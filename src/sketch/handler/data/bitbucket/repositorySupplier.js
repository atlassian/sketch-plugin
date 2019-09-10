import sketch from 'sketch';
import supplyData from '../supplyData';
import { randomChoice } from '../../../util/random';
import repositoryData from '../../../../../assets/data/bitbucket/repositories.json';

const { DataSupplier } = sketch;

const TEXT_BITBUCKET_REPOSITORY_NAME = 'Bitbucket_Repository Name';

const getBitbucketRepositoryName = () => ({
  primary: randomChoice(repositoryData),
});

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_BITBUCKET_REPOSITORY_NAME,
    'SupplyBitbucketRepositoryName',
  );
};

export const onSupplyBitbucketRepositoryName = context =>
  supplyData(getBitbucketRepositoryName, context, TEXT_BITBUCKET_REPOSITORY_NAME);
