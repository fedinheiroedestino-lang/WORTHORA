# Autenticação administrativa pelo Firebase

O painel administrativo agora usa Firebase Authentication com o provedor Google. A única conta autorizada no código e nas regras Firestore é `fedinheiroedestino@gmail.com`. O e-mail também precisa estar verificado pelo Google.

## Ativação no Firebase Console

No projeto `gen-lang-client-0667005849`, abra **Authentication → Sign-in method → Google** e ative o provedor. Em **Authentication → Settings → Authorized domains**, confirme `worthora.blog` e o domínio usado para desenvolvimento.

Depois publique as regras de `firestore.rules`. Elas permitem leitura pública, mas somente o usuário autenticado cujo token tenha exatamente o e-mail autorizado e `email_verified == true` pode criar, atualizar ou excluir documentos em `posts` e `settings/global`.

## Fluxo implementado

O botão “Entrar com Google” abre `signInWithPopup`. Após o retorno, o frontend verifica o e-mail e o estado de verificação. Uma conta diferente é imediatamente desconectada. A sessão é observada por `onAuthStateChanged`; não há senha, token administrativo ou credencial em `localStorage`.

O Firestore é a barreira definitiva. A checagem no frontend melhora a experiência, mas não é considerada controle de segurança suficiente.

## Teste

1. Abra o painel e clique em **Entrar com Google**.
2. Escolha `fedinheiroedestino@gmail.com`.
3. Faça uma alteração de rascunho e confirme que ela salva no Firestore.
4. Teste com outra conta Google: o login deve ser recusado.
5. No Firestore Rules Playground, teste uma escrita com `request.auth.token.email` diferente; o resultado esperado é `false`.

O backend Express legado continua existindo para automações, mas não é mais a fonte do login do painel. As operações de conteúdo feitas diretamente pelo frontend passam a ser autorizadas pelo Firebase Auth e pelas regras do Firestore.
