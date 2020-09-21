import base64url from 'base64url';
import canonicalize from 'canonicalize';

export const createJws = async (signer: any, payload: any, header: object) => {
  const encodedHeader = base64url.encode(canonicalize(header));
  const encodedPayload = base64url.encode(canonicalize(payload));
  const toBeSigned = `${encodedHeader}.${encodedPayload}`;
  const signature = await signer.sign(Buffer.from(toBeSigned) as any);
  return `${toBeSigned}.${base64url.encode(Buffer.from(signature))}`;
};
