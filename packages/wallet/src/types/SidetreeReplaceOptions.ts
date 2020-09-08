export interface SidetreeReplacePublicKey {
  id: string;
  type: string;
  jwk: any;
  purpose: string[];
}

export interface SidetreeReplaceSerice {
  id: string;
  type: string;
  endpoint: string;
}

export interface SidetreeReplaceOptions {
  public_keys?: SidetreeReplacePublicKey[];
  service_endpoints?: SidetreeReplaceSerice[];
}
