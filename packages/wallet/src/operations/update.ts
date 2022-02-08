import { IonRequest } from '@gjgd/ion-sdk';

export const update = (input: any) => {
  const result = IonRequest.createUpdateRequest(input);
  return result;
};
