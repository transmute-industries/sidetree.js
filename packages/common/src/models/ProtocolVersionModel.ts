/**
 * Defines a protocol version and its starting blockchain time.
 */
export default interface ProtocolVersionModel {
  /** The inclusive starting logical blockchain time that this protocol applies to. */
  startingBlockchainTime: number;
  version: string;
}
