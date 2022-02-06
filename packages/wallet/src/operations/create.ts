import { IonRequest } from '@gjgd/ion-sdk';

export const create = (input: {
  document: any;
  updateKey: any;
  recoveryKey: any;
}) => {
  const result = IonRequest.createCreateRequest(input);
  return result;
};
