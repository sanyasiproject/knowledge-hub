import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Length of Last Word",
      difficulty: "Easy",
      variation: "Token scan from the right, the template",
      link: "https://leetcode.com/problems/length-of-last-word/",
      question: [
        "Given a string s consisting of words and spaces, return the length of the last word in the string. A word is a maximal substring made of non-space characters. The string may have leading, trailing, and repeated spaces.",
        "Example 1:\nInput: s = 'Hello World'\nOutput: 5\nExplanation: The last word is 'World', of length 5.",
        "Example 2:\nInput: s = '   fly me   to   the moon  '\nOutput: 4\nExplanation: The trailing spaces are not part of any word, so the last word is 'moon'.",
        "Constraints:\n- 1 <= s.length <= 10^4\n- s consists of English letters and spaces\n- there is at least one word in s",
      ],
      code: `int lengthOfLastWord(string s) {
    int i = (int)s.size() - 1;
    while (i >= 0 && s[i] == ' ') i--;   // phase 1: eat the trailing separators
    int len = 0;
    while (i >= 0 && s[i] != ' ') {      // phase 2: consume exactly one token
        len++;
        i--;
    }
    return len;
}`,
      explanation: [
        "Every parsing problem in this family is the same two-phase loop: skip separators, then consume a token. Doing it right to left here means the first token you meet is the answer, so you never have to remember earlier ones.",
        "The loop bounds carry the whole correctness argument. Phase 1 leaves i either at -1 (string was all spaces) or on the last non-space character. Phase 2 then counts exactly the maximal run of non-spaces ending at that index, which is by definition the last word.",
        "The tempting wrong version is a single left-to-right pass that resets a counter on every space and returns the counter at the end. It returns 0 for any input with trailing spaces, because the last thing it saw was a separator, not a token. Splitting on whitespace also works but allocates the whole token list to use one element.",
        "Time: O(n) - and in practice only the length of the final word plus the trailing spaces. Space: O(1).",
      ],
    },
    {
      name: "Reverse Words in a String III",
      difficulty: "Easy",
      variation: "Reverse each token in place",
      link: "https://leetcode.com/problems/reverse-words-in-a-string-iii/",
      question: [
        "Given a string s, reverse the characters of each word while keeping the words in their original order and preserving the single spaces between them. The input has no leading or trailing spaces and words are separated by exactly one space.",
        "Example 1:\nInput: s = \"Let's take LeetCode contest\"\nOutput: \"s'teL ekat edoCteeL tsetnoc\"\nExplanation: Each word is reversed on its own; the word order is untouched.",
        "Example 2:\nInput: s = 'Mr Ding'\nOutput: 'rM gniD'",
        "Constraints:\n- 1 <= s.length <= 5 * 10^4\n- s contains printable ASCII characters\n- there are no leading or trailing spaces and no double spaces",
      ],
      code: `string reverseWords(string s) {
    int n = s.size();
    for (int i = 0; i < n; ) {
        int j = i;
        while (j < n && s[j] != ' ') j++;   // [i, j) is one token
        reverse(s.begin() + i, s.begin() + j);
        i = j + 1;                          // step over the single separator
    }
    return s;
}`,
      explanation: [
        "This is the canonical token-boundary loop: i marks the start of a token, j runs forward to the first separator or the end, so [i, j) is the token and j is where the separator sits. Everything you do to a token happens between those two indices.",
        "Because each word is reversed within its own half-open range, characters never cross a word boundary, so both the word order and the separator positions are preserved automatically - no rebuilding of the string is needed.",
        "The subtle part is advancing i to j + 1 rather than j. If you set i = j the loop spins forever on the space; j + 1 consumes the separator, and when j lands on n the value n + 1 simply fails the loop test.",
        "Time: O(n) - every index is visited by j once and moved by reverse at most once. Space: O(1) beyond the returned string, since the reversal is done in place.",
      ],
    },
    {
      name: "Reverse Words in a String",
      difficulty: "Medium",
      variation: "Tokenize, trim, and reverse word order",
      link: "https://leetcode.com/problems/reverse-words-in-a-string/",
      question: [
        "Given an input string s, reverse the order of the words. Words are maximal sequences of non-space characters. The result must contain the words in reverse order joined by exactly one space, with no leading or trailing spaces, even though the input may have leading, trailing, or repeated spaces.",
        "Example 1:\nInput: s = 'the sky is blue'\nOutput: 'blue is sky the'",
        "Example 2:\nInput: s = '  hello world  '\nOutput: 'world hello'\nExplanation: The extra leading and trailing spaces are dropped.",
        "Example 3:\nInput: s = 'a good   example'\nOutput: 'example good a'\nExplanation: The run of three spaces collapses to one.",
        "Constraints:\n- 1 <= s.length <= 10^4\n- s contains English letters, digits, and spaces\n- there is at least one word in s",
      ],
      code: `string reverseWords(string s) {
    reverse(s.begin(), s.end());          // step 1: global reverse puts words in the right order,
                                          // but every word is now spelled backwards
    int n = s.size(), write = 0;
    for (int i = 0; i < n; ) {
        while (i < n && s[i] == ' ') i++;  // skip a whole run of separators
        if (i == n) break;
        if (write) s[write++] = ' ';       // emit exactly one separator between tokens
        int start = write;
        while (i < n && s[i] != ' ') s[write++] = s[i++];
        reverse(s.begin() + start, s.begin() + write);   // step 2: un-reverse this word
    }
    s.resize(write);                       // drop the leftover tail
    return s;
}`,
      explanation: [
        "The reverse-the-whole-thing-then-reverse-each-part trick is the standard way to permute blocks without extra memory. Reversing the entire string reverses the sequence of words, which is exactly what is wanted, and also reverses the letters inside each word, which the second pass undoes.",
        "The compaction is a read pointer i and a write pointer write over the same buffer. write can never overtake i because a token is copied only after its separators have been consumed, so the output is never longer than the part of the input already read - that is what makes the in-place rewrite safe.",
        "Normalising the spaces is handled by inverting the responsibility: instead of copying separators from the input, the loop emits one space before every token except the first. The 'if (write)' test is what suppresses the leading space, and the final resize removes whatever stale characters remain past the compacted output.",
        "The tempting approach - split on whitespace into a vector, reverse it, then join - is fine and much shorter, but it costs O(n) auxiliary memory and still needs an explicit filter for the empty tokens produced by consecutive spaces.",
        "Time: O(n) - three linear touches of the buffer at most. Space: O(1) extra.",
      ],
    },
    {
      name: "String Compression",
      difficulty: "Medium",
      variation: "Run-length encoding, in place",
      link: "https://leetcode.com/problems/string-compression/",
      question: [
        "Given an array of characters chars, compress it in place using run-length encoding: for each group of consecutive repeating characters, write the character, and if the group length is greater than 1, write the decimal digits of that length after it. Groups of length 1 get no number. Return the length of the compressed prefix; the caller only reads chars[0..returned-1].",
        "Example 1:\nInput: chars = ['a','a','b','b','c','c','c']\nOutput: 6, with chars beginning ['a','2','b','2','c','3']\nExplanation: Three groups: 'aa' -> a2, 'bb' -> b2, 'ccc' -> c3.",
        "Example 2:\nInput: chars = ['a','b','b','b','b','b','b','b','b','b','b','b','b']\nOutput: 4, with chars beginning ['a','b','1','2']\nExplanation: The single 'a' gets no count; the run of twelve b's becomes 'b12', whose length is written as two separate digit characters.",
        "Constraints:\n- 1 <= chars.length <= 2000\n- chars[i] is a lowercase or uppercase English letter, a digit, or a symbol",
      ],
      code: `int compress(vector<char>& chars) {
    int n = chars.size(), write = 0;
    for (int i = 0; i < n; ) {
        char c = chars[i];
        int j = i;
        while (j < n && chars[j] == c) j++;   // [i, j) is one run
        chars[write++] = c;
        int cnt = j - i;
        if (cnt > 1)
            for (char d : to_string(cnt))     // a count of 12 costs two cells, not one
                chars[write++] = d;
        i = j;
    }
    return write;
}`,
      explanation: [
        "Same token loop as before, except the token is now a run of identical characters rather than a word. Grouping by equality with chars[i] guarantees the runs are maximal, which is required or 'aaa' could be emitted as 'a2a1'.",
        "The in-place write is safe by a counting argument: a run of length L is read from L cells and emits 1 + digits(L) cells, and 1 + digits(L) <= L for every L >= 1 except L = 1, where both are 1. So after processing each run write <= i, and the writer never clobbers a cell the reader still needs.",
        "The classic bug is treating the count as a single character - either by writing char('0' + cnt), which produces garbage for counts above 9, or by forgetting that a two-digit count occupies two array slots. Multi-digit counts must be spelled out digit by digit.",
        "Time: O(n). Space: O(1) extra, ignoring the few characters of the count string.",
      ],
    },
    {
      name: "Count and Say",
      difficulty: "Medium",
      variation: "Run-length encoding applied iteratively",
      link: "https://leetcode.com/problems/count-and-say/",
      question: [
        "The count-and-say sequence starts with countAndSay(1) = '1'. Each later term is produced by reading the previous term left to right, splitting it into runs of identical digits, and replacing each run by its length followed by the digit. Given n, return the n-th term.",
        "Example 1:\nInput: n = 4\nOutput: '1211'\nExplanation: '1' -> one 1 -> '11' -> two 1s -> '21' -> one 2, one 1 -> '1211'.",
        "Example 2:\nInput: n = 6\nOutput: '312211'\nExplanation: Continuing, '1211' -> '111221' -> '312211'.",
        "Constraints:\n- 1 <= n <= 30",
      ],
      code: `string countAndSay(int n) {
    string s = "1";
    for (int k = 2; k <= n; k++) {
        string t;
        for (int i = 0; i < (int)s.size(); ) {
            int j = i;
            while (j < (int)s.size() && s[j] == s[i]) j++;   // the run [i, j)
            t += to_string(j - i);   // count first,
            t += s[i];               // then the digit that was repeated
            i = j;
        }
        s = t;                       // the new term becomes the input to the next round
    }
    return s;
}`,
      explanation: [
        "This is the run-length encoder from the previous problem, with the order flipped to count-then-symbol, applied n-1 times with each output fed back in as the next input. There is no shortcut: the terms have no closed form, so you must actually iterate.",
        "The only real invariant to respect is that runs must be maximal and the scan must be a single left-to-right pass over the previous term. Re-scanning or merging across a boundary changes the sequence entirely.",
        "The trap is reading the digits as numbers. In '111221' the run of three 1s becomes '31', where the 3 is a count and the 1 is a symbol; if you ever add or compare these as integers you lose the distinction. Everything here is character work.",
        "Growth is roughly a factor of 1.3 per term (Conway's constant), so term 30 is only a few thousand characters and plain string concatenation is comfortably fast enough.",
        "Time: O(n * L) where L is the length of the longest term. Space: O(L) for the two terms held at once.",
      ],
    },
    {
      name: "Encode and Decode Strings",
      difficulty: "Medium",
      variation: "Length-prefix framing, no escaping",
      link: "https://leetcode.com/problems/encode-and-decode-strings/",
      question: [
        "Design an algorithm to serialise a list of strings into a single string, and another to deserialise that single string back into the original list. The strings may contain any characters, including whatever delimiter you pick, and empty strings must round-trip correctly. You may not use any built-in serialiser.",
        "Example 1:\nInput: strs = ['lint','code','love','you']\nEncoded: '4#lint4#code4#love3#you'\nOutput: ['lint','code','love','you']\nExplanation: Each string is written as its length, a '#', then its bytes.",
        "Example 2:\nInput: strs = ['we','say',':','yes','#3#']\nEncoded: '2#we3#say1#:3#yes3##3#'\nOutput: ['we','say',':','yes','#3#']\nExplanation: The payload '#3#' contains the delimiter, and it still decodes correctly because the reader jumps over it by length instead of searching for it.",
        "Constraints:\n- 1 <= strs.length <= 200\n- 0 <= strs[i].length <= 200\n- strs[i] contains any possible characters out of 256 valid ASCII characters",
      ],
      code: `class Codec {
public:
    string encode(vector<string>& strs) {
        string out;
        for (const string& s : strs) {
            out += to_string(s.size());
            out += '#';            // ends the length field, not the payload
            out += s;
        }
        return out;
    }

    vector<string> decode(string s) {
        vector<string> res;
        int i = 0, n = s.size();
        while (i < n) {
            int j = (int)s.find('#', i);       // first '#' at or after i closes the length
            int len = stoi(s.substr(i, j - i));
            res.push_back(s.substr(j + 1, len));
            i = j + 1 + len;                   // jump the payload wholesale
        }
        return res;
    }
};`,
      explanation: [
        "The insight is that a delimiter alone can never be safe, because any byte you choose can also appear in the data. Length prefixing sidesteps the problem: the reader learns how many bytes to take before it looks at them, so the payload is never scanned for structure.",
        "The '#' is only needed to mark where the decimal length stops. It is unambiguous because the length field is guaranteed to be digits, so the first '#' after position i cannot be part of it. Everything after that point is opaque for exactly len bytes.",
        "Empty strings round-trip for free: they encode as '0#' and substr with len = 0 yields the empty string. This is where most delimiter-and-split solutions break, since splitting collapses adjacent delimiters.",
        "The alternative is escaping - double every delimiter byte on write and un-double on read - which is correct but needs a character-by-character reader and inflates worst-case output. Length framing is what real wire formats use for the same reason.",
        "Time: O(total length) for both directions. Space: O(total length) for the encoded buffer or the decoded list.",
      ],
    },
    {
      name: "String to Integer (atoi)",
      difficulty: "Medium",
      variation: "Number parsing with overflow clamping",
      link: "https://leetcode.com/problems/string-to-integer-atoi/",
      question: [
        "Implement myAtoi(s), which converts a string to a 32-bit signed integer. Skip any leading spaces, then read an optional single '+' or '-' sign, then read as many consecutive digits as possible and stop at the first non-digit or the end of the string. If no digits were read the result is 0. If the value falls outside the range [-2147483648, 2147483647], clamp it to the nearer bound.",
        "Example 1:\nInput: s = '   -042'\nOutput: -42\nExplanation: Three spaces are skipped, the sign is read, and the leading zeros are harmless.",
        "Example 2:\nInput: s = 'words and 987'\nOutput: 0\nExplanation: The first non-space character is not a digit or a sign, so parsing stops immediately with no digits read.",
        "Example 3:\nInput: s = '-91283472332'\nOutput: -2147483648\nExplanation: The value underflows, so it is clamped to INT_MIN.",
        "Constraints:\n- 0 <= s.length <= 200\n- s consists of English letters, digits, spaces, '+', '-', and '.'",
      ],
      code: `int myAtoi(string s) {
    int i = 0, n = s.size();
    while (i < n && s[i] == ' ') i++;                 // phase 1: leading spaces
    int sign = 1;
    if (i < n && (s[i] == '+' || s[i] == '-'))        // phase 2: at most one sign
        sign = (s[i++] == '-') ? -1 : 1;
    long long val = 0;
    while (i < n && isdigit((unsigned char)s[i])) {   // phase 3: the digit run
        val = val * 10 + (s[i++] - '0');
        if (sign == 1 && val > INT_MAX) return INT_MAX;    // clamp the moment it is decided
        if (sign == -1 && -val < INT_MIN) return INT_MIN;
    }
    return (int)(sign * val);
}`,
      explanation: [
        "The specification is a three-phase parser and the code should read as one: separators, then an optional sign token, then a number token. Each phase advances i and never backtracks, which is why the whole thing is a single pass with no lookahead.",
        "Clamping has to happen inside the digit loop, not after it, because after it the value may already have overflowed. Accumulating into a long long and testing against INT_MAX each iteration keeps val bounded by about 2 * 10^10 - one extra digit past the limit - which is far inside the 64-bit range, so the check itself can never overflow.",
        "The negative bound is asymmetric: INT_MIN is -2147483648 while INT_MAX is 2147483647, so a magnitude of 2147483648 is legal for a negative number and illegal for a positive one. Testing the magnitude against 2147483647 for both signs gets the single most-negative input wrong.",
        "The trap on the parsing side is being permissive about the sign: '+-12' and '--6' must both give 0, so the sign is read at most once and any second sign character ends the digit phase before it starts. Likewise a space after the sign, as in '- 5', is not skipped.",
        "If overflow must be detected without a wider type, compare before multiplying: val > INT_MAX / 10, or val == INT_MAX / 10 with the next digit above 7.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Decode String",
      difficulty: "Medium",
      variation: "Nested bracket decoding with a stack",
      link: "https://leetcode.com/problems/decode-string/",
      question: [
        "Given an encoded string, return its decoded form. The encoding rule is k[encoded_string], meaning the bracketed string repeated exactly k times. k is a positive integer that may have several digits, the brackets are always well formed, and the encodings may be nested. The input contains no digits other than the repeat counts.",
        "Example 1:\nInput: s = '3[a]2[bc]'\nOutput: 'aaabcbc'",
        "Example 2:\nInput: s = '3[a2[c]]'\nOutput: 'accaccacc'\nExplanation: The inner block a2[c] decodes to 'acc', and the outer 3 repeats it three times.",
        "Example 3:\nInput: s = '2[abc]3[cd]ef'\nOutput: 'abcabccdcdcdef'",
        "Constraints:\n- 1 <= s.length <= 30\n- s consists of lowercase English letters, digits, and square brackets\n- 1 <= k <= 300 and the decoded output length is at most 10^5",
      ],
      code: `string decodeString(string s) {
    vector<string> strStack;   // the text built before each open bracket
    vector<int> numStack;      // the repeat count that owns each open bracket
    string cur;
    int num = 0;
    for (char c : s) {
        if (isdigit((unsigned char)c)) {
            num = num * 10 + (c - '0');        // counts can be multi-digit
        } else if (c == '[') {
            strStack.push_back(cur);           // suspend the outer context
            numStack.push_back(num);
            cur.clear();
            num = 0;
        } else if (c == ']') {
            int k = numStack.back(); numStack.pop_back();
            string prev = strStack.back(); strStack.pop_back();
            while (k--) prev += cur;           // expand this block into its parent
            cur = prev;
        } else {
            cur += c;
        }
    }
    return cur;
}`,
      explanation: [
        "The grammar is recursive, so the parser needs a stack. The state at any moment is: the text accumulated so far at the current nesting depth (cur), the count being read (num), and one saved (text, count) frame per open bracket. Nothing else is needed.",
        "The invariant that makes it work is that cur always holds the fully decoded text of the innermost unclosed block. On '[' you push the parent's partial text and reset, so cur belongs to the new block; on ']' cur is finished, so you multiply it and append it to the parent text you pop back. Depth is restored exactly, which is why arbitrary nesting is handled without special cases.",
        "Reading digits with num = num * 10 + d is the piece people get wrong under pressure - treating each digit as its own count turns '12[a]' into 'aa' repeated once. The count is a token, not a character.",
        "A recursive descent function decode(i) that consumes up to its matching ']' is the same algorithm using the call stack instead of an explicit one; the explicit version just avoids passing the index by reference.",
        "Time: O(total output length) - each output character is produced once and copied once per enclosing block, which is what the stated output bound covers. Space: O(output length) for the stack of partial strings.",
      ],
    },
    {
      name: "Basic Calculator II",
      difficulty: "Medium",
      variation: "Expression parsing with operator precedence",
      link: "https://leetcode.com/problems/basic-calculator-ii/",
      question: [
        "Given a string s representing a valid arithmetic expression, evaluate it and return the result. The expression contains non-negative integers and the operators '+', '-', '*', and '/', separated by optional spaces. There are no parentheses. Multiplication and division bind tighter than addition and subtraction, and integer division truncates toward zero.",
        "Example 1:\nInput: s = '3+2*2'\nOutput: 7\nExplanation: 2*2 is evaluated first, giving 3+4.",
        "Example 2:\nInput: s = ' 3+5 / 2 '\nOutput: 5\nExplanation: 5/2 truncates to 2, so the result is 3+2.",
        "Example 3:\nInput: s = '14-3/2'\nOutput: 13\nExplanation: 3/2 is 1, so the result is 14-1.",
        "Constraints:\n- 1 <= s.length <= 3 * 10^5\n- s consists of digits, '+', '-', '*', '/', and spaces\n- every intermediate value and the final answer fit in a 32-bit signed integer",
      ],
      code: `int calculate(string s) {
    long long result = 0;   // sum of the additive terms that are already final
    long long prev = 0;     // the current term, still open to * and /
    char op = '+';          // operator waiting to be applied to the next number
    int i = 0, n = s.size();
    while (i < n) {
        if (isspace((unsigned char)s[i])) { i++; continue; }
        if (isdigit((unsigned char)s[i])) {
            long long num = 0;
            while (i < n && isdigit((unsigned char)s[i]))
                num = num * 10 + (s[i++] - '0');
            if (op == '+')      { result += prev; prev = num; }   // close the old term
            else if (op == '-') { result += prev; prev = -num; }
            else if (op == '*') prev *= num;                      // extend the open term
            else                prev /= num;   // C++ truncates toward zero, as required
        } else {
            op = s[i++];
        }
    }
    return (int)(result + prev);   // flush the last term
}`,
      explanation: [
        "Precedence with only two levels does not need a general shunting-yard parser. Keep one pending high-precedence term, prev, and a running total of the terms already closed. A '*' or '/' modifies prev in place; a '+' or '-' means prev can never change again, so it is folded into result and a new term begins with the correct sign.",
        "That is exactly the precedence rule made concrete: the term is the unit that '*' and '/' operate on, and '+' and '-' only ever join finished terms. Because subtraction is stored as a negative term rather than as a pending operation, the final answer is a plain sum and needs no second pass.",
        "The last term is never followed by a '+' or '-', so it is still sitting in prev when the loop ends - forgetting the final result + prev is the most common bug here. Reading a multi-digit number as one token, rather than one digit at a time, is the other.",
        "Division must truncate toward zero, which is what C++ integer division does natively. Languages that floor instead (Python's //) need an explicit fix, and a term like -7/2 must give -3, not -4.",
        "The stack formulation - push numbers, and on '*' or '/' pop, combine, and push back, then sum the stack - is the same idea with prev spelled as the stack top.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Text Justification",
      difficulty: "Hard",
      variation: "Greedy line packing and space distribution",
      link: "https://leetcode.com/problems/text-justification/",
      question: [
        "Given an array of words and a width maxWidth, format the text so that each line has exactly maxWidth characters and is both left and right justified. Pack as many words as possible into each line, using at least one space between words. Distribute the extra spaces as evenly as possible, and where they cannot divide evenly the left-hand gaps take the larger share. The last line must be left justified with single spaces and padded on the right; a line holding a single word is treated the same way.",
        "Example 1:\nInput: words = ['This','is','an','example','of','text','justification.'], maxWidth = 16\nOutput: ['This    is    an', 'example  of text', 'justification.  ']\nExplanation: Line 1 holds 8 letters in 2 gaps, so 8 spaces split 4 and 4. Line 2 holds 13 letters in 2 gaps, so 3 spaces split 2 and 1 with the left gap larger. Line 3 is the last line, so it is left justified and padded.",
        "Example 2:\nInput: words = ['What','must','be','acknowledgment','shall','be'], maxWidth = 16\nOutput: ['What   must   be', 'acknowledgment  ', 'shall be        ']\nExplanation: 'acknowledgment' is 14 characters and cannot share its line, so it is left justified and padded even though it is not the last line.",
        "Constraints:\n- 1 <= words.length <= 300\n- 1 <= words[i].length <= 20\n- words[i] consists of only English letters and symbols\n- 1 <= maxWidth <= 100 and words[i].length <= maxWidth",
      ],
      code: `vector<string> fullJustify(vector<string>& words, int maxWidth) {
    vector<string> res;
    int n = words.size(), i = 0;
    while (i < n) {
        int j = i, lettersLen = 0;
        // greedy fill: words[i..j-1] plus one mandatory space per existing gap must fit
        while (j < n && lettersLen + (int)words[j].size() + (j - i) <= maxWidth) {
            lettersLen += words[j].size();
            j++;
        }
        int gaps = j - i - 1;
        string line;
        if (j == n || gaps == 0) {               // last line, or a lone oversized word
            for (int k = i; k < j; k++) {
                if (k > i) line += ' ';
                line += words[k];
            }
            line += string(maxWidth - (int)line.size(), ' ');
        } else {
            int spaces = maxWidth - lettersLen;
            int base = spaces / gaps, extra = spaces % gaps;   // leftmost 'extra' gaps get one more
            for (int k = i; k < j; k++) {
                line += words[k];
                if (k < j - 1) line += string(base + (k - i < extra ? 1 : 0), ' ');
            }
        }
        res.push_back(line);
        i = j;
    }
    return res;
}`,
      explanation: [
        "Two independent decisions: which words go on a line, and how the spaces inside that line are spread. The first is forced by the statement - pack greedily - so no optimisation or DP is involved, unlike the balanced word-wrap problem where line badness is minimised.",
        "The fit test is the part worth deriving. If words[i..j-1] are already placed, adding words[j] introduces one more gap, so the minimum width becomes lettersLen + words[j].size() + (j - i), where j - i counts the gaps after the addition. Writing the space count as the number of words minus one is the usual off-by-one here.",
        "Space distribution is integer division with the remainder pushed left: with gaps gaps and spaces spaces to place, every gap gets spaces / gaps and the first spaces % gaps gaps get one extra. Since base * gaps + extra = spaces exactly, the line width is exactly maxWidth by construction - no final padding is needed on a justified line.",
        "Both exceptional cases collapse into one branch because they want the same output: single spaces, then right padding. The last line is stated as an exception, and a line with gaps == 0 has nowhere to put extra spaces, so it must pad too. Dividing by gaps without that guard is a division by zero.",
        "Time: O(total output size), which is the number of lines times maxWidth. Space: O(total output size) for the result.",
      ],
    },
    {
      name: "Basic Calculator",
      difficulty: "Hard",
      variation: "Parentheses and sign propagation with a stack",
      link: "https://leetcode.com/problems/basic-calculator/",
      question: [
        "Given a string s representing a valid expression, evaluate it and return its value. The expression contains non-negative integers, '+', '-', '(', ')', and spaces. Parentheses may nest arbitrarily and '-' may also appear as a unary operator, as in '-(2+3)'. You may not use any built-in expression evaluator.",
        "Example 1:\nInput: s = ' 2-1 + 2'\nOutput: 3",
        "Example 2:\nInput: s = '(1+(4+5+2)-3)+(6+8)'\nOutput: 23\nExplanation: The inner group is 11, so the first group is 1+11-3 = 9, and the second group is 14.",
        "Example 3:\nInput: s = '2-(5-6)'\nOutput: 3\nExplanation: The group evaluates to -1, and subtracting it adds 1.",
        "Constraints:\n- 1 <= s.length <= 3 * 10^5\n- s consists of digits, '+', '-', '(', ')', and spaces\n- s represents a valid expression and the answer fits in a 32-bit signed integer",
      ],
      code: `int calculate(string s) {
    long long result = 0, num = 0;
    int sign = 1;                          // sign applying to the number being read
    vector<pair<long long,int>> st;        // (partial result, sign in front of the '(')
    for (char c : s) {
        if (isdigit((unsigned char)c)) {
            num = num * 10 + (c - '0');
        } else if (c == '+' || c == '-') {
            result += sign * num;          // the previous term is now final
            num = 0;
            sign = (c == '+') ? 1 : -1;
        } else if (c == '(') {
            st.push_back({result, sign});  // suspend the outer expression
            result = 0;
            sign = 1;                      // inside the group, start positive
        } else if (c == ')') {
            result += sign * num;          // close the group
            num = 0;
            auto [outer, outerSign] = st.back(); st.pop_back();
            result = outer + outerSign * result;   // fold the group into its parent
            sign = 1;
        }
        // spaces need no handling at all
    }
    return (int)(result + sign * num);     // flush the trailing term
}`,
      explanation: [
        "With no '*' or '/' the expression is a signed sum, so the running state is just (result, sign, num): the total of the finished terms, the sign that will be applied to the number currently being read, and the digits of that number.",
        "Parentheses turn the flat sum into a recursive one, and the stack holds exactly what a recursive call would: the parent's partial result and the sign that sat in front of the '('. On ')' the group's own total is complete, so multiplying it by that saved sign and adding it to the saved result restores the parent's state precisely. This is what makes '2-(5-6)' come out as 3 rather than 7.",
        "Unary minus needs no special case. A '-' with no number before it applies sign = -1 to a num that is still 0, contributing nothing, and then correctly signs whatever comes next - a number or a whole parenthesised group.",
        "The tempting shortcut is to distribute a minus over a group by flipping a single global sign flag until the ')' is seen. That breaks as soon as groups nest, because two nested negations must cancel; only a per-depth saved sign gets that right.",
        "As in the other calculator, the final term has no operator after it, so the trailing result + sign * num is mandatory. Alternatively, appending a '+' sentinel to the input removes that special case.",
        "Time: O(n). Space: O(d) for nesting depth d, worst case O(n).",
      ],
    },
    {
      name: "Valid Number",
      difficulty: "Hard",
      variation: "Grammar validation as a state machine",
      link: "https://leetcode.com/problems/valid-number/",
      question: [
        "Given a string s, decide whether it is a valid number. A valid number is an optional sign, followed by either an integer (at least one digit) or a decimal (digits with a dot, where digits may be missing on one side but not both), optionally followed by 'e' or 'E' and then a signed integer with at least one digit. No other characters and no leading or trailing whitespace are allowed.",
        "Example 1:\nInput: s = '2e10'\nOutput: true\nExplanation: Mantissa '2', exponent '10'.",
        "Example 2:\nInput: s = '46.e3'\nOutput: true\nExplanation: A decimal may omit the digits after the dot as long as it has digits before it.",
        "Example 3:\nInput: s = '99e2.5'\nOutput: false\nExplanation: The exponent must be an integer, so the '.' after the exponent digits is trailing garbage.",
        "Example 4:\nInput: s = '.'\nOutput: false\nExplanation: A dot with no digits on either side has no mantissa.",
        "Constraints:\n- 1 <= s.length <= 20\n- s consists of only English letters (both cases), digits, '+', '-', and '.'",
      ],
      code: `bool isNumber(string s) {
    int i = 0, n = s.size();
    auto skipSign = [&]() {
        if (i < n && (s[i] == '+' || s[i] == '-')) i++;
    };
    auto skipDigits = [&]() {          // returns how many digits were consumed
        int c = 0;
        while (i < n && isdigit((unsigned char)s[i])) { i++; c++; }
        return c;
    };

    skipSign();
    int intDigits = skipDigits();
    int fracDigits = 0;
    if (i < n && s[i] == '.') {
        i++;
        fracDigits = skipDigits();
    }
    if (intDigits + fracDigits == 0) return false;   // mantissa needs a digit somewhere
    if (i < n && (s[i] == 'e' || s[i] == 'E')) {
        i++;
        skipSign();
        if (skipDigits() == 0) return false;         // exponent must be a non-empty integer
    }
    return i == n;                                   // nothing left over
}`,
      explanation: [
        "Written out, the grammar is number := sign? mantissa (('e'|'E') sign? digits)? with mantissa := digits ('.' digits?) | '.' digits. Recursive descent over that grammar beats an ad-hoc pile of boolean flags, because each rule becomes one line and the acceptance condition is simply that the cursor reached the end.",
        "The single condition that ties the two mantissa shapes together is intDigits + fracDigits >= 1. That one test accepts '3.', '.5', and '3.5' while rejecting '.' and the empty mantissa, with no case analysis on where the dot sits.",
        "Returning i == n at the end is what rejects trailing garbage such as '99e2.5' or '1 '. A validator that only checks the characters it does consume will accept anything with a valid prefix, which is the most common failure mode on this problem.",
        "The exponent is deliberately stricter than the mantissa: it may carry a sign but no dot and it must have at least one digit, so '1e', '1e+', and '1e2.5' all fail. Meanwhile a second sign anywhere, as in '-+3', fails because skipSign consumes at most one character and the leftover sign is not a digit.",
        "The alternative is an explicit DFA with a transition table over the character classes. It is faster to run and much harder to get right by hand; the grammar version is the one to reach for in an interview.",
        "Time: O(n) - a single left-to-right pass with no backtracking. Space: O(1).",
      ],
    },
  ],
};
