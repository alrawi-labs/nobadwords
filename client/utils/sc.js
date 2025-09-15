// scripts/checkTranslations.js
import fs from "fs";
import path from "path";

const SRC_DIR = path.join(process.cwd(), "client"); // Source code directory
const JSON_DIR = path.join(process.cwd(), "client/locales"); // JSON files directory
const LANG = "tr"; // Language to compare against

// Enhanced regex to capture more translation patterns
const translationRegexes = [
  /t\(\s*["']([^"']+)["']\s*\)/g,                    // t("key")
  /t\(\s*["']([^"']+)["']\s*,/g,                     // t("key", options)
  /i18n\.t\(\s*["']([^"']+)["']\s*\)/g,              // i18n.t("key")
  /useTranslation\(\).*?t\(\s*["']([^"']+)["']\s*\)/g // useTranslation hook
];

const foundKeys = new Set();

// 1️⃣ Enhanced function to scan all t("…") calls
function walkDir(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          walkDir(fullPath);
        }
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        const content = fs.readFileSync(fullPath, "utf8");
        
        // Apply all regex patterns
        translationRegexes.forEach(regex => {
          let match;
          while ((match = regex.exec(content))) {
            const key = match[1].trim();
            if (key) {
              foundKeys.add(key);
            }
          }
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
}

// 2️⃣ Enhanced JSON key loading with better error handling
function loadJsonKeys() {
  const jsonKeys = new Set();
  
  try {
    // Check for translation.json first
    const translationJsonPath = path.join(JSON_DIR, LANG, "translation.json");
    if (fs.existsSync(translationJsonPath)) {
      const jsonContent = JSON.parse(fs.readFileSync(translationJsonPath, "utf8"));
      extractAllKeys(jsonContent).forEach(key => jsonKeys.add(key));
    }
    
    // Also check for other common JSON file patterns
    const langDir = path.join(JSON_DIR, LANG);
    if (fs.existsSync(langDir)) {
      const jsonFiles = fs.readdirSync(langDir).filter(file => file.endsWith('.json'));
      
      jsonFiles.forEach(file => {
        if (file !== 'translation.json') {
          try {
            const filePath = path.join(langDir, file);
            const jsonContent = JSON.parse(fs.readFileSync(filePath, "utf8"));
            const namespace = path.parse(file).name;
            
            // Add keys with namespace prefix if it's not the main translation file
            extractAllKeys(jsonContent, namespace).forEach(key => jsonKeys.add(key));
          } catch (error) {
            console.warn(`Warning: Could not parse ${file}:`, error.message);
          }
        }
      });
    }
    
  } catch (error) {
    console.error("Error loading JSON keys:", error.message);
  }
  
  return Array.from(jsonKeys);
}

// 3️⃣ Improved recursive key extraction
function extractAllKeys(obj, prefix = "") {
  const keys = [];
  
  if (typeof obj !== 'object' || obj === null) {
    return keys;
  }
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursive case: nested object
      keys.push(...extractAllKeys(value, fullKey));
    } else {
      // Base case: primitive value or array
      keys.push(fullKey);
    }
  });
  
  return keys;
}

// 4️⃣ Enhanced comparison with detailed logging
function findMissingKeys() {
  console.log("🔍 Scanning source code for translation keys...");
  walkDir(SRC_DIR);
  
  console.log("📋 Loading JSON translation keys...");
  const jsonKeys = loadJsonKeys();
  const jsonKeySet = new Set(jsonKeys);
  
  console.log(`\n📊 Summary:`);
  console.log(`  • Found ${foundKeys.size} unique translation keys in source code`);
  console.log(`  • Found ${jsonKeys.length} keys in JSON files`);
  
  // Find missing keys
  const missingKeys = [...foundKeys].filter(key => !jsonKeySet.has(key));
  
  // Find unused keys (keys in JSON but not in code)
  const unusedKeys = jsonKeys.filter(key => !foundKeys.has(key));
  
  return { missingKeys, unusedKeys, foundKeys: [...foundKeys], jsonKeys };
}

// 5️⃣ Main execution with enhanced output
function main() {
  try {
    const { missingKeys, unusedKeys, foundKeys, jsonKeys } = findMissingKeys();
    
    // Output results
    console.log(`\n❌ Missing keys (in code but not in JSON): ${missingKeys.length}`);
    if (missingKeys.length > 0) {
      console.log("Missing keys:", missingKeys.slice(0, 10)); // Show first 10
      if (missingKeys.length > 10) {
        console.log(`... and ${missingKeys.length - 10} more`);
      }
    }
    
    console.log(`\n⚠️  Unused keys (in JSON but not in code): ${unusedKeys.length}`);
    if (unusedKeys.length > 0) {
      console.log("Unused keys:", unusedKeys.slice(0, 5)); // Show first 5
      if (unusedKeys.length > 5) {
        console.log(`... and ${unusedKeys.length - 5} more`);
      }
    }
    
    // Write missing keys to file
    const missingKeysPath = path.join(process.cwd(), "missing-keys.txt");
    fs.writeFileSync(missingKeysPath, missingKeys.join("\n"), "utf-8");
    
    // Write unused keys to file
    const unusedKeysPath = path.join(process.cwd(), "unused-keys.txt");
    fs.writeFileSync(unusedKeysPath, unusedKeys.join("\n"), "utf-8");
    
    // Write all found keys for debugging
    const allFoundKeysPath = path.join(process.cwd(), "found-keys.txt");
    fs.writeFileSync(allFoundKeysPath, foundKeys.sort().join("\n"), "utf-8");
    
    console.log(`\n📝 Results written to:`);
    console.log(`  • Missing keys: ${missingKeysPath}`);
    console.log(`  • Unused keys: ${unusedKeysPath}`);
    console.log(`  • All found keys: ${allFoundKeysPath}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
main();