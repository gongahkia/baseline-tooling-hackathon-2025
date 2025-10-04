import { Compiler, Compilation } from 'webpack';
import { BaselineChecker } from './BaselineChecker';
import { BaselineConfig } from './types';

export interface BaselineWebpackPluginOptions {
  config?: BaselineConfig;
  failOnError?: boolean;
  failOnWarning?: boolean;
  exclude?: string[];
  include?: string[];
  reportPath?: string;
}

export class BaselineWebpackPlugin {
  private options: Required<BaselineWebpackPluginOptions>;
  private checker: BaselineChecker;

  constructor(options: BaselineWebpackPluginOptions = {}) {
    this.options = {
      config: options.config || {},
      failOnError: options.failOnError ?? true,
      failOnWarning: options.failOnWarning ?? false,
      exclude: options.exclude || ['node_modules/**'],
      include: options.include || ['**/*.{html,css,js,ts,tsx}'],
      reportPath: options.reportPath || 'baseline-report.json'
    };
    
    this.checker = new BaselineChecker(this.options.config);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap('BaselineWebpackPlugin', (compilation: Compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'BaselineWebpackPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE
        },
        async (assets, callback) => {
          try {
            await this.processAssets(compilation, assets);
            callback();
          } catch (error) {
            compilation.errors.push(new Error(`Baseline Webpack Plugin: ${error}`));
            callback();
          }
        }
      );
    });
  }

  private async processAssets(compilation: Compilation, assets: Record<string, any>): Promise<void> {
    const issues: any[] = [];
    const report: any = {
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
    compilation.emitAsset(
      this.options.reportPath,
      {
        source: () => JSON.stringify(report, null, 2),
        size: () => JSON.stringify(report, null, 2).length
      }
    );

    // Add issues to compilation
    for (const issue of issues) {
      const error = new Error(`Baseline: ${issue.message}`);
      (error as any).file = issue.file;
      (error as any).line = issue.line;
      (error as any).column = issue.column;

      if (issue.severity === 'error' && this.options.failOnError) {
        compilation.errors.push(error);
      } else if (issue.severity === 'warning' && this.options.failOnWarning) {
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

  private shouldProcessFile(filename: string): boolean {
    // Check include patterns
    const matchesInclude = this.options.include.some(pattern => 
      this.matchPattern(filename, pattern)
    );

    if (!matchesInclude) {
      return false;
    }

    // Check exclude patterns
    const matchesExclude = this.options.exclude.some(pattern => 
      this.matchPattern(filename, pattern)
    );

    return !matchesExclude;
  }

  private matchPattern(filename: string, pattern: string): boolean {
    // Simple glob pattern matching
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.')
    );
    return regex.test(filename);
  }
}
