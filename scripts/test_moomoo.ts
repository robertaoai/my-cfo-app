// test_moomoo.ts
// A minimal script to test connectivity to the local Moomoo OpenD gateway
// Usage: npx tsx scripts/test_moomoo.ts

async function run() {
  console.log("-----------------------------------------");
  console.log("Checking Moomoo OpenD Connectivity...");
  console.log("Ensure OpenD is running on 127.0.0.1:11111 with RSA Disabled.");
  console.log("-----------------------------------------\n");

  try {
    // For this PoC verification, we attempt a raw TCP socket connection
    // since the futu-api package relies on TCP. If the socket connects,
    // OpenD is correctly configured to accept local connections.
    const net = require("net");
    const client = new net.Socket();
    
    // We will enforce a strict 3-second timeout to prevent hanging
    client.setTimeout(3000);

    await new Promise((resolve, reject) => {
      client.connect(11111, "127.0.0.1", () => {
        console.log("✅ SUCCESS: Successfully connected to OpenD on port 11111!");
        client.destroy();
        resolve(true);
      });

      client.on("timeout", () => {
        client.destroy();
        reject(new Error("Connection timed out. Is OpenD running?"));
      });

      client.on("error", (err: Error) => {
        client.destroy();
        reject(err);
      });
    });

  } catch (error: any) {
    console.error("❌ FAILED to connect to Moomoo OpenD.");
    console.error(`   Error details: ${error.message}`);
    console.error("\nTroubleshooting:");
    console.error("1. Did you download and launch OpenD?");
    console.error("2. Are you logged in to OpenD?");
    console.error("3. Is Settings -> Listening Address set to 127.0.0.1?");
    console.error("4. Is Settings -> Listening Port set to 11111?");
    process.exit(1);
  }
}

run();
