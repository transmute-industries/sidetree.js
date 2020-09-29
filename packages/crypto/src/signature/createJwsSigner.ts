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

import { createSigner } from './createSigner';
import { createJws } from './createJws';
import { crvToJwsAlg } from '../constants';

export const createJwsSigner = async (privateKeyJwk: any) => {
  const signer = await createSigner(privateKeyJwk);
  const alg = crvToJwsAlg[privateKeyJwk.crv];
  return {
    sign: async (data: Buffer) => {
      return createJws(signer, data, { alg });
    },
  };
};
