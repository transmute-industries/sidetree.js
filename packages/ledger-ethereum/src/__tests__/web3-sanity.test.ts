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

import { web3 } from './web3';

describe('web3 sanity', () => {
  it('get accounts', async () => {
    const accounts = await web3.eth.getAccounts();
    expect(accounts).toEqual([
      '0x1E228837561e32a6eC1b16f0574D6A493Edc8863',
      '0x3bFE8B6CDEaD4574f187877b92b7e9AEE4B7e62C',
      '0x63CACa7bb65Dc9c9898A5f7da3d79876Af854BCf',
      '0x57cb9699EC7B4fb22bF4c0eB1597Ee50F6243260',
      '0x18f923D8B5f1713471121d1c26E44D5b1931c19c',
      '0x521173Dc15a9521f09ac2565bDc7A0E0a6f0B33e',
      '0x767C4Dc7917C8C527A26fB9E099aAE3C3715a683',
      '0x4aF97A813d61435a6af52fFc26cdDb6FcC9C7B65',
      '0x75466c9A7c5288F050b02852bC14d7964c7DeEde',
      '0x43c3DF1F5EFE517B9eece0868b522116d885571a',
    ]);
  });
});
