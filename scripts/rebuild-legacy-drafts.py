import html, json, re
from pathlib import Path
root=Path('/home/ubuntu/audit-worthora/worthora-project')
path=root/'data/posts.json'; posts=json.loads(path.read_text())
for post in posts:
    products=post.get('products', [])[:2]
    names=[p.get('name') or p.get('model') or 'Produto não identificado' for p in products]
    a,b=(names+['Opção B'])[:2]
    category=html.escape(post.get('categoryLabel','esta categoria'))
    ae,be=map(html.escape,names[:2]) if len(names)>=2 else (html.escape(a),html.escape(b))
    post['excerpt']=f'Rascunho de comparação source-led entre {a} e {b}. A publicação depende de fontes atuais, região, preço e revisão editorial.'
    post['contentHtml']=f'''<p class="uol-lead">Este é um rascunho editorial de comparação entre <strong>{ae}</strong> e <strong>{be}</strong>. Ele foi preparado para organizar a decisão de compra, mas ainda não apresenta vencedor, rating, preço atual ou resultado de laboratório.</p>
<h2>O que esta comparação precisa responder</h2>
<p>Leitores da categoria {category} precisam saber qual opção corresponde melhor ao seu uso, orçamento, compatibilidade e tolerância a limitações. A versão publicada deve responder essas perguntas com fontes datadas e específicas para o modelo e a região.</p>
<h2>Perfil de {ae}</h2>
<p>Antes da publicação, o editor deve confirmar a identidade exata do produto, especificações na página oficial, acessórios incluídos, compatibilidade, garantia e disponibilidade regional. Nenhuma característica é tratada como verificada neste rascunho.</p>
<h2>Perfil de {be}</h2>
<p>O segundo produto deve passar pela mesma checagem. A comparação só é justa quando os modelos, versões e condições de uso são equivalentes e quando diferenças importantes são explicadas ao leitor.</p>
<h2>Como decidir entre as duas opções</h2>
<ul><li>Confirme o modelo e a versão regional antes de comparar preços.</li><li>Compare somente especificações sustentadas por fonte primária ou varejista confiável.</li><li>Registre limitações, devolução, garantia e custo total, não apenas o preço exibido.</li><li>Não trate avaliações, estoque, frete ou selo de marketplace como permanentes.</li></ul>
<h2>O que ainda precisa ser verificado</h2>
<p>Este rascunho precisa de fontes para cada alegação factual, data de acesso, região de venda e, se houver teste original, protocolo, amostra, instrumento e dados brutos. Sem isso, o texto não deve declarar testes, medições, rankings, ratings ou um vencedor.</p>
<h2>Quem deve considerar cada opção</h2>
<p>{ae} pode ser recomendado somente depois que suas vantagens documentadas forem comparadas ao perfil real do leitor. {be} deve ser tratado da mesma forma. A decisão final precisa explicar trade-offs, não repetir superlativos.</p>
<h2>FAQ</h2>
<h3>Os resultados de laboratório estão verificados?</h3><p>Não. Nenhum resultado de laboratório é afirmado neste rascunho.</p>
<h3>O preço e a disponibilidade estão atuais?</h3><p>Não. O leitor deve conferir a página atual do varejista e os termos da sua região.</p>
<h3>Quando este texto poderá ser publicado?</h3><p>Depois que um editor anexar fontes, revisar as alegações e aprovar o status editorial.</p>
<div class="editorial-disclosure"><p><strong>Nota editorial:</strong> Rascunho sujeito a revisão de fontes. Worthora pode receber comissão por links qualificáveis, sem influência sobre a conclusão.</p></div>'''
    post['evidence']=[]
    post['status']='draft'; post['editorialReviewStatus']='needs-source-review'
    post['quickVerdict']={'summary':'No winner is declared until dated sources or original test notes are attached.','overallScore':0,'verdictBadge':'Source review required','winnerProductName':'','subRatings':[]}
    post['comparisonMatrix']=[{'feature':'Evidence status','values':['Source review required','Source review required'],'winnerIndex':-1}]
    post['whoShouldBuy']=['Readers whose use case is documented after source review.']
    post['whoShouldSkip']=['Readers who need current price, availability or performance claims before the evidence review is complete.']
    post['faq']=[{'question':'Are laboratory results verified?','answer':'No. This draft makes no laboratory claims.'},{'question':'Are price and availability current?','answer':'No. Check the current retailer page for your region.'},{'question':'Why is this a draft?','answer':'Sources and editorial review are still required.'}]
    post['updatedAt']='2026-10-20T00:00:00.000Z'
    post['modelUsed']='Deterministic evidence-gated legacy draft rewrite'
    post['pluginReport']['eeatLabNotes']={'ambientConditions':'No verified lab record supplied','testingHours':0,'instrumentsUsed':[],'samplesTested':0}
    post['pluginReport']['adSenseScore']=0
json.dump(posts,path.open('w'),ensure_ascii=False,indent=2); path.open('a').write('\n')
print('rebuilt',len(posts),'legacy drafts')
