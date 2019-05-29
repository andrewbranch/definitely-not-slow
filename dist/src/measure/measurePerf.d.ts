import { AllPackages } from 'types-publisher/bin/lib/packages';
import { PackageBenchmark } from '../common';
export interface MeasurePerfOptions {
    packageName: string;
    packageVersion: string;
    typeScriptVersion: string;
    definitelyTypedRootPath: string;
    maxRunSeconds?: number;
    progress?: boolean;
    nProcesses: number;
    iterations: number;
    allPackages: AllPackages;
    tsPath: string;
    ts: typeof import('typescript');
    batchRunStart: Date;
    failOnErrors?: boolean;
}
export declare function measurePerf({ packageName, packageVersion, typeScriptVersion, definitelyTypedRootPath, allPackages, maxRunSeconds, progress, nProcesses, iterations, tsPath, ts, batchRunStart, failOnErrors, }: MeasurePerfOptions): Promise<PackageBenchmark>;
