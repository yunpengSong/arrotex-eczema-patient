import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { emailConfig } from "./email-templates/config";

// Lazy init: avoid throwing at build time when RESEND_API_KEY is missing
let resendClient: Resend | undefined;

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTemplate(templateFileName: string) {
  const templatePath = path.join(__dirname, "email-templates", templateFileName);
  try {
    return fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    console.error(`Failed to load template ${templateFileName}:`, error);
    return null;
  }
}

function interpolateTemplate(
  template: string | null,
  variables: Record<string, string>,
) {
  if (!template) return null;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

interface EmailUser {
  id?: number;
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  deeplink?: string | null;
}

export function getWelcomeEmailTemplate(user: EmailUser) {
  const template = loadTemplate(emailConfig.welcome.templateFile);
  const variables = {
    title: user.title || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    registeredAt: new Date().toLocaleString("en-US"),
  };

  let html = interpolateTemplate(template, variables);

  if (user.deeplink) {
    const deeplinkHtml = `
      <p>Click the button below to log in automatically (valid for 1 hour):</p>
      <p style="text-align: center;">
        <a href="${user.deeplink}" class="btn">Log In Now</a>
      </p>
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        Or copy and paste this link into your browser:<br>
        ${user.deeplink}
      </p>
    `;
    html = html?.replace("<!-- DEEPLINK_PLACEHOLDER -->", deeplinkHtml) ?? null;
  } else {
    html = html?.replace("<!-- DEEPLINK_PLACEHOLDER -->", "") ?? null;
  }

  return {
    subject: emailConfig.welcome.subject,
    html,
  };
}

export function getAdminNotificationTemplate(user: EmailUser) {
  const template = loadTemplate(emailConfig.adminNotification.templateFile);
  const variables = {
    title: user.title || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    userId: user.id?.toString() || "",
    registeredAt: new Date().toLocaleString("en-US"),
  };
  return {
    subject: emailConfig.adminNotification.subject,
    html: interpolateTemplate(template, variables),
  };
}

export async function sendWelcomeEmail(user: EmailUser) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.warn("Resend configuration missing, skipping welcome email");
    return null;
  }

  const template = getWelcomeEmailTemplate(user);
  if (!template.html) {
    console.warn("Failed to load welcome email template");
    return null;
  }

  try {
    const data = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email as string,
      subject: template.subject,
      html: template.html,
    });
    console.log("Welcome email sent:", data);
    return { type: "welcome", to: user.email, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return null;
  }
}

export async function sendAdminNotification(user: EmailUser) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !process.env.ADMIN_EMAIL) {
    console.warn("Resend or admin email configuration missing, skipping admin notification");
    return null;
  }

  const template = getAdminNotificationTemplate(user);
  if (!template.html) {
    console.warn("Failed to load admin notification template");
    return null;
  }

  try {
    const data = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: template.subject,
      html: template.html,
    });
    console.log("Admin notification sent:", data);
    return { type: "adminNotification", to: process.env.ADMIN_EMAIL, data };
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return null;
  }
}

export async function sendRegistrationEmails(user: EmailUser) {
  const results = await Promise.allSettled([sendWelcomeEmail(user), sendAdminNotification(user)]);
  return results;
}
