import SidetreeTransaction from '../../entity/SidetreeTransaction';
import AnchorFile from '../../entity/AnchorFile';
import AnchoredData from '../../entity/AnchoredData';
import ChunkFile from '../../entity/ChunkFile';
import Delta from '../../entity/Delta';
import MapFile from '../../entity/MapFile';
import Operation from '../../entity/Operation';
import OperationType from '@sidetree/common/src/enums/OperationType';

const txn = new SidetreeTransaction(
  89,
  545236,
  '0000000000000000002352597f8ec45c56ad19994808e982f5868c5ff6cfef2e',
  'QmWd5PH6vyRH5kMdzZRPBnf952dbR4av3Bd7B2wBqMaAcf',
  '0af7eccefa3aaa37421914923b4a2034ed5a0ad0'
);

const anchorFileWithoutOperation = new AnchorFile('CAS_URI', {});

const anchorFileWithOperations = new AnchorFile('CAS_URI', {
  create: [
    {
      suffixData: 'suffixData1',
    },
  ],
  recover: [
    {
      didSuffix: 'didSuffix1',
      signedData: 'signedData1',
    },
    {
      didSuffix: 'didSuffix2',
      signedData: 'signedData2',
    },
  ],
  deactivate: [],
});

const anchoredData = new AnchoredData('anchorFileHash', 10);

const chunkFile = new ChunkFile(['delta1', 'delta2']);

const delta = new Delta(['patch1, patch2'], 'updateCommitment');

const mapFile = new MapFile(
  [
    {
      chunkFileUri: 'chunkFileUri1',
    },
    {
      chunkFileUri: 'chunkFileUri2',
    },
  ],
  {
    update: [
      {
        didSuffix: 'didSuffix',
        signedData: 'signed_data',
      },
    ],
  }
);

const operation = new Operation(
  'didUniqueSuffix',
  OperationType.Create,
  new Buffer('data'),
  0,
  0,
  0
);

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
  {
    name: 'Delta',
    entity: delta,
  },
  {
    name: 'MapFile',
    entity: mapFile,
  },
  {
    name: 'Operation',
    entity: operation,
  },
];
