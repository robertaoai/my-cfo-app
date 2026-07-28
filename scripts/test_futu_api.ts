// @ts-ignore
import Futu from 'futu-api';

async function testFutu() {
  const futu = new Futu();

  futu.onlogin = async (ret: any, msg: any) => {
    console.log("Login callback:", ret, msg);
    if (ret) {
      try {
        console.log("Fetching market snapshot...");
        // 11 = US Market
        const res = await futu.GetSecuritySnapshot({
          c2s: {
            securityList: [
              { market: 11, code: 'ARMW' },
              { market: 11, code: 'AMDW' }
            ]
          }
        });
        console.log("Snapshot:", JSON.stringify(res, null, 2));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        process.exit(0);
      }
    } else {
      console.error("Login failed:", msg);
      process.exit(1);
    }
  };

  console.log("Starting Futu connection to 127.0.0.1:11111...");
  // Connect to the WebSocket port (trying 11111 as configured, or we might need 11112)
  futu.start('127.0.0.1', 11111, false);

  // Timeout
  setTimeout(() => {
    console.error("Connection timed out after 5 seconds.");
    process.exit(1);
  }, 5000);
}

testFutu();
