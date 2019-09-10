import sketch from 'sketch';
import supplyData from '../supplyData';
import { randomChoice } from '../../../util/random';
import pullRequestData from '../../../../../assets/data/bitbucket/pullRequests.json';

const { DataSupplier } = sketch;

const TEXT_BITBUCKET_PULL_REQUEST_NAME = 'Bitbucket_Pull Request Name';
const TEXT_BITBUCKET_PULL_REQUEST_DESCRIPTION = 'Bitbucket_Pull Request Description';
const MULTI_BITBUCKET_PULL_REQUEST = 'Bitbucket_Pull Request';

const getBitbucketPullRequestName = () => ({
  primary: randomChoice(pullRequestData.names),
});

const getBitbucketPullRequest = () => ({
  ...randomChoice(pullRequestData.linked),
});

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_BITBUCKET_PULL_REQUEST_NAME,
    'SupplyBitbucketPullRequestName',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_BITBUCKET_PULL_REQUEST_DESCRIPTION,
    'SupplyBitbucketPullRequestDescription',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_BITBUCKET_PULL_REQUEST} 🔗`,
    'SupplyBitbucketPullRequestText',
  );
};

export const onSupplyBitbucketPullRequestName = context =>
  supplyData(getBitbucketPullRequestName, context, TEXT_BITBUCKET_PULL_REQUEST_NAME);
export const onSupplyBitbucketPullRequestDescription = context =>
  supplyData(
    getBitbucketPullRequest,
    context,
    TEXT_BITBUCKET_PULL_REQUEST_DESCRIPTION,
    'description',
  );
export const onSupplyBitbucketPullRequestText = context =>
  supplyData(getBitbucketPullRequest, context, MULTI_BITBUCKET_PULL_REQUEST, 'name', true);
