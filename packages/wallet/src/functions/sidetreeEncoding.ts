import crypto from 'crypto';
import base64url from 'base64url';
import multihashes from 'multihashes';
import canonicalize from 'canonicalize';

export const sha256 = (data: any) => {
  return crypto.createHash('sha256').update(data).digest();
};

export const hashThenEncode = (data: any) => {
  const bytes = new Uint8Array(Buffer.from(sha256(data)));
  return base64url.encode(multihashes.encode(bytes, 'sha2-256'));
};

export const canonicalizeThenHashThenEncode = (data: any) => {
  const cannonical = canonicalize(data);
  return hashThenEncode(cannonical);
};
