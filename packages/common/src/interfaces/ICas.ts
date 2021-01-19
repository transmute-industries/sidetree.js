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

import ServiceVersionModel from '../models/ServiceVersionModel';
import FetchResult from '../models/FetchResult';

/**
 * Interface for accessing the underlying CAS (Content Addressable Store).
 * This interface is mainly useful for creating a mock CAS for testing purposes.
 */
export default interface ICas {
  getServiceVersion(): ServiceVersionModel;
  initialize(): Promise<void>;
  close(): Promise<void>;
  /**
   * Writes the given content to CAS.
   * @returns The SHA256 hash in base64url encoding which represents the address of the content.
   */
  write(content: Buffer): Promise<string>;
  /**
   * Reads the content of the given address in CAS.
   * @returns The fetch result containg the content buffer if found.
   */
  read(address: string): Promise<FetchResult>;
}
