import type { NextApiResponse } from 'next';
import {
  sidetree,
  SidetreeApiRequest,
  convertSidetreeStatusToHttpStatus,
} from '../../../../../middleware/sidetree';

type Data = {
  didDocument: any;
  didResolutionMetadata: any;
  didDocumentMetadata: any;
};

const handler = async (req: SidetreeApiRequest, res: NextApiResponse<Data>) => {
  const { did } = req.query;
  const { status, body }: any = await req.sidetree.method.handleResolveRequest(
    did
  );
  // // status => http status code
  res.status(convertSidetreeStatusToHttpStatus(status));
  // // body => http response body
  if (body) {
    res.json(body);
  }
};

export default sidetree(handler);
