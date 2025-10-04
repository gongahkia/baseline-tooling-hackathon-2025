"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineWebpackPlugin = void 0;
const webpack_1 = require("webpack");
const BaselineChecker_1 = require("./BaselineChecker");
class BaselineWebpackPlugin {
    constructor(options = {}) {
        this.options = {
            config: options.config || {},
            failOnError: options.failOnError ?? true,
            failOnWarning: options.failOnWarning ?? false,
            exclude: options.exclude || ['node_modules/**'],
            include: options.include || ['**/*.{html,css,js,ts,tsx}'],
            reportPath: options.reportPath || 'baseline-report.json'
        };
        this.checker = new BaselineChecker_1.BaselineChecker(this.options.config);
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('BaselineWebpackPlugin', (compilation) => {
            compilation.hooks.processAssets.tapAsync({
                name: 'BaselineWebpackPlugin',
                stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_ANALYSE
            }, async (assets, callback) => {
                try {
                    await this.processAssets(compilation, assets);
                    callback();
                }
                catch (error) {
                    compilation.errors.push(new Error(`Baseline Webpack Plugin: ${error}`));
                    callback();
                }
            });
        });
    }
    async processAssets(compilation, assets) {
        const issues = [];
        const report = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            issues: [],
            summary: {
                totalFiles: 0,
                totalIssues: 0,
                errors: 0,
                warnings: 0,
                info: 0
            }
        };
        for (const [filename, asset] of Object.entries(assets)) {
            if (this.shouldProcessFile(filename)) {
                const source = asset.source();
                if (typeof source === 'string') {
                    const fileIssues = await this.checker.checkFile(filename, source);
                    issues.push(...fileIssues);
                    report.summary.totalFiles++;
                }
            }
        }
        report.issues = issues;
        report.summary.totalIssues = issues.length;
        report.summary.errors = issues.filter(i => i.severity === 'error').length;
        report.summary.warnings = issues.filter(i => i.severity === 'warning').length;
        report.summary.info = issues.filter(i => i.severity === 'info').length;
        // Add report to compilation assets
        compilation.emitAsset(this.options.reportPath, {
            source: () => JSON.stringify(report, null, 2),
            size: () => JSON.stringify(report, null, 2).length
        });
        // Add issues to compilation
        for (const issue of issues) {
            const error = new Error(`Baseline: ${issue.message}`);
            error.file = issue.file;
            error.line = issue.line;
            error.column = issue.column;
            if (issue.severity === 'error' && this.options.failOnError) {
                compilation.errors.push(error);
            }
            else if (issue.severity === 'warning' && this.options.failOnWarning) {
                compilation.warnings.push(error);
            }
        }
        // Log summary
        console.log(`\n📊 Baseline Compatibility Report:`);
        console.log(`   Files processed: ${report.summary.totalFiles}`);
        console.log(`   Total issues: ${report.summary.totalIssues}`);
        console.log(`   Errors: ${report.summary.errors}`);
        console.log(`   Warnings: ${report.summary.warnings}`);
        console.log(`   Info: ${report.summary.info}`);
        console.log(`   Report saved to: ${this.options.reportPath}\n`);
    }
    shouldProcessFile(filename) {
        // Check include patterns
        const matchesInclude = this.options.include.some(pattern => this.matchPattern(filename, pattern));
        if (!matchesInclude) {
            return false;
        }
        // Check exclude patterns
        const matchesExclude = this.options.exclude.some(pattern => this.matchPattern(filename, pattern));
        return !matchesExclude;
    }
    matchPattern(filename, pattern) {
        // Simple glob pattern matching
        const regex = new RegExp(pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '.'));
        return regex.test(filename);
    }
}
exports.BaselineWebpackPlugin = BaselineWebpackPlugin;
//# sourceMappingURL=index.js.map