const pako = require('pako');

/**
 * Encapsulates functionality to compress/decompress data.
 */
export default class Compressor {
  /**
   * Compresses the data in gzip and return it as buffer.
   * @param inputAsBuffer The input string to be compressed.
   */
  public static async compress(inputAsBuffer: Buffer): Promise<Buffer> {
    const result = pako.deflate(Buffer.from(inputAsBuffer));
    return Buffer.from(result);
  }

  /**
   * Decompresses the input and returns it as buffer.
   * @param inputAsBuffer The gzip compressed data.
   */
  public static async decompress(inputAsBuffer: Buffer): Promise<Buffer> {
    const result = pako.inflate(inputAsBuffer);
    return Buffer.from(result);
  }
}
