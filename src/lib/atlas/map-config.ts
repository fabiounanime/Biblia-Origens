import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

/**
 * Chave da ArcGIS para a imagem de satélite. Lida em tempo de execução (variável
 * ARCGIS_API_KEY do Worker), para trocar a chave sem novo build. É uma chave de
 * navegador, restrita por endereço no painel da ArcGIS; só vai para quem entrou.
 */
export const getMapConfig = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<{ arcgisKey: string | null }> => {
    const key = process.env.ARCGIS_API_KEY?.trim();
    return { arcgisKey: key ? key : null };
  });
