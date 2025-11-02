/**
 * Script pour importer des chaînes depuis un fichier texte
 * Usage: node scripts/import-channels-from-txt.js <chemin-du-fichier.txt>
 * 
 * Format attendu dans le fichier txt:
 * - Une ligne par chaîne: Nom|URL
 * - Ou simplement l'URL (le nom sera généré automatiquement)
 * - Supporte les liens directs et les wrappers (score808, href.li, etc.)
 */

const fs = require('fs');
const path = require('path');

// Chemin du fichier channels.ts
const channelsFilePath = path.join(__dirname, '../lib/channels.ts');

/**
 * Extraire l'URL directe depuis un wrapper
 */
function extractDirectUrl(wrappedUrl) {
  // Format: https://score808.app/frame.html?link=https://href.li/?https://sportzonline.live/channels/hd/hd2.php
  if (wrappedUrl.includes('score808.app/frame.html?link=')) {
    const match = wrappedUrl.match(/link=([^&]+)/);
    if (match) {
      let url = decodeURIComponent(match[1]);
      // Si c'est un double wrapper href.li
      if (url.includes('href.li/?')) {
        url = url.replace(/https?:\/\/href\.li\/\?/, '');
      }
      return url;
    }
  }
  
  // Format: https://href.li/?https://sportzonline.live/channels/hd/hd2.php
  if (wrappedUrl.includes('href.li/?')) {
    return wrappedUrl.replace(/https?:\/\/href\.li\/\?/, '');
  }
  
  // Si c'est déjà un lien direct, le retourner tel quel
  return wrappedUrl;
}

/**
 * Générer un nom de chaîne depuis l'URL
 */
function generateChannelName(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const pathname = urlObj.pathname;
    
    // Extraire des infos du chemin (ex: sporttv1.php -> Sport TV 1)
    const filename = path.basename(pathname, '.php');
    
    // Nettoyer et formater le nom
    let name = filename
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    // Ajouter le domaine si utile
    if (hostname.includes('sport')) {
      name = `SPORT TV ${filename.match(/\d+/)?.[0] || 'HD'}`;
    } else if (hostname.includes('dazn')) {
      name = 'DAZN';
    } else if (hostname.includes('bein')) {
      name = 'beIN SPORT';
    }
    
    return name || hostname.toUpperCase();
  } catch {
    return 'Nouvelle Chaîne';
  }
}

/**
 * Lire le fichier channels.ts et extraire le dernier ID
 */
function getLastChannelId(content) {
  const matches = content.match(/id:\s*['"]([\d]+)['"]/g);
  if (!matches || matches.length === 0) return '0';
  
  const ids = matches.map(m => parseInt(m.match(/['"](\d+)['"]/)[1]));
  return Math.max(...ids).toString();
}

/**
 * Ajouter une chaîne au fichier channels.ts
 */
function addChannelToFile(channelName, url, directUrl) {
  const content = fs.readFileSync(channelsFilePath, 'utf-8');
  
  // Extraire le dernier ID
  const lastId = parseInt(getLastChannelId(content));
  const newId = (lastId + 1).toString();
  
  // Générer la description
  const provider = new URL(directUrl).hostname.replace('www.', '');
  const description = `Sports en direct - Streaming ${provider}`;
  
  // Générer le code de la nouvelle chaîne
  const newChannel = `
  {
    id: '${newId}',
    name: '${channelName}',
    description: '${description}',
    thumbnail: '/images/channels/DAZN.jpg',
    url: '${url}',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    quality: 'HD',
    viewCount: ${Math.floor(Math.random() * 10000) + 5000},
    sources: [
      {
        name: 'Source 1',
        url: '${url}',
        provider: '${provider}'
      }
    ]
  },`;
  
  // Insérer avant le dernier ]
  const insertPosition = content.lastIndexOf('];');
  const newContent = 
    content.slice(0, insertPosition) + 
    newChannel + 
    '\n' + 
    content.slice(insertPosition);
  
  fs.writeFileSync(channelsFilePath, newContent, 'utf-8');
  console.log(`✅ Ajouté: ${channelName} (ID: ${newId})`);
}

/**
 * Parser le fichier texte
 */
function parseTxtFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier non trouvé: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log(`📝 Lecture de ${lines.length} lignes...\n`);
  
  let added = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Format: Nom|URL ou juste URL
    let [name, url] = trimmed.includes('|') 
      ? trimmed.split('|').map(s => s.trim())
      : [null, trimmed];
    
    if (!url) continue;
    
    // Extraire l'URL directe
    const directUrl = extractDirectUrl(url);
    
    // Générer le nom si non fourni
    if (!name) {
      name = generateChannelName(directUrl);
    }
    
    try {
      addChannelToFile(name, url, directUrl);
      added++;
    } catch (error) {
      console.error(`❌ Erreur pour ${name}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ ${added} chaîne(s) ajoutée(s) avec succès!`);
}

// Point d'entrée
const txtFilePath = process.argv[2];

if (!txtFilePath) {
  console.log(`
📋 Utilisation:
  node scripts/import-channels-from-txt.js <chemin-du-fichier.txt>

📝 Format du fichier txt:
  - Une ligne par chaîne
  - Format: Nom|URL
  - Ou simplement: URL (le nom sera généré automatiquement)
  - Supporte les wrappers: score808.app, href.li, etc.

Exemple:
  SPORT TV 1|https://sportsonline.sn/channels/pt/sporttv1.php
  https://score808.app/frame.html?link=https://sportzonline.live/channels/hd/hd2.php
  `);
  process.exit(1);
}

parseTxtFile(txtFilePath);

