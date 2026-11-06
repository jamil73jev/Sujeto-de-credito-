"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { RUTAS } from "@/lib/site";

export function Navegacion() {
  const ruta = usePathname();
  return (
    <nav className="nav" aria-label="Principal">
      {RUTAS.map((r) => (
        <Link key={r.href} href={r.href} aria-current={ruta === r.href ? "page" : undefined}>
          {r.etiqueta}
        </Link>
      ))}
    </nav>
  );
}
