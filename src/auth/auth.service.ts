import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private signToken(payload: { sub: string; email: string; role: string }) {
    return this.jwt.sign(payload);
  }

  private getMailTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async signup(dto: SignupDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already exists');

    if (dto.phone) {
      const phoneExists = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });
      if (phoneExists) throw new ConflictException('Phone number already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashed,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async loginWithGoogle(googleUser: {
    email: string;
    firstName?: string;
    lastName?: string;
  }) {
    if (!googleUser.email) {
      throw new UnauthorizedException('Google account email not found');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: `${googleUser.firstName ?? ''} ${googleUser.lastName ?? ''}`.trim(),
          email: googleUser.email,
          password: '',
          role: 'CUSTOMER',
        },
      });
    }

    const token = this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    return { user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.phone) {
      const existing = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Phone number is already in use.');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return { user: updated };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success to avoid email enumeration
    if (!user) {
      return {
        message:
          'If an account exists with this email, a reset link has been sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const baseUrl = user.role === 'ADMIN'
      ? (process.env.ADMIN_URL || 'http://localhost:3002')
      : (process.env.FRONTEND_URL || 'http://localhost:3001');
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const transporter = this.getMailTransporter();
    await transporter.sendMail({
      from: `"Econest Packaging" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Reset your password – Econest Packaging',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;border:1px solid #f0f0f0;">
          <p style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ec4899;margin:0 0 12px;">Econest Packaging</p>
          <h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 12px;">Reset your password</h1>
          <p style="font-size:14px;color:#52525b;line-height:1.6;margin:0 0 24px;">
            Hi ${user.name ?? 'there'},<br/>We received a request to reset the password for your account.
            Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 28px;border-radius:50px;">
            Reset Password
          </a>
          <p style="font-size:12px;color:#a1a1aa;margin:24px 0 0;line-height:1.6;">
            If you didn't request this, you can safely ignore this email. Your password will not change.
            <br/>Or copy this link: <a href="${resetUrl}" style="color:#ec4899;">${resetUrl}</a>
          </p>
        </div>
      `,
    });

    return {
      message:
        'If an account exists with this email, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: dto.token },
    });

    if (!user || !user.resetTokenExpiry) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (user.resetTokenExpiry < new Date()) {
      throw new BadRequestException(
        'Reset token has expired. Please request a new one.',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successfully. You can now log in.' };
  }
}
