"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("types-publisher/bin/util/util");
exports.config = {
    benchmarks: {
        languageServiceIterations: 5,
    },
    database: {
        benchmarksDatabaseId: 'benchmarks',
        packageBenchmarksContainerId: 'packageBenchmarks',
        packageBenchmarksDocumentSchemaVersion: 1,
        endpoint: 'https://dt-perf.documents.azure.com:443/',
        get writeKey() {
            return util_1.assertDefined(process.env.DATABASE_WRITE_KEY, `Required environment variable 'DATABASE_WRITE_KEY' was not set`);
        },
        get readKey() {
            return util_1.assertDefined(process.env.DATABASE_READ_KEY, `Required environment variable 'DATABASE_READ_KEY' was not set`);
        }
    },
    github: {
        userAgent: 'definitely-not-slow',
        get typeScriptBotAuthToken() {
            return util_1.assertDefined(process.env.TYPESCRIPT_BOT_GITHUB_TOKEN, `Required environment variable 'TYPESCRIPT_BOT_GITHUB_TOKEN' was not set`);
        },
        commonParams: {
            owner: 'Microsoft',
            repo: 'DefinitelyTyped',
        },
    },
    comparison: {
        percentDiffWarningThreshold: 0.1,
        percentDiffSevereThreshold: 0.5,
        percentDiffGoldStarThreshold: -0.25,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1vbi9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3REFBOEQ7QUFFakQsUUFBQSxNQUFNLEdBQUc7SUFDcEIsVUFBVSxFQUFFO1FBQ1YseUJBQXlCLEVBQUUsQ0FBQztLQUM3QjtJQUNELFFBQVEsRUFBRTtRQUNSLG9CQUFvQixFQUFFLFlBQVk7UUFDbEMsNEJBQTRCLEVBQUUsbUJBQW1CO1FBQ2pELHNDQUFzQyxFQUFFLENBQUM7UUFDekMsUUFBUSxFQUFFLDBDQUEwQztRQUNwRCxJQUFJLFFBQVE7WUFDVixPQUFPLG9CQUFhLENBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQzlCLGdFQUFnRSxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUNELElBQUksT0FBTztZQUNULE9BQU8sb0JBQWEsQ0FDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFDN0IsK0RBQStELENBQUMsQ0FBQztRQUNyRSxDQUFDO0tBQ0Y7SUFDRCxNQUFNLEVBQUU7UUFDTixTQUFTLEVBQUUscUJBQXFCO1FBQ2hDLElBQUksc0JBQXNCO1lBQ3hCLE9BQU8sb0JBQWEsQ0FDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFDdkMseUVBQXlFLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQ0QsWUFBWSxFQUFFO1lBQ1osS0FBSyxFQUFFLFdBQVc7WUFDbEIsSUFBSSxFQUFFLGlCQUFpQjtTQUN4QjtLQUNGO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsMkJBQTJCLEVBQUUsR0FBRztRQUNoQywwQkFBMEIsRUFBRSxHQUFHO1FBQy9CLDRCQUE0QixFQUFFLENBQUMsSUFBSTtLQUNwQztDQUNGLENBQUMifQ==