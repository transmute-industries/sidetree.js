import ResponseStatus from './ResponseStatus';

/**
 * Defines a Sidetree response object.
 */
export default interface ResponseModel {
  status: ResponseStatus;
  body?: any;
}
