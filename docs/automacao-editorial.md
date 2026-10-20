
## Integrações Google configuradas

- **GA4**: Measurement ID `G-0WG5DGDLTW`, carregado pelo componente `GoogleIntegrations` a partir de `VITE_GA4_MEASUREMENT_ID`, com `anonymize_ip: true`.
- **Search Console**: a propriedade `worthora.blog` aparece verificada por **Provedor do nome de domínio**, conforme confirmação do administrador. Essa verificação é feita por DNS; portanto, não é necessário inserir uma meta tag HTML no projeto.
- **AdSense**: publisher `ca-pub-1323802134955418`, carregado somente quando os anúncios estão habilitados. IDs de slots continuam sendo usados apenas nos blocos configurados.

Para a hospedagem, copie as mesmas variáveis de `.env.production` para as variáveis de ambiente do provedor de deploy. Não dependa apenas de um arquivo local se o deploy for feito por CI/CD.

Após publicar, confirme no GA4 em **Relatórios > Tempo real** que uma visita aparece. No Search Console, envie ou mantenha `https://worthora.blog/sitemap.xml` em **Indexação > Sitemaps**. No AdSense, a aprovação da conta, o arquivo `ads.txt` e o preenchimento dos anúncios continuam dependendo da conta do publisher e das políticas do Google; o projeto não declara aprovação automática.
