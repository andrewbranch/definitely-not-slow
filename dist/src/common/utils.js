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
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
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
                obj[arg.slice(2)] = isNaN(numberArg) ? nextArg : numberArg;
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
    return (expected - actual) / expected;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLHVDQUF5QjtBQUN6QixtQ0FBb0M7QUFDcEMsK0JBQWlDO0FBR2pDLHdEQUFtRTtBQUNuRSx3RUFBb0U7QUFFdkQsUUFBQSxVQUFVLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFL0MsU0FBZ0IsWUFBWSxDQUFDLEdBQUcsU0FBbUI7SUFDakQsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDaEMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNCLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO0tBQ0Y7SUFDRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ25ILE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDekUsQ0FBQztBQVJELG9DQVFDO0FBSUQsU0FBZ0IsZUFBZSxDQUFDLElBQWM7SUFDNUMsTUFBTSxHQUFHLEdBQVMsRUFBRSxDQUFDO0lBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLEdBQUcs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