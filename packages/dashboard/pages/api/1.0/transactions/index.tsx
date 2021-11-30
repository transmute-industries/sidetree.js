import type { NextApiResponse } from 'next';

type Data = { transactions: any };

import { sidetree, SidetreeApiRequest } from '../../../../middleware/sidetree';

const handler = async (req: SidetreeApiRequest, res: NextApiResponse<Data>) => {
  if (req.method === 'GET') {
    const results: any = await req.sidetree.method.getTransactions();
    res.status(200).json(results);
  }
};

export default sidetree(handler);
