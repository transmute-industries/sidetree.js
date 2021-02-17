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

import { testSuite } from '@sidetree/cas';
import IpfsCas from '../IpfsCas';
import config from './config.json';

const cas = new IpfsCas(config.contentAddressableStoreServiceUri);

jest.setTimeout(10 * 1000);

beforeAll(async () => {
  // Need to wait so that ipfs has the time to be initialized
  await new Promise((resolve) => setTimeout(resolve, 5000));
});

testSuite(cas);
