var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var esm_exports = {};
__export(esm_exports, {
  execa: () => execa,
  execaCommand: () => execaCommand,
  execaCommandSync: () => execaCommandSync,
  execaNode: () => execaNode,
  execaSync: () => execaSync
});
module.exports = __toCommonJS(esm_exports);
var import_node_buffer = require("node:buffer");
var import_node_path = __toESM(require("node:path"));
var import_node_child_process = __toESM(require("node:child_process"));
var import_node_process = __toESM(require("node:process"));
var import_cross_spawn = __toESM(require("cross-spawn"));
var import_strip_final_newline = __toESM(require("@esm2cjs/strip-final-newline"));
var import_npm_run_path = require("@esm2cjs/npm-run-path");
var import_onetime = __toESM(require("@esm2cjs/onetime"));
var import_error = require("./lib/error.js");
var import_stdio = require("./lib/stdio.js");
var import_kill = require("./lib/kill.js");
var import_stream = require("./lib/stream.js");
var import_promise = require("./lib/promise.js");
var import_command = require("./lib/command.js");
const DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
const getEnv = ({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
  const env = extendEnv ? { ...import_node_process.default.env, ...envOption } : envOption;
  if (preferLocal) {
    return (0, import_npm_run_path.npmRunPathEnv)({ env, cwd: localDir, execPath });
  }
  return env;
};
const handleArguments = (file, args, options = {}) => {
  const parsed = import_cross_spawn.default._parse(file, args, options);
  file = parsed.command;
  args = parsed.args;
  options = parsed.options;
  options = {
    maxBuffer: DEFAULT_MAX_BUFFER,
    buffer: true,
    stripFinalNewline: true,
    extendEnv: true,
    preferLocal: false,
    localDir: options.cwd || import_node_process.default.cwd(),
    execPath: import_node_process.default.execPath,
    encoding: "utf8",
    reject: true,
    cleanup: true,
    all: false,
    windowsHide: true,
    ...options
  };
  options.env = getEnv(options);
  options.stdio = (0, import_stdio.normalizeStdio)(options);
  if (import_node_process.default.platform === "win32" && import_node_path.default.basename(file, ".exe") === "cmd") {
    args.unshift("/q");
  }
  return { file, args, options, parsed };
};
const handleOutput = (options, value, error) => {
  if (typeof value !== "string" && !import_node_buffer.Buffer.isBuffer(value)) {
    return error === void 0 ? void 0 : "";
  }
  if (options.stripFinalNewline) {
    return (0, import_strip_final_newline.default)(value);
  }
  return value;
};
function execa(file, args, options) {
  const parsed = handleArguments(file, args, options);
  const command = (0, import_command.joinCommand)(file, args);
  const escapedCommand = (0, import_command.getEscapedCommand)(file, args);
  (0, import_kill.validateTimeout)(parsed.options);
  let spawned;
  try {
    spawned = import_node_child_process.default.spawn(parsed.file, parsed.args, parsed.options);
  } catch (error) {
    const dummySpawned = new import_node_child_process.default.ChildProcess();
    const errorPromise = Promise.reject((0, import_error.makeError)({
      error,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    }));
    return (0, import_promise.mergePromise)(dummySpawned, errorPromise);
  }
  const spawnedPromise = (0, import_promise.getSpawnedPromise)(spawned);
  const timedPromise = (0, import_kill.setupTimeout)(spawned, parsed.options, spawnedPromise);
  const processDone = (0, import_kill.setExitHandler)(spawned, parsed.options, timedPromise);
  const context = { isCanceled: false };
  spawned.kill = import_kill.spawnedKill.bind(null, spawned.kill.bind(spawned));
  spawned.cancel = import_kill.spawnedCancel.bind(null, spawned, context);
  const handlePromise = async () => {
    const [{ error, exitCode, signal, timedOut }, stdoutResult, stderrResult, allResult] = await (0, import_stream.getSpawnedResult)(spawned, parsed.options, processDone);
    const stdout = handleOutput(parsed.options, stdoutResult);
    const stderr = handleOutput(parsed.options, stderrResult);
    const all = handleOutput(parsed.options, allResult);
    if (error || exitCode !== 0 || signal !== null) {
      const returnedError = (0, import_error.makeError)({
        error,
        exitCode,
        signal,
        stdout,
        stderr,
        all,
        command,
        escapedCommand,
        parsed,
        timedOut,
        isCanceled: context.isCanceled || (parsed.options.signal ? parsed.options.signal.aborted : false),
        killed: spawned.killed
      });
      if (!parsed.options.reject) {
        return returnedError;
      }
      throw returnedError;
    }
    return {
      command,
      escapedCommand,
      exitCode: 0,
      stdout,
      stderr,
      all,
      failed: false,
      timedOut: false,
      isCanceled: false,
      killed: false
    };
  };
  const handlePromiseOnce = (0, import_onetime.default)(handlePromise);
  (0, import_stream.handleInput)(spawned, parsed.options.input);
  spawned.all = (0, import_stream.makeAllStream)(spawned, parsed.options);
  return (0, import_promise.mergePromise)(spawned, handlePromiseOnce);
}
function execaSync(file, args, options) {
  const parsed = handleArguments(file, args, options);
  const command = (0, import_command.joinCommand)(file, args);
  const escapedCommand = (0, import_command.getEscapedCommand)(file, args);
  (0, import_stream.validateInputSync)(parsed.options);
  let result;
  try {
    result = import_node_child_process.default.spawnSync(parsed.file, parsed.args, parsed.options);
  } catch (error) {
    throw (0, import_error.makeError)({
      error,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    });
  }
  const stdout = handleOutput(parsed.options, result.stdout, result.error);
  const stderr = handleOutput(parsed.options, result.stderr, result.error);
  if (result.error || result.status !== 0 || result.signal !== null) {
    const error = (0, import_error.makeError)({
      stdout,
      stderr,
      error: result.error,
      signal: result.signal,
      exitCode: result.status,
      command,
      escapedCommand,
      parsed,
      timedOut: result.error && result.error.code === "ETIMEDOUT",
      isCanceled: false,
      killed: result.signal !== null
    });
    if (!parsed.options.reject) {
      return error;
    }
    throw error;
  }
  return {
    command,
    escapedCommand,
    exitCode: 0,
    stdout,
    stderr,
    failed: false,
    timedOut: false,
    isCanceled: false,
    killed: false
  };
}
function execaCommand(command, options) {
  const [file, ...args] = (0, import_command.parseCommand)(command);
  return execa(file, args, options);
}
function execaCommandSync(command, options) {
  const [file, ...args] = (0, import_command.parseCommand)(command);
  return execaSync(file, args, options);
}
function execaNode(scriptPath, args, options = {}) {
  if (args && !Array.isArray(args) && typeof args === "object") {
    options = args;
    args = [];
  }
  const stdio = (0, import_stdio.normalizeStdioNode)(options);
  const defaultExecArgv = import_node_process.default.execArgv.filter((arg) => !arg.startsWith("--inspect"));
  const {
    nodePath = import_node_process.default.execPath,
    nodeOptions = defaultExecArgv
  } = options;
  return execa(
    nodePath,
    [
      ...nodeOptions,
      scriptPath,
      ...Array.isArray(args) ? args : []
    ],
    {
      ...options,
      stdin: void 0,
      stdout: void 0,
      stderr: void 0,
      stdio,
      shell: false
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  execa,
  execaCommand,
  execaCommandSync,
  execaNode,
  execaSync
});
//# sourceMappingURL=index.js.map
