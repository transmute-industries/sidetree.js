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
import { ErrorCode, Encoder } from '@sidetree/common';
import Did from '../Did';
import JasmineSidetreeErrorValidator from './JasmineSidetreeErrorValidator';
import OperationGenerator from './generators/OperationGenerator';

describe('DID', () => {
  describe('create()', () => {
    it('should create a short-form DID successfully.', async () => {
      const expectedDidMethodName = 'sidetree';
      const uniqueSuffix = 'abcdefg';
      const didString = `did:${expectedDidMethodName}:${uniqueSuffix}`;
      const did = await Did.create(didString, expectedDidMethodName);
      expect(did.didMethodName).toEqual(expectedDidMethodName);
      expect(did.createOperation).toBeUndefined();
      expect(did.isShortForm).toBeTruthy();
      expect(did.shortForm).toEqual(didString);
      expect(did.uniqueSuffix).toEqual(uniqueSuffix);
    });

    it('should create a long-form DID succssefully.', async () => {
      // Create a long-form DID string.
      const createOperationData = await OperationGenerator.generateCreateOperation();
      const didMethodName = 'sidetree';
      const didUniqueSuffix =
        createOperationData.createOperation.didUniqueSuffix;
      const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
      const encodedSuffixData =
        createOperationData.createOperation.encodedSuffixData;
      const encodedDelta = createOperationData.createOperation.encodedDelta;
      const longFormDid = `${shortFormDid}?-sidetree-initial-state=${encodedSuffixData}.${encodedDelta}`;

      const did = await Did.create(longFormDid, didMethodName);
      expect(did.isShortForm).toBeFalsy();
      expect(did.didMethodName).toEqual(didMethodName);
      expect(did.shortForm).toEqual(shortFormDid);
      expect(did.uniqueSuffix).toEqual(didUniqueSuffix);
      expect(did.createOperation).toEqual(createOperationData.createOperation);
    });

    it('should create a testnet long-form DID succssefully.', async () => {
      // Create a long-form DID string.
      const createOperationData = await OperationGenerator.generateCreateOperation();
      const didMethodName = 'sidetree:testnet'; // A method name with network ID.
      const didUniqueSuffix =
        createOperationData.createOperation.didUniqueSuffix;
      const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
      const encodedSuffixData =
        createOperationData.createOperation.encodedSuffixData;
      const encodedDelta = createOperationData.createOperation.encodedDelta;
      const longFormDid = `${shortFormDid}?-sidetree-initial-state=${encodedSuffixData}.${encodedDelta}`;

      const did = await Did.create(longFormDid, didMethodName);
      expect(did.isShortForm).toBeFalsy();
      expect(did.didMethodName).toEqual(didMethodName);
      expect(did.shortForm).toEqual(shortFormDid);
      expect(did.uniqueSuffix).toEqual(didUniqueSuffix);
      expect(did.createOperation).toEqual(createOperationData.createOperation);
    });

    it('should throw error if more than one query param is provided', async () => {
      // Create a long-form DID string.
      const createOperationData = await OperationGenerator.generateCreateOperation();
      const encodedCreateOperationRequest = Encoder.encode(
        createOperationData.createOperation.operationBuffer
      );
      const didMethodName = 'sidetree';
      const didUniqueSuffix =
        createOperationData.createOperation.didUniqueSuffix;
      const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
      const longFormDid = `${shortFormDid}?-sidetree-initial-state=${encodedCreateOperationRequest}&extra-param`;

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () => Did.create(longFormDid, didMethodName),
        ErrorCode.DidLongFormOnlyOneQueryParamAllowed
      );
    });

    it('should throw if DID given does not match the expected DID method name.', async () => {
      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () =>
          Did.create(
            'did:sidetree:EiAgE-q5cRcn4JHh8ETJGKqaJv1z2OgjmN3N-APx0aAvHg',
            'sidetree2'
          ),
        ErrorCode.DidIncorrectPrefix
      );
    });

    it('should throw if DID given does not contain unique suffix.', async () => {
      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () => Did.create('did:sidetree:', 'sidetree'),
        ErrorCode.DidNoUniqueSuffix
      );
    });

    it('should throw if encoded DID document in long-form DID given results in a mismatching short-form DID.', async () => {
      const createOperationData = await OperationGenerator.generateCreateOperation();
      const didMethodName = 'sidetree';
      const encodedSuffixData =
        createOperationData.createOperation.encodedSuffixData;
      const encodedDelta = createOperationData.createOperation.encodedDelta;
      const mismatchingShortFormDid = `did:${didMethodName}:EiA_MismatchingDID_AAAAAAAAAAAAAAAAAAAAAAAAAAA`;
      const longFormDid = `${mismatchingShortFormDid}?-sidetree-initial-state=${encodedSuffixData}.${encodedDelta}`;

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () => Did.create(longFormDid, didMethodName),
        ErrorCode.DidUniqueSuffixFromInitialStateMismatch
      );
    });

    it('should throw if the given did string does not have query param', async () => {
      // Create a long-form DID string.
      const createOperationData = await OperationGenerator.generateCreateOperation();
      const didMethodName = 'sidetree';
      const didUniqueSuffix =
        createOperationData.createOperation.didUniqueSuffix;
      const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
      const longFormDid = `${shortFormDid}?`;

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () => Did.create(longFormDid, didMethodName),
        ErrorCode.DidLongFormNoInitialStateFound
      );
    });
  });

  describe('constructCreateOperationFromInitialState()', () => {
    it('should throw if the given initial state string does not have a dot.', async () => {
      const initialState = 'abcdefg'; // Intentionally missing '.'

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () =>
          (Did as any).constructCreateOperationFromInitialState(initialState),
        ErrorCode.DidInitialStateValueContainsNoDot
      );
    });

    it('should throw if the given initial state string has more than one dot.', async () => {
      const initialState = 'abc.123.'; // Intentionally having more than 1 '.'

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () =>
          (Did as any).constructCreateOperationFromInitialState(initialState),
        ErrorCode.DidInitialStateValueContainsMoreThanOneDot
      );
    });

    it('should throw if there are no two parts in intial state.', async () => {
      const initialState1 = 'abc.'; // Intentionally not having two parts after splitting by '.'
      const initialState2 = '.abc'; // Intentionally not having two parts after splitting by '.'

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () =>
          (Did as any).constructCreateOperationFromInitialState(initialState1),
        ErrorCode.DidInitialStateValueDoesNotContainTwoParts
      );

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () =>
          (Did as any).constructCreateOperationFromInitialState(initialState2),
        ErrorCode.DidInitialStateValueDoesNotContainTwoParts
      );
    });
  });

  describe('getInitialStateFromDidString()', () => {
    it('should throw if the given DID string is not a valid url format', async () => {
      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        async () =>
          (Did as any).getInitialStateFromDidString(
            '@#$%^:sdietree:123',
            'sidetree'
          ),
        ErrorCode.DidInvalidDidString
      );
    });

    it('should expect -<method-name>-initial-state URL param name to not contain network ID if method name given contains network ID.', async () => {
      const initialState = (Did as any).getInitialStateFromDidString(
        'did:sdietree:123?-sidetree-initial-state=xyz',
        'sidetree:test'
      );
      expect(initialState).toEqual('xyz');
    });
  });
});
