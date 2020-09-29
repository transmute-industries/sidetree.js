/*
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

import base64url from 'base64url';
import canonicalize from 'canonicalize';

export const createJws = async (signer: any, payload: any, header: object) => {
  const encodedHeader = base64url.encode(canonicalize(header));
  const encodedPayload = base64url.encode(canonicalize(payload));
  const toBeSigned = `${encodedHeader}.${encodedPayload}`;
  const signature = await signer.sign(Buffer.from(toBeSigned) as any);
  return `${toBeSigned}.${base64url.encode(Buffer.from(signature))}`;
};
