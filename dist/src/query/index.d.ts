import { Container } from '@azure/cosmos';
import { PackageBenchmarkSummary, Document, QueryResult } from '../common';
export interface GetLatestBenchmarkOptions {
    container: Container;
    packageName: string;
    packageVersion: string | number;
    typeScriptVersionMajorMinor: string;
}
export declare function getLatestBenchmark({ container, packageName, packageVersion, typeScriptVersionMajorMinor, }: GetLatestBenchmarkOptions): Promise<QueryResult<Document<PackageBenchmarkSummary>> | undefined>;
