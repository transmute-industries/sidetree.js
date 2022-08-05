import {
  Encoder,
  JsonCanonicalizer,
  Multihash,
} from '@evan.network/sidetree-common';

export const computeDidUniqueSuffix = (
  suffixData: object,
  hashAlgorithmInMultihashCode = 18
): string => {
  const canonicalizedStringBuffer =
    JsonCanonicalizer.canonicalizeAsBuffer(suffixData);
  const multihash = Multihash.hash(
    canonicalizedStringBuffer,
    hashAlgorithmInMultihashCode
  );
  const encodedMultihash = Encoder.encode(multihash);
  return encodedMultihash;
};
