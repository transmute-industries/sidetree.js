import ICas from '@sidetree/common/src/interfaces/ICas';
import FetchResult from '@sidetree/common/src/models/FetchResult';
import FetchResultCode from '@sidetree/common/src/enums/FetchResultCode';
import ipfsClient from 'ipfs-http-client';
import concat from 'it-concat';

// https://italonascimento.github.io/applying-a-timeout-to-your-promises/
const resolveValueOrNullInSeconds = (promise, seconds) => {
  const timeout = new Promise(resolve => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve(null);
    }, seconds * 1000);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};

export default class CasIpfs implements ICas {
  private ipfs;

  constructor(multiaddr) {
    const parts = multiaddr.split('/');

    if (parts[1] === 'ip4') {
      this.ipfs = ipfsClient(multiaddr);
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
    const source = this.ipfs.get(address);
    let content;
    for await (const file of source) {
      content = Buffer.from((await concat(file.content)).toString());
      break;
    }
    if (content) {
      return {
        code: FetchResultCode.Success,
        content,
      };
    }
    return {
      code: FetchResultCode.NotFound,
    };
  }
}
