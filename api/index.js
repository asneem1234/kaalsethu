import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

export default function handler(req, res) {
  try {
    // If request is for root or index.html, serve the index.html file
    const indexPath = join(rootDir, 'index.html');
    const indexContent = readFileSync(indexPath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(indexContent);
  } catch (error) {
    res.status(500).send(`Error serving index.html: ${error.message}`);
  }
}