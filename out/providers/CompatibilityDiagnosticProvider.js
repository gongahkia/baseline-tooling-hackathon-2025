"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibilityDiagnosticProvider = void 0;
const vscode = __importStar(require("vscode"));
class CompatibilityDiagnosticProvider {
    constructor(dataService) {
        this.dataService = dataService;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('baseline');
    }
    provideDiagnostics(document, token) {
        const diagnostics = [];
        const text = document.getText();
        const language = document.languageId;
        // Parse different file types
        switch (language) {
            case 'html':
                diagnostics.push(...this.parseHTML(text, document));
                break;
            case 'css':
                diagnostics.push(...this.parseCSS(text, document));
                break;
            case 'javascript':
            case 'typescript':
                diagnostics.push(...this.parseJavaScript(text, document));
                break;
        }
        return diagnostics;
    }
    parseHTML(text, document) {
        const diagnostics = [];
        const lines = text.split('\n');
        // Check for HTML features
        const htmlFeatures = [
            { pattern: /<dialog[^>]*>/gi, featureId: 'html-dialog', name: 'HTML Dialog Element' },
            { pattern: /<details[^>]*>/gi, featureId: 'html-details', name: 'HTML Details Element' },
            { pattern: /<summary[^>]*>/gi, featureId: 'html-summary', name: 'HTML Summary Element' },
            { pattern: /<template[^>]*>/gi, featureId: 'html-template', name: 'HTML Template Element' },
            { pattern: /<slot[^>]*>/gi, featureId: 'html-slot', name: 'HTML Slot Element' },
            { pattern: /<picture[^>]*>/gi, featureId: 'html-picture', name: 'HTML Picture Element' },
            { pattern: /<video[^>]*>/gi, featureId: 'html-video', name: 'HTML Video Element' },
            { pattern: /<audio[^>]*>/gi, featureId: 'html-audio', name: 'HTML Audio Element' },
            { pattern: /<canvas[^>]*>/gi, featureId: 'html-canvas', name: 'HTML Canvas Element' },
            { pattern: /<svg[^>]*>/gi, featureId: 'html-svg', name: 'HTML SVG Element' }
        ];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const { pattern, featureId, name } of htmlFeatures) {
                let match;
                while ((match = pattern.exec(line)) !== null) {
                    const feature = this.dataService.getFeature(featureId);
                    if (feature) {
                        const diagnostic = this.createDiagnostic(feature, match.index, i, document);
                        if (diagnostic) {
                            diagnostics.push(diagnostic);
                        }
                    }
                }
            }
        }
        return diagnostics;
    }
    parseCSS(text, document) {
        const diagnostics = [];
        const lines = text.split('\n');
        // Check for CSS features
        const cssFeatures = [
            { pattern: /display:\s*grid/gi, featureId: 'css-grid', name: 'CSS Grid Layout' },
            { pattern: /display:\s*flex/gi, featureId: 'css-flexbox', name: 'CSS Flexbox' },
            { pattern: /var\(--/gi, featureId: 'css-custom-properties', name: 'CSS Custom Properties' },
            { pattern: /@container/gi, featureId: 'css-container-queries', name: 'CSS Container Queries' },
            { pattern: /subgrid/gi, featureId: 'css-subgrid', name: 'CSS Subgrid' },
            { pattern: /@supports/gi, featureId: 'css-supports', name: 'CSS @supports' },
            { pattern: /@media\s+\(prefers-color-scheme/gi, featureId: 'css-prefers-color-scheme', name: 'CSS prefers-color-scheme' },
            { pattern: /@media\s+\(prefers-reduced-motion/gi, featureId: 'css-prefers-reduced-motion', name: 'CSS prefers-reduced-motion' },
            { pattern: /backdrop-filter/gi, featureId: 'css-backdrop-filter', name: 'CSS Backdrop Filter' },
            { pattern: /clip-path/gi, featureId: 'css-clip-path', name: 'CSS Clip Path' },
            { pattern: /mask/gi, featureId: 'css-mask', name: 'CSS Mask' },
            { pattern: /shape-outside/gi, featureId: 'css-shape-outside', name: 'CSS Shape Outside' },
            { pattern: /object-fit/gi, featureId: 'css-object-fit', name: 'CSS Object Fit' },
            { pattern: /filter:/gi, featureId: 'css-filter', name: 'CSS Filter' },
            { pattern: /transform:/gi, featureId: 'css-transform', name: 'CSS Transform' },
            { pattern: /transition:/gi, featureId: 'css-transition', name: 'CSS Transition' },
            { pattern: /animation:/gi, featureId: 'css-animation', name: 'CSS Animation' }
        ];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const { pattern, featureId, name } of cssFeatures) {
                let match;
                while ((match = pattern.exec(line)) !== null) {
                    const feature = this.dataService.getFeature(featureId);
                    if (feature) {
                        const diagnostic = this.createDiagnostic(feature, match.index, i, document);
                        if (diagnostic) {
                            diagnostics.push(diagnostic);
                        }
                    }
                }
            }
        }
        return diagnostics;
    }
    parseJavaScript(text, document) {
        const diagnostics = [];
        const lines = text.split('\n');
        // Check for JavaScript features
        const jsFeatures = [
            { pattern: /\?\./g, featureId: 'javascript-optional-chaining', name: 'Optional Chaining' },
            { pattern: /\?\?/g, featureId: 'javascript-nullish-coalescing', name: 'Nullish Coalescing' },
            { pattern: /async\s+function/g, featureId: 'javascript-async-await', name: 'Async/Await' },
            { pattern: /await\s+/g, featureId: 'javascript-async-await', name: 'Async/Await' },
            { pattern: /const\s*\{/g, featureId: 'javascript-destructuring', name: 'Destructuring Assignment' },
            { pattern: /let\s*\{/g, featureId: 'javascript-destructuring', name: 'Destructuring Assignment' },
            { pattern: /const\s*\[/g, featureId: 'javascript-destructuring', name: 'Destructuring Assignment' },
            { pattern: /let\s*\[/g, featureId: 'javascript-destructuring', name: 'Destructuring Assignment' },
            { pattern: /\.\.\./g, featureId: 'javascript-spread-operator', name: 'Spread Operator' },
            { pattern: /=>/g, featureId: 'javascript-arrow-functions', name: 'Arrow Functions' },
            { pattern: /class\s+\w+/g, featureId: 'javascript-classes', name: 'ES6 Classes' },
            { pattern: /import\s+.*\s+from/g, featureId: 'javascript-modules', name: 'ES6 Modules' },
            { pattern: /export\s+/g, featureId: 'javascript-modules', name: 'ES6 Modules' },
            { pattern: /Promise\./g, featureId: 'javascript-promises', name: 'Promises' },
            { pattern: /fetch\(/g, featureId: 'javascript-fetch', name: 'Fetch API' },
            { pattern: /localStorage\./g, featureId: 'javascript-local-storage', name: 'Local Storage' },
            { pattern: /sessionStorage\./g, featureId: 'javascript-session-storage', name: 'Session Storage' },
            { pattern: /addEventListener\(/g, featureId: 'javascript-event-listeners', name: 'Event Listeners' },
            { pattern: /querySelector\(/g, featureId: 'javascript-query-selector', name: 'Query Selector' },
            { pattern: /querySelectorAll\(/g, featureId: 'javascript-query-selector', name: 'Query Selector' }
        ];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const { pattern, featureId, name } of jsFeatures) {
                let match;
                while ((match = pattern.exec(line)) !== null) {
                    const feature = this.dataService.getFeature(featureId);
                    if (feature) {
                        const diagnostic = this.createDiagnostic(feature, match.index, i, document);
                        if (diagnostic) {
                            diagnostics.push(diagnostic);
                        }
                    }
                }
            }
        }
        return diagnostics;
    }
    createDiagnostic(feature, column, line, document) {
        const config = this.dataService.getConfiguration();
        const severity = this.getSeverity(feature, config);
        if (severity === null) {
            return null; // Feature meets requirements, no diagnostic needed
        }
        const range = new vscode.Range(line, column, line, column + 50 // Approximate length
        );
        const diagnostic = new vscode.Diagnostic(range, this.createMessage(feature), severity);
        diagnostic.source = 'Baseline';
        diagnostic.code = feature.id;
        // Add related information
        diagnostic.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, range), `Status: ${feature.status} | Baseline: ${feature.baseline.high}`)
        ];
        return diagnostic;
    }
    getSeverity(feature, config) {
        const { browserSupport, warningLevel } = config;
        // Check if feature meets browser support requirements
        const meetsRequirements = this.checkBrowserSupport(feature, browserSupport);
        if (meetsRequirements) {
            return null; // No warning needed
        }
        // Return appropriate severity based on feature status and config
        switch (feature.status) {
            case 'limited':
                return vscode.DiagnosticSeverity.Error;
            case 'newly':
                return warningLevel === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
            case 'widely':
                return warningLevel === 'error' ? vscode.DiagnosticSeverity.Error :
                    warningLevel === 'warning' ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }
    checkBrowserSupport(feature, browserSupport) {
        // Simplified browser support checking
        // In a real implementation, this would use browserslist to check actual support
        return feature.status === 'widely';
    }
    createMessage(feature) {
        const statusMessages = {
            'limited': 'Limited browser support',
            'newly': 'Newly available feature',
            'widely': 'Widely supported feature'
        };
        let message = `${feature.name}: ${statusMessages[feature.status]}`;
        if (feature.usage_recommendation) {
            message += `\n\nRecommendation: ${feature.usage_recommendation}`;
        }
        if (feature.progressive_enhancement) {
            message += `\n\nProgressive Enhancement: ${feature.progressive_enhancement}`;
        }
        return message;
    }
    async refreshDocument(uri) {
        const document = await vscode.workspace.openTextDocument(uri);
        const diagnostics = await this.provideDiagnostics(document, new vscode.CancellationTokenSource().token);
        this.diagnosticCollection.set(uri, diagnostics || []);
    }
    clearDiagnostics() {
        this.diagnosticCollection.clear();
    }
}
exports.CompatibilityDiagnosticProvider = CompatibilityDiagnosticProvider;
//# sourceMappingURL=CompatibilityDiagnosticProvider.js.map