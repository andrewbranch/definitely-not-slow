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
const formatDiagnosticsHost_1 = require("./formatDiagnosticsHost");
exports.measureBatchCompilationWorkerFilename = __filename;
if (!module.parent) {
    if (!process.send) {
        throw new Error('Process was not started as a forked process');
    }
    process.on('message', ([message]) => __awaiter(this, void 0, void 0, function* () {
        const ts = yield Promise.resolve().then(() => __importStar(require(message.tsPath)));
        const program = ts.createProgram({ rootNames: message.fileNames, options: message.options });
        const diagnostics = program.getSemanticDiagnostics().filter(diagnostic => {
            return diagnostic.code === 2307; // Cannot find module
        });
        if (diagnostics.length) {
            console.log(ts.formatDiagnostics(diagnostics, formatDiagnosticsHost_1.formatDiagnosticsHost));
            throw new Error('Compilation had errors');
        }
        const result = {
            typeCount: program.getTypeCount(),
            memoryUsage: ts.sys.getMemoryUsage(),
            relationCacheSizes: program.getRelationCacheSizes && program.getRelationCacheSizes(),
        };
        process.send(result);
    }));
    process.on('unhandledRejection', (err) => {
        console.error(err);
        process.exit(1);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVhc3VyZUJhdGNoQ29tcGlsYXRpb25Xb3JrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWVhc3VyZS9tZWFzdXJlQmF0Y2hDb21waWxhdGlvbldvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLG1FQUFnRTtBQUduRCxRQUFBLHFDQUFxQyxHQUFHLFVBQVUsQ0FBQztBQVVoRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtJQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtRQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7S0FDaEU7SUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFPLENBQUMsT0FBTyxDQUE0QyxFQUFFLEVBQUU7UUFDbkYsTUFBTSxFQUFFLEdBQWdDLHdEQUFhLE9BQU8sQ0FBQyxNQUFNLEdBQUMsQ0FBQztRQUNyRSxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN2RSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMscUJBQXFCO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSw2Q0FBcUIsQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsTUFBTSxNQUFNLEdBQThDO1lBQ3hELFNBQVMsRUFBRyxPQUFlLENBQUMsWUFBWSxFQUFFO1lBQzFDLFdBQVcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLGNBQWUsRUFBRTtZQUNyQyxrQkFBa0IsRUFBRyxPQUFlLENBQUMscUJBQXFCLElBQUssT0FBZSxDQUFDLHFCQUFxQixFQUFFO1NBQ3ZHLENBQUM7UUFFRixPQUFPLENBQUMsSUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDO0NBQ0oifQ==