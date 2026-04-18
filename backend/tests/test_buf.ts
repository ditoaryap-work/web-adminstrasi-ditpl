const arr = new ArrayBuffer(10);
const buf = Buffer.from(arr);
console.log(buf.length);
