import * as vscode from 'vscode';
import { BaselineDataService } from '../services/BaselineDataService';

export class BaselineStatusBar {
    private statusBarItem: vscode.StatusBarItem;
    private dataService: BaselineDataService;
    private isVisible: boolean = false;

    constructor(dataService: BaselineDataService) {
        this.dataService = dataService;
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
    }

    initialize(): void {
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

    private updateStatus(): void {
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
        } else if (healthScore >= 60) {
            this.statusBarItem.color = '#FF9800'; // Orange
        } else {
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

    show(): void {
        if (!this.isVisible) {
            this.statusBarItem.show();
            this.isVisible = true;
        }
    }

    hide(): void {
        if (this.isVisible) {
            this.statusBarItem.hide();
            this.isVisible = false;
        }
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
