import { createSigner } from './createSigner';
import { createJws } from './createJws';
import { crvToJwsAlg } from '../constants';

export const createJwsSigner = async (privateKeyJwk: any) => {
  const signer = await createSigner(privateKeyJwk);
  const alg = crvToJwsAlg[privateKeyJwk.crv];
  return {
    sign: async (data: Buffer) => {
      return createJws(signer, data, { alg });
    },
  };
};
