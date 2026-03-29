import * as vscode from 'vscode';
import { loadBaselineData } from '../core/featureRegistry';
import { mergeProjectConfiguration, readConfigurationFile, resolveTargets } from '../core/configuration';
import { BaselineFeature, BaselineData, ProjectConfiguration, ResolvedTargets } from '../types/baseline';

export class BaselineDataService {
    private data: BaselineData;
    private config: ProjectConfiguration;
    private resolvedTargets: ResolvedTargets;
    private context: vscode.ExtensionContext;
    private onDidChangeDataEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeData: vscode.Event<void> = this.onDidChangeDataEmitter.event;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.data = loadBaselineData();
        this.config = this.loadConfiguration();
        this.resolvedTargets = resolveTargets(this.config);
    }

    async initialize(): Promise<void> {
        try {
            await this.loadBaselineData();
            this.setupConfigurationWatcher();
            console.log('BaselineDataService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize BaselineDataService:', error);
            vscode.window.showErrorMessage('Failed to initialize Baseline data service');
        }
    }

    private async loadBaselineData(): Promise<void> {
        this.data = loadBaselineData();
        this.resolvedTargets = resolveTargets(this.config);
    }

    private loadConfiguration(): ProjectConfiguration {
        const workspaceConfiguration = vscode.workspace.getConfiguration('groundwork');
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const fileConfiguration = readConfigurationFile(workspaceRoot);

        return mergeProjectConfiguration(
            {
                browserSupport: workspaceConfiguration.get<string[]>('browserSupport'),
                warningLevel: workspaceConfiguration.get<ProjectConfiguration['warningLevel']>('warningLevel'),
                autoCheck: workspaceConfiguration.get<boolean>('autoCheck'),
                cacheDuration: workspaceConfiguration.get<number>('cacheDuration'),
                excludePatterns: workspaceConfiguration.get<string[]>('excludePatterns'),
                targetMode: workspaceConfiguration.get<ProjectConfiguration['targetMode']>('targetMode'),
                baselineYear: workspaceConfiguration.get<number>('baselineYear'),
                widelyAvailableOnDate: workspaceConfiguration.get<string>('widelyAvailableOnDate'),
                includeDownstreamBrowsers: workspaceConfiguration.get<boolean>('includeDownstreamBrowsers')
            },
            fileConfiguration
        );
    }

    private setupConfigurationWatcher(): void {
        this.context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('groundwork')) {
                this.config = this.loadConfiguration();
                this.resolvedTargets = resolveTargets(this.config);
                this.onDidChangeDataEmitter.fire();
            }
        }));
    }

    getFeature(id: string): BaselineFeature | undefined {
        return this.data.features.get(id);
    }

    getAllFeatures(): BaselineFeature[] {
        return Array.from(this.data.features.values());
    }

    getFeaturesByStatus(status: 'limited' | 'newly' | 'widely'): BaselineFeature[] {
        return this.getAllFeatures().filter(f => f.status === status);
    }

    searchFeatures(query: string): BaselineFeature[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllFeatures().filter(f => 
            f.name.toLowerCase().includes(lowerQuery) ||
            f.description.toLowerCase().includes(lowerQuery) ||
            f.id.toLowerCase().includes(lowerQuery)
        );
    }

    getConfiguration(): ProjectConfiguration {
        return this.config;
    }

    getResolvedTargets(): ResolvedTargets {
        return this.resolvedTargets;
    }

    async refreshData(): Promise<void> {
        this.config = this.loadConfiguration();
        await this.loadBaselineData();
        this.onDidChangeDataEmitter.fire();
    }

    getDataVersion(): string {
        return this.data.version;
    }

    getLastUpdated(): Date {
        return this.data.lastUpdated;
    }

    dispose(): void {
        this.onDidChangeDataEmitter.dispose();
    }
}
