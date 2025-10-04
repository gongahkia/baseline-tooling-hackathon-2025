export interface BaselineConfig {
  browserSupport?: string[];
  warningLevel?: 'error' | 'warning' | 'info';
  autoCheck?: boolean;
  cacheDuration?: number;
  excludePatterns?: string[];
  customFeatures?: BaselineFeature[];
  teamSettings?: TeamSettings;
}

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

export interface TeamSettings {
  notifyOnNewFeatures?: boolean;
  requireApprovalForLimited?: boolean;
  autoUpdateBaseline?: boolean;
}
