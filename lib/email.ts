// Email service using Resend
import { Resend } from 'resend';

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    };
  }
  throw new Error('RESEND_API_KEY not set.');
}

export async function getUncachableResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail
  };
}

function getBaseUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  return 'http://localhost:5001';
}

// Send report link email (no verification required)
export async function sendReportLinkEmail(
  email: string,
  reportId: string,
  userName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { client } = await getUncachableResendClient();
    const baseUrl = getBaseUrl();
    const reportLink = `${baseUrl}/results/${reportId}`;

    const result = await client.emails.send({
      from: 'BADA <noreply@bada.one>',
      to: email,
      subject: 'Your BADA Report is Ready',
      html: generateReportLinkHtml(reportLink, userName),
    });

    console.log('[Email] Report link email result:', result);

    if (result.error) {
      console.error('[Email] Resend API error:', result.error);
      return { success: false, error: result.error.message || 'Email sending failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('[Email] Failed to send report link email:', error);
    return { success: false, error: String(error) };
  }
}

function generateReportLinkHtml(reportLink: string, userName?: string): string {
  const greeting = userName ? `${userName}, your` : 'Your';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #182339;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; margin: 0 auto; padding: 40px 16px;">

    <!-- Logo -->
    <tr>
      <td style="text-align: center; padding-bottom: 40px;">
        <span style="font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">BADA</span>
      </td>
    </tr>

    <!-- Main Card -->
    <tr>
      <td style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">

          <!-- Heading -->
          <tr>
            <td style="padding-bottom: 16px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 500; color: #ffffff;">
                ${greeting} report is ready.
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom: 28px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.6);">
                Bookmark this link. It's your personal report and won't change.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="text-align: center; padding-bottom: 28px;">
              <a href="${reportLink}"
                 style="display: inline-block; background-color: #ffffff; color: #182339; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 100px;">
                View My Report
              </a>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.6; word-break: break-all; font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;">
                ${reportLink}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="text-align: center; padding-top: 32px;">
        <p style="margin: 0; font-size: 10px; color: rgba(255,255,255,0.2); font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace; letter-spacing: 0.1em; text-transform: uppercase;">
          CLARITY IS THE NEW HIGH
        </p>
        <p style="margin: 8px 0 0; font-size: 10px; color: rgba(255,255,255,0.15); font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;">
          &copy; ${new Date().getFullYear()} BADA
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}
