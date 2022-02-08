import { IonRequest } from '@gjgd/ion-sdk';

export const deactivate = (input: any) => {
  const result = IonRequest.createDeactivateRequest(input);
  return result;
};
