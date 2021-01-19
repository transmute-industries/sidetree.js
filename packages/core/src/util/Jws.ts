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

import {
  Encoder,
  ErrorCode,
  SidetreeError,
  PublicKeyJwk,
  PrivateKeyJwk,
} from '@sidetree/common';
import { EdDSA } from '@transmute/did-key-ed25519';
import { ES256K } from '@transmute/did-key-secp256k1';

/**
 * Class containing reusable JWS operations.
 */
export default class Jws {
  /** Protected header. */
  public readonly protected: string;
  /** Payload. */
  public readonly payload: string;
  /** Signature. */
  public readonly signature: string;

  /**
   * Constructs a JWS object.
   * @param compactJws Input should be a compact JWS string.
   */
  private constructor(compactJws: any) {
    if (typeof compactJws !== 'string') {
      throw new SidetreeError(ErrorCode.JwsCompactJwsNotString);
    }

    const parts = compactJws.split('.');
    if (parts.length !== 3) {
      throw new SidetreeError(ErrorCode.JwsCompactJwsInvalid);
    }

    const protectedHeader = parts[0];
    const payload = parts[1];
    const signature = parts[2];

    const decodedProtectedHeadJsonString = Encoder.decodeBase64UrlAsString(
      protectedHeader
    );
    const decodedProtectedHeader = JSON.parse(decodedProtectedHeadJsonString);

    const expectedHeaderPropertyCount = 1; // By default we must have header property is `alg`.

    const headerProperties = Object.keys(decodedProtectedHeader);
    if (headerProperties.length !== expectedHeaderPropertyCount) {
      throw new SidetreeError(
        ErrorCode.JwsProtectedHeaderMissingOrUnknownProperty
      );
    }

    // Protected header must contain 'alg' property with value 'EdDSA'.
    if (
      decodedProtectedHeader.alg !== 'EdDSA' &&
      decodedProtectedHeader.alg !== 'ES256K'
    ) {
      throw new SidetreeError(
        ErrorCode.JwsProtectedHeaderMissingOrIncorrectAlg
      );
    }

    // Must contain Base64URL string 'signature' property.
    if (!Encoder.isBase64UrlString(signature)) {
      throw new SidetreeError(ErrorCode.JwsSignatureNotBase64UrlString);
    }

    // Must contain Base64URL string 'payload' property.
    if (!Encoder.isBase64UrlString(payload)) {
      throw new SidetreeError(ErrorCode.JwsPayloadNotBase64UrlString);
    }

    this.protected = protectedHeader;
    this.payload = payload;
    this.signature = signature;
  }

  /**
   * Converts this object to a compact JWS string.
   */
  public toCompactJws(): string {
    return Jws.createCompactJws(this.protected, this.payload, this.signature);
  }

  /**
   * Verifies the JWS signature.
   * @returns true if signature is successfully verified, false otherwise.
   */
  public async verifySignature(publicKey: PublicKeyJwk): Promise<boolean> {
    return Jws.verifySignature(
      this.protected,
      this.payload,
      this.signature,
      publicKey
    );
  }

  /**
   * Verifies the JWS signature.
   * @returns true if signature is successfully verified, false otherwise.
   */
  public static async verifySignature(
    encodedProtectedHeader: string,
    encodedPayload: string,
    signature: string,
    publicKey: PublicKeyJwk
  ): Promise<boolean> {
    const jwsSigningInput =
      encodedProtectedHeader + '.' + encodedPayload + '.' + signature;
    const signatureValid = await Jws.verifyCompactJws(
      jwsSigningInput,
      publicKey
    );
    return signatureValid;
  }

  /**
   * Verifies the compact JWS string using the given JWK key.
   * @returns true if signature is valid; else otherwise.
   */
  public static async verifyCompactJws(
    compactJws: string,
    jwk: PublicKeyJwk
  ): Promise<boolean> {
    try {
      if (jwk.crv === 'Ed25519') {
        await EdDSA.verify(compactJws, jwk);
      } else if (jwk.crv === 'secp256k1') {
        await ES256K.verify(compactJws, jwk as any);
      } else {
        return false;
      }
      return true;
    } catch (error) {
      console.log(
        `Input '${compactJws}' failed signature verification: ${SidetreeError.createFromError(
          ErrorCode.JwsFailedSignatureValidation,
          error
        )}`
      );
      return false;
    }
  }

  /**
   * Signs the given payload as a compact JWS string.
   * This is mainly used by tests to create valid test data.
   */
  public static async signAsCompactJws(
    payload: object,
    privateKey: PrivateKeyJwk,
    protectedHeader?: any
  ): Promise<string> {
    let alg;
    if (protectedHeader && protectedHeader.alg) {
      alg = protectedHeader.alg;
    } else {
      if (privateKey.crv === 'Ed25519') {
        alg = 'EdDSA';
      } else {
        alg = 'ES256K';
      }
    }
    const header = {
      ...protectedHeader,
      alg,
    };
    if (privateKey.crv === 'secp256k1') {
      return await ES256K.sign(payload, privateKey as any, header);
    }
    return await EdDSA.sign(payload, privateKey, header);
  }

  /**
   * Parses the input as a `Jws` object.
   */
  public static parseCompactJws(compactJws: any): Jws {
    return new Jws(compactJws);
  }

  /**
   * Creates a compact JWS string using the given input. No string validation is performed.
   */
  public static createCompactJws(
    protectedHeader: string,
    payload: string,
    signature: string
  ): string {
    return protectedHeader + '.' + payload + '.' + signature;
  }
}
