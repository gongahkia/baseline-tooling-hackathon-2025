"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineWebpackPlugin = void 0;
const path = require("path");
const minimatch_1 = require("minimatch");
function loadScannerRuntime() {
    return require(path.resolve(__dirname, '../../../out/integrations/workspaceScanner.js'));
}
function shouldProcessFile(filename, include, exclude) {
    const included = include.some(pattern => (0, minimatch_1.minimatch)(filename, pattern, { dot: true, matchBase: true }));
    if (!included) {
        return false;
    }
    return !exclude.some(pattern => (0, minimatch_1.minimatch)(filename, pattern, { dot: true, matchBase: true }));
}
class BaselineWebpackPlugin {
    constructor(options = {}) {
        this.options = {
            config: options.config !== null && options.config !== void 0 ? options.config : {},
            cwd: options.cwd !== null && options.cwd !== void 0 ? options.cwd : process.cwd(),
            failOnError: options.failOnError !== null && options.failOnError !== void 0 ? options.failOnError : true,
            failOnWarning: options.failOnWarning !== null && options.failOnWarning !== void 0 ? options.failOnWarning : false,
            exclude: options.exclude !== null && options.exclude !== void 0 ? options.exclude : ['node_modules/**'],
            include: options.include !== null && options.include !== void 0 ? options.include : ['**/*.{html,htm,css,js,mjs,ts,tsx}'],
            reportPath: options.reportPath !== null && options.reportPath !== void 0 ? options.reportPath : 'baseline-report.json'
        };
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('GroundWorkWebpackPlugin', (compilation) => {
            var _a, _b;
            compilation.hooks.processAssets.tap({
                name: 'GroundWorkWebpackPlugin',
                stage: ((_b = (_a = compiler.webpack) === null || _a === void 0 ? void 0 : _a.Compilation) === null || _b === void 0 ? void 0 : _b.PROCESS_ASSETS_STAGE_ANALYSE) ?? 4000
            }, () => {
                const runtime = loadScannerRuntime();
                const sources = Object.entries(compilation.assets)
                    .filter(([filename]) => shouldProcessFile(filename, this.options.include, this.options.exclude))
                    .map(([filename, asset]) => ({
                    filePath: path.resolve(this.options.cwd, filename),
                    content: String(asset.source())
                }));
                const report = runtime.scanWorkspaceFromSources(sources, {
                    cwd: this.options.cwd,
                    configuration: this.options.config
                });
                compilation.emitAsset(this.options.reportPath, {
                    source: () => JSON.stringify(report, null, 2),
                    size: () => JSON.stringify(report, null, 2).length
                });
                for (const finding of report.findings) {
                    const location = `${finding.relativePath}:${finding.range.start.line + 1}:${finding.range.start.character + 1}`;
                    const error = new Error(`GroundWork: ${location} ${finding.message}`);
                    if (finding.severity === 'error' && this.options.failOnError) {
                        compilation.errors.push(error);
                    }
                    if (finding.severity === 'warning' && this.options.failOnWarning) {
                        compilation.warnings.push(error);
                    }
                }
            });
        });
    }
}
exports.BaselineWebpackPlugin = BaselineWebpackPlugin;
