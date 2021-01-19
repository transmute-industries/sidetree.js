/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ErrorCode, SidetreeError } from '@sidetree/common';
import Jwk from '../../util/Jwk';

const mnemonic =
  'mosquito sorry ring page rough future world beach pretty calm person arena';

describe('Jwk', () => {
  describe('Ed25519 keys', () => {
    it('should generate valid Ed25519 keypair', async () => {
      const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();
      expect(publicKey).toBeDefined();
      expect(publicKey.crv).toBe('Ed25519');
      expect(privateKey).toBeDefined();
      expect(privateKey.crv).toBe('Ed25519');
    });

    it('should be valid JWK', async () => {
      const [publicKey] = await Jwk.generateEd25519KeyPair();
      expect(() => Jwk.validatePublicJwk(publicKey)).not.toThrow();
    });

    it('should deterministically generate Ed25519 keypair', async () => {
      const [
        publicKey1,
        privateKey1,
      ] = await Jwk.generateJwkKeyPairFromMnemonic('ed25519', mnemonic, 0);
      const [
        publicKey2,
        privateKey2,
      ] = await Jwk.generateJwkKeyPairFromMnemonic('ed25519', mnemonic, 0);
      expect(publicKey1).toEqual(publicKey2);
      expect(privateKey1).toEqual(privateKey2);
      expect(() => Jwk.validatePublicJwk(publicKey1)).not.toThrow();
    });
  });

  describe('Secp256k1 keys', () => {
    it('should generate secp256k1 keypair', async () => {
      const [publicKey, privateKey] = await Jwk.generateSecp256k1KeyPair();
      expect(publicKey).toBeDefined();
      expect(publicKey.crv).toBe('secp256k1');
      expect(privateKey).toBeDefined();
      expect(privateKey.crv).toBe('secp256k1');
    });

    it('should be valid JWK', async () => {
      const [publicKey] = await Jwk.generateSecp256k1KeyPair();
      expect(() => Jwk.validatePublicJwk(publicKey)).not.toThrow();
    });

    it('should deterministically generate secp256k1 keypair', async () => {
      const [
        publicKey1,
        privateKey1,
      ] = await Jwk.generateJwkKeyPairFromMnemonic('secp256k1', mnemonic, 0);
      const [
        publicKey2,
        privateKey2,
      ] = await Jwk.generateJwkKeyPairFromMnemonic('secp256k1', mnemonic, 0);
      expect(publicKey1).toEqual(publicKey2);
      expect(privateKey1).toEqual(privateKey2);
      expect(() => Jwk.validatePublicJwk(publicKey1)).not.toThrow();
    });
  });

  describe('validatePublicJwk()', () => {
    it('should throw error if `undefined` is passed.', async () => {
      expect(() => {
        Jwk.validatePublicJwk(undefined);
      }).toThrow(new SidetreeError(ErrorCode.JwkUndefined));
    });

    it('should throw error if un unknown property is included in the JWK.', async () => {
      const jwk = {
        unknownProperty: 'any value',
        crv: 'Ed25519',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'OKP',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkHasUnknownProperty));
    });

    it('should throw error if JWK has the wrong `kty` value.', async () => {
      const jwk = {
        crv: 'Ed25519',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'WRONG_TYPE',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkMissingOrInvalidKty));
    });

    it('should throw error if JWK has the wrong `crv` value.', async () => {
      const jwk = {
        crv: 'WRONG_CURVE',
        x: 'vcLqWyMCFAg8Wrbxu-p01-SG0ATO3rAKq3KobKUSsN8',
        kty: 'OKP',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkMissingOrInvalidCrv));
    });

    it('should throw error if JWK has the wrong `x` type.', async () => {
      const jwk = {
        crv: 'Ed25519',
        x: 123,
        kty: 'OKP',
        kid: 'ee5XJ8S-BMuvPFsk0GN-mkL3QEGoorgLbnMFIzXkUSE',
      };

      expect(() => {
        Jwk.validatePublicJwk(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkMissingOrInvalidTypeX));
    });
  });
});
