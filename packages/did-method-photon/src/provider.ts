import QLDBLedger, { MockQLDBLedger } from '@sidetree/qldb';
import { S3Cas } from '@sidetree/cas-s3';
import { MockCas } from '@sidetree/cas';
import Photon from './Photon';

export type PhotonNodeConfigs = {
  awsCredentials?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  qldbLedger: string;
  qldbLedgerTable: string;
  s3BucketName: string;
  databaseName: string;
  didMethodName: string;
  mongoDbConnectionString: string;
  batchingIntervalInSeconds: number;
  observingIntervalInSeconds: number;
  maxConcurrentDownloads: number;
  versions: {
    startingBlockchainTime: number;
    version: string;
  }[];
};

const getLedger = async (config: PhotonNodeConfigs) => {
  const ledger = new QLDBLedger(
    config.qldbLedger,
    config.qldbLedgerTable,
    config.awsCredentials
  );
  await ledger.initialize();
  return ledger;
};

const getTestLedger = async (config: PhotonNodeConfigs) => {
  const ledger = new MockQLDBLedger(config.qldbLedgerTable);
  await ledger.initialize();
  return ledger;
};

const getCas = async (config: PhotonNodeConfigs) => {
  const cas = new S3Cas(config.s3BucketName, config.awsCredentials);
  await cas.initialize();
  return cas;
};

const getTestCas = async () => {
  const cas = new MockCas();
  await cas.initialize();
  return cas;
};

export const getTestNodeInstance = async (
  config: PhotonNodeConfigs
): Promise<Photon> => {
  const ledger = await getTestLedger(config);
  const cas = await getTestCas();
  const photon = new Photon(config as any, config.versions, cas, ledger);
  await photon.initialize();
  return photon;
};

export const getNodeInstance = async (
  config: PhotonNodeConfigs
): Promise<Photon> => {
  const ledger = await getLedger(config);
  const cas = await getCas(config);
  const photon = new Photon(config as any, config.versions, cas, ledger);
  await photon.initialize();
  return photon;
};
