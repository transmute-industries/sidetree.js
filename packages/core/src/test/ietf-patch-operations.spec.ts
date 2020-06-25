import IetfOperationGenerator from './generators/IetfOperationGenerator';
import {
  OperationType,
  DidState,
  IOperationProcessor,
  IOperationStore,
} from '@sidetree/common';
import OperationProcessor from '../OperationProcessor';
import Resolver from '../Resolver';
import MockOperationStore from './mocks/MockOperationStore';
import MockVersionManager from './mocks/MockVersionManager';

describe('IETF Patch operations', () => {
  let resolver: Resolver;
  let operationProcessor: IOperationProcessor;
  let operationStore: IOperationStore;

  beforeEach(async () => {
    // Make sure the mock version manager always returns the same operation processor in the test.
    operationProcessor = new OperationProcessor();
    const versionManager = new MockVersionManager();
    const spy = jest.spyOn(versionManager, 'getOperationProcessor');
    spy.mockReturnValue(operationProcessor);

    operationStore = new MockOperationStore();
    resolver = new Resolver(versionManager, operationStore);
  });

  describe('Create operation', () => {
    it('should create a did document', async () => {
      const {
        createOperation,
      } = await IetfOperationGenerator.generateCreateOperation();
      const { didUniqueSuffix, operationBuffer } = createOperation;
      const anchoredOperationModel = {
        type: OperationType.Create,
        didUniqueSuffix,
        operationBuffer,
        transactionNumber: 1,
        transactionTime: 1,
        operationIndex: 1,
      };

      await operationStore.put([anchoredOperationModel]);
      const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
      expect(didState.document.publicKey.length).toEqual(1);
      expect(didState.document.service.length).toEqual(1);

      // // Create an update operation and insert it to the operation store.
      // const [additionalKey] = await OperationGenerator.generateKeyPair(
      //   `new-key1`
      // );
      // let [
      //   nextUpdateKey,
      //   nextUpdatePrivateKey,
      // ] = await OperationGenerator.generateKeyPair(`next-update-key`);
      // const updateOperation1PriorRecovery = await OperationGenerator.createUpdateOperationRequestForAddingAKey(
      //   didUniqueSuffix,
      //   signingPublicKey.jwk,
      //   signingPrivateKey,
      //   additionalKey,
      //   Multihash.canonicalizeThenHashThenEncode(nextUpdateKey.jwk)
      // );
      // const updateOperation1BufferPriorRecovery = Buffer.from(
      //   JSON.stringify(updateOperation1PriorRecovery)
      // );
      // const anchoredUpdateOperation1PriorRecovery: AnchoredOperationModel = {
      //   type: OperationType.Update,
      //   didUniqueSuffix,
      //   operationBuffer: updateOperation1BufferPriorRecovery,
      //   transactionTime: 2,
      //   transactionNumber: 2,
      //   operationIndex: 2,
      // };
      // await operationStore.put([anchoredUpdateOperation1PriorRecovery]);

      // // Create another update operation and insert it to the operation store.
      // const updatePayload2PriorRecovery = await OperationGenerator.createUpdateOperationRequestForHubEndpoints(
      //   didUniqueSuffix,
      //   nextUpdateKey.jwk,
      //   nextUpdatePrivateKey,
      //   OperationGenerator.generateRandomHash(),
      //   'dummyUri2',
      //   []
      // );
      // const updateOperation2BufferPriorRecovery = Buffer.from(
      //   JSON.stringify(updatePayload2PriorRecovery)
      // );
      // const anchoredUpdateOperation2PriorRecovery: AnchoredOperationModel = {
      //   type: OperationType.Update,
      //   didUniqueSuffix,
      //   operationBuffer: updateOperation2BufferPriorRecovery,
      //   transactionTime: 3,
      //   transactionNumber: 3,
      //   operationIndex: 3,
      // };
      // await operationStore.put([anchoredUpdateOperation2PriorRecovery]);

      // // Sanity check to make sure the DID Document with update is resolved correctly.
      // let didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
      // expect(didState.document.publicKeys.length).toEqual(2);
      // expect(didState.document.serviceEndpoints.length).toEqual(2);

      // // Create new keys used for new document for recovery request.
      // const [newRecoveryPublicKey] = await Jwk.generateEs256kKeyPair();
      // const [
      //   newSigningPublicKey,
      //   newSigningPrivateKey,
      // ] = await OperationGenerator.generateKeyPair('newSigningKey');
      // const newServiceEndpoints = OperationGenerator.generateServiceEndpoints([
      //   'newDummyHubUri1',
      // ]);

      // // Create the recover operation and insert it to the operation store.
      // const recoverOperationJson = await OperationGenerator.generateRecoverOperationRequest(
      //   didUniqueSuffix,
      //   recoveryPrivateKey,
      //   newRecoveryPublicKey,
      //   newSigningPublicKey,
      //   newServiceEndpoints,
      //   [newSigningPublicKey]
      // );
      // const recoverOperationBuffer = Buffer.from(
      //   JSON.stringify(recoverOperationJson)
      // );
      // const recoverOperation = await RecoverOperation.parse(
      //   recoverOperationBuffer
      // );
      // const anchoredRecoverOperation = OperationGenerator.createAnchoredOperationModelFromOperationModel(
      //   recoverOperation,
      //   4,
      //   4,
      //   4
      // );
      // await operationStore.put([anchoredRecoverOperation]);

      // // Create an update operation after the recover operation.
      // const [
      //   newKey2ForUpdate1AfterRecovery,
      // ] = await OperationGenerator.generateKeyPair(`newKey2Updte1PostRec`);
      // [
      //   nextUpdateKey,
      //   nextUpdatePrivateKey,
      // ] = await OperationGenerator.generateKeyPair(`next-update-key`);
      // const updateOperation1AfterRecovery = await OperationGenerator.createUpdateOperationRequestForAddingAKey(
      //   didUniqueSuffix,
      //   newSigningPublicKey.jwk,
      //   newSigningPrivateKey,
      //   newKey2ForUpdate1AfterRecovery,
      //   Multihash.canonicalizeThenHashThenEncode(nextUpdateKey.jwk)
      // );
      // const updateOperation1BufferAfterRecovery = Buffer.from(
      //   JSON.stringify(updateOperation1AfterRecovery)
      // );
      // const anchoredUpdateOperation1AfterRecovery: AnchoredOperationModel = {
      //   type: OperationType.Update,
      //   didUniqueSuffix,
      //   operationBuffer: updateOperation1BufferAfterRecovery,
      //   transactionTime: 5,
      //   transactionNumber: 5,
      //   operationIndex: 5,
      // };
      // await operationStore.put([anchoredUpdateOperation1AfterRecovery]);

      // // Create another update and insert it to the operation store.
      // const updatePayload2AfterRecovery = await OperationGenerator.createUpdateOperationRequestForHubEndpoints(
      //   didUniqueSuffix,
      //   nextUpdateKey.jwk,
      //   nextUpdatePrivateKey,
      //   OperationGenerator.generateRandomHash(),
      //   'newDummyHubUri2',
      //   ['newDummyHubUri1']
      // );
      // const updateOperation2BufferAfterRecovery = Buffer.from(
      //   JSON.stringify(updatePayload2AfterRecovery)
      // );
      // const anchoredUpdateOperation2AfterRecovery: AnchoredOperationModel = {
      //   type: OperationType.Update,
      //   didUniqueSuffix,
      //   operationBuffer: updateOperation2BufferAfterRecovery,
      //   transactionTime: 6,
      //   transactionNumber: 6,
      //   operationIndex: 6,
      // };
      // await operationStore.put([anchoredUpdateOperation2AfterRecovery]);

      // // Validate recover operation getting applied.
      // didState = (await resolver.resolve(didUniqueSuffix)) as DidState;

      // const document = didState.document;
      // expect(document).toBeDefined();
      // const actualNewSigningPublicKey1 = Document.getPublicKey(
      //   document,
      //   'newSigningKey'
      // );
      // const actualNewSigningPublicKey2 = Document.getPublicKey(
      //   document,
      //   'newKey2Updte1PostRec'
      // );
      // expect(actualNewSigningPublicKey1).toBeDefined();
      // expect(actualNewSigningPublicKey2).toBeDefined();
      // expect(document.publicKeys.length).toEqual(2);
      // expect(actualNewSigningPublicKey1!.jwk).toEqual(newSigningPublicKey.jwk);
      // expect(actualNewSigningPublicKey2!.jwk).toEqual(
      //   newKey2ForUpdate1AfterRecovery.jwk
      // );
      // expect(document.serviceEndpoints).toBeDefined();
      // expect(document.serviceEndpoints.length).toEqual(1);
      // expect(document.serviceEndpoints[0].endpoint).toBeDefined();
      // expect(document.serviceEndpoints[0].id).toEqual('newDummyHubUri2');
    });
  });
});
