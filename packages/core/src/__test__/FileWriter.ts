const fs = require('fs');

export class FileWriter {
  static write(name: string, content: any) {
    const generatedDir = `${__dirname}/generated`;
    if (name.includes('Buffer.txt')) {
      fs.writeFileSync(`${generatedDir}/${name}`, content.toString('hex'));
    } else {
      fs.writeFileSync(`${generatedDir}/${name}`, content);
    }
  }
}
