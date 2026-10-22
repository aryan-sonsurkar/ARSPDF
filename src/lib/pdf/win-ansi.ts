const REPLACEMENTS: Record<string, string> = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201A": "'",
  "\u201B": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u201E": '"',
  "\u2013": "-",
  "\u2014": "-",
  "\u2026": "...",
  "\u2022": "-",
  "\u00A0": " ",
  "\u2192": "->",
  "\u2190": "<-",
  "\t": "    ",
};

export function toWinAnsiText(value: string): string {
  let output = "";

  for (const character of Array.from(value.normalize("NFC"))) {
    if (character === "\n") {
      output += character;
      continue;
    }

    const replacement = REPLACEMENTS[character];
    if (replacement !== undefined) {
      output += replacement;
      continue;
    }

    const code = character.codePointAt(0) ?? 0;
    const supported =
      (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff);

    if (supported) {
      output += character;
    }
  }

  return output;
}
