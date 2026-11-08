import { PrismaClient, Role, FieldType, FieldStatus, DayType } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding database...");

  // 1. Seed Users (ADMIN, STAFF, CUSTOMER)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, role: Role.ADMIN },
    create: {
      fullName: "Quản trị viên hệ thống",
      phone: "0999999999",
      email: adminEmail,
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const staffHash = await bcrypt.hash("Staff@123456", 12);
  await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: { passwordHash: staffHash, role: Role.STAFF },
    create: {
      fullName: "Nhân viên trực sân",
      phone: "0988888888",
      email: "staff@example.com",
      passwordHash: staffHash,
      role: Role.STAFF,
    },
  });

  const customerHash = await bcrypt.hash("Customer@123456", 12);
  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { passwordHash: customerHash, role: Role.CUSTOMER },
    create: {
      fullName: "Nguyễn Văn Khách",
      phone: "0901234567",
      email: "customer@example.com",
      passwordHash: customerHash,
      role: Role.CUSTOMER,
    },
  });

  // 2. Seed Fields
  if ((await prisma.field.count()) === 0) {
    await prisma.field.createMany({
      data: [
        {
          name: "Sân 5A",
          fieldType: FieldType.SAN_5,
          status: FieldStatus.ACTIVE,
          description: "Sân 5 người, cỏ nhân tạo chuẩn FIFA, hệ thống đèn LED ban đêm hiện đại.",
          imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Sân 5B",
          fieldType: FieldType.SAN_5,
          status: FieldStatus.ACTIVE,
          description: "Sân 5 người, có mái che thoát nước tốt, phù hợp mọi điều kiện thời tiết.",
          imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Sân 7A",
          fieldType: FieldType.SAN_7,
          status: FieldStatus.ACTIVE,
          description: "Sân 7 người kích thước chuẩn thi đấu giải phong trào, mặt cỏ cao cấp.",
          imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Sân 5C (Bảo trì)",
          fieldType: FieldType.SAN_5,
          status: FieldStatus.MAINTENANCE,
          description: "Sân 5 người đang tiến hành bảo dưỡng và thay mới mặt cỏ nhân tạo.",
          imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
        },
      ],
    });
    console.log("Seeded fields.");
  }

  // 3. Seed Time Slots
  if ((await prisma.timeSlot.count()) === 0) {
    const slots = [
      ["06:00", "07:30"],
      ["07:30", "09:00"],
      ["09:00", "10:30"],
      ["10:30", "12:00"],
      ["12:00", "13:30"],
      ["13:30", "15:00"],
      ["15:00", "16:30"],
      ["16:30", "18:00"],
      ["18:00", "19:30"],
      ["19:30", "21:00"],
      ["21:00", "22:30"],
    ];

    await prisma.timeSlot.createMany({
      data: slots.map(([startTime, endTime]) => ({
        label: `${startTime} - ${endTime}`,
        startTime,
        endTime,
        isPeakHour: startTime >= "17:00" && startTime < "21:00",
      })),
    });
    console.log("Seeded time slots.");
  }

  // 4. Seed Price Rules
  if ((await prisma.priceRule.count()) === 0) {
    const [fields, slots] = await Promise.all([
      prisma.field.findMany(),
      prisma.timeSlot.findMany({ orderBy: { startTime: "asc" } }),
    ]);

    await prisma.priceRule.createMany({
      data: fields.flatMap((field) =>
        slots.flatMap((slot) => {
          const isPeak = slot.isPeakHour;
          const peakMultiplier = isPeak ? 1.25 : 1.0;
          const base = field.fieldType === FieldType.SAN_7 ? 500000 : 300000;
          const weekdayPrice = Math.round(base * peakMultiplier);
          const weekendPrice = Math.round(base * peakMultiplier * 1.15);

          return [
            {
              fieldId: field.id,
              timeSlotId: slot.id,
              dayType: DayType.WEEKDAY,
              price: weekdayPrice,
            },
            {
              fieldId: field.id,
              timeSlotId: slot.id,
              dayType: DayType.WEEKEND,
              price: weekendPrice,
            },
          ];
        }),
      ),
    });
    console.log("Seeded price rules.");
  }

  console.log("Database seed completed successfully!");
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
