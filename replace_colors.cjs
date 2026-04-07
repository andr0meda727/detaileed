const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);

function searchAndReplace(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== 'dist') {
            searchAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const replacements = [
                { regex: /\[#102[cC]26\]/g, replacement: 'green-deep' },
                { regex: /\[#[fF][dD][fF]8[fF]0\]/g, replacement: 'cream' },
                { regex: /\[#[fF]7[eE]7[cC][eE]\]/g, replacement: 'cream-warm' },
                { regex: /\[#[eE]8[dD]5[bB]5\]/g, replacement: 'cream-dark' },
                { regex: /\[#5[aA]8[aA]7[aA]\]/g, replacement: 'green-light' },
                { regex: /#102[cC]26/g, replacement: 'var(--green-deep)' },
                { regex: /#[fF][dD][fF]8[fF]0/g, replacement: 'var(--cream)' },
                { regex: /#[fF]7[eE]7[cC][eE]/g, replacement: 'var(--cream-warm)' },
                { regex: /#[eE]8[dD]5[bB]5/g, replacement: 'var(--cream-dark)' },
                { regex: /#5[aA]8[aA]7[aA]/g, replacement: 'var(--green-light)' }
            ];

            replacements.forEach(({ regex, replacement }) => {
                if (regex.test(content)) {
                    content = content.replace(regex, replacement);
                    modified = true;
                }
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

searchAndReplace(directoryPath);
console.log('Replacement complete.');
