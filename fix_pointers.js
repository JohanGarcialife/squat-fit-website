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

  // Broad regex to catch any tag (except button/a/Link) with onClick
  // Tags like div, span, p, h1, h2, h3, img
  const tagRegex = /<(div|span|p|h[1-6]|img|li|tr|svg|path|label)([^>]*?onClick={[^>]*?>)/g;
  
  content = content.replace(tagRegex, (match, tag, rest) => {
    if (rest.includes('cursor-pointer')) return match;
    
    // We try to append cursor-pointer to className if it exists and is a literal string
    if (rest.includes('className="')) {
      return `<${tag}${rest.replace('className="', 'className="cursor-pointer ')}`;
    } else if (rest.includes("className='")) {
      return `<${tag}${rest.replace("className='", "className='cursor-pointer ")}`;
    } else if (rest.includes("className={`")) {
      return `<${tag}${rest.replace("className={`", "className={`cursor-pointer ")}`;
    } else if (rest.includes('className={')) {
      // It's entirely dynamic like className={isActive ? 'foo' : 'bar'}.
      // We can wrap the expression or carefully inject it, but safer to skip complex AST logic 
      // by just appending cursor-pointer right after the curly brace? No that breaks JSX.
      // We will skip dynamic classNames to prevent breaking syntax.
      return match;
    } else {
      // Doesn't have a className, add one securely before the closing angle bracket or inside rest
      return `<${tag} className="cursor-pointer"${rest}`;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Finished. Updated ${changedCount} files.`);
