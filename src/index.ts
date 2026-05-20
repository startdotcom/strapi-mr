import type { Core } from '@strapi/strapi';

const ROBOT_SEED = [
  {
    name: 'ROBOTICK H1',
    description: 'Humanoid · AI Powered · Events & Enterprise. Our flagship entry-level humanoid. 1.27m height, 35kg, 23 DOF, 2hr battery. Available for hire and purchase worldwide.',
    price: 17990,
    category: 'humanoid',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-g1-robotic-humanoid-9557891.jpg?v=1759440110',
  },
  {
    name: 'ROBOTICK H1 PRO',
    description: 'Humanoid · NVIDIA Jetson · Developer Ready. 1.27m height, 35kg, 23 DOF, 100 TOPS AI compute. Enterprise lease available from $3,200/month.',
    price: 43900,
    category: 'humanoid',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-g1-edu-standard-robotic-humanoid-u1-7101558.jpg?v=1759440113',
  },
  {
    name: 'ROBOTICK H1 ULTRA',
    description: 'Humanoid · 42 DOF · Dexterous Hands. 1.27m height, 35kg, 42 DOF with Dex3s dexterous hands. The most capable Robotick humanoid.',
    price: 65900,
    category: 'humanoid',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-g1-edu-ultimate-a-robotic-humanoid-u3-8215619.jpg?v=1759440110',
  },
  {
    name: 'ROBOTICK H2',
    description: 'Humanoid · Full Size · High Performance. 1.8m height, 70kg, 2 m/s top speed, Core i7 CPU. The most powerful Robotick humanoid.',
    price: 128900,
    category: 'humanoid',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-h1-2-robotic-humanoid-147221.png?v=1748486563',
  },
  {
    name: 'ROBOTICK ALPHA',
    description: 'Service Robot · Reception · Hospitality · Retail. 1.4m height, 29kg, 26 DOF, 8hr battery. Available for hire from ₦120,000/day.',
    price: 8990,
    category: 'service',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-r1-robotic-humanoid-5324651.jpg?v=1761924608',
  },
  {
    name: 'ROBOTICK ALPHA PRO',
    description: 'Service · AI Enhanced · Enterprise Integration. 1.4m height, 29kg, 26 DOF, 100 TOPS AI power. Full enterprise AI integration included.',
    price: 18900,
    category: 'service',
    imageUrl: 'https://robostore.com/cdn/shop/files/unitree-r1-edu-robotic-humanoid-2171588.jpg?v=1761924603',
  },
  {
    name: 'ROBOTICK SIGMA',
    description: 'Industrial · Logistics · Warehouse · Factory. 2.1m height, 82kg, heavy-duty build, 12hr battery. Coming 2026 — register your interest for early access pricing.',
    price: 0,
    category: 'coming',
    imageUrl: null,
  },
  {
    name: 'ROBOTICK MAX',
    description: 'Security · Surveillance · Patrol · Monitoring. 1.9m height, 65kg, 360° vision, 10hr battery. Coming 2026 — enquire for deployment information.',
    price: 0,
    category: 'coming',
    imageUrl: null,
  },
];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Only seed if the collection is empty
    const existing = await strapi.documents('api::robot.robot').findMany({});
    if (existing.length > 0) return;

    strapi.log.info('[seed] Robots collection is empty — seeding data...');

    for (const robot of ROBOT_SEED) {
      try {
        const doc = await strapi.documents('api::robot.robot').create({
          data: {
            name: robot.name,
            description: robot.description,
            price: robot.price,
            category: robot.category,
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
