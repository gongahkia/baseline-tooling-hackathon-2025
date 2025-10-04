import * as vscode from 'vscode';
import { BaselineDataService } from '../services/BaselineDataService';
import { CompatibilityDiagnosticProvider } from '../providers/CompatibilityDiagnosticProvider';
import { BaselineDashboardProvider } from '../providers/BaselineDashboardProvider';

export class BaselineCommands {
    private dataService: BaselineDataService;
    private diagnosticProvider: CompatibilityDiagnosticProvider;
    private dashboardProvider: BaselineDashboardProvider;

    constructor(
        dataService: BaselineDataService,
        diagnosticProvider: CompatibilityDiagnosticProvider,
        dashboardProvider: BaselineDashboardProvider
    ) {
        this.dataService = dataService;
        this.diagnosticProvider = diagnosticProvider;
        this.dashboardProvider = dashboardProvider;
    }

    async checkCompatibility(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const language = document.languageId;

        if (!['html', 'css', 'javascript', 'typescript'].includes(language)) {
            vscode.window.showWarningMessage('Compatibility checking is only available for HTML, CSS, JavaScript, and TypeScript files');
            return;
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Checking Baseline compatibility...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Analyzing file...' });
                
                // Get diagnostics for the current document
                const diagnostics = await this.diagnosticProvider.provideDiagnostics(document, new vscode.CancellationTokenSource().token);
                
                progress.report({ increment: 50, message: 'Generating report...' });
                
                // Update diagnostic collection
                const diagnosticCollection = vscode.languages.getDiagnostics(document.uri);
                const baselineDiagnostics = diagnosticCollection.filter(d => d.source === 'Baseline');
                
                progress.report({ increment: 100, message: 'Complete!' });
                
                // Show results
                if (baselineDiagnostics.length === 0) {
                    vscode.window.showInformationMessage('No Baseline compatibility issues found!');
                } else {
                    const errorCount = baselineDiagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
                    const warningCount = baselineDiagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length;
                    const infoCount = baselineDiagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Information).length;
                    
                    vscode.window.showInformationMessage(
                        `Found ${baselineDiagnostics.length} Baseline compatibility issues: ${errorCount} errors, ${warningCount} warnings, ${infoCount} info`,
                        'View Details'
                    ).then(selection => {
                        if (selection === 'View Details') {
                            this.showCompatibilityReport(baselineDiagnostics);
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error checking compatibility:', error);
            vscode.window.showErrorMessage('Failed to check compatibility');
        }
    }

    async showDashboard(): Promise<void> {
        // The dashboard is already registered as a webview provider
        // This command just ensures it's visible
        await vscode.commands.executeCommand('groundworkDashboard.focus');
    }

    async refreshData(): Promise<void> {
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Refreshing Baseline data...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Fetching latest data...' });
                
                await this.dataService.refreshData();
                
                progress.report({ increment: 50, message: 'Updating providers...' });
                
                // Refresh all providers
                this.diagnosticProvider.clearDiagnostics();
                
                progress.report({ increment: 100, message: 'Complete!' });
                
                vscode.window.showInformationMessage('Baseline data refreshed successfully!');
            });
        } catch (error) {
            console.error('Error refreshing data:', error);
            vscode.window.showErrorMessage('Failed to refresh Baseline data');
        }
    }

    async configureProject(): Promise<void> {
        const config = this.dataService.getConfiguration();
        
        // Show configuration options
        const browserSupport = await vscode.window.showInputBox({
            prompt: 'Enter browser support targets (e.g., "chrome 90, firefox 88, safari 14")',
            value: config.browserSupport.join(', '),
            placeHolder: 'chrome 90, firefox 88, safari 14'
        });

        if (browserSupport !== undefined) {
            const warningLevel = await vscode.window.showQuickPick(
                [
                    { label: 'Error', description: 'Show errors for all compatibility issues', value: 'error' },
                    { label: 'Warning', description: 'Show warnings for compatibility issues', value: 'warning' },
                    { label: 'Info', description: 'Show info for compatibility issues', value: 'info' }
                ],
                {
                    placeHolder: 'Select warning level'
                }
            );

            if (warningLevel) {
                const autoCheck = await vscode.window.showQuickPick(
                    [
                        { label: 'Yes', description: 'Automatically check compatibility as you type', value: true },
                        { label: 'No', description: 'Only check when manually triggered', value: false }
                    ],
                    {
                        placeHolder: 'Enable automatic compatibility checking?'
                    }
                );

                if (autoCheck) {
                    // Update configuration
                    const workspaceConfig = vscode.workspace.getConfiguration('groundwork');
                    await workspaceConfig.update('browserSupport', browserSupport.split(',').map(s => s.trim()), vscode.ConfigurationTarget.Workspace);
                    await workspaceConfig.update('warningLevel', warningLevel.value, vscode.ConfigurationTarget.Workspace);
                    await workspaceConfig.update('autoCheck', autoCheck.value, vscode.ConfigurationTarget.Workspace);
                    
                    vscode.window.showInformationMessage('Project configuration updated successfully!');
                }
            }
        }
    }

    private showCompatibilityReport(diagnostics: vscode.Diagnostic[]): void {
        // Create a webview panel to show detailed compatibility report
        const panel = vscode.window.createWebviewPanel(
            'baselineReport',
            'Baseline Compatibility Report',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: []
            }
        );

        const html = this.generateReportHtml(diagnostics);
        panel.webview.html = html;

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'openMDN':
                        if (message.url) {
                            vscode.env.openExternal(vscode.Uri.parse(message.url));
                        }
                        break;
                    case 'openSpec':
                        if (message.url) {
                            vscode.env.openExternal(vscode.Uri.parse(message.url));
                        }
                        break;
                }
            },
            undefined,
            []
        );
    }

    private generateReportHtml(diagnostics: vscode.Diagnostic[]): string {
        const groupedDiagnostics = diagnostics.reduce((acc, diagnostic) => {
            const code = diagnostic.code as string;
            if (!acc[code]) {
                acc[code] = [];
            }
            acc[code].push(diagnostic);
            return acc;
        }, {} as Record<string, vscode.Diagnostic[]>);

        const features = Object.keys(groupedDiagnostics).map(code => {
            const feature = this.dataService.getFeature(code);
            const diags = groupedDiagnostics[code];
            return { feature, diagnostics: diags };
        }).filter(item => item.feature !== undefined);

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Baseline Compatibility Report</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 20px;
                }
                
                .header {
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                
                .summary {
                    color: var(--vscode-descriptionForeground);
                }
                
                .feature-section {
                    margin-bottom: 24px;
                    padding: 16px;
                    background-color: var(--vscode-panel-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                }
                
                .feature-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .feature-name {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .feature-status {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .status-widely { background-color: #4CAF50; color: white; }
                .status-newly { background-color: #2196F3; color: white; }
                .status-limited { background-color: #FF9800; color: white; }
                
                .feature-description {
                    margin-bottom: 12px;
                    color: var(--vscode-descriptionForeground);
                }
                
                .diagnostic-list {
                    margin-top: 12px;
                }
                
                .diagnostic-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 8px;
                    padding: 8px;
                    background-color: var(--vscode-editor-background);
                    border-radius: 4px;
                }
                
                .diagnostic-severity {
                    margin-right: 8px;
                    font-weight: bold;
                }
                
                .severity-error { color: #F44336; }
                .severity-warning { color: #FF9800; }
                .severity-info { color: #2196F3; }
                
                .diagnostic-message {
                    flex: 1;
                }
                
                .diagnostic-location {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 4px;
                }
                
                .feature-links {
                    margin-top: 12px;
                }
                
                .feature-link {
                    display: inline-block;
                    margin-right: 12px;
                    padding: 4px 8px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    text-decoration: none;
                    border-radius: 3px;
                    font-size: 12px;
                }
                
                .feature-link:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Baseline Compatibility Report</div>
                <div class="summary">Found ${diagnostics.length} compatibility issues across ${features.length} features</div>
            </div>
            
            ${features.map(({ feature, diagnostics: diags }) => feature ? `
                <div class="feature-section">
                    <div class="feature-header">
                        <div class="feature-name">${feature.name}</div>
                        <div class="feature-status status-${feature.status}">${feature.status.toUpperCase()}</div>
                    </div>
                    
                    <div class="feature-description">${feature.description}</div>
                    
                    <div class="diagnostic-list">
                        ${diags.map(diag => `
                            <div class="diagnostic-item">
                                <div class="diagnostic-severity severity-${diag.severity === vscode.DiagnosticSeverity.Error ? 'error' : diag.severity === vscode.DiagnosticSeverity.Warning ? 'warning' : 'info'}">
                                    ${diag.severity === vscode.DiagnosticSeverity.Error ? 'ERROR' : diag.severity === vscode.DiagnosticSeverity.Warning ? 'WARNING' : 'INFO'}
                                </div>
                                <div class="diagnostic-message">
                                    ${diag.message}
                                    <div class="diagnostic-location">
                                        Line ${diag.range.start.line + 1}, Column ${diag.range.start.character + 1}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="feature-links">
                        ${feature.mdn_url ? `<a href="#" class="feature-link" onclick="openMDN('${feature.mdn_url}')">MDN Documentation</a>` : ''}
                        ${feature.spec_url ? `<a href="#" class="feature-link" onclick="openSpec('${feature.spec_url}')">Specification</a>` : ''}
                        ${feature.caniuse_id ? `<a href="https://caniuse.com/${feature.caniuse_id}" class="feature-link" target="_blank">Can I Use</a>` : ''}
                    </div>
                </div>
            ` : '').join('')}
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function openMDN(url) {
                    vscode.postMessage({
                        command: 'openMDN',
                        url: url
                    });
                }
                
                function openSpec(url) {
                    vscode.postMessage({
                        command: 'openSpec',
                        url: url
                    });
                }
            </script>
        </body>
        </html>`;
    }
}
