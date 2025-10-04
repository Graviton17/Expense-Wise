import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Mail.Attachment[];
}

// Email configuration
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("Email configuration verified successfully");
    return true;
  } catch (error) {
    console.error("Email configuration verification failed:", error);
    return false;
  }
}

// Send email
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    const mailOptions: Mail.Options = {
      from: `"Expense-Wise" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

// Email templates
export const EmailTemplates = {
  // Welcome email for new users
  welcome: (firstName: string, companyName: string): EmailTemplate => ({
    subject: `Welcome to Expense-Wise, ${firstName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Expense-Wise!</h1>
        <p>Hi ${firstName},</p>
        <p>Welcome to <strong>${companyName}</strong>'s expense management system. You can now:</p>
        <ul>
          <li>Submit expense reports with receipt uploads</li>
          <li>Track approval status in real-time</li>
          <li>Generate detailed expense reports</li>
          <li>Manage your expense categories</li>
        </ul>
        <p>Get started by logging into your account and submitting your first expense.</p>
        <p>Best regards,<br>The Expense-Wise Team</p>
      </div>
    `,
    text: `Welcome to Expense-Wise, ${firstName}! You can now manage your expenses for ${companyName}. Log in to get started.`,
  }),

  // Password reset email
  passwordReset: (firstName: string, resetLink: string): EmailTemplate => ({
    subject: "Reset Your Expense-Wise Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${firstName},</p>
        <p>You requested a password reset for your Expense-Wise account. Click the link below to create a new password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 15 minutes. If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>The Expense-Wise Team</p>
      </div>
    `,
    text: `Password reset requested. Click this link to reset: ${resetLink}`,
  }),

  // Expense submission notification
  expenseSubmitted: (
    approverName: string,
    employeeName: string,
    amount: string,
    description: string
  ): EmailTemplate => ({
    subject: `New Expense Approval Required - ${employeeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Expense Approval Required</h1>
        <p>Hi ${approverName},</p>
        <p><strong>${employeeName}</strong> has submitted an expense that requires your approval:</p>
        <div style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p><strong>Amount:</strong> ${amount}</p>
          <p><strong>Description:</strong> ${description}</p>
        </div>
        <p>Please review and approve/reject this expense in the Expense-Wise dashboard.</p>
        <p>Best regards,<br>The Expense-Wise Team</p>
      </div>
    `,
    text: `${employeeName} submitted an expense (${amount}) requiring your approval: ${description}`,
  }),

  // Expense approved notification
  expenseApproved: (
    employeeName: string,
    amount: string,
    description: string,
    approverName: string
  ): EmailTemplate => ({
    subject: `Expense Approved - ${amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">Expense Approved</h1>
        <p>Hi ${employeeName},</p>
        <p>Great news! Your expense has been approved by ${approverName}:</p>
        <div style="background-color: #d4edda; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p><strong>Amount:</strong> ${amount}</p>
          <p><strong>Description:</strong> ${description}</p>
        </div>
        <p>Your expense is now processed and will be included in the next reimbursement cycle.</p>
        <p>Best regards,<br>The Expense-Wise Team</p>
      </div>
    `,
    text: `Your expense (${amount}) has been approved by ${approverName}: ${description}`,
  }),

  // Expense rejected notification
  expenseRejected: (
    employeeName: string,
    amount: string,
    description: string,
    reason: string,
    approverName: string
  ): EmailTemplate => ({
    subject: `Expense Rejected - ${amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc3545;">Expense Rejected</h1>
        <p>Hi ${employeeName},</p>
        <p>Your expense has been rejected by ${approverName}:</p>
        <div style="background-color: #f8d7da; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p><strong>Amount:</strong> ${amount}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Rejection Reason:</strong> ${reason}</p>
        </div>
        <p>You can edit and resubmit this expense after addressing the feedback.</p>
        <p>Best regards,<br>The Expense-Wise Team</p>
      </div>
    `,
    text: `Your expense (${amount}) was rejected by ${approverName}. Reason: ${reason}`,
  }),

  // Monthly expense report
  monthlyReport: (
    recipientName: string,
    month: string,
    totalExpenses: string,
    reportUrl: string
  ): EmailTemplate => ({
    subject: `Monthly Expense Report - ${month}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Monthly Expense Report</h1>
        <p>Hi ${recipientName},</p>
        <p>Your monthly expense report for <strong>${month}</strong> is ready:</p>
        <div style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p><strong>Total Expenses:</strong> ${totalExpenses}</p>
        </div>
        <p style="margin: 20px 0;">
          <a href="${reportUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Download Report
          </a>
        </p>
        <p>Best regards,<br>The Expense-Wise Team</p>
      </div>
    `,
    text: `Monthly expense report for ${month} is ready. Total: ${totalExpenses}. Download: ${reportUrl}`,
  }),
};

// Email sending functions with templates
export async function sendWelcomeEmail(
  to: string,
  firstName: string,
  companyName: string
): Promise<void> {
  const template = EmailTemplates.welcome(firstName, companyName);
  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  resetLink: string
): Promise<void> {
  const template = EmailTemplates.passwordReset(firstName, resetLink);
  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendExpenseSubmittedEmail(
  to: string,
  approverName: string,
  employeeName: string,
  amount: string,
  description: string
): Promise<void> {
  const template = EmailTemplates.expenseSubmitted(
    approverName,
    employeeName,
    amount,
    description
  );
  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendExpenseApprovedEmail(
  to: string,
  employeeName: string,
  amount: string,
  description: string,
  approverName: string
): Promise<void> {
  const template = EmailTemplates.expenseApproved(
    employeeName,
    amount,
    description,
    approverName
  );
  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendExpenseRejectedEmail(
  to: string,
  employeeName: string,
  amount: string,
  description: string,
  reason: string,
  approverName: string
): Promise<void> {
  const template = EmailTemplates.expenseRejected(
    employeeName,
    amount,
    description,
    reason,
    approverName
  );
  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendMonthlyReportEmail(
  to: string,
  recipientName: string,
  month: string,
  totalExpenses: string,
  reportUrl: string
): Promise<void> {
  const template = EmailTemplates.monthlyReport(
    recipientName,
    month,
    totalExpenses,
    reportUrl
  );
  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export { transporter };
