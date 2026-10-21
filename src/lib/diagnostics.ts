/** Tipos do diagnóstico, compartilhados entre servidor e tela (sem código de servidor). */
export type GoogleMode = "direct" | "off";

export type DiagnosisCheck = {
  id: string;
  label: string;
  status: "ok" | "warn" | "error";
  detail: string;
};

export type Diagnosis = {
  checkedAt: string;
  origin: string;
  googleMode: GoogleMode;
  googleCallback: string;
  checks: DiagnosisCheck[];
};
