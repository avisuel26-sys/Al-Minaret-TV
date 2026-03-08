import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const publicDir = path.join(process.cwd(), 'public');
const assetsDir = path.join(publicDir, 'assets');
const audioDir = path.join(assetsDir, 'audio');

// Ensure directories exist
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const downloadFile = async (url: string, dest: string) => {
  console.log(`Downloading ${url} to ${dest}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      return false;
    }
    
    if (!res.body) {
      console.error(`No body for ${url}`);
      return false;
    }
    
    const fileStream = fs.createWriteStream(dest);
    // @ts-ignore
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
    console.log(`Downloaded ${dest}`);
    return true;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return false;
  }
};

const main = async () => {
  // Adhan URLs to try
  const adhanUrls = [
    'https://ia800303.us.archive.org/31/items/AdhanMakkah/Adhan%20Makkah.mp3',
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/adhan/makkah.mp3'
  ];

  let adhanDownloaded = false;
  for (const url of adhanUrls) {
    if (await downloadFile(url, path.join(audioDir, 'adhan.mp3'))) {
      adhanDownloaded = true;
      break;
    }
  }

  if (!adhanDownloaded) {
    console.error('Failed to download any Adhan audio.');
  } else {
    console.log('Adhan audio downloaded successfully!');
  }
};

main();
