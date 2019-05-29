import { Container, Item } from '@azure/cosmos';
import { PackageBenchmarkSummary, TypeScriptComparisonRun } from '../common';
export declare function insertDocument(comparison: TypeScriptComparisonRun, version: number, container: Container): Promise<Item>;
export declare function insertDocument(benchmark: PackageBenchmarkSummary, version: number, container: Container): Promise<Item>;
