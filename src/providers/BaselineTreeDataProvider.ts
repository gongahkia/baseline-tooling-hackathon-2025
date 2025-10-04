import * as vscode from 'vscode';
import { BaselineDataService } from '../services/BaselineDataService';
import { BaselineFeature } from '../types/baseline';

export class BaselineTreeDataProvider implements vscode.TreeDataProvider<BaselineTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BaselineTreeItem | undefined | null | void> = new vscode.EventEmitter<BaselineTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BaselineTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private dataService: BaselineDataService;
    private features: BaselineFeature[] = [];
    private warnings: BaselineFeature[] = [];

    constructor(dataService: BaselineDataService) {
        this.dataService = dataService;
        this.loadFeatures();
    }

    refresh(): void {
        this.loadFeatures();
        this._onDidChangeTreeData.fire();
    }

    private loadFeatures(): void {
        this.features = this.dataService.getAllFeatures();
        this.warnings = this.dataService.getFeaturesByStatus('limited');
    }

    getTreeItem(element: BaselineTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: BaselineTreeItem): Thenable<BaselineTreeItem[]> {
        if (!element) {
            // Root level - show categories
            return Promise.resolve([
                new BaselineTreeItem('Features', vscode.TreeItemCollapsibleState.Collapsed, 'features', '📋'),
                new BaselineTreeItem('Warnings', vscode.TreeItemCollapsibleState.Collapsed, 'warnings', '⚠️'),
                new BaselineTreeItem('Widely Available', vscode.TreeItemCollapsibleState.Collapsed, 'widely', '✅'),
                new BaselineTreeItem('Newly Available', vscode.TreeItemCollapsibleState.Collapsed, 'newly', '🆕'),
                new BaselineTreeItem('Limited Support', vscode.TreeItemCollapsibleState.Collapsed, 'limited', '⚠️')
            ]);
        }

        switch (element.id) {
            case 'features':
                return Promise.resolve(this.features.map(feature => 
                    new BaselineTreeItem(
                        feature.name,
                        vscode.TreeItemCollapsibleState.None,
                        feature.id,
                        this.getStatusEmoji(feature.status),
                        feature
                    )
                ));
            
            case 'warnings':
                return Promise.resolve(this.warnings.map(feature => 
                    new BaselineTreeItem(
                        feature.name,
                        vscode.TreeItemCollapsibleState.None,
                        feature.id,
                        '⚠️',
                        feature
                    )
                ));
            
            case 'widely':
                return Promise.resolve(
                    this.dataService.getFeaturesByStatus('widely').map(feature => 
                        new BaselineTreeItem(
                            feature.name,
                            vscode.TreeItemCollapsibleState.None,
                            feature.id,
                            '✅',
                            feature
                        )
                    )
                );
            
            case 'newly':
                return Promise.resolve(
                    this.dataService.getFeaturesByStatus('newly').map(feature => 
                        new BaselineTreeItem(
                            feature.name,
                            vscode.TreeItemCollapsibleState.None,
                            feature.id,
                            '🆕',
                            feature
                        )
                    )
                );
            
            case 'limited':
                return Promise.resolve(
                    this.dataService.getFeaturesByStatus('limited').map(feature => 
                        new BaselineTreeItem(
                            feature.name,
                            vscode.TreeItemCollapsibleState.None,
                            feature.id,
                            '⚠️',
                            feature
                        )
                    )
                );
            
            default:
                return Promise.resolve([]);
        }
    }

    private getStatusEmoji(status: string): string {
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
}

export class BaselineTreeItem extends vscode.TreeItem {
    public readonly id: string;
    public readonly feature?: BaselineFeature;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        id: string,
        icon: string,
        feature?: BaselineFeature
    ) {
        super(label, collapsibleState);
        this.id = id;
        this.feature = feature;
        this.iconPath = new vscode.ThemeIcon(icon);
        
        if (feature) {
            this.tooltip = this.createTooltip(feature);
            this.contextValue = 'baselineFeature';
            this.command = {
                command: 'baseline.showFeatureDetails',
                title: 'Show Feature Details',
                arguments: [feature]
            };
        }
    }

    private createTooltip(feature: BaselineFeature): string {
        return `${feature.name}\n\n${feature.description}\n\nStatus: ${feature.status.toUpperCase()}\nBaseline: ${feature.baseline.high}`;
    }
}
