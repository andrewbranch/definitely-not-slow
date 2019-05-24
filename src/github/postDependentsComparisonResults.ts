import { PackageBenchmarkSummary, Document, config, compact } from '../common';
import { assertDefined } from 'types-publisher/bin/util/util';
import { getOctokit } from './getOctokit';
import { createTablesWithAnalysesMessage } from './createTablesWithAnalysesMessage';

type BeforeAndAfter = [Document<PackageBenchmarkSummary>, Document<PackageBenchmarkSummary>];

export interface PostDependentsComparisonResultOptions {
  comparisons: BeforeAndAfter[];
  dryRun: boolean;
}

export async function postDependentsComparisonResult({
  comparisons,
  dryRun,
}: PostDependentsComparisonResultOptions) {
  const message = compact([
    `Ok, I’m back! As promised, here are the results from dependent packages`,
    ``,
    createTablesWithAnalysesMessage(
      comparisons,
      parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER || '')),
  ]).join('\n');

  if (!dryRun) {
    try {
      const prNumber = parseInt(assertDefined(
        process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER,
        `Required environment variable 'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER' was not set.`), 10);

      const octokit = getOctokit();
      await octokit.issues.createComment({
        ...config.github.commonParams,
        issue_number: prNumber,
        body: message,
      });
    } catch (err) {
      console.log(message);
      throw err;
    }
  }
  return message;
}

