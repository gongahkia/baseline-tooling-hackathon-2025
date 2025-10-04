"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineChecker = void 0;
class BaselineChecker {
    constructor(config) {
        this.config = config;
    }
    async checkFile(filename, content) {
        const issues = [];
        const lines = content.split('\n');
        // Determine file type
        const fileType = this.getFileType(filename);
        if (!fileType) {
            return issues;
        }
        // Check for features based on file type
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineIssues = this.checkLine(filename, line, i, fileType);
            issues.push(...lineIssues);
        }
        return issues;
    }
    getFileType(filename) {
        if (filename.endsWith('.html') || filename.endsWith('.htm')) {
            return 'html';
        }
        else if (filename.endsWith('.css')) {
            return 'css';
        }
        else if (filename.endsWith('.js') || filename.endsWith('.mjs')) {
            return 'javascript';
        }
        else if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
            return 'typescript';
        }
        return null;
    }
    checkLine(filename, line, lineNumber, fileType) {
        const issues = [];
        // Feature patterns for different file types
        const patterns = this.getFeaturePatterns(fileType);
        for (const pattern of patterns) {
            let match;
            const regex = new RegExp(pattern.pattern, 'gi');
            while ((match = regex.exec(line)) !== null) {
                const issue = this.createIssue(filename, lineNumber, match.index, pattern.featureId, pattern.name, pattern.pattern);
                if (issue) {
                    issues.push(issue);
                }
            }
        }
        return issues;
    }
    getFeaturePatterns(fileType) {
        const patterns = [];
        switch (fileType) {
            case 'html':
                patterns.push({ pattern: '<dialog[^>]*>', featureId: 'html-dialog', name: 'HTML Dialog Element' }, { pattern: '<details[^>]*>', featureId: 'html-details', name: 'HTML Details Element' }, { pattern: '<summary[^>]*>', featureId: 'html-summary', name: 'HTML Summary Element' }, { pattern: '<template[^>]*>', featureId: 'html-template', name: 'HTML Template Element' }, { pattern: '<slot[^>]*>', featureId: 'html-slot', name: 'HTML Slot Element' }, { pattern: '<picture[^>]*>', featureId: 'html-picture', name: 'HTML Picture Element' }, { pattern: '<video[^>]*>', featureId: 'html-video', name: 'HTML Video Element' }, { pattern: '<audio[^>]*>', featureId: 'html-audio', name: 'HTML Audio Element' }, { pattern: '<canvas[^>]*>', featureId: 'html-canvas', name: 'HTML Canvas Element' }, { pattern: '<svg[^>]*>', featureId: 'html-svg', name: 'HTML SVG Element' });
                break;
            case 'css':
                patterns.push({ pattern: 'display:\\s*grid', featureId: 'css-grid', name: 'CSS Grid Layout' }, { pattern: 'display:\\s*flex', featureId: 'css-flexbox', name: 'CSS Flexbox' }, { pattern: 'var\\(--', featureId: 'css-custom-properties', name: 'CSS Custom Properties' }, { pattern: '@container', featureId: 'css-container-queries', name: 'CSS Container Queries' }, { pattern: 'subgrid', featureId: 'css-subgrid', name: 'CSS Subgrid' }, { pattern: '@supports', featureId: 'css-supports', name: 'CSS @supports' }, { pattern: '@media\\s+\\(prefers-color-scheme', featureId: 'css-prefers-color-scheme', name: 'CSS prefers-color-scheme' }, { pattern: '@media\\s+\\(prefers-reduced-motion', featureId: 'css-prefers-reduced-motion', name: 'CSS prefers-reduced-motion' }, { pattern: 'backdrop-filter', featureId: 'css-backdrop-filter', name: 'CSS Backdrop Filter' }, { pattern: 'clip-path', featureId: 'css-clip-path', name: 'CSS Clip Path' }, { pattern: 'mask:', featureId: 'css-mask', name: 'CSS Mask' }, { pattern: 'shape-outside', featureId: 'css-shape-outside', name: 'CSS Shape Outside' }, { pattern: 'object-fit', featureId: 'css-object-fit', name: 'CSS Object Fit' }, { pattern: 'filter:', featureId: 'css-filter', name: 'CSS Filter' }, { pattern: 'transform:', featureId: 'css-transform', name: 'CSS Transform' }, { pattern: 'transition:', featureId: 'css-transition', name: 'CSS Transition' }, { pattern: 'animation:', featureId: 'css-animation', name: 'CSS Animation' });
                break;
            case 'javascript':
            case 'typescript':
                patterns.push({ pattern: '\\?\\.', featureId: 'javascript-optional-chaining', name: 'Optional Chaining' }, { pattern: '\\?\\?', featureId: 'javascript-nullish-coalescing', name: 'Nullish Coalescing' }, { pattern: 'async\\s+function', featureId: 'javascript-async-await', name: 'Async/Await' }, { pattern: 'await\\s+', featureId: 'javascript-async-await', name: 'Async/Await' }, { pattern: 'const\\s*\\{', featureId: 'javascript-destructuring', name: 'Destructuring Assignment' }, { pattern: 'let\\s*\\{', featureId: 'javascript-destructuring', name: 'Destructuring Assignment' }, { pattern: 'const\\s*\\[', featureId: 'javascript-destructuring', name: 'Destructuring Assignment' }, { pattern: 'let\\s*\\[', featureId: 'javascript-destructuring', name: 'Destructuring Assignment' }, { pattern: '\\.\\.\\.', featureId: 'javascript-spread-operator', name: 'Spread Operator' }, { pattern: '=>', featureId: 'javascript-arrow-functions', name: 'Arrow Functions' }, { pattern: 'class\\s+\\w+', featureId: 'javascript-classes', name: 'ES6 Classes' }, { pattern: 'import\\s+.*\\s+from', featureId: 'javascript-modules', name: 'ES6 Modules' }, { pattern: 'export\\s+', featureId: 'javascript-modules', name: 'ES6 Modules' }, { pattern: 'Promise\\.', featureId: 'javascript-promises', name: 'Promises' }, { pattern: 'fetch\\(', featureId: 'javascript-fetch', name: 'Fetch API' }, { pattern: 'localStorage\\.', featureId: 'javascript-local-storage', name: 'Local Storage' }, { pattern: 'sessionStorage\\.', featureId: 'javascript-session-storage', name: 'Session Storage' }, { pattern: 'addEventListener\\(', featureId: 'javascript-event-listeners', name: 'Event Listeners' }, { pattern: 'querySelector\\(', featureId: 'javascript-query-selector', name: 'Query Selector' }, { pattern: 'querySelectorAll\\(', featureId: 'javascript-query-selector', name: 'Query Selector' });
                break;
        }
        return patterns;
    }
    createIssue(filename, lineNumber, column, featureId, featureName, pattern) {
        // Mock feature data - in a real implementation, this would come from the Baseline API
        const mockFeatures = {
            'css-grid': { status: 'widely', baseline: '2017-03-14', support: { chrome: '57', firefox: '52', safari: '10.1', edge: '16' } },
            'css-custom-properties': { status: 'widely', baseline: '2016-03-15', support: { chrome: '49', firefox: '31', safari: '9.1', edge: '15' } },
            'css-container-queries': { status: 'newly', baseline: '2023-09-14', support: { chrome: '105', firefox: '110', safari: '16.0', edge: '105' } },
            'css-subgrid': { status: 'limited', baseline: '2023-09-14', support: { chrome: '117', firefox: '71', safari: '16.0', edge: '117' } },
            'javascript-optional-chaining': { status: 'widely', baseline: '2020-01-01', support: { chrome: '80', firefox: '74', safari: '13.1', edge: '80' } },
            'javascript-nullish-coalescing': { status: 'widely', baseline: '2020-01-01', support: { chrome: '80', firefox: '72', safari: '13.1', edge: '80' } }
        };
        const feature = mockFeatures[featureId];
        if (!feature) {
            return null;
        }
        // Determine severity based on feature status and configuration
        let severity = 'info';
        if (feature.status === 'limited') {
            severity = 'error';
        }
        else if (feature.status === 'newly') {
            severity = this.config.warningLevel === 'error' ? 'error' : 'warning';
        }
        else if (feature.status === 'widely') {
            severity = this.config.warningLevel === 'error' ? 'error' :
                this.config.warningLevel === 'warning' ? 'warning' : 'info';
        }
        // Create issue message
        const statusMessages = {
            'limited': 'Limited browser support',
            'newly': 'Newly available feature',
            'widely': 'Widely supported feature'
        };
        let message = `${featureName}: ${statusMessages[feature.status]}`;
        message += `\nBaseline: ${feature.baseline}`;
        message += `\nBrowser Support: Chrome ${feature.support.chrome}+, Firefox ${feature.support.firefox}+, Safari ${feature.support.safari}+, Edge ${feature.support.edge}+`;
        if (feature.status === 'limited' || feature.status === 'newly') {
            message += `\n\nRecommendation: Use with feature detection or progressive enhancement`;
        }
        return {
            file: filename,
            line: lineNumber + 1,
            column: column + 1,
            severity,
            message,
            feature: featureId,
            suggestion: feature.status === 'limited' ? 'Consider using feature detection or providing fallbacks' : undefined
        };
    }
}
exports.BaselineChecker = BaselineChecker;
//# sourceMappingURL=BaselineChecker.js.map