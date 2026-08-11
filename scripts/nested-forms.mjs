/**
 * Detect nested <form> tags in HTML. Browsers reject this; React logs a
 * hydration error when SSR emits it.
 *
 * Run standalone: node scripts/nested-forms.mjs
 */

import { fileURLToPath } from "node:url";

export function maxFormNesting(html) {
  let depth = 0;
  let max = 0;
  const re = /<\/?form\b[^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    if (match[0].startsWith("</")) {
      depth = Math.max(0, depth - 1);
    } else {
      depth += 1;
      if (depth > max) max = depth;
    }
  }
  return max;
}

export function hasNestedForms(html) {
  return maxFormNesting(html) > 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cases = [
    ["sibling forms", "<form></form><form></form>", false],
    ["nested forms", "<form><div><form></form></div></form>", true],
    ["speakers bug shape", '<form action="invite"><form role="search"></form><table></table></form>', true],
    ["speakers fixed shape", '<form role="search"></form><form action="invite"><table></table></form>', false],
    ["with attrs", '<form action=/x method="post"><form id="inner"></form></form>', true],
  ];
  let failed = 0;
  for (const [name, html, expectNested] of cases) {
    const got = hasNestedForms(html);
    if (got !== expectNested) {
      failed += 1;
      console.error(`✗ ${name}: expected nested=${expectNested}, got ${got}`);
    } else {
      console.log(`✓ ${name}`);
    }
  }
  process.exit(failed ? 1 : 0);
}
