const { Transform } = require("node:stream");
const fs = require("node:fs/promises");
const readline = require("node:readline");

class Encryptor extends Transform {
  constructor(fileSize) {
    super();

    // fileSize is in bytes
    this.fileSize = fileSize;
    this.totalBytesRead = 0;
    this.transformsCallsCount = 0;
    this.lastPercentageLogged = 0;
  }

  _transform(chunk, encoding, callback) {
    //#1
    for (let i = 0; i <= chunk.length; ++i) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] + 1;
      }
    }
    this.totalBytesRead += chunk.length;
    this.logProgress();
    callback(null, chunk);
  }
  logProgress() {
    const currentPercentage = Math.floor(
      (this.totalBytesRead / this.fileSize) * 100
    );
    const percentage = Math.round((this.totalBytesRead / this.fileSize) * 100);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Decryption ${percentage}% completed`);
  }
  //#2
  // const encrypted = chunk
  //   .toString("utf-8")
  //   .split("")
  //   .map((c) => String.fromCharCode(c.charCodeAt(0) + 1))
  //   .join("");
  // callback(null, Buffer.from(encrypted));
}

(async () => {
  const readFileHandle = await fs.open("read.txt", "r");
  const writeFileHandle = await fs.open("encrypted-data.txt", "w");

  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const fileSize = (await readFileHandle.stat()).size;
  const encrypt = new Encryptor(fileSize);

  readStream.pipe(encrypt).pipe(writeStream);
})();
