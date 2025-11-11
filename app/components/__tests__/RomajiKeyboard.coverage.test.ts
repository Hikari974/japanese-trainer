import * as fs from 'fs';
import * as path from 'path';

// ==========================================
// HELPER 1: Extract all syllables from keyboard
// ==========================================
function extractKeyboardSyllables(): string[] {
  // Base syllables (50 total)
  const baseSyllables = [
    ['', 'a', 'i', 'u', 'e', 'o'],
    ['k', 'ka', 'ki', 'ku', 'ke', 'ko'],
    ['s', 'sa', 'shi', 'su', 'se', 'so'],
    ['t', 'ta', 'chi', 'tsu', 'te', 'to'],
    ['', 'na', 'ni', 'nu', 'ne', 'no'],
    ['', 'ha', 'hi', 'fu', 'he', 'ho'],
    ['m', 'ma', 'mi', 'mu', 'me', 'mo'],
    ['', 'ya', 'yu', 'yo', '', ''],
    ['', 'ra', 'ri', 'ru', 're', 'ro'],
    ['', 'wa', 'wo', 'n', '', ''],
  ];

  // Dakuten + Handakuten combined (30 total)
  const dakutenHandakutenSyllables = [
    ['g', 'ga', 'gi', 'gu', 'ge', 'go'],
    ['z', 'za', 'ji', 'zu', 'ze', 'zo'],
    ['d', 'da', 'di', 'du', 'de', 'do'],
    ['b', 'ba', 'bi', 'bu', 'be', 'bo'],
    ['p', 'pa', 'pi', 'pu', 'pe', 'po'],
  ];

  // Yōon syllables (33 total)
  const yoonSyllables = [
    ['kya', 'kyu', 'kyo'],
    ['sha', 'shu', 'sho'],
    ['cha', 'chu', 'cho'],
    ['nya', 'nyu', 'nyo'],
    ['hya', 'hyu', 'hyo'],
    ['mya', 'myu', 'myo'],
    ['rya', 'ryu', 'ryo'],
    ['gya', 'gyu', 'gyo'],
    ['ja', 'ju', 'jo'],
    ['bya', 'byu', 'byo'],
    ['pya', 'pyu', 'pyo'],
  ];

  // Foreign katakana syllables (22 total)
  const foreignSyllables = [
    ['fa', 'fi', 'fe', 'fo'],
    ['wi', 'we', 'wo'],
    ['va', 'vi', 'vu', 've', 'vo'],
    ['ti', 'di', 'tu', 'du'],
    ['she', 'tsa', 'dyu', 'je'],
  ];

  // Flatten all arrays and filter out empty strings
  const allSyllables = [
    ...baseSyllables.flat(),
    ...dakutenHandakutenSyllables.flat(),
    ...yoonSyllables.flat(),
    ...foreignSyllables.flat(),
  ].filter((s) => s !== '');

  // Remove duplicates and sort by length (longest first for greedy matching)
  const uniqueSyllables = Array.from(new Set(allSyllables));
  return uniqueSyllables.sort((a, b) => b.length - a.length);
}

// ==========================================
// HELPER 2: Load all words from JSON files
// ==========================================
interface Word {
  id: number;
  kanji: string;
  kana: string;
  romaji: string;
  translations: { [key: string]: string };
  level: string;
}

interface WordsFile {
  level: string;
  version: string;
  words: Word[];
}

function isValidRomaji(romaji: string): boolean {
  // Valid romaji should only contain ASCII letters, numbers, spaces, and basic punctuation
  // Invalid: hiragana (ぁ-ゖ), katakana (ァ-ヴ), kanji
  const invalidChars = /[^\x00-\x7F]/g;  // Non-ASCII characters
  return !invalidChars.test(romaji);
}

function loadAllWords(): Word[] {
  const dataDir = path.join(__dirname, '../../data/words');
  const levels = ['n5', 'n4', 'n3', 'n2', 'n1'];
  const allWords: Word[] = [];
  let skippedCount = 0;

  for (const level of levels) {
    const filePath = path.join(dataDir, `${level}.json`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const wordsFile: WordsFile = JSON.parse(fileContent);

      // Filter out words with invalid romaji (containing non-ASCII characters)
      const validWords = wordsFile.words.filter((word) => {
        if (!isValidRomaji(word.romaji)) {
          skippedCount++;
          if (skippedCount <= 5) {
            console.warn(`  ⚠️  Skipped [${level.toUpperCase()}] ${word.kanji} - Invalid romaji: "${word.romaji}"`);
          }
          return false;
        }
        return true;
      });

      // Add level to each word for reporting
      validWords.forEach((word) => {
        word.level = level.toUpperCase();
      });

      allWords.push(...validWords);
    }
  }

  if (skippedCount > 0) {
    console.warn(`\n⚠️  Total skipped: ${skippedCount} words with invalid romaji\n`);
  }

  return allWords;
}

// ==========================================
// HELPER 3: Decompose romaji using greedy matching
// ==========================================
interface DecompositionResult {
  success: boolean;
  segments: string[];
  missing: string[];
  normalized: string;
}

function normalizeRomaji(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove spaces and punctuation that appear in some romaji
    .replace(/[\s,]/g, '')
    // Handle "jy" → "j" variants (joubu, ja, ju, jo)
    .replace(/jy([auo])/g, 'j$1')  // jya→ja, jyu→ju, jyo→jo
    .replace(/jy/g, 'j')            // jy→j (standalone)
    // Handle "chy" → "ch" variants (cha, chu, cho)
    .replace(/chy([auo])/g, 'ch$1') // chya→cha, chyu→chu, chyo→cho
    // Handle っち pattern: "cchi" → "tchi" (small tsu + chi)
    .replace(/cchi/g, 'tchi')
    .replace(/ccha/g, 'tcha')
    .replace(/ccho/g, 'tcho')
    .replace(/cchu/g, 'tchu')
    // Handle standard variants
    .replace(/si/g, 'shi')
    .replace(/ti/g, 'chi')
    .replace(/tu/g, 'tsu')
    // Handle "hu" → "fu" BUT NOT inside "chu" pattern
    // We do this by first protecting "chu" temporarily
    .replace(/chu/g, '\x00CHU\x00')   // Temporarily mark "chu"
    .replace(/hu/g, 'fu')              // Replace hu → fu
    .replace(/\x00CHU\x00/g, 'chu')   // Restore "chu"
    // Handle long vowels (ou → ou, uu → uu, etc.) - no change needed
    // Handle double consonants - they should already be in the romaji
    // e.g., "kitte" stays "kitte", "gakkou" stays "gakkou"
}

function decomposeRomaji(
  romaji: string,
  availableSyllables: string[]
): DecompositionResult {
  const normalized = normalizeRomaji(romaji);
  const segments: string[] = [];
  const missing: string[] = [];
  let remaining = normalized;

  // Greedy matching: try longest syllable first
  while (remaining.length > 0) {
    let matched = false;

    for (const syllable of availableSyllables) {
      if (remaining.startsWith(syllable)) {
        segments.push(syllable);
        remaining = remaining.slice(syllable.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Can't match - take first character as missing
      missing.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return {
    success: missing.length === 0,
    segments,
    missing,
    normalized,
  };
}

// ==========================================
// MAIN TEST
// ==========================================
describe('RomajiKeyboard Coverage', () => {
  it('should be able to type all words from data files', () => {
    // 1. Extract all syllables from keyboard
    const availableSyllables = extractKeyboardSyllables();
    console.log(`\n📊 Keyboard has ${availableSyllables.length} unique syllables available`);

    // 2. Load all words from JSON files
    const allWords = loadAllWords();
    console.log(`📚 Loaded ${allWords.length} words from data files`);

    // 3. Test decomposition for each word
    const results = allWords.map((word) => {
      const decomposed = decomposeRomaji(word.romaji, availableSyllables);
      return {
        level: word.level,
        kanji: word.kanji,
        kana: word.kana,
        romaji: word.romaji,
        normalized: decomposed.normalized,
        canType: decomposed.success,
        segments: decomposed.segments,
        missingSyllables: decomposed.missing,
      };
    });

    // 4. Analyze results
    const failures = results.filter((r) => !r.canType);
    const successes = results.filter((r) => r.canType);
    const coverage = ((successes.length / results.length) * 100).toFixed(2);

    // 5. Report by level
    console.log(`\n✅ Coverage: ${coverage}% (${successes.length}/${results.length} words)`);
    console.log('\n📊 Coverage by JLPT Level:');

    ['N5', 'N4', 'N3', 'N2', 'N1'].forEach((level) => {
      const levelWords = results.filter((r) => r.level === level);
      const levelSuccesses = levelWords.filter((r) => r.canType);
      const levelCoverage = levelWords.length > 0
        ? ((levelSuccesses.length / levelWords.length) * 100).toFixed(2)
        : '0.00';
      console.log(`  ${level}: ${levelCoverage}% (${levelSuccesses.length}/${levelWords.length})`);
    });

    // 6. Report failures in detail
    if (failures.length > 0) {
      console.log(`\n❌ ${failures.length} words cannot be typed:\n`);

      failures.slice(0, 20).forEach((failure) => {
        console.log(`  [${failure.level}] ${failure.kanji} (${failure.kana})`);
        console.log(`    Romaji: ${failure.romaji}`);
        console.log(`    Normalized: ${failure.normalized}`);
        console.log(`    Missing: [${failure.missingSyllables.join(', ')}]`);
        console.log(`    Matched segments: [${failure.segments.join(', ')}]\n`);
      });

      if (failures.length > 20) {
        console.log(`  ... and ${failures.length - 20} more failures\n`);
      }

      // Aggregate missing syllables
      const missingCounts = new Map<string, number>();
      failures.forEach((failure) => {
        failure.missingSyllables.forEach((syllable) => {
          missingCounts.set(syllable, (missingCounts.get(syllable) || 0) + 1);
        });
      });

      console.log('📉 Most common missing syllables:');
      const sortedMissing = Array.from(missingCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      sortedMissing.forEach(([syllable, count]) => {
        console.log(`  "${syllable}" - ${count} occurrences`);
      });
    } else {
      console.log('\n✅ All words can be typed with the current keyboard!');
    }

    // 7. Assert 100% coverage
    expect(failures).toHaveLength(0);
  });
});
