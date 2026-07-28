// Types for tokenize.mjs — see that file for why the implementation is plain JS.

/** Stamped into search-index.json; getIndex() rejects an index that disagrees. */
export declare const INDEX_VERSION: number;
export declare const MIN_TOKEN_LENGTH: number;
export declare const STOP_WORDS: Set<string>;
/** Stop words tested against the raw word only, never against a stem. */
export declare const PRE_STEM_STOP_WORDS: Set<string>;
export declare function stem(word: string): string;
export declare function normalizeText(text: string): string;
export declare function tokenize(text: string): string[];
