import * as net from 'net';
import * as tls from 'tls';
import * as crypto from 'crypto';
import { UnrecoverableError } from 'bullmq';
import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  from?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
}

export class EmailHandler implements NodeHandler {
  category = 'ACTION_EMAIL';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.to || typeof config.to !== 'string') {
      errors.push('to is required and must be a string');
    }

    if (!config.subject || typeof config.subject !== 'string') {
      errors.push('subject is required and must be a string');
    }

    if (!config.body || typeof config.body !== 'string') {
      errors.push('body is required and must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as EmailConfig;

    const smtpHost = cfg.smtpHost || process.env.SMTP_HOST;
    const smtpPort = cfg.smtpPort || Number(process.env.SMTP_PORT) || 587;
    const smtpUser = cfg.smtpUser || process.env.SMTP_USER;
    const smtpPass = cfg.smtpPass || process.env.SMTP_PASS;
    const smtpSecure = cfg.smtpSecure ?? process.env.SMTP_SECURE === 'true';

    if (!smtpHost) {
      throw new UnrecoverableError(
        'SMTP host not configured. Set SMTP_HOST environment variable or provide smtpHost in config.',
      );
    }

    const from = cfg.from || process.env.SMTP_FROM || smtpUser || 'noreply@example.com';

    const previousData = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};
    const triggerData = input.triggerData || {};
    const templateData = { ...triggerData, ...previousData };

    const to = interpolateString(cfg.to, templateData);
    const subject = interpolateString(cfg.subject, templateData);
    const body = interpolateString(cfg.body, templateData);
    const cc = cfg.cc ? interpolateString(cfg.cc, templateData) : undefined;
    const bcc = cfg.bcc ? interpolateString(cfg.bcc, templateData) : undefined;
    const replyTo = cfg.replyTo ? interpolateString(cfg.replyTo, templateData) : undefined;

    const contentType = cfg.isHtml ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
    const messageId = `<${crypto.randomUUID()}@workflow-engine>`;

    const boundary = `----=_Part_${crypto.randomBytes(16).toString('hex')}`;

    const lines: string[] = [];
    lines.push(`From: ${from}`);
    lines.push(`To: ${to}`);
    if (cc) lines.push(`Cc: ${cc}`);
    if (bcc) lines.push(`Bcc: ${bcc}`);
    if (replyTo) lines.push(`Reply-To: ${replyTo}`);
    lines.push(`Subject: ${subject}`);
    lines.push(`Message-ID: ${messageId}`);
    lines.push(`Date: ${new Date().toUTCString()}`);
    lines.push(`MIME-Version: 1.0`);

    if (cc || bcc) {
      lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      lines.push('');
      lines.push(`--${boundary}`);
    }

    lines.push(`Content-Type: ${contentType}`);
    lines.push(`Content-Transfer-Encoding: quoted-printable`);
    lines.push('');
    lines.push(body);

    if (cc || bcc) {
      lines.push('');
      lines.push(`--${boundary}--`);
    }

    const rawEmail = lines.join('\r\n');

    const socket = await connectSmtp(smtpHost, smtpPort, smtpSecure);

    try {
      await smtpCommand(socket, '');
      await smtpCommand(socket, `EHLO ${getHostname()}`);

      if (smtpSecure && smtpPort === 465) {
        // Already TLS from connect
      } else if (smtpPort === 587) {
        await smtpCommand(socket, 'STARTTLS');
        await upgradeToTls(socket, smtpHost);
        await smtpCommand(socket, `EHLO ${getHostname()}`);
      }

      if (smtpUser && smtpPass) {
        const authResult = await smtpCommand(socket, 'AUTH LOGIN');
        if (authResult.startsWith('334')) {
          await smtpCommand(socket, Buffer.from(smtpUser).toString('base64'));
          await smtpCommand(socket, Buffer.from(smtpPass).toString('base64'));
        }
      }

      await smtpCommand(socket, `MAIL FROM:<${from}>`);
      await smtpCommand(socket, `RCPT TO:<${to}>`);
      if (cc) await smtpCommand(socket, `RCPT TO:<${cc}>`);
      if (bcc) await smtpCommand(socket, `RCPT TO:<${bcc}>`);
      await smtpCommand(socket, 'DATA');
      await smtpCommand(socket, rawEmail + '\r\n.');
      await smtpCommand(socket, 'QUIT');
    } finally {
      socket.destroy();
    }

    return {
      data: {
        sent: true,
        to,
        from,
        subject,
        messageId,
        cc: cc || null,
        bcc: bcc || null,
      },
      metadata: {
        smtpHost,
        smtpPort,
        messageId,
      },
    };
  }
}

function connectSmtp(host: string, port: number, secure: boolean): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    if (secure && port === 465) {
      const socket = tls.connect({ host, port, rejectUnauthorized: true }, () => {
        resolve(socket);
      });
      socket.on('error', reject);
    } else {
      const socket = net.connect({ host, port }, () => {
        resolve(socket);
      });
      socket.on('error', reject);
    }
  });
}

function upgradeToTls(socket: net.Socket, host: string): Promise<tls.TLSSocket> {
  return new Promise((resolve, reject) => {
    const tlsSocket = tls.connect({ socket, servername: host, rejectUnauthorized: true }, () => {
      resolve(tlsSocket);
    });
    tlsSocket.on('error', reject);
  });
}

function smtpCommand(
  socket: net.Socket | tls.TLSSocket,
  command: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.removeAllListeners('data');
      reject(new UnrecoverableError(`SMTP command timeout: ${command}`));
    }, 30000);

    let responseData = '';

    const onData = (chunk: Buffer) => {
      responseData += chunk.toString();
      const lines = responseData.split('\r\n');
      const lastLine = lines[lines.length - 2] || lines[lines.length - 1];

      if (lastLine && /^[23]\d\d\s/.test(lastLine)) {
        clearTimeout(timeout);
        socket.removeListener('data', onData);
        resolve(lastLine);
      } else if (lastLine && /^[45]\d\d\s/.test(lastLine)) {
        clearTimeout(timeout);
        socket.removeListener('data', onData);
        reject(new UnrecoverableError(`SMTP error: ${lastLine}`));
      }
    };

    socket.on('data', onData);

    if (command) {
      socket.write(command + '\r\n');
    }
  });
}

function getHostname(): string {
  try {
    return require('os').hostname();
  } catch {
    return 'localhost';
  }
}

function interpolateString(
  template: string,
  data: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path: string) => {
    const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
    return value !== undefined && value !== null ? String(value) : `{{${path}}}`;
  });
}
