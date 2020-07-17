import * as fs from 'fs';
import * as path from 'path';
import { Secp256k1KeyPair, ES256K } from '@transmute/did-key-secp256k1';
import * as crypto from 'crypto';
import {
  updateKeySeed,
  recoveryKeySeed,
  createOperationRequest,
  shortFormDid,
  longFormDid,
  updateOperationRequest,
} from '../__fixtures__/test-vectors';

import {
  createRequest,
  createRequestToShortFormDid,
  createRequestToLongFormDid,
  createUpdateRequest,
} from '../Op';

let updateKey: Secp256k1KeyPair;
let recoveryKey: Secp256k1KeyPair;

beforeAll(async () => {
  updateKey = await Secp256k1KeyPair.generate({
    seed: Buffer.from(updateKeySeed, 'hex'),
  });
  recoveryKey = await Secp256k1KeyPair.generate({
    seed: Buffer.from(recoveryKeySeed, 'hex'),
  });
});

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
  expect(updateKey.id).toBe(
    '#zQ3shP2mWsZYWgvgM11nenXRTx9L1yiJKmkf9dfX7NaMKb1pX'
  );
  expect(recoveryKey.id).toBe(
    '#zQ3sha61ZpLA9FrxPixLi8zyUQV3Sric6qqU7vcjSXjzsigUD'
  );
});

it('initial-state from keys', async () => {
  const request = await createRequest(updateKey, recoveryKey);

  console.log(JSON.stringify(request, null, 2));
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

  const _shortFormDid = createRequestToShortFormDid(request);

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

  const _longFormDid = createRequestToLongFormDid(request);

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

it('update request', async () => {
  const did_suffix = shortFormDid.split(':').pop() as string;
  const patches = [
    {
      action: 'add-public-keys',
      public_keys: [
        {
          id: 'new-key1',
          type: 'EcdsaSecp256k1VerificationKey2019',
          jwk: {
            kty: 'EC',
            crv: 'secp256k1',
            x: 'fDnNuWtIZJgLTgpy-B_3MGnY-s3_mvaK0h2IFk1xBQA',
            y: 'U0iSMelJn-B56nedytH93hP4vWOBYhm6IHM3txZlNPY',
          },
          purpose: ['auth', 'general'],
        },
      ],
    },
  ];
  const privateKeyJwk = await updateKey.toJwk(true);
  delete privateKeyJwk.kid;
  const signer = {
    sign: (payload: any) => {
      return ES256K.sign(payload, privateKeyJwk);
    },
  };
  const update_commitment = 'EiCq2QCMaNRbGmjLsiTrubhZRUmI78hcfJi7CTflzNYuzB';
  const reveal_update_key = await updateKey.toJwk();
  delete reveal_update_key.kid;
  const request = await createUpdateRequest(
    did_suffix,
    patches,
    update_commitment,
    reveal_update_key,
    signer
  );
  console.log(JSON.stringify(request, null, 2));
  if (OVERWRITE_FIXTURES) {
    fs.writeFileSync(
      path.resolve(
        __dirname,
        '../__fixtures__/generated-test-vectors/updateOperationRequest.json'
      ),
      JSON.stringify(request, null, 2)
    );
  } else {
    expect(request).toEqual(JSON.parse(updateOperationRequest));
  }
});
