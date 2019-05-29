import { Database, Container } from '@azure/cosmos';
export declare const enum DatabaseAccessLevel {
    Read = "read",
    Write = "write"
}
export declare function getDatabase(accessLevel: DatabaseAccessLevel): Promise<{
    database: Database;
    packageBenchmarks: Container;
    typeScriptComparisons: Container;
}>;
