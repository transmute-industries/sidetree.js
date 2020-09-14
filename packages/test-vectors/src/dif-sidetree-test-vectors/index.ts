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

export { create, update, recover, deactivate };
