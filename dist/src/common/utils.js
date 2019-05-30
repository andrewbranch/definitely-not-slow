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
const crypto_2 = require("crypto");
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
        totalmem: os.totalmem(),
        nodeVersion: process.version,
    };
    return Object.assign({}, info, { hash: crypto_2.createHash('md5').update(JSON.stringify(info)).digest('hex') });
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
        && a.nodeVersion === b.nodeVersion
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
function shuffle(array) {
    const output = array.slice();
    let counter = output.length;
    while (counter > 0) {
        const index = Math.floor(crypto_1.randomBytes(1).readUInt8(0) / Math.pow(2, 8) * counter);
        counter--;
        const elem = output[counter];
        output[counter] = output[index];
        output[index] = elem;
    }
    return output;
}
exports.shuffle = shuffle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsdUNBQXlCO0FBQ3pCLG1DQUFxQztBQUNyQyxtQ0FBb0M7QUFDcEMsK0JBQWlDO0FBR2pDLHdEQUFtRTtBQUNuRSx3RUFBb0U7QUFDcEUsaURBQXlDO0FBRTVCLFFBQUEsVUFBVSxHQUFHLGdCQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRS9DLFNBQWdCLFlBQVksQ0FBQyxHQUFHLFNBQW1CO0lBQ2pELEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO1FBQ2hDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMzQixPQUFPLFFBQVEsQ0FBQztTQUNqQjtLQUNGO0lBQ0QsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNuSCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0FBQ3pFLENBQUM7QUFSRCxvQ0FRQztBQUlELFNBQWdCLGVBQWUsQ0FBQyxJQUFjO0lBQzVDLE1BQU0sR0FBRyxHQUFTLEVBQUUsQ0FBQztJQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FB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