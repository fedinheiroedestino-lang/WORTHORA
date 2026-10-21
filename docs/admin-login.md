# Login administrativo do Worthora

## Diagnóstico atual

O domínio `https://worthora.blog` está publicado como site estático. No deploy atual, `/api/admin/auth` retorna `404`, portanto o formulário não tem um servidor para autenticar. O `server.ts` existe no repositório, mas não é executado pelo build Netlify atual. Além disso, o servidor retorna `503 Admin authentication is not configured` se `ADMIN_EMAIL` e uma credencial administrativa não estiverem configurados.

Não restaure senha padrão no frontend. Isso reabriria a vulnerabilidade que foi removida.

## Configuração recomendada

1. Hospede `server.ts` em um serviço Node persistente ou serverless com armazenamento adequado para a operação administrativa. O servidor usa armazenamento local para o catálogo; portanto, um filesystem efêmero não é suficiente para produção sem migrar o storage para Firestore, Postgres, S3 ou equivalente.
2. Configure no backend, como secrets:

```text
ADMIN_EMAIL=seu-email-de-admin
ADMIN_SECRET_KEY=uma-chave-longa-e-aleatoria
ADMIN_ALLOWED_ORIGIN=https://worthora.blog
GEMINI_API_KEY=...
```

3. Teste `POST /api/admin/auth` nesse backend. A resposta deve ser `200` com `success: true` e token efêmero.
4. No build frontend, configure:

```text
VITE_ADMIN_API_BASE_URL=https://api.seu-dominio.example
```

5. Gere o frontend novamente e publique o `dist`.

O frontend agora usa `VITE_ADMIN_API_BASE_URL` para autenticação, verificação, logout, alteração de senha, auditoria e automações administrativas. Se a variável ficar vazia, ele tenta o mesmo domínio, útil quando existe um reverse proxy que encaminha `/api/*` para o Node.

## Verificação rápida

```bash
curl -i -X POST https://api.seu-dominio.example/api/admin/auth \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email-de-admin","passkey":"SUA_CHAVE"}'
```

Não registre a resposta contendo o token. Depois de confirmar o login, remova o valor de `passkey` do histórico do terminal e configure os secrets diretamente na hospedagem.
