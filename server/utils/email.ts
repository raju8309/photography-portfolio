import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

// Only try to set up email if credentials are provided
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
    transporter = null;
  }
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  if (!transporter) {
    console.log('Email service not configured, skipping email send');
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission - Photography Portfolio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>

          <div style="margin: 20px 0;">
            <h3 style="color: #666;">Contact Details:</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #666;">Message:</h3>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${data.message}</p>
          </div>

          <p style="color: #888; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            This message was sent from your photography portfolio website contact form.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}