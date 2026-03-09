#!/usr/bin/env node

/**
 * Generate showcase meme images for landing page
 * Uses Gemini API to create real meme examples
 * 
 * Usage: node scripts/generate-showcase.mjs
 */

import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Load .env.local
config({ path: join(rootDir, ".env.local") });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const MODEL = "gemini-2.0-flash-exp-image-generation";
const outDir = join(rootDir, "public", "showcase");
mkdirSync(outDir, { recursive: true });

// Meme showcase definitions — diverse fanpage types
const memes = [
  {
    id: "chungkhoan",
    prompt: `Create a Vietnamese stock market meme illustration. A cute cartoon bull mascot wearing a business suit, red tie, and sunglasses, looking extremely confident and flexing. The bull is standing in front of a green stock chart going up sharply. Style: colorful cartoon, bold outlines, chibi proportions (big head, small body), Vietnamese meme style similar to "Bò và Gấu" fanpage. The image should include bold Vietnamese text at the top saying "KHI CỔ PHIẾU TĂNG TRẦN" (in big bold font with black outline). Colors: vibrant green, gold, teal. No watermark. Square format 1:1. Professional meme quality ready for Facebook.`,
  },
  {
    id: "couple",
    prompt: `Create a cute Vietnamese couple meme illustration. Two adorable chibi cartoon characters (a boy bear and girl bunny) sitting together watching sunset on a rooftop. The boy bear wears a hoodie, the girl bunny has a bow. They're blushing and holding hands. Style: soft pastel colors, kawaii/chibi art style, big expressive eyes, romantic mood. Bold Vietnamese text at the top: "KHI BẠN NÓI 'ANH ĐÓI' LÚC 2H SÁNG" in bold font with outline. Background: city rooftop with warm sunset. Square 1:1 format. Vietnamese fanpage meme style.`,
  },
  {
    id: "office",
    prompt: `Create a funny Vietnamese office worker meme illustration. A chibi cartoon cat mascot wearing office clothes (shirt and tie), sitting at a desk piled with papers, looking exhausted with spiral eyes and coffee spilling. A clock on the wall shows 5:59 PM. Style: vibrant cartoon, bold outlines, exaggerated expressions, chibi proportions. Bold Vietnamese text: "FRIDAY 5H CHIỀU VS MONDAY 8H SÁNG" in big bold font. Colors: bright and fun. Square 1:1. Vietnamese meme fanpage style like Money Studio.`,
  },
  {
    id: "gaming",
    prompt: `Create a Vietnamese gaming meme illustration. A cool chibi cartoon dragon mascot wearing a gaming headset and hoodie, sitting in a RGB gaming chair, holding a game controller with intense focused expression. Energy drink cans scattered around. Style: vibrant neon colors, streetwear aesthetic, bold outlines, dynamic pose. Bold Vietnamese text: "ĐÊM NAY KHÔNG NGỦ, RANK PHẢI LÊN" in bold neon font with glow effect. Background: dark room with RGB lights. Square 1:1. Vietnamese gaming community meme style.`,
  },
  {
    id: "food",
    prompt: `Create a Vietnamese food lover meme illustration. An adorable chibi cartoon pig mascot with a chef hat, drooling while looking at a huge bowl of phở with all the toppings. The pig has heart-shaped eyes and is holding chopsticks eagerly. Style: warm colors, cute kawaii style, detailed food illustration, bold outlines. Bold Vietnamese text: "AI NÓI ĐI ĂN LÀ ĐI NGAY" in bold playful font. Background: Vietnamese street food stall ambiance. Square 1:1. Vietnamese food fanpage meme style.`,
  },
  {
    id: "gym",
    prompt: `Create a Vietnamese gym/fitness meme illustration. A buff chibi cartoon gorilla mascot wearing a tank top and headband, trying to lift a tiny dumbbell but making an extremely dramatic face as if it weighs 500kg. Sweat drops flying everywhere. Style: dynamic action pose, bold outlines, exaggerated muscles and expressions, streetwear aesthetic. Bold Vietnamese text: "NGÀY ĐẦU ĐI GYM" in bold impact font. Background: gym interior. Square 1:1. Vietnamese fitness meme style.`,
  },
  {
    id: "crypto",
    prompt: `Create a Vietnamese crypto/Bitcoin meme illustration. A chibi cartoon fox mascot wearing a diamond chain necklace and laser eye effect, riding a rocket that's shaped like a Bitcoin going to the moon. The fox looks extremely hyped with money emojis around. Style: vibrant neon and gold colors, dynamic composition, bold outlines, streetwear aesthetic. Bold Vietnamese text: "HODL TO THE MOON 🚀" in bold metallic gold font. Background: space/stars. Square 1:1. Vietnamese crypto community meme style.`,
  },
  {
    id: "student",
    prompt: `Create a Vietnamese student meme illustration. A tired chibi cartoon raccoon mascot surrounded by textbooks and notebooks, with dark circles under eyes, holding a coffee cup. An alarm clock shows 3 AM. Papers and sticky notes everywhere. Style: relatable, warm colors, cute but exhausted expression, chibi proportions, bold outlines. Bold Vietnamese text: "THI NGÀY MAI, HÔM NAY MỚI HỌC" in bold font with stressed vibe. Background: messy study desk with lamp. Square 1:1. Vietnamese student meme style.`,
  },
];

async function generateMeme(meme) {
  console.log(`\n🎨 Generating: ${meme.id}...`);
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: meme.prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No parts in response");

    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const filePath = join(outDir, `${meme.id}.png`);
        writeFileSync(filePath, buffer);
        console.log(`   ✅ Saved: public/showcase/${meme.id}.png (${(buffer.length / 1024).toFixed(0)}KB)`);
        return true;
      }
    }

    // Check if text response explains refusal
    for (const part of parts) {
      if (part.text) {
        console.log(`   ⚠️ Model returned text instead: ${part.text.substring(0, 100)}`);
      }
    }
    throw new Error("No image data in response");
  } catch (err) {
    console.error(`   ❌ Failed: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Meme Factory — Showcase Image Generator");
  console.log(`📁 Output: ${outDir}`);
  console.log(`🎯 Generating ${memes.length} meme images...\n`);

  let success = 0;
  let failed = 0;

  for (const meme of memes) {
    const ok = await generateMeme(meme);
    if (ok) success++;
    else failed++;
    
    // Small delay to avoid rate limiting
    if (memes.indexOf(meme) < memes.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n📊 Results: ${success} success, ${failed} failed out of ${memes.length} total`);
  console.log(`📁 Images saved in: public/showcase/`);
}

main();
