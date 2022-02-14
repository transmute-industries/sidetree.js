import { config } from '../config';
import jwtVerifier from '../core/jwt/jwt-verifier';

const authenticate = async (req: any, res: any) => {
  if (req.url !== '/api/1.0/authenticate' && config.method === 'photon') {
    const verifyJwt = jwtVerifier({
      audience: config.auth.audience,
      issuerBaseURL: `https://${config.auth.domain}`,
    });
    try {
      if (!req.headers.authorization) {
        throw new Error('Invalid Token');
      }
      const jwt = req.headers.authorization.split(' ')[1];
      await verifyJwt(jwt);
    } catch (err) {
      res.status(401).send((err as any).message);
    }
  }
};

export default authenticate;
