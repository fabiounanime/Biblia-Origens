import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_EMAIL, LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Serviço · Bíblia Origens" },
      { name: "description", content: "As regras de uso do aplicativo Bíblia Origens." },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <LegalPage current="termos" title="Termos de Serviço" lead="As regras para usar a Bíblia Origens. Ao criar uma conta, você concorda com elas.">
      <LegalSection n={1} title="O serviço">
        <p>
          A Bíblia Origens (<strong>bibliaorigens.app</strong>) é um aplicativo gratuito de leitura e estudo do Tanakh em
          português, hebraico e transliterado, com marcas, notas, guias de estudo e mapas. O uso exige uma conta.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Sua conta">
        <ul>
          <li>Você pode entrar com e-mail e senha ou com sua conta Google.</li>
          <li>Mantenha sua senha em segredo. Você responde pelo que for feito com a sua conta.</li>
          <li>Use informações verdadeiras e um e-mail que seja seu.</li>
          <li>Você pode pedir a exclusão da conta a qualquer momento, como descrito na Política de Privacidade.</li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Uso permitido">
        <p>O app é para uso pessoal de leitura e estudo. Não é permitido:</p>
        <ul>
          <li>tentar acessar contas ou dados de outras pessoas;</li>
          <li>sobrecarregar, copiar em massa ou atacar o serviço de forma automatizada;</li>
          <li>usar o app para qualquer finalidade ilegal.</li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Conteúdo do app">
        <p>
          A tradução, a transliteração, os textos de estudo, a marca, a logo e o design da Bíblia Origens pertencem ao projeto e
          são oferecidos para leitura e estudo pessoal. Citações curtas com indicação da fonte (“Bíblia Origens”) são bem-vindas;
          a reprodução integral ou comercial depende de autorização.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Suas notas">
        <p>
          As notas e marcas que você cria são suas. Nós as guardamos apenas para mostrá-las a você e sincronizá-las entre seus
          aparelhos, como explica a{" "}
          <Link to="/privacidade" className="text-tekhelet hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection n={6} title="Disponibilidade e garantias">
        <p>
          Trabalhamos para manter o app no ar e o conteúdo fiel ao texto original, mas o serviço é oferecido “como está”, sem
          garantia de funcionamento ininterrupto ou livre de erros. O acervo de textos é publicado aos poucos e pode mudar. Faça
          cópia das notas que forem importantes para você.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Suspensão">
        <p>
          Podemos suspender contas que violem estes termos, depois de avisar pelo e-mail cadastrado sempre que possível. Você
          pode deixar de usar o app quando quiser.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Mudanças nestes termos">
        <p>
          Se estes termos mudarem, atualizamos a data no topo desta página. Mudanças importantes também serão avisadas dentro do
          app; continuar usando depois do aviso significa concordar com a nova versão.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Lei aplicável e contato">
        <p>
          Estes termos seguem as leis do Brasil, incluindo o Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados.
          Dúvidas: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
