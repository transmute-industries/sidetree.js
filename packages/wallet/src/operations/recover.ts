import { IonRequest } from '@decentralized-identity/ion-sdk';

export const recover = (input: any) => {
  const result = IonRequest.createRecoverRequest(input);
  return result;
};
