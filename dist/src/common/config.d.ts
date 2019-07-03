export declare const config: {
    benchmarks: {
        languageServiceIterations: number;
    };
    database: {
        benchmarksDatabaseId: string;
        packageBenchmarksContainerId: string;
        packageBenchmarksDocumentSchemaVersion: number;
        typeScriptComparisonsContainerId: string;
        typeScriptComparisonsDocumentSchemaVersion: number;
        endpoint: string;
        readonly writeKey: string;
        readonly readKey: string;
    };
    github: {
        userAgent: string;
        typeScriptBotUsername: string;
        readonly typeScriptBotAuthToken: string;
        commonParams: {
            owner: string;
            repo: string;
        };
    };
    comparison: {
        percentDiffWarningThreshold: number;
        percentDiffAlertThreshold: number;
        percentDiffAwesomeThreshold: number;
    };
};
