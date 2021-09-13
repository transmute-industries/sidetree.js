import { IonRequest } from '@decentralized-identity/ion-sdk';

export const deactivate = (input: any) => {
  const result = IonRequest.createDeactivateRequest(input);
  return result;
};
