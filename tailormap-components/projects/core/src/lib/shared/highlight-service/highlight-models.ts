
export interface HighlightParams {
  application: number;
  featureId: string;
  appLayer?: string;        // id
  // sft?: any;
  // solrconfig?: any;
}

export interface HighlightResponse {
  geom?: string;
  success?: boolean;
}
