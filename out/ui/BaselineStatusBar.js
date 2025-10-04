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
exports.BaselineStatusBar = void 0;
const vscode = __importStar(require("vscode"));
class BaselineStatusBar {
    constructor(dataService) {
        this.isVisible = false;
        this.dataService = dataService;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    }
    initialize() {
        this.updateStatus();
        this.statusBarItem.show();
        this.isVisible = true;
        // Update status when data changes
        this.dataService.onDidChangeData(() => {
            this.updateStatus();
        });
        // Update status when configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('baseline')) {
                this.updateStatus();
            }
        });
    }
    updateStatus() {
        const features = this.dataService.getAllFeatures();
        const config = this.dataService.getConfiguration();
        const widelyAvailable = features.filter(f => f.status === 'widely').length;
        const newlyAvailable = features.filter(f => f.status === 'newly').length;
        const limitedSupport = features.filter(f => f.status === 'limited').length;
        // Calculate health score
        const totalFeatures = features.length;
        const healthScore = totalFeatures > 0 ?
            Math.round((widelyAvailable / totalFeatures) * 100) : 100;
        // Set status bar text and color
        this.statusBarItem.text = `$(check) Baseline: ${healthScore}%`;
        if (healthScore >= 80) {
            this.statusBarItem.color = '#4CAF50'; // Green
        }
        else if (healthScore >= 60) {
            this.statusBarItem.color = '#FF9800'; // Orange
        }
        else {
            this.statusBarItem.color = '#F44336'; // Red
        }
        // Set tooltip
        this.statusBarItem.tooltip = new vscode.MarkdownString()
            .appendMarkdown(`**Baseline Compatibility Status**\n\n`)
            .appendMarkdown(`- Health Score: ${healthScore}%\n`)
            .appendMarkdown(`- Widely Available: ${widelyAvailable} features\n`)
            .appendMarkdown(`- Newly Available: ${newlyAvailable} features\n`)
            .appendMarkdown(`- Limited Support: ${limitedSupport} features\n\n`)
            .appendMarkdown(`**Configuration**\n`)
            .appendMarkdown(`- Browser Support: ${config.browserSupport.join(', ')}\n`)
            .appendMarkdown(`- Warning Level: ${config.warningLevel}\n`)
            .appendMarkdown(`- Auto Check: ${config.autoCheck ? 'Enabled' : 'Disabled'}`);
        // Set command
        this.statusBarItem.command = 'baseline.showDashboard';
    }
    show() {
        if (!this.isVisible) {
            this.statusBarItem.show();
            this.isVisible = true;
        }
    }
    hide() {
        if (this.isVisible) {
            this.statusBarItem.hide();
            this.isVisible = false;
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.BaselineStatusBar = BaselineStatusBar;
//# sourceMappingURL=BaselineStatusBar.js.map