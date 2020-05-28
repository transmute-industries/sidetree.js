import { SidetreeTransaction } from '../entity/SidetreeTransaction';
import { AnchorFile } from '../entity/AnchorFile';

const txn = new SidetreeTransaction(
  89,
  545236,
  '0000000000000000002352597f8ec45c56ad19994808e982f5868c5ff6cfef2e',
  'QmWd5PH6vyRH5kMdzZRPBnf952dbR4av3Bd7B2wBqMaAcf',
  40000,
  100,
  '0af7eccefa3aaa37421914923b4a2034ed5a0ad0'
);

const anchorFile = new AnchorFile('CAS_URI', {});

export default [{
  name: 'SidetreeTransaction',
  entity: txn
},{
  name: 'AnchorFile without operations',
  entity: anchorFile
}];
