/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/master/reference-implementation-changes.md
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

import AnchorFile from './write/AnchorFile';
import BatchScheduler from './write/BatchScheduler';
import ChunkFile from './write/ChunkFile';
import CreateOperation from './CreateOperation';
import DeactivateOperation from './DeactivateOperation';
import DownloadManager from './DownloadManager';
import Jwk from './util/Jwk';
import Jws from './util/Jws';
import MapFile from './write/MapFile';
import Observer from './Observer';
import Operation from './Operation';
import OperationGenerator from './test/generators/OperationGenerator';
import RecoverOperation from './RecoverOperation';
import Resolver from './Resolver';
import ServiceInfo from './ServiceInfoProvider';
import UpdateOperation from './UpdateOperation';
import VersionManager from './VersionManager';

export {
  AnchorFile,
  BatchScheduler,
  ChunkFile,
  CreateOperation,
  DeactivateOperation,
  DownloadManager,
  Jwk,
  Jws,
  MapFile,
  Observer,
  Operation,
  OperationGenerator,
  RecoverOperation,
  Resolver,
  ServiceInfo,
  UpdateOperation,
  VersionManager,
};
