import fs from 'fs';
import path from 'path';

export const writeFixture = (filename: string, object: any) => {
  fs.writeFileSync(
    path.resolve(__dirname, '../__fixtures__/', filename),
    JSON.stringify(object, null, 2)
  );
};
