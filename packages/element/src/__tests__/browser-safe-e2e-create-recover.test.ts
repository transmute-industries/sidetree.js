import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import canonicalize from 'canonicalize';
import crypto from 'crypto';
import base64url from 'base64url';
import multihashes from 'multihashes';
import Element from '../Element';
import { EthereumLedger } from '@sidetree/ethereum';
import { resetDatabase, getTestLedger } from '../test/utils';
import config from '../test/element-config.json';

const sha256 = (data: any) => {
  return crypto.createHash('sha256').update(data).digest();
};

const hash_then_encode = (data: any) => {
  const bytes = new Uint8Array(Buffer.from(sha256(data)));
  return base64url.encode(multihashes.encode(bytes, 'sha2-256'));
};

const cannonize_then_hash_then_encode = (data: any) => {
  const cannonical = canonicalize(data);
  return hash_then_encode(cannonical);
};

let ledger: EthereumLedger;
let element: Element;

beforeAll(async () => {
  await resetDatabase();
  ledger = await getTestLedger();
  element = new Element(config, config.versions, ledger);
  await element.initialize(false, false);
});

afterAll(async () => {
  await element.close();
});

it('kill me now', async () => {
  const ed25519KeyPair = await Ed25519KeyPair.generate({
    seed: Buffer.from(
      '9b937b81322d816cfab9d5a3baacc9b2a5febe4b149f126b3630f93a29527017',
      'hex'
    ),
  });
  const ed25519PublicKeyJwk = await ed25519KeyPair.toJwk();
  // const x25519KeyPair = await ed25519KeyPair.toX25519KeyPair();
  // const x25519PublicKeyJwk = await x25519KeyPair.toJwk();

  const delta_object = {
    update_commitment: cannonize_then_hash_then_encode(ed25519PublicKeyJwk),
    patches: [
      {
        action: 'replace',
        document: {
          public_keys: [
            {
              id: ed25519PublicKeyJwk.kid,
              type: 'JsonWebKey2020',
              jwk: ed25519PublicKeyJwk,
              purpose: ['auth', 'assertion'],
            },
            // {
            //   id: x25519PublicKeyJwk.kid,
            //   type: 'JsonWebKey2020',
            //   jwk: x25519PublicKeyJwk,
            //   purpose: ['agreement'],
            // },
          ],
        },
      },
    ],
  };

  const delta = base64url.encode(canonicalize(delta_object));

  const canonical_suffix_data = canonicalize({
    delta_hash: cannonize_then_hash_then_encode(delta_object),
    recovery_commitment: cannonize_then_hash_then_encode(ed25519PublicKeyJwk),
  });

  const suffix_data = base64url.encode(canonical_suffix_data);

  const createOperation = {
    type: 'create',
    suffix_data,
    delta,
  };

  const operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(createOperation))
  );
  console.log(JSON.stringify(operation, null, 2));
});
