import * as path from 'path';
import { minimatch } from 'minimatch';
import { Plugin } from 'vite';
import { BaselineConfig } from './types';

export interface BaselineVitePluginOptions {
  config?: BaselineConfig;
  cwd?: string;
  failOnError?: boolean;
  failOnWarning?: boolean;
  exclude?: string[];
  include?: string[];
  reportPath?: string;
  enableInDev?: boolean;
}

type ScannerRuntime = {
  scanWorkspaceFromSources: (sources: Array<{ filePath: string; content: string }>, options?: { cwd?: string; configuration?: BaselineConfig }) => {
    findings: Array<{ severity: 'error' | 'warning' | 'info'; message: string; relativePath: string; range: { start: { line: number; character: number } } }>;
  };
};

function loadScannerRuntime(): ScannerRuntime {
  return require(path.resolve(__dirname, '../../../out/integrations/workspaceScanner.js')) as ScannerRuntime;
}

function shouldProcessFile(filename: string, include: string[], exclude: string[]): boolean {
  const included = include.some(pattern => minimatch(filename, pattern, { dot: true, matchBase: true }));
  if (!included) {
    return false;
  }

  return !exclude.some(pattern => minimatch(filename, pattern, { dot: true, matchBase: true }));
}

export function baselineVitePlugin(options: BaselineVitePluginOptions = {}): Plugin {
  const {
    config = {},
    cwd = process.cwd(),
    failOnError = true,
    failOnWarning = false,
    exclude = ['node_modules/**'],
    include = ['**/*.{html,htm,css,js,mjs,ts,tsx}'],
    reportPath = 'baseline-report.json',
    enableInDev = false
  } = options;

  const sources = new Map<string, string>();

  return {
    name: 'groundwork-vite-plugin',
    enforce: 'post',
    buildStart() {
      sources.clear();
    },
    transform(code: string, id: string) {
      if (this.meta?.watchMode && !enableInDev) {
        return null;
      }

      if (shouldProcessFile(id, include, exclude)) {
        sources.set(id, code);
      }

      return null;
    },
    generateBundle() {
      const runtime = loadScannerRuntime();
      const report = runtime.scanWorkspaceFromSources(
        Array.from(sources.entries()).map(([filePath, content]) => ({ filePath, content })),
        { cwd, configuration: config }
      );

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
