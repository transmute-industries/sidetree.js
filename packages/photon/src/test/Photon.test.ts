import QLDBLedger from '@sidetree/qldb';
import { sidetreeCoreGeneratedEd25519 } from '@sidetree/test-vectors';
import { resetDatabase, getTestLedger, replaceMethod } from './utils';
import Photon from '../Photon';
import config from './photon-config.json';

const create = sidetreeCoreGeneratedEd25519.operation.operation[0];
const {
  shortFormDid: elemShortFormDid,
  request: createOperation,
  response: elemResolveBody,
} = create;

const shortFormDid = elemShortFormDid.replace('elem', 'photon');
const resolveBody = replaceMethod(elemResolveBody);
const createOperationBuffer = Buffer.from(JSON.stringify(createOperation));

console.info = () => null;

jest.setTimeout(60 * 1000);

describe('Photon', () => {
  let ledger: QLDBLedger;
  let photon: Photon;

  beforeAll(async () => {
    await resetDatabase();
    ledger = await getTestLedger();
    await ledger.reset();
  });

  afterAll(async () => {
    await photon.close();
  });

  it('should create the Photon class', async () => {
    photon = new Photon(config, config.versions, ledger);
    expect(photon).toBeDefined();
  });

  it('should initialize the photon class', async () => {
    await photon.initialize(false, false);
  });

  it('should get versions', async () => {
    const versions = await photon.handleGetVersionRequest();
    expect(versions.status).toBe('succeeded');
    expect(JSON.parse(versions.body)).toHaveLength(3);
  });

  it('should handle operation request', async () => {
    const operation = await photon.handleOperationRequest(
      createOperationBuffer
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });

  it('should resolve a did after Observer has picked up the transaction', async () => {
    await photon.triggerBatchAndObserve();
    const operation = await photon.handleResolveRequest(
      shortFormDid.replace('elem', 'photon')
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });
});
