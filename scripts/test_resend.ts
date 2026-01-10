import { getUncachableResendClient } from '../lib/email';

async function testResendConnectivity() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 Resend API Connectivity Test");
  console.log("=".repeat(60) + "\n");

  try {
    console.log("ℹ️  Fetching Resend credentials from Replit connector...\n");
    
    const { client, fromEmail } = await getUncachableResendClient();
    
    console.log("✅ Resend credentials retrieved successfully");
    console.log(`ℹ️  From email: ${fromEmail || 'using default'}`);
    console.log("ℹ️  Sending test email to delivered@resend.dev...\n");
    
    // Note: For testing, we use Resend's default sender to bypass domain verification
    // In production with a verified domain, you would use: fromEmail
    const testFromEmail = "BADA Test <onboarding@resend.dev>";
    
    console.log(`ℹ️  Using test sender: ${testFromEmail}`);
    console.log(`   (Production sender would be: ${fromEmail})\n`);
    
    const result = await client.emails.send({
      from: testFromEmail,
      to: "delivered@resend.dev",
      subject: "BADA - Resend API Test",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #F0F8FF;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
            <h1 style="color: #0800FF; margin-bottom: 20px;">BADA Resend Test</h1>
            <p style="color: #333; line-height: 1.6;">
              This is a test email to verify the Resend API integration is working correctly.
            </p>
            <p style="color: #666; font-size: 14px;">
              Sent at: ${new Date().toISOString()}
            </p>
          </div>
        </div>
      `,
    });
    
    console.log("Response from Resend API:");
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data?.id) {
      console.log("\n" + "=".repeat(60));
      console.log("✅ SUCCESS! Email sent successfully");
      console.log(`   Email ID: ${result.data.id}`);
      console.log("=".repeat(60) + "\n");
      console.log("🎉 Resend API is properly configured and working!");
      process.exit(0);
    } else if (result.error) {
      console.log("\n" + "=".repeat(60));
      console.log("❌ FAILED - Resend API returned an error:");
      console.log(`   ${result.error.message}`);
      console.log("=".repeat(60) + "\n");
      process.exit(1);
    }
  } catch (error) {
    console.log("\n" + "=".repeat(60));
    console.log("❌ FAILED - Could not connect to Resend:");
    console.log(`   ${error}`);
    console.log("\n   Make sure you have the Resend integration configured in Replit.");
    console.log("=".repeat(60) + "\n");
    process.exit(1);
  }
}

testResendConnectivity();
