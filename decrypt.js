const { Transform } = require("node:stream");
const fs = require("node:fs/promises");
const readline = require("node:readline");

class Decryptor extends Transform {
  constructor(fileSize) {
    super();

    // fileSize is in bytes
    this.fileSize = fileSize;
    this.totalBytesRead = 0;
    this.transformsCallsCount = 0;
    this.lastPercentageLogged = 0;
  }

  _transform(chunk, encoding, callback) {
    for (let i = 0; i <= chunk.length; ++i) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] - 1;
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
    // if (currentPercentage > this.lastPercentageLogged) {
    //   console.log(`Decryption ${currentPercentage}% completed`);
    //   this.lastPercentageLogged = currentPercentage;
    // }
    const percentage = Math.round((this.totalBytesRead / this.fileSize) * 100);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Decryption ${percentage}% completed`);
  }
}

(async () => {
  const readFileHandle = await fs.open("encrypted-data.txt", "r");
  const writeFileHandle = await fs.open("result.txt", "w");

  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const fileSize = (await readFileHandle.stat()).size;
  const decrypt = new Decryptor(fileSize);

  readStream.pipe(decrypt).pipe(writeStream);

  writeStream.on("finish", () => {
    readFileHandle.close();
    writeFileHandle.close();
  });
})();
