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

import { Encoder, ErrorCode, Multihash, OperationType } from '@sidetree/common';
import JasmineSidetreeErrorValidator from './JasmineSidetreeErrorValidator';
import Jwk from '../util/Jwk';
import OperationGenerator from './generators/OperationGenerator';
import RecoverOperation from '../RecoverOperation';

describe('RecoverOperation', () => {
  describe('parse()', () => {
    it('parse as expected', async () => {
      const [, recoveryPrivateKey] = await Jwk.generateEd25519KeyPair();
      const [newRecoveryPublicKey] = await Jwk.generateEd25519KeyPair();
      const [newSigningPublicKey] = await OperationGenerator.generateKeyPair(
        'singingKey'
      );

      const recoverOperationRequest = await OperationGenerator.generateRecoverOperationRequest(
        'unused-DID-unique-suffix',
        recoveryPrivateKey,
        newRecoveryPublicKey,
        newSigningPublicKey
      );

      const operationBuffer = Buffer.from(
        JSON.stringify(recoverOperationRequest)
      );
      const result = await RecoverOperation.parse(operationBuffer);
      expect(result).toBeDefined();
    });

    it('should throw if operation type is incorrect', async () => {
      const [, recoveryPrivateKey] = await Jwk.generateEd25519KeyPair();
      const [newRecoveryPublicKey] = await Jwk.generateEd25519KeyPair();
      const [newSigningPublicKey] = await OperationGenerator.generateKeyPair(
        'singingKey'
      );

      const recoverOperationRequest = await OperationGenerator.generateRecoverOperationRequest(
        'unused-DID-unique-suffix',
        recoveryPrivateKey,
        newRecoveryPublicKey,
        newSigningPublicKey
      );

      recoverOperationRequest.type = OperationType.Create; // Intentionally incorrect type.

      const operationBuffer = Buffer.from(
        JSON.stringify(recoverOperationRequest)
      );
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => RecoverOperation.parse(operationBuffer),
        ErrorCode.RecoverOperationTypeIncorrect
      );
    });

    it('should throw if didUniqueSuffix is not string.', async () => {
      const [, recoveryPrivateKey] = await Jwk.generateEd25519KeyPair();
      const [newRecoveryPublicKey] = await Jwk.generateEd25519KeyPair();
      const [newSigningPublicKey] = await OperationGenerator.generateKeyPair(
        'singingKey'
      );

      const recoverOperationRequest = await OperationGenerator.generateRecoverOperationRequest(
        'unused-DID-unique-suffix',
        recoveryPrivateKey,
        newRecoveryPublicKey,
        newSigningPublicKey
      );

      (recoverOperationRequest.did_suffix as any) = 123; // Intentionally incorrect type.

      const operationBuffer = Buffer.from(
        JSON.stringify(recoverOperationRequest)
      );
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => RecoverOperation.parse(operationBuffer),
        ErrorCode.RecoverOperationMissingOrInvalidDidUniqueSuffix
      );
    });
  });

  describe('parseOperationFromAnchorFile()', () => {
    it('should parse the operation included in an anchor file without the `delta` property.', async () => {
      const didUniqueSuffix = 'anyDidSuffix';
      const [, recoveryPrivateKey] = await Jwk.generateEd25519KeyPair();

      const recoverOperationData = await OperationGenerator.generateRecoverOperation(
        { didUniqueSuffix, recoveryPrivateKey }
      );
      const recoverOperationRequest = JSON.parse(
        recoverOperationData.operationBuffer.toString()
      );

      // Intentionally remove properties that wouldn't exist in an anchor file.
      delete recoverOperationRequest.type;
      delete recoverOperationRequest.delta;

      const recoverOperation = await RecoverOperation.parseOperationFromAnchorFile(
        recoverOperationRequest
      );

      expect(recoverOperation).toBeDefined();
      expect(recoverOperation.delta).toBeUndefined();
      expect(recoverOperation.didUniqueSuffix).toEqual(didUniqueSuffix);
    });
  });

  describe('parseObject()', () => {
    it('should throw if operation contains an additional unknown property.', async () => {
      const recoverOperation = {
        did_suffix: 'unusedSuffix',
        recovery_reveal_value: 'unusedReveal',
        signed_data: 'unusedSignedData',
        extraProperty: 'thisPropertyShouldCauseErrorToBeThrown',
      };

      const anchorFileMode = true;
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () =>
          (RecoverOperation as any).parseObject(
            recoverOperation,
            Buffer.from('anyValue'),
            anchorFileMode
          ),
        ErrorCode.RecoverOperationMissingOrUnknownProperty
      );
    });
  });

  describe('parseSignedDataPayload()', () => {
    it('should throw if signedData contains an additional unknown property.', async () => {
      const signedData = {
        delta_hash: 'anyUnusedHash',
        recovery_key: 'anyUnusedRecoveryKey',
        nextRecoveryCommitmentHash: Encoder.encode(
          Multihash.hash(Buffer.from('some one time password'))
        ),
        extraProperty: 'An unknown extra property',
        recovery_reveal_value: 'some value',
      };
      const encodedSignedData = Encoder.encode(JSON.stringify(signedData));
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () =>
          (RecoverOperation as any).parseSignedDataPayload(encodedSignedData),
        ErrorCode.RecoverOperationSignedDataMissingOrUnknownProperty
      );
    });

    it('should throw if signedData missing property.', async () => {
      const signedData = {};
      const encodedSignedData = Encoder.encode(JSON.stringify(signedData));
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () =>
          (RecoverOperation as any).parseSignedDataPayload(encodedSignedData),
        ErrorCode.RecoverOperationSignedDataMissingOrUnknownProperty
      );
    });
  });
});
