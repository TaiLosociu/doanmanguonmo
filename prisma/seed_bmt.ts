import { PrismaClient, FieldType, FieldStatus, DayType } from "@prisma/client";

const prisma = new PrismaClient();

interface BmtFieldData {
  name: string;
  ward: string;
  address: string;
  phone: string;
  fieldType: FieldType;
  description: string;
  imageUrl: string;
}

const bmtFields: BmtFieldData[] = [
  // 1. Phường Tân Tiến
  {
    name: "SVĐ Buôn Ma Thuột",
    ward: "Phường Tân Tiến",
    address: "2 Nguyễn Công Trứ, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0262 3857 805",
    fieldType: FieldType.SAN_7,
    description: "Sân vận động trung tâm Buôn Ma Thuột, mặt sân chất lượng cao, dàn đèn chuẩn thi đấu giải.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân bóng C1",
    ward: "Phường Tân Tiến",
    address: "1B Y Ngông, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "098 383 0955",
    fieldType: FieldType.SAN_5,
    description: "Sân cỏ nhân tạo 5 người, không gian thoáng đãng, phục vụ nước uống và trang phục.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân Manchester",
    ward: "Phường Tân Tiến",
    address: "130 Y Ngông, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0914 123 456",
    fieldType: FieldType.SAN_5,
    description: "Sân bóng mini phong cách hiện đại, dàn đèn chiếu sáng tốt, khu để xe rộng rãi.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân T&H",
    ward: "Phường Tân Tiến",
    address: "110/10 Hoàng Hoa Thám, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0906 448 004",
    fieldType: FieldType.SAN_5,
    description: "Cụm sân cỏ mini chất lượng cao, mặt cỏ êm, tổ chức giải đấu phong trào thường xuyên.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
  },

  // 2. Phường Tân Lập
  {
    name: "Sân mini Hoài Ân",
    ward: "Phường Tân Lập",
    address: "Hẻm 119 Nguyễn Văn Cừ, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0963 747 477",
    fieldType: FieldType.SAN_5,
    description: "Sân mini thoáng mát, nằm ngay trung tâm Tân Lập, có căn tin phục vụ giải khát.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân Ngọc Anh",
    ward: "Phường Tân Lập",
    address: "Hẻm 44 Đinh Núp, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0782 559 909",
    fieldType: FieldType.SAN_5,
    description: "Sân bóng nhân tạo chất lượng tốt, giá cả học sinh - sinh viên, đặt sân dễ dàng.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân Công Thành",
    ward: "Phường Tân Lập",
    address: "Hẻm 44/11 Đinh Núp, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0935 221 889",
    fieldType: FieldType.SAN_5,
    description: "Mặt cỏ mới bảo dưỡng, hệ thống lưới chắn an toàn, bãi giữ xe máy và ô tô tiện lợi.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
  },

  // 3. Phường Tân Lợi
  {
    name: "Sân Tân Thái Long",
    ward: "Phường Tân Lợi",
    address: "56 Y Moan Ênuôl, Phường Tân Lợi, Buôn Ma Thuột",
    phone: "0262 3601 888",
    fieldType: FieldType.SAN_7,
    description: "Tổ hợp sân 7 và sân 5 hiện đại hàng đầu khu Y Moan, có khán đài mini cổ vũ.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân Lập Nguyễn",
    ward: "Phường Tân Lợi",
    address: "128/7 Giải Phóng, Phường Tân Lợi, Buôn Ma Thuột",
    phone: "0905 889 123",
    fieldType: FieldType.SAN_5,
    description: "Sân bóng mini cỏ nhân tạo chất lượng cao, thoát nước tốt, hoạt động từ 6h đến 22h.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
  },

  // 4. Phường Ea Tam
  {
    name: "Sân KenVin",
    ward: "Phường Ea Tam",
    address: "Hẻm 4 Nguyễn Trường Tộ, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0918 776 543",
    fieldType: FieldType.SAN_5,
    description: "Sân mini sinh viên Ea Tam, không khí thể thao sôi động, giá ưu đãi cho học sinh sinh viên.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân Đại Thành",
    ward: "Phường Ea Tam",
    address: "Đường Phùng Hưng, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0944 556 778",
    fieldType: FieldType.SAN_7,
    description: "Sân 7 người rộng rãi, tổ chức các giải đấu cơ quan và giao lưu câu lạc bộ tại Buôn Ma Thuột.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân Hoàng Gia",
    ward: "Phường Ea Tam",
    address: "22 Mai Thị Lựu, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0977 443 219",
    fieldType: FieldType.SAN_5,
    description: "Mặt cỏ cao cấp, đèn led sáng rõ, phục vụ nước ngọt đá lạnh miễn phí cho đội đặt sân.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân ĐH Tây Nguyên",
    ward: "Phường Ea Tam",
    address: "567 Lê Duẩn, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0262 3825 555",
    fieldType: FieldType.SAN_7,
    description: "Sân bóng đá trong khuôn viên trường ĐH Tây Nguyên, kích thước chuẩn, không gian rợp bóng mát.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân CĐ Sư Phạm",
    ward: "Phường Ea Tam",
    address: "Hẻm 33 Lê Thị Riêng, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0932 110 889",
    fieldType: FieldType.SAN_5,
    description: "Sân mini khu vực CĐ Sư Phạm Đắk Lắk, môi trường thể thao thân thiện, tiện ích đầy đủ.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },

  // 5. Phường Tự An
  {
    name: "Sân Ban Mê Sport",
    ward: "Phường Tự An",
    address: "121 Hùng Vương, Phường Tự An, Buôn Ma Thuột",
    phone: "0947 959 578",
    fieldType: FieldType.SAN_7,
    description: "Trung tâm thể thao Ban Mê Sport hiện đại bậc nhất phố núi, cỏ nhân tạo cao cấp, phòng thay đồ VIP.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
  },

  // 6. Phường Tân Thành
  {
    name: "Sân mini Hiệp Long",
    ward: "Phường Tân Thành",
    address: "87 Giải Phóng, Phường Tân Thành, Buôn Ma Thuột",
    phone: "0908 667 334",
    fieldType: FieldType.SAN_5,
    description: "Sân bóng mini 5 người mặt cỏ êm, dàn đèn hiện đại, phục vụ đồ uống giải khát.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
  },

  // 7. Phường Thành Nhất
  {
    name: "Sân Thành Nhất",
    ward: "Phường Thành Nhất",
    address: "113/44/17 Nguyễn Cơ Thạch, Phường Thành Nhất, Buôn Ma Thuột",
    phone: "0982 456 781",
    fieldType: FieldType.SAN_5,
    description: "Sân bóng cỏ nhân tạo chất lượng tốt, giá thành hợp lý, phong trào bóng đá sôi nổi.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân An Dương Vương",
    ward: "Phường Thành Nhất",
    address: "68 An Dương Vương, Phường Thành Nhất, Buôn Ma Thuột",
    phone: "0973 889 002",
    fieldType: FieldType.SAN_5,
    description: "Sân mini gia đình tiện lợi, trang thiết bị mới, hỗ trợ mượn bóng và áo bib tập.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },

  // 8. Phường Khánh Xuân
  {
    name: "Sân thể thao Đức Thịnh",
    ward: "Phường Khánh Xuân",
    address: "Hẻm 174 Phan Huy Chú, Phường Khánh Xuân, Buôn Ma Thuột",
    phone: "0768 447 887",
    fieldType: FieldType.SAN_7,
    description: "Khu liên hợp thể thao Đức Thịnh với cụm sân 7 và sân 5, hệ thống chiếu sáng chuẩn thi đấu đêm.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
  },

  // 9. Xã Hòa Khánh / Hòa Thuận
  {
    name: "Sân Tiến Thy",
    ward: "Xã Hòa Khánh",
    address: "ĐT682, Xã Hòa Khánh, Buôn Ma Thuột",
    phone: "0915 678 910",
    fieldType: FieldType.SAN_5,
    description: "Sân bóng mini khu vực Hòa Khánh, mặt cỏ xanh mượt, phù hợp giao lưu bóng đá địa phương.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sân Quốc Định",
    ward: "Xã Hòa Thuận",
    address: "Thôn 8, Xã Hòa Thuận, Buôn Ma Thuột",
    phone: "0934 890 123",
    fieldType: FieldType.SAN_5,
    description: "Sân cỏ nhân tạo Hòa Thuận, phục vụ đam mê bóng đá bà con nông thôn mới và thanh thiếu niên.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
  },
];

async function seedBmt() {
  console.log(`Starting BMT Pitch Seed for ${bmtFields.length} pitches...`);

  // Ensure time slots exist
  const existingSlots = await prisma.timeSlot.findMany();
  if (existingSlots.length === 0) {
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
  }

  const allSlots = await prisma.timeSlot.findMany({ orderBy: { startTime: "asc" } });

  for (const item of bmtFields) {
    // Find or create field
    let field = await prisma.field.findFirst({
      where: { name: item.name },
    });

    if (field) {
      field = await prisma.field.update({
        where: { id: field.id },
        data: {
          ward: item.ward,
          address: item.address,
          phone: item.phone,
          fieldType: item.fieldType,
          description: item.description,
          imageUrl: item.imageUrl,
          status: FieldStatus.ACTIVE,
        },
      });
      console.log(`Updated: ${field.name} (${field.ward})`);
    } else {
      field = await prisma.field.create({
        data: {
          name: item.name,
          ward: item.ward,
          address: item.address,
          phone: item.phone,
          fieldType: item.fieldType,
          status: FieldStatus.ACTIVE,
          description: item.description,
          imageUrl: item.imageUrl,
        },
      });
      console.log(`Created: ${field.name} (${field.ward})`);
    }

    // Ensure price rules exist for this field
    const ruleCount = await prisma.priceRule.count({
      where: { fieldId: field.id },
    });

    if (ruleCount === 0) {
      const base = field.fieldType === FieldType.SAN_7 ? 400000 : 250000;
      const rules = allSlots.flatMap((slot) => {
        const peakMult = slot.isPeakHour ? 1.3 : 1.0;
        const weekdayPrice = Math.round(base * peakMult);
        const weekendPrice = Math.round(base * peakMult * 1.2);
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
      });
      await prisma.priceRule.createMany({ data: rules });
      console.log(`Created price rules for: ${field.name}`);
    }
  }

  const totalFields = await prisma.field.count();
  console.log(`Seeding BMT pitches completed! Total fields in database: ${totalFields}`);
}

seedBmt()
  .catch((err) => {
    console.error("Error seeding BMT pitches:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

