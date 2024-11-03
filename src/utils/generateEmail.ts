export const generatePasswordResetEmailHTML = ({
  name,
  code,
  link,
}: any) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: black;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        line-height: 1.6;
      }
      .content h2 {
        color: black;
        font-size: 22px;
        margin-top: 0;
      }
      .content p {
        margin: 10px 0;
      }
      .code-box {
        background-color: #f0f4ff;
        color: black;
        font-size: 28px;
        font-weight: bold;
        text-align: center;
        padding: 15px;
        margin: 20px 0;
        border-radius: 8px;
      }
      .btn {
        display: inline-block;
        background-color: black;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 16px;
        margin-top: 20px;
        text-align: center;
      }
      .footer {
        text-align: center;
        color: #aaa;
        font-size: 12px;
        padding: 20px;
        border-top: 1px solid #eaeaea;
      }
      a{
        color: white;
      }
      @media (max-width: 600px) {
        .content,
        .header,
        .footer {
          padding: 10px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">Password Reset Request</div>
      <div class="content">
        <h2>Hello ${name},</h2>
        <p>
          You requested to reset your password. Use the verification code below
          to complete the process:
        </p>
        <div class="code-box">${code}</div>
        <p>
          If you didn't request a password reset, please ignore this email or
          contact support if you have concerns.
        </p>
        <a href="${link}" class="btn">Reset Password</a>
      </div>
      <div class="footer">&copy; 2024 Unilink. All rights reserved.</div>
    </div>
  </body>
</html>
`;
export const generateVerificationEmailHTML = ({
  name,
  code,
  link,
}: any) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: black;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        line-height: 1.6;
      }
      .content h2 {
        color: black;
        font-size: 22px;
        margin-top: 0;
      }
      .content p {
        margin: 10px 0;
      }
      .code-box {
        background-color: #f0f4ff;
        color: black;
        font-size: 28px;
        font-weight: bold;
        text-align: center;
        padding: 15px;
        margin: 20px 0;
        border-radius: 8px;
      }
      .btn {
        display: inline-block;
        background-color: black;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 16px;
        margin-top: 20px;
        text-align: center;
      }
      .footer {
        text-align: center;
        color: #aaa;
        font-size: 12px;
        padding: 20px;
        border-top: 1px solid #eaeaea;
      }
      a{
        color: white;
      }
      @media (max-width: 600px) {
        .content,
        .header,
        .footer {
          padding: 10px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">Email Verification</div>
      <div class="content">
        <h2>Hello ${name},</h2>
        <p>
          Welcome to Unilink! Use the verification code below to complete your
          registration:
        </p>
        <div class="code-box">${code}</div>
        <p>
          If you didn't create an account, please ignore this email or contact
          support if you have concerns.
        </p>
        <a href="${link}" class="btn">Verify Email</a>
      </div>
      <div class="footer">&copy; 2024 Unilink. All rights reserved.</div>
    </div>
  </body>
</html>
`;
