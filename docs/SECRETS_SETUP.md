# Secrets & API Setup (First-Time Guide)

This document is generated for **Sprint 4 (Phase 0)**. Please complete these manual GUI steps to configure your local environment for secure automation.

## Part 1: 1Password Integration
The 1Password CLI (`op`) is successfully installed on your machine. However, it cannot access your vault until you explicitly authorize it in the desktop app.

1. **Authorize the CLI:**
   - Open your **1Password Desktop App** on Windows.
   - Click your profile/menu and go to **Settings**.
   - Navigate to the **Developer** tab.
   - **Check the box** for "Integrate with 1Password CLI".

2. **Verify & Authenticate:**
   - Open a fresh PowerShell terminal.
   - Run the command: `op vault list`
   - You should be prompted by Windows Hello (or your master password) to unlock 1Password. 
   - Note the exact name of your primary vault (usually "Private" or "Personal").

3. **Store Your Project Keys:**
   - Run the following commands in PowerShell. **Replace the `<VALUE>` placeholders** with your actual Supabase keys, and replace `<VAULT>` with the vault name from the previous step.

   ```powershell
   # Supabase Keys (From Supabase Dashboard -> Settings -> API)
   op item create --category="Password" --title="SUPABASE_URL" --vault="<VAULT>" password="<VALUE>"
   op item create --category="Password" --title="SUPABASE_ANON_KEY" --vault="<VAULT>" password="<VALUE>"
   op item create --category="Password" --title="SUPABASE_SERVICE_ROLE_KEY" --vault="<VAULT>" password="<VALUE>"

   # Local App
   op item create --category="Password" --title="APP_URL" --vault="<VAULT>" password="http://localhost:3000"
   ```

4. **Verify the Keys:**
   - Run: `op read "op://<VAULT>/SUPABASE_URL/password"` 
   - It should securely print your Supabase URL to the screen.

---

## Part 2: Moomoo OpenD Gateway Setup
Our automation scripts require a local gateway to fetch live quotes. 

1. **Download:**
   - Download the **OpenD for Windows** client from the official [Moomoo API site](https://openapi.moomoo.com/moomoo-api-doc/en/quick_guide/opend.html).
   - Install and launch the application.

2. **Log In:**
   - Log into OpenD using your Moomoo trading account credentials.

3. **Configure Settings:**
   - Click the gear icon to open **Settings**.
   - **Listening Address:** Ensure this is set exactly to `127.0.0.1`.
   - **Listening Port:** Ensure this is set to `11111` (this is the TCP Protobuf port).
   - **Telnet Port:** Leave blank to disable.
   - **WebSocket Port:** Leave blank to disable. We use the faster, raw TCP protocol via Listening Port instead.
   - **RSA Encryption / Keys:** These must be **Disabled** (leave fields blank) for our local proof-of-concept scripts to connect without needing explicit RSA keypair management.
   - Restart OpenD after applying these settings.

4. **Verify Connection:**
   - Run `npx tsx scripts/test_opend.ts` in your terminal to prove the TCP connection is successful before moving on.

Once both Part 1 and Part 2 are complete, you are ready to proceed with the codebase automation!
