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

const fs = require('fs');

export class FileWriter {
  static write(name: string, content: any) {
    const generatedDir = `${__dirname}/generated`;
    if (name.includes('Buffer.txt')) {
      fs.writeFileSync(`${generatedDir}/${name}`, content.toString('hex'));
    } else {
      fs.writeFileSync(`${generatedDir}/${name}`, content);
    }
  }
}
