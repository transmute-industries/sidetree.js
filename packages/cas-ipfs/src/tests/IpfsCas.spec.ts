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

import ipfsClient from 'ipfs-http-client';
import concat from 'it-concat';
import fetch from 'node-fetch';
import config from './config.json';

const testObj = {
  hello: 'world',
};
const testObjMultihash = 'QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen';

it('lol', async () => {
  const hi = await fetch(
    'http://127.0.0.1:5001/api/v0/get?timeout=2000ms&arg=QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen',
    { method: 'POST' }
  ).then((res: any) => res.text());
  console.log(hi);
});

it.skip('should', async () => {
  const ipfs = ipfsClient(config.contentAddressableStoreServiceUri);
  const text = JSON.stringify(testObj);
  const source1 = await ipfs.get(testObjMultihash, { timeout: 2000 });
  const file = await source1.next();
  const bufferList: any = await concat(file.value.content);
  const content = bufferList.copy();
  console.log({ content });
  const source = await ipfs.add([text], { recursive: true });
  console.log({ source });
});
