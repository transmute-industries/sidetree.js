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

/**
 * ReadableStream utilities
 */
export default class ReadableStream {
  /**
   * Given a readable stream, reads all data until end or error
   * @param stream Fetch readable stream to read
   * @returns a Buffer of the readable stream data
   */
  public static async readAll(stream: NodeJS.ReadableStream): Promise<Buffer> {
    // Set callback for the 'readable' event to concatenate chunks of the readable stream.
    let content: Buffer = Buffer.alloc(0);

    stream.on('readable', () => {
      // NOTE: Cast to any is to work-around incorrect TS definition for read() where
      // `null` should be a possible return type but is not defined in @types/node: 10.12.18.
      let chunk = stream.read() as any;
      while (chunk !== null) {
        content = Buffer.concat([content, chunk]);
        chunk = stream.read();
      }
    });

    // Create a promise to wrap the successful/failed read events.
    const readBody = new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    // Wait until the read is completed.
    await readBody;

    return content;
  }
}
