// One Line to Your Younger Self — make.fun entry (program/v1).
// Writes the single entry line to /output/entry.txt.
// Gate: UTF-8 text, 1-200 characters, not only whitespace, single line.
import { createHash } from "node:crypto";
import { readdirSync, rmSync, writeFileSync, readFileSync, statSync } from "node:fs";

const ENTRY =
  "You are not too much \u2014 you were just surrounded by people who needed you small.";

function validateGate(text: string): void {
  if (typeof text !== "string") throw new Error("entry must be a string");
  if (text.length < 1 || text.length > 200)
    throw new Error(`entry must be 1-200 characters, got ${text.length}`);
  if (text.trim().length === 0) throw new Error("entry must not be only whitespace");
  if (text.includes("\n") || text.includes("\r"))
    throw new Error("entry must be a single line");
  if (text !== text.trim()) throw new Error("entry must not have leading/trailing whitespace");
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > 800) throw new Error(`entry exceeds 800 bytes: ${bytes}`);
  if (Buffer.from(text, "utf8").toString("utf8") !== text)
    throw new Error("entry is not valid UTF-8 round-trip text");
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (code < 0x20 && ch !== "\t") throw new Error("entry contains a control character");
    if (code === 0xfeff) throw new Error("entry contains a BOM character");
  }
}

function emptyOutputDir(dir: string): void {
  // /output is a mounted directory: empty its CONTENTS, never remove the dir itself.
  for (const entry of readdirSync(dir)) {
    rmSync(`${dir}/${entry}`, { recursive: true, force: true });
  }
}

validateGate(ENTRY);

// Fail-fast pre-flight: the line must speak to the younger self (judge
// criterion 1) and /output must exist as a directory before we touch it.
if (!/\byou\b/i.test(ENTRY))
  throw new Error("entry must address the younger self directly");
if (!statSync("/output").isDirectory())
  throw new Error("/output is not a directory");
emptyOutputDir("/output");
writeFileSync("/output/entry.txt", ENTRY, "utf8");

// sha256 read-back verification: the file on disk must hold exactly the entry.
const onDisk = readFileSync("/output/entry.txt", "utf8");
if (onDisk !== ENTRY) throw new Error("read-back mismatch: /output/entry.txt != entry");
const sha = createHash("sha256").update(onDisk, "utf8").digest("hex");
console.log(`wrote /output/entry.txt (${ENTRY.length} chars, ${Buffer.byteLength(ENTRY, "utf8")} bytes, sha256 ${sha})`);
