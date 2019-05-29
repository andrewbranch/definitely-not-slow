"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
const fs = __importStar(require("fs"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const util_2 = require("types-publisher/bin/util/util");
const test_runner_1 = require("types-publisher/bin/tester/test-runner");
const child_process_1 = require("child_process");
exports.pathExists = util_1.promisify(fs.exists);
function ensureExists(...pathNames) {
    for (const pathName of pathNames) {
        if (fs.existsSync(pathName)) {
            return pathName;
        }
    }
    const pathNamesPrint = pathNames.length > 1 ? '\n' + pathNames.map(s => ` - ${s}`).join('\n') : `'${pathNames[0]}`;
    throw new Error(`File or directory does not exist: ${pathNamesPrint}`);
}
exports.ensureExists = ensureExists;
function deserializeArgs(args) {
    const obj = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const nextArg = args[i + 1];
            if (!nextArg || nextArg.startsWith('--')) {
                obj[arg.slice(2)] = true;
            }
            else {
                const numberArg = parseFloat(nextArg);
                const boolArg = nextArg === 'true' ? true : nextArg === 'false' ? false : undefined;
                obj[arg.slice(2)] = boolArg || (isNaN(numberArg) ? nextArg : numberArg);
                i++;
            }
        }
    }
    return obj;
}
exports.deserializeArgs = deserializeArgs;
function serializeArgs(args) {
    return Object.keys(args).map(arg => `--${arg}` + (args[arg] === true ? '' : args[arg].toString())).join(' ');
}
exports.serializeArgs = serializeArgs;
function compact(arr) {
    return arr.filter((elem) => elem != undefined);
}
exports.compact = compact;
function assertString(input, name) {
    if (typeof input !== 'string') {
        throw new Error(`Expected a string for input${name ? ` '${name}'` : ''} but received ${typeof input}`);
    }
    return input;
}
exports.assertString = assertString;
function assertNumber(input, name) {
    if (typeof input !== 'number') {
        throw new Error(`Expected a number for input${name ? ` '${name}'` : ''} but received ${typeof input}`);
    }
    return input;
}
exports.assertNumber = assertNumber;
function assertBoolean(input, name) {
    if (typeof input !== 'boolean') {
        throw new Error(`Expected a boolean for input${name ? ` '${name}'` : ''} but received ${typeof input}`);
    }
    return input;
}
exports.assertBoolean = assertBoolean;
function assertDefined(input, name) {
    if (input == undefined) {
        throw new Error(`Expected ${name ? ` '${name}'` : ''} to be defined`);
    }
    return input;
}
exports.assertDefined = assertDefined;
function withDefault(input, defaultValue) {
    return typeof input === 'undefined' ? defaultValue : input;
}
exports.withDefault = withDefault;
function getSystemInfo() {
    const info = {
        cpus: os.cpus().map((_a) => {
            var { times } = _a, cpu = __rest(_a, ["times"]);
            return cpu;
        }),
        arch: os.arch(),
        platform: os.platform(),
        release: os.release(),
        totalmem: os.totalmem()
    };
    return Object.assign({}, info, { hash: crypto_1.createHash('md5').update(JSON.stringify(info)).digest('hex') });
}
exports.getSystemInfo = getSystemInfo;
function getChangedPackages({ diffFrom = 'HEAD', diffTo, definitelyTypedPath }) {
    return __awaiter(this, void 0, void 0, function* () {
        const diff = yield util_2.execAndThrowErrors(`git diff --name-status ${diffFrom} ${diffTo}`, definitelyTypedPath);
        if (!diff) {
            return undefined;
        }
        const changes = diff.split('\n').map(line => {
            const [status, file] = line.split(/\s+/, 2);
            return { status: status.trim(), file: file.trim() };
        });
        return test_runner_1.gitChanges(changes);
    });
}
exports.getChangedPackages = getChangedPackages;
function packageIdsAreEqual(a, b) {
    return typeof b === 'undefined' ? equalsA : equalsA(b);
    function equalsA(b) {
        return a.name === b.name && a.majorVersion === b.majorVersion;
    }
}
exports.packageIdsAreEqual = packageIdsAreEqual;
function getPercentDiff(actual, expected) {
    return (actual - expected) / expected;
}
exports.getPercentDiff = getPercentDiff;
function isWithin(actual, expected, tolerance) {
    return Math.abs(getPercentDiff(actual, expected)) <= tolerance;
}
exports.isWithin = isWithin;
function systemsAreCloseEnough(a, b, cpuSpeedTolerance = 0.1) {
    if (a.hash === b.hash) {
        return true;
    }
    return a.arch === b.arch
        && a.platform === b.platform
        && a.cpus.length === b.cpus.length
        && a.cpus.every((cpu, index) => {
            const otherCPU = b.cpus[index];
            return cpu.model === otherCPU.model
                && isWithin(cpu.speed, otherCPU.speed, cpuSpeedTolerance);
        });
}
exports.systemsAreCloseEnough = systemsAreCloseEnough;
function createDocument(body, version) {
    return {
        version,
        createdAt: new Date(),
        system: getSystemInfo(),
        body,
    };
}
exports.createDocument = createDocument;
function parsePackageKey(key) {
    const [name, version] = key.split('/');
    return {
        name,
        majorVersion: parseInt(version.replace(/^v/, '')) || '*',
    };
}
exports.parsePackageKey = parsePackageKey;
function toPackageKey(packageIdOrName, majorVersion) {
    const { name, majorVersion: version } = typeof packageIdOrName === 'string' ? { name: packageIdOrName, majorVersion } : packageIdOrName;
    return `${name}/v${version}`;
}
exports.toPackageKey = toPackageKey;
function deserializeSummary(doc) {
    return Object.assign({}, doc, { createdAt: new Date(doc.createdAt), body: Object.assign({}, doc.body, { batchRunStart: new Date(doc.body.batchRunStart) }) });
}
exports.deserializeSummary = deserializeSummary;
function getSourceVersion(cwd) {
    return child_process_1.execSync('git rev-parse HEAD', { cwd, encoding: 'utf8' }).trim();
}
exports.getSourceVersion = getSourceVersion;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsdUNBQXlCO0FBQ3pCLG1DQUFvQztBQUNwQywrQkFBaUM7QUFHakMsd0RBQW1FO0FBQ25FLHdFQUFvRTtBQUNwRSxpREFBeUM7QUFFNUIsUUFBQSxVQUFVLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFL0MsU0FBZ0IsWUFBWSxDQUFDLEdBQUcsU0FBbUI7SUFDakQsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDaEMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNCLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO0tBQ0Y7SUFDRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ25ILE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDekUsQ0FBQztBQVJELG9DQVFDO0FBSUQsU0FBZ0IsZUFBZSxDQUFDLElBQWM7SUFDNUMsTUFBTSxHQUFHLEdBQVMsRUFBRSxDQUFDO0lBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztR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