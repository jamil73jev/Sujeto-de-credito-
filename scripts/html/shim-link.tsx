import type { AnchorHTMLAttributes } from "react";

/** Sustituto de next/link para la versión HTML: un <a> normal (main.tsx intercepta los clics). */
export default function Link({ href, ...resto }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...resto} />;
}
