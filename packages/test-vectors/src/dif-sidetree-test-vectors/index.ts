import create_createRequest from './create/create.json';
import create_createResponse from './create/resultingDocument.json';

import update_createRequest from './update/create.json';
import update_updateRequest from './update/update.json';
import update_updateResponse from './update/resultingDocument.json';

import recover_createRequest from './recover/create.json';
import recover_recoverRequest from './recover/recover.json';
import recover_recoverResponse from './recover/resultingDocument.json';

import deactivate_createRequest from './deactivate/create.json';
import deactivate_deactivateRequest from './deactivate/deactivate.json';
import deactivate_deactivateResponse from './deactivate/resultingDocument.json';

const create = {
  createRequest: create_createRequest,
  createResponse: create_createResponse,
};

const update = {
  createRequest: update_createRequest,
  updateRequest: update_updateRequest,
  updateResponse: update_updateResponse,
};

const recover = {
  createRequest: recover_createRequest,
  recoverRequest: recover_recoverRequest,
  recoverResponse: recover_recoverResponse,
};

const deactivate = {
  createRequest: deactivate_createRequest,
  deactivateRequest: deactivate_deactivateRequest,
  deactivateResponse: deactivate_deactivateResponse,
};

const testVectors = { create, update, recover, deactivate };

export { testVectors };
