import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade · Bíblia Origens" },
      { name: "description", content: "Quais dados a Bíblia Origens guarda, para quê, onde e como pedir a exclusão." },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <LegalPage
      current="privacidade"
      title="Política de Privacidade"
      lead="Quais dados a Bíblia Origens guarda, para que servem, onde ficam e como você controla tudo isso."
    >
      <LegalSection n={1} title="Quem somos">
        <p>
          A Bíblia Origens (<strong>bibliaorigens.app</strong>) é um aplicativo de leitura do Tanakh em português, hebraico e
          transliterado. O responsável pelo aplicativo e pelo tratamento dos dados descritos aqui é a{" "}
          <strong>Innovati Soluções Web</strong>, dirigida por Fábio Araujo, que pode ser contatada pelo e-mail{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Dados que guardamos">
        <p>Guardamos apenas o necessário para você entrar no app e retomar a leitura em qualquer aparelho:</p>
        <ul>
          <li>
            <strong>Conta:</strong> nome, e-mail e, se você entrar com o Google, a foto do perfil. Se criar conta com e-mail e
            senha, a senha é guardada apenas de forma cifrada (nunca em texto legível).
          </li>
          <li>
            <strong>Sessão:</strong> um identificador de sessão, o endereço IP e o tipo de navegador do acesso, usados para manter
            você conectado e proteger a conta.
          </li>
          <li>
            <strong>Estudo:</strong> o ponto de leitura, os versículos e capítulos guardados, as notas que você escreve, o
            progresso nos guias e as preferências de leitura (tema, tamanho do texto, sinais vocálicos).
          </li>
        </ul>
        <p>
          Não coletamos localização, contatos, dados de pagamento nem informações sensíveis. Não usamos ferramentas de
          estatística, publicidade ou rastreamento.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Login com o Google">
        <p>
          Ao escolher “Continuar com Google”, o Google nos informa apenas seu nome, e-mail e foto do perfil, que você autoriza na
          tela do Google. Não temos acesso à sua senha do Google, ao Gmail, ao Drive nem a qualquer outro dado da sua conta
          Google.
        </p>
        <p>
          O uso das informações recebidas das APIs do Google segue a{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
            Política de Dados do Usuário dos Serviços de API do Google
          </a>
          , incluindo os requisitos de Uso Limitado.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Para que usamos os dados">
        <ul>
          <li>Identificar você e manter sua sessão ativa.</li>
          <li>Sincronizar marcas, notas e ponto de leitura entre seus aparelhos.</li>
          <li>Responder quando você entrar em contato.</li>
        </ul>
        <p>
          Não vendemos, alugamos nem compartilhamos seus dados para publicidade. A base legal é a execução do serviço que você
          pediu ao criar a conta (Lei Geral de Proteção de Dados, art. 7º, V).
        </p>
      </LegalSection>

      <LegalSection n={5} title="Onde os dados ficam">
        <p>Usamos estes serviços para hospedar o app e guardar os dados, que agem apenas sob nossas instruções:</p>
        <ul>
          <li>
            <strong>Cloudflare:</strong> hospedagem do aplicativo e do domínio.
          </li>
          <li>
            <strong>Neon:</strong> banco de dados da conta e do estudo, em servidores na região de São Paulo.
          </li>
          <li>
            <strong>Google:</strong> login com Google e as fontes tipográficas do app (Google Fonts), que recebem o endereço IP
            ao carregar as letras.
          </li>
        </ul>
        <p>
          Parte das preferências e do estudo também fica guardada no próprio aparelho (armazenamento local do navegador), para o
          app funcionar mesmo antes de sincronizar.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Cookies">
        <p>
          Usamos apenas cookies essenciais de sessão, que mantêm você conectado com segurança. Não usamos cookies de publicidade
          ou de rastreamento.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Por quanto tempo guardamos">
        <p>
          Os dados ficam guardados enquanto sua conta existir. As sessões expiram sozinhas. Quando você pede a exclusão da conta,
          apagamos a conta, as sessões e todo o estudo associado em até 30 dias.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Seus direitos">
        <p>
          Pela LGPD, você pode a qualquer momento pedir acesso aos seus dados, correção, cópia (portabilidade) ou exclusão da
          conta. Basta escrever para <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> a partir do e-mail cadastrado.
          Respondemos em até 15 dias.
        </p>
        <p>
          Se entrou com o Google, você também pode retirar o acesso do app em{" "}
          <a href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">
            myaccount.google.com/connections
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n={9} title="Segurança">
        <p>
          Todo o tráfego usa conexão cifrada (HTTPS), as senhas são guardadas cifradas e cada pessoa só tem acesso aos próprios
          dados. Nenhum sistema é totalmente imune a falhas; se houver um incidente que afete seus dados, avisaremos.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Crianças">
        <p>
          O app não é direcionado a menores de 13 anos e não coletamos dados deles de forma consciente. Se isso acontecer,
          escreva para nós e apagaremos os dados.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Mudanças nesta política">
        <p>
          Se esta política mudar, atualizamos a data no topo desta página. Mudanças importantes também serão avisadas dentro do
          app.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
