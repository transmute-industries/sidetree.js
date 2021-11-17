import type { NextApiRequest, NextApiResponse } from 'next';
import getExample from './example-get.json';

type Data = { transactions: any };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    const result: any = getExample;
    res.status(200).json(result);
  }
}
