import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = 'admin@jpcolins.com';
const FROM_EMAIL = 'JPCollins <noreply@jpcolins.com>';

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, phone, interest, message } = req.body || {};

    // Basic validation
    if (!firstName || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const submissionId = `JPC-${Date.now().toString(36).toUpperCase()}`;

    // 1. Email to admin@jpcolins.com
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `New Contact Form Submission — ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf7f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0a2d4d; padding: 24px 32px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
            <p style="color: #8fd4fa; margin: 4px 0 0; font-size: 13px;">JPCollins Website · ${submissionId}</p>
          </div>
          <div style="padding: 28px 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #475569; font-weight: bold; width: 120px; vertical-align: top;">Name:</td><td style="padding: 8px 0; color: #0a1929;">${fullName}</td></tr>
              <tr><td style="padding: 8px 0; color: #475569; font-weight: bold; vertical-align: top;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0478bd;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #475569; font-weight: bold; vertical-align: top;">Phone:</td><td style="padding: 8px 0; color: #0a1929;">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px 0; color: #475569; font-weight: bold; vertical-align: top;">Interested in:</td><td style="padding: 8px 0; color: #0a1929;">${interest || 'Not specified'}</td></tr>
            </table>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <p style="color: #475569; font-weight: bold; margin: 0 0 8px; font-size: 14px;">Message:</p>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #0a1929; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </div>
          </div>
          <div style="background: #f4efe3; padding: 16px 32px; text-align: center;">
            <p style="color: #475569; font-size: 12px; margin: 0;">This email was sent from the JPCollins website contact form.</p>
          </div>
        </div>
      `,
    });

    // 2. Confirmation email to the person who filled the form
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'We received your message — JPCollins',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf7f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0a2d4d; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Thank you, ${firstName}!</h1>
            <p style="color: #6fcf5a; margin: 8px 0 0; font-size: 14px; font-style: italic;">Building a Financially Literate Generation.</p>
          </div>
          <div style="padding: 32px;">
            <p style="color: #0a1929; font-size: 16px; line-height: 1.6;">We've received your message and appreciate you reaching out to JPCollins. Our team will get back to you within 48 hours.</p>
            <div style="background: #ffffff; border-left: 4px solid #0478bd; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
              <p style="color: #475569; margin: 0 0 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Your submission</p>
              <p style="color: #0a1929; margin: 4px 0; font-size: 14px;"><strong>Ref:</strong> ${submissionId}</p>
              <p style="color: #0a1929; margin: 4px 0; font-size: 14px;"><strong>Subject:</strong> ${interest || 'General enquiry'}</p>
            </div>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">In the meantime, feel free to explore our programmes, learn more about our financial literacy mission, or connect with us on social media.</p>
            <div style="text-align: center; margin-top: 28px;">
              <a href="https://www.jpcolins.com" style="display: inline-block; background: #0478bd; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 999px; font-weight: bold; font-size: 14px;">Visit Our Website</a>
            </div>
          </div>
          <div style="background: #f4efe3; padding: 20px 32px; text-align: center;">
            <p style="color: #475569; font-size: 12px; margin: 0;">JPCollins Financial Literacy Organisation</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0;">No 11 Onile Aro Street, Ojoo, Ibadan, Oyo State, Nigeria</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
}
