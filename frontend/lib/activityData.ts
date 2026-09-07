export type PhonemeToken = {
  symbol: string;
  label: string;
  example: string;
  group: "Consonants" | "Vowels and Diphthongs";
};

export type CorpusWord = {
  english: string;
  phonemes: string[];
  difficulty: "3 phonemes" | "4 phonemes" | "5 phonemes";
};

export const phonemeKeyboard: PhonemeToken[] = [
  { symbol: "p", label: "P", example: "pin", group: "Consonants" },
  { symbol: "t", label: "T", example: "tap", group: "Consonants" },
  { symbol: "k", label: "K", example: "kite", group: "Consonants" },
  { symbol: "b", label: "B", example: "bed", group: "Consonants" },
  { symbol: "d", label: "D", example: "dog", group: "Consonants" },
  { symbol: "ɡ", label: "G", example: "gum", group: "Consonants" },
  { symbol: "n", label: "N", example: "net", group: "Consonants" },
  { symbol: "m", label: "M", example: "mat", group: "Consonants" },
  { symbol: "ŋ", label: "NG", example: "ring", group: "Consonants" },
  { symbol: "f", label: "F", example: "fan", group: "Consonants" },
  { symbol: "s", label: "S", example: "sun", group: "Consonants" },
  { symbol: "θ", label: "TH", example: "thin", group: "Consonants" },
  { symbol: "ʃ", label: "SH", example: "ship", group: "Consonants" },
  { symbol: "v", label: "V", example: "van", group: "Consonants" },
  { symbol: "z", label: "Z", example: "zip", group: "Consonants" },
  { symbol: "ð", label: "TH", example: "then", group: "Consonants" },
  { symbol: "ʒ", label: "ZH", example: "vision", group: "Consonants" },
  { symbol: "l", label: "L", example: "log", group: "Consonants" },
  { symbol: "ɹ", label: "R", example: "ring", group: "Consonants" },
  { symbol: "w", label: "W", example: "win", group: "Consonants" },
  { symbol: "j", label: "Y", example: "yes", group: "Consonants" },
  { symbol: "h", label: "H", example: "hat", group: "Consonants" },
  { symbol: "tʃ", label: "CH", example: "chin", group: "Consonants" },
  { symbol: "dʒ", label: "J", example: "jam", group: "Consonants" },
  { symbol: "iː", label: "EE", example: "street", group: "Vowels and Diphthongs" },
  { symbol: "ɪ", label: "I", example: "sit", group: "Vowels and Diphthongs" },
  { symbol: "e", label: "E", example: "bed", group: "Vowels and Diphthongs" },
  { symbol: "eː", label: "AIR", example: "care", group: "Vowels and Diphthongs" },
  { symbol: "æ", label: "A", example: "bad", group: "Vowels and Diphthongs" },
  { symbol: "ɐ", label: "U", example: "bud", group: "Vowels and Diphthongs" },
  { symbol: "ɐː", label: "AR", example: "bark", group: "Vowels and Diphthongs" },
  { symbol: "ɜː", label: "ER", example: "bird", group: "Vowels and Diphthongs" },
  { symbol: "ʉː", label: "OO", example: "boot", group: "Vowels and Diphthongs" },
  { symbol: "ɔ", label: "O", example: "log", group: "Vowels and Diphthongs" },
  { symbol: "oː", label: "OR", example: "fork", group: "Vowels and Diphthongs" },
  { symbol: "ʊ", label: "OO", example: "book", group: "Vowels and Diphthongs" },
  { symbol: "æɪ", label: "AI", example: "bait", group: "Vowels and Diphthongs" },
  { symbol: "ɑe", label: "I-E", example: "bike", group: "Vowels and Diphthongs" },
  { symbol: "oɪ", label: "OI", example: "boil", group: "Vowels and Diphthongs" },
  { symbol: "əʉ", label: "OA", example: "boat", group: "Vowels and Diphthongs" },
  { symbol: "æɔ", label: "OU", example: "cloud", group: "Vowels and Diphthongs" },
  { symbol: "ɪə", label: "EAR", example: "beard", group: "Vowels and Diphthongs" },
  { symbol: "ə", label: "A", example: "about", group: "Vowels and Diphthongs" },
];

export const corpusWords: CorpusWord[] = [
  { english: "bed", phonemes: ["b", "e", "d"], difficulty: "3 phonemes" },
  { english: "bid", phonemes: ["b", "ɪ", "d"], difficulty: "3 phonemes" },
  { english: "bad", phonemes: ["b", "æ", "d"], difficulty: "3 phonemes" },
  { english: "bud", phonemes: ["b", "ɐ", "d"], difficulty: "3 phonemes" },
  { english: "bird", phonemes: ["b", "ɜː", "d"], difficulty: "3 phonemes" },
  { english: "bark", phonemes: ["b", "ɐː", "k"], difficulty: "3 phonemes" },
  { english: "book", phonemes: ["b", "ʊ", "k"], difficulty: "3 phonemes" },
  { english: "boot", phonemes: ["b", "ʉː", "t"], difficulty: "3 phonemes" },
  { english: "boat", phonemes: ["b", "əʉ", "t"], difficulty: "3 phonemes" },
  { english: "bike", phonemes: ["b", "ɑe", "k"], difficulty: "3 phonemes" },
  { english: "bait", phonemes: ["b", "æɪ", "t"], difficulty: "3 phonemes" },
  { english: "boil", phonemes: ["b", "oɪ", "l"], difficulty: "3 phonemes" },
  { english: "beard", phonemes: ["b", "ɪə", "d"], difficulty: "3 phonemes" },
  { english: "choice", phonemes: ["tʃ", "oɪ", "s"], difficulty: "3 phonemes" },
  { english: "thin", phonemes: ["θ", "ɪ", "n"], difficulty: "3 phonemes" },
  { english: "then", phonemes: ["ð", "e", "n"], difficulty: "3 phonemes" },
  { english: "ship", phonemes: ["ʃ", "ɪ", "p"], difficulty: "3 phonemes" },
  { english: "chin", phonemes: ["tʃ", "ɪ", "n"], difficulty: "3 phonemes" },
  { english: "jam", phonemes: ["dʒ", "æ", "m"], difficulty: "3 phonemes" },
  { english: "yes", phonemes: ["j", "e", "s"], difficulty: "3 phonemes" },
  { english: "win", phonemes: ["w", "ɪ", "n"], difficulty: "3 phonemes" },
  { english: "ring", phonemes: ["ɹ", "ɪ", "ŋ"], difficulty: "3 phonemes" },
  { english: "log", phonemes: ["l", "ɔ", "ɡ"], difficulty: "3 phonemes" },
  { english: "fan", phonemes: ["f", "æ", "n"], difficulty: "3 phonemes" },
  { english: "van", phonemes: ["v", "æ", "n"], difficulty: "3 phonemes" },
  { english: "sun", phonemes: ["s", "ɐ", "n"], difficulty: "3 phonemes" },
  { english: "zip", phonemes: ["z", "ɪ", "p"], difficulty: "3 phonemes" },
  { english: "gum", phonemes: ["ɡ", "ɐ", "m"], difficulty: "3 phonemes" },
  { english: "hat", phonemes: ["h", "æ", "t"], difficulty: "3 phonemes" },
  { english: "fork", phonemes: ["f", "oː", "k"], difficulty: "3 phonemes" },
  { english: "stop", phonemes: ["s", "t", "ɔ", "p"], difficulty: "4 phonemes" },
  { english: "frog", phonemes: ["f", "ɹ", "ɔ", "ɡ"], difficulty: "4 phonemes" },
  { english: "clap", phonemes: ["k", "l", "æ", "p"], difficulty: "4 phonemes" },
  { english: "slip", phonemes: ["s", "l", "ɪ", "p"], difficulty: "4 phonemes" },
  { english: "drum", phonemes: ["d", "ɹ", "ɐ", "m"], difficulty: "4 phonemes" },
  { english: "grin", phonemes: ["ɡ", "ɹ", "ɪ", "n"], difficulty: "4 phonemes" },
  { english: "train", phonemes: ["t", "ɹ", "æɪ", "n"], difficulty: "4 phonemes" },
  { english: "cloud", phonemes: ["k", "l", "æɔ", "d"], difficulty: "4 phonemes" },
  { english: "snake", phonemes: ["s", "n", "æɪ", "k"], difficulty: "4 phonemes" },
  { english: "smile", phonemes: ["s", "m", "ɑe", "l"], difficulty: "4 phonemes" },
  { english: "milk", phonemes: ["m", "ɪ", "l", "k"], difficulty: "4 phonemes" },
  { english: "hand", phonemes: ["h", "æ", "n", "d"], difficulty: "4 phonemes" },
  { english: "tent", phonemes: ["t", "e", "n", "t"], difficulty: "4 phonemes" },
  { english: "jump", phonemes: ["dʒ", "ɐ", "m", "p"], difficulty: "4 phonemes" },
  { english: "lamp", phonemes: ["l", "æ", "m", "p"], difficulty: "4 phonemes" },
  { english: "bank", phonemes: ["b", "æ", "ŋ", "k"], difficulty: "4 phonemes" },
  { english: "stamp", phonemes: ["s", "t", "æ", "m", "p"], difficulty: "5 phonemes" },
  { english: "plant", phonemes: ["p", "l", "æ", "n", "t"], difficulty: "5 phonemes" },
  { english: "blank", phonemes: ["b", "l", "æ", "ŋ", "k"], difficulty: "5 phonemes" },
  { english: "grand", phonemes: ["ɡ", "ɹ", "æ", "n", "d"], difficulty: "5 phonemes" },
  { english: "twist", phonemes: ["t", "w", "ɪ", "s", "t"], difficulty: "5 phonemes" },
  { english: "shrimp", phonemes: ["ʃ", "ɹ", "ɪ", "m", "p"], difficulty: "5 phonemes" },
  { english: "splash", phonemes: ["s", "p", "l", "æ", "ʃ"], difficulty: "5 phonemes" },
  { english: "spring", phonemes: ["s", "p", "ɹ", "ɪ", "ŋ"], difficulty: "5 phonemes" },
  { english: "thrust", phonemes: ["θ", "ɹ", "ɐ", "s", "t"], difficulty: "5 phonemes" },
  { english: "sprout", phonemes: ["s", "p", "ɹ", "æɔ", "t"], difficulty: "5 phonemes" },
];

export const wordleActivity = {
  title: "HCE Phoneme Wordle",
  target: corpusWords.find((word) => word.english === "thin") ?? corpusWords[14],
  maxGuesses: 6,
};

export const wordSearchWords = corpusWords.filter((word) =>
  ["thin", "ship", "chin", "jam", "ring"].includes(word.english),
);

export function findPhoneme(symbol: string) {
  return phonemeKeyboard.find((phoneme) => phoneme.symbol === symbol);
}
