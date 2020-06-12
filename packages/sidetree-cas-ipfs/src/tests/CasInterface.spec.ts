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

const mock = new MockCas();
const casIpfs = new CasIpfs('/ip4/127.0.0.1/tcp/5001');

const testSuite = (cas: ICas) => {
  describe(cas.constructor.name, () => {
    describe('write', () => {
      it('should write a JSON and return content id', async () => {
        const cid = await cas.write(Buffer.from(JSON.stringify(testObj)));
        expect(cid).toBe('QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen');
      });

      // it('should write a string and return content id', async () => {
      //   const cid = await cas.write(Buffer.from(testString));
      //   expect(cid).toBe('QmT2PFvRp4VXeBtFRWJUfJpssK6UqTZ5eHpaYQNcEXfNn8');
      // });

      // it('should write an integer and return content id', async () => {
      //   const cid = await cas.write(Buffer.from(testInteger));
      //   expect(cid).toBe('QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc');
      // });
    });

    // describe('read', () => {
    //   it('should read a JSON', async () => {
    //     const obj = await cas.read(
    //       'QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen'
    //     );
    //     expect(obj).toEqual(testObj);
    //   });

    //   it('should read a string', async () => {
    //     const obj = await cas.read(
    //       'QmT2PFvRp4VXeBtFRWJUfJpssK6UqTZ5eHpaYQNcEXfNn8'
    //     );
    //     expect(obj).toEqual(testString);
    //   });

    //   it('should read an integer', async () => {
    //     const obj = await cas.read(
    //       'QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc'
    //     );
    //     expect(obj).toEqual(testInteger);
    //   });
    // });
  });
};

testSuite(mock);

testSuite(casIpfs);
