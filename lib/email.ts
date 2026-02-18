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

// Send email with multiple report links (for "find my report" feature)
export async function sendReportLinksEmail(
  email: string,
  reports: Array<{ id: string; name?: string; createdAt: string }>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { client } = await getUncachableResendClient();
    const baseUrl = getBaseUrl();

    const links = reports.map((r) => ({
      url: `${baseUrl}/results/${r.id}`,
      name: r.name,
      date: new Date(r.createdAt).toISOString().slice(0, 10), // yyyy-mm-dd
    }));

    const result = await client.emails.send({
      from: 'BADA <noreply@bada.one>',
      to: email,
      subject: reports.length === 1 ? 'Your BADA Report Link' : `Your ${reports.length} BADA Reports`,
      html: generateMultiReportHtml(links),
    });

    console.log('[Email] Multi-report link email result:', result);

    if (result.error) {
      console.error('[Email] Resend API error:', result.error);
      return { success: false, error: result.error.message || 'Email sending failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('[Email] Failed to send multi-report link email:', error);
    return { success: false, error: String(error) };
  }
}

function generateMultiReportHtml(links: Array<{ url: string; name?: string; date: string }>): string {
  const isMultiple = links.length > 1;
  const heading = isMultiple ? `You have ${links.length} reports.` : 'Save your report.';
  const desc = isMultiple
    ? 'Here are your report links. Bookmark them — they won\'t expire.'
    : 'Peruse your personal report. Hope you enjoy your moment.';

  const reportRows = links.map((link, i) => `
          <tr>
            <td style="padding: ${i > 0 ? '8px' : '0'} 0 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px 16px;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;">
                      ${link.date} &nbsp;|&nbsp; ${link.name || 'Report'}
                    </p>
                    <a href="${link.url}" style="font-size: 13px; color: rgba(255,255,255,0.7); text-decoration: underline; text-underline-offset: 3px; word-break: break-all; font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;">
                      ${link.url}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`).join('');

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

          <tr>
            <td style="padding-bottom: 16px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 500; color: #ffffff;">${heading}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.6);">${desc}</p>
            </td>
          </tr>

          ${reportRows}

        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="text-align: center; padding-top: 32px;">
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
          From BADA, with our best wishes.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

function generateReportLinkHtml(reportLink: string, userName?: string): string {
  const heading = userName ? `${userName}, save your report.` : 'Save your report.';
  const bodyText = 'Peruse your personal report. Hope you enjoy your moment.';

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
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom: 28px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.6);">
                ${bodyText}
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
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
          From BADA, with our best wishes.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}
