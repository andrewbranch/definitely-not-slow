import { PackageId } from "types-publisher/bin/lib/packages";
import { Args } from "../common";
export interface CompareTypeScriptOptions {
    compareAgainstMajorMinor: string;
    definitelyTypedPath: string;
    packages?: PackageId[];
    maxRunSeconds?: number;
    typeScriptPath?: string;
}
export declare function compareTypeScriptCLI(args: Args): Promise<void>;
export declare function compareTypeScript({ compareAgainstMajorMinor, definitelyTypedPath, packages, maxRunSeconds, typeScriptPath, }: CompareTypeScriptOptions): Promise<void>;
