const fs = require("fs");
const path = require("path");

function walk(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...walk(full));
    else if (f.name.endsWith(".tsx") || f.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

// Rupee sign U+20B9
const RUPEE = "\u20B9";
// Middle dot artifact
const MIDDOT = "\u00C2\u00B7";
// En dash
const ENDASH = "\u2013";
// Em dash  
const EMDASH = "\u2014";
// Smart apostrophe
const RSQUO = "\u2019";
// Garbled sequences that appear as visible mojibake
const garbled = [
  ["\u00e2\u0082\u00b9", "Rs."],  // rupee mojibake
  ["\u00c2\u00b7", " - "],        // middle dot mojibake
  ["\u00e2\u0080\u0093", "-"],    // en-dash mojibake
  ["\u00e2\u0080\u0099", "'"],    // apostrophe mojibake
];

let total = 0;
for (const file of walk("./src")) {
  const orig = fs.readFileSync(file, "utf8");
  let text = orig;
  
  text = text.split(RUPEE).join("Rs.");
  text = text.split(ENDASH).join("-");
  text = text.split(EMDASH).join("-");
  text = text.split(RSQUO).join("'");
  
  for (const [from, to] of garbled) {
    text = text.split(from).join(to);
  }
  
  if (text !== orig) {
    fs.writeFileSync(file, text, "utf8");
    console.log("Fixed:", path.basename(file));
    total++;
  }
}
console.log("Done. Fixed:", total, "files");
