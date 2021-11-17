import type { NextApiRequest, NextApiResponse } from 'next';

import resolutionResponse from './example.json';

type Data = {
  didDocument: any;
  didResolutionMetadata: any;
  didDocumentMetadata: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // const { did } = req.query;
  // const { status, body } = await sidetree.handleResolveRequest(did);
  // // status => http status code
  // // body => http response body
  const result: any = resolutionResponse.body;
  res.status(200).json(result);
}
