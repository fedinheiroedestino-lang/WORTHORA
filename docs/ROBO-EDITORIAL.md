# Robô editorial do Worthora

## Como cada artigo é produzido
1. **Tema**: equilibra as categorias e evita repetição (`selectNextTopic`). Subtítulos que alegavam "testes" são descartados; só "Produto A vs. Produto B" é usado.
2. **Pesquisa real**: Gemini com Google Search coleta especificações, avaliações de veículos independentes e problemas conhecidos, com as fontes. Menos de 4 fontes distintas → **aborta, nada é publicado**.
3. **Redação** (JSON estruturado, 1.500+ palavras): só usa fatos das notas de pesquisa, atribui a fonte ("segundo o RTINGS...") e nunca afirma testes, laboratório ou posse dos produtos. O HTML é montado pelo código (texto sempre escapado).
4. **Imagens conectadas ao conteúdo**: uma busca por seção (Pexels/Unsplash; Wikimedia para fotos de modelos específicos). Um modelo de visão confere se a foto realmente mostra o tema e se não tem marca d'água/texto; a descrição verificada vira o `alt`. Sem repetir foto, com legenda e crédito. Cartão de produto só usa foto do produto exato; senão, logo.
5. **Portão de qualidade** (determinístico): palavras, seções, FAQ, 2+ produtos com prós/contras/specs, nenhuma alegação proibida, nenhum placeholder, números com unidade presentes nas notas de pesquisa, 2+ fontes citadas no texto, 3+ imagens (2+ verificadas), título não duplicado. Reprovou → até 2 revisões automáticas com a lista de problemas.
6. **Resultado**: aprovado → publicado. Reprovado → **rascunho** (visível só ao admin, fora do site, sitemap, RSS e espelho público).

## O que o robô NÃO faz mais
Inventar medições, preços, ASIN, estrelas, nº de avaliações, selos ("Amazon's Choice") ou descontos; publicar template genérico quando a API falha.

## Configuração mínima (.env)
`GEMINI_API_KEY` + (`PEXELS_API_KEY` ou `UNSPLASH_ACCESS_KEY`).
Sem chave de imagens, os artigos ficam como rascunho por falta de imagens relevantes.

## Revisão humana
Recomendado: leia os rascunhos e os 3-5 primeiros artigos publicados. O portão reduz erros, mas não substitui checar fatos e preços antes de monetizar.
