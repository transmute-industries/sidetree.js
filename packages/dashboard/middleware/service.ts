import registerService from './registerService';

import { methodSwitch } from './sidetree';

import { config } from '../config';

class SidetreeServiceManager {
  private static _instance: SidetreeServiceManager;
  private sidetree: any;

  private constructor() {
    this.sidetree = this.init();
  }

  public async init() {
    const method = await methodSwitch(config.methodName)(
      config.sideTreeNodeConfigs
    );
    return method;
  }

  async shutdown() {
    await this.sidetree.method.shutdown();
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}

const singleton = registerService('services', () => {
  const instance = SidetreeServiceManager.Instance;
  return instance;
});

export default singleton;
