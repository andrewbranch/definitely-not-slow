/// <reference types="node" />
import * as fs from 'fs';
import { SystemInfo, Document, JSONDocument, PackageBenchmarkSummary, QueryResult } from './types';
import { PackageId } from 'types-publisher/bin/lib/packages';
export declare const pathExists: typeof fs.exists.__promisify__;
export declare function ensureExists(...pathNames: string[]): string;
export declare type Args = {
    [key: string]: string | boolean | number;
};
export declare function deserializeArgs(args: string[]): Args;
export declare function serializeArgs(args: Args): string;
export declare function compact<T>(arr: (T | null | undefined)[]): T[];
export declare function assertString(input: any, name?: string): string;
export declare function assertNumber(input: any, name?: string): number;
export declare function assertBoolean(input: any, name?: string): boolean;
export declare function assertDefined<T>(input: T | null | undefined, name?: string): T;
export declare function withDefault<T>(input: T, defaultValue: T): T;
export declare function getSystemInfo(): SystemInfo;
export interface GetChangedPackagesOptions {
    diffFrom?: string;
    diffTo: string;
    definitelyTypedPath: string;
}
export declare function getChangedPackages({ diffFrom, diffTo, definitelyTypedPath }: GetChangedPackagesOptions): Promise<PackageId[] | undefined>;
export declare function packageIdsAreEqual(a: PackageId): (b: PackageId) => boolean;
export declare function packageIdsAreEqual(a: PackageId, b: PackageId): boolean;
export declare function getPercentDiff(actual: number, expected: number): number;
export declare function isWithin(actual: number, expected: number, tolerance: number): boolean;
export declare function systemsAreCloseEnough(a: SystemInfo, b: SystemInfo, cpuSpeedTolerance?: number): boolean;
export declare function createDocument<T>(body: T, version: number): Document<T>;
export declare function parsePackageKey(key: string): PackageId;
export declare function toPackageKey(name: string, majorVersion: string): string;
export declare function toPackageKey(packageId: PackageId): string;
export declare function deserializeSummary(doc: QueryResult<JSONDocument<PackageBenchmarkSummary>>): QueryResult<Document<PackageBenchmarkSummary>>;
export declare function getSourceVersion(cwd: string): string;
export declare function shuffle<T>(array: readonly T[]): T[];
export declare function not<P extends unknown[]>(fn: (...args: P) => boolean): (...args: P) => boolean;
export declare function findLast<T>(arr: T[], predicate: (element: T) => boolean): T | undefined;
