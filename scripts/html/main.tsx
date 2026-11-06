/**
 * Versión de un solo archivo HTML para probar el sitio sin servidor.
 * Reutiliza las mismas páginas, componentes y lógica; solo cambia el enrutado (por hash).
 */
import { useEffect, useState, type ComponentType } from "react";
import { createRoot } from "react-dom/client";

import PaginaComentarios from "@/app/comentarios/page";
import PaginaEmpresas from "@/app/empresas/page";
import Inicio from "@/app/page";
import PaginaMetodologia from "@/app/metodologia/page";
import PaginaPersonas from "@/app/personas/page";
import PaginaPrivacidad from "@/app/privacidad/page";
import PaginaTerminos from "@/app/terminos/page";
import PaginaVerificaciones from "@/app/verificaciones/page";
import { datos } from "@/lib/datos";
import { RUTAS } from "@/lib/site";

const PAGINAS: Record<string, { Componente: ComponentType; titulo: string }> = {
  "/": { Componente: Inicio, titulo: "¿Soy sujeto de crédito? Ecuador" },
  "/personas": { Componente: PaginaPersonas, titulo: "Personas" },
  "/empresas": { Componente: PaginaEmpresas, titulo: "Empresas" },
  "/verificaciones": { Componente: PaginaVerificaciones, titulo: "Verificaciones oficiales" },
  "/terminos": { Componente: PaginaTerminos, titulo: "Términos de uso" },
  "/comentarios": { Componente: PaginaComentarios, titulo: "Comentarios" },
  "/metodologia": { Componente: PaginaMetodologia, titulo: "Metodología" },
  "/privacidad": { Componente: PaginaPrivacidad, titulo: "Política de privacidad" },
};

function leerRuta(): { path: string; ancla: string | null } {
  const h = window.location.hash.replace(/^#/, "") || "/";
  const [path = "/", ancla] = h.split("#");
  return { path: path || "/", ancla: ancla ?? null };
}

function App() {
  const [ruta, setRuta] = useState(leerRuta);

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener("hashchange", alCambiar);

    // Los enlaces internos de las páginas ("/verificaciones#alertas") se convierten en navegación por hash.
    const alHacerClic = (ev: MouseEvent) => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
      const a = (ev.target as Element).closest("a");
      const href = a?.getAttribute("href");
      if (a && href && href.startsWith("/") && !href.startsWith("//")) {
        ev.preventDefault();
        window.location.hash = href;
      }
    };
    document.addEventListener("click", alHacerClic);
    return () => {
      window.removeEventListener("hashchange", alCambiar);
      document.removeEventListener("click", alHacerClic);
    };
  }, []);

  const pagina = PAGINAS[ruta.path];

  useEffect(() => {
    document.title = pagina ? pagina.titulo : "Página no encontrada";
    if (ruta.ancla) document.getElementById(ruta.ancla)?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [ruta, pagina]);

  return (
    <>
      <a className="saltar" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById("contenido")?.focus(); }}>
        Saltar al contenido
      </a>
      <header className="cabecera">
        <div className="contenedor">
          <a className="marca" href="/">
            ¿Soy sujeto de crédito?
          </a>
          <nav className="nav" aria-label="Principal">
            {RUTAS.map((r) => (
              <a key={r.href} href={r.href} aria-current={ruta.path === r.href ? "page" : undefined}>
                {r.etiqueta}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex={-1} className="contenedor" key={ruta.path}>
        {pagina ? (
          <pagina.Componente />
        ) : (
          <>
            <h1>Página no encontrada</h1>
            <p>
              <a href="/">Volver al inicio</a>
            </p>
          </>
        )}
      </main>
      <footer className="pie">
        <div className="contenedor">
          <p>{datos.textos.descargo_corto}</p>
          <div className="enlaces">
            <a href="/privacidad">Privacidad</a>
            <a href="/terminos">Términos</a>
            <a href="/comentarios">Comentarios</a>
          </div>
          <details>
            <summary>Aviso completo</summary>
            <p>{datos.textos.descargo}</p>
            <p>{datos.textos.privacidad}</p>
          </details>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
