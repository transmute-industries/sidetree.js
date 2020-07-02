import {
  IOperationQueue,
  IRequestHandler,
  ResponseModel,
} from '@sidetree/common';
import Resolver from '../../../Resolver';

/**
 * Request handler.
 */
export default class RequestHandler implements IRequestHandler {
  // tslint:disable-next-line: max-line-length
  public constructor(
    private resolver: Resolver,
    private operationQueue: IOperationQueue,
    private didMethodName: string,
    private supportedAlgorithms: number[]
  ) {
    console.debug(
      this.resolver,
      this.operationQueue,
      this.didMethodName,
      this.supportedAlgorithms
    );
  }

  async handleOperationRequest(request: Buffer): Promise<ResponseModel> {
    throw new Error(
      `RequestHandler: Not implemented. Version: TestVersion1. Inputs: ${request}`
    );
  }

  async handleResolveRequest(didOrDidDocument: string): Promise<ResponseModel> {
    throw new Error(
      `RequestHandler: Not implemented. Version: TestVersion1. Inputs: ${didOrDidDocument}`
    );
  }
}
