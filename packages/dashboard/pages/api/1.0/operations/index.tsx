import type { NextApiResponse } from 'next';

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
    const didUniqueSuffix = req.query['did-unique-suffix'];
    const result: any = await req.sidetree.method.getOperations(
      didUniqueSuffix
    );

    const operations = result.operations.map((op: any) => {
      return JSON.parse(op.operationBuffer.toString());
    });
    res.status(200).json({ operations });
  }

  if (req.method === 'POST') {
    const operation = Buffer.from(JSON.stringify(req.body));
    const { status, body } = await req.sidetree.method.handleOperationRequest(
      operation
    );
    res.status(convertSidetreeStatusToHttpStatus(status));
    res.json(body);
  }
};

export default sidetree(handler);
