import type { NextApiResponse } from 'next';

import withService from '../../../../middleware/withService';

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
    const operation = Buffer.from(JSON.stringify(req.body));
    const { status, body } = await sidetree.handleOperationRequest(operation);
    res.status(convertSidetreeStatusToHttpStatus(status));
    res.json(body);
  }
};

export default withService(handler);
