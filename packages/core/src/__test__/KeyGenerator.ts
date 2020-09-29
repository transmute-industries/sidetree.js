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

import { PublicKeyPurpose } from '@sidetree/common';
import { toKeyPair } from '@sidetree/crypto';

const { crypto } = require('@sidetree/test-vectors');

export class KeyGenerator {
  constructor(
    public counter: number = 0,
    public mnemonic: string = crypto.mnemonic.mnemonic[0]
  ) {
    //nop
  }

  async getKeyPair(
    mnemonic: string = this.mnemonic,
    index: number = this.counter,
    type = 'Ed25519'
  ) {
    const keypairId = `key-${index}`;
    let publicKeyJwk = undefined;
    let privateKeyJwk = undefined;
    const keypair = await toKeyPair(mnemonic, index, type);
    ({ publicKeyJwk, privateKeyJwk } = await keypair.toJsonWebKeyPair(true));
    this.counter++;
    return {
      id: keypairId,
      publicKeyJwk,
      privateKeyJwk,
    };
  }

  async getSidetreeInternalDataModelKeyPair(_id?: string) {
    const { id, publicKeyJwk, privateKeyJwk } = await this.getKeyPair();

    const sidetreeInternalDataModelPublicKey = {
      id: _id || id,
      type: 'JsonWebKey2020',
      jwk: publicKeyJwk,
      purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
    };
    return {
      sidetreeInternalDataModelPublicKey,
      privateKeyJwk: privateKeyJwk,
    };
  }
}
