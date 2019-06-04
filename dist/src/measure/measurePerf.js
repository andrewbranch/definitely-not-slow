"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
        const measurement = Object.assign({}, batchCompilationResult, { benchmarkDuration: duration, sourceVersion,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVhc3VyZVBlcmYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWVhc3VyZS9tZWFzdXJlUGVyZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsaURBQXlDO0FBQ3pDLDJDQUE4RDtBQUk5RCwrREFBMEQ7QUFDMUQsMkNBQTBFO0FBQzFFLHNDQUF1SDtBQUN2SCwrREFBNEQ7QUFDNUQscUZBQWtGO0FBRWxGLHdEQUFzRztBQUN0RyxpRkFBOEg7QUFDOUgsbUZBQTRLO0FBa0I1SyxTQUFzQixXQUFXLENBQUMsRUFDaEMsV0FBVyxFQUNYLGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsdUJBQXVCLEVBQ3ZCLFdBQVcsRUFDWCxhQUFhLEdBQUcsUUFBUSxFQUN4QixRQUFRLEVBQ1IsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04sRUFBRSxFQUNGLGFBQWEsRUFDYixZQUFZLEdBQ087O1FBQ25CLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNuQixNQUFNLGFBQWEsR0FBRyx3QkFBUSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsR0FBRyxFQUFFLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hILE1BQU0sUUFBUSxHQUFHLElBQUksZ0NBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDOUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0QsUUFBUSxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUMsd0JBQVcsQ0FBQyxJQUFJ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