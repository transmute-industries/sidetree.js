import * as fs from 'fs';
import * as path from 'path';
import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1';
import * as crypto from 'crypto';
import {
  updateKeySeed,
  recoveryKeySeed,
  createOperationRequest,
  shortFormDid,
  longFormDid,
} from '../__fixtures__/test-vectors';

const canonicalize = require('canonicalize');
const multihashes = require('multihashes');
const base64url = require('base64url');

let updateKey: Secp256k1KeyPair;
let recoveryKey: Secp256k1KeyPair;

const OVERWRITE_FIXTURES = false;

it('generate seeds', async () => {
  if (OVERWRITE_FIXTURES) {
    const _updateKeySeed = crypto.randomBytes(32);
    const _recoveryKeySeed = crypto.randomBytes(32);
    fs.writeFileSync(
      path.resolve(__dirname, '../__fixtures__/test-vectors/updateKeySeed.txt'),
      _updateKeySeed.toString('hex')
    );
    fs.writeFileSync(
      path.resolve(
        __dirname,
        '../__fixtures__/test-vectors/recoveryKeySeed.txt'
      ),
      _recoveryKeySeed.toString('hex')
    );
  } else {
    expect(updateKeySeed).toBe(
      fs
        .readFileSync(
          path.resolve(
            __dirname,
            '../__fixtures__/test-vectors/updateKeySeed.txt'
          )
        )
        .toString()
    );

    expect(recoveryKeySeed).toBe(
      fs
        .readFileSync(
          path.resolve(
            __dirname,
            '../__fixtures__/test-vectors/recoveryKeySeed.txt'
          )
        )
        .toString()
    );
  }
});

it('keys from seeds', async () => {
  updateKey = await Secp256k1KeyPair.generate({
    seed: Buffer.from(updateKeySeed, 'hex'),
  });
  recoveryKey = await Secp256k1KeyPair.generate({
    seed: Buffer.from(recoveryKeySeed, 'hex'),
  });
  expect(updateKey.id).toBe(
    '#zQ3shP2mWsZYWgvgM11nenXRTx9L1yiJKmkf9dfX7NaMKb1pX'
  );
  expect(recoveryKey.id).toBe(
    '#zQ3sha61ZpLA9FrxPixLi8zyUQV3Sric6qqU7vcjSXjzsigUD'
  );
});

it('initial-state from keys', async () => {
  const updateKeyJwk = await updateKey.toJwk();
  const recoveryKeyJwk = await recoveryKey.toJwk();

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

  expect(updateKey.type).toBe('EcdsaSecp256k1VerificationKey2019');

  const deltaObject = {
    update_commitment: encodedUpdateCommitment,
    patches: [
      {
        action: 'replace',
        document: {
          publicKeys: [
            {
              id: updateKey.id.split('#').pop(),
              type: updateKey.type,
              jwk: updateKeyJwk,
              purpose: ['auth', 'general'],
            },
          ],
          serviceEndpoints: [
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

  if (OVERWRITE_FIXTURES) {
    fs.writeFileSync(
      path.resolve(
        __dirname,
        '../__fixtures__/generated-test-vectors/createOperationRequest.json'
      ),
      JSON.stringify(request, null, 2)
    );
  } else {
    expect(request).toEqual(JSON.parse(createOperationRequest));
  }

  const _shortFormDid = `did:elem:${base64url.encode(
    multihashes.encode(
      crypto
        .createHash('sha256')
        .update(base64url.decode(request.suffix_data))
        .digest(),
      'sha2-256'
    )
  )}`;

  if (OVERWRITE_FIXTURES) {
    fs.writeFileSync(
      path.resolve(
        __dirname,
        '../__fixtures__/generated-test-vectors/shortFormDid.txt'
      ),
      _shortFormDid
    );
  } else {
    expect(_shortFormDid).toBe(shortFormDid);
  }
  const _longFormDid = `${_shortFormDid}?-elem-initial-state=${request.suffix_data}.${request.delta}`;

  if (OVERWRITE_FIXTURES) {
    fs.writeFileSync(
      path.resolve(
        __dirname,
        '../__fixtures__/generated-test-vectors/longFormDid.txt'
      ),
      _longFormDid
    );
  } else {
    expect(_longFormDid).toBe(longFormDid);
  }
});
