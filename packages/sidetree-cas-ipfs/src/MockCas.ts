import FetchResultCode from '@sidetree/common/src/enums/FetchResultCode';
import ICas from '@sidetree/common/src/interfaces/ICas';
import FetchResult from '@sidetree/common/src/models/FetchResult';
import Unixfs from 'ipfs-unixfs';
import { DAGNode } from 'ipld-dag-pb';

/**
 * Implementation of a CAS class for testing.
 * Simply using a hash map to store all the content by hash.
 */
export default class MockCas implements ICas {
  /** A Map that stores the given content. */
  private storage: Map<string, Buffer> = new Map();

  /**
   * Gets the address that can be used to access the given content.
   */
  public async getAddress(content: Buffer): Promise<string> {
    const unixFs = new Unixfs('file', content);
    const dagNode = new DAGNode(unixFs.marshal());
    const dagLink = await dagNode.toDAGLink();
    const cidV1 = dagLink.Hash;
    const cidV0 = cidV1.toV0();
    return cidV0.toString();
  }

  public async write(content: Buffer): Promise<string> {
    const encodedHash = await this.getAddress(content);
    this.storage.set(encodedHash, content);
    return encodedHash;
  }

  public async read(address: string): Promise<FetchResult> {
    const content = this.storage.get(address);
    if (content === undefined) {
      return {
        code: FetchResultCode.NotFound,
      };
    }

    return {
      code: FetchResultCode.Success,
      content,
    };
  }
}
