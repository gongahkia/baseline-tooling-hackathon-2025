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
exports.BaselineDashboardProvider = void 0;
const vscode = __importStar(require("vscode"));
class BaselineDashboardProvider {
    constructor(dataService) {
        this.dataService = dataService;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'refresh':
                    this.refresh();
                    break;
                case 'showFeature':
                    this.showFeatureDetails(message.featureId);
                    break;
            }
        }, undefined, []);
        // Refresh data when it changes
        this.dataService.onDidChangeData(() => {
            this.refresh();
        });
    }
    getHtmlForWebview(webview) {
        const features = this.dataService.getAllFeatures();
        const config = this.dataService.getConfiguration();
        const widelyAvailable = features.filter(f => f.status === 'widely').length;
        const newlyAvailable = features.filter(f => f.status === 'newly').length;
        const limitedSupport = features.filter(f => f.status === 'limited').length;
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Baseline Compatibility Dashboard</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 16px;
                }
                
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    color: var(--vscode-foreground);
                }
                
                .refresh-btn {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .refresh-btn:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .stat-card {
                    background-color: var(--vscode-panel-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                    padding: 12px;
                    text-align: center;
                }
                
                .stat-number {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                
                .stat-label {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                }
                
                .widely { color: #4CAF50; }
                .newly { color: #2196F3; }
                .limited { color: #FF9800; }
                
                .features-section {
                    margin-top: 20px;
                }
                
                .section-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 12px;
                    color: var(--vscode-foreground);
                }
                
                .feature-list {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .feature-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    margin-bottom: 4px;
                    background-color: var(--vscode-panel-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .feature-item:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                
                .feature-icon {
                    margin-right: 8px;
                    font-size: 16px;
                }
                
                .feature-name {
                    flex: 1;
                    font-weight: 500;
                }
                
                .feature-status {
                    font-size: 12px;
                    padding: 2px 6px;
                    border-radius: 3px;
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                }
                
                .config-section {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid var(--vscode-panel-border);
                }
                
                .config-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .config-label {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                }
                
                .config-value {
                    font-size: 12px;
                    color: var(--vscode-foreground);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Baseline Compatibility Dashboard</div>
                <button class="refresh-btn" onclick="refresh()">Refresh</button>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number widely">${widelyAvailable}</div>
                    <div class="stat-label">Widely Available</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number newly">${newlyAvailable}</div>
                    <div class="stat-label">Newly Available</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number limited">${limitedSupport}</div>
                    <div class="stat-label">Limited Support</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${features.length}</div>
                    <div class="stat-label">Total Features</div>
                </div>
            </div>
            
            <div class="features-section">
                <div class="section-title">Recent Features</div>
                <div class="feature-list">
                    ${features.slice(0, 10).map(feature => `
                        <div class="feature-item" onclick="showFeature('${feature.id}')">
                            <div class="feature-icon">${this.getStatusEmoji(feature.status)}</div>
                            <div class="feature-name">${feature.name}</div>
                            <div class="feature-status ${feature.status}">${feature.status.toUpperCase()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="config-section">
                <div class="section-title">Project Configuration</div>
                <div class="config-item">
                    <div class="config-label">Browser Support:</div>
                    <div class="config-value">${config.browserSupport.join(', ')}</div>
                </div>
                <div class="config-item">
                    <div class="config-label">Warning Level:</div>
                    <div class="config-value">${config.warningLevel}</div>
                </div>
                <div class="config-item">
                    <div class="config-label">Auto Check:</div>
                    <div class="config-value">${config.autoCheck ? 'Enabled' : 'Disabled'}</div>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function refresh() {
                    vscode.postMessage({
                        command: 'refresh'
                    });
                }
                
                function showFeature(featureId) {
                    vscode.postMessage({
                        command: 'showFeature',
                        featureId: featureId
                    });
                }
            </script>
        </body>
        </html>`;
    }
    getStatusEmoji(status) {
        switch (status) {
            case 'widely':
                return '✅';
            case 'newly':
                return '🆕';
            case 'limited':
                return '⚠️';
            default:
                return '❓';
        }
    }
    refresh() {
        if (this._view) {
            this._view.webview.html = this.getHtmlForWebview(this._view.webview);
        }
    }
    showFeatureDetails(featureId) {
        const feature = this.dataService.getFeature(featureId);
        if (feature) {
            vscode.window.showInformationMessage(`${feature.name}: ${feature.description}\n\nStatus: ${feature.status}\nBaseline: ${feature.baseline.high}`, 'Open MDN').then(selection => {
                if (selection === 'Open MDN' && feature.mdn_url) {
                    vscode.env.openExternal(vscode.Uri.parse(feature.mdn_url));
                }
            });
        }
    }
}
exports.BaselineDashboardProvider = BaselineDashboardProvider;
BaselineDashboardProvider.viewType = 'groundworkDashboard';
//# sourceMappingURL=BaselineDashboardProvider.js.map