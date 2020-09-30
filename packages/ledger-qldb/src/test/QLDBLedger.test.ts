/*
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

import { testSuite } from '@sidetree/ledger';
import QLDBLedger from '..';
import AWS from 'aws-sdk';

jest.setTimeout(10 * 1000);

const config = new AWS.Config();
if (!config.credentials) {
  console.warn(
    'No AWS credentials found in ~/.aws/credentials, skipping QLDB tests...'
  );
  // eslint-disable-next-line no-global-assign
  describe = describe.skip;
}

describe('QLDB tests', () => {
  const ledger = new QLDBLedger('photon-test', 'Test');

  beforeAll(async () => {
    await ledger.reset();
  });

  it('should initialize the ledger', async () => {
    await ledger.initialize();
    const tableNames = await ledger.qldbDriver.getTableNames();
    expect(tableNames.includes(ledger.transactionTable)).toBeTruthy();
  });

  testSuite(ledger);
});
