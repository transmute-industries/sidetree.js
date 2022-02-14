import type { NextApiResponse } from 'next';

import middleware from '../../../../middleware';

import {
  SidetreeApiRequest,
  convertSidetreeStatusToHttpStatus,
} from '../../../../middleware/sidetree';

type CreateResponse = { didDocument?: any };

type GetResponse = { operations?: any };

type OperationsResponse = CreateResponse | GetResponse;

const handler = async (
  req: SidetreeApiRequest,
  res: NextApiResponse<OperationsResponse>
) => {
  const sidetree = await req.client.server.service.sidetree;
  if (req.method === 'GET') {
    const didUniqueSuffix = req.query['did-unique-suffix'];
    const result: any = await sidetree.getOperations(didUniqueSuffix);

    const operations = result.operations.map((op: any) => {
      return JSON.parse(op.operationBuffer.toString());
    });
    res.status(200).json({ operations });
  }

  if (req.method === 'POST') {
    let reqBody = req.body;
    // In /docs body is object but with window.fetch it is already stringified
    // so handling both cases
    if (typeof reqBody === 'object') {
      reqBody = JSON.stringify(req.body);
    }
    const operation = Buffer.from(reqBody);
    const { status, body } = await sidetree.handleOperationRequest(operation);
    res.status(convertSidetreeStatusToHttpStatus(status));
    res.json(body);
  }
};

export default middleware(handler);
