const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (!filepath.includes('node_modules') && !filepath.includes('.git') && !filepath.includes('.next')) {
        filelist = walk(filepath, filelist);
      }
    } else {
      if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

const files = walk('./src');
let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Let's do a reliable line-based approach for the simplest cases
  let lines = content.split('\n');
  let fileChanged = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if line has an onClick hook
    if (line.includes('onClick=') && !line.includes('cursor-pointer') && !line.includes('<button') && !line.includes('<Link')) {
      // Find where className is
      if (line.includes('className="')) {
         lines[i] = line.replace('className="', 'className="cursor-pointer ');
         fileChanged = true;
      } else if (line.includes("className='")) {
         lines[i] = line.replace("className='", "className='cursor-pointer ");
         fileChanged = true;
      } else if (line.includes("className={`")) {
         lines[i] = line.replace("className={`", "className={`cursor-pointer ");
         fileChanged = true;
      } else if (!line.includes('className=')) {
         // Try to inject className after the first tag name e.g <div onClick
         const tagMatch = line.match(/<(div|span|p|h[1-6]|img|li|tr|svg|path|label)\s/);
         if (tagMatch) {
            lines[i] = line.replace(tagMatch[0], tagMatch[0] + 'className="cursor-pointer" ');
            fileChanged = true;
         }
      }
    }
  }

  if (fileChanged) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    changedCount++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Finished. Updated ${changedCount} files.`);
