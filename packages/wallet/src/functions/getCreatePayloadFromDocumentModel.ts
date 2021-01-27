/*
 * Copyright 2020 - Transmute Industries Inc.
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
import { Multihash, Encoder, OperationType } from '@sidetree/common';

export const getCreatePayloadFromDocumentModel = async (
  documentModel: any,
  updatePublicKey: object,
  recoveryPublicKey: object
): Promise<any> => {
  const patches = [
    {
      action: 'replace',
      document: documentModel,
    },
  ];

  const delta = {
    update_commitment: Multihash.canonicalizeThenHashThenEncode(
      updatePublicKey
    ),
    patches,
  };

  const deltaBuffer = Buffer.from(JSON.stringify(delta));
  const deltaHash = Encoder.encode(Multihash.hash(deltaBuffer));
  const suffixData = {
    delta_hash: deltaHash,
    recovery_commitment: Multihash.canonicalizeThenHashThenEncode(
      recoveryPublicKey
    ),
  };

  const suffixDataEncodedString = Encoder.encode(JSON.stringify(suffixData));
  const deltaEncodedString = Encoder.encode(deltaBuffer);
  const createOperationRequest = {
    type: OperationType.Create,
    suffix_data: suffixDataEncodedString,
    delta: deltaEncodedString,
  };
  return createOperationRequest;
};
