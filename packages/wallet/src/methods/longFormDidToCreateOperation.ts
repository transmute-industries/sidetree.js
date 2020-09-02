import { SidetreeCreateOperation } from '../types';
export const longFormDidToCreateOperation = (
  longFormDid: string
): SidetreeCreateOperation => {
  const initialState = longFormDid.split('-initial-state=').pop() as string;
  const [suffix_data, delta] = initialState.split('.');
  const createOperationRequest: SidetreeCreateOperation = {
    type: 'create',
    suffix_data,
    delta,
  };
  return createOperationRequest;
};
