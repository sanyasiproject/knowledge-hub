import type { TopicContent } from "../types";

export const numberSystems: TopicContent = {
  quickSummary: [
    "Computers represent all data in binary (base 2); octal (base 8) and hexadecimal (base 16) are compact human-readable encodings of binary where each octal digit maps to 3 bits and each hex digit maps to 4 bits.",
    "Signed integers use two's complement, which represents -x as the bitwise NOT of x plus 1, giving a single zero and an asymmetric range [-2^(n-1), 2^(n-1)-1] for n-bit integers.",
    "IEEE 754 floating-point encodes real numbers as (-1)^sign * 1.mantissa * 2^(exponent-bias), with special bit patterns for zero, infinity, NaN, and denormalized numbers near zero.",
    "Bitwise operations (AND, OR, XOR, NOT, shifts) execute in a single CPU cycle and underpin masks, flags, hashing, cryptography, and countless low-level optimizations.",
  ],
  detailed: [
    "A positional number system represents a value as a sum of digits times powers of a base (radix). In base b, the digit at position i (counting from 0 at the right) contributes d_i * b^i. Binary uses b=2 with digits {0,1}, octal uses b=8 with digits {0-7}, decimal uses b=10 with digits {0-9}, and hexadecimal uses b=16 with digits {0-9, A-F}. Converting between bases involves repeated division (integer part) and repeated multiplication (fractional part). Since 8=2^3 and 16=2^4, converting between binary and octal/hex is trivial: group bits in threes or fours.",
    "Two's complement is the universal scheme for signed integers in modern hardware. For an n-bit number, the most significant bit (MSB) has weight -2^(n-1) instead of +2^(n-1). To negate a value, flip all bits and add 1. This representation has a single zero (all bits 0), and the range is asymmetric: an 8-bit signed integer spans -128 to +127. Addition and subtraction use the same circuitry as unsigned arithmetic — the hardware simply reinterprets the result — which is why two's complement won over sign-magnitude and ones' complement.",
    "IEEE 754 single-precision (32-bit) uses 1 sign bit, 8 exponent bits (bias 127), and 23 mantissa bits. Double-precision (64-bit) uses 1+11+52. Normalized numbers have an implicit leading 1, so the effective mantissa is 24 or 53 bits. Special exponent values encode edge cases: exponent all-zeros with nonzero mantissa gives denormalized (subnormal) numbers that fill the gap between zero and the smallest normal float; exponent all-ones with zero mantissa is infinity; exponent all-ones with nonzero mantissa is NaN. Floating-point arithmetic is not associative: (a+b)+c may differ from a+(b+c) due to rounding.",
    "Bitwise operations work on individual bits of integers. AND (&) is used for masking — extracting specific bits. OR (|) sets bits. XOR (^) toggles bits and is its own inverse, making it useful in cryptography and swap-without-temp tricks. NOT (~) inverts all bits. Left shift (<<) multiplies by powers of 2; logical right shift (>>>) fills with zeros; arithmetic right shift (>>) preserves the sign bit. Combining these yields powerful idioms: x & (x-1) clears the lowest set bit, x & (-x) isolates it, and popcount counts set bits.",
    "Endianness determines the byte order of multi-byte values in memory. Big-endian stores the most significant byte at the lowest address (matching how humans write numbers left-to-right). Little-endian stores the least significant byte first, which simplifies hardware for addition (carry propagates from low to high address). x86/x64 architectures are little-endian; network protocols (TCP/IP) use big-endian (network byte order). Mixed-endian (bi-endian) architectures like ARM can operate in either mode. Byte-swap instructions (bswap, htonl/ntohl) convert between them.",
  ],
  deepDive: [
    "IEEE 754 rounding modes and error analysis are critical for numerical computing. The default mode is round-to-nearest-even (banker's rounding), which minimizes statistical bias. The machine epsilon for single precision is 2^-23 (about 1.19e-7), meaning any real number in the normal range can be represented with a relative error of at most epsilon/2. Catastrophic cancellation occurs when subtracting nearly equal numbers: the leading significant digits cancel, leaving only the rounding errors in the trailing digits. Kahan summation compensates for this by tracking a running error term, achieving nearly full precision when summing many floats.",
    "Two's complement arithmetic overflow is well-defined in hardware (it wraps modulo 2^n) but is undefined behavior in C/C++ for signed integers, which compilers exploit for optimization. For example, a compiler may assume x+1 > x always holds for signed x, eliminating overflow checks. In Java, signed overflow wraps predictably. Detecting overflow before it happens requires careful checks: for addition, overflow occurs when both operands have the same sign but the result has the opposite sign. Hardware provides overflow flags (OF on x86) that software can inspect.",
    "Floating-point representation of fractions leads to surprising results: 0.1 in binary is a repeating fraction (0.0001100110011...), so 0.1+0.2 does not equal 0.3 exactly. This has real consequences in financial software (use fixed-point or decimal types), physics simulations (accumulating errors over time steps), and equality comparisons (always use epsilon-based comparisons). The IEEE 754 standard also defines a total ordering that handles NaN comparisons, and fused multiply-add (FMA) instructions that compute a*b+c with a single rounding, improving both speed and accuracy.",
    "Bitwise tricks are extensively used in competitive programming, systems programming, and graphics. De Bruijn sequences can compute log2 of a power of 2 in O(1) using a lookup table with a multiply-and-shift. Bit-parallel algorithms process multiple characters simultaneously: checking if a 64-bit word contains a zero byte (the \"SWAR\" technique used in strlen) uses the expression ((v - 0x0101010101010101) & ~v & 0x8080808080808080). Gray code, where consecutive values differ by exactly one bit, is used in rotary encoders and error correction. XOR-linked lists store both prev and next pointers in a single XOR'd value, halving memory for doubly linked lists at the cost of readability.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Base conversion and two's complement utilities in C++",
      source: `// Base conversion and two's complement utilities.

#include <iostream>
#include <string>
#include <algorithm>
#include <cstdint>
#include <bitset>

// Convert non-negative integer n to given base (2-16)
std::string to_base(unsigned long n, int base) {
    if (n == 0) return "0";
    const char digits[] = "0123456789ABCDEF";
    std::string result;
    while (n > 0) {
        result.push_back(digits[n % base]);
        n /= base;
    }
    std::reverse(result.begin(), result.end());
    return result;
}

// Return two's complement representation of signed int n in given bit width
uint32_t twos_complement(int32_t n, int bits) {
    uint32_t mask = (1u << bits) - 1;
    if (n >= 0) return static_cast<uint32_t>(n) & mask;
    return (1u << bits) + static_cast<uint32_t>(n);
}

// Interpret unsigned val as a two's complement signed integer
int32_t from_twos_complement(uint32_t val, int bits) {
    // Check if MSB (sign bit) is set
    if (val & (1u << (bits - 1))) {
        return static_cast<int32_t>(val) - (1 << bits);
    }
    return static_cast<int32_t>(val);
}

int main() {
    // Base conversions
    std::cout << "255 in hex: " << to_base(255, 16) << std::endl;   // "FF"
    std::cout << "255 in bin: " << to_base(255, 2)  << std::endl;   // "11111111"
    std::cout << "255 in oct: " << to_base(255, 8)  << std::endl;   // "377"

    // Two's complement
    uint32_t tc = twos_complement(-1, 8);
    std::cout << "-1 in 8-bit two's complement: "
              << std::bitset<8>(tc) << std::endl;  // 11111111

    int32_t val = from_twos_complement(0b11111110, 8);
    std::cout << "0b11111110 as signed 8-bit: " << val << std::endl;  // -2

    // Additional: demonstrate negation via flip-and-add-1
    uint8_t pos = 5;           // 00000101
    uint8_t neg = ~pos + 1;    // 11111011 = -5
    std::cout << "Negate 5: " << std::bitset<8>(neg)
              << " = " << from_twos_complement(neg, 8) << std::endl;

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "IEEE 754 float dissection and common bitwise tricks in C++",
      source: `// Decompose IEEE 754 doubles and demonstrate common bitwise tricks.

#include <iostream>
#include <cstdint>
#include <cstring>
#include <bitset>
#include <iomanip>

// Decompose a 64-bit IEEE 754 double into sign, exponent, mantissa
struct FloatParts {
    int sign;
    int exponent_biased;
    int exponent_actual;  // -1 if denorm/zero
    uint64_t mantissa;
    bool is_denorm_or_zero;
};

FloatParts float_to_parts(double f) {
    uint64_t bits;
    std::memcpy(&bits, &f, sizeof(bits));

    FloatParts parts;
    parts.sign = (bits >> 63) & 1;
    parts.exponent_biased = (bits >> 52) & 0x7FF;
    parts.mantissa = bits & ((1ULL << 52) - 1);
    parts.is_denorm_or_zero = (parts.exponent_biased == 0);
    parts.exponent_actual = parts.is_denorm_or_zero ? -1
                            : parts.exponent_biased - 1023;
    return parts;
}

// Bitwise tricks
uint32_t lowest_set_bit(uint32_t x) {
    // Isolate the lowest set bit: 0b1010 -> 0b0010
    return x & (-x);
}

uint32_t clear_lowest_set_bit(uint32_t x) {
    // Clear the lowest set bit: 0b1010 -> 0b1000
    return x & (x - 1);
}

bool is_power_of_two(uint32_t x) {
    // Check if x is a power of 2 (x > 0)
    return x > 0 && (x & (x - 1)) == 0;
}

int count_set_bits(uint32_t x) {
    // Brian Kernighan's algorithm: O(number of set bits)
    int count = 0;
    while (x) {
        x &= x - 1;
        ++count;
    }
    return count;
}

int main() {
    // Dissect 0.1 as IEEE 754 double
    auto parts = float_to_parts(0.1);
    std::cout << "float_to_parts(0.1):" << std::endl;
    std::cout << "  sign: " << parts.sign << std::endl;
    std::cout << "  exponent (biased): " << parts.exponent_biased << std::endl;
    std::cout << "  exponent (actual): "
              << (parts.is_denorm_or_zero ? "denorm/zero"
                  : std::to_string(parts.exponent_actual)) << std::endl;
    std::cout << "  mantissa (hex): 0x" << std::hex << parts.mantissa
              << std::dec << std::endl;

    // Bitwise tricks
    std::cout << "\\nlowest set bit of 12 (0b"
              << std::bitset<8>(12) << "): "
              << lowest_set_bit(12) << std::endl;  // 4

    std::cout << "clear lowest set bit of 12: "
              << clear_lowest_set_bit(12) << " (0b"
              << std::bitset<8>(clear_lowest_set_bit(12)) << ")" << std::endl;  // 8

    std::cout << "is_power_of_two(16): "
              << (is_power_of_two(16) ? "true" : "false") << std::endl;
    std::cout << "is_power_of_two(15): "
              << (is_power_of_two(15) ? "true" : "false") << std::endl;

    std::cout << "popcount(255): "
              << count_set_bits(255) << std::endl;  // 8

    // Demonstrate 0.1 + 0.2 != 0.3
    std::cout << "\\n0.1 + 0.2 == 0.3? "
              << ((0.1 + 0.2 == 0.3) ? "true" : "false") << std::endl;
    std::cout << std::setprecision(20) << "0.1 + 0.2 = "
              << (0.1 + 0.2) << std::endl;

    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "IEEE 754 Single-Precision Layout",
      kind: "architecture",
      caption: "Bit layout of a 32-bit float: 1 sign bit, 8 exponent bits (bias 127), 23 mantissa bits with an implicit leading 1",
    },
    {
      title: "Two's Complement Number Line",
      kind: "state",
      caption: "Circular number line showing how n-bit two's complement wraps: 0 at top, positive values clockwise to 2^(n-1)-1, negative values counterclockwise from -1 down to -2^(n-1)",
    },
  ],
  animations: [
    {
      title: "Two's Complement Negation",
      steps: [
        { label: "Start with positive value", detail: "Take the 8-bit representation of +5: 00000101" },
        { label: "Flip all bits", detail: "Bitwise NOT: 11111010" },
        { label: "Add one", detail: "11111010 + 1 = 11111011, which is -5 in two's complement" },
        { label: "Verify by addition", detail: "00000101 + 11111011 = 100000000 (9 bits); discard carry -> 00000000 = 0, confirming 5 + (-5) = 0" },
        { label: "Check the MSB", detail: "MSB is 1, so the value is negative; weight of MSB is -128, remaining bits = 64+32+16+8+0+2+1 = 123, total = -128+123 = -5" },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "Sign-Magnitude", "One's Complement", "Two's Complement"],
    rows: [
      ["Zero representations", "Two (+0, -0)", "Two (+0, -0)", "One (only +0)"],
      ["Range (8-bit)", "-127 to +127", "-127 to +127", "-128 to +127"],
      ["Negation", "Flip sign bit", "Flip all bits", "Flip all bits, add 1"],
      ["Addition", "Needs sign check", "End-around carry", "Standard binary add"],
      ["Hardware complexity", "High (special cases)", "Medium", "Low (single adder)"],
      ["Modern usage", "IEEE 754 sign bit only", "Rarely used", "Universal for integers"],
    ],
  },
  interviewQA: [
    {
      q: "Why does two's complement have one more negative number than positive numbers?",
      a: "In n-bit two's complement, the MSB has weight -2^(n-1). When all other bits are 0, the value is -2^(n-1) (the most negative). When all other bits are 1, the value is -2^(n-1) + (2^(n-1)-1) = -1. Positive values range from 1 to 2^(n-1)-1, and 0 takes one pattern, leaving 2^(n-1) negative patterns but only 2^(n-1)-1 positive ones. This asymmetry means that negating the minimum value overflows.",
      followUps: [
        "What happens when you negate Integer.MIN_VALUE in Java?",
        "How does this asymmetry affect abs() implementations?",
      ],
    },
    {
      q: "Why is 0.1 + 0.2 not exactly 0.3 in floating-point?",
      a: "0.1 in binary is the repeating fraction 0.0001100110011..., which must be truncated to fit the 52-bit mantissa of a double. Similarly, 0.2 is 0.001100110011... truncated. When these rounded values are added, the rounding errors combine to produce 0.30000000000000004 rather than 0.3 exactly. This is inherent to binary floating-point, not a bug in any language.",
      followUps: [
        "How would you implement exact decimal arithmetic for financial applications?",
        "What is the machine epsilon for double precision and what does it guarantee?",
      ],
    },
    {
      q: "Explain x & (x-1) and give three applications.",
      a: "Subtracting 1 from x flips the lowest set bit and all bits below it (e.g., 1010000 - 1 = 1001111). ANDing with x clears the lowest set bit and everything below it, effectively turning off exactly the lowest set bit. Applications: (1) Check power of 2: x > 0 and x & (x-1) == 0 means only one bit is set. (2) Count set bits (Brian Kernighan's): loop x = x & (x-1) counting iterations until x == 0. (3) Find if n is of form 2^k - 1: n > 0 and n & (n+1) == 0.",
      followUps: [
        "How does x & (-x) isolate the lowest set bit and why does it work in two's complement?",
        "What is the fastest way to compute popcount on modern x86 hardware?",
      ],
    },
    {
      q: "What is endianness and when does it matter in practice?",
      a: "Endianness is the byte ordering of multi-byte values in memory. Big-endian puts the most significant byte at the lowest address; little-endian puts the least significant byte first. It matters when: (1) sending data over a network (TCP/IP mandates big-endian, so you must convert with htonl/ntohl), (2) reading binary file formats that specify a byte order, (3) casting between types (e.g., accessing a 32-bit int as an array of bytes), and (4) interfacing with hardware registers on a different-endian platform.",
      followUps: [
        "How do bi-endian architectures like ARM handle endianness?",
        "What tools or techniques detect endianness at compile time vs. runtime?",
      ],
    },
  ],
  followUps: [
    "How do fixed-point representations compare to floating-point for embedded systems?",
    "What is the relationship between Gray code and binary, and where is Gray code used?",
    "How do bitwise operations differ for signed vs. unsigned integers, especially right shifts?",
    "What are denormalized (subnormal) floats and why do they cause performance penalties on some hardware?",
  ],
  mcqs: [
    {
      q: "What is the two's complement representation of -1 in 8 bits?",
      options: ["10000001", "11111111", "11111110", "10000000"],
      answerIndex: 1,
      explanation: "Flipping all bits of 00000001 gives 11111110, then adding 1 gives 11111111. Alternatively, -1 = 256 - 1 = 255 = 11111111.",
    },
    {
      q: "In IEEE 754 single precision, what does an exponent field of all 1s and a mantissa of all 0s represent?",
      options: ["Zero", "The largest finite number", "Infinity", "NaN"],
      answerIndex: 2,
      explanation: "Exponent all-1s with zero mantissa is infinity (positive or negative depending on the sign bit). A nonzero mantissa with all-1s exponent is NaN.",
    },
    {
      q: "What does the expression n & (n - 1) evaluate to when n = 40 (binary 101000)?",
      options: ["32 (100000)", "8 (001000)", "39 (100111)", "0 (000000)"],
      answerIndex: 0,
      explanation: "n-1 = 39 = 100111. n & (n-1) = 101000 & 100111 = 100000 = 32. This clears the lowest set bit (bit 3).",
    },
    {
      q: "Which statement about big-endian and little-endian is correct?",
      options: [
        "Network byte order is little-endian",
        "x86 processors are big-endian",
        "Big-endian stores the most significant byte at the lowest memory address",
        "Endianness affects single-byte values",
      ],
      answerIndex: 2,
      explanation: "Big-endian stores the MSB first. Network byte order is big-endian. x86 is little-endian. Single-byte values have no byte-ordering issue.",
    },
    {
      q: "What is the decimal value of the hexadecimal number 0x1A3F?",
      options: ["6719", "6720", "6271", "10303"],
      answerIndex: 0,
      explanation: "1*16^3 + A*16^2 + 3*16 + F = 4096 + 2560 + 48 + 15 = 6719.",
    },
  ],
  exercises: [
    "Implement a function that converts a decimal number (including fractional parts) to its binary string representation with up to 32 bits of precision for the fraction.",
    "Write a program that detects the endianness of the current machine at runtime using pointer casting, and then manually byte-swaps a 32-bit integer.",
    "Implement Kahan summation to sum an array of floats and compare its accuracy against naive summation for a million random values between 0 and 1.",
    "Build a floating-point visualizer that takes a decimal number and displays its IEEE 754 double-precision sign, exponent, and mantissa in binary, then reconstructs the value from those components.",
  ],
  flashcards: [
    { front: "How do you convert binary to hexadecimal?", back: "Group binary digits into nibbles (4-bit groups) from the right, then map each nibble to its hex digit: 0000=0, 0001=1, ..., 1001=9, 1010=A, ..., 1111=F." },
    { front: "What is the bias in IEEE 754 single precision?", back: "127. The stored exponent = actual exponent + 127, so an exponent field of 127 means 2^0 = 1." },
    { front: "What does x ^ x equal for any integer x?", back: "0. XOR of any value with itself cancels all bits. This is used in the 'find the unique element' problem and register-clearing (xor eax, eax)." },
    { front: "What is the range of a 32-bit two's complement integer?", back: "-2,147,483,648 to 2,147,483,647 (-2^31 to 2^31 - 1)." },
    { front: "How does arithmetic right shift differ from logical right shift?", back: "Arithmetic right shift (>>) preserves the sign bit (fills with copies of MSB); logical right shift (>>>) fills with zeros. For negative numbers, >> keeps the value negative while >>> makes it positive." },
    { front: "What is a denormalized (subnormal) float?", back: "A float with exponent field = 0 and nonzero mantissa. It has no implicit leading 1 (the value is 0.mantissa * 2^(1-bias)), allowing gradual underflow near zero at the cost of reduced precision." },
    { front: "Why is XOR useful in cryptography?", back: "XOR is its own inverse (a ^ b ^ b = a), is balanced (each output bit has equal probability of 0 or 1 given random input), and preserves entropy. It forms the basis of one-time pads, stream ciphers, and Feistel networks." },
    { front: "What is the result of left-shifting an integer by k bits?", back: "Multiplication by 2^k (with potential overflow). Each left shift doubles the value. Bits shifted past the MSB are lost." },
  ],
  revisionNotes: [
    "Two's complement negation: flip bits, add 1. Only -0 maps to itself. MIN_VALUE negation overflows back to MIN_VALUE.",
    "IEEE 754 special values: exponent all-0 = zero/denorm; exponent all-1 + mantissa 0 = infinity; exponent all-1 + mantissa nonzero = NaN. NaN != NaN.",
    "Hex-to-binary is 1:4 mapping (each hex digit = 4 bits). Octal-to-binary is 1:3. This makes hex the standard for memory addresses.",
    "Key bit tricks: x & (x-1) clears lowest set bit; x & (-x) isolates lowest set bit; x ^ y swaps without temp (with three XORs); popcount via Kernighan's loop.",
    "Endianness only matters for multi-byte values. Network byte order = big-endian. x86 = little-endian. Always convert with htons/ntohs for portable network code.",
    "Floating-point comparison: never use == for computed floats. Use |a - b| < epsilon or relative epsilon. For ordering, be aware that NaN is unordered (all comparisons with NaN return false).",
  ],
  cheatSheet: [
    "Decimal to binary: repeatedly divide by 2, remainders (bottom-up) form the binary. Fraction: multiply by 2, integer parts (top-down) form the bits.",
    "Two's complement of n-bit x: -x = ~x + 1 = 2^n - x. Range: [-2^(n-1), 2^(n-1) - 1].",
    "IEEE 754 double: 1 sign + 11 exponent (bias 1023) + 52 mantissa. Precision: ~15-16 decimal digits. Epsilon: 2^-52.",
    "Bit manipulation cheat: set bit i: x | (1<<i). Clear bit i: x & ~(1<<i). Toggle bit i: x ^ (1<<i). Check bit i: (x >> i) & 1.",
    "Quick hex: 0xF = 15 = 1111b. 0xFF = 255. 0xFFFF = 65535. 0xFFFFFFFF = 4,294,967,295 = 2^32 - 1.",
    "Shifts: x << k = x * 2^k. x >> k (arithmetic) = floor(x / 2^k) for positive x, rounds toward -inf for negative.",
  ],
  resources: [
    { label: "Computer Systems: A Programmer's Perspective (CS:APP)", kind: "book", note: "Chapter 2 covers integer and floating-point representations in depth with extensive exercises" },
    { label: "IEEE 754 Standard Specification", kind: "docs", note: "The authoritative reference for floating-point arithmetic, including rounding modes and special values" },
    { label: "Bit Twiddling Hacks (Stanford)", kind: "article", note: "Comprehensive collection of bitwise tricks with correctness proofs — the definitive reference" },
    { label: "What Every Computer Scientist Should Know About Floating-Point Arithmetic (Goldberg)", kind: "paper", note: "Classic ACM paper explaining floating-point representation, rounding, and error analysis" },
    { label: "Ben Eater: Binary and Hexadecimal (YouTube)", kind: "video", note: "Visual hardware-level explanation of number systems with breadboard demonstrations" },
  ],
  glossary: [
    { term: "Radix", definition: "The base of a positional number system. Binary has radix 2, decimal has radix 10, hexadecimal has radix 16." },
    { term: "Two's complement", definition: "A signed integer encoding where the MSB has negative weight -2^(n-1). Negation is performed by inverting all bits and adding 1." },
    { term: "IEEE 754", definition: "The standard for floating-point arithmetic defining binary formats (single, double, etc.), rounding rules, special values (NaN, infinity), and required operations." },
    { term: "Mantissa (significand)", definition: "The fractional part of a floating-point number. In IEEE 754 normalized form, it has an implicit leading 1, giving 24 bits (single) or 53 bits (double) of precision." },
    { term: "Endianness", definition: "The byte ordering convention for multi-byte values in memory. Big-endian stores the MSB at the lowest address; little-endian stores the LSB first." },
    { term: "Machine epsilon", definition: "The smallest value e such that 1 + e is distinguishable from 1 in floating-point. For double precision, epsilon = 2^-52 (approximately 2.22e-16)." },
    { term: "Bitwise mask", definition: "A bit pattern used with AND, OR, or XOR to select, set, clear, or toggle specific bits in a value." },
    { term: "Denormalized number", definition: "A floating-point value with a zero exponent field and nonzero mantissa, representing numbers very close to zero with reduced precision (no implicit leading 1)." },
  ],
};
