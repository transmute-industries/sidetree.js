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
  DeltaModel,
  Encoder,
  ErrorCode,
  Multihash,
  SidetreeError,
} from '@sidetree/common';
import DocumentComposer from './DocumentComposer';
import JsonAsync from './util/JsonAsync';

/**
 * A class that contains Sidetree operation utility methods.
 */
export default class OperationUtils {
  /**
   * Parses the given encoded delta string into an internal `DeltaModel`.
   */
  public static async parseDelta(deltaEncodedString: any): Promise<DeltaModel> {
    if (typeof deltaEncodedString !== 'string') {
      throw new SidetreeError(ErrorCode.DeltaMissingOrNotString);
    }

    const deltaJsonString = Encoder.decodeAsString(deltaEncodedString);
    const delta = await JsonAsync.parse(deltaJsonString);

    const properties = Object.keys(delta);
    if (properties.length !== 2) {
      throw new SidetreeError(ErrorCode.DeltaMissingOrUnknownProperty);
    }

    if (delta.patches === undefined) {
      throw new SidetreeError(ErrorCode.OperationDocumentPatchesMissing);
    }

    // Validate `patches` property using the DocumentComposer.
    DocumentComposer.validateDocumentPatches(delta.patches);

    const nextUpdateCommitment = Encoder.decodeAsBuffer(
      delta.update_commitment
    );
    Multihash.verifyHashComputedUsingLatestSupportedAlgorithm(
      nextUpdateCommitment
    );

    return {
      patches: delta.patches,
      update_commitment: delta.update_commitment,
    };
  }
}
