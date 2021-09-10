import { Encoder } from '@sidetree/common';

import { SidetreePublicKeyPurpose, OperationKeyType, Jwk } from './types';

/**
 * Class containing input validation methods.
 */
export default class InputValidator {
  /**
   * Validates the schema of a Sidetree Operation JWK key.
   */
  public static validateOperationKey(
    operationKeyJwk: Jwk,
    operationKeyType: OperationKeyType
  ) {
    const allowedProperties = new Set(['kty', 'crv', 'x', 'y']);
    if (operationKeyType === OperationKeyType.Private) {
      allowedProperties.add('d');
    }
    for (const property in operationKeyJwk) {
      if (!allowedProperties.has(property)) {
        throw new Error(`JWK key has unexpected property '${property}'.`);
      }
    }

    if (operationKeyJwk.crv === 'secp256k1') {
      if (operationKeyJwk.kty !== 'EC') {
        throw new Error(
          `JWK 'kty' property must be 'EC' but got '${operationKeyJwk.kty}.'`
        );
      }

      // `x` and `y` need 43 Base64URL encoded bytes to contain 256 bits.
      if (operationKeyJwk.x.length !== 43) {
        throw new Error(`JWK 'x' property must be 43 bytes.`);
      }

      if (operationKeyJwk.y.length !== 43) {
        throw new Error(`JWK 'y' property must be 43 bytes.`);
      }

      if (
        operationKeyType === OperationKeyType.Private &&
        (operationKeyJwk.d === undefined || operationKeyJwk.d.length !== 43)
      ) {
        throw new Error(`JWK 'd' property must be 43 bytes.`);
      }
    } else {
      console.log('Use JSON Schema to validate JSON...');
    }
  }

  /**
   * Validates an `id` property (in `IonPublicKeyModel` and `IonServiceModel`).
   */
  public static validateId(id: string) {
    const maxIdLength = 50;
    if (id.length > maxIdLength) {
      throw new Error(
        `Key ID length ${id.length} exceed max allowed length of ${maxIdLength}.`
      );
    }

    if (!Encoder.isBase64UrlString(id)) {
      throw new Error(`Key ID '${id}' is not a Base64URL string.`);
    }
  }

  /**
   * Validates the given public key purposes.
   */
  public static validatePublicKeyPurposes(
    purposes?: SidetreePublicKeyPurpose[]
  ) {
    // Nothing to validate if `purposes` is undefined.
    if (purposes === undefined) {
      return;
    }

    // Validate that all purposes are be unique.
    const processedPurposes: Set<SidetreePublicKeyPurpose> = new Set();
    for (const purpose of purposes) {
      if (processedPurposes.has(purpose)) {
        throw new Error(`Public key purpose '${purpose}' already specified.`);
      }
      processedPurposes.add(purpose);
    }
  }
}
