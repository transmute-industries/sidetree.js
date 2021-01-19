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

import base64url from 'base64url';
import ErrorCode from '../errors/ErrorCode';
import SidetreeError from '../errors/SidetreeError';

/**
 * Class that encodes binary blobs into strings.
 * Note that the encode/decode methods may change underlying encoding scheme.
 */
export default class Encoder {
  /**
   * Encodes given Buffer into a Base64URL string.
   */
  public static encode(content: Buffer | string): string {
    const encodedContent = base64url.encode(content);
    return encodedContent;
  }

  /**
   * Decodes the given Base64URL string into a Buffer.
   */
  public static decodeAsBuffer(encodedContent: string): Buffer {
    Encoder.validateBase64UrlString(encodedContent);

    const content = base64url.toBuffer(encodedContent);
    return content;
  }

  /**
   * Decodes the given input into the original string.
   */
  public static decodeAsString(encodedContent: string): string {
    return Encoder.decodeBase64UrlAsString(encodedContent);
  }

  /**
   * Decodes the given Base64URL string into the original string.
   */
  public static decodeBase64UrlAsString(input: string): string {
    Encoder.validateBase64UrlString(input);

    const content = base64url.decode(input);
    return content;
  }

  /**
   * Validates if the given input is a Base64URL string.
   * undefined is considered not a valid Base64URL string.
   * NOTE: input is `any` type to handle cases when caller passes input directly from JSON.parse() as `any`.
   * @throws SidetreeError if input is not a Base64URL string.
   */
  private static validateBase64UrlString(input: any) {
    if (typeof input !== 'string') {
      throw new SidetreeError(
        ErrorCode.EncoderValidateBase64UrlStringInputNotString,
        `Input '${input}' not a string.`
      );
    }

    const isBase64UrlString = Encoder.isBase64UrlString(input);
    if (!isBase64UrlString) {
      throw new SidetreeError(
        ErrorCode.EncoderValidateBase64UrlStringInputNotBase64UrlString,
        `Input '${input}' not a Base64URL string.`
      );
    }
  }

  /**
   * Tests if the given string is a Base64URL string.
   */
  public static isBase64UrlString(input: string): boolean {
    // NOTE:
    // '/<expression>/ denotes regex.
    // ^ denotes beginning of string.
    // $ denotes end of string.
    // + denotes one or more characters.
    const isBase64UrlString = /^[A-Za-z0-9_-]+$/.test(input);
    return isBase64UrlString;
  }
}
