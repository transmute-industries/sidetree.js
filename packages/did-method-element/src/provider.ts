import Web3 from 'web3';
import { EthereumLedger } from '@sidetree/ethereum';
// import { IpfsCasWithCache } from '@sidetree/cas-ipfs';
import { MockCas } from '@sidetree/cas';
import Element from './Element';

import config from './configs/element-ganache-config.json';

const getTestLedger = async () => {
  const web3 = new Web3(config.ethereumRpcUrl);
  const ledger = new EthereumLedger(
    web3,
    (config as any).elementAnchorContract
  );
  return ledger;
};

const getTestCas = async () => {
  // FIXME: IPFS has intermittent failures in tests so we will use MockCas until it's fixed
  // See: https://github.com/transmute-industries/sidetree.js/runs/2178633982#step:8:178
  // const cas = new IpfsCasWithCache(
  //   config.contentAddressableStoreServiceUri,
  //   config.mongoDbConnectionString,
  //   config.databaseName
  // );
  const cas = new MockCas();
  return cas;
};

export const getTestNodeIntance = async () => {
  const ledger = await getTestLedger();
  const cas = await getTestCas();
  const element = new Element(config as any, config.versions, cas, ledger);
  await element.initialize();
  return element;
};
