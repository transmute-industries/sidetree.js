import { FetchResultCode, ICas, FetchResult } from '@sidetree/common';
import Unixfs from 'ipfs-unixfs';
import { DAGNode } from 'ipld-dag-pb';

/**
 * Implementation of a CAS class for testing.
 * Simply using a hash map to store all the content by hash.
 */
export default class MockCas implements ICas {
  /** A Map that stores the given content. */
  private storage: Map<string, Buffer> = new Map();

  /** Time taken in seconds for each mock fetch. */
  private mockSecondsTakenForEachCasFetch = 0;

  constructor(mockSecondsTakenForEachCasFetch?: number) {
    if (mockSecondsTakenForEachCasFetch !== undefined) {
      this.mockSecondsTakenForEachCasFetch = mockSecondsTakenForEachCasFetch;
    }
  }

  /**
   * Gets the address that can be used to access the given content.
   */
  public static async getAddress(content: Buffer): Promise<string> {
    const unixFs = new Unixfs('file', content);
    const marshaled = unixFs.marshal();
    const dagNode = new DAGNode(marshaled);
    const dagLink = await dagNode.toDAGLink({
      cidVersion: 0,
    });
    return dagLink.Hash.toString();
  }

  public async write(content: Buffer): Promise<string> {
    const encodedHash = await MockCas.getAddress(content);
    this.storage.set(encodedHash, content);
    return encodedHash;
  }

  public async read(address: string): Promise<FetchResult> {
    // Wait for configured time before returning.
    await new Promise(resolve =>
      setTimeout(resolve, this.mockSecondsTakenForEachCasFetch * 1000)
    );
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
