// src/utils/email.service.ts
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendAuthEmail = async (email: string, teamName: string) => {
  // 간단한 인증 토큰 생성
  const token = jwt.sign(
    { email, teamName },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  const authLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '채팅 서비스 인증 링크',
    html: `
      <h2>환영합니다!</h2>
      <p>아래 링크를 클릭하시면 바로 서비스를 이용하실 수 있습니다:</p>
      <a href="${authLink}">시작하기</a>
    `
  };

  await transporter.sendMail(mailOptions);
  return token;
};
