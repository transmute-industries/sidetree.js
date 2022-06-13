import type { NextApiResponse } from 'next';
import { SidetreeApiRequest } from '../../../../../middleware/sidetree';

import middleware from '../../../../../middleware';

type Data = {
  didDocument: any;
  didResolutionMetadata: any;
  didDocumentMetadata: any;
};

const handler = async (req: SidetreeApiRequest, res: NextApiResponse<Data>) => {
  const sidetree = await req.client.server.service.sidetree;
  const { did } = req.query;
  const { body }: any = await sidetree.handleResolveRequest(did);

  if (body.code === 'did_not_found') {
    res.status(404);
  } else {
    res.status(200);
  }

  if (body) {
    res.json(body);
  }
};

export default middleware(handler);
