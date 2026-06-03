import { readFile } from 'node:fs/promises';

const requiredFiles = [
  'index.html',
  'src/main.js',
  'src/styles.css',
  'src/domain/course.js',
  'src/domain/correction.js',
  'src/domain/localization.js',
  'src/domain/quality.js',
  'src/domain/report.js',
  'src/domain/retention.js',
  'src/domain/session.js',
  'src/domain/subscription.js',
  'src/services/aiTutor.js',
  'src/services/voiceSession.js',
];

for (const file of requiredFiles) {
  const contents = await readFile(file, 'utf8');
  if (!contents.trim()) {
    throw new Error(`${file} is empty`);
  }
}

const html = await readFile('index.html', 'utf8');
if (!html.includes('/src/main.js')) {
  throw new Error('index.html must load /src/main.js');
}

console.log('Static app validation passed.');
