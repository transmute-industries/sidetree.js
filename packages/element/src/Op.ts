import * as crypto from 'crypto';

const canonicalize = require('canonicalize');
const multihashes = require('multihashes');
const base64url = require('base64url');

const createRequest = async (updateKey: any, recoveryKey: any) => {
  const updateKeyJwk = await updateKey.toJwk();
  delete updateKeyJwk.kid;
  const recoveryKeyJwk = await recoveryKey.toJwk();
  delete recoveryKeyJwk.kid;

  const encodedUpdateCommitment = base64url.encode(
    multihashes.encode(
      crypto.createHash('sha256').update(canonicalize(updateKeyJwk)).digest(),
      'sha2-256'
    )
  );
  const encodedRecoveryCommitment = base64url.encode(
    multihashes.encode(
      crypto.createHash('sha256').update(canonicalize(recoveryKeyJwk)).digest(),
      'sha2-256'
    )
  );

  const deltaObject = {
    update_commitment: encodedUpdateCommitment,
    patches: [
      {
        action: 'replace',
        document: {
          public_keys: [
            {
              id: updateKey.id.split('#').pop(),
              type: updateKey.type,
              jwk: updateKeyJwk,
              purpose: ['auth', 'general'],
            },
          ],
          service_endpoints: [
            {
              id: 'serviceEndpointId123',
              type: 'someType',
              endpoint: 'https://www.url.com',
            },
          ],
        },
      },
    ],
  };

  const delta = base64url.encode(canonicalize(deltaObject));

  const deltaHash = base64url.encode(
    multihashes.encode(
      crypto.createHash('sha256').update(base64url.toBuffer(delta)).digest(),
      'sha2-256'
    )
  );

  const request = {
    type: 'create',
    suffix_data: base64url.encode(
      canonicalize({
        delta_hash: deltaHash,
        recovery_commitment: encodedRecoveryCommitment,
      })
    ),
    delta: base64url.encode(canonicalize(deltaObject)),
  };

  return request;
};

const createRequestToShortFormDid = (request: any) => {
  const _shortFormDid = `did:elem:${base64url.encode(
    multihashes.encode(
      crypto
        .createHash('sha256')
        .update(base64url.decode(request.suffix_data))
        .digest(),
      'sha2-256'
    )
  )}`;
  return _shortFormDid;
};

const createRequestToLongFormDid = (request: any) => {
  const _shortFormDid = createRequestToShortFormDid(request);
  const _longFormDid = `${_shortFormDid}?-elem-initial-state=${request.suffix_data}.${request.delta}`;
  return _longFormDid;
};

const createUpdateRequest = async (
  did_suffix: string,
  patches: any,
  update_commitment: string,
  reveal_update_key: any,
  signer: any
) => {
  const delta = base64url.encode(
    canonicalize({
      patches,
      update_commitment,
    })
  );
  const delta_hash = base64url.encode(
    multihashes.encode(
      crypto.createHash('sha256').update(delta).digest(),
      'sha2-256'
    )
  );
  const signed_data = await signer.sign({
    update_key: reveal_update_key,
    delta_hash,
  });
  const request = {
    type: 'update',
    did_suffix,
    delta,
    signed_data,
  };

  return request;
};

export {
  createRequest,
  createRequestToShortFormDid,
  createRequestToLongFormDid,
  createUpdateRequest,
};
