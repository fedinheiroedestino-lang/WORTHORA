import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'posts.json'
posts = json.loads(DATA.read_text())

BAD = re.compile(r'\b(40[- ]hour|40 continuous|50,000|calibrated|calibration|laboratory|lab bench|bench test|stress test|torture test|FLIR|thermal imager|decibel meter|we subjected|we deployed|we recorded|we measured|prime 2[- ]day|prime delivery|verified Amazon|verified store|verified ratings|independent testing facility|authorized US retail|A-to-z|Amazon US with Prime|zero throttling|without thermal throttling|lowest verified return|return rate)\b', re.I)
BAD_KEY = re.compile(r'(lab|bench|test|thermal|prime|verified|rating|sample|instrument|amazon|warranty|efficiency|output|acoustic|temperature)', re.I)

def replace_paragraph(match):
    tag, content = match.group(1), match.group(2)
    text = re.sub(r'<[^>]+>', ' ', content)
    if not BAD.search(text):
        return match.group(0)
    if re.search(r'prime|amazon|verified|return|warranty', text, re.I):
        safe = 'Retailer, price, shipping, return and warranty details vary by region and should be checked on the current product page.'
    else:
        safe = 'Worthora did not publish raw test notes for this claim. Treat this point as unverified until an editor attaches a dated source or original measurement.'
    return f'<{tag}>{safe}</{tag}>'

def revise_html(content):
    # Replace claim-heavy paragraphs and list items first.
    content = re.sub(r'<(p|li)(\s[^>]*)?>(.*?)</\1>', lambda m: replace_paragraph(type('M', (), {'group': lambda self, n: (m.group(1) + (m.group(2) or ''), m.group(3))[n-1]})()), content, flags=re.I|re.S)
    # The helper above is intentionally avoided for headings; normalize headline claims separately.
    content = re.sub(r'Worthora Lab 40-Hour Stress Test & Bench Protocol', 'How to compare the two products', content, flags=re.I)
    content = re.sub(r'Worthora Lab Bench Highlights & Key Takeaways', 'Key takeaways', content, flags=re.I)
    content = re.sub(r'Real-World Everyday Scenarios: How They Fit Your Routine', 'Real-world decision scenarios', content, flags=re.I)
    content = re.sub(r'A lab benchmark is only as valuable as its relevance to your actual daily routine:', 'A comparison is only useful when it maps to your actual daily routine:', content, flags=re.I)
    content = re.sub(r'(In-Depth Champion Breakdown|The Contender Breakdown|Head-to-Head Showdown Across 4 Decisive Pillars)', lambda m: m.group(1).replace('Champion', 'Product A').replace('Contender', 'Product B'), content, flags=re.I)
    content = re.sub(r'(?is)<div[^>]*class=["\'][^"\']*uol-ficha-tecnica[^>]*>.*?</div>\s*</div>', '<h2>Specification checklist</h2><p>Compare the exact model, region, compatibility, current price, return policy and warranty from primary sources before buying. No laboratory measurements are claimed in this legacy revision.</p>', content)
    content = re.sub(r'(?is)<div[^>]*class=["\'][^"\']*(transparencia-editorial|editorial-disclosure)[^>]*>.*?</div>', '', content)
    content += '<div class="editorial-disclosure"><p><strong>Editorial note:</strong> This legacy article has been revised to remove unsupported laboratory, retailer and verification claims. Product facts, prices, availability, ratings and warranty terms must be checked against dated primary sources before publication or purchase. Worthora may earn a commission from qualifying links.</p></div>'
    return content

def clean_title(title):
    title = re.sub(r'\b40[- ]Hour\b', 'Daily Use', title, flags=re.I)
    title = re.sub(r'\b(Benchmark|Bench Shootout|Workshop Test|Test|Review)\b', 'Comparison', title, flags=re.I)
    return re.sub(r'\s{2,}', ' ', title).strip()

for post in posts:
    post['title'] = clean_title(post.get('title', ''))
    post['excerpt'] = re.sub(r'\b(bench test|lab test|40[- ]hour|Prime|verified)\b', 'source-led', post.get('excerpt', ''), flags=re.I)
    post['contentHtml'] = revise_html(post.get('contentHtml', ''))
    post['updatedAt'] = '2026-10-20T00:00:00.000Z'
    post['editorialReviewStatus'] = 'needs-source-review'
    post['modelUsed'] = 'Legacy catalog — revised to remove unsupported claims'
    post['isFeatured'] = False
    post['isTrending'] = False
    post['quickVerdict'] = {
        'summary': 'Legacy article revised. No winner is presented as laboratory-verified until sources or original test notes are attached.',
        'overallScore': 0,
        'verdictBadge': 'Source review required',
        'winnerProductName': '',
        'subRatings': []
    }
    for product in post.get('products', []):
        product['isWinner'] = False
        product['rating'] = 0
        product['productDataStatus'] = 'unverified'
        product['exactMatchAmazon'] = False
        product['summary'] = 'Product details require source verification before publication.'
        product['pros'] = [p if not BAD.search(p) else 'Potential strength requires source verification.' for p in product.get('pros', [])]
        product['cons'] = [c if not BAD.search(c) else 'Potential limitation requires source verification.' for c in product.get('cons', [])]
        product['keySpecs'] = {k: v for k, v in product.get('keySpecs', {}).items() if not BAD_KEY.search(f'{k} {v}')}
        deal = product.get('amazonAdDeal')
        if isinstance(deal, dict):
            deal.update({'badge': '', 'ratingStars': 0, 'reviewsCount': 0, 'primeEligible': False, 'savingsPercentage': 0, 'monetizationScore': 0, 'affiliateVolume': '', 'dataStatus': 'unverified'})
    post['comparisonMatrix'] = [
        {'feature': 'Evidence status', 'values': ['Source review required', 'Source review required'], 'winnerIndex': -1},
        {'feature': 'Current price and availability', 'values': ['Check current retailer', 'Check current retailer'], 'winnerIndex': -1}
    ]
    post['faq'] = [
        {'question': 'Are the laboratory results verified?', 'answer': 'No laboratory result is claimed in this revised legacy article.'},
        {'question': 'Are price, ratings and availability current?', 'answer': 'No. Check the current product page and region-specific terms.'},
        {'question': 'Why was the article revised?', 'answer': 'Unsupported test and retailer claims were removed until a dated source or original test note is available.'}
    ]
    post['pluginReport'] = {
        'adSenseScore': 0,
        'adSenseChecks': [
            {'name': 'Legacy evidence review', 'status': 'warning', 'details': 'Source or original test notes still required before treating product claims as verified.'},
            {'name': 'Commercial data', 'status': 'warning', 'details': 'Price, availability, ratings and Prime status are not claimed as live data.'}
        ],
        'eeatLabNotes': {'ambientConditions': 'No verified lab record supplied', 'testingHours': 0, 'instrumentsUsed': [], 'samplesTested': 0},
        'seoTargetKeywords': [],
        'readabilityIndex': {'fleschScore': 60, 'readingLevel': 'Clear'},
        'wordCount': len(re.findall(r'\b\w+\b', re.sub(r'<[^>]+>', ' ', post['contentHtml']))),
        'pluginsExecuted': ['Legacy claim redaction', 'Evidence gate', 'Commercial data guard']
    }

DATA.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n')
print(f'Revised {len(posts)} legacy posts.')
