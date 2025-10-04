export interface BaselineFeature {
    id: string;
    name: string;
    description: string;
    status: 'limited' | 'newly' | 'widely';
    baseline: {
        high: string;
        low: string;
    };
    support: {
        chrome: string;
        firefox: string;
        safari: string;
        edge: string;
    };
    mdn_url?: string;
    spec_url?: string;
    caniuse_id?: string;
    usage_recommendation?: string;
    progressive_enhancement?: string;
}

export interface BrowserSupport {
    chrome: string;
    firefox: string;
    safari: string;
    edge: string;
}

export interface ProjectConfiguration {
    browserSupport: string[];
    warningLevel: 'error' | 'warning' | 'info';
    autoCheck: boolean;
    cacheDuration: number;
    customFeatures?: BaselineFeature[];
}

export interface CompatibilityIssue {
    feature: BaselineFeature;
    severity: 'error' | 'warning' | 'info';
    message: string;
    range: {
        start: { line: number; character: number };
        end: { line: number; character: number };
    };
    suggestions?: string[];
    code?: string;
}

export interface FeatureUsage {
    feature: BaselineFeature;
    occurrences: number;
    files: string[];
    firstOccurrence: {
        file: string;
        line: number;
        character: number;
    };
}

export interface BaselineData {
    features: Map<string, BaselineFeature>;
    lastUpdated: Date;
    version: string;
}

export interface WebPlatformData {
    features: BaselineFeature[];
    lastUpdated: string;
    version: string;
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
