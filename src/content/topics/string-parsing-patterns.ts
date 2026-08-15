import type { TopicContent } from "../types";

export const stringParsingPatterns: TopicContent = {
  quickSummary: [
    "Parsing questions are graded on **edge cases**, not on the loop: empty input, leading/trailing separators, lone signs, overflow, and embedded delimiters.",
    "Clamp integer overflow *before* it happens (`res > (INT_MAX - d) / 10`), never after — signed overflow is undefined behaviour in C++.",
    "A delimiter alone cannot make encoding reversible. Prefix each field with its **length** and jump over the payload instead of scanning it.",
  ],
  detailed: [
    "String parsing problems look trivial and are not. The scanning loop is five lines; the interview is about whether you enumerate the degenerate inputs before you write it. Every one of these problems has a short list of cases the interviewer is silently checking: empty string, only separators, separator at the start or end, a sign with no digits, values that exceed the type, and payload that contains the separator itself.\n\nKey insight: state your edge-case list out loud before coding. It is worth more than the implementation.",
    "## Recognition cue\n\nReach for this family when the input is **free-form text you must turn into structure** — split a line into fields, convert text to a number, serialise a list into one string and recover it, compress a run, or reorder words. There is no clever algorithm here; the pattern is a single left-to-right scan with an explicit cursor, plus a checklist.\n\nClassic problems: **String to Integer (atoi)**, **Encode and Decode Strings**, **String Compression**, **Reverse Words in a String**.",
    "## Integer parsing: the four phases and the clamp\n\natoi-style parsing is always the same four phases in order: skip leading whitespace, read an optional single sign, accumulate digits, stop at the first non-digit. Anything else is an immediate zero.\n\nThe clamp is the part that separates answers. You cannot compute `res * 10 + d` and then check whether it went negative — signed overflow is UB and the compiler is entitled to assume it never happens. Test **before** multiplying: if `res > (INT_MAX - d) / 10`, the next step would overflow, so saturate to `INT_MAX` or `INT_MIN` by sign and return.\n\nEdge cases they probe: `\"\"`, `\"   \"`, `\"+\"`, `\"-\"`, `\"+-2\"`, `\"words 9\"`, `\"  +0 123\"` (stops at the space, so 0), `\"00000012\"` (leading zeros are fine), and both overflow directions including exactly `-2147483648`. Time O(n), space O(1).",
    "## Encoding: why length prefixes and not delimiters\n\nIf you join strings with `#`, you cannot decode a list whose members contain `#`. Escaping works but needs care on the escape character itself. The clean answer is a **length prefix**: write `len` then a marker then the raw bytes, and on decode read digits up to the marker, then `substr` exactly `len` bytes and jump the cursor past them. The payload is never scanned, so its contents are irrelevant — it can contain the marker, newlines, anything.\n\nWarning: the decoder must jump by `len`, not search for the next marker. Searching reintroduces exactly the bug the length prefix was there to remove.\n\nEncode and decode are both O(total length) time and O(total length) space for the output.",
    "## Compression and in-place word reversal\n\nRun-length compression is a two-cursor scan: `i` marks the run start, `j` advances while the character repeats, emit `char + count`. Two traps — a count of 10 or more is multiple characters wide, and compression can make the string *longer*, so return the original when the compressed form is not shorter. O(n) time, O(n) space (O(1) extra if writing back in place).\n\nReversing words is the classic **reverse-twice** trick: reverse the entire string, then reverse each word back. Doing it in place also requires collapsing whitespace — skip runs of spaces, emit a single separator between words, and truncate at the end. O(n) time, O(1) extra space when the buffer is mutable.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Tokenising by delimiter, and atoi-style parsing with saturation",
      source: `// Split keeps empty fields, including a trailing one: "a,,b," -> ["a","","b",""].
vector<string> splitOn(const string& s, char delim) {
    vector<string> parts;
    string cur;
    for (char ch : s) {
        if (ch == delim) { parts.push_back(cur); cur.clear(); }
        else cur += ch;
    }
    parts.push_back(cur);              // flush the last field, even if empty
    return parts;
}
// Time O(n), space O(n). Note: "" yields one empty field, not zero fields.

int myAtoi(const string& s) {
    int i = 0, n = (int)s.size();
    while (i < n && s[i] == ' ') ++i;                  // 1. leading whitespace
    int sign = 1;
    if (i < n && (s[i] == '+' || s[i] == '-'))         // 2. at most ONE sign
        sign = (s[i++] == '-') ? -1 : 1;
    int res = 0;
    while (i < n && isdigit((unsigned char)s[i])) {    // 3. digits only, stop otherwise
        int d = s[i++] - '0';
        if (res > (INT_MAX - d) / 10)                  // 4. clamp BEFORE overflowing
            return sign == 1 ? INT_MAX : INT_MIN;
        res = res * 10 + d;
    }
    return sign * res;
}
// Time O(n), space O(1).
// Verified: "" -> 0, "+" -> 0, "-" -> 0, "words 9" -> 0, "   -042" -> -42,
// "  +0 123" -> 0, "4193 with words" -> 4193, "9999999999" -> 2147483647,
// "-9999999999" -> -2147483648, "-2147483648" -> -2147483648.`,
    },
    {
      language: "cpp",
      caption: "Length-prefixed encode/decode, run-length compression, in-place word reversal",
      source: `// Delimiter-only joining is NOT reversible. Prefix each field with its length.
string encode(const vector<string>& parts) {
    string out;
    for (const string& p : parts) { out += to_string(p.size()); out += '#'; out += p; }
    return out;
}

vector<string> decode(const string& s) {
    vector<string> out;
    int i = 0, n = (int)s.size();
    while (i < n) {
        int j = i;
        while (s[j] != '#') ++j;                 // '#' only ever ends a length header
        int len = stoi(s.substr(i, j - i));
        out.push_back(s.substr(j + 1, len));     // payload may contain '#' freely
        i = j + 1 + len;                         // JUMP past it — never scan the payload
    }
    return out;
}
// Both O(total length) time. Round-trips {"a#b", "", "3#xyz"} correctly.

string runLengthCompress(const string& s) {
    string out;
    for (size_t i = 0; i < s.size();) {
        size_t j = i;
        while (j < s.size() && s[j] == s[i]) ++j;
        out += s[i];
        out += to_string(j - i);                 // counts >= 10 are multi-char
        i = j;
    }
    return out.size() < s.size() ? out : s;      // compression can EXPAND — guard it
}
// "aabcccccaaa" -> "a2b1c5a3"; "abc" -> "abc" (unchanged). O(n) time, O(n) space.

string reverseWords(string s) {
    reverse(s.begin(), s.end());                 // reverse all, then each word back
    int n = (int)s.size(), w = 0;                // w = write cursor
    for (int i = 0; i < n;) {
        while (i < n && s[i] == ' ') ++i;        // collapse runs of spaces
        if (i == n) break;
        if (w) s[w++] = ' ';                     // exactly one separator between words
        int start = w;
        while (i < n && s[i] != ' ') s[w++] = s[i++];
        reverse(s.begin() + start, s.begin() + w);
    }
    s.resize(w);                                 // drop trailing garbage
    return s;
}
// "  the sky   is blue  " -> "blue is sky the"; "   " -> "". O(n) time, O(1) extra space.`,
    },
  ],
  cheatSheet: [
    "atoi order: skip spaces → one optional sign → digits → stop at first non-digit. Anything else is 0.",
    "Clamp before the multiply: `if (res > (INT_MAX - d) / 10) return sign > 0 ? INT_MAX : INT_MIN;` — never detect overflow after the fact.",
    "Encoding: length prefix + marker + raw bytes; decode by jumping `len` bytes. Delimiters alone break on embedded delimiters.",
    "RLE: counts ≥ 10 are multi-character, and the result can be longer than the input — return the original if so.",
    "Reverse words = reverse whole string, then reverse each word; collapse space runs with a write cursor. O(n) time, O(1) extra space.",
  ],
  interviewQA: [
    {
      q: "Implement atoi. Which edge cases do you handle, and how do you avoid overflow?",
      a: "Four phases in strict order: skip leading spaces, read at most one `+` or `-`, accumulate digits, and stop at the first non-digit. Anything that does not reach a digit returns 0 — that covers empty input, all-whitespace, a lone sign, `\"+-2\"`, and text before the number. Leading zeros are harmless, and a space in the middle terminates parsing, so `\"  +0 123\"` is 0, not 123. For overflow I check before the arithmetic rather than after: if `res > (INT_MAX - d) / 10`, then `res * 10 + d` would exceed `INT_MAX`, so I saturate immediately to `INT_MAX` or `INT_MIN` depending on the sign. Checking after the multiply is wrong in C++ because signed overflow is undefined behaviour — the compiler may optimise the check away entirely. Accumulating into a `long long` and comparing works on 64-bit targets but does not generalise to parsing a 64-bit value, so I prefer the pre-check. Note the asymmetry: `INT_MIN` has larger magnitude than `INT_MAX`, and the pre-check handles exactly `-2147483648` correctly since it saturates to the same value. O(n) time, O(1) space.",
      followUps: [
        "How would you parse into a 64-bit integer with the same guarantee?",
        "What changes if the spec allows other whitespace like tabs and newlines?",
      ],
    },
    {
      q: "Design an encode/decode pair for a list of arbitrary strings. Why is joining with a delimiter not enough?",
      a: "Because the payload is arbitrary, so any character I pick as a delimiter can also occur inside a string, and the decoder has no way to tell a separator from data. Escaping fixes it but adds a second problem — escaping the escape character — and makes the decode a character-by-character state machine. The robust design is a length prefix: for each field write its length in decimal, then a marker character, then the raw bytes. The decoder reads digits up to the first marker, converts them to `len`, takes exactly `len` bytes as the payload, and advances the cursor past them. The crucial property is that the decoder never inspects the payload, so the payload can contain the marker, newlines, or null bytes with no effect. The failure mode to avoid is decoding by searching for the next marker instead of jumping by `len` — that reintroduces exactly the bug the scheme was designed to remove. Both directions are O(total length) time and space. Empty strings round-trip correctly since a zero length is a valid header.",
      followUps: [
        "How would you make this format streamable over a socket?",
        "What would you change to support nested lists?",
      ],
    },
    {
      q: "Reverse the words in a string in place, and tell me what the tricky parts are.",
      a: "The trick is reverse-twice: reverse the entire buffer, which puts the words in the right order but each one spelled backwards, then reverse each word individually to fix it. That alone is O(n) time and O(1) extra space. The parts interviewers actually probe are whitespace handling. Input may have leading spaces, trailing spaces, and multiple spaces between words, and the output must have none of those — exactly one space between words and nothing at the ends. I handle it with a separate write cursor: skip any run of spaces, and if the write cursor is not at position zero emit a single space, then copy the word and reverse that slice. At the end I truncate the buffer to the write cursor to drop the leftover tail. Degenerate inputs to name: the empty string, a string of only spaces (both produce an empty result), and a single word with no spaces. If the language gives me immutable strings I would tokenise and join instead, which costs O(n) extra space.",
      followUps: [
        "How would you reverse the characters of each word but keep word order?",
        "What if the separator can be any whitespace character rather than a space?",
      ],
    },
  ],
  flashcards: [
    {
      front: "Safe integer overflow clamp in atoi",
      back: "Before the multiply: `if (res > (INT_MAX - d) / 10) return sign > 0 ? INT_MAX : INT_MIN;`. Checking after the multiply is UB in C++.",
    },
    {
      front: "Why a length prefix instead of a delimiter for encoding?",
      back: "The payload can contain any delimiter you pick. With `len + marker + bytes`, the decoder jumps `len` bytes and never inspects the payload, so embedded markers are harmless.",
    },
    {
      front: "Reverse words in a string",
      back: "Reverse the whole buffer, then reverse each word back. Collapse space runs with a write cursor and truncate at the end. O(n) time, O(1) extra space.",
    },
  ],
};
