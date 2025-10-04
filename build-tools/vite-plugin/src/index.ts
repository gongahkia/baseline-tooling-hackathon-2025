import { Plugin } from 'vite';
import { BaselineChecker } from './BaselineChecker';
import { BaselineConfig } from './types';

export interface BaselineVitePluginOptions {
  config?: BaselineConfig;
  failOnError?: boolean;
  failOnWarning?: boolean;
  exclude?: string[];
  include?: string[];
  reportPath?: string;
  enableInDev?: boolean;
}

export function baselineVitePlugin(options: BaselineVitePluginOptions = {}): Plugin {
  const {
    config = {},
    failOnError = true,
    failOnWarning = false,
    exclude = ['node_modules/**'],
    include = ['**/*.{html,css,js,ts,tsx}'],
    reportPath = 'baseline-report.json',
    enableInDev = false
  } = options;

  const checker = new BaselineChecker(config);
  let issues: any[] = [];

  return {
    name: 'baseline-vite-plugin',
    enforce: 'post',
    
    buildStart() {
      issues = [];
    },

    async transform(code: string, id: string) {
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
      } catch (error) {
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
        (error as any).file = issue.file;
        (error as any).line = issue.line;
        (error as any).column = issue.column;

        if (issue.severity === 'error' && failOnError) {
          this.error(error);
        } else if (issue.severity === 'warning' && failOnWarning) {
          this.warn(error);
        }
      }
    }
  };
}

function shouldProcessFile(filename: string, include: string[], exclude: string[]): boolean {
  // Check include patterns
  const matchesInclude = include.some(pattern => matchPattern(filename, pattern));
  if (!matchesInclude) {
    return false;
  }

  // Check exclude patterns
  const matchesExclude = exclude.some(pattern => matchPattern(filename, pattern));
  return !matchesExclude;
}

function matchPattern(filename: string, pattern: string): boolean {
  // Simple glob pattern matching
  const regex = new RegExp(
    pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
  );
  return regex.test(filename);
}
