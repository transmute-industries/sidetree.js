import { MongoDb } from '@sidetree/db';
import QLDBLedger from '@sidetree/qldb';
import Photon from '../Photon';

const config: any = require('./photon-config.json');

const resetDatabase = async () => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName!
  );
};

const getTestLedger = async () => {
  const ledger = new QLDBLedger(config.qldbLedger, config.qldbLedgerTable);
  return ledger;
};

const getTestPhoton = async () => {
  await resetDatabase();
  const ledger = await getTestLedger();
  const photon = new Photon(config, config.versions, ledger);
  await photon.initialize(false, false);
  return photon;
};

const replaceMethod = (
  result: any,
  defaultMethod = 'did:elem',
  specificMethod = 'did:photon'
) => {
  const stringified = JSON.stringify(result);
  const updatedStringified = stringified.replace(
    new RegExp(defaultMethod, 'g'),
    specificMethod
  );
  const updateResult = JSON.parse(updatedStringified);
  return updateResult;
};

export { resetDatabase, getTestLedger, getTestPhoton, replaceMethod };
