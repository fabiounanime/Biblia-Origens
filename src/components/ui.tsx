import type { ReactNode } from "react";
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

/** Marca: a árvore que nasce do livro aberto (mesmo desenho do ícone do app). */
export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <img
      src="/icons/logo-144.png"
      alt=""
      aria-hidden="true"
      width={144}
      height={144}
      decoding="async"
      className={cx("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}

/** Nome "Bíblia Origens" na grafia da marca (uncial em tinta de pergaminho). */
export function Wordmark({
  className = "text-xl",
  as: Tag = "span",
  stacked = false,
}: {
  className?: string;
  as?: "span" | "h1" | "p";
  /** Em duas linhas (abertura): cabe em qualquer largura de celular. */
  stacked?: boolean;
}) {
  return (
    <Tag className={cx("wordmark", !stacked && "whitespace-nowrap", className)}>
      {stacked ? (
        <>
          Bíblia
          <br />
          Origens
        </>
      ) : (
        "Bíblia Origens"
      )}
    </Tag>
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
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] max-w-xl flex-col rounded-t-[28px] border border-b-0 border-line bg-surface font-app text-fg shadow-edge outline-none"
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
