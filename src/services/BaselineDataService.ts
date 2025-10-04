import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import NodeCache from 'node-cache';
import { BaselineFeature, BaselineData, ProjectConfiguration, CacheEntry, WebPlatformData } from '../types/baseline';

export class BaselineDataService {
    private cache: NodeCache;
    private data: BaselineData;
    private config: ProjectConfiguration;
    private context: vscode.ExtensionContext;
    private webFeaturesPackage: any;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour default TTL
        this.data = {
            features: new Map(),
            lastUpdated: new Date(),
            version: '1.0.0'
        };
        this.config = this.loadConfiguration();
    }

    async initialize(): Promise<void> {
        try {
            // Try to load web-features package
            await this.loadWebFeaturesPackage();
            
            // Load baseline data from cache or fetch fresh
            await this.loadBaselineData();
            
            // Set up configuration watcher
            this.setupConfigurationWatcher();
            
            console.log('BaselineDataService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize BaselineDataService:', error);
            vscode.window.showErrorMessage('Failed to initialize Baseline data service');
        }
    }

    private async loadWebFeaturesPackage(): Promise<void> {
        try {
            // Try to require the web-features package
            this.webFeaturesPackage = require('web-features');
            console.log('web-features package loaded successfully');
        } catch (error) {
            console.warn('web-features package not available, using API fallback');
            this.webFeaturesPackage = null;
        }
    }

    private async loadBaselineData(): Promise<void> {
        // Try to load from cache first
        const cachedData = this.cache.get<BaselineData>('baselineData');
        if (cachedData) {
            this.data = cachedData;
            console.log('Baseline data loaded from cache');
            return;
        }

        // Try to load from web-features package
        if (this.webFeaturesPackage) {
            try {
                const features = this.webFeaturesPackage.getBaselineFeatures();
                this.data.features = new Map(features.map((f: any) => [f.id, f]));
                this.data.lastUpdated = new Date();
                this.cache.set('baselineData', this.data);
                console.log('Baseline data loaded from web-features package');
                return;
            } catch (error) {
                console.warn('Failed to load from web-features package:', error);
            }
        }

        // Fallback to Web Platform Dashboard API
        await this.fetchFromWebPlatformAPI();
    }

    private async fetchFromWebPlatformAPI(): Promise<void> {
        try {
            const response = await axios.get<WebPlatformData>('https://web-platform-dashboard.vercel.app/api/baseline');
            
            if (response.data && response.data.features) {
                this.data.features = new Map(
                    response.data.features.map(f => [f.id, f])
                );
                this.data.lastUpdated = new Date(response.data.lastUpdated);
                this.data.version = response.data.version;
                
                this.cache.set('baselineData', this.data);
                console.log('Baseline data loaded from Web Platform Dashboard API');
            }
        } catch (error) {
            console.error('Failed to fetch from Web Platform Dashboard API:', error);
            
            // Use fallback mock data
            this.loadMockData();
        }
    }

    private loadMockData(): void {
        // Mock data for demonstration purposes
        const mockFeatures: BaselineFeature[] = [
            {
                id: 'css-grid',
                name: 'CSS Grid Layout',
                description: 'Two-dimensional grid-based layout system',
                status: 'widely',
                baseline: {
                    high: '2017-03-14',
                    low: '2017-03-14'
                },
                support: {
                    chrome: '57',
                    firefox: '52',
                    safari: '10.1',
                    edge: '16'
                },
                mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout',
                spec_url: 'https://www.w3.org/TR/css-grid-1/',
                caniuse_id: 'css-grid',
                usage_recommendation: 'Safe to use with modern browsers',
                progressive_enhancement: 'Use flexbox as fallback for older browsers'
            },
            {
                id: 'css-custom-properties',
                name: 'CSS Custom Properties (Variables)',
                description: 'User-defined variables in CSS',
                status: 'widely',
                baseline: {
                    high: '2016-03-15',
                    low: '2016-03-15'
                },
                support: {
                    chrome: '49',
                    firefox: '31',
                    safari: '9.1',
                    edge: '15'
                },
                mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties',
                spec_url: 'https://www.w3.org/TR/css-variables-1/',
                caniuse_id: 'css-variables',
                usage_recommendation: 'Safe to use with modern browsers',
                progressive_enhancement: 'Use fallback values for older browsers'
            },
            {
                id: 'css-container-queries',
                name: 'CSS Container Queries',
                description: 'Query container dimensions for responsive design',
                status: 'newly',
                baseline: {
                    high: '2023-09-14',
                    low: '2023-09-14'
                },
                support: {
                    chrome: '105',
                    firefox: '110',
                    safari: '16.0',
                    edge: '105'
                },
                mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries',
                spec_url: 'https://www.w3.org/TR/css-contain-3/',
                caniuse_id: 'css-container-queries',
                usage_recommendation: 'Use with progressive enhancement',
                progressive_enhancement: 'Use media queries as fallback'
            },
            {
                id: 'css-subgrid',
                name: 'CSS Subgrid',
                description: 'Grid items can participate in their parent grid',
                status: 'limited',
                baseline: {
                    high: '2023-09-14',
                    low: '2023-09-14'
                },
                support: {
                    chrome: '117',
                    firefox: '71',
                    safari: '16.0',
                    edge: '117'
                },
                mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Subgrid',
                spec_url: 'https://www.w3.org/TR/css-grid-2/',
                caniuse_id: 'css-subgrid',
                usage_recommendation: 'Use with feature detection',
                progressive_enhancement: 'Use regular grid as fallback'
            },
            {
                id: 'javascript-optional-chaining',
                name: 'Optional Chaining',
                description: 'Safe property access with ?. operator',
                status: 'widely',
                baseline: {
                    high: '2020-01-01',
                    low: '2020-01-01'
                },
                support: {
                    chrome: '80',
                    firefox: '74',
                    safari: '13.1',
                    edge: '80'
                },
                mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
                spec_url: 'https://tc39.es/ecma262/#sec-optional-chaining',
                caniuse_id: 'optional-chaining',
                usage_recommendation: 'Safe to use with modern browsers',
                progressive_enhancement: 'Use logical AND operators as fallback'
            },
            {
                id: 'javascript-nullish-coalescing',
                name: 'Nullish Coalescing',
                description: 'Null and undefined coalescing with ?? operator',
                status: 'widely',
                baseline: {
                    high: '2020-01-01',
                    low: '2020-01-01'
                },
                support: {
                    chrome: '80',
                    firefox: '72',
                    safari: '13.1',
                    edge: '80'
                },
                mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing',
                spec_url: 'https://tc39.es/ecma262/#sec-nullish-coalescing-operator',
                caniuse_id: 'nullish-coalescing',
                usage_recommendation: 'Safe to use with modern browsers',
                progressive_enhancement: 'Use logical OR operators as fallback'
            }
        ];

        this.data.features = new Map(mockFeatures.map(f => [f.id, f]));
        this.data.lastUpdated = new Date();
        this.data.version = '1.0.0-mock';
        
        this.cache.set('baselineData', this.data);
        console.log('Mock baseline data loaded');
    }

    private loadConfiguration(): ProjectConfiguration {
        const config = vscode.workspace.getConfiguration('baseline');
        
        return {
            browserSupport: config.get('browserSupport', ['chrome 90', 'firefox 88', 'safari 14']),
            warningLevel: config.get('warningLevel', 'warning'),
            autoCheck: config.get('autoCheck', true),
            cacheDuration: config.get('cacheDuration', 3600)
        };
    }

    private setupConfigurationWatcher(): void {
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('baseline')) {
                this.config = this.loadConfiguration();
                this.cache.set('baselineData', this.data, this.config.cacheDuration);
            }
        });
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

    async refreshData(): Promise<void> {
        this.cache.del('baselineData');
        await this.loadBaselineData();
    }

    getDataVersion(): string {
        return this.data.version;
    }

    getLastUpdated(): Date {
        return this.data.lastUpdated;
    }

    dispose(): void {
        this.cache.flushAll();
    }
}
