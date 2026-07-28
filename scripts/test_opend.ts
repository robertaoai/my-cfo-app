import { fetchQuotes } from '../lib/moomoo/tcp_client';

async function testOpendTcp() {
    console.log("-----------------------------------------");
    console.log("Testing Raw TCP Connection to Moomoo OpenD");
    console.log("-----------------------------------------");
    
    try {
        console.log("Attempting to connect to 127.0.0.1:11111 and fetch quotes for AMDW, ARMW...");
        
        // This will send InitConnect (cmd 1001), then QotGetSecuritySnapshot (cmd 3203)
        const quotes = await fetchQuotes(['AMDW', 'ARMW'], 11111);
        
        console.log("\n✅ SUCCESS! Received Quotes:");
        for (const [ticker, price] of quotes.entries()) {
            console.log(`   ${ticker}: $${price}`);
        }
        console.log("\nSprint 4 Moomoo Integration is working flawlessly over TCP!");
        
    } catch (error: any) {
        console.error(`\n❌ TCP Connection Failed: ${error.message}`);
        console.error("Please ensure the 'Listening Port' in OpenD is set to 11111 and OpenD is running.");
        process.exit(1);
    }
}

testOpendTcp();
