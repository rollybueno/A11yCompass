import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/icons');
const source = join(__dirname, '../brand/icon-source.png');

mkdirSync(outDir, { recursive: true });

if (!existsSync(source)) {
  throw new Error('Missing brand/icon-source.png. Add a 1024×1024 master mark first.');
}

function resize(size) {
  const dest = join(outDir, `icon-${size}.png`);
  const magick = spawnSync('magick', [source, '-resize', `${size}x${size}`, dest], { encoding: 'utf8' });
  if (magick.status === 0) return;
  const convert = spawnSync('convert', [source, '-resize', `${size}x${size}`, dest], { encoding: 'utf8' });
  if (convert.status === 0) return;
  const ffmpeg = spawnSync(
    'ffmpeg',
    ['-y', '-i', source, '-vf', `scale=${size}:${size}:flags=lanczos`, dest],
    { encoding: 'utf8' },
  );
  if (ffmpeg.status === 0) return;
  const python = spawnSync(
    'python3',
    [
      '-c',
      `from PIL import Image; Image.open(${JSON.stringify(source)}).convert("RGBA").resize((${size}, ${size}), Image.Resampling.LANCZOS).save(${JSON.stringify(dest)})`,
    ],
    { encoding: 'utf8' },
  );
  if (python.status === 0) return;
  throw new Error(
    `Could not resize icons. Install ImageMagick, ffmpeg, or Pillow.\n${python.stderr || ffmpeg.stderr || magick.stderr}`,
  );
}

for (const size of [16, 32, 48, 128]) resize(size);
console.log('Wrote icons to', outDir);
