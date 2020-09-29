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

import { generateMnemonic } from '../mnemonic';
import { writeFixture } from '../test/util';

const count = 5;

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    mnemonic: [],
  };

  for (let i = 0; i < count; i++) {
    const m0 = await generateMnemonic();
    expect(m0).toBeDefined();
    fixture.mnemonic.push(m0);
  }

  //   uncomment to debug
  //   console.log(JSON.stringify(fixture, null, 2));

  expect(fixture.mnemonic.length).toBe(5);
  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('mnemonic.json', fixture);
  }
});
