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
import S3 from 'aws-sdk/clients/s3';
import { CredentialsOptions } from 'aws-sdk/lib/credentials';
const { version } = require('../package.json');

/**
 * Implementation of a CAS class for testing.
 * Simply using a hash map to store all the content by hash.
 */
export default class S3Cas implements ICasService {
  private s3: S3;

  constructor(private bucketName: string, config?: CredentialsOptions) {
    if (!this.bucketName) {
      throw new Error('You must specify a bucketName');
    }
    if (config) {
      this.s3 = new S3({ ...config });
    } else {
      // Load AWS credentials from ~/.aws/credentials file
      this.s3 = new S3();
    }
  }

  public getServiceVersion: () => Promise<ServiceVersionModel> = () => {
    return Promise.resolve({
      name: 'cas-s3',
      version,
    });
  };

  async initialize(): Promise<void> {
    if (this.s3.config.credentials) {
      const bucketParams = {
        Bucket: this.bucketName,
      };
      await this.s3.createBucket(bucketParams).promise();
    }
  }

  async close(): Promise<void> {
    return;
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
    const encodedHash = await S3Cas.getAddress(content);
    const writeResult = await this.s3
      .upload({
        Bucket: this.bucketName,
        Key: encodedHash,
        Body: content,
      })
      .promise();
    const key = writeResult.Key;
    console.assert(key === encodedHash, `${key} should match ${encodedHash}`);
    return key;
  }

  public async read(address: string): Promise<FetchResult> {
    if (Encoder.isBase64UrlString(address) && address.indexOf('Ei') === 0) {
      address = Encoder.formatIpfsAddress(address);
    }

    try {
      const readResult = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: address,
        })
        .promise();
      const content = readResult.Body as Buffer;
      return {
        code: FetchResultCode.Success,
        content,
      };
    } catch (err) {
      return {
        code: FetchResultCode.NotFound,
      };
    }
  }
}
