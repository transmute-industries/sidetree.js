import type { NextApiRequest, NextApiResponse } from 'next';
import getElement from '../../../server/getElement';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { did } = req.query;
  const element = await getElement();
  const result = await element.handleResolveRequest(did as string);
  res.status(200).json(result);
}
