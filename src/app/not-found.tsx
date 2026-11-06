import Link from "next/link";

export default function NoEncontrada() {
  return (
    <>
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe o fue movida.</p>
      <p>
        <Link href="/">Volver al inicio</Link>
      </p>
    </>
  );
}
