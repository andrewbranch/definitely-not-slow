import { PackageBenchmarkSummary, Args, Document } from '../common';
import { AllPackages } from 'types-publisher/bin/lib/packages';
export interface CompareOptions {
    allPackages: AllPackages;
    definitelyTypedPath: string;
    typeScriptVersionMajorMinor: string;
    packageName: string;
    packageVersion: number;
    maxRunSeconds?: number;
    upload?: boolean;
}
export declare function compare(args: Args): Promise<void>;
export declare function compareBenchmarks({ allPackages, definitelyTypedPath, typeScriptVersionMajorMinor, packageName, packageVersion, maxRunSeconds, upload, }: CompareOptions): Promise<[Document<PackageBenchmarkSummary> | undefined, Document<PackageBenchmarkSummary>]>;
