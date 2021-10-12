/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Encoder,
  FetchResultCode,
  ICasService,
  FetchResult,
  ServiceVersionModel,
} from '@sidetree/common';
import Unixfs from 'ipfs-unixfs';
import { DAGNode } from 'ipld-dag-pb';
const { version } = require('../package.json');

/**
 * Implementation of a CAS class for testing.
 * Simply using a hash map to store all the content by hash.
 */
export default class MockS3Cas implements ICasService {
  /** A Map that stores the given content. */
  private storage: Map<string, Buffer> = new Map();

  /** Time taken in seconds for each mock fetch. */
  private mockSecondsTakenForEachCasFetch = 0;

  constructor(mockSecondsTakenForEachCasFetch?: number) {
    if (mockSecondsTakenForEachCasFetch !== undefined) {
      this.mockSecondsTakenForEachCasFetch = mockSecondsTakenForEachCasFetch;
    }
  }

  async initialize(): Promise<void> {
    return;
  }

  async close(): Promise<void> {
    return;
  }

  public getServiceVersion: () => Promise<ServiceVersionModel> = () => {
    return Promise.resolve({
      name: 'mock-s3',
      version,
    });
  };
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
    const encodedHash = Encoder.formatBase64Address(dagLink.Hash.toString());
    return encodedHash;
  }

  public async write(content: Buffer): Promise<string> {
    const encodedHash = await MockS3Cas.getAddress(content);
    this.storage.set(encodedHash, content);
    return encodedHash;
  }

  public async read(address: string): Promise<FetchResult> {
    await new Promise((resolve) =>
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
