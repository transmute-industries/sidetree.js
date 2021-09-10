import { create } from './create';
import { Jwk, SidetreeDocumentModel } from './types';
import { Encoder, JsonCanonicalizer } from '@sidetree/common';

import { computeDidUniqueSuffix } from './computeDidUniqueSuffix';

export const createLongFormDid = (input: {
  method: string;
  network: string;
  document: SidetreeDocumentModel;
  updateKey: Jwk;
  recoveryKey: Jwk;
}): string => {
  const { method, network } = input;
  const createRequest = create(input);

  const didUniqueSuffix = computeDidUniqueSuffix(createRequest.suffixData);

  // Add the network portion if not configured for mainnet.
  let shortFormDid;

  if (network === undefined || network === 'mainnet') {
    shortFormDid = `did:${method}:${didUniqueSuffix}`;
  } else {
    shortFormDid = `did:${method}:${network}:${didUniqueSuffix}`;
  }

  const initialState = {
    suffixData: createRequest.suffixData,
    delta: createRequest.delta,
  };

  // Initial state must be canonicalized as per spec.
  const canonicalizedInitialStateBuffer = JsonCanonicalizer.canonicalizeAsBuffer(
    initialState
  );
  const encodedCanonicalizedInitialStateString = Encoder.encode(
    canonicalizedInitialStateBuffer
  );

  const longFormDid = `${shortFormDid}:${encodedCanonicalizedInitialStateString}`;
  return longFormDid;
};
