const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require('d:/Shining-Sparrow/Shining-Sparrow-BE/node_modules/mongoose');
const sharp = require('d:/Shining-Sparrow/Shining-Sparrow-Website/node_modules/sharp');

const dbUrl = "mongodb+srv://shiningsparrow2025_db_user:0udoMGOVzU1RM279@cluster0.klp03nd.mongodb.net/shining-sparrow";

async function run() {
    console.log("Connecting to database...");
    await mongoose.connect(dbUrl);
    console.log("Database connected successfully.");

    const db = mongoose.connection.db;
    const heroBannersColl = db.collection('hero-banners');

    // Find the original banner document
    const origId = new mongoose.Types.ObjectId("6a54c8925708886f4d8954a8");
    const originalBanner = await heroBannersColl.findOne({ _id: origId });

    if (!originalBanner) {
        console.log("Original banner not found. It might have been migrated already.");
        await mongoose.disconnect();
        return;
    }

    console.log("Found original banner with images:", originalBanner.images ? originalBanner.images.length : 0);

    const slidesConfig = [
        {
            title: "Shining Sparrow – Where Every Mind Learns to Fly.",
            tagline: "Shining Sparrow",
            description: "I am focused. I am confident. I learn faster every day. I can achieve anything with my sharp mind."
        },
        {
            title: "Interactive & Fun Learning Workshops",
            tagline: "Creative Development",
            description: "Designed to inspire curious minds through hands-on activities, logical puzzles, and interactive lessons."
        },
        {
            title: "Unlock Your Child's True Potential",
            tagline: "Unlock Potential",
            description: "Our structured programs guide students step-by-step to master concepts and build lifelong confidence."
        }
    ];

    const newBanners = [];

    for (let i = 0; i < originalBanner.images.length; i++) {
        const rawBase64 = originalBanner.images[i];
        console.log(`Processing image ${i + 1} (original base64 length: ${rawBase64.length})...`);

        // Get base64 content
        const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            console.log(`Image ${i + 1} does not match base64 URI scheme, skipping compression.`);
            newBanners.push({
                type: "web",
                title: slidesConfig[i]?.title || "Untitled",
                tagline: slidesConfig[i]?.tagline || "Shining Sparrow",
                description: slidesConfig[i]?.description || "",
                images: [rawBase64],
                isDeleted: false,
                isBlocked: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            continue;
        }

        const buffer = Buffer.from(matches[2], 'base64');
        
        // Compress using sharp
        const compressedBuffer = await sharp(buffer)
            .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 75 })
            .toBuffer();

        const compressedBase64 = "data:image/jpeg;base64," + compressedBuffer.toString('base64');
        console.log(`Compressed image ${i + 1} length: ${compressedBase64.length} (Saved: ${Math.round((1 - (compressedBase64.length / rawBase64.length)) * 100)}%)`);

        newBanners.push({
            type: "web",
            title: slidesConfig[i]?.title || "Untitled",
            tagline: slidesConfig[i]?.tagline || "Shining Sparrow",
            description: slidesConfig[i]?.description || "",
            images: [compressedBase64],
            isDeleted: false,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    console.log("Inserting new separate slide documents...");
    const insertRes = await heroBannersColl.insertMany(newBanners);
    console.log("Insert result:", insertRes);

    console.log("Deleting original combined banner document...");
    const deleteRes = await heroBannersColl.updateOne({ _id: origId }, { $set: { isDeleted: true } });
    console.log("Delete result:", deleteRes);

    console.log("Migration complete!");
    await mongoose.disconnect();
}

run().catch(async (err) => {
    console.error("Migration error:", err);
    await mongoose.disconnect();
});
