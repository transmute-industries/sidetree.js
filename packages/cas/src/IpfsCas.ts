import {
  FetchResultCode,
  ICas,
  FetchResult,
  ServiceVersionModel,
} from '@sidetree/common';
import ipfsClient from 'ipfs-http-client';
import concat from 'it-concat';

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

  public getServiceVersion: () => ServiceVersionModel = () => {
    const { version } = require('../package.json');
    return {
      name: 'ipfs',
      version,
    };
  };

  public async write(content: Buffer): Promise<string> {
    const source = await this.ipfs.add(content);
    const file = await source.next();
    return file.value.path;
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
