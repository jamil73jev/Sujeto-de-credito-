/**
 * Convierte el texto de un campo numérico.
 * "" => undefined (campo vacío); "1.234,5" y "1234.5" => número; texto no numérico => NaN.
 * Acepta coma o punto decimal y descarta espacios.
 */
export function parseNumero(texto: string): number | undefined {
  const t = texto.trim().replace(/\s/g, "");
  if (t === "") return undefined;
  // Si hay coma y punto, se asume punto de miles y coma decimal ("1.234,5").
  const normalizado = t.includes(",") && t.includes(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) return Number.NaN;
  return Number(normalizado);
}

export function formatoMoneda(v: number): string {
  const texto = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Math.abs(v));
  // Un saldo negativo se escribe «−$99,00», no «$-99,00».
  return v < 0 && Math.abs(v) >= 0.005 ? `\u2212\u2060${texto}` : texto;
}

export function formatoPct(v: number, decimales = 1): string {
  return `${new Intl.NumberFormat("es-EC", { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(v)} %`;
}

export function formatoFecha(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m) return iso;
  return new Intl.DateTimeFormat("es-EC", {
    year: "numeric",
    month: "short",
    ...(d ? { day: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(a, m - 1, d ?? 1)));
}
