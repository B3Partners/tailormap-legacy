// Parameters as defined in viewer/src/main/java/nl.b3p.viewer/stripes/DownloadFeaturesActionBean

export interface ExportFeaturesParameters {
  application: number;
  appLayer: number;
  type: string; // Export type (SHP, XLS, etc)
  featureType?: number;
  debug?: boolean;
  params?: string; // Other parameters (filter etc?)
}
