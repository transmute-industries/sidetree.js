/**
 * Defines the external Anchor File structure.
 */
export default interface AnchorFileModel {
  map_file_uri: string;
  operations: {
    create?: {
      suffix_data: string;
    }[];
    recover?: {
      did_suffix: string;
      signed_data: string;
    }[];
    deactivate?: {
      did_suffix: string;
      signed_data: string;
    }[];
  };
}
