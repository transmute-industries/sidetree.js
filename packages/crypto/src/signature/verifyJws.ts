import base64url from 'base64url';
export const verifyJws = async (verifier: any, jws: string) => {
  const [header, payload, signature] = jws.split('.');
  const toBeVerified = `${header}.${payload}`;
  const verified = await verifier.verify(
    Buffer.from(toBeVerified),
    base64url.toBuffer(signature)
  );
  return verified;
};
