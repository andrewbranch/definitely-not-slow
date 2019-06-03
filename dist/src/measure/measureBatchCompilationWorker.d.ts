import { CompilerOptions } from 'typescript';
import { PackageBenchmark } from '../common';
export declare const measureBatchCompilationWorkerFilename: string;
export interface MeasureBatchCompilationChildProcessArgs {
    tsPath: string;
    fileNames: string[];
    options: CompilerOptions;
}
export declare type MeasureBatchCompilationChildProcessResult = Pick<PackageBenchmark, 'typeCount' | 'relationCacheSizes' | 'memoryUsage'>;
