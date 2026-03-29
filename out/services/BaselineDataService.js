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
exports.BaselineDataService = void 0;
const vscode = __importStar(require("vscode"));
const featureRegistry_1 = require("../core/featureRegistry");
const configuration_1 = require("../core/configuration");
class BaselineDataService {
    constructor(context) {
        this.onDidChangeDataEmitter = new vscode.EventEmitter();
        this.onDidChangeData = this.onDidChangeDataEmitter.event;
        this.context = context;
        this.data = (0, featureRegistry_1.loadBaselineData)();
        this.config = this.loadConfiguration();
        this.resolvedTargets = (0, configuration_1.resolveTargets)(this.config);
    }
    async initialize() {
        try {
            await this.loadBaselineData();
            this.setupConfigurationWatcher();
            console.log('BaselineDataService initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize BaselineDataService:', error);
            vscode.window.showErrorMessage('Failed to initialize Baseline data service');
        }
    }
    async loadBaselineData() {
        this.data = (0, featureRegistry_1.loadBaselineData)();
        this.resolvedTargets = (0, configuration_1.resolveTargets)(this.config);
    }
    loadConfiguration() {
        const workspaceConfiguration = vscode.workspace.getConfiguration('groundwork');
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const fileConfiguration = (0, configuration_1.readConfigurationFile)(workspaceRoot);
        return (0, configuration_1.mergeProjectConfiguration)({
            browserSupport: workspaceConfiguration.get('browserSupport'),
            warningLevel: workspaceConfiguration.get('warningLevel'),
            autoCheck: workspaceConfiguration.get('autoCheck'),
            cacheDuration: workspaceConfiguration.get('cacheDuration'),
            excludePatterns: workspaceConfiguration.get('excludePatterns'),
            targetMode: workspaceConfiguration.get('targetMode'),
            baselineYear: workspaceConfiguration.get('baselineYear'),
            widelyAvailableOnDate: workspaceConfiguration.get('widelyAvailableOnDate'),
            includeDownstreamBrowsers: workspaceConfiguration.get('includeDownstreamBrowsers')
        }, fileConfiguration);
    }
    setupConfigurationWatcher() {
        this.context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('groundwork')) {
                this.config = this.loadConfiguration();
                this.resolvedTargets = (0, configuration_1.resolveTargets)(this.config);
                this.onDidChangeDataEmitter.fire();
            }
        }));
    }
    getFeature(id) {
        return this.data.features.get(id);
    }
    getAllFeatures() {
        return Array.from(this.data.features.values());
    }
    getFeaturesByStatus(status) {
        return this.getAllFeatures().filter(f => f.status === status);
    }
    searchFeatures(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllFeatures().filter(f => f.name.toLowerCase().includes(lowerQuery) ||
            f.description.toLowerCase().includes(lowerQuery) ||
            f.id.toLowerCase().includes(lowerQuery));
    }
    getConfiguration() {
        return this.config;
    }
    getResolvedTargets() {
        return this.resolvedTargets;
    }
    async refreshData() {
        this.config = this.loadConfiguration();
        await this.loadBaselineData();
        this.onDidChangeDataEmitter.fire();
    }
    getDataVersion() {
        return this.data.version;
    }
    getLastUpdated() {
        return this.data.lastUpdated;
    }
    dispose() {
        this.onDidChangeDataEmitter.dispose();
    }
}
exports.BaselineDataService = BaselineDataService;
//# sourceMappingURL=BaselineDataService.js.map