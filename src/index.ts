import type { Core } from '@strapi/strapi';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const ROBOT_SEED = [
  {
    name: 'ROBOTICK H1',
    description: 'Humanoid Â· AI Powered Â· Events & Enterprise. Our flagship entry-level humanoid. 1.27m height, 35kg, 23 DOF, 2hr battery. Available for hire and purchase worldwide.',
    price: 17990,
    category: 'humanoid',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-g1-robotic-humanoid-9557891.jpg?v=1759440110',
  },
  {
    name: 'ROBOTICK H1 PRO',
    description: 'Humanoid Â· NVIDIA Jetson Â· Developer Ready. 1.27m height, 35kg, 23 DOF, 100 TOPS AI compute. Enterprise lease available from $3,200/month.',
    price: 43900,
    category: 'humanoid',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-g1-edu-standard-robotic-humanoid-u1-7101558.jpg?v=1759440113',
  },
  {
    name: 'ROBOTICK H1 ULTRA',
    description: 'Humanoid Â· 42 DOF Â· Dexterous Hands. 1.27m height, 35kg, 42 DOF with Dex3s dexterous hands. The most capable Robotick humanoid.',
    price: 65900,
    category: 'humanoid',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-g1-edu-ultimate-a-robotic-humanoid-u3-8215619.jpg?v=1759440110',
  },
  {
    name: 'ROBOTICK H2',
    description: 'Humanoid Â· Full Size Â· High Performance. 1.8m height, 70kg, 2 m/s top speed, Core i7 CPU. The most powerful Robotick humanoid.',
    price: 128900,
    category: 'humanoid',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-h1-2-robotic-humanoid-147221.png?v=1748486563',
  },
  {
    name: 'ROBOTICK ALPHA',
    description: 'Service Robot Â· Reception Â· Hospitality Â· Retail. 1.4m height, 29kg, 26 DOF, 8hr battery. Available for hire from â‚¦120,000/day.',
    price: 8990,
    category: 'service',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-r1-robotic-humanoid-5324651.jpg?v=1761924608',
  },
  {
    name: 'ROBOTICK ALPHA PRO',
    description: 'Service Â· AI Enhanced Â· Enterprise Integration. 1.4m height, 29kg, 26 DOF, 100 TOPS AI power. Full enterprise AI integration included.',
    price: 18900,
    category: 'service',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-r1-edu-robotic-humanoid-2171588.jpg?v=1761924603',
  },
  {
    name: 'ROBOTICK SIGMA',
    description: 'Industrial Â· Logistics Â· Warehouse Â· Factory. 2.1m height, 82kg, heavy-duty build, 12hr battery. Coming 2026 â€” register your interest for early access pricing.',
    price: 0,
    category: 'coming',
    imageUrl: null,
  },
  {
    name: 'ROBOTICK MAX',
    description: 'Security Â· Surveillance Â· Patrol Â· Monitoring. 1.9m height, 65kg, 360Â° vision, 10hr battery. Coming 2026 â€” enquire for deployment information.',
    price: 0,
    category: 'coming',
    imageUrl: null,
  },
];

async function fetchAndUploadImage(
  strapi: Core.Strapi,
  url: string,
  robotName: string
): Promise<number | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MrRobotick/1.0)' },
    });
    if (!response.ok) {
      strapi.log.warn(`[seed] Image fetch failed (${response.status}) for ${robotName}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `${robotName.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
    const tmpPath = join(tmpdir(), fileName);

    await writeFile(tmpPath, buffer);

    const [uploadedFile] = await strapi.plugin('upload').service('upload').upload({
      data: {
        fileInfo: {
          name: fileName,
          alternativeText: robotName,
          caption: robotName,
        },
      },
      files: {
        name: fileName,
        type: contentType,
        size: buffer.length,
        path: tmpPath,
      },
    });

    await unlink(tmpPath).catch(() => {});
    strapi.log.info(`[seed] Uploaded image for ${robotName} (id: ${uploadedFile.id})`);
    return uploadedFile.id;
  } catch (err) {
    strapi.log.warn(`[seed] Could not upload image for ${robotName}: ${err}`);
    return null;
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Only seed if the collection is empty
    const existing = await strapi.documents('api::robot.robot').findMany({});
    if (existing.length > 0) return;

    strapi.log.info('[seed] Robots collection is empty â€” seeding data...');

    for (const robot of ROBOT_SEED) {
      try {
        // Upload image from URL if available
        const imageId = robot.imageUrl
          ? await fetchAndUploadImage(strapi, robot.imageUrl, robot.name)
          : null;

        const doc = await strapi.documents('api::robot.robot').create({
          data: {
            name: robot.name,
            description: robot.description,
            price: robot.price,
            category: robot.category,
            ...(imageId ? { images: [imageId] } : {}),
          },
        });

        await strapi.documents('api::robot.robot').publish({ documentId: doc.documentId });
        strapi.log.info(`[seed] Created & published: ${robot.name}`);
      } catch (err) {
        strapi.log.error(`[seed] Failed to seed ${robot.name}: ${err}`);
      }
    }

    strapi.log.info('[seed] Robot seeding complete.');
  },
};
