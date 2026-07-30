import type { TopicContent } from "../types";

export const linuxShell: TopicContent = {
  quickSummary: [
    "The Unix shell is both an interactive command interpreter and a scripting language — bash (Bourne Again Shell) is the most widely used, with zsh and fish as popular alternatives.",
    "Pipes (`|`) connect the stdout of one command to the stdin of another, enabling powerful data processing chains like `cat access.log | grep 404 | awk '{print $7}' | sort | uniq -c | sort -rn`.",
    "Redirects control where input and output flow: `>` writes stdout to a file, `>>` appends, `2>` redirects stderr, `<` reads stdin from a file, and `2>&1` merges stderr into stdout.",
    "grep, sed, and awk are the essential text-processing trio: grep filters lines by pattern, sed transforms text with substitutions, and awk processes structured columnar data.",
    "Shell expansion (brace, tilde, variable, command substitution, globbing) transforms commands before execution, making the shell a powerful expression language.",
  ],
  detailed: [
    "## Shell Fundamentals\n\nA shell is a program that reads commands, interprets them, and executes them. When you type `ls -la /tmp`, the shell parses the command name (`ls`), the options (`-la`), and the argument (`/tmp`), then forks a child process to execute the program. Bash scripts start with `#!/bin/bash` (the shebang line) and support variables (`name=\"world\"`), conditionals (`if [ -f file ]; then ... fi`), loops (`for f in *.txt; do ... done`), functions, arrays, and arithmetic. Key concepts: exit codes (0 = success, non-zero = failure), `$?` (last exit code), `&&` (run next only if previous succeeded), `||` (run next only if previous failed).",

    "## Pipes and Composition\n\nThe Unix philosophy — programs that do one thing well and communicate via text streams — is implemented through pipes. The pipe operator `|` connects stdout of the left command to stdin of the right. This enables composition: `find . -name '*.py' | xargs grep 'import os' | wc -l` finds Python files, searches for a pattern, and counts matches — three simple tools combined into a powerful query. Named pipes (FIFOs) and process substitution (`<(command)`) extend this model. The `tee` command duplicates a stream, sending it to both a file and the next pipe stage: `make 2>&1 | tee build.log`.",

    "## Redirections\n\nEvery process has three standard file descriptors: stdin (0), stdout (1), stderr (2). Redirection operators control where these streams go. `command > file` writes stdout to a file (overwrite). `command >> file` appends. `command 2> errors.log` sends stderr to a file. `command > out.log 2>&1` merges stderr into stdout then writes both to a file. `command < input.txt` reads stdin from a file. Here-documents (`<<EOF ... EOF`) provide inline multi-line input. Here-strings (`<<<\"text\"`) pass a string as stdin. `/dev/null` is the black hole — `command > /dev/null 2>&1` silences all output.",

    "## grep, sed, and awk\n\n**grep** filters lines matching a pattern: `grep -r 'TODO' src/` recursively searches, `grep -E 'error|warning' log.txt` uses extended regex, `grep -c` counts matches, `grep -v` inverts the match. **sed** is a stream editor: `sed 's/old/new/g' file` replaces text, `sed -n '10,20p' file` prints specific lines, `sed -i '.bak' 's/foo/bar/g' file` edits in-place with backup. **awk** processes columnar data: `awk '{print $1, $3}' file` prints columns 1 and 3, `awk -F: '{print $1}' /etc/passwd` uses `:` as delimiter, `awk '$3 > 100 {sum += $3} END {print sum}'` filters and aggregates. These three tools handle the vast majority of text-processing tasks in the shell.",

    "## Shell Expansion\n\nBefore executing a command, bash performs several expansion phases. **Brace expansion**: `file{1,2,3}.txt` becomes `file1.txt file2.txt file3.txt`; `{a..z}` generates a letter sequence. **Tilde expansion**: `~` becomes `$HOME`, `~user` becomes that user's home. **Variable expansion**: `$VAR` or `${VAR}` substitutes the variable's value; `${VAR:-default}` provides a default. **Command substitution**: `$(command)` or backticks replace with the command's output. **Arithmetic expansion**: `$((x + 1))` evaluates math. **Globbing**: `*` matches any characters, `?` matches one, `[abc]` matches a set. Understanding expansion order prevents bugs — always quote variables (`\"$VAR\"`) to prevent word splitting and globbing.",

    "## Practical Bash Scripting\n\nRobust scripts start with `set -euo pipefail`: `-e` exits on any error, `-u` treats unset variables as errors, `-o pipefail` fails the pipe if any command in it fails. Use functions to organize logic. Trap signals for cleanup: `trap 'rm -f $tmpfile' EXIT`. Parse arguments with `getopts` or positional parameters. Use `mktemp` for temporary files instead of hardcoded paths. Always quote variables. Prefer `[[ ]]` over `[ ]` for conditionals (safer, supports regex). Use `shellcheck` to lint scripts — it catches quoting bugs, deprecated syntax, and common pitfalls. For complex tasks, consider switching to Python or another language; bash excels at gluing commands together but struggles with data structures, error handling, and maintainability.",
  ],
  interviewQA: [
    {
      q: "What does `set -euo pipefail` do in a bash script?",
      a: "`-e` causes the script to exit immediately if any command returns a non-zero exit code. `-u` treats references to unset variables as errors instead of silently expanding to empty strings. `-o pipefail` changes pipe behavior so the pipe's exit code is the rightmost command that failed (rather than always using the last command's exit code). Together, these settings make scripts fail loudly on errors rather than silently continuing with corrupted state. They are considered best practice for any non-trivial bash script.",
      followUps: [
        "When might you intentionally not use set -e?",
        "How do you handle expected failures with set -e enabled?",
      ],
    },
    {
      q: "Explain the difference between single quotes, double quotes, and no quotes in bash.",
      a: "Single quotes preserve the literal value of every character — no variable expansion, no command substitution, no escape sequences (except that you cannot include a single quote). Double quotes allow variable expansion (`$VAR`), command substitution (`$(cmd)`), and escape sequences (`\\n`, `\\$`), but prevent word splitting and globbing. No quotes allow all expansions plus word splitting and globbing, which is usually undesirable — an unquoted variable containing spaces becomes multiple arguments. The rule of thumb: always double-quote variables unless you specifically need word splitting.",
      followUps: [
        "How do you include a single quote inside a single-quoted string?",
        "What is word splitting and when is it useful?",
      ],
    },
    {
      q: "How would you find the 10 largest files in a directory tree?",
      a: "Use `find . -type f -exec du -h {} + | sort -rh | head -10`. This finds all regular files, gets their sizes with `du -h` (human-readable), sorts in reverse human-numeric order, and takes the top 10. Alternatively: `find . -type f -printf '%s %p\\n' | sort -rn | head -10` prints size in bytes and path, sorts numerically. On macOS, `find -printf` is not available, so use the `du` approach or `stat -f '%z %N'`.",
    },
    {
      q: "What is the difference between `$()` and backticks for command substitution?",
      a: "`$()` and backticks both perform command substitution — replacing the expression with the command's stdout. `$()` is preferred because it nests cleanly (`$(echo $(date))`), handles quoting intuitively, and is visually unambiguous. Backticks require escaping for nesting (`` `echo \\`date\\`` ``), and the backtick character is easily confused with a single quote. POSIX and bash both support `$()`. There is no reason to use backticks in modern scripts.",
    },
  ],
  mcqs: [
    {
      q: "What does `2>&1` do in a bash command?",
      options: [
        "Redirects stdin to stdout",
        "Redirects stderr to the same destination as stdout",
        "Redirects stdout to stderr",
        "Redirects file descriptor 2 to file '1'",
      ],
      answerIndex: 1,
      explanation: "`2>&1` redirects file descriptor 2 (stderr) to file descriptor 1 (stdout), merging error output into the standard output stream.",
    },
    {
      q: "Which command prints the third column of a space-delimited file?",
      options: [
        "grep -c 3 file",
        "sed '3p' file",
        "awk '{print $3}' file",
        "cut -c 3 file",
      ],
      answerIndex: 2,
      explanation: "awk splits lines by whitespace by default. `$3` refers to the third field. `cut -c 3` would print the third character, not column.",
    },
    {
      q: "What does `set -u` do in a bash script?",
      options: [
        "Enables Unicode support",
        "Treats references to unset variables as errors",
        "Runs the script as the user specified in the shebang",
        "Unlocks restricted shell mode",
      ],
      answerIndex: 1,
      explanation: "`set -u` (or `set -o nounset`) causes bash to exit with an error when an unset variable is referenced, preventing silent bugs from typos in variable names.",
    },
    {
      q: "What is the output of `echo {a,b}{1,2}`?",
      options: [
        "a1 a2 b1 b2",
        "{a,b}{1,2}",
        "a1 b2",
        "a b 1 2",
      ],
      answerIndex: 0,
      explanation: "Brace expansion generates the Cartesian product: {a,b} combined with {1,2} produces a1 a2 b1 b2.",
    },
    {
      q: "Which tool is best for linting bash scripts?",
      options: ["eslint", "pylint", "shellcheck", "yamllint"],
      answerIndex: 2,
      explanation: "ShellCheck is a static analysis tool specifically for shell scripts. It detects common bugs, quoting issues, deprecated syntax, and portability problems.",
    },
  ],
  flashcards: [
    { front: "What does the shebang line (#!/bin/bash) do?", back: "Tells the kernel which interpreter to use when executing the script as a program." },
    { front: "What is the exit code convention in Unix?", back: "Exit code 0 means success; any non-zero value indicates failure. By convention, different non-zero values can indicate different error types." },
    { front: "What does `$?` contain?", back: "The exit code of the most recently executed foreground command." },
    { front: "What is a here-document?", back: "A redirect that passes multi-line inline text as stdin: `command <<EOF\\nline1\\nline2\\nEOF`." },
    { front: "What does `xargs` do?", back: "Reads items from stdin and executes a command with those items as arguments, handling cases where the argument list would be too long." },
    { front: "What is the difference between `>` and `>>`?", back: "`>` overwrites the file with stdout. `>>` appends stdout to the file." },
    { front: "What does `grep -v` do?", back: "Inverts the match — prints lines that do NOT match the pattern." },
    { front: "What is process substitution?", back: "`<(command)` creates a temporary file-like object containing the command's output, allowing commands that expect filename arguments to read from a process." },
  ],
  glossary: [
    { term: "Shell", definition: "A command-line interpreter that reads, parses, and executes commands, also serving as a scripting language." },
    { term: "Pipe", definition: "The `|` operator connecting stdout of one process to stdin of another, enabling command composition." },
    { term: "Redirect", definition: "Operators (`>`, `>>`, `<`, `2>`) that change where a process's standard streams (stdin, stdout, stderr) connect." },
    { term: "Glob", definition: "Shell pattern matching using wildcards (`*`, `?`, `[...]`) to expand to matching filenames." },
    { term: "Exit Code", definition: "An integer returned by a command indicating success (0) or failure (non-zero)." },
    { term: "Shebang", definition: "The `#!` line at the top of a script specifying the interpreter path." },
    { term: "Word Splitting", definition: "Bash's behavior of splitting unquoted variable expansions into separate arguments on whitespace." },
    { term: "Here-Document", definition: "A redirect construct (`<<DELIMITER`) that provides multi-line inline text as standard input to a command." },
  ],
};
