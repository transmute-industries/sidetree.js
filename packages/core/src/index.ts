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

import {
  Config,
  ErrorCode,
  ServiceStateModel,
  SidetreeError,
} from '@sidetree/common';

import BatchScheduler from './BatchScheduler';
import ChunkFile from './ChunkFile';
import Compressor from './util/Compressor';
import CreateOperation from './CreateOperation';
import DeactivateOperation from './DeactivateOperation';
import DownloadManager from './DownloadManager';
import JsonAsync from './util/JsonAsync';
import Jwk from './util/Jwk';
import Jws from './util/Jws';
import Observer from './Observer';
import Operation from './Operation';

import RecoverOperation from './RecoverOperation';
import Resolver from './Resolver';
import ServiceInfo from './ServiceInfoProvider';
import TransactionProcessor from './TransactionProcessor';
import UpdateOperation from './UpdateOperation';
import VersionManager from './VersionManager';
import AnchoredDataSerializer from './AnchoredDataSerializer';

import ServiceInfoProvider from './ServiceInfoProvider';

import EventEmitter from './EventEmitter';

import BlockchainClock from './BlockchainClock';

export {
  SidetreeError,
  ServiceStateModel,
  ServiceInfoProvider,
  EventEmitter,
  ErrorCode,
  BlockchainClock, //move to ledger...
  //
  BatchScheduler,
  ChunkFile,
  Compressor,
  CreateOperation,
  DeactivateOperation,
  DownloadManager,
  JsonAsync,
  Jwk,
  Jws,
  Observer,
  Operation,
  RecoverOperation,
  Resolver,
  ServiceInfo,
  TransactionProcessor,
  UpdateOperation,
  VersionManager,
  AnchoredDataSerializer,
  Config,
};
