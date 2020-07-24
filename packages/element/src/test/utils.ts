import { MongoDb } from '@sidetree/db';
import { Config } from '@sidetree/common';
import Web3 from 'web3';
import { EthereumLedger } from '@sidetree/ledger';
import Element from '../Element';

const config: Config = require('./element-config.json');
const testVersionConfig = require('./element-version-config.json');

const resetDatabase = async () => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName!
  );
};

const getTestLedger = async () => {
  const provider = 'http://localhost:8545';
  const web3 = new Web3(provider);
  const ledger = new EthereumLedger(
    web3,
    '0xeaf43D28235275afDB504aBF49863e778a4Cfea0',
    console
  );
  await ledger._createNewContract();
  return ledger;
};

const getTestElement = async () => {
  await resetDatabase();
  const ledger = await getTestLedger();
  const element = new Element(config, testVersionConfig, ledger);
  await element.initialize(false, false);
  return element;
};

export { resetDatabase, getTestLedger, getTestElement };
