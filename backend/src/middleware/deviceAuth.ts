import { Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Device-based Authentication Middleware
 * แต่ละเครื่อง/browser จะมี Device ID เฉพาะตัว เก็บใน localStorage
 * Backend จะสร้าง User อัตโนมัติตาม Device ID ที่ส่งมาใน Header
 */
export const deviceAuth = async (req: any, res: Response, next: any) => {
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    return res.status(401).json({ error: 'Missing X-Device-ID header' });
  }

  try {
    // ค้นหา user ด้วย device ID หรือสร้างใหม่อัตโนมัติ
    let user = await prisma.user.findUnique({ where: { id: deviceId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: deviceId,
          email: `device-${deviceId.substring(0, 8)}@local`,
          name: `Device User`,
        }
      });
      console.log(`[Auth] New device registered: ${deviceId.substring(0, 8)}...`);
    }

    req.user = { id: user.id, name: user.name };
    next();
  } catch (error: any) {
    console.error("Auth Error:", error.message || error);
    res.status(500).json({ error: 'Auth failed', detail: error.message });
  }
};
