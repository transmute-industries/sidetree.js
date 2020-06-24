import { Encoder, ErrorCode, OperationType } from '@sidetree/common';
import OperationGenerator from './generators/OperationGenerator';
import UpdateOperation from '../UpdateOperation';
import JasmineSidetreeErrorValidator from './JasmineSidetreeErrorValidator';

describe('UpdateOperation', () => {
  describe('parse()', () => {
    it('parse as expected', async () => {
      const [
        signingPublicKey,
        signingPrivateKey,
      ] = await OperationGenerator.generateKeyPair('key');
      const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
        'unused-DID-unique-suffix',
        signingPublicKey.jwk,
        signingPrivateKey,
        OperationGenerator.generateRandomHash(),
        []
      );

      const operationBuffer = Buffer.from(
        JSON.stringify(updateOperationRequest)
      );
      const result = await UpdateOperation.parse(operationBuffer);
      expect(result).toBeDefined();
    });

    it('should throw if didUniqueSuffix is not string.', async () => {
      const [
        signingPublicKey,
        signingPrivateKey,
      ] = await OperationGenerator.generateKeyPair('key');
      const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
        'unused-DID-unique-suffix',
        signingPublicKey.jwk,
        signingPrivateKey,
        'unusedNextUpdateCommitmentHash',
        'opaque-unused-document-patch'
      );

      (updateOperationRequest.did_suffix as any) = 123;

      const operationBuffer = Buffer.from(
        JSON.stringify(updateOperationRequest)
      );
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => UpdateOperation.parse(operationBuffer),
        ErrorCode.UpdateOperationMissingDidUniqueSuffix
      );
    });

    it('should throw if operation type is incorrect', async () => {
      const [
        signingPublicKey,
        signingPrivateKey,
      ] = await OperationGenerator.generateKeyPair('key');
      const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
        'unused-DID-unique-suffix',
        signingPublicKey.jwk,
        signingPrivateKey,
        'unusedNextUpdateCommitmentHash',
        'opaque-unused-document-patch'
      );

      updateOperationRequest.type = OperationType.Deactivate;

      const operationBuffer = Buffer.from(
        JSON.stringify(updateOperationRequest)
      );
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => UpdateOperation.parse(operationBuffer),
        ErrorCode.UpdateOperationTypeIncorrect
      );
    });
  });

  describe('parseObject()', () => {
    it('should throw if operation contains an additional unknown property.', async () => {
      const updateOperation = {
        did_suffix: 'unusedSuffix',
        signed_data: 'unusedSignedData',
        extraProperty: 'thisPropertyShouldCauseErrorToBeThrown',
      };

      const mapFileMode = true;
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () =>
          (UpdateOperation as any).parseObject(
            updateOperation,
            Buffer.from('anyValue'),
            mapFileMode
          ),
        ErrorCode.UpdateOperationMissingOrUnknownProperty
      );
    });
  });

  describe('parseSignedDataPayload()', () => {
    it('should throw if signedData is missing expected properties.', async () => {
      const signedData = {};
      const encodedSignedData = Encoder.encode(JSON.stringify(signedData));
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () =>
          (UpdateOperation as any).parseSignedDataPayload(encodedSignedData),
        ErrorCode.UpdateOperationSignedDataHasMissingOrUnknownProperty
      );
    });

    it('should throw if signedData contains an additional unknown property.', async () => {
      const signedData = {
        delta_hash: 'anyUnusedHash',
        extraProperty: 'An unknown extra property',
        update_key: {},
      };
      const encodedSignedData = Encoder.encode(JSON.stringify(signedData));
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () =>
          (UpdateOperation as any).parseSignedDataPayload(encodedSignedData),
        ErrorCode.UpdateOperationSignedDataHasMissingOrUnknownProperty
      );
    });
  });
});
