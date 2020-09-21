import { SidetreeReplaceOptions } from '../types';

// TODO: move this to core.
export const replaceOptionsToDidCore = (options: SidetreeReplaceOptions) => {
  const didDocumentPartial: any = {};

  if (options.service_endpoints) {
    didDocumentPartial.service = [];
    options.service_endpoints.forEach((se: any) => {
      didDocumentPartial.service.push({
        id: '#' + se.id,
        type: se.type,
        serviceEndpoint: se.endpoint,
      });
    });
  }

  //   TODO handle public key conversion as well..
  return { ...didDocumentPartial };
};
