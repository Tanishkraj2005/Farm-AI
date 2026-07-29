import fs from 'fs';
import path from 'path';

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = path.join(dir, file);
    if (!file.includes('node_modules')) {
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) walk(file, files);
      else if (file.endsWith('.js') || file.endsWith('.jsx')) files.push(file);
    }
  }
  return files;
}

const files = walk('./src').concat(walk('./backend'));
let totalRemoved = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalLength = content.length;
  
  // Remove full line comments (//)
  content = content.replace(/^\s*\/\/.*$/gm, '');
  
  // Remove JSX comments ({/* ... */})
  content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
  
  // Remove standard block comments (/* ... */)
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove excess blank lines (more than 2 consecutive blank lines)
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (content.length !== originalLength) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned ${file}`);
    totalRemoved++;
  }
}

console.log(`Finished removing comments from ${totalRemoved} files.`);
