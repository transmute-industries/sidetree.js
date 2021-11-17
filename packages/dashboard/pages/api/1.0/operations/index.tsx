import type { NextApiRequest, NextApiResponse } from 'next';
import getExample from './example-get.json';
import postExample from './example-post.json';

type CreateResponse = { didDocument?: any };

type GetResponse = { operations?: any };

type OperationsResponse = CreateResponse | GetResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OperationsResponse>
) {
  if (req.method === 'GET') {
    const result: any = getExample;
    res.status(200).json(result);
  }

  if (req.method === 'POST') {
    const result: any = postExample;
    // const operation = req.body;
    // const { status, body } = await sidetree.handleOperationRequest(operation);
    // // status => http status code
    // // body => http response body
    res.status(200).json(result);
  }
}
