export const longFormDidToCreateOperation = (longFormDid: string) => {
  const initialState = longFormDid.split('-initial-state=').pop() as string;
  const [suffix_data, delta] = initialState.split('.');
  const createOperationRequest = {
    type: 'create',
    suffix_data,
    delta,
  };
  return createOperationRequest;
};
