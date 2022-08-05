import {
  Encoder,
  Multihash,
  SuffixDataModel,
} from '@evan.network/sidetree-common';

import JsonCanonicalizer from './util/JsonCanonicalizer';

export const computeUniqueSuffix = (suffixDataModel: SuffixDataModel) => {
  const hashAlgorithmInMultihashCode = 18;
  const suffixDataBuffer =
    JsonCanonicalizer.canonicalizeAsBuffer(suffixDataModel);
  const multihash = Multihash.hash(
    suffixDataBuffer,
    hashAlgorithmInMultihashCode
  );
  const encodedMultihash = Encoder.encode(multihash);
  return encodedMultihash;
};
