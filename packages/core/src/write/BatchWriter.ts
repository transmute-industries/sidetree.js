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
  AnchoredData,
  AnchoredDataSerializer,
  IBatchWriter,
  IBlockchain,
  ICas,
  IOperationQueue,
  OperationType,
  protocolParameters,
  IVersionMetadataFetcher,
  ValueTimeLockModel,
} from '@sidetree/common';
import CreateOperation from '../CreateOperation';
import DeactivateOperation from '../DeactivateOperation';
import LogColor from '../LogColor';
import Operation from '../Operation';
import RecoverOperation from '../RecoverOperation';
import UpdateOperation from '../UpdateOperation';
import AnchorFile from './AnchorFile';
import ChunkFile from './ChunkFile';
import MapFile from './MapFile';
import FeeManager from '../FeeManager';
import ValueTimeLockVerifier from '../ValueTimeLockVerifier';

/**
 * Implementation of the `IBatchWriter`.
 */
export default class BatchWriter implements IBatchWriter {
  public constructor(
    private operationQueue: IOperationQueue,
    private blockchain: IBlockchain,
    private cas: ICas,
    private versionMetadataFetcher: IVersionMetadataFetcher
  ) {}

  public async write(): Promise<void> {
    const normalizedFee = await this.blockchain.getFee(
      this.blockchain.approximateTime.time
    );
    const currentLock = await this.blockchain.getWriterValueTimeLock();
    const numberOfOpsAllowed = this.getNumberOfOperationsAllowed(currentLock);

    // Get the batch of operations to be anchored on the blockchain.
    const queuedOperations = await this.operationQueue.peek(numberOfOpsAllowed);
    const numberOfOperations = queuedOperations.length;

    // Do nothing if there is nothing to batch together.
    if (queuedOperations.length === 0) {
      console.info(`No queued operations to batch.`);
      return;
    }

    console.info(
      LogColor.lightBlue(
        `Batch size = ${LogColor.green(`${numberOfOperations}`)}`
      )
    );

    const operationModels = await Promise.all(
      queuedOperations.map(async (queuedOperation) =>
        Operation.parse(queuedOperation.operationBuffer)
      )
    );
    const createOperations = operationModels.filter(
      (operation) => operation.type === OperationType.Create
    ) as CreateOperation[];
    const recoverOperations = operationModels.filter(
      (operation) => operation.type === OperationType.Recover
    ) as RecoverOperation[];
    const updateOperations = operationModels.filter(
      (operation) => operation.type === OperationType.Update
    ) as UpdateOperation[];
    const deactivateOperations = operationModels.filter(
      (operation) => operation.type === OperationType.Deactivate
    ) as DeactivateOperation[];

    // Create the chunk file buffer from the operation models.
    // NOTE: deactivate operations don't have delta.
    const chunkFileBuffer = await ChunkFile.createBuffer(
      createOperations,
      recoverOperations,
      updateOperations
    );

    // Write the chunk file to content addressable store.
    const chunkFileHash = await this.cas.write(chunkFileBuffer);
    console.info(
      LogColor.lightBlue(
        `Wrote chunk file ${LogColor.green(
          chunkFileHash
        )} to content addressable store.`
      )
    );

    // Write the map file to content addressable store.
    const mapFileBuffer = await MapFile.createBuffer(
      chunkFileHash,
      updateOperations
    );
    const mapFileHash = await this.cas.write(mapFileBuffer);
    console.info(
      LogColor.lightBlue(
        `Wrote map file ${LogColor.green(
          mapFileHash
        )} to content addressable store.`
      )
    );

    // Write the anchor file to content addressable store.
    const writerLockId = currentLock ? currentLock.identifier : undefined;
    const anchorFileBuffer = await AnchorFile.createBuffer(
      writerLockId,
      mapFileHash,
      createOperations,
      recoverOperations,
      deactivateOperations
    );
    const anchorFileHash = await this.cas.write(anchorFileBuffer);
    console.info(
      LogColor.lightBlue(
        `Wrote anchor file ${LogColor.green(
          anchorFileHash
        )} to content addressable store.`
      )
    );

    // Anchor the data to the blockchain
    const dataToBeAnchored: AnchoredData = {
      anchorFileHash,
      numberOfOperations,
    };

    const stringToWriteToBlockchain = AnchoredDataSerializer.serialize(
      dataToBeAnchored
    );
    const fee = FeeManager.computeMinimumTransactionFee(
      normalizedFee,
      numberOfOperations
    );
    console.info(
      LogColor.lightBlue(
        `Writing data to blockchain: ${LogColor.green(
          stringToWriteToBlockchain
        )} with minimum fee of: ${LogColor.green(`${fee}`)}`
      )
    );

    await this.blockchain.write(stringToWriteToBlockchain, fee);

    // Remove written operations from queue after batch writing has completed successfully.
    await this.operationQueue.dequeue(queuedOperations.length);
  }

  private getNumberOfOperationsAllowed(
    valueTimeLock: ValueTimeLockModel | undefined
  ): number {
    const maxNumberOfOpsAllowedByProtocol =
      protocolParameters.maxOperationsPerBatch;
    const maxNumberOfOpsAllowedByLock = ValueTimeLockVerifier.calculateMaxNumberOfOperationsAllowed(
      valueTimeLock,
      this.versionMetadataFetcher
    );

    if (maxNumberOfOpsAllowedByLock > maxNumberOfOpsAllowedByProtocol) {
      // tslint:disable-next-line: max-line-length
      console.info(
        `Maximum number of operations allowed by value time lock: ${maxNumberOfOpsAllowedByLock}; Maximum number of operations allowed by protocol: ${maxNumberOfOpsAllowedByProtocol}`
      );
    }

    return Math.min(
      maxNumberOfOpsAllowedByLock,
      maxNumberOfOpsAllowedByProtocol
    );
  }
}
