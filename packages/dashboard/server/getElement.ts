import { Element } from '@sidetree/element';
import { EthereumLedger } from '@sidetree/ethereum';
import Web3 from 'web3';
import { IpfsCasWithCache } from '@sidetree/cas-ipfs';
// import { MockCas } from '@sidetree/cas';

import config from '../config/test.json';

const getTestLedger = async () => {
  const web3 = new Web3(config.ethereumRpcUrl);
  const ledger = new EthereumLedger(web3, config.elementAnchorContract);
  return ledger;
};

const getTestCas = async () => {
  const cas = new IpfsCasWithCache(
    config.contentAddressableStoreServiceUri,
    config.mongoDbConnectionString + config.databaseName
  );
  // const cas = new MockCas();
  return cas;
};

async function createElement() {
  const ledger: any = await getTestLedger();
  const cas: any = await getTestCas();
  const element = new Element(config as any, config.versions, cas, ledger);
  await element.initialize();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  // { info: () => {}, warn: () => {}, error: () => {} },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  // { emit: (() => {}) as any }
  return element;
}

let instancePromise: Element;

export default async function getElement() {
  if (!instancePromise) {
    instancePromise = await createElement();
  }
  return instancePromise;
}
