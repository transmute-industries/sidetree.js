import { ServiceVersionModel } from 'models';
import FetchResult from '../models/FetchResult';
/**
 * Interface for accessing the underlying CAS (Content Addressable Store).
 * This interface is mainly useful for creating a mock CAS for testing purposes.
 */
export default interface ICas {
  getServiceVersion(): ServiceVersionModel;
  initialize(): Promise<void>;
  close(): Promise<void>;
  /**
   * Writes the given content to CAS.
   * @returns The SHA256 hash in base64url encoding which represents the address of the content.
   */
  write(content: Buffer): Promise<string>;
  /**
   * Reads the content of the given address in CAS.
   * @returns The fetch result containg the content buffer if found.
   */
  read(address: string): Promise<FetchResult>;
}
