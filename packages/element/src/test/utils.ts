import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import { EthereumLedger } from '@sidetree/ethereum';
import Element from '../Element';

const config: any = require('./element-config.json');

const resetDatabase = async () => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName!
  );
};

const getTestLedger = async () => {
  const web3 = new Web3(config.ethereumRpcUrl);
  const ledger = new EthereumLedger(web3, config.elementAnchorContract);
  await ledger.resolving;
  return ledger;
};

const getTestElement = async () => {
  await resetDatabase();
  const ledger = await getTestLedger();

  const element = new Element(config, config.versions, ledger);
  await element.initialize(false, false);
  return element;
};

const replaceMethod = (
  result: any,
  defaultMethod = 'sidetree',
  specificMethod = 'elem'
) => {
  // prevent mutation
  const _result = JSON.parse(JSON.stringify(result));
  _result.didDocument.id = _result.didDocument.id.replace(
    specificMethod,
    defaultMethod
  );
  _result.didDocument['@context'][1]['@base'] = _result.didDocument[
    '@context'
  ][1]['@base'].replace(specificMethod, defaultMethod);
  return _result;
};

export { resetDatabase, getTestLedger, getTestElement, replaceMethod };
