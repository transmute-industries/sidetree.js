import ipfsClient from 'ipfs-http-client';
import concat from 'it-concat';
export const multiaddr = '/ip4/127.0.0.1/tcp/5001';
export const ipfs = ipfsClient(multiaddr);
export const methods = {
  // takes a cid string, returns a json object.
  read: async (ipfs: any, cid: string) => {
    const source = ipfs.get(cid);
    const files = [];
    for await (const file of source) {
      const fileContentString = (await concat(file.content)).toString();
      const fileObject = JSON.parse(fileContentString);
      files.push(fileObject);
    }
    return files[0];
  },
  write: async (ipfs: any, obj: any) => {
    const source = await ipfs.add(Buffer.from(JSON.stringify(obj)));
    const files = [];
    for await (const file of source) {
      files.push(file);
    }
    return files[0].path;
  },
};

export const testObj = {
  hello: 'world',
};
export const testString = 'string';
export const testInteger = 1;
