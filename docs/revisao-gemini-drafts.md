# Revisão de drafts com Gemini

O comando `npm run review:drafts` revisa os artigos legados com `gemini-3.8-flash` por meio do proxy LLM do ambiente. A resposta exige JSON Schema estrito e só pode alterar o resumo, HTML editorial, FAQ, orientação de compra e tags.

A instrução do revisor proíbe inventar especificações, testes, medições, ratings, preços, descontos, Prime, estoque, vendas, garantia ou vencedores. Também restringe o HTML a elementos editoriais seguros. O script grava backup em `data/posts.before-gemini-review.json` e relatório em `data/gemini-review-report.json`.

A revisão de 2026-10-20 atualizou 26 drafts e teve zero falhas. Todos continuam com `status: draft`, `editorialReviewStatus: needs-source-review`, `evidence: []`, score zero e vencedor vazio. Isso é obrigatório: o Gemini não recebe fontes verificáveis, então não deve transformar uma reescrita em publicação.

Para publicar um artigo, um editor deve anexar pelo menos uma evidência válida por alegação factual (`https://`, título, data de acesso e `sourceType` permitido), revisar o modelo exato e a região, confirmar monetização e marcar explicitamente `status: published` e `editorialReviewStatus: reviewed`. Depois execute, nesta ordem:

```bash
npm run sync:catalog
npm run validate:catalog
npm run lint
npm run build
```

Sem fontes, a saída pública permanece vazia por design.
