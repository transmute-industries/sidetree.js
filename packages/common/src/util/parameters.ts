import ProtocolParameters from '../models/ProtocolParameters';

/**
 * Defines the list of protocol parameters, intended ONLY to be used within each version of Sidetree.
 */
const protocolParameters: ProtocolParameters = {
  hashAlgorithmInMultihashCode: 18,
  maxAnchorFileSizeInBytes: 1000000,
  maxChunkFileSizeInBytes: 20000000,
  maxDeltaSizeInBytes: 1000,
  maxMapFileSizeInBytes: 1000000,
  maxNumberOfOperationsForNoValueTimeLock: 100,
  maxNumberOfOperationsPerTransactionTime: 600000,
  maxNumberOfTransactionsPerTransactionTime: 300,
  maxOperationsPerBatch: 10000,
  normalizedFeeToPerOperationFeeMultiplier: 0.01,
  valueTimeLockAmountMultiplier: 600,
};
export default protocolParameters;
