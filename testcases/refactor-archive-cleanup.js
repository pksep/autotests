const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'U006-Archive.spec.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace body only: from "    const detailsPage" through "  });\n\n  test('Cleanup"
const bodyRe = /    const detailsPage = new CreatePartsDatabasePage\(page\);\s*\n\s*\n    await allure\.step[\s\S]*?exact matching details have been archived\.`\);\s*\n    \}\);\s*\n  \}\);\s*\n  \}\);\s*\n\n  test\('Cleanup /g;
const replacement = `    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup `;
const count = (content.match(bodyRe) || []).length;
content = content.replace(bodyRe, replacement);

fs.writeFileSync(filePath, content);
console.log('Replaced', count, 'blocks');
