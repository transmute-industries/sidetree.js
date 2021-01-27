/*
 * Copyright 2020 - Transmute Industries Inc.
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
import { walletSvipOperation } from '../__fixtures__';
import { getCreatePayloadFromDocumentModel } from './getCreatePayloadFromDocumentModel';
import { toKeyPair } from './toKeyPair';

it('can get create operation from mnemonic', async () => {
  const mnemonic = walletSvipOperation.operation[0].mnemonic;
  const signingKeyPair = await toKeyPair(mnemonic, 0, 'Ed25519');
  const keyAgreementKeyPair = await toKeyPair(mnemonic, 0, 'X25519');
  const documentModel = {
    public_keys: [
      {
        id: signingKeyPair.id.split('#').pop(),
        type: 'JsonWebKey2020',
        jwk: signingKeyPair.publicKeyJwk,
        purpose: [
          PublicKeyPurpose.General,
          PublicKeyPurpose.Auth,
          PublicKeyPurpose.AssertionMethod,
          PublicKeyPurpose.CapabilityInvocation,
          PublicKeyPurpose.CapabilityDelegation,
        ],
      },
      {
        id: keyAgreementKeyPair.id.split('#').pop(),
        type: 'JsonWebKey2020',
        jwk: keyAgreementKeyPair.publicKeyJwk,
        purpose: [PublicKeyPurpose.General, PublicKeyPurpose.KeyAgreement],
      },
    ],
  };
  const createOperation = await getCreatePayloadFromDocumentModel(
    documentModel,
    signingKeyPair.publicKeyJwk,
    signingKeyPair.publicKeyJwk
  );
  expect(createOperation).toEqual(
    walletSvipOperation.operation[0].createOperation
  );
});
