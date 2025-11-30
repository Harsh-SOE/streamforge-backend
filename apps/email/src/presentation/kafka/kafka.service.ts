import { Inject, Injectable } from '@nestjs/common';

import { CreatedUserMessageDto } from '@app/contracts/email';

import { EMAIL_PORT, EmailPort } from '@email/application/ports';

@Injectable()
export class KafkaService {
  constructor(@Inject(EMAIL_PORT) private email: EmailPort) {}

  async sendEMail(createdUserMessageDto: CreatedUserMessageDto) {
    await this.email.sendEmail({
      to: createdUserMessageDto.email,
      subject: `Welcome to streamforge`,
      content: `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width,initial-scale=1" />
                  <title>Welcome Email</title>
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                      background: #f5f5f5;
                      font-family: Arial, sans-serif;
                    }
                    .container {
                      max-width: 600px;
                      margin: 30px auto;
                      background: #ffffff;
                      border-radius: 8px;
                      padding: 40px;
                      border: 1px solid #e0e0e0;
                    }
                    h1 {
                      margin: 0 0 20px;
                      font-size: 24px;
                      color: #111;
                    }
                    p {
                      color: #333;
                      line-height: 1.6;
                      font-size: 15px;
                    }
                    .btn {
                      display: inline-block;
                      margin-top: 25px;
                      padding: 12px 22px;
                      background: #2563eb;
                      color: #fff;
                      text-decoration: none;
                      font-size: 15px;
                      border-radius: 6px;
                    }
                    .footer {
                      margin-top: 30px;
                      font-size: 13px;
                      color: #777;
                      text-align: center;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Welcome to StreamForge 🎉</h1>
                    <p>
                      We're excited to have you onboard. Your account is ready, and you can now enjoy
                      the full experience of StreamForge — from watching your favorite creators to
                      exploring curated channels and personalized recommendations.
                    </p>

                    <p>
                      If you ever need help, feel free to respond to this email or reach us at
                      support@streamforge.com.
                    </p>

                    <a href="https://streamforge.com" class="btn">Get Started</a>

                    <div class="footer">
                      © StreamForge — All rights reserved.
                    </div>
                  </div>
                </body>
                </html>
                `,
    });
  }
}
