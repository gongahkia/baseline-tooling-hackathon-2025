"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baselineVitePlugin = void 0;
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
function baselineVitePlugin(options = {}) {
    const { config = {}, cwd = process.cwd(), failOnError = true, failOnWarning = false, exclude = ['node_modules/**'], include = ['**/*.{html,htm,css,js,mjs,ts,tsx}'], reportPath = 'baseline-report.json', enableInDev = false } = options;
    const sources = new Map();
    return {
        name: 'groundwork-vite-plugin',
        enforce: 'post',
        buildStart() {
            sources.clear();
        },
        transform(code, id) {
            var _a;
            if (((_a = this.meta) === null || _a === void 0 ? void 0 : _a.watchMode) && !enableInDev) {
                return null;
            }
            if (shouldProcessFile(id, include, exclude)) {
                sources.set(id, code);
            }
            return null;
        },
        generateBundle() {
            const runtime = loadScannerRuntime();
            const report = runtime.scanWorkspaceFromSources(Array.from(sources.entries()).map(([filePath, content]) => ({ filePath, content })), { cwd, configuration: config });
            this.emitFile({
                type: 'asset',
                fileName: reportPath,
                source: JSON.stringify(report, null, 2)
            });
            for (const finding of report.findings) {
                const location = `${finding.relativePath}:${finding.range.start.line + 1}:${finding.range.start.character + 1}`;
                const message = `GroundWork: ${location} ${finding.message}`;
                if (finding.severity === 'error' && failOnError) {
                    this.error(message);
                }
                if (finding.severity === 'warning' && failOnWarning) {
                    this.warn(message);
                }
            }
        }
    };
}
exports.baselineVitePlugin = baselineVitePlugin;
