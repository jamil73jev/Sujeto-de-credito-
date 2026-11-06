import Link from "next/link";

import { Simulador } from "@/components/Simulador";
import { datos } from "@/lib/datos";

const MIRAMOS = [
  { n: "1", titulo: "Capacidad de pago", texto: "Cuánto de tu ingreso se va en cuotas y cuánto te queda cada mes." },
  { n: "2", titulo: "Historial declarado", texto: "Lo que tú indicas sobre mora y score. No consultamos ningún buró." },
  { n: "3", titulo: "Resiliencia", texto: "Qué pasaría con tus cuotas si tu ingreso cae o tus cuotas suben." },
  { n: "4", titulo: "Documentos", texto: "Cuáles puedes respaldar hoy y cuáles te faltan reunir." },
];

const CONFIANZA = [
  { icono: "↯", titulo: "Todo en tu navegador", texto: "Lo que escribes no sale de tu dispositivo ni se guarda." },
  { icono: "⌕", titulo: "Cada dato, con su fuente", texto: "Los umbrales y datos de mercado indican de dónde salen y qué tan seguros son." },
  { icono: "✓", titulo: "Reglas que puedes auditar", texto: "La metodología es pública: cómo se decide el nivel y qué supuestos usamos." },
  { icono: "↗", titulo: "Canales oficiales", texto: "Para ver tu historial real te enviamos a los canales oficiales, no a un intermediario." },
];

export default function Inicio() {
  const t = datos.textos;
  return (
    <div className="portada-completa">
      <section className="hero">
        <div className="int hero-grid">
          <div>
            <span className="pastilla">Gratis · sin registro · sin buró</span>
            <h1>
              ¿Dónde estás <span className="resalte">antes de pedir</span> un crédito?
            </h1>
            <p className="subtitulo">
              Un diagnóstico orientativo para personas y empresas: ves qué miran las entidades y qué podrías mejorar, sin dar tus datos a nadie.
            </p>
            <div className="acciones">
              <Link href="/personas" className="boton">
                Soy persona
              </Link>
              <Link href="/empresas" className="boton secundario">
                Tengo una empresa
              </Link>
            </div>
            <ul className="confianza">
              <li>{t.subtitulo.split(".")[0]}</li>
              <li>No es un score ni una aprobación</li>
            </ul>
          </div>
          <Simulador textos={t.resultados} />
        </div>
      </section>

      <section className="seccion">
        <div className="int">
          <h2>Qué miramos</h2>
          <p className="lead">Cuatro dimensiones para personas. Las empresas tienen las suyas: liquidez, solvencia, rentabilidad y cumplimiento.</p>
          <div className="mirar">
            {MIRAMOS.map((m) => (
              <div key={m.n}>
                <span className="icono" aria-hidden="true">
                  {m.n}
                </span>
                <h3>{m.titulo}</h3>
                <p>{m.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion" style={{ paddingTop: 0 }}>
        <div className="int">
          <h2>Elige por dónde empezar</h2>
          <div className="bento">
            <Link href="/personas" className="opcion">
              <h3>Soy persona</h3>
              <p>Capacidad de pago, historial declarado, prueba de estrés y documentos.</p>
              <span className="ir">Empezar →</span>
            </Link>
            <Link href="/empresas" className="opcion">
              <h3>Tengo una empresa</h3>
              <p>Liquidez, solvencia, rentabilidad y cumplimiento, con comparación frente a tu sector cuando hay datos.</p>
              <span className="ir">Empezar →</span>
            </Link>
            <Link href="/verificaciones" className="opcion">
              <h3>Verificar en canales oficiales</h3>
              <p>Dónde consultar tu reporte de crédito, deudas con el SRI y certificados.</p>
              <span className="ir">Ver canales →</span>
            </Link>
            <Link href="/metodologia" className="opcion">
              <h3>Metodología y fuentes</h3>
              <p>Cómo se decide el nivel, de dónde sale cada umbral y qué fuente respalda cada dato.</p>
              <span className="ir">Ver metodología →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="seccion banda">
        <div className="int">
          <h2>Por qué puedes confiar en el resultado</h2>
          <p className="lead">Un diagnóstico orientativo sirve solo si puedes comprobar cómo se hizo.</p>
          <div className="confianza-tarjetas">
            {CONFIANZA.map((c) => (
              <div key={c.titulo}>
                <span className="icono" aria-hidden="true">
                  {c.icono}
                </span>
                <h3>{c.titulo}</h3>
                <p>{c.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="int">
          <div className="no-es">
            <h2>Lo que esta herramienta no hace</h2>
            <ul>
              <li>No es un buró ni consulta el historial de nadie.</li>
              <li>No emite un score ni una calificación oficial.</li>
              <li>No aprueba créditos: esa decisión es de cada entidad.</li>
              <li>No guarda lo que escribes.</li>
            </ul>
          </div>

          <div className="aviso alerta" style={{ marginTop: "1.5rem" }}>
            <strong>Nadie puede «limpiar» tu historial.</strong> Desconfía de quien lo ofrezca. <Link href="/verificaciones#alertas">Ver alertas</Link>
          </div>

          <div className="mas">
            <h2>Preguntas frecuentes</h2>
            {t.faq.map((q) => (
              <details className="plegable" key={q.pregunta}>
                <summary>{q.pregunta}</summary>
                <div className="contenido">
                  <p>{q.respuesta}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="cta-final">
            <h2>Empieza con tus propios números</h2>
            <div className="acciones">
              <Link href="/personas" className="boton">
                Soy persona
              </Link>
              <Link href="/empresas" className="boton secundario">
                Tengo una empresa
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
