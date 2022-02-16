import type { NextApiRequest, NextApiResponse } from 'next';
import { config } from '../../../config';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const reqBody = JSON.parse(req.body);
    const body = JSON.stringify({
      client_id: reqBody.clientId,
      client_secret: reqBody.clientSecret,
      audience: config.auth.audience,
      grant_type: 'client_credentials',
    });
    const response = await fetch(`https://${config.auth.domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    const jsonRes = await response.json();
    res.status(response.status);
    res.json(jsonRes);
  }
};

export default handler;
