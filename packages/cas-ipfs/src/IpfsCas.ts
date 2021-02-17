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
  FetchResultCode,
  ICas,
  FetchResult,
  ServiceVersionModel,
} from '@sidetree/common';
import ipfsClient from 'ipfs-http-client';
import concat from 'it-concat';
const { version } = require('../package.json');

export default class CasIpfs implements ICas {
  private ipfs: any;

  constructor(multiaddr: string) {
    const parts = multiaddr.split('/');

    if (parts[1] === 'ip4') {
      this.ipfs = ipfsClient({ host: parts[2], port: parts[4] });
    }

    if (parts[1] === 'dns4') {
      this.ipfs = ipfsClient({
        host: parts[2],
        port: parts[4],
        protocol: parts[5],
      });
    }
  }
  public async initialize(): Promise<void> {
    return;
  }

  public async close(): Promise<void> {
    return;
  }

  public getServiceVersion: () => ServiceVersionModel = () => {
    return {
      name: 'ipfs',
      version,
    };
  };

  public async write(content: Buffer): Promise<string> {
    const source = await this.ipfs.add(content);
    return source.path;
  }

  public async read(address: string): Promise<FetchResult> {
    try {
      const source = this.ipfs.get(address, { timeout: 2000 });
      const file = await source.next();
      const bufferList: any = await concat(file.value.content);
      const content = bufferList.copy();
      if (content) {
        return {
          code: FetchResultCode.Success,
          content,
        };
      }
      return {
        code: FetchResultCode.NotFound,
      };
    } catch (e) {
      if (e.name === 'TimeoutError') {
        return {
          code: FetchResultCode.NotFound,
        };
      } else {
        throw e;
      }
    }
  }
}
