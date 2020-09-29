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

const SimpleSidetreeAnchor = artifacts.require('./SimpleSidetreeAnchor.sol');

const anchorFileHash =
  '0x3ddbe2be8cfc5313f6160bfa263651f000fb70e5a6af72f3de798fa58933f3d9';

contract('SimpleSidetreeAnchor', (accounts) => {
  let instance;

  before(async () => {
    instance = await SimpleSidetreeAnchor.deployed();
  });

  it('contract is deployed', async () => {
    expect(instance);
  });

  it('can write anchor', async () => {
    const receipt = await instance.anchorHash(anchorFileHash, {
      from: accounts[0],
    });
    assert(receipt.logs.length === 1);
    const [log] = receipt.logs;
    assert(log.event === 'Anchor');
    assert(log.args.anchorFileHash === anchorFileHash);
    assert(log.args.transactionNumber.toNumber() === 0);
  });

  it('can read anchor', async () => {
    const events = await instance.getPastEvents('Anchor', {
      fromBlock: 0,
      toBlock: 'latest',
    });
    assert(events.length === 1);
  });

  it('can listen for anchor', () => {
    return new Promise((done) => {
      instance.Anchor(async (err, log) => {
        assert(log.args.anchorFileHash === anchorFileHash);
        assert(log.args.transactionNumber.toNumber() === 1);
        done();
      });

      instance.anchorHash(anchorFileHash, {
        from: accounts[0],
      });
    });
  });
});
