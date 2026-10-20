import asyncio, copy, json, os, re, shutil
from pathlib import Path
from openai import AsyncOpenAI

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'posts.json'
BACKUP = ROOT / 'data' / 'posts.before-gemini-review.json'
MODEL = 'gemini-3.8-flash'

SCHEMA = {
  'type':'object','additionalProperties':False,
  'properties':{
    'excerpt':{'type':'string'},
    'contentHtml':{'type':'string'},
    'whoShouldBuy':{'type':'array','items':{'type':'string'}},
    'whoShouldSkip':{'type':'array','items':{'type':'string'}},
    'faq':{'type':'array','items':{'type':'object','additionalProperties':False,'properties':{'question':{'type':'string'},'answer':{'type':'string'}},'required':['question','answer']}},
    'tags':{'type':'array','items':{'type':'string'}},
    'publishReady':{'type':'boolean'},
    'evidence':{'type':'array','items':{'type':'object','additionalProperties':False,'properties':{'claim':{'type':'string'},'url':{'type':'string'},'title':{'type':'string'},'accessedAt':{'type':'string'},'sourceType':{'type':'string','enum':['primary','retailer','secondary','original-test']}},'required':['claim','url','title','accessedAt','sourceType']}},
    'revisionNotes':{'type':'array','items':{'type':'string'}}
  },
  'required':['excerpt','contentHtml','whoShouldBuy','whoShouldSkip','faq','tags','publishReady','evidence','revisionNotes']
}

SYSTEM = '''You are Worthora's evidence-first editorial reviewer. Revise exactly one existing buyer-guide draft into clear, engaging American English without adding facts.

Hard constraints:
1. Use only the supplied draft and product names. Do not research or infer product specifications.
2. Never claim testing, measurements, lab work, instruments, ratings, prices, discounts, Prime, stock, warranty, sales, user counts, safety or a winner.
3. Keep the article a draft: publishReady must be false and evidence must be an empty array because no sources are supplied.
4. Produce valid, safe HTML using only p, h2, h3, ul, ol, li, strong, em, a, section and div. No script, style, iframe, forms, event attributes or javascript URLs.
5. Make it genuinely useful: open with the buyer dilemma; compare decision criteria; name trade-offs without factual claims; include a before-you-buy checklist; include three honest FAQs; recommend two kinds of relevant next reading without inventing URLs.
6. Do not use boilerplate such as “we tested”, “lab”, “benchmark”, “winner”, “best on Amazon”, “Prime”, or precise numerical claims.
7. Return JSON only matching the schema.'''


def clean_html(text: str) -> str:
    text = re.sub(r'<\s*(script|style|iframe|object|embed|form)[^>]*>.*?<\s*/\1\s*>', '', text, flags=re.I|re.S)
    text = re.sub(r'\son\w+\s*=\s*(["\']).*?\1', '', text, flags=re.I|re.S)
    text = re.sub(r'\s(href|src)\s*=\s*(["\'])\s*javascript:[^"\']*\2', '', text, flags=re.I)
    return text.strip()

async def revise(client, post):
    products = [{'name': p.get('name',''), 'brand': p.get('brand',''), 'model': p.get('model','')} for p in post.get('products',[])[:2]]
    user = {
      'title': post.get('title',''),
      'category': post.get('categoryLabel',''),
      'products': products,
      'currentExcerpt': post.get('excerpt',''),
      'currentDraftHtml': post.get('contentHtml','')[:18000],
      'currentFaq': post.get('faq',[])[:5],
      'currentBuyerGuidance': {'buy':post.get('whoShouldBuy',[])[:5], 'skip':post.get('whoShouldSkip',[])[:5]}
    }
    response = await client.chat.completions.create(
      model=MODEL,
      messages=[{'role':'system','content':SYSTEM},{'role':'user','content':json.dumps(user,ensure_ascii=False)}],
      max_tokens=5000,
      response_format={'type':'json_schema','json_schema':{'name':'worthora_draft_revision','strict':True,'schema':SCHEMA}}
    )
    raw = response.choices[0].message.content
    result = json.loads(raw)
    result['contentHtml'] = clean_html(result['contentHtml'])
    result['evidence'] = []
    result['publishReady'] = False
    return result

async def main():
    posts = json.loads(DATA.read_text())
    if not BACKUP.exists(): shutil.copy2(DATA, BACKUP)
    client = AsyncOpenAI()
    sem = asyncio.Semaphore(4)
    async def one(i,p):
      async with sem:
        for attempt in range(2):
          try: return i, await revise(client,p), None
          except Exception as e:
            if attempt == 1: return i, None, str(e)
            await asyncio.sleep(1)
    results = await asyncio.gather(*(one(i,p) for i,p in enumerate(posts)))
    updated=0; failures=[]
    for i, revision, error in results:
      if error:
        failures.append({'slug':posts[i].get('slug'),'error':error}); continue
      p=posts[i]
      for key in ['excerpt','contentHtml','whoShouldBuy','whoShouldSkip','faq','tags']:
        p[key]=revision[key]
      p['evidence']=[]
      p['status']='draft'; p['editorialReviewStatus']='needs-source-review'
      p['quickVerdict']={'summary':'Draft: evidence review required before declaring a winner.','overallScore':0,'verdictBadge':'Draft — evidence review required','winnerProductName':'','subRatings':[]}
      p['comparisonMatrix']=[{'feature':'Evidence status','values':['Source review required','Source review required'],'winnerIndex':-1}]
      p['modelUsed']='Google Gemini 3.8 Flash — evidence-gated draft revision'
      p['updatedAt']='2026-10-20T00:00:00.000Z'
      updated += 1
    DATA.write_text(json.dumps(posts,ensure_ascii=False,indent=2)+'\n')
    report={'model':MODEL,'updated':updated,'failed':failures,'publishable':0,'reason':'No supplied evidence; human source review remains mandatory.'}
    (ROOT/'data'/'gemini-review-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False))

if __name__ == '__main__': asyncio.run(main())
