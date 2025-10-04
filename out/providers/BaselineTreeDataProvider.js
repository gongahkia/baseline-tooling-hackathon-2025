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
exports.BaselineTreeItem = exports.BaselineTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
class BaselineTreeDataProvider {
    constructor(dataService) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.features = [];
        this.warnings = [];
        this.dataService = dataService;
        this.loadFeatures();
    }
    refresh() {
        this.loadFeatures();
        this._onDidChangeTreeData.fire();
    }
    loadFeatures() {
        this.features = this.dataService.getAllFeatures();
        this.warnings = this.dataService.getFeaturesByStatus('limited');
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
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
                return Promise.resolve(this.features.map(feature => new BaselineTreeItem(feature.name, vscode.TreeItemCollapsibleState.None, feature.id, this.getStatusEmoji(feature.status), feature)));
            case 'warnings':
                return Promise.resolve(this.warnings.map(feature => new BaselineTreeItem(feature.name, vscode.TreeItemCollapsibleState.None, feature.id, '⚠️', feature)));
            case 'widely':
                return Promise.resolve(this.dataService.getFeaturesByStatus('widely').map(feature => new BaselineTreeItem(feature.name, vscode.TreeItemCollapsibleState.None, feature.id, '✅', feature)));
            case 'newly':
                return Promise.resolve(this.dataService.getFeaturesByStatus('newly').map(feature => new BaselineTreeItem(feature.name, vscode.TreeItemCollapsibleState.None, feature.id, '🆕', feature)));
            case 'limited':
                return Promise.resolve(this.dataService.getFeaturesByStatus('limited').map(feature => new BaselineTreeItem(feature.name, vscode.TreeItemCollapsibleState.None, feature.id, '⚠️', feature)));
            default:
                return Promise.resolve([]);
        }
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
}
exports.BaselineTreeDataProvider = BaselineTreeDataProvider;
class BaselineTreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState, id, icon, feature) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.id = id;
        this.feature = feature;
        this.iconPath = new vscode.ThemeIcon(icon);
        if (feature) {
            this.tooltip = this.createTooltip(feature);
            this.contextValue = 'baselineFeature';
            this.command = {
                command: 'groundwork.showFeatureDetails',
                title: 'Show Feature Details',
                arguments: [feature]
            };
        }
    }
    createTooltip(feature) {
        return `${feature.name}\n\n${feature.description}\n\nStatus: ${feature.status.toUpperCase()}\nBaseline: ${feature.baseline.high}`;
    }
}
exports.BaselineTreeItem = BaselineTreeItem;
//# sourceMappingURL=BaselineTreeDataProvider.js.map