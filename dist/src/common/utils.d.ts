/// <reference types="node" />
import * as fs from 'fs';
import { SystemInfo } from './types';
import { PackageId } from 'types-publisher/bin/lib/packages';
export declare const pathExists: typeof fs.exists.__promisify__;
export declare function ensureExists(...pathNames: string[]): string;
export declare type Args = {
    [key: string]: string | true | number;
};
export declare function deserializeArgs(args: string[]): Args;
export declare function serializeArgs(args: Args): string;
export declare function compact<T>(arr: (T | null | undefined)[]): T[];
export declare function assertString(input: any, name?: string): string;
export declare function assertNumber(input: any, name?: string): number;
export declare function assertBoolean(input: any, name?: string): boolean;
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
