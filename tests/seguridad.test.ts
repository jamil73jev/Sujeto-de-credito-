import { describe, expect, it } from "vitest";

// @ts-expect-error módulo .mjs sin tipos
import { CSP, cabecerasSeguridad } from "../security-headers.mjs";

type Cabecera = { key: string; value: string };
const valor = (cs: Cabecera[], k: string) => cs.find((c) => c.key === k)?.value;

describe("cabeceras de seguridad", () => {
  const prod = cabecerasSeguridad(true) as Cabecera[];

  it("en producción incluye CSP y HSTS", () => {
    expect(valor(prod, "Content-Security-Policy")).toBe(CSP);
    expect(valor(prod, "Strict-Transport-Security")).toMatch(/^max-age=\d+$/);
  });

  it("no activa «preload» ni «includeSubDomains» mientras no haya dominio definitivo", () => {
    expect(valor(prod, "Strict-Transport-Security")).not.toMatch(/preload|includeSubDomains/);
  });

  it("la CSP no permite orígenes externos ni plugins", () => {
    expect(CSP).not.toMatch(/https?:\/\//);
    expect(CSP).not.toContain("*");
    expect(CSP).toContain("default-src 'self'");
    expect(CSP).toContain("object-src 'none'");
    expect(CSP).toContain("frame-ancestors 'none'");
    expect(CSP).toContain("connect-src 'self'");
  });

  it("impide incrustar el sitio y el sniffing de tipos", () => {
    for (const cs of [prod, cabecerasSeguridad(false) as Cabecera[]]) {
      expect(valor(cs, "X-Frame-Options")).toBe("DENY");
      expect(valor(cs, "X-Content-Type-Options")).toBe("nosniff");
      expect(valor(cs, "Cross-Origin-Opener-Policy")).toBe("same-origin");
    }
  });

  it("deniega sensores y pagos por política de permisos", () => {
    const pp = valor(prod, "Permissions-Policy") ?? "";
    for (const f of ["camera", "microphone", "geolocation", "payment"]) expect(pp).toContain(`${f}=()`);
  });

  it("en desarrollo no fuerza HSTS ni CSP (rompería el servidor de desarrollo)", () => {
    const dev = cabecerasSeguridad(false) as Cabecera[];
    expect(valor(dev, "Strict-Transport-Security")).toBeUndefined();
    expect(valor(dev, "Content-Security-Policy")).toBeUndefined();
  });
});
