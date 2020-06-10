export interface ISidetreeCasMethods {
  read: (dal: any, cid: string) => Promise<Object>;
  write: (dal: any, obj: Object) => Promise<string>;
}

export interface ICasIpfsConfiguration {
  ipfs: any;
  methods: ISidetreeCasMethods;
  logger?: any;
}

export class CasIpfs {
  private ipfs: any;
  private logger: any;
  public methods: any;

  constructor(config: ICasIpfsConfiguration) {
    this.ipfs = config.ipfs;
    this.methods = config.methods;
    this.logger = config.logger || console;
  }

  public close() {
    this.logger.log('CAS IPFS close ', this);
    return true;
  }

  public write = async (obj: any) => {
    this.logger.log('CAS IPFS write ', obj);
    return this.methods.write(this.ipfs, obj);
  };

  public read = async (cid: string) => {
    this.logger.log('CAS IPFS read ', cid);
    return this.methods.read(this.ipfs, cid);
  };
}

export const configure = (config: ICasIpfsConfiguration) => new CasIpfs(config);
