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

const create = {
  createRequest: require('./create/create.json'),
  createResponse: require('./create/resultingDocument.json'),
};

const update = {
  createRequest: require('./update/create.json'),
  updateRequest: require('./update/update.json'),
  updateResponse: require('./update/resultingDocument.json'),
};

const recover = {
  createRequest: require('./recover/create.json'),
  recoverRequest: require('./recover/recover.json'),
  recoverResponse: require('./recover/resultingDocument.json'),
};

const deactivate = {
  createRequest: require('./deactivate/create.json'),
  deactivateRequest: require('./deactivate/deactivate.json'),
  deactivateResponse: require('./deactivate/resultingDocument.json'),
};

module.exports = { create, update, recover, deactivate };
