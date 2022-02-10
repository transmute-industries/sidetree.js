/*
 * Copyright 2021 - Transmute Industries Inc.
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

import { BitcoinLedger } from '..';

jest.setTimeout(10 * 1000);

describe('BitcoinLedger', () => {
  const ledger = new BitcoinLedger();

  it('should return best block hash', async () => {
    const bestBlockHash = await ledger.getBestBlockHash();
    expect(bestBlockHash).toBeDefined();
  });
});
