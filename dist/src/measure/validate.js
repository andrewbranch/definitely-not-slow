"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateBenchmark(benchmark, iterations) {
    return benchmark.languageServiceBenchmarks.every(languageServiceBenchmark => {
        return languageServiceBenchmark.completionsDurations.length === iterations
            && languageServiceBenchmark.quickInfoDurations.length === iterations;
    });
}
exports.validateBenchmark = validateBenchmark;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWVhc3VyZS92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLFNBQWdCLGlCQUFpQixDQUFDLFNBQTJCLEVBQUUsVUFBa0I7SUFDL0UsT0FBTyxTQUFTLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLEVBQUU7UUFDMUUsT0FBTyx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssVUFBVTtlQUNyRSx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDO0lBQ3pFLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUxELDhDQUtDIn0=