import { JwkEs256k, OperationType, PublicKeyModel } from '@sidetree/common';
import CreateOperation from '../CreateOperation';
import OperationGenerator from './generators/OperationGenerator';

interface ICreateOperationData {
  createOperation: CreateOperation;
  operationRequest: {
    type: OperationType;
    suffix_data: string;
    delta: string;
  };
  recoveryPublicKey: any;
  recoveryPrivateKey: any;
  signingKeyId: string;
  signingPublicKey: PublicKeyModel;
  signingPrivateKey: JwkEs256k;
  nextUpdateRevealValueEncodedString: string;
}

describe('Operations', () => {
  let createOperationData: ICreateOperationData;
  describe('create', () => {
    it('should generate a create operation', async () => {
      createOperationData = await OperationGenerator.generateCreateOperation();
      expect(createOperationData).toBeDefined();
    });
  });

  describe('update', () => {
    it('should generate an update operation', async () => {
      const updateOperationData = await OperationGenerator.generateUpdateOperation(
        createOperationData.createOperation.didUniqueSuffix,
        createOperationData.nextUpdateRevealValueEncodedString,
        createOperationData.signingKeyId,
        createOperationData.signingPrivateKey,
        {}
      );
      expect(updateOperationData).toBeDefined();
    });
  });

  describe('recover', () => {
    it('should generate a recover operation', async () => {
      const recoverOperationData = await OperationGenerator.generateRecoverOperation(
        {
          didUniqueSuffix: createOperationData.createOperation.didUniqueSuffix,
          recoveryPrivateKey: createOperationData.recoveryPrivateKey,
        }
      );
      expect(recoverOperationData).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should generate a delete operation', async () => {
      const deleteOperationData = await OperationGenerator.createDeactivateOperation(
        createOperationData.createOperation.didUniqueSuffix,
        createOperationData.recoveryPrivateKey
      );
      expect(deleteOperationData).toBeDefined();
    });
  });
});
