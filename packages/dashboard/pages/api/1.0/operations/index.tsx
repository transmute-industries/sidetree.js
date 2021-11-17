import type { NextApiResponse } from 'next';
import getExample from './example-get.json';

type CreateResponse = { didDocument?: any };

type GetResponse = { operations?: any };

type OperationsResponse = CreateResponse | GetResponse;

import {
  sidetree,
  SidetreeApiRequest,
  convertSidetreeStatusToHttpStatus,
} from '../../../../middleware/sidetree';

const handler = async (
  req: SidetreeApiRequest,
  res: NextApiResponse<OperationsResponse>
) => {
  if (req.method === 'GET') {
    const result: any = getExample;
    res.status(200).json(result);
  }

  if (req.method === 'POST') {
    const operation = Buffer.from(JSON.stringify(req.body));
    const { status, body } = await req.sidetree.method.handleOperationRequest(
      operation
    );
    // // status => http status code
    res.status(convertSidetreeStatusToHttpStatus(status));
    // // body => http response body
    res.json(body);
  }
};

export default sidetree(handler);
