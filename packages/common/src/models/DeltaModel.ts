/**
 * Internal data structure of the delta for each operation.
 */
export default interface DeltaModel {
  patches: any[];
  update_commitment: string;
}
