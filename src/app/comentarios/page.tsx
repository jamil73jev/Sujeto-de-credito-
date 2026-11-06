import type { Metadata } from "next";

import { FormularioComentarios } from "@/components/FormularioComentarios";
import { CONTACTO_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Comentarios",
  description: "Cuéntanos qué te costó entender, sin enviar datos personales ni los de tu diagnóstico.",
};

export default function PaginaComentarios() {
  return (
    <>
      <div className="titular">
        <h1>Comentarios</h1>
        <span className="meta">Ayúdanos a mejorar, sin datos personales.</span>
      </div>
      {CONTACTO_EMAIL ? (
        <FormularioComentarios correo={CONTACTO_EMAIL} />
      ) : (
        <p>El correo de contacto aún no está configurado.</p>
      )}
    </>
  );
}
