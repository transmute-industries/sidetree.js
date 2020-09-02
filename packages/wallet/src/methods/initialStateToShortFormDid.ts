import { Multihash } from '@sidetree/common';
import base64url from 'base64url';

export const initialStateToShortFormDid = (
  initialState: string,
  didMethodName = 'elem:ropsten'
): string => {
  const parts = initialState.split('.');
  const didUniqueSuffix = Multihash.canonicalizeThenHashThenEncode(
    JSON.parse(base64url.decode(parts[0]))
  );
  const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
  return shortFormDid;
};
