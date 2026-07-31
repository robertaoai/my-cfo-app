import net from 'net';
import crypto from 'crypto';

const protoRoot = require('futu-api/proto.js');
const ftWebsocketHeadSign = "ft-v1.0";

function packBuff(cmd: number, buff: Uint8Array, serialNo: number): Buffer {
    const headerLen = 44;
    const buf = Buffer.alloc(headerLen + buff.length);
    
    // szHeaderFlag: u8_t[2] -> "FT"
    buf.write("FT", 0, 2, 'utf8');
    // nProtoID: u32_t -> offset 2
    buf.writeUInt32LE(cmd, 2);
    // nProtoFmtType: u8_t -> offset 6 (0 = Protobuf)
    buf.writeUInt8(0, 6);
    // nProtoVer: u8_t -> offset 7 (0)
    buf.writeUInt8(0, 7);
    // nSerialNo: u32_t -> offset 8
    buf.writeUInt32LE(serialNo, 8);
    // nBodyLen: u32_t -> offset 12
    buf.writeUInt32LE(buff.length, 12);
    // arrBodySHA1: u8_t[20] -> offset 16
    const sha1 = crypto.createHash("sha1").update(buff).digest();
    sha1.copy(buf, 16);
    // arrReserved: u8_t[8] -> offset 36 (leaves 0)
    
    // Body starts at offset 44
    Buffer.from(buff).copy(buf, 44);
    
    return buf;
}

export async function fetchQuotes(tickers: string[], port: number = 11111): Promise<Map<string, number>> {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const quotes = new Map<string, number>();
        let connected = false;
        let currentSerial = 1;

        const timeout = setTimeout(() => {
            client.destroy();
            reject(new Error("Timeout waiting for OpenD response"));
        }, 10000);

        client.connect(port, '127.0.0.1', () => {
            connected = true;
            // Send InitConnect (1001)
            const InitConnectReq = protoRoot.lookup("InitConnect.Request");
            const req = InitConnectReq.create({
                c2s: {
                    clientVer: 100,
                    clientID: "my-cfo-app",
                    recvNotify: false
                }
            });
            const buff = InitConnectReq.encode(req).finish();
            client.write(packBuff(1001, buff, currentSerial++));
        });

        client.on('data', (data) => {
            if (data.length < 44) return;

            // szHeaderFlag is "FT" at offset 0
            const cmd = data.readUInt32LE(2); // offset 2
            const bodyLen = data.readUInt32LE(12); // offset 12
            const body = data.slice(44, 44 + bodyLen);

            if (cmd === 1001) {
                // InitConnect response
                const InitConnectResp = protoRoot.lookup("InitConnect.Response");
                const resp: any = InitConnectResp.decode(body);
                
                if (resp.retType !== 0) {
                    console.error("InitConnect Failed:", resp.retMsg);
                    client.destroy();
                    reject(new Error(resp.retMsg));
                    return;
                }
                
                // InitConnect success, now ask for quotes
                const QotGetSecuritySnapshotReq = protoRoot.lookup("Qot_GetSecuritySnapshot.Request");
                
                const securityList = tickers.map(t => {
                    const parts = t.split('.');
                    // Use market 11 for US, otherwise 1 (HK)
                    return { market: parts[0] === 'US' ? 11 : 11, code: parts.length > 1 ? parts[1] : parts[0] };
                });

                const qotReq = QotGetSecuritySnapshotReq.create({
                    c2s: { securityList }
                });
                const qotBuff = QotGetSecuritySnapshotReq.encode(qotReq).finish();
                client.write(packBuff(3203, qotBuff, currentSerial++));
            }
            else if (cmd === 3203) {
                // Quotes received
                const QotGetSecuritySnapshotResp = protoRoot.lookup("Qot_GetSecuritySnapshot.Response");
                const resp: any = QotGetSecuritySnapshotResp.decode(body);
                
                if (resp.retType !== 0) {
                    console.error("QotGetSecuritySnapshot Failed:", resp.retMsg);
                    client.destroy();
                    reject(new Error(resp.retMsg));
                    return;
                }
                
                if (resp.s2c && resp.s2c.snapshotList) {
                    resp.s2c.snapshotList.forEach((s: any) => {
                        quotes.set(`US.${s.basic.security.code}`, s.basic.curPrice);
                    });
                } else {
                    console.warn("No snapshotList in response:", JSON.stringify(resp));
                }
                
                clearTimeout(timeout);
                client.destroy();
                resolve(quotes);
            }
        });

        client.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}
