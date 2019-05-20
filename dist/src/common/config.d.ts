export declare const config: {
    benchmarks: {
        languageServiceIterations: number;
    };
    database: {
        benchmarksDatabaseId: string;
        packageBenchmarksContainerId: string;
        packageBenchmarksDocumentSchemaVersion: number;
        endpoint: string;
        readonly writeKey: string;
        readonly readKey: string;
    };
    github: {
        userAgent: string;
        readonly typeScriptBotAuthToken: string;
        commonParams: {
            owner: string;
            repo: string;
        };
    };
    comparison: {
        percentDiffWarningThreshold: number;
        percentDiffSevereThreshold: number;
        percentDiffGoldStarThreshold: number;
    };
};
