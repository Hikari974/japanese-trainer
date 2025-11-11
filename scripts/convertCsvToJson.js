#!/usr/bin/env node

/**
 * Convert JLPT CSV files to JSON format
 *
 * Usage: node scripts/convertCsvToJson.js <csv-file> <level>
 * Example: node scripts/convertCsvToJson.js JLPT_N5_Test.csv N5
 *
 * CSV Format expected:
 * №,Kanji,Kana,Romaji,Traduction FR,Traduction EN
 * 1,～駅,～えき,eki,gare,station
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const csvFilePath = process.argv[2];
const level = process.argv[3];

if (!csvFilePath || !level) {
  console.error('❌ Usage: node convertCsvToJson.js <csv-file> <level>');
  console.error('   Example: node convertCsvToJson.js JLPT_N5_Test.csv N5');
  process.exit(1);
}

if (!['N5', 'N4', 'N3', 'N2', 'N1'].includes(level.toUpperCase())) {
  console.error(`❌ Invalid level: ${level}. Must be one of: N5, N4, N3, N2, N1`);
  process.exit(1);
}

const normalizedLevel = level.toUpperCase();

// Check if CSV file exists
if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ File not found: ${csvFilePath}`);
  process.exit(1);
}

// Read and parse CSV
console.log(`📖 Reading ${csvFilePath}...`);
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

if (lines.length < 2) {
  console.error('❌ CSV file must have at least a header and one data row');
  process.exit(1);
}

// Skip header (first line)
const dataLines = lines.slice(1);

// Parse each line
const words = dataLines.map((line, index) => {
  const values = line.split(',').map(v => v.trim());

  // Expected format: №,Kanji,Kana,Romaji,Traduction FR,Traduction EN
  if (values.length < 6) {
    console.warn(`⚠️  Line ${index + 2} has fewer than 6 columns, padding with empty strings`);
    while (values.length < 6) {
      values.push('');
    }
  }

  return {
    id: index + 1,
    kanji: values[1] || '',
    kana: values[2] || '',
    romaji: values[3] || '',
    translations: {
      fr: values[4] || '',
      en: values[5] || '',
    },
  };
});

// Create output structure
const output = {
  level: normalizedLevel,
  version: '1.0.0',
  words: words,
};

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'app', 'data', 'words');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

// Write JSON file
const outputPath = path.join(outputDir, `${normalizedLevel.toLowerCase()}.json`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`✅ Successfully created ${outputPath}`);
console.log(`📊 Total words: ${words.length}`);
console.log(`🎯 Level: ${normalizedLevel}`);
