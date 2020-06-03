import OperationType from '@sidetree/common/src/enums/OperationType';

/**
 * Common model for a Sidetree operation.
 */
export default interface OperationModel {
  didUniqueSuffix: string;
  type: OperationType;
  operationBuffer: Buffer;
}
