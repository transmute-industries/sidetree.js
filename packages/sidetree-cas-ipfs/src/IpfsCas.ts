import ICas from '@sidetree/common/src/interfaces/ICas';
import FetchResult from '@sidetree/common/src/models/FetchResult';
import FetchResultCode from '@sidetree/common/src/enums/FetchResultCode';
import ipfsClient from 'ipfs-http-client';
import concat from 'it-concat';

export default class CasIpfs implements ICas {
  private ipfs;

  constructor(multiaddr) {
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

  public async write(content: Buffer): Promise<string> {
    const source = await this.ipfs.add(content);
    for await (const file of source) {
      return file.path;
    }
    return '';
  }

  public async read(address: string): Promise<FetchResult> {
    try {
      const source = this.ipfs.get(address, { timeout: 2000 });
      const file = await source.next();
      const bufferList = await concat(file.value.content);
      const content = Buffer.from(bufferList.toString());
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
