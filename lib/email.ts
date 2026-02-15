// Email service using Resend integration
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  // First, check for direct RESEND_API_KEY (local development / production)
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    };
  }

  // Fallback to Replit connector system
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('RESEND_API_KEY not set. Please set RESEND_API_KEY in your environment variables.');
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
    fromEmail: credentials.fromEmail
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
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001';
  }
  return 'http://localhost:5001';
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

export function generateVerificationEmailHtml(verificationLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FAFAFA;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="background-color: #ffffff; border-radius: 1px; padding: 40px; border: 1px solid #e5e7eb;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="text-align: center; padding-bottom: 30px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #182339; letter-spacing: -0.5px;">BADA</h1>
                  <p style="margin: 8px 0 0; font-size: 13px; color: #879DC6; font-family: monospace; letter-spacing: 0.05em;">CLARITY IS THE NEW HIGH</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 24px;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #182339;">Your Results Are Ready</h2>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 32px;">
                  <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #2F3034;">
                    Thank you for completing your BADA assessment. Click the button below to verify your email and unlock your personalized report.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding-bottom: 32px;">
                  <a href="${verificationLink}"
                     style="display: inline-block; background-color: #182339; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; padding: 14px 32px; border-radius: 4px;">
                    View My Results
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 24px; border-top: 1px solid #f3f4f6;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                    If you didn't request this email, you can safely ignore it.
                    <br><br>
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="${verificationLink}" style="color: #879DC6; text-decoration: underline; word-break: break-all;">${verificationLink}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding-top: 24px;">
            <p style="margin: 0; font-size: 11px; color: #9ca3af; font-family: monospace;">
              &copy; ${new Date().getFullYear()} BADA. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
