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

/* eslint-disable no-case-declarations */
import {
  AnchoredOperationModel,
  DidState,
  ErrorCode,
  IOperationProcessor,
  JsonCanonicalizer,
  Multihash,
  OperationType,
  SidetreeError,
} from '@sidetree/common';
import CreateOperation from './CreateOperation';
import DeactivateOperation from './DeactivateOperation';
import DocumentComposer from './DocumentComposer';
import Operation from './Operation';
import RecoverOperation from './RecoverOperation';
import UpdateOperation from './UpdateOperation';

/**
 * Implementation of IOperationProcessor.
 */
export default class OperationProcessor implements IOperationProcessor {
  public async apply(
    anchoredOperationModel: AnchoredOperationModel,
    didState: DidState | undefined
  ): Promise<DidState | undefined> {
    // If DID state is undefined, then the operation given must be a create operation, otherwise the operation cannot be applied.
    if (
      didState === undefined &&
      anchoredOperationModel.type !== OperationType.Create
    ) {
      return undefined;
    }

    const previousOperationTransactionNumber = didState
      ? didState.lastOperationTransactionNumber
      : undefined;

    let appliedDidState: DidState | undefined;
    if (anchoredOperationModel.type === OperationType.Create) {
      appliedDidState = await this.applyCreateOperation(
        anchoredOperationModel,
        didState
      );
    } else if (anchoredOperationModel.type === OperationType.Update) {
      appliedDidState = await this.applyUpdateOperation(
        anchoredOperationModel,
        didState!
      );
    } else if (anchoredOperationModel.type === OperationType.Recover) {
      appliedDidState = await this.applyRecoverOperation(
        anchoredOperationModel,
        didState!
      );
    } else if (anchoredOperationModel.type === OperationType.Deactivate) {
      appliedDidState = await this.applyDeactivateOperation(
        anchoredOperationModel,
        didState!
      );
    } else {
      throw new SidetreeError(ErrorCode.OperationProcessorUnknownOperationType);
    }

    try {
      // If the operation was not applied, log some info in case needed for debugging.
      if (
        appliedDidState === undefined ||
        appliedDidState.lastOperationTransactionNumber ===
          previousOperationTransactionNumber
      ) {
        const index = anchoredOperationModel.operationIndex;
        const time = anchoredOperationModel.transactionTime;
        const number = anchoredOperationModel.transactionNumber;
        const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
        console.debug(
          `Ignored invalid operation for DID '${didUniqueSuffix}' in transaction '${number}' at time '${time}' at operation index ${index}.`
        );
      }
    } catch (error) {
      console.log(`Failed logging ${error}.`);
      // If logging fails, just move on.
    }

    return appliedDidState;
  }

  public async getRevealValue(
    anchoredOperationModel: AnchoredOperationModel
  ): Promise<Buffer> {
    if (anchoredOperationModel.type === OperationType.Create) {
      throw new SidetreeError(
        ErrorCode.OperationProcessorCreateOperationDoesNotHaveRevealValue
      );
    }

    const operation = await Operation.parse(
      anchoredOperationModel.operationBuffer
    );

    let revealValueBuffer;
    switch (operation.type) {
      case OperationType.Recover:
        const recoverOperation = operation as RecoverOperation;
        revealValueBuffer = JsonCanonicalizer.canonicalizeAsBuffer(
          recoverOperation.signedData.recovery_key
        );
        return revealValueBuffer;
      case OperationType.Update:
        const updateOperation = operation as UpdateOperation;
        revealValueBuffer = JsonCanonicalizer.canonicalizeAsBuffer(
          updateOperation.signedData.update_key
        );
        return revealValueBuffer;
      default:
        // This is a deactivate.
        const deactivateOperation = operation as DeactivateOperation;
        revealValueBuffer = JsonCanonicalizer.canonicalizeAsBuffer(
          deactivateOperation.signedData.recovery_key
        );
        return revealValueBuffer;
    }
  }

  /**
   * @returns new DID state if operation is applied successfully; the given DID state otherwise.
   */
  private async applyCreateOperation(
    anchoredOperationModel: AnchoredOperationModel,
    didState: DidState | undefined
  ): Promise<DidState | undefined> {
    // If DID state is already created by a previous create operation, then we cannot apply a create operation again.
    if (didState !== undefined) {
      return didState;
    }

    const operation = await CreateOperation.parse(
      anchoredOperationModel.operationBuffer
    );

    // Ensure actual delta hash matches expected delta hash.
    const isMatchingDelta = Multihash.isValidHash(
      operation.encodedDelta,
      operation.suffixData.delta_hash
    );
    if (!isMatchingDelta) {
      return didState;
    }

    // Apply the given patches against an empty object.
    const delta = operation.delta;
    let document = {};
    try {
      if (delta !== undefined) {
        document = DocumentComposer.applyPatches(document, delta.patches);
      }
    } catch (error) {
      const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
      const transactionNumber = anchoredOperationModel.transactionNumber;
      console.debug(
        `Unable to apply document patch in transaction number ${transactionNumber} for DID ${didUniqueSuffix}: ${SidetreeError.stringify(
          error
        )}.`
      );

      // Return the given DID state if error is encountered applying the patches.
      return didState;
    }

    const newDidState = {
      didUniqueSuffix: operation.didUniqueSuffix,
      document,
      nextRecoveryCommitmentHash: operation.suffixData.recovery_commitment,
      nextUpdateCommitmentHash: delta ? delta.update_commitment : undefined,
      lastOperationTransactionNumber: anchoredOperationModel.transactionNumber,
    };

    return newDidState;
  }

  /**
   * @returns new DID state if operation is applied successfully; the given DID state otherwise.
   */
  private async applyUpdateOperation(
    anchoredOperationModel: AnchoredOperationModel,
    didState: DidState
  ): Promise<DidState> {
    const operation = await UpdateOperation.parse(
      anchoredOperationModel.operationBuffer
    );

    // Verify the update key hash.
    const isValidUpdateKey = Multihash.canonicalizeAndVerify(
      operation.signedData.update_key,
      didState.nextUpdateCommitmentHash!
    );

    if (!isValidUpdateKey) {
      return didState;
    }

    // Verify the signature.
    const signatureIsValid = await operation.signedDataJws.verifySignature(
      operation.signedData.update_key
    );

    if (!signatureIsValid) {
      return didState;
    }

    // Verify the delta hash against the expected delta hash.
    const isValidDelta = Multihash.isValidHash(
      operation.encodedDelta,
      operation.signedData.delta_hash
    );

    if (!isValidDelta) {
      return didState;
    }

    let resultingDocument;
    try {
      resultingDocument = await DocumentComposer.applyUpdateOperation(
        operation,
        didState.document
      );
    } catch (error) {
      const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
      const transactionNumber = anchoredOperationModel.transactionNumber;
      console.debug(
        `Unable to apply document patch in transaction number ${transactionNumber} for DID ${didUniqueSuffix}: ${SidetreeError.stringify(
          error
        )}.`
      );

      // Return the given DID state if error is encountered applying the patches.
      return didState;
    }

    const newDidState = {
      nextRecoveryCommitmentHash: didState.nextRecoveryCommitmentHash,
      // New values below.
      document: resultingDocument,
      nextUpdateCommitmentHash: operation.delta!.update_commitment,
      lastOperationTransactionNumber: anchoredOperationModel.transactionNumber,
    };

    return newDidState;
  }

  /**
   * @returns new DID state if operation is applied successfully; the given DID state otherwise.
   */
  private async applyRecoverOperation(
    anchoredOperationModel: AnchoredOperationModel,
    didState: DidState
  ): Promise<DidState> {
    const operation = await RecoverOperation.parse(
      anchoredOperationModel.operationBuffer
    );

    // Verify the recovery key hash.
    const isValidRecoveryKey = Multihash.canonicalizeAndVerify(
      operation.signedData.recovery_key,
      didState.nextRecoveryCommitmentHash!
    );
    if (!isValidRecoveryKey) {
      return didState;
    }

    // Verify the signature.
    const signatureIsValid = await operation.signedDataJws.verifySignature(
      operation.signedData.recovery_key
    );
    if (!signatureIsValid) {
      return didState;
    }

    // Verify the actual delta hash against the expected delta hash.
    const isMatchingDelta = Multihash.isValidHash(
      operation.encodedDelta,
      operation.signedData.delta_hash
    );
    if (!isMatchingDelta) {
      return didState;
    }

    // Apply the given patches against an empty object.
    const delta = operation.delta;
    let document = {};
    try {
      if (delta !== undefined) {
        document = DocumentComposer.applyPatches(document, delta.patches);
      }
    } catch (error) {
      const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
      const transactionNumber = anchoredOperationModel.transactionNumber;
      console.debug(
        `Unable to apply document patch in transaction number ${transactionNumber} for DID ${didUniqueSuffix}: ${SidetreeError.stringify(
          error
        )}.`
      );

      // Return the given DID state if error is encountered applying the patches.
      return didState;
    }

    const newDidState = {
      didUniqueSuffix: operation.didUniqueSuffix,
      document,
      recovery_key: operation.signedData.recovery_key,
      nextRecoveryCommitmentHash: operation.signedData.recovery_commitment,
      nextUpdateCommitmentHash: delta ? delta.update_commitment : undefined,
      lastOperationTransactionNumber: anchoredOperationModel.transactionNumber,
    };

    return newDidState;
  }

  /**
   * @returns new DID state if operation is applied successfully; the given DID state otherwise.
   */
  private async applyDeactivateOperation(
    anchoredOperationModel: AnchoredOperationModel,
    didState: DidState
  ): Promise<DidState> {
    const operation = await DeactivateOperation.parse(
      anchoredOperationModel.operationBuffer
    );

    // Verify the recovery key hash.
    const isValidRecoveryKey = Multihash.canonicalizeAndVerify(
      operation.signedData.recovery_key,
      didState.nextRecoveryCommitmentHash!
    );
    if (!isValidRecoveryKey) {
      return didState;
    }

    // Verify the signature.
    const signatureIsValid = await operation.signedDataJws.verifySignature(
      operation.signedData.recovery_key
    );
    if (!signatureIsValid) {
      return didState;
    }

    // The operation passes all checks.
    const newDidState = {
      document: didState.document,
      // New values below.
      recovery_key: undefined,
      nextRecoveryCommitmentHash: undefined,
      nextUpdateCommitmentHash: undefined,
      lastOperationTransactionNumber: anchoredOperationModel.transactionNumber,
    };
    return newDidState;
  }
}
