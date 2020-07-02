import {
  AnchoredOperationModel,
  DidState,
  IOperationProcessor,
} from '@sidetree/common';

/**
 * Operation processor.
 */
export default class OperationProcessor implements IOperationProcessor {
  async apply(
    operation: AnchoredOperationModel,
    didState: DidState | undefined
  ): Promise<DidState | undefined> {
    /* tslint:disable-next-line */
    throw new Error(
      `OperationProcessor: Not implemented. Version: TestVersion1. Inputs: ${operation}, ${didState}`
    );
  }

  public async getRevealValue(
    anchoredOperationModel: AnchoredOperationModel
  ): Promise<Buffer> {
    throw new Error(
      `OperationProcessor: Not implemented. Version: TestVersion1. Inputs: ${anchoredOperationModel}`
    );
  }
}
