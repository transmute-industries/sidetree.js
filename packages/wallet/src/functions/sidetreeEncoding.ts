import crypto from 'crypto';
import base64url from 'base64url';
import multihashes from 'multihashes';
import canonicalize from 'canonicalize';

export const sha256 = (data: Buffer): Buffer => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest();
};

export const hashThenEncode = (data: Buffer): string => {
  const bytes = new Uint8Array(Buffer.from(sha256(data)));
  return base64url.encode(multihashes.encode(bytes, 'sha2-256'));
};

export const canonicalizeThenHashThenEncode = (data: object): string => {
  const cannonical = canonicalize(data);
  return hashThenEncode(cannonical);
};
