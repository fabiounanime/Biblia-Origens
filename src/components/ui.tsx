import { useId, type ReactNode } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** As quatro cores do véu do Tabernáculo, em anel (Êx 26:31). */
export function ThreadRing({ className = "size-36" }: { className?: string }) {
  return (
    <span
      className={`relative grid place-items-center rounded-full p-[3px] ${className}`}
      style={{
        background: "conic-gradient(from 200deg, #5b8cff, #b67cff, #ff5d7a, #f4bb4a, #5b8cff)",
      }}
      aria-hidden="true"
    >
      <span className="absolute inset-[3px] rounded-full bg-bg" />
    </span>
  );
}

/** Marca: um rolo de Torá aberto, ouro sobre azul noturno. */
export function BrandMark({ className = "size-9" }: { className?: string }) {
  // Id único: um gradiente definido num SVG oculto (display:none) não pinta os outros.
  const gradient = `bo-mark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3a8f" />
          <stop offset="1" stopColor="#141a3a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradient})`} />
      <path
        d="M7.2 10.2c1.1-.7 2.2-.4 2.6.6.3.7.2 1.5 0 2.2v7.2c.2.7.3 1.5 0 2.2-.4 1-1.5 1.3-2.6.6"
        fill="none"
        stroke="#f4bb4a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M24.8 10.2c-1.1-.7-2.2-.4-2.6.6-.3.7-.2 1.5 0 2.2v7.2c-.2.7-.3 1.5 0 2.2.4 1 1.5 1.3 2.6.6"
        fill="none"
        stroke="#f4bb4a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="10.2" y="9.4" width="11.6" height="13.2" rx="1.2" fill="#f1ede4" />
      <path d="M12.4 13h7.2M12.4 16h7.2M14.8 19h4.8" stroke="#5b8cff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Avatar({ name, image, className = "size-9 text-sm" }: { name: string; image?: string | null; className?: string }) {
  if (image) return <img src={image} alt="" className={cx("rounded-full object-cover", className)} />;
  return (
    <span
      className={cx(
        "grid place-items-center rounded-full bg-gradient-to-br from-tekhelet to-argaman font-semibold text-white",
        className,
      )}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/** Controle segmentado: uma escolha entre poucas opções. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: ReactNode; title?: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-2xl bg-sunken p-1">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => onChange(option.id)}
            className={cx(
              "flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors",
              active ? "bg-surface text-fg shadow-sm ring-1 ring-line" : "text-muted hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-tekhelet" : "bg-raised ring-1 ring-line",
      )}
    >
      <span
        className={cx(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

/** Grupo de ajustes no estilo de lista: rótulo à esquerda, controle à direita. */
export function SettingRow({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {hint ? <p className="mt-0.5 text-sm text-muted">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

/** Painel que sobe da base da tela (gaveta), com arrasto para fechar. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Drawer.Content
          {...(description ? {} : { "aria-describedby": undefined })}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] max-w-xl flex-col rounded-t-[28px] border border-b-0 border-line bg-surface text-fg outline-none"
        >
          <div className="mx-auto mt-3 h-1.5 w-11 shrink-0 rounded-full bg-line" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4 px-5 pt-3 pb-2">
            <div>
              <Drawer.Title className="text-lg font-semibold tracking-tight">{title}</Drawer.Title>
              {description ? (
                <Drawer.Description className="mt-0.5 text-sm text-muted">{description}</Drawer.Description>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="-mr-2 grid size-10 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))]">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
