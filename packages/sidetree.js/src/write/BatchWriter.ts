import AnchoredData from '@sidetree/common/src/models/AnchoredData';
import AnchoredDataSerializer from '../AnchoredDataSerializer';
import AnchorFile from './AnchorFile';
import ChunkFile from './ChunkFile';
import CreateOperation from '../CreateOperation';
import DeactivateOperation from '../DeactivateOperation';
import ICas from '@sidetree/common/src/interfaces/ICas';
import IBatchWriter from '@sidetree/common/src/interfaces/IBatchWriter';
import IBlockchain from '@sidetree/common/src/interfaces/IBlockchain';
import IOperationQueue from '@sidetree/common/src/interfaces/IOperationQueue';
import LogColor from '../LogColor';
import MapFile from './MapFile';
import Operation from '../Operation';
import OperationType from '@sidetree/common/src/enums/OperationType';
import ProtocolParameters from '@sidetree/common/src/util/ProtocolParameters';
import RecoverOperation from '../RecoverOperation';
import UpdateOperation from '../UpdateOperation';

/**
 * Implementation of the `IBatchWriter`.
 */
export default class BatchWriter implements IBatchWriter {
  public constructor(
    private operationQueue: IOperationQueue,
    private blockchain: IBlockchain,
    private cas: ICas
  ) {}

  public async write() {
    const numberOfOpsAllowed = this.getNumberOfOperationsToWrite();

    // Get the batch of operations to be anchored on the blockchain.
    const queuedOperations = await this.operationQueue.peek(numberOfOpsAllowed);
    const numberOfOperations = queuedOperations.length;

    // Do nothing if there is nothing to batch together.
    if (queuedOperations.length === 0) {
      console.info(`No queued operations to batch.`);
      return;
    }

    console.info(
      LogColor.lightBlue(`Batch size = ${LogColor.green(numberOfOperations)}`)
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
    const anchorFileBuffer = await AnchorFile.createBuffer(
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
    console.info(
      LogColor.lightBlue(
        `Writing data to blockchain: ${LogColor.green(
          stringToWriteToBlockchain
        )}`
      )
    );

    await this.blockchain.write(stringToWriteToBlockchain);

    // Remove written operations from queue after batch writing has completed successfully.
    await this.operationQueue.dequeue(queuedOperations.length);
  }

  private getNumberOfOperationsToWrite(): number {
    const maxNumberOfOpsAllowedByProtocol =
      ProtocolParameters.maxOperationsPerBatch;

    return maxNumberOfOpsAllowedByProtocol;
  }
}
