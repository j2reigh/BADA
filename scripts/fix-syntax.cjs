const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../client/src/lib/simple-i18n.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The script injected literal `\n\n    ` outside of quotes, which is invalid syntax. 
// We will replace `,\\n\\n    'landing.nav.problem': ` with `,\n\n    'landing.nav.problem': ` globally.

content = content.replace(/,\\n\\n    'landing\.nav\.problem': /g, ',\n\n    \'landing.nav.problem\': ');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax in simple-i18n.ts');
