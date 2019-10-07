"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const perf_hooks_1 = require("perf_hooks");
const versions_1 = require("types-publisher/bin/lib/versions");
const typescript_1 = require("typescript");
const common_1 = require("../common");
const installDependencies_1 = require("./installDependencies");
const getParsedCommandLineForPackage_1 = require("./getParsedCommandLineForPackage");
const util_1 = require("types-publisher/bin/util/util");
const measureLanguageServiceWorker_1 = require("./measureLanguageServiceWorker");
const measureBatchCompilationWorker_1 = require("./measureBatchCompilationWorker");
function measurePerf({ packageName, packageVersion, typeScriptVersion, definitelyTypedRootPath, allPackages, maxRunSeconds = Infinity, progress, nProcesses, iterations, tsPath, ts, batchRunStart, failOnErrors, }) {
    return __awaiter(this, void 0, void 0, function* () {
        let duration = NaN;
        const sourceVersion = child_process_1.execSync('git rev-parse HEAD', { cwd: definitelyTypedRootPath, encoding: 'utf8' }).trim();
        const observer = new perf_hooks_1.PerformanceObserver(list => {
            const totalMeasurement = list.getEntriesByName('benchmark')[0];
            duration = totalMeasurement.duration;
        });
        observer.observe({ entryTypes: ['measure'] });
        perf_hooks_1.performance.mark('benchmarkStart');
        const typesPath = path.join(definitelyTypedRootPath, 'types');
        const typings = allPackages.getTypingsData({ name: packageName, majorVersion: parseInt(packageVersion, 10) || '*' });
        const packagePath = path.join(typesPath, typings.subDirectoryPath);
        const typesVersion = getLatestTypesVersionForTypeScriptVersion(typings.typesVersions, typeScriptVersion);
        const latestTSTypesDir = path.resolve(packagePath, typesVersion ? `ts${typesVersion}` : '.');
        yield installDependencies_1.installDependencies(allPackages, typings.id, typesPath);
        const commandLine = getParsedCommandLineForPackage_1.getParsedCommandLineForPackage(ts, latestTSTypesDir);
        const testPaths = getTestFileNames(commandLine.fileNames);
        let done = 0;
        let lastUpdate = Date.now();
        let languageServiceCrashed = false;
        const testMatrix = createLanguageServiceTestMatrix(testPaths, latestTSTypesDir, commandLine.options, iterations);
        if (progress) {
            updateProgress(`${common_1.toPackageKey(packageName, packageVersion)}: benchmarking over ${nProcesses} processes`, 0, testMatrix.inputs.length);
        }
        yield util_1.runWithListeningChildProcesses({
            inputs: testMatrix.inputs,
            commandLineArgs: [],
            workerFile: measureLanguageServiceWorker_1.measureLanguageServiceWorkerFilename,
            nProcesses,
            crashRecovery: !failOnErrors,
            cwd: process.cwd(),
            softTimeoutMs: maxRunSeconds * 1000,
            handleCrash: input => {
                languageServiceCrashed = true;
                console.error('Failed measurement on request:', JSON.stringify(input, undefined, 2));
            },
            handleOutput: (measurement) => {
                testMatrix.addMeasurement(measurement);
                done++;
                if (progress) {
                    updateProgress(`${common_1.toPackageKey(packageName, packageVersion)}: benchmarking over ${nProcesses} processes`, done, testMatrix.inputs.length);
                }
                else if (Date.now() - lastUpdate > 1000 * 60 * 5) {
                    // Log every 5 minutes or so to make sure Pipelines doesn’t shut us down
                    console.log((100 * done / testMatrix.inputs.length).toFixed(1) + '% done...');
                    lastUpdate = Date.now();
                }
            },
        });
        if (progress && done !== testMatrix.inputs.length) {
            updateProgress(`${common_1.toPackageKey(packageName, packageVersion)}: timed out`, done, testMatrix.inputs.length);
            process.stdout.write(os.EOL);
        }
        const batchCompilationInput = {
            tsPath,
            fileNames: commandLine.fileNames,
            options: commandLine.options,
        };
        let batchCompilationResult;
        yield util_1.runWithChildProcesses({
            inputs: [batchCompilationInput],
            workerFile: measureBatchCompilationWorker_1.measureBatchCompilationWorkerFilename,
            commandLineArgs: [],
            nProcesses: 1,
            handleOutput: (result) => {
                batchCompilationResult = result;
            },
        });
        if (!batchCompilationResult) {
            throw new Error('Failed to get batch compilation metrics');
        }
        perf_hooks_1.performance.mark('benchmarkEnd');
        perf_hooks_1.performance.measure('benchmark', 'benchmarkStart', 'benchmarkEnd');
        const measurement = Object.assign(Object.assign({}, batchCompilationResult), { benchmarkDuration: duration, sourceVersion,
            packageName,
            packageVersion,
            typeScriptVersion, typeScriptVersionMajorMinor: ts.versionMajorMinor, languageServiceBenchmarks: testMatrix.getAllBenchmarks(), requestedLanguageServiceTestIterations: iterations, languageServiceCrashed, testIdentifierCount: testMatrix.uniquePositionCount, batchRunStart });
        return measurement;
        function getIdentifiers(sourceFile) {
            const identifiers = [];
            ts.forEachChild(sourceFile, function visit(node) {
                if (ts.isIdentifier(node)) {
                    identifiers.push(node);
                }
                else {
                    ts.forEachChild(node, visit);
                }
            });
            return identifiers;
        }
        function getTestFileNames(fileNames) {
            return fileNames.filter(name => {
                const ext = path.extname(name);
                return (ext === typescript_1.Extension.Ts || ext === typescript_1.Extension.Tsx) && !name.endsWith(typescript_1.Extension.Dts);
            });
        }
        function createLanguageServiceTestMatrix(testPaths, packageDirectory, compilerOptions, iterations) {
            const fileMap = new Map();
            const inputs = [];
            let uniquePositionCount = 0;
            for (const testPath of testPaths) {
                const positionMap = new Map();
                fileMap.set(testPath, positionMap);
                const sourceFile = ts.createSourceFile(testPath, ts.sys.readFile(testPath), compilerOptions.target || ts.ScriptTarget.Latest);
                // Reverse: more complex examples are usually near the end of test files,
                // so prioritize those.
                const identifiers = getIdentifiers(sourceFile).reverse();
                uniquePositionCount += identifiers.length;
                // Do the loops in this order so that a single child process doesn’t
                // run iterations of the same exact measurement back-to-back to avoid
                // v8 optimizing a significant chunk of the work away.
                for (let i = 0; i < iterations; i++) {
                    for (const identifier of identifiers) {
                        const start = identifier.getStart(sourceFile);
                        if (i === 0) {
                            const lineAndCharacter = ts.getLineAndCharacterOfPosition(sourceFile, start);
                            const benchmark = {
                                fileName: path.relative(definitelyTypedRootPath, testPath),
                                start,
                                end: identifier.getEnd(),
                                identifierText: identifier.getText(sourceFile),
                                line: lineAndCharacter.line + 1,
                                offset: lineAndCharacter.character + 1,
                                completionsDurations: [],
                                quickInfoDurations: [],
                            };
                            positionMap.set(start, benchmark);
                        }
                        inputs.push({
                            fileName: testPath,
                            start,
                            packageDirectory,
                            tsPath,
                        });
                    }
                }
            }
            return {
                inputs,
                uniquePositionCount,
                addMeasurement: (measurement) => {
                    const benchmark = fileMap.get(measurement.fileName).get(measurement.start);
                    benchmark.completionsDurations.push(measurement.completionsDuration);
                    benchmark.quickInfoDurations.push(measurement.quickInfoDuration);
                },
                getAllBenchmarks: () => {
                    return Array.prototype.concat
                        .apply([], Array.from(fileMap.values()).map(map => Array.from(map.values())))
                        .filter((benchmark) => benchmark.completionsDurations.length > 0 ||
                        benchmark.quickInfoDurations.length > 0);
                },
            };
        }
    });
}
exports.measurePerf = measurePerf;
function getLatestTypesVersionForTypeScriptVersion(typesVersions, typeScriptVersion) {
    const tsVersion = versions_1.Semver.parse(typeScriptVersion.replace(/-dev.*$/, ''));
    for (let i = typesVersions.length - 1; i > 0; i--) {
        const typesVersion = versions_1.Semver.parse(typesVersions[i]);
        if (tsVersion.greaterThan(typesVersion)) {
            return typesVersions[i];
        }
    }
}
function updateProgress(text, done, total) {
    const padDigits = total.toString().length - done.toString().length;
    if (done === total) {
        if (process.stdout.clearLine && process.stdout.cursorTo) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`${text} (✔)`);
            process.stdout.write(os.EOL);
        }
    }
    else if (!done) {
        process.stdout.write(`${text}`);
    }
    else if (process.stdout.clearLine && process.stdout.cursorTo) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${text} ${' '.repeat(padDigits)}(${done}/${total} trials)`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVhc3VyZVBlcmYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWVhc3VyZS9tZWFzdXJlUGVyZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLGlEQUF5QztBQUN6QywyQ0FBOEQ7QUFFOUQsK0RBQTBEO0FBQzFELDJDQUEwRTtBQUMxRSxzQ0FBdUg7QUFDdkgsK0RBQTREO0FBQzVELHFGQUFrRjtBQUNsRix3REFBc0c7QUFDdEcsaUZBQThIO0FBQzlILG1GQUE0SztBQWtCNUssU0FBc0IsV0FBVyxDQUFDLEVBQ2hDLFdBQVcsRUFDWCxjQUFjLEVBQ2QsaUJBQWlCLEVBQ2pCLHVCQUF1QixFQUN2QixXQUFXLEVBQ1gsYUFBYSxHQUFHLFFBQVEsRUFDeEIsUUFBUSxFQUNSLFVBQVUsRUFDVixVQUFVLEVBQ1YsTUFBTSxFQUNOLEVBQUUsRUFDRixhQUFhLEVBQ2IsWUFBWSxHQUNPOztRQUNuQixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDbkIsTUFBTSxhQUFhLEdBQUcsd0JBQVEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEdBQUcsRUFBRSx1QkFBdUIsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoSCxNQUFNLFFBQVEsR0FBRyxJQUFJLGdDQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9ELFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLHdCQUFXLENBQUMsSUFB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