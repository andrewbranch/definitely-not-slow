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
                obj[arg.slice(2)] = typeof boolArg === 'boolean' ? boolArg : (isNaN(numberArg) ? nextArg : numberArg);
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
    return Object.assign(Object.assign({}, info), { hash: crypto_2.createHash('md5').update(JSON.stringify(info)).digest('hex') });
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
    return Object.assign(Object.assign({}, doc), { createdAt: new Date(doc.createdAt), body: Object.assign(Object.assign({}, doc.body), { batchRunStart: new Date(doc.body.batchRunStart) }) });
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
function not(fn) {
    return (...args) => !fn(...args);
}
exports.not = not;
function findLast(arr, predicate) {
    for (let i = arr.length - 1; i >= 0; i--) {
        const element = arr[i];
        if (predicate(element)) {
            return element;
        }
    }
}
exports.findLast = findLast;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLHVDQUF5QjtBQUN6QixtQ0FBcUM7QUFDckMsbUNBQW9DO0FBQ3BDLCtCQUFpQztBQUdqQyx3REFBbUU7QUFDbkUsd0VBQW9FO0FBQ3BFLGlEQUF5QztBQUU1QixRQUFBLFVBQVUsR0FBRyxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUUvQyxTQUFnQixZQUFZLENBQUMsR0FBRyxTQUFtQjtJQUNqRCxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtRQUNoQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDM0IsT0FBTyxRQUFRLENBQUM7U0FDakI7S0FDRjtJQUNELE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDbkgsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsY0FBYyxFQUFFLENBQUMsQ0FBQztBQUN6RSxDQUFDO0FBUkQsb0NBUUM7QUFJRCxTQUFnQixlQUFlLENBQUMsSUFBYztJQUM1QyxNQUFNLEdBQUcsR0FBUyxFQUFFLENBQUM7SUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENB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