/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import SidetreeTransaction from '../../entity/SidetreeTransaction';
import AnchorFile from '../../entity/AnchorFile';
import AnchoredData from '../../entity/AnchoredData';
import ChunkFile from '../../entity/ChunkFile';
import Delta from '../../entity/Delta';
import MapFile from '../../entity/MapFile';
import Operation from '../../entity/Operation';
import { OperationType } from '@sidetree/common';

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

const delta = new Delta(['patch1, patch2'], 'update_commitment');

const mapFile = new MapFile(
  [
    {
      chunk_file_uri: 'chunk_file_uri_1',
    },
    {
      chunk_file_uri: 'chunk_file_uri_2',
    },
  ],
  {
    update: [
      {
        did_suffix: 'did_suffix',
        signed_data: 'signed_data',
      },
    ],
  }
);

const operation = new Operation(
  'didUniqueSuffix',
  OperationType.Create,
  Buffer.from('data'),
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
