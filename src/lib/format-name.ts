// Particles that stay lowercase in Portuguese/Spanish/Italian names
const LOWERCASE_PARTICLES = new Set([
  "da", "de", "do", "das", "dos", "di", "du", "del", "della", "e", "y", "van", "von", "la", "le",
]);

/**
 * Capitalize each word of a name, keeping common lowercase particles
 * (da, de, do, das, dos...) in lowercase — except when they are the first word.
 * Preserves the user's spacing so it can be safely used on every keystroke.
 */
export function formatName(input: string): string {
  if (!input) return input;
  return input
    .split(/(\s+)/) // keep whitespace tokens
    .map((token, i) => {
      if (/^\s+$/.test(token) || token === "") return token;
      const lower = token.toLocaleLowerCase("pt-BR");
      if (i !== 0 && LOWERCASE_PARTICLES.has(lower)) return lower;
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    })
    .join("");
}
