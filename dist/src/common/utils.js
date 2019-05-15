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
const child_process_1 = require("child_process");
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
function run(cwd, cmd) {
    return new Promise((resolve, reject) => {
        child_process_1.exec(cmd, { encoding: 'utf8', cwd }, (error, stdoutUntrimmed, stderrUntrimmed) => {
            const stdout = stdoutUntrimmed.trim();
            const stderr = stderrUntrimmed.trim();
            if (stderr !== "") {
                reject(new Error(stderr));
            }
            else if (error) {
                reject(error);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
exports.run = run;
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
        throw new Error(`Expected a string for input${name ? ` '${name}'` : ''} but received a ${typeof input}`);
    }
    return input;
}
exports.assertString = assertString;
function assertNumber(input, name) {
    if (typeof input !== 'number') {
        throw new Error(`Expected a number for input${name ? ` '${name}'` : ''} but received a ${typeof input}`);
    }
    return input;
}
exports.assertNumber = assertNumber;
function assertBoolean(input, name) {
    if (typeof input !== 'boolean') {
        throw new Error(`Expected a boolean for input${name ? ` '${name}'` : ''} but received a ${typeof input}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLHVDQUF5QjtBQUN6QixtQ0FBb0M7QUFDcEMsaURBQXFDO0FBQ3JDLCtCQUFpQztBQUdqQyx3REFBbUU7QUFDbkUsd0VBQW9FO0FBRXZELFFBQUEsVUFBVSxHQUFHLGdCQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRS9DLFNBQWdCLFlBQVksQ0FBQyxHQUFHLFNBQW1CO0lBQ2pELEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO1FBQ2hDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMzQixPQUFPLFFBQVEsQ0FBQztTQUNqQjtLQUNGO0lBQ0QsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNuSCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0FBQ3pFLENBQUM7QUFSRCxvQ0FRQztBQUVELFNBQWdCLEdBQUcsQ0FBQyxHQUF1QixFQUFFLEdBQVc7SUFDdEQsT0FBTyxJQUFJLE9BQU8sQ0FBcUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDekQsb0JBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxl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