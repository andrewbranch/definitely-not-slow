import { PackageBenchmarkSummary, Args, Document } from '../common';
import { AllPackages } from 'types-publisher/bin/lib/packages';
export interface CompareOptions {
    allPackages: AllPackages;
    definitelyTypedPath: string;
    typeScriptVersionMajorMinor: string;
    packageName: string;
    packageVersion: number;
}
export declare function compare(args: Args): Promise<void>;
export declare function compareBenchmarks({ allPackages, definitelyTypedPath, typeScriptVersionMajorMinor, packageName, packageVersion, }: CompareOptions): Promise<[Document<PackageBenchmarkSummary>, Document<PackageBenchmarkSummary>]>;
