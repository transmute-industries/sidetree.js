import { createVerifier } from './createVerifier';
import { verifyJws } from './verifyJws';

export const createJwsVerifier = async (publicKeyJwk: any) => {
  const verifier = await createVerifier(publicKeyJwk);
  return {
    verify: async (jws: string) => {
      return verifyJws(verifier, jws);
    },
  };
};
