import { Moon, ScrollText, Sun } from "lucide-react";
import { LAYERS, useLayers } from "@/lib/reader/layers";
import { useStudy } from "@/lib/study/store";
import type { FontScale, ThemeName } from "@/lib/study/types";
import { Segmented, SettingRow, Switch, cx } from "@/components/ui";

const SCALES: { id: FontScale; label: string; size: string }[] = [
  { id: "sm", label: "Pequeno", size: "text-xs" },
  { id: "md", label: "Médio", size: "text-sm" },
  { id: "lg", label: "Grande", size: "text-base" },
  { id: "xl", label: "Muito grande", size: "text-lg" },
];

/** Ajustes de leitura: usados no painel do leitor e na tela Conta. */
export function ReadingSettings({ showLayers = true }: { showLayers?: boolean }) {
  const theme = useStudy((state) => state.theme);
  const fontScale = useStudy((state) => state.fontScale);
  const showNiqqud = useStudy((state) => state.showNiqqud);
  const setTheme = useStudy((state) => state.setTheme);
  const setFontScale = useStudy((state) => state.setFontScale);
  const setShowNiqqud = useStudy((state) => state.setShowNiqqud);
  const layers = useLayers();

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-muted">Tema</p>
        <Segmented<ThemeName>
          label="Tema"
          value={theme}
          onChange={setTheme}
          options={[
            { id: "dark", label: (<><Moon className="size-4" aria-hidden /> Escuro</>) },
            { id: "light", label: (<><Sun className="size-4" aria-hidden /> Claro</>) },
            { id: "sepia", label: (<><ScrollText className="size-4" aria-hidden /> Pergaminho</>) },
          ]}
        />
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-muted">Tamanho do texto</p>
          <p className="text-xs text-muted md:hidden">ou pinça no texto</p>
        </div>
        <Segmented<FontScale>
          label="Tamanho do texto"
          value={fontScale}
          onChange={setFontScale}
          options={SCALES.map((scale) => ({
            id: scale.id,
            title: scale.label,
            label: <span className={cx("font-read font-semibold", scale.size)} aria-label={scale.label}>Aa</span>,
          }))}
        />
      </div>

      {showLayers ? (
        <div>
          <p className="mb-2 text-sm font-medium text-muted">O que mostrar em cada versículo</p>
          <div className="grid grid-cols-3 gap-2">
            {LAYERS.map((layer) => {
              const on = layers[layer.id];
              return (
                <button
                  key={layer.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => layers.toggle(layer.id)}
                  className={cx(
                    "flex min-h-12 flex-col items-start justify-center gap-1 rounded-2xl border px-3 py-2 text-left text-sm font-medium transition-colors",
                    on ? "border-tekhelet/50 bg-tekhelet/10 text-fg" : "border-line text-muted",
                  )}
                >
                  <span className={cx("size-2.5 rounded-full", layer.dot, !on && "opacity-40")} aria-hidden />
                  {layer.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-sunken px-4">
        <SettingRow title="Sinais vocálicos (nikud)" hint="Pontos e traços sob as letras hebraicas.">
          <Switch checked={showNiqqud} onChange={setShowNiqqud} label="Mostrar nikud" />
        </SettingRow>
      </div>
    </div>
  );
}
