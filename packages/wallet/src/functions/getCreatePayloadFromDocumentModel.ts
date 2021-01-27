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
import canonicalize from 'canonicalize';
import base64url from 'base64url';
import { canonicalizeThenHashThenEncode } from './sidetreeEncoding';
import { SidetreeCreateOperation } from '../types';

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
  const delta_object = {
    update_commitment: canonicalizeThenHashThenEncode(updatePublicKey),
    patches,
  };
  const delta = base64url.encode(canonicalize(delta_object));
  const canonical_suffix_data = canonicalize({
    delta_hash: canonicalizeThenHashThenEncode(delta_object),
    recovery_commitment: canonicalizeThenHashThenEncode(recoveryPublicKey),
  });
  const suffix_data = base64url.encode(canonical_suffix_data);
  const createOperation: SidetreeCreateOperation = {
    type: 'create',
    suffix_data,
    delta,
  };

  return createOperation;
};
