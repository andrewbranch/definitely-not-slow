"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6Qix1Q0FBeUI7QUFDekIsbUNBQW9DO0FBQ3BDLGlEQUFxQztBQUNyQywrQkFBaUM7QUFHcEIsUUFBQSxVQUFVLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFL0MsU0FBZ0IsWUFBWSxDQUFDLEdBQUcsU0FBbUI7SUFDakQsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDaEMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNCLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO0tBQ0Y7SUFDRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ25ILE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDekUsQ0FBQztBQVJELG9DQVFDO0FBRUQsU0FBZ0IsR0FBRyxDQUFDLEdBQXVCLEVBQUUsR0FBVztJQUN0RCxPQUFPLElBQUksT0FBTyxDQUFxQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN6RCxvQkFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxFQUFFO1lBQy9FLE1BQU0sTUFBTSxHQUFH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