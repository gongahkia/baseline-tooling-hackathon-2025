"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baselineVitePlugin = void 0;
const BaselineChecker_1 = require("./BaselineChecker");
function baselineVitePlugin(options = {}) {
    const { config = {}, failOnError = true, failOnWarning = false, exclude = ['node_modules/**'], include = ['**/*.{html,css,js,ts,tsx}'], reportPath = 'baseline-report.json', enableInDev = false } = options;
    const checker = new BaselineChecker_1.BaselineChecker(config);
    let issues = [];
    return {
        name: 'baseline-vite-plugin',
        enforce: 'post',
        buildStart() {
            issues = [];
        },
        async transform(code, id) {
            // Skip in development mode unless explicitly enabled
            if (this.meta?.mode === 'development' && !enableInDev) {
                return null;
            }
            // Check if file should be processed
            if (!shouldProcessFile(id, include, exclude)) {
                return null;
            }
            try {
                const fileIssues = await checker.checkFile(id, code);
                issues.push(...fileIssues);
            }
            catch (error) {
                this.error(`Baseline Vite Plugin: ${error}`);
            }
            return null;
        },
        async generateBundle(options, bundle) {
            // Generate report
            const report = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                issues,
                summary: {
                    totalFiles: new Set(issues.map(i => i.file)).size,
                    totalIssues: issues.length,
                    errors: issues.filter(i => i.severity === 'error').length,
                    warnings: issues.filter(i => i.severity === 'warning').length,
                    info: issues.filter(i => i.severity === 'info').length
                }
            };
            // Add report to bundle
            this.emitFile({
                type: 'asset',
                fileName: reportPath,
                source: JSON.stringify(report, null, 2)
            });
            // Log summary
            console.log(`\n📊 Baseline Compatibility Report:`);
            console.log(`   Files processed: ${report.summary.totalFiles}`);
            console.log(`   Total issues: ${report.summary.totalIssues}`);
            console.log(`   Errors: ${report.summary.errors}`);
            console.log(`   Warnings: ${report.summary.warnings}`);
            console.log(`   Info: ${report.summary.info}`);
            console.log(`   Report saved to: ${reportPath}\n`);
            // Handle errors and warnings
            for (const issue of issues) {
                const error = new Error(`Baseline: ${issue.message}`);
                error.file = issue.file;
                error.line = issue.line;
                error.column = issue.column;
                if (issue.severity === 'error' && failOnError) {
                    this.error(error);
                }
                else if (issue.severity === 'warning' && failOnWarning) {
                    this.warn(error);
                }
            }
        }
    };
}
exports.baselineVitePlugin = baselineVitePlugin;
function shouldProcessFile(filename, include, exclude) {
    // Check include patterns
    const matchesInclude = include.some(pattern => matchPattern(filename, pattern));
    if (!matchesInclude) {
        return false;
    }
    // Check exclude patterns
    const matchesExclude = exclude.some(pattern => matchPattern(filename, pattern));
    return !matchesExclude;
}
function matchPattern(filename, pattern) {
    // Simple glob pattern matching
    const regex = new RegExp(pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.'));
    return regex.test(filename);
}
//# sourceMappingURL=index.js.map