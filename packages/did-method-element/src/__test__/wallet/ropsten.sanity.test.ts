import { SidetreeWalletPlugin } from '@sidetree/wallet';

import Element from '../../Element';
import { clearCollection } from '../../test/utils';

import { getNodeInstance } from '../../provider';

// // mute noisy sidetree console logs.
// // console.log = () => {};
// // console.info = () => {};
// // console.warn = () => {};

const wallet = SidetreeWalletPlugin.build();

const sleep = async (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

const maxTestTimeInMinutes = 5;

jest.setTimeout(maxTestTimeInMinutes * 60 * 1000);

// make sure not to commit testnet configs to source.
require('dotenv').config({ path: '.env.ropsten' });

const anchorDelayInSeconds = 200;
// only the parts we need.
const config = {
  method: process.env.SIDETREE_METHOD,
  batchingIntervalInSeconds: process.env.BATCH_INTERVAL_IN_SECONDS,
  observingIntervalInSeconds: process.env.OBSERVING_INTERVAL_IN_SECONDS,
  mongoDbConnectionString: process.env.MONGO_DB_CONNECTION_STRING,
  databaseName: process.env.DATABASE_NAME,
  maxConcurrentDownloads: process.env.MAX_CONCURRENT_DOWNLOADS,
  contentAddressableStoreServiceUri:
    process.env.ELEMENT_CONTENT_ADDRESSABLE_STORE_SERVICE_URI,
  ethereumRpcUrl: process.env.ETHEREUM_RPC_URL,
  ethereumMnemonic: process.env.ETHEREUM_MNEMONIC,
  elementAnchorContract: process.env.ELEMENT_ANCHOR_CONTRACT,
};

// only the parts we need.
const elementNodeConfigs: any = {
  contentAddressableStoreServiceUri: config.contentAddressableStoreServiceUri,
  databaseName: config.databaseName,
  didMethodName: config.method,
  ethereumRpcUrl: config.ethereumRpcUrl,
  mongoDbConnectionString: config.mongoDbConnectionString,
  observingIntervalInSeconds: config.observingIntervalInSeconds,
  maxConcurrentDownloads: config.maxConcurrentDownloads,
  batchingIntervalInSeconds: config.batchingIntervalInSeconds,
  versions: [
    {
      // adjust this to the lastest block before attempting to run this test.
      startingBlockchainTime: 12378596,
      version: 'latest',
    },
  ],
  elementAnchorContract: config.elementAnchorContract,
  ethereumMnemonic: config.ethereumMnemonic,
};

describe.skip('Ropsten Sanity', () => {
  let element: Element;
  beforeAll(async () => {
    element = await getNodeInstance(elementNodeConfigs);
    await clearCollection('service');
    await clearCollection('operations');
    await clearCollection('transactions');
    await clearCollection('queued-operations');
  });

  afterAll(async () => {
    // unfortunatly, this is not cleaning up after itself enough for jest to exist properly.
    await element.shutdown();
  });

  it('can create a new ropsten elem did', async () => {
    const mnemonic =
      'sell antenna drama rule twenty cement mad deliver you push derive hybrid';
    const hdpath = `m/44'/0'/0'/0`;
    const keyType = 'secp256k1';
    const key0 = await wallet.toKeyPair(mnemonic, keyType, `${hdpath}/0`);
    const key1 = await wallet.toKeyPair(mnemonic, keyType, `${hdpath}/1`);
    const key2 = await wallet.toKeyPair(mnemonic, keyType, `${hdpath}/2`);
    const document: any = {
      publicKeys: [
        {
          id: key0.id.split('#').pop(),
          type: key0.type,
          publicKeyJwk: key0.publicKeyJwk,
          purposes: ['authentication', 'assertionMethod', 'keyAgreement'],
        },
      ],
    };
    const recoveryKey = key1.publicKeyJwk;
    const updateKey = key2.publicKeyJwk;
    const input1 = { recoveryKey, updateKey, document };
    const createOperation = await wallet.operations.create(input1);
    const operation0 = await element.handleOperationRequest(
      Buffer.from(JSON.stringify(createOperation))
    );
    expect(operation0.status).toBe('succeeded');
    expect(operation0.body).toBeDefined();
    const did = operation0.body.didDocument.id;
    await sleep(anchorDelayInSeconds); // wait for anchor
    const operation1 = await element.handleResolveRequest(did);
    expect(operation1.status).toBe('succeeded');
    expect(operation1.body.didDocument.id).toEqual(did);
    expect(operation1.body.didDocumentMetadata.method.published).toBe(true);
  });
});
