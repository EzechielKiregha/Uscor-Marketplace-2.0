/**
 * USCOR Email Templates — orange-branded HTML emails
 */

const USCOR_ORANGE = "#f97316";
const USCOR_DARK = "#1a1a2e";

const baseLayout = (title: string, body: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${USCOR_DARK} 0%,#16213e 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,${USCOR_ORANGE},#ea580c);border-radius:12px;line-height:48px;font-size:24px;font-weight:bold;color:#ffffff;margin-bottom:12px;">U</div>
              <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">USCOR MARKETPLACE</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">This email was sent by USCOR Marketplace.</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">Empowering East African Businesses</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const otpBlock = (otp: string) => `
<div style="text-align:center;margin:24px 0;">
  <div style="display:inline-block;background-color:#fff7ed;border:2px solid ${USCOR_ORANGE};border-radius:12px;padding:16px 32px;">
    <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:${USCOR_ORANGE};">${otp}</span>
  </div>
</div>
<p style="text-align:center;font-size:13px;color:#9ca3af;margin:8px 0 0;">This code expires in <strong>10 minutes</strong></p>
`;

export function otpEmailTemplate(
	otp: string,
	purpose: string,
): { subject: string; html: string } {
	const purposeMap: Record<string, { subject: string; heading: string; message: string }> = {
		EMAIL_VERIFICATION: {
			subject: "Verify Your Email — USCOR",
			heading: "Verify Your Email",
			message: "Please use the code below to verify your email address and activate your USCOR account.",
		},
		PASSWORD_RESET: {
			subject: "Reset Your Password — USCOR",
			heading: "Reset Your Password",
			message: "We received a request to reset your password. Use the code below to proceed.",
		},
		LOGIN_VERIFICATION: {
			subject: "Login Verification — USCOR",
			heading: "Login Verification",
			message: "A login attempt was made on your account. Use this code to verify it's you.",
		},
	};

	const config = purposeMap[purpose] || purposeMap.EMAIL_VERIFICATION;

	const body = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1f2937;">${config.heading}</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">${config.message}</p>
    ${otpBlock(otp)}
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">If you didn't request this, please ignore this email or contact support if you're concerned about your account security.</p>
  `;

	return { subject: config.subject, html: baseLayout(config.subject, body) };
}

export function welcomeEmailTemplate(name: string): { subject: string; html: string } {
	const subject = "Welcome to USCOR Marketplace!";
	const body = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1f2937;">Welcome, ${name}!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">Your USCOR account has been created successfully. You're now part of East Africa's growing business community.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="#" style="display:inline-block;background:linear-gradient(135deg,${USCOR_ORANGE},#ea580c);color:#ffffff;font-weight:600;font-size:15px;padding:12px 32px;border-radius:10px;text-decoration:none;">Get Started</a>
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">Need help? Contact our support team anytime.</p>
  `;
	return { subject, html: baseLayout(subject, body) };
}

export function passwordChangedEmailTemplate(name: string): { subject: string; html: string } {
	const subject = "Password Changed — USCOR";
	const body = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1f2937;">Password Changed</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">Hi ${name}, your password was successfully changed. If you didn't make this change, please reset your password immediately or contact support.</p>
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">This is an automated security notification from USCOR.</p>
  `;
	return { subject, html: baseLayout(subject, body) };
}
