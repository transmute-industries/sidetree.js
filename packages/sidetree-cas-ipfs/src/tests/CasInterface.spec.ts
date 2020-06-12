import MockCas from '../MockCas';
import CasIpfs from '../CasIpfs';
import ICas from '@sidetree/common/src/interfaces/ICas';
import {
  // ipfs,
  // methods,
  testInteger,
  testObj,
  testString,
} from '../__fixtures__';
import FetchResultCode from '@sidetree/common/src/enums/FetchResultCode';

const mock = new MockCas();
const casIpfs = new CasIpfs('/ip4/127.0.0.1/tcp/5001');

const testSuite = (cas: ICas) => {
  describe(cas.constructor.name, () => {
    describe('write', () => {
      it('should write a JSON and return content id', async () => {
        const cid = await cas.write(Buffer.from(JSON.stringify(testObj)));
        expect(cid).toBe('QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen');
      });

      it('should write a string and return content id', async () => {
        const cid = await cas.write(Buffer.from(testString));
        expect(cid).toBe('QmVGtJ3tWYAotBwcwmRsdNqA9vtWZWkKCwxxLSwsBo3QFA');
      });

      it('should write an integer and return content id', async () => {
        const cid = await cas.write(Buffer.from(testInteger.toString()));
        expect(cid).toBe('QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc');
      });
    });
    // Add test for buffer

    describe('read', () => {
      it('should read a JSON', async () => {
        const fetchResult = await cas.read(
          'QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen'
        );
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(JSON.parse(fetchResult.content)).toEqual(testObj);
      });

      it('should read a string', async () => {
        const fetchResult = await cas.read(
          'QmVGtJ3tWYAotBwcwmRsdNqA9vtWZWkKCwxxLSwsBo3QFA'
        );
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(fetchResult.content.toString()).toEqual(testString);
      });

      it('should read an integer', async () => {
        const fetchResult = await cas.read(
          'QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc'
        );
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(Number.parseInt(fetchResult.content)).toEqual(testInteger);
      });
    });
  });
};

testSuite(mock);

testSuite(casIpfs);
