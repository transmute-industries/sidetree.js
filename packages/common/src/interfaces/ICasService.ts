import ICas from './ICas';
import ServiceVersionModel from '../models/ServiceVersionModel';

export default interface ICasService extends ICas {
  getServiceVersion(): Promise<ServiceVersionModel>;
  initialize(): Promise<void>;
  close(): Promise<void>;
}
