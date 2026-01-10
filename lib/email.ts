// Email service using Resend integration
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: connectionSettings.settings.from_email
  };
}

// Get the base URL for verification links
function getBaseUrl(): string {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  }
  return 'http://localhost:5000';
}

// Send verification email
export async function sendVerificationEmail(
  email: string, 
  token: string, 
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const baseUrl = getBaseUrl();
    const verificationLink = `${baseUrl}/api/verify?token=${token}&id=${leadId}`;
    
    // Sender priority:
    // 1. noreply-verify@bada.one (preferred once domain is verified in Resend)
    // 2. Resend test sender (fallback for development/unverified domain)
    const preferredSender = 'BADA <noreply-verify@bada.one>';
    const fallbackSender = 'BADA <onboarding@resend.dev>';
    
    // Try with preferred sender first
    console.log(`Attempting to send email from: ${preferredSender}`);
    let sendResult = await client.emails.send({
      from: preferredSender,
      to: email,
      subject: 'Verify Your Email - BADA Assessment Results Ready',
      html: generateVerificationEmailHtml(verificationLink),
    });
    
    // If domain verification error, retry with fallback
    const isVerificationError = sendResult.error && (
      sendResult.error.name === 'validation_error' ||
      sendResult.error.message?.toLowerCase().includes('not verified') ||
      sendResult.error.message?.toLowerCase().includes('domain')
    );
    
    if (isVerificationError) {
      console.log(`Domain not verified, falling back to: ${fallbackSender}`);
      sendResult = await client.emails.send({
        from: fallbackSender,
        to: email,
        subject: 'Verify Your Email - BADA Assessment Results Ready',
        html: generateVerificationEmailHtml(verificationLink),
      });
    }
    
    const result = sendResult;
    
    console.log('Verification email result:', result);
    
    if (result.error) {
      console.error('Resend API error:', result.error);
      return { success: false, error: result.error.message || 'Email sending failed' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: String(error) };
  }
}

function generateVerificationEmailHtml(verificationLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0F8FF;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="text-align: center; padding-bottom: 30px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #0800FF;">BADA</h1>
                  <p style="margin: 10px 0 0; font-size: 14px; color: #666;">Operating Pattern Assessment</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px;">
                  <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a2e;">Your Results Are Ready!</h2>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 30px;">
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                    Thank you for completing your BADA assessment. Click the button below to verify your email and unlock your personalized Operating Pattern report with Saju insights.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding-bottom: 30px;">
                  <a href="${verificationLink}" 
                     style="display: inline-block; background-color: #0800FF; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 12px rgba(8, 0, 255, 0.3);">
                    View My Results
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0; font-size: 13px; color: #888; line-height: 1.5;">
                    If you didn't request this email, you can safely ignore it.
                    <br><br>
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="${verificationLink}" style="color: #0800FF; word-break: break-all;">${verificationLink}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #888;">
              &copy; ${new Date().getFullYear()} BADA. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
