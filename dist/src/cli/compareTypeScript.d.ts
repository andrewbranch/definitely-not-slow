import { PackageId } from "types-publisher/bin/lib/packages";
import { PackageBenchmarkSummary, Args, JSONDocument } from "../common";
export interface CompareTypeScriptOptions {
    compareAgainstMajorMinor: string;
    definitelyTypedPath: string;
    packages?: PackageId[];
    maxRunSeconds?: number;
    typeScriptPath?: string;
    outFile?: string;
    groups?: {
        [key: string]: JSONDocument<PackageBenchmarkSummary>;
    }[];
    agentCount?: number;
    agentIndex?: number;
    upload: boolean;
}
export declare function compareTypeScriptCLI(args: Args): Promise<void>;
export declare function compareTypeScript({ compareAgainstMajorMinor, definitelyTypedPath, packages, maxRunSeconds, typeScriptPath, upload, outFile, groups, ...opts }: CompareTypeScriptOptions): Promise<void>;
