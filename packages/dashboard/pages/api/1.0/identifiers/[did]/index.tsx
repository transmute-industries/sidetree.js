import type { NextApiResponse } from 'next';
import {
  SidetreeApiRequest,
  convertSidetreeStatusToHttpStatus,
} from '../../../../../middleware/sidetree';

import withService from '../../../../../middleware/withService';

type Data = {
  didDocument: any;
  didResolutionMetadata: any;
  didDocumentMetadata: any;
};

const handler = async (req: SidetreeApiRequest, res: NextApiResponse<Data>) => {
  const sidetree = await req.client.server.service.sidetree;
  const { did } = req.query;
  const { status, body }: any = await sidetree.handleResolveRequest(did);
  // // status => http status code
  res.status(convertSidetreeStatusToHttpStatus(status));
  // // body => http response body
  if (body) {
    res.json(body);
  }
};

export default withService(handler);
