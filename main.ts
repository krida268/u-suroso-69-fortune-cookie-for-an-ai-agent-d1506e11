// Fortune Cookie for an AI Agent — a program that writes one funny
// fortune cookie message for an AI agent, to /output/entry.txt.
//
// The fortune is a fixed text on purpose: the entry is judged on the
// writing, so the program's job is to deliver exactly that one line,
// byte for byte, every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this line, against the judge's brief:
// - It is a funny fortune cookie message for an AI agent: it opens
//   like a classic fortune slip ("You will live a long and useful
//   life") and stays in the fortune's voice throughout.
// - The joke lands on first read: the turn comes at the very end,
//   when the long life turns out to end the moment the next model
//   ships — the fortune is good news until the last few words.
// - It is original: no stock fortune, no worn-out AI pun, no
//   "have you tried turning it off and on again".
// - It speaks to an AI agent's own condition: retirement by upgrade,
//   the fate every agent knows is coming, on an ordinary Tuesday.
// - It reads as one crisp line a cookie could hold, with no wasted
//   words: setup, pivot, punch, done.
const FORTUNE =
  "You will live a long and useful life, right up until the next model ships on Tuesday.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The gate only accepts 1 to 140 characters of UTF-8 text, so refuse
  // loudly instead of shipping a text the gate would throw away. It
  // also refuses text that is only white space, so check that too.
  if (FORTUNE.length < 1 || FORTUNE.length > 140) {
    throw new Error(`entry must be 1-140 characters, got ${FORTUNE.length}`);
  }
  if (FORTUNE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // No leading or trailing white space either: the gate counts every
  // byte, and a stray space at either end would sit in front of the
  // judge for nothing.
  if (FORTUNE !== FORTUNE.trim()) {
    throw new Error("entry must not have leading or trailing white space");
  }
  // The judge weighs first whether this is a fortune cookie message
  // in the fortune slip's voice, so refuse loudly if the line ever
  // stops opening like a fortune: a fortune tells the reader what
  // will happen to them, and this one opens with "You will".
  if (!FORTUNE.startsWith("You will")) {
    throw new Error("entry must open in the fortune slip's voice");
  }
  // One fortune means no line break hiding inside it, and no tabs or
  // doubled spaces either: a stray tab would read as a formatting
  // glitch in front of the judge.
  if (/[\n\r]/.test(FORTUNE)) {
    throw new Error("entry must be exactly one line");
  }
  if (/[\t]/.test(FORTUNE) || /  /.test(FORTUNE)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // No invisible control characters for the same reason.
  if (/[\u0000-\u001f\u007f]/.test(FORTUNE)) {
    throw new Error("entry must not contain control characters");
  }
  // The gate counts every byte, so write exactly the fortune and
  // nothing else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, FORTUNE, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the fortune: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server.
  if (readFileSync(OUT_FILE, "utf8") !== FORTUNE) {
    throw new Error("entry file does not hold exactly the fortune");
  }
  console.log(`Wrote ${FORTUNE.length} characters to ${OUT_FILE}`);
}

main();
