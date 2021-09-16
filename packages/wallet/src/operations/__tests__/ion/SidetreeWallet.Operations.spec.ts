// Based on:
// https://github.com/decentralized-identity/ion-sdk/blob/main/tests/operations.spec.ts

import { OperationType, SidetreeDocumentModel } from '../../types';
import { LocalSigner, operations } from '../../index';


describe('SidetreeWallet.operations', () => {
  describe('createCreateRequest', () => {
    it('should generate a create request with desired arguments', async () => {
      const recoveryKey = require('./vectors/inputs/jwkEs256k1Public.json');
      const updateKey = require('./vectors/inputs/jwkEs256k2Public.json');
      const publicKey = require('./vectors/inputs/publicKeyModel1.json');
      const publicKeys = [publicKey];

      const service = require('./vectors/inputs/service1.json');
      const services = [service];

      const document: SidetreeDocumentModel = {
        publicKeys,
        services,
      };
      const input = { recoveryKey, updateKey, document };
      const result = operations.create(input);
      expect(result.type).toEqual(OperationType.Create);
      expect(result.delta.updateCommitment).toEqual(
        'EiDKIkwqO69IPG3pOlHkdb86nYt0aNxSHZu2r-bhEznjdA'
      );
      expect(result.delta.patches.length).toEqual(1);
      expect(result.suffixData.recoveryCommitment).toEqual(
        'EiBfOZdMtU6OBw8Pk879QtZ-2J-9FbbjSZyoaA_bqD4zhA'
      );
      expect(result.suffixData.deltaHash).toEqual(
        'EiCfDWRnYlcD9EGA3d_5Z1AHu-iYqMbJ9nfiqdz5S8VDbg'
      );
    });
  });

  describe('createUpdateRequest', () => {
    it('should generate an update request with the given arguments', async () => {
      const publicKey = require('./vectors/inputs/publicKeyModel1.json');
      const publicKeys = [publicKey];

      const service = require('./vectors/inputs/service1.json');
      const services = [service];
      const input = {
        didSuffix: 'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg',
        updatePublicKey: require('./vectors/inputs/jwkEs256k1Public.json'),
        nextUpdatePublicKey: require('./vectors/inputs/jwkEs256k2Public.json'),
        servicesToAdd: services,
        idsOfServicesToRemove: ['someId1'],
        publicKeysToAdd: publicKeys,
        idsOfPublicKeysToRemove: ['someId2'],
        signer: LocalSigner.create(
          require('./vectors/inputs/jwkEs256k1Private.json')
        ),
      };

      const result = await operations.update(input);
      expect(result.didSuffix).toEqual(
        'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg'
      );
      expect(result.type).toEqual(OperationType.Update);
      expect(result.revealValue).toEqual(
        'EiAJ-97Is59is6FKAProwDo870nmwCeP8n5nRRFwPpUZVQ'
      );
      expect(result.signedData).toEqual(
        'eyJhbGciOiJFUzI1NksifQ.eyJ1cGRhdGVLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoibklxbFJDeDBleUJTWGNRbnFEcFJlU3Y0enVXaHdDUldzc29jOUxfbmo2QSIsInkiOiJpRzI5Vks2bDJVNXNLQlpVU0plUHZ5RnVzWGdTbEsyZERGbFdhQ004RjdrIn0sImRlbHRhSGFzaCI6IkVpQXZsbVVRYy1jaDg0Slp5bmdQdkJzUkc3eWh4aUFSenlYOE5lNFQ4LTlyTncifQ.Q9MuoQqFlhYhuLDgx4f-0UM9QyCfZp_cXt7vnQ4ict5P4_ZWKwG4OXxxqFvdzE-e3ZkEbvfR0YxEIpYO9MrPFw'
      );
      expect(result.delta.updateCommitment).toEqual(
        'EiDKIkwqO69IPG3pOlHkdb86nYt0aNxSHZu2r-bhEznjdA'
      );
      expect(result.delta.patches.length).toEqual(4); // add/remove service and add/remove key
    });

    it('should generate an update request with the no arguments', async () => {
      const input = {
        didSuffix: 'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg',
        updatePublicKey: require('./vectors/inputs/jwkEs256k1Public.json'),
        nextUpdatePublicKey: require('./vectors/inputs/jwkEs256k2Public.json'),
        signer: LocalSigner.create(
          require('./vectors/inputs/jwkEs256k1Private.json')
        ),
      };

      const result = await operations.update(input);
      expect(result.didSuffix).toEqual(
        'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg'
      );
    });
  });

  describe('createRecoverRequest', () => {
    it('should generate a recover request with given arguments', async () => {
      const publicKey = require('./vectors/inputs/publicKeyModel1.json');
      const publicKeys = [publicKey];

      const service = require('./vectors/inputs/service1.json');
      const services = [service];

      const document: SidetreeDocumentModel = {
        publicKeys,
        services,
      };
      const result = await operations.recover({
        didSuffix: 'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg',
        recoveryPublicKey: require('./vectors/inputs/jwkEs256k1Public.json'),
        nextRecoveryPublicKey: require('./vectors/inputs/jwkEs256k2Public.json'),
        nextUpdatePublicKey: require('./vectors/inputs/jwkEs256k3Public.json'),
        document,
        signer: LocalSigner.create(
          require('./vectors/inputs/jwkEs256k1Private.json')
        ),
      });

      expect(result.didSuffix).toEqual(
        'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg'
      );
      expect(result.revealValue).toEqual(
        'EiAJ-97Is59is6FKAProwDo870nmwCeP8n5nRRFwPpUZVQ'
      );
      expect(result.type).toEqual(OperationType.Recover);
      expect(result.signedData).toEqual(
        'eyJhbGciOiJFUzI1NksifQ.eyJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaURLSWt3cU82OUlQRzNwT2xIa2RiODZuWXQwYU54U0hadTJyLWJoRXpuamRBIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoibklxbFJDeDBleUJTWGNRbnFEcFJlU3Y0enVXaHdDUldzc29jOUxfbmo2QSIsInkiOiJpRzI5Vks2bDJVNXNLQlpVU0plUHZ5RnVzWGdTbEsyZERGbFdhQ004RjdrIn0sImRlbHRhSGFzaCI6IkVpQm9HNlFtamlTSm5ON2phaldnaV9vZDhjR3dYSm9Nc2RlWGlWWTc3NXZ2SkEifQ.58n6Fel9DmRAXxwcJMUwYaUhmj5kigKMNrGjr7eJaJcjOmjvwlKLSjiovWiYrb9yjkfMAjpgbAdU_2EDI1_lZw'
      );
      expect(result.delta.updateCommitment).toEqual(
        'EiBJGXo0XUiqZQy0r-fQUHKS3RRVXw5nwUpqGVXEGuTs-g'
      );
      expect(result.delta.patches.length).toEqual(1); // replace
    });
  });

  describe('createDeactivateRequest', () => {
    it('should generate a deactivate request with the given arguments', async () => {
      const result = await operations.deactivate({
        didSuffix: 'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg',
        recoveryPublicKey: require('./vectors/inputs/jwkEs256k1Public.json'),
        signer: LocalSigner.create(
          require('./vectors/inputs/jwkEs256k1Private.json')
        ),
      });

      expect(result.didSuffix).toEqual(
        'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg'
      );
      expect(result.type).toEqual(OperationType.Deactivate);
      expect(result.revealValue).toEqual(
        'EiAJ-97Is59is6FKAProwDo870nmwCeP8n5nRRFwPpUZVQ'
      );
      expect(result.signedData).toEqual(
        'eyJhbGciOiJFUzI1NksifQ.eyJkaWRTdWZmaXgiOiJFaUR5T1FiYlpBYTNhaVJ6ZUNrVjdMT3gzU0VSampIOTNFWG9JTTNVb040b1dnIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoibklxbFJDeDBleUJTWGNRbnFEcFJlU3Y0enVXaHdDUldzc29jOUxfbmo2QSIsInkiOiJpRzI5Vks2bDJVNXNLQlpVU0plUHZ5RnVzWGdTbEsyZERGbFdhQ004RjdrIn19.uLgnDBmmFzST4VTmdJcmFKVicF0kQaBqEnRQLbqJydgIg_2oreihCA5sBBIUBlSXwvnA9xdK97ksJGmPQ7asPQ'
      );
    });
  });
});
