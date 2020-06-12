import ICas from '@sidetree/common/src/interfaces/ICas';
import MockCas from '../MockCas';
import CasIpfs from '../CasIpfs';
import {
  // ipfs,
  // methods,

  testObj,
  testObjMultihash,
  testString,
  testStringMultiHash,
  testInteger,
  testIntegerMultiHash,
} from '../__fixtures__';
import FetchResultCode from '@sidetree/common/src/enums/FetchResultCode';

const mock = new MockCas();
const casIpfs = new CasIpfs('/ip4/127.0.0.1/tcp/5001');

const testSuite = (cas: ICas) => {
  describe(cas.constructor.name, () => {
    describe('write', () => {
      it('should write a JSON and return content id', async () => {
        const cid = await cas.write(Buffer.from(JSON.stringify(testObj)));
        expect(cid).toBe(testObjMultihash);
      });

      it('should write a string and return content id', async () => {
        const cid = await cas.write(Buffer.from(testString));
        expect(cid).toBe(testStringMultiHash);
      });

      it('should write an integer and return content id', async () => {
        const cid = await cas.write(Buffer.from(testInteger.toString()));
        expect(cid).toBe(testIntegerMultiHash);
      });
    });
    // Add test for buffer

    describe('read', () => {
      it('should read a JSON', async () => {
        const fetchResult = await cas.read(testObjMultihash);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(JSON.parse(fetchResult.content)).toEqual(testObj);
      });

      it('should read a string', async () => {
        const fetchResult = await cas.read(testStringMultiHash);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(fetchResult.content.toString()).toEqual(testString);
      });

      it('should read an integer', async () => {
        const fetchResult = await cas.read(testIntegerMultiHash);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(Number.parseInt(fetchResult.content)).toEqual(testInteger);
      });
    });
  });
};

testSuite(mock);

testSuite(casIpfs);
