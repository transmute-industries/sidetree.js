import { SidetreeTransaction } from '../entity/SidetreeTransaction';
import { AnchorFile } from '../entity/AnchorFile';
import { AnchoredData } from '../entity/AnchoredData';
import { ChunkFile } from '../entity/ChunkFile';

const txn = new SidetreeTransaction(
  89,
  545236,
  '0000000000000000002352597f8ec45c56ad19994808e982f5868c5ff6cfef2e',
  'QmWd5PH6vyRH5kMdzZRPBnf952dbR4av3Bd7B2wBqMaAcf',
  40000,
  100,
  '0af7eccefa3aaa37421914923b4a2034ed5a0ad0'
);

const anchorFileWithoutOperation = new AnchorFile('CAS_URI', {});

const anchorFileWithOperations = new AnchorFile('CAS_URI', {
  create: [
    {
      suffix_data: 'suffix_data_1',
    },
  ],
  recover: [
    {
      did_suffix: 'did_suffix_1',
      signed_data: 'signed_data_1',
    },
    {
      did_suffix: 'did_suffix_2',
      signed_data: 'signed_data_2',
    },
  ],
  deactivate: [],
});

const anchoredData = new AnchoredData('anchorFileHash', 10);

const chunkFile = new ChunkFile(['delta1', 'delta2']);

export default [
  {
    name: 'SidetreeTransaction',
    entity: txn,
  },
  {
    name: 'AnchorFile without operation',
    entity: anchorFileWithoutOperation,
  },
  {
    name: 'AnchorFile with operations',
    entity: anchorFileWithOperations,
  },
  {
    name: 'AnchoredData',
    entity: anchoredData,
  },
  {
    name: 'ChunkFile',
    entity: chunkFile,
  },
];
