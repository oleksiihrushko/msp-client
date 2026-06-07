const { SerialPort } = require("serialport");
const { buildRequest, parseResponse, COMMANDS } = require("./msp");
const { parseStatus, parseAnalog, parseRawGPS } = require("./parsers");

const port = new SerialPort({ path: "COM3", baudRate: 115200 });
let buffer = Buffer.alloc(0);

port.on("open", () => {
  console.log("✅ Підключено до FC\n");
  const poll = () => {
    port.write(buildRequest(COMMANDS.STATUS));
    port.write(buildRequest(COMMANDS.ANALOG));
    port.write(buildRequest(COMMANDS.RAW_GPS));
  };
  poll();
  setInterval(poll, 2000);
});

port.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (buffer.length >= 9) {
    const payloadLen = buffer.readUInt16LE(6);
    const totalLen = 9 + payloadLen;
    if (buffer.length < totalLen) break;

    const frame = buffer.slice(0, totalLen);
    buffer = buffer.slice(totalLen);
    const response = parseResponse(frame);
    if (!response) continue;

    if (response.command === COMMANDS.STATUS) {
      const d = parseStatus(response.payload);
      console.log(
        "📡 STATUS   | cycle:",
        d.cycleTime,
        "мкс | i2c errors:",
        d.i2cErrors,
        "| profile:",
        d.profile,
      );
      console.log(
        "            | sensors:",
        Object.entries(d.sensors)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", "),
      );
    }

    if (response.command === COMMANDS.ANALOG) {
      const d = parseAnalog(response.payload);
      console.log(
        `🔋 ANALOG   | ${d.voltage}V | ${d.current}A | ${d.mAhDrawn}mAh`,
      );
    }

    if (response.command === COMMANDS.RAW_GPS) {
      const d = parseRawGPS(response.payload);
      console.log(
        `🛰️  GPS      | ${d.fixType} | ${d.numSat} sat | ${d.lat}, ${d.lon} | ${d.altitude}m`,
      );
    }

    console.log("");
  }
});

port.on("error", (err) => console.error("❌", err.message));
