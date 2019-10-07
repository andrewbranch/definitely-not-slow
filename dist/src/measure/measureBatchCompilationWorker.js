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
const formatDiagnosticsHost_1 = require("./formatDiagnosticsHost");
exports.measureBatchCompilationWorkerFilename = __filename;
if (!module.parent) {
    if (!process.send) {
        throw new Error('Process was not started as a forked process');
    }
    process.on('message', ([message]) => __awaiter(void 0, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVhc3VyZUJhdGNoQ29tcGlsYXRpb25Xb3JrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWVhc3VyZS9tZWFzdXJlQmF0Y2hDb21waWxhdGlvbldvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxtRUFBZ0U7QUFHbkQsUUFBQSxxQ0FBcUMsR0FBRyxVQUFVLENBQUM7QUFVaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7SUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0tBQ2hFO0lBRUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBTyxDQUFDLE9BQU8sQ0FBNEMsRUFBRSxFQUFFO1FBQ25GLE1BQU0sRUFBRSxHQUFnQyx3REFBYSxPQUFPLENBQUMsTUFBTSxHQUFDLENBQUM7UUFDckUsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM3RixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDdkUsT0FBTyxVQUFVLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLHFCQUFxQjtRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsNkNBQXFCLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztTQUMzQztRQUVELE1BQU0sTUFBTSxHQUE4QztZQUN4RCxTQUFTLEVBQUcsT0FBZSxDQUFDLFlBQVksRUFBRTtZQUMxQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxjQUFlLEVBQUU7WUFDckMsa0JBQWtCLEVBQUcsT0FBZSxDQUFDLHFCQUFxQixJQUFLLE9BQWUsQ0FBQyxxQkFBcUIsRUFBRTtTQUN2RyxDQUFDO1FBRUYsT0FBTyxDQUFDLElBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ3ZDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQztDQUNKIn0=