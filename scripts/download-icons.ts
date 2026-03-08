import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const publicDir = path.join(process.cwd(), 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const downloadFile = async (url: string, dest: string) => {
  console.log(`Downloading ${url} to ${dest}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const fileStream = fs.createWriteStream(dest);
    // @ts-ignore
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
    console.log(`Downloaded ${dest}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
  }
};

const main = async () => {
  // Using a high-quality "Night Mosque" icon that matches the user's blue/gold theme
  const iconUrl = 'https://cdn-icons-png.flaticon.com/512/4358/4358666.png';
  
  await downloadFile(
    iconUrl,
    path.join(iconsDir, 'icon-192x192.png')
  );
  await downloadFile(
    iconUrl,
    path.join(iconsDir, 'icon-512x512.png')
  );
};

main();
