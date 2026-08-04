export type PhonemeToken = {
  symbol: string;
  label: string;
  example: string;
};

export type WordleActivity = {
  title: string;
  difficulty: string;
  englishAnswer: string;
  phonemes: PhonemeToken[];
  hints: string[];
};

export type WordSearchWord = {
  english: string;
  phonemes: string;
  clue: string;
};

export const wordleActivity: WordleActivity = {
  title: "Initial TH Wordle",
  difficulty: "Beginner",
  englishAnswer: "thin",
  phonemes: [
    { symbol: "/θ/", label: "TH", example: "thin" },
    { symbol: "/ɪ/", label: "I", example: "sit" },
    { symbol: "/n/", label: "N", example: "net" },
  ],
  hints: [
    "The first sound is /θ/, represented by TH as in thin.",
    "The middle sound is /ɪ/, represented by I as in sit.",
    "The final sound is /n/, represented by N as in net.",
  ],
};

export const wordSearchWords: WordSearchWord[] = [
  { english: "thin", phonemes: "/θ/ /ɪ/ /n/", clue: "TH as in thin" },
  { english: "ship", phonemes: "/ʃ/ /ɪ/ /p/", clue: "SH as in ship" },
  { english: "chip", phonemes: "/tʃ/ /ɪ/ /p/", clue: "CH as in chip" },
  { english: "ring", phonemes: "/r/ /ɪ/ /ŋ/", clue: "NG as in ring" },
  { english: "fish", phonemes: "/f/ /ɪ/ /ʃ/", clue: "SH as in fish" },
];

export const wordSearchGrid = [
  ["T", "H", "I", "N", "R", "A", "M", "P"],
  ["B", "O", "K", "A", "I", "S", "H", "E"],
  ["S", "H", "I", "P", "N", "O", "L", "T"],
  ["C", "H", "I", "P", "G", "U", "A", "S"],
  ["F", "I", "S", "H", "E", "N", "T", "I"],
  ["D", "A", "R", "I", "N", "G", "O", "P"],
  ["L", "M", "O", "V", "A", "C", "K", "S"],
  ["P", "A", "T", "H", "Q", "I", "Z", "N"],
];
