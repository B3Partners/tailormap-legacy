export interface ExportFeaturesParameters {
  application: number;
  appLayer: number;
  type: string; // Export type (SHP, XLS, etc)
  featureType?: number;
  debug?: boolean;
  params?: string; // Other parameters (filter etc?)
}
