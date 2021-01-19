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

import { Encoder, ErrorCode, SidetreeError } from '@sidetree/common';
import Jwk from '../../util/Jwk';
import Jws from '../../util/Jws';

describe('Jws', () => {
  describe('parseCompactJws()', () => {
    it('should throw error if given input to parse is not a string.', async () => {
      const anyObject = { a: 'abc' };

      expect(() => {
        Jws.parseCompactJws(anyObject);
      }).toThrow(new SidetreeError(ErrorCode.JwsCompactJwsNotString));
    });

    it('should throw error if given input string has more than 3 parts separated by a "." character.', async () => {
      const invalidCompactJwsString = 'aaa.bbb.ccc.ddd';

      expect(() => {
        Jws.parseCompactJws(invalidCompactJwsString);
      }).toThrow(new SidetreeError(ErrorCode.JwsCompactJwsInvalid));
    });

    it('should throw error if protected header contains unexpected property.', async () => {
      const [, signingPrivateKey] = await Jwk.generateEd25519KeyPair();

      const protectedHeader = {
        unknownProperty: 'anyValue',
        alg: 'EdDSA',
      };

      const payload = { anyProperty: 'anyValue' };

      const jws = await Jws.signAsCompactJws(
        payload,
        signingPrivateKey,
        protectedHeader
      );

      expect(() => {
        Jws.parseCompactJws(jws);
      }).toThrow(
        new SidetreeError(ErrorCode.JwsProtectedHeaderMissingOrUnknownProperty)
      );
    });

    it('should throw error if payload is not Base64URL string.', async () => {
      const protectedHeader = {
        alg: 'EdDSA',
      };
      const encodedProtectedHeader = Encoder.encode(
        JSON.stringify(protectedHeader)
      );

      const compactJws = Jws.createCompactJws(
        encodedProtectedHeader,
        '***InvalidPayloadString****',
        'anyValidBase64UrlStringAsSignature'
      );

      expect(() => {
        Jws.parseCompactJws(compactJws);
      }).toThrow(new SidetreeError(ErrorCode.JwsPayloadNotBase64UrlString));
    });

    it('should throw error if signature is not Base64URL string.', async () => {
      const protectedHeader = {
        alg: 'EdDSA',
      };
      const encodedProtectedHeader = Encoder.encode(
        JSON.stringify(protectedHeader)
      );

      const compactJws = Jws.createCompactJws(
        encodedProtectedHeader,
        'anyValidBase64UrlStringAsPayload',
        '***InvalidSignatureString****'
      );

      expect(() => {
        Jws.parseCompactJws(compactJws);
      }).toThrow(new SidetreeError(ErrorCode.JwsSignatureNotBase64UrlString));
    });
  });

  describe('verifyCompactJws()', () => {
    it('should return true if given compact JWS string has a valid signature.', async () => {
      const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();

      const payload = { abc: 'unused value' };
      const compactJws = await Jws.signAsCompactJws(payload, privateKey);

      expect(await Jws.verifyCompactJws(compactJws, publicKey)).toBeTruthy();
    });

    it('should return false if given compact JWS string has an ivalid signature.', async () => {
      const [publicKey1] = await Jwk.generateEd25519KeyPair();
      const [, privateKey2] = await Jwk.generateEd25519KeyPair();

      const payload = { abc: 'some value' };
      const compactJws = await Jws.signAsCompactJws(payload, privateKey2); // Intentionally signing with a different key.

      expect(await Jws.verifyCompactJws(compactJws, publicKey1)).toBeFalsy();
    });

    it('should return false if input is not a valid JWS string', async () => {
      const input = 'some invalid string';
      const [publicKey] = await Jwk.generateEd25519KeyPair();

      expect(await Jws.verifyCompactJws(input, publicKey)).toBeFalsy();
    });
  });

  describe('Ed25519', () => {
    it('should support Ed25519 sign and verify', async () => {
      const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();
      const payload = { abc: 'some value' };
      const compactJws = await Jws.signAsCompactJws(payload, privateKey);
      const verified = await Jws.verifyCompactJws(compactJws, publicKey);
      expect(verified).toBeTruthy();
    });

    it('should parse Ed25519 compact jws', async () => {
      const [, privateKey] = await Jwk.generateEd25519KeyPair();
      const payload = { abc: 'some value' };
      const compactJws = await Jws.signAsCompactJws(payload, privateKey);
      const parsed = Jws.parseCompactJws(compactJws);
      expect(parsed).toBeDefined();
    });
  });

  describe('ES256K', () => {
    it('should support ES256K sign and verify', async () => {
      const [publicKey, privateKey] = await Jwk.generateSecp256k1KeyPair();
      const payload = { abc: 'some value' };
      const compactJws = await Jws.signAsCompactJws(payload, privateKey);
      const verified = await Jws.verifyCompactJws(compactJws, publicKey);
      expect(verified).toBeTruthy();
    });

    it('should parse ES256K compact jws', async () => {
      const [, privateKey] = await Jwk.generateSecp256k1KeyPair();
      const payload = { abc: 'some value' };
      const compactJws = await Jws.signAsCompactJws(payload, privateKey);
      const parsed = Jws.parseCompactJws(compactJws);
      expect(parsed).toBeDefined();
    });
  });
});
