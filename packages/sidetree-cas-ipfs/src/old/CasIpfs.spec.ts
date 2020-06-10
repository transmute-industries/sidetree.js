import { configure } from './CasIpfs';
import {
  ipfs,
  methods,
  testInteger,
  testObj,
  testString,
} from '../__fixtures__';

describe('CasIpfs', () => {
  let cas: any;
  beforeAll(() => {
    cas = configure({ ipfs, methods, logger: { log: jest.fn() } });
  });

  it('configure', () => {
    expect(cas.read).toBeDefined();
    expect(cas.write).toBeDefined();
    expect(cas.close).toBeDefined();
  });

  describe('write', () => {
    it('should write a JSON and return content id', async () => {
      const cid = await cas.write(testObj);
      expect(cid).toBe('QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen');
    });

    it('should write a string and return content id', async () => {
      const cid = await cas.write(testString);
      expect(cid).toBe('QmT2PFvRp4VXeBtFRWJUfJpssK6UqTZ5eHpaYQNcEXfNn8');
    });

    it('should write an integer and return content id', async () => {
      const cid = await cas.write(testInteger);
      expect(cid).toBe('QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc');
    });
  });

  describe('read', () => {
    it('should read a JSON', async () => {
      const obj = await cas.read(
        'QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen'
      );
      expect(obj).toEqual(testObj);
    });

    it('should read a string', async () => {
      const obj = await cas.read(
        'QmT2PFvRp4VXeBtFRWJUfJpssK6UqTZ5eHpaYQNcEXfNn8'
      );
      expect(obj).toEqual(testString);
    });

    it('should read an integer', async () => {
      const obj = await cas.read(
        'QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc'
      );
      expect(obj).toEqual(testInteger);
    });
  });
});
