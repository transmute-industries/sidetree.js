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

import { SidetreeDocumentModel } from '../operations/types';
import { writeFixture } from '../test/util';
import { toKeyPair, computeDidUniqueSuffix, LocalSigner, operations } from '..';

import { wallet } from '@sidetree/test-vectors';

const WRITE_FIXTURE_TO_DISK = true;

jest.setTimeout(10 * 1000);

const keyType = 'Ed25519';

it('can generate test fixture', async () => {
  const fixture: any = {
    operations: [],
  };

  for (let i = 0; i < wallet.mnemonic.length; i++) {
    const { mnemonic } = wallet.mnemonic[i];
    // IonRequest module only supports this key type.
    const key0 = await toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/0");
    const key1 = await toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/1");
    const key2 = await toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/2");
    const document: SidetreeDocumentModel = {
      publicKeys: [
        {
          id: key0.id.split('#').pop(),
          type: key0.type,
          publicKeyJwk: key0.publicKeyJwk,
          purposes: ['authentication', 'assertionMethod', 'keyAgreement'],
        },
      ],
      services: [
        {
          id: 'example-service',
          type: 'ExampleService',
          serviceEndpoint: 'https://example.com',
        },
      ],
    } as any;

    const recoveryKey = key1.publicKeyJwk;
    const updateKey = key2.publicKeyJwk;
    const input1 = { recoveryKey, updateKey, document };
    const op0 = await operations.create(input1);

    const didUniqueSuffix = computeDidUniqueSuffix(op0.suffixData);

    const key3 = await toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/3");
    const key4 = await toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/4");
    const input2 = {
      didSuffix: didUniqueSuffix,
      updatePublicKey: key2.publicKeyJwk,
      nextUpdatePublicKey: key4.publicKeyJwk,
      servicesToAdd: [
        {
          id: 'example-service-2',
          type: 'ExampleService',
          serviceEndpoint: 'https://2.example.com',
        },
      ],
      idsOfServicesToRemove: ['example-service'],
      publicKeysToAdd: [
        {
          id: key3.id.split('#').pop(),
          type: key3.type,
          publicKeyJwk: key3.publicKeyJwk,
          purposes: ['authentication', 'assertionMethod', 'keyAgreement'],
        },
      ],
      idsOfPublicKeysToRemove: [key0.id.split('#').pop()],
      signer: LocalSigner.create(key2.privateKeyJwk),
    };

    const op1 = await operations.update(input2);

    const key5 = await toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/5");
    const key6 = await toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/6");
    const key7 = await toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/7");

    const recoverDocument: SidetreeDocumentModel = {
      publicKeys: [
        {
          id: key7.id.split('#').pop(),
          type: key7.type,
          publicKeyJwk: key7.publicKeyJwk,
          purposes: ['authentication', 'assertionMethod', 'keyAgreement'],
        } as any,
      ],
      services: [
        {
          id: 'example-service-3',
          type: 'ExampleService',
          serviceEndpoint: 'https://3.example.com',
        },
      ],
    };
    const op2 = await operations.recover({
      didSuffix: didUniqueSuffix,
      recoveryPublicKey: key1.publicKeyJwk,
      nextRecoveryPublicKey: key5.publicKeyJwk,
      nextUpdatePublicKey: key6.publicKeyJwk,
      document: recoverDocument,
      signer: LocalSigner.create(key1.privateKeyJwk),
    });

    const op3 = await operations.deactivate({
      didSuffix: didUniqueSuffix,
      recoveryPublicKey: key5.publicKeyJwk,
      signer: LocalSigner.create(key5.privateKeyJwk),
    });

    fixture.operations.push({
      mnemonic,
      didUniqueSuffix,
      op0,
      op1,
      op2,
      op3,
    });
  }

  // uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));
  expect(fixture.operations).toEqual(wallet.ed25519Operations);

  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('v1-ed25519-operations.json', fixture);
  }
});
