import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users, listings, collaborations, reviews } from "./schema";

async function main() {
  console.log("🌾 Seeding SkillSwap Rural database...");

  await db.delete(reviews);
  await db.delete(collaborations);
  await db.delete(listings);
  await db.delete(users);

  const passwordHash = bcrypt.hashSync("demo1234", 10);

  // ---------------- Users ----------------
  const userRows = await db
    .insert(users)
    .values([
      { name: "Vikram Singh", business: "SkillSwap Support", email: "admin@skillswap.in", passwordHash, location: "Pune", category: "Other", role: "admin" },
      { name: "Rahul Deshmukh", business: "Deshmukh Organic Farms", email: "demo@rahul.in", passwordHash, location: "Nashik", category: "Agriculture" },
      { name: "Priya Sharma", business: "Sharma Graphic Design", email: "demo@priya.in", passwordHash, location: "Mumbai", category: "Design & Creative" },
      { name: "Sameer Patil", business: "Patil Photography Studio", email: "demo@sameer.in", passwordHash, location: "Nashik", category: "Photography" },
      { name: "Amit Kulkarni", business: "PixelCraft Design Studio", email: "demo@amit.in", passwordHash, location: "Pune", category: "Design & Creative" },
      { name: "Sunita Jadhav", business: "Jadhav Home Kitchen", email: "demo@sunita.in", passwordHash, location: "Nashik", category: "Food & Beverage" },
      { name: "Mohan Rao", business: "Rao Handicrafts", email: "demo@mohan.in", passwordHash, location: "Aurangabad", category: "Handicrafts" },
      { name: "Kavya Nair", business: "Nair Web Solutions", email: "demo@kavya.in", passwordHash, location: "Nashik", category: "Web & Tech" },
    ])
    .returning({ id: users.id, email: users.email });

  const U = new Map(userRows.map((u) => [u.email, u.id]));

  // ---------------- Listings ----------------
  // kind: skill | service | resource     exchangeType: barter | free | paid
  const listingRows = await db
    .insert(listings)
    .values([
      // --- Rahul, the farmer ---
      { userId: U.get("demo@rahul.in")!, type: "need", kind: "service", exchangeType: "barter", title: "Eco-friendly Packaging Design for Farm Produce", description: "I sell organic rice, millet and wheat flour at my farm in Nashik. I need attractive, eco-friendly packaging and labels for my boxes so I can sell in local markets and online. Happy to pay in fresh produce.", category: "Design & Creative", tags: "packaging, label, eco, design, box" },
      { userId: U.get("demo@rahul.in")!, type: "need", kind: "service", exchangeType: "barter", title: "Digital Marketing Help for My Farm", description: "My farm produce is only known in my village. I need help with social media marketing and basic SEO to reach more customers.", category: "Marketing", tags: "social media, marketing, seo, instagram" },
      { userId: U.get("demo@rahul.in")!, type: "offer", kind: "skill", exchangeType: "barter", title: "Organic Farming Consultation", description: "20 years of organic farming experience. I can teach natural pest control, compost preparation and seasonal crop planning for small farms. Free for fellow rural entrepreneurs.", category: "Agriculture", tags: "farming, organic, consultation, training, knowledge" },
      { userId: U.get("demo@rahul.in")!, type: "offer", kind: "resource", exchangeType: "barter", title: "Fresh Organic Vegetables & Grains", description: "Weekly supply of fresh organic vegetables, rice, millet and pulses straight from my farm. Available for barter against services.", category: "Agriculture", tags: "vegetables, organic, grains, supply, produce" },

      // --- Priya, the designer ---
      { userId: U.get("demo@priya.in")!, type: "offer", kind: "skill", exchangeType: "barter", title: "Eco-friendly Packaging & Label Design", description: "Specialised in sustainable packaging and label design for organic and food products. I love working with rural brands and will trade design for goods or other services.", category: "Design & Creative", tags: "packaging, label, eco, design, box" },
      { userId: U.get("demo@priya.in")!, type: "offer", kind: "service", exchangeType: "barter", title: "Social Media Graphics", description: "I design posts, banners and ad creatives for Instagram and Facebook to grow your local business online.", category: "Marketing", tags: "social media, graphics, ads, instagram, design" },
      { userId: U.get("demo@priya.in")!, type: "need", kind: "service", exchangeType: "barter", title: "Product Photography for My Food Brand", description: "I am launching an organic food brand and need professional photos of my packaged products for my website and social media.", category: "Photography", tags: "photography, food, products, shoot, product" },

      // --- Sameer, the photographer ---
      { userId: U.get("demo@sameer.in")!, type: "offer", kind: "service", exchangeType: "barter", title: "Product Photography", description: "Clean, professional product photography for food, handicrafts and agricultural products. Studio setup available in Nashik. Open to barter.", category: "Photography", tags: "photography, products, studio, shoot, product" },
      { userId: U.get("demo@sameer.in")!, type: "offer", kind: "service", exchangeType: "paid", title: "Portrait & Event Photography", description: "Portraits, farm visits, small events and documentation for rural businesses.", category: "Photography", tags: "portrait, event, documentary, photography" },
      { userId: U.get("demo@sameer.in")!, type: "need", kind: "resource", exchangeType: "barter", title: "Organic Fresh Vegetables", description: "My studio canteen and some resale customers want fresh organic vegetables weekly. Looking for a farm supplier nearby to trade against photo shoots.", category: "Agriculture", tags: "vegetables, organic, supply, produce, grains" },

      // --- Amit, the designer ---
      { userId: U.get("demo@amit.in")!, type: "offer", kind: "skill", exchangeType: "paid", title: "Logo & Brand Identity Design", description: "I design memorable logos and complete brand identities for rural businesses — from farm produce to handicrafts.", category: "Design & Creative", tags: "logo, branding, identity, design" },
      { userId: U.get("demo@amit.in")!, type: "offer", kind: "service", exchangeType: "barter", title: "Product Packaging Design", description: "Creative and affordable packaging design for food, agricultural and handmade products. I also design labels that speak to your customers.", category: "Design & Creative", tags: "packaging, label, print, design, box" },
      { userId: U.get("demo@amit.in")!, type: "offer", kind: "service", exchangeType: "paid", title: "Poster & Banner Design", description: "Eye-catching posters for market stalls, workshops, farm events and shop promotions.", category: "Design & Creative", tags: "poster, banner, print, design" },
      { userId: U.get("demo@amit.in")!, type: "need", kind: "service", exchangeType: "paid", title: "Accounting & Bookkeeping Help", description: "I run a small design studio and struggle with monthly accounts and GST paperwork. Need a local accountant who visits or works online.", category: "Finance & Accounting", tags: "accounting, gst, bookkeeping, finance" },
      { userId: U.get("demo@amit.in")!, type: "need", kind: "resource", exchangeType: "barter", title: "Weekly Organic Vegetables for Studio Canteen", description: "My studio cooks lunch for the team every day. Looking for a farm that can supply organic vegetables weekly.", category: "Agriculture", tags: "vegetables, organic, produce, supply" },

      // --- Sunita, home kitchen ---
      { userId: U.get("demo@sunita.in")!, type: "offer", kind: "resource", exchangeType: "paid", title: "Homemade Organic Food Products", description: "Traditional organic pickles, papads and chutneys made at home using family recipes. FSSAI registered, wholesale and retail.", category: "Food & Beverage", tags: "pickles, papads, food, organic, homemade" },
      { userId: U.get("demo@sunita.in")!, type: "need", kind: "service", exchangeType: "paid", title: "Website Development for Food Business", description: "I want a simple website to list my products and take orders. It should be easy to update and mobile-friendly.", category: "Web & Tech", tags: "website, ecommerce, orders, web, development" },
      { userId: U.get("demo@sunita.in")!, type: "need", kind: "service", exchangeType: "barter", title: "Packaging Design for Pickles & Papads", description: "My jars and packets look homemade in the wrong way. I need proper labels and packaging design to sell in city stores.", category: "Design & Creative", tags: "packaging, label, design, box, food" },

      // --- Mohan, handicrafts ---
      { userId: U.get("demo@mohan.in")!, type: "offer", kind: "resource", exchangeType: "paid", title: "Handmade Brass & Clay Crafts", description: "Traditional handicrafts made by local artisans. Bulk orders welcome — I can connect you with the whole craft cluster.", category: "Handicrafts", tags: "brass, clay, handicrafts, crafts, handmade" },
      { userId: U.get("demo@mohan.in")!, type: "need", kind: "service", exchangeType: "barter", title: "Social Media Marketing", description: "My handicraft products are of great quality but nobody knows about them. Need help promoting on Instagram and WhatsApp.", category: "Marketing", tags: "instagram, whatsapp, marketing, social media" },
      { userId: U.get("demo@mohan.in")!, type: "need", kind: "service", exchangeType: "barter", title: "Product Photography for Handicrafts", description: "I need clean product shots of brass and clay items for my catalogue and online listings.", category: "Photography", tags: "photography, products, shoot, handicrafts, product" },

      // --- Kavya, web developer ---
      { userId: U.get("demo@kavya.in")!, type: "offer", kind: "skill", exchangeType: "barter", title: "Website Development for Small Businesses", description: "I build simple, fast, mobile-friendly websites for rural businesses — product listings, orders and WhatsApp enquiry buttons. Happy to barter for goods or services.", category: "Web & Tech", tags: "website, web, development, ecommerce, hosting" },
      { userId: U.get("demo@kavya.in")!, type: "need", kind: "service", exchangeType: "paid", title: "Logo Design for My Web Studio", description: "My studio needs a proper logo and brand colours. Looking for a designer who understands small local businesses.", category: "Design & Creative", tags: "logo, branding, identity, design" },
      { userId: U.get("demo@kavya.in")!, type: "need", kind: "resource", exchangeType: "barter", title: "Fresh Organic Vegetables for Office", description: "Our small office wants a weekly organic vegetable box. Can trade website work or hosting support in return.", category: "Agriculture", tags: "vegetables, organic, produce, supply" },
    ])
    .returning({ id: listings.id, title: listings.title });

  const L = new Map(listingRows.map((l) => [l.title, l.id]));

  // ---------------- Collaborations ----------------
  // Completed pair with mutual reviews.
  const [c1] = await db
    .insert(collaborations)
    .values({
      requesterId: U.get("demo@rahul.in")!,
      providerId: U.get("demo@amit.in")!,
      listingId: L.get("Product Packaging Design")!,
      message: "Hi Amit, I loved your portfolio. I need packaging for my organic rice and millet boxes — can we work together?",
      status: "completed",
    })
    .returning({ id: collaborations.id });

  await db.insert(collaborations).values([
    {
      requesterId: U.get("demo@sunita.in")!,
      providerId: U.get("demo@sameer.in")!,
      listingId: L.get("Product Photography")!,
      message: "Hi Sameer, I need photos of my homemade pickles and papads for my food product listings.",
      status: "accepted",
    },
    {
      requesterId: U.get("demo@sameer.in")!,
      providerId: U.get("demo@rahul.in")!,
      listingId: L.get("Organic Farming Consultation")!,
      message: "Hi Rahul, I would love to learn organic farming basics for my small farm plot and studio garden.",
      status: "pending",
    },
    {
      requesterId: U.get("demo@mohan.in")!,
      providerId: U.get("demo@priya.in")!,
      listingId: L.get("Social Media Graphics")!,
      message: "Hi Priya, can you create a few Instagram posts for my handicraft products?",
      status: "pending",
    },
    {
      requesterId: U.get("demo@priya.in")!,
      providerId: U.get("demo@sameer.in")!,
      listingId: L.get("Product Photography")!,
      message: "Hi Sameer, I am launching an organic food brand — I would love to book a product shoot with you.",
      status: "accepted",
    },
    {
      requesterId: U.get("demo@sunita.in")!,
      providerId: U.get("demo@kavya.in")!,
      listingId: L.get("Website Development for Small Businesses")!,
      message: "Hi Kavya, can you build a small ordering website for my pickles and papads?",
      status: "pending",
    },
  ]);

  // ---------------- Reviews ----------------
  await db.insert(reviews).values([
    {
      collaborationId: c1.id,
      reviewerId: U.get("demo@rahul.in")!,
      revieweeId: U.get("demo@amit.in")!,
      rating: 5,
      comment: "Amazing packaging design! Amit understood exactly what I needed for my farm products. We settled it with a barter — he gets vegetables weekly.",
    },
    {
      collaborationId: c1.id,
      reviewerId: U.get("demo@amit.in")!,
      revieweeId: U.get("demo@rahul.in")!,
      rating: 5,
      comment: "Great collaboration. Rahul had a clear brief, communicated well, and the organic produce he traded was excellent.",
    },
  ]);

  await db.update(users).set({ ratingAvg: 5, ratingCount: 1 }).where(eq(users.id, U.get("demo@amit.in")!));
  await db.update(users).set({ ratingAvg: 5, ratingCount: 1 }).where(eq(users.id, U.get("demo@rahul.in")!));

  console.log("✅ Seed complete!");
  console.log(`   ${userRows.length} users, ${listingRows.length} listings`);
  console.log("Demo accounts (password: demo1234):");
  console.log("  Rahul (farmer):        demo@rahul.in   <- has the 3-person exchange circle");
  console.log("  Priya (designer):      demo@priya.in");
  console.log("  Sameer (photographer): demo@sameer.in");
  console.log("  Amit (designer):       demo@amit.in");
  console.log("  Sunita (food):         demo@sunita.in");
  console.log("  Mohan (handicrafts):   demo@mohan.in");
  console.log("  Kavya (web dev):       demo@kavya.in");
  console.log("  Admin:                 admin@skillswap.in");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
