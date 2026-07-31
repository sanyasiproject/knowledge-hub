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
  deepDive: [
    "## How the Shell Executes a Command\n\nWhen you type a command like `ls -la | grep txt > output.log`, the shell performs a sophisticated multi-phase interpretation before any program actually runs. First, the shell **tokenizes** the input, splitting it into words and operators. It then performs **parsing** to identify the command structure: pipes, redirections, control operators (`&&`, `||`, `;`), and command groupings (`{ }`, `( )`). Next comes the **expansion phase**, which proceeds in a strict order: *brace expansion*, *tilde expansion*, *parameter and variable expansion*, *command substitution*, *arithmetic expansion*, *word splitting*, and finally *pathname expansion* (globbing). After expansion, the shell performs **quote removal** — stripping the quotes that were used to protect characters from earlier expansion phases. Only then does the shell look up the command name: it checks **aliases**, then **functions**, then **builtins** (like `cd`, `echo`, `test`), and finally searches the `$PATH` directories for an external executable. For external commands, the shell calls `fork()` to create a child process, sets up any **redirections** by manipulating file descriptors (using `dup2()` system calls), establishes **pipes** between processes by creating pipe file descriptors, and finally calls `execve()` to replace the child process image with the target program. Understanding this pipeline is critical for debugging unexpected behavior — most shell \"bugs\" are actually misunderstandings of the expansion or quoting phases.",

    "## Pipes, File Descriptors, and the Kernel\n\nAt the kernel level, a **pipe** is a unidirectional byte stream implemented as a small in-kernel buffer (typically **64 KB** on Linux). When the shell encounters `cmd1 | cmd2`, it calls `pipe()` to create a pair of file descriptors — one for reading and one for writing. It then `fork()`s twice: the first child gets its *stdout* (fd 1) replaced with the pipe's write end via `dup2()`, and the second child gets its *stdin* (fd 0) replaced with the pipe's read end. The kernel handles **flow control** automatically: if `cmd1` writes faster than `cmd2` reads, the write call *blocks* when the buffer is full, creating natural backpressure. This is why pipelines are memory-efficient — data flows incrementally rather than being buffered entirely in memory. **Named pipes** (FIFOs), created with `mkfifo`, persist on the filesystem and allow unrelated processes to communicate. **Process substitution** (`<(cmd)` and `>(cmd)`) creates anonymous named pipes under `/dev/fd/`, enabling commands that expect filenames to read from or write to processes. For example, `diff <(sort file1) <(sort file2)` compares two sorted streams without temporary files. The `tee` command exploits pipes elegantly: it reads from stdin and writes to both stdout *and* one or more files simultaneously, allowing you to inspect data mid-pipeline with `cmd1 | tee debug.log | cmd2`.",

    "## Job Control, Signals, and Process Groups\n\nThe shell provides **job control** — the ability to manage multiple concurrent processes from a single terminal. When you append `&` to a command, the shell runs it as a **background job**, returning you to the prompt immediately. The `jobs` builtin lists all active jobs; `fg %1` brings job 1 to the foreground; `bg %1` resumes a stopped job in the background. Pressing **Ctrl+Z** sends `SIGTSTP` to the foreground process group, *stopping* (not killing) it. Pressing **Ctrl+C** sends `SIGINT`, which by default terminates the process. These signals are delivered to the entire **process group** — a set of processes created by the shell for each pipeline. The shell itself is the **session leader** and is immune to signals generated by the terminal for its children. The `trap` builtin lets scripts intercept signals: `trap 'cleanup' EXIT` runs a function when the script exits (by any means), `trap '' INT` ignores Ctrl+C, and `trap 'handle_hup' HUP` handles terminal hangups. For long-running processes, `nohup` makes a command immune to `SIGHUP` (sent when the terminal closes), and `disown` removes a job from the shell's job table entirely. Modern alternatives like `tmux` and `screen` provide *terminal multiplexing*, creating persistent sessions that survive disconnection — essential for remote server work.",
  ],

  code: [
    {
      language: "bash",
      caption: "Robust bash script template with error handling, argument parsing, and cleanup",
      source: `#!/usr/bin/env bash
# Robust script template demonstrating best practices
set -euo pipefail
IFS=$'\\n\\t'

# --- Constants & Defaults ---
readonly SCRIPT_NAME="\$(basename "\$0")"
readonly SCRIPT_DIR="\$(cd "\$(dirname "\$0")" && pwd)"
VERBOSE=false
OUTPUT_DIR="./output"

# --- Cleanup trap ---
cleanup() {
  local exit_code=\$?
  # Remove temp files, restore state, etc.
  [[ -f "\${TMPFILE:-}" ]] && rm -f "\$TMPFILE"
  echo "[INFO] Cleanup complete (exit code: \$exit_code)"
}
trap cleanup EXIT

# --- Logging helpers ---
log()   { echo "[\$(date '+%Y-%m-%d %H:%M:%S')] [INFO]  \$*"; }
warn()  { echo "[\$(date '+%Y-%m-%d %H:%M:%S')] [WARN]  \$*" >&2; }
die()   { echo "[\$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] \$*" >&2; exit 1; }

# --- Argument parsing ---
usage() {
  cat <<EOF
Usage: \$SCRIPT_NAME [OPTIONS] <input-file>

Options:
  -o DIR    Output directory (default: ./output)
  -v        Verbose mode
  -h        Show this help
EOF
}

while getopts ":o:vh" opt; do
  case \$opt in
    o) OUTPUT_DIR="\$OPTARG" ;;
    v) VERBOSE=true ;;
    h) usage; exit 0 ;;
    :) die "Option -\$OPTARG requires an argument" ;;
    ?) die "Unknown option -\$OPTARG. Use -h for help." ;;
  esac
done
shift \$((OPTIND - 1))

[[ \$# -lt 1 ]] && die "Missing required argument: <input-file>"
INPUT_FILE="\$1"
[[ -f "\$INPUT_FILE" ]] || die "File not found: \$INPUT_FILE"

# --- Main logic ---
TMPFILE="\$(mktemp)"
mkdir -p "\$OUTPUT_DIR"

log "Processing \$INPUT_FILE ..."
# Example: extract, transform, load
grep -v '^#' "\$INPUT_FILE" \\
  | awk -F',' '{print \$1, \$3}' \\
  | sort -u \\
  > "\$TMPFILE"

line_count=\$(wc -l < "\$TMPFILE")
log "Extracted \$line_count unique records"
\$VERBOSE && cat "\$TMPFILE"

mv "\$TMPFILE" "\$OUTPUT_DIR/result.txt"
log "Output written to \$OUTPUT_DIR/result.txt"`,
    },
    {
      language: "cpp",
      caption: "C++ system calls: fork, exec, pipe — building a shell pipeline programmatically",
      source: `#include <unistd.h>
#include <sys/wait.h>
#include <cstdio>
#include <cstdlib>
#include <cstring>

// Demonstrates: ls -la | grep ".txt" using fork/exec/pipe
int main() {
    int pipefd[2];  // pipefd[0] = read end, pipefd[1] = write end

    // Create the pipe
    if (pipe(pipefd) == -1) {
        perror("pipe");
        return EXIT_FAILURE;
    }

    // --- First child: ls -la (writes to pipe) ---
    pid_t pid1 = fork();
    if (pid1 == -1) { perror("fork"); return EXIT_FAILURE; }

    if (pid1 == 0) {
        // Child 1: replace stdout with pipe write end
        close(pipefd[0]);              // close unused read end
        dup2(pipefd[1], STDOUT_FILENO); // stdout -> pipe write
        close(pipefd[1]);              // close original write fd

        execlp("ls", "ls", "-la", nullptr);
        perror("execlp ls");           // only reached on error
        _exit(EXIT_FAILURE);
    }

    // --- Second child: grep ".txt" (reads from pipe) ---
    pid_t pid2 = fork();
    if (pid2 == -1) { perror("fork"); return EXIT_FAILURE; }

    if (pid2 == 0) {
        // Child 2: replace stdin with pipe read end
        close(pipefd[1]);              // close unused write end
        dup2(pipefd[0], STDIN_FILENO);  // stdin -> pipe read
        close(pipefd[0]);              // close original read fd

        execlp("grep", "grep", ".txt", nullptr);
        perror("execlp grep");
        _exit(EXIT_FAILURE);
    }

    // --- Parent: close both pipe ends and wait ---
    close(pipefd[0]);
    close(pipefd[1]);

    int status;
    waitpid(pid1, &status, 0);
    printf("ls exited with code %d\\n", WEXITSTATUS(status));

    waitpid(pid2, &status, 0);
    printf("grep exited with code %d\\n", WEXITSTATUS(status));

    return EXIT_SUCCESS;
}`,
    },
    {
      language: "bash",
      caption: "Practical text processing pipeline: log analysis with grep, awk, and sort",
      source: `#!/usr/bin/env bash
# Analyze an Nginx/Apache access log to find top error-causing URLs
# Usage: ./log_analysis.sh access.log

set -euo pipefail

LOG_FILE="\${1:?Usage: \$0 <access-log-file>}"

echo "=== Top 10 URLs returning 4xx/5xx errors ==="
awk '\$9 ~ /^[45][0-9]{2}\$/ {print \$9, \$7}' "\$LOG_FILE" \\
  | sort \\
  | uniq -c \\
  | sort -rn \\
  | head -10

echo ""
echo "=== Requests per hour ==="
awk '{print \$4}' "\$LOG_FILE" \\
  | cut -d: -f1,2 \\
  | sort \\
  | uniq -c \\
  | sort -rn \\
  | head -24

echo ""
echo "=== Top 10 IPs by request count ==="
awk '{print \$1}' "\$LOG_FILE" \\
  | sort \\
  | uniq -c \\
  | sort -rn \\
  | head -10

echo ""
echo "=== Bandwidth by response code ==="
awk '{code=\$9; bytes=\$10}
     bytes ~ /^[0-9]+\$/ {bw[code] += bytes}
     END {for (c in bw) printf "%s  %10.2f MB\\n", c, bw[c]/1048576}' "\$LOG_FILE" \\
  | sort -k2 -rn`,
    },
  ],

  diagrams: [
    {
      title: "Shell Pipeline Execution Flow",
      kind: "flow",
      caption: "How the shell processes a pipeline command like `cat file | grep pattern | wc -l` — from parsing through fork/exec to pipe-connected child processes.",
      mermaid: `flowchart TD
    A["User types: cat file | grep pattern | wc -l"] --> B["Shell parses input into tokens"]
    B --> C["Identify pipeline: 3 commands"]
    C --> D["Create pipe1: fd_read1, fd_write1"]
    C --> E["Create pipe2: fd_read2, fd_write2"]
    D --> F["fork() child 1: **cat**"]
    E --> G["fork() child 2: **grep**"]
    E --> H["fork() child 3: **wc**"]
    F --> F1["dup2(fd_write1, stdout)"]
    F1 --> F2["exec('cat', 'file')"]
    G --> G1["dup2(fd_read1, stdin)"]
    G1 --> G2["dup2(fd_write2, stdout)"]
    G2 --> G3["exec('grep', 'pattern')"]
    H --> H1["dup2(fd_read2, stdin)"]
    H1 --> H2["exec('wc', '-l')"]
    F2 --> I["Data flows: cat stdout --> pipe1 --> grep stdin"]
    G3 --> J["Data flows: grep stdout --> pipe2 --> wc stdin"]
    H2 --> K["wc writes count to terminal stdout"]
    I --> L["Parent calls waitpid() for all children"]
    J --> L
    K --> L
    L --> M["Shell collects exit codes, sets $?"]`,
    },
    {
      title: "Shell Architecture and Internal Components",
      kind: "architecture",
      caption: "Internal architecture of a Unix shell showing the major subsystems: lexer, parser, expander, executor, and their interactions with the kernel.",
      mermaid: `flowchart LR
    subgraph UserSpace["**User Space**"]
        subgraph Shell["**Shell Process**"]
            Lexer["Lexer / Tokenizer\n- words\n- operators\n- quotes"]
            Parser["Parser\n- AST construction\n- pipelines\n- lists & compounds"]
            Expander["Expander\n- brace\n- tilde\n- variable\n- command subst\n- glob"]
            Executor["Executor\n- builtin dispatch\n- fork + exec\n- redirections\n- pipe setup"]
            JobCtrl["Job Control\n- fg / bg\n- process groups\n- signal routing"]
            History["History & Readline\n- line editing\n- tab completion\n- search"]
        end
    end
    subgraph Kernel["**Kernel**"]
        Syscalls["System Calls\nfork() exec()\npipe() dup2()\nwaitpid() kill()"]
        FS["Filesystem\n/bin /usr/bin\n/dev/fd\n/proc"]
        Sched["Process Scheduler\n- process groups\n- sessions\n- signals"]
    end
    History --> Lexer
    Lexer --> Parser
    Parser --> Expander
    Expander --> Executor
    Executor --> JobCtrl
    Executor --> Syscalls
    JobCtrl --> Sched
    Syscalls --> FS
    Syscalls --> Sched`,
    },
  ],

  comparison: {
    columns: ["Feature", "**Bash**", "**Zsh**", "**Fish**"],
    rows: [
      ["Default on", "Most Linux distros, macOS (pre-Catalina)", "macOS (Catalina+), Kali Linux", "None (must install)"],
      ["POSIX compliance", "Yes (mostly)", "Yes (mostly, with extensions)", "**No** (intentionally non-POSIX)"],
      ["Tab completion", "Basic (programmable via `bash-completion`)", "Powerful built-in, context-aware", "**Best** — autosuggestions from history, smart completions out of the box"],
      ["Scripting syntax", "`if [ ]; then fi`, `$(( ))`, `[[ ]]`", "Same as bash + extended globs, floating point", "Clean syntax: `if; end`, no subshell `$()` needed for math"],
      ["Prompt customization", "Manual via `PS1` escape codes", "Themes via **Oh My Zsh**, `PROMPT` variable", "Built-in `fish_prompt` function, web-based config (`fish_config`)"],
      ["Globbing", "Basic (`*`, `?`, `[...]`), `extglob` for extended", "**Recursive globs** (`**/*.txt`), qualifiers (`*(.)` = files only)", "Recursive `**` built-in, no extended glob syntax"],
      ["Arrays", "Indexed arrays (0-based), associative arrays (bash 4+)", "Indexed (1-based!), associative, `${arr[@]}` syntax", "Lists (1-based), `set -a`, simpler syntax"],
      ["Plugin ecosystem", "Limited (`.bashrc` sourcing)", "Huge — Oh My Zsh, Prezto, zinit", "Fisher, Oh My Fish — smaller but growing"],
      ["Startup speed", "Fast", "Can be slow with heavy plugins", "**Very fast** (lazy-loads completions)"],
      ["Best for", "Scripts, CI/CD, server automation, portability", "Power users, interactive daily use", "Beginners, interactive use, discoverability"],
    ],
  },

  exercises: [
    "**Pipeline Mastery**: Write a single pipeline that reads `/etc/passwd`, filters out comment lines and the `nobody` user, extracts just the *username* and *shell* fields (fields 1 and 7), sorts by shell name, and formats the output as a neat two-column table using `column -t`. Bonus: count how many users use each shell with `uniq -c`.",
    "**Script Hardening**: You are given a fragile script that processes CSV files. Rewrite it to use `set -euo pipefail`, add a `trap cleanup EXIT` that removes any temporary files created with `mktemp`, validate that the input file exists and is readable before processing, and log errors to stderr while sending only results to stdout. Test it by intentionally providing a missing file and a malformed CSV.",
    "**Process Substitution Challenge**: Use `diff` with *process substitution* (`<(...)`) to compare the sorted, unique list of installed packages on two servers (or two package list files). The command should show packages present on one system but not the other, without creating any temporary files. Extend the solution to highlight additions vs. removals using `comm` with its column-suppression flags (`-23`, `-13`).",
    "**Fork and Pipe in C**: Write a C or C++ program that implements the pipeline `cat /etc/hosts | grep localhost | wc -l` using `fork()`, `pipe()`, `dup2()`, and `exec()`. Each stage of the pipeline must run in a separate child process. The parent process should wait for all children and report their exit codes. Handle all error cases (failed `fork`, failed `exec`, broken pipes).",
    "**Log Analysis Scripting**: Write a bash script that takes an Nginx access log file as input and produces a report containing: (1) the top 10 most-requested URLs, (2) the number of requests per HTTP status code, (3) the top 5 client IPs, and (4) average response size in bytes. Use a combination of `awk`, `sort`, `uniq`, and `head`. Structure the script with functions, add a `--help` flag, and validate input arguments.",
  ],

  cheatSheet: [
    "`grep -rn 'pattern' dir/` — Recursively search for *pattern* in all files under `dir/`, showing **line numbers**. Add `-i` for case-insensitive, `-l` to list only filenames, `-E` for extended regex.",
    "`find . -name '*.log' -mtime +30 -exec rm {} +` — Find and delete `.log` files **older than 30 days**. Use `-mmin` for minutes, `-size +100M` for large files, `-type d` for directories only.",
    "`awk -F',' '{sum+=$3} END {printf \"Total: %.2f\\n\", sum}' data.csv` — Sum the **third column** of a comma-delimited file and print with 2 decimal places. Change `-F` for different delimiters.",
    "`sed -i.bak 's/oldtext/newtext/g' file.txt` — **In-place** find-and-replace across the entire file, creating a `.bak` backup. Drop `.bak` to skip backup (dangerous). Use `-E` for extended regex.",
    "`tar czf backup-$(date +%Y%m%d).tar.gz --exclude='.git' src/` — Create a **gzipped archive** of `src/` with a datestamped filename, excluding `.git` directories. Use `xzf` to extract.",
    "`xargs -P4 -I{} curl -sO {} < urls.txt` — Download files from a list of URLs with **4 parallel** processes. `-I{}` sets the replacement string. Add `-n1` to pass one argument at a time.",
  ],

  revisionNotes: [
    "Every process inherits **three file descriptors**: `0` (stdin), `1` (stdout), `2` (stderr). Redirections manipulate these with `dup2()` *before* `exec()`. The order of redirections matters: `cmd > file 2>&1` merges stderr into the file, but `cmd 2>&1 > file` sends stderr to the terminal and only stdout to the file — because `2>&1` duplicates stdout's *current* destination (terminal) before `> file` changes stdout.",
    "Shell expansion follows a **strict order**: brace expansion, tilde expansion, parameter/variable expansion, command substitution, arithmetic expansion, word splitting, pathname expansion (globbing), and finally quote removal. Misunderstanding this order causes bugs — for example, `$var` inside single quotes is *never* expanded, and brace expansion happens *before* variable expansion, so `{$a,$b}` does not do what you might expect.",
    "**Pipes create subshells**: each command in a pipeline runs in a separate subprocess. This means variable assignments inside a pipeline are *lost* when the pipeline finishes. The classic pitfall: `echo 'hello' | read var; echo $var` prints nothing because `read` ran in a subshell. Solutions: use `lastpipe` (`shopt -s lastpipe`), process substitution (`read var < <(echo 'hello')`), or here-strings.",
    "**Signals and traps** are essential for robust scripts. `trap 'commands' EXIT` runs cleanup code regardless of how the script exits (success, error, or signal). `trap '' INT` *ignores* Ctrl+C. Always use `trap cleanup EXIT` rather than placing cleanup at the end of the script — an unexpected error or signal would skip end-of-script cleanup. Key signals: `SIGINT` (Ctrl+C), `SIGTERM` (kill default), `SIGHUP` (terminal closed), `SIGKILL` (uncatchable).",
    "Use `shellcheck` religiously — it catches the **most common bash pitfalls**: unquoted variables subject to word splitting, useless use of `cat`, incorrect `test` syntax, deprecated backtick command substitution, and POSIX portability issues. Run it in CI pipelines with `shellcheck -x script.sh` (the `-x` flag follows sourced files). Combined with `set -euo pipefail`, `shellcheck` eliminates the majority of shell scripting bugs before they reach production.",
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
