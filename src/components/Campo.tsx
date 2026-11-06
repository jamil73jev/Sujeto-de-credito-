import type { ReactNode } from "react";

interface BaseProps {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
}

function Envoltura({ id, etiqueta, ayuda, error, children }: BaseProps & { children: ReactNode }) {
  return (
    <div className="campo" data-invalido={error ? "true" : undefined}>
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda ? (
        <span className="ayuda" id={`${id}-ayuda`}>
          {ayuda}
        </span>
      ) : null}
      {error ? (
        <span className="error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, ayuda?: string, error?: string) =>
  [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;

interface CampoProps extends BaseProps {
  valor: string;
  onCambio: (valor: string) => void;
  sufijo?: string;
  placeholder?: string;
}

export function CampoNumero({ id, etiqueta, ayuda, error, valor, onCambio, sufijo, placeholder }: CampoProps) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <div className="entrada">
        <input
          id={id}
          name={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={valor}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, ayuda, error)}
          onChange={(e) => onCambio(e.target.value)}
        />
        {sufijo ? <span className="sufijo">{sufijo}</span> : null}
      </div>
    </Envoltura>
  );
}

interface DeslizadorProps extends CampoProps {
  min: number;
  max: number;
  paso: number;
}

/** Campo numérico con deslizador sincronizado: se puede escribir o arrastrar. */
export function Deslizador({ id, etiqueta, ayuda, error, valor, onCambio, sufijo, min, max, paso }: DeslizadorProps) {
  const n = Number(valor.replace(",", "."));
  const dentro = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
  const pct = ((dentro - min) / (max - min)) * 100;
  return (
    <div className="campo deslizador" data-invalido={error ? "true" : undefined}>
      <label htmlFor={id}>{etiqueta}</label>
      <div className="entrada">
        <input
          id={id}
          name={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={valor}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, ayuda, error)}
          onChange={(e) => onCambio(e.target.value)}
        />
        {sufijo ? <span className="sufijo">{sufijo}</span> : null}
      </div>
      <input
        type="range"
        aria-label={`${etiqueta}, deslizador`}
        min={min}
        max={max}
        step={paso}
        value={dentro}
        style={{ ["--pct" as string]: `${pct}%` }}
        onChange={(e) => onCambio(e.target.value)}
      />
      {ayuda ? (
        <span className="ayuda" id={`${id}-ayuda`}>
          {ayuda}
        </span>
      ) : null}
      {error ? (
        <span className="error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

interface SeleccionProps extends BaseProps {
  valor: string;
  onCambio: (valor: string) => void;
  opciones: ReadonlyArray<{ valor: string; etiqueta: string }>;
}

export function Seleccion({ id, etiqueta, ayuda, error, valor, onCambio, opciones }: SeleccionProps) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <select
        id={id}
        name={id}
        value={valor}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, ayuda, error)}
        onChange={(e) => onCambio(e.target.value)}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </Envoltura>
  );
}

export function CampoTexto({ id, etiqueta, ayuda, error, valor, onCambio, placeholder }: CampoProps) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <div className="entrada">
        <input
          id={id}
          name={id}
          type="text"
          autoComplete="off"
          value={valor}
          placeholder={placeholder}
          aria-describedby={describedBy(id, ayuda, error)}
          onChange={(e) => onCambio(e.target.value)}
        />
      </div>
    </Envoltura>
  );
}

interface AreaProps extends BaseProps {
  valor: string;
  onCambio: (valor: string) => void;
  maxLength?: number;
  filas?: number;
}

export function AreaTexto({ id, etiqueta, ayuda, error, valor, onCambio, maxLength, filas = 4 }: AreaProps) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <textarea
        id={id}
        name={id}
        rows={filas}
        maxLength={maxLength}
        value={valor}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, ayuda, error)}
        onChange={(e) => onCambio(e.target.value)}
      />
    </Envoltura>
  );
}
