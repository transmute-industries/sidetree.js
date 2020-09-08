export interface SidetreeRecoverOperation {
  type: 'recover';
  did_suffix: string;
  signed_data: string;
  delta: string;
}
