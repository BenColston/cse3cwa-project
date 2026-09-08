import type { ApiWordList } from "@/lib/apiClient";
import type { CorpusWord } from "@/lib/activityData";

export function difficultyForPhonemeCount(
  count: number,
): CorpusWord["difficulty"] {
  if (count <= 3) {
    return "3 phonemes";
  }

  if (count === 4) {
    return "4 phonemes";
  }

  return "5 phonemes";
}

export function wordListToCorpusWords(wordList: ApiWordList): CorpusWord[] {
  return wordList.words.map((word) => ({
    english: word.word,
    phonemes: word.phonemes,
    difficulty: difficultyForPhonemeCount(word.phonemes.length),
  }));
}
