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

import MockOperationQueue from '../../mocks/MockOperationQueue';

/**
 * Some documentation
 */
export default class MongoDbOperationQueue extends MockOperationQueue {
  public constructor(private connectionString: string) {
    super();

    console.debug('Making typescript ', this.connectionString);
  }

  /**
   * Initialize.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public initialize() {}

  async enqueue(didUniqueSuffix: string, operationBuffer: Buffer) {
    throw new Error(
      `MongoDbOperationQueue: Not implemented. Version: TestVersion1. Inputs: ${didUniqueSuffix}, ${operationBuffer}`
    );
  }
}
