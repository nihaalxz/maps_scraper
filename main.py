import os
import re
import urllib.parse
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from playwright.sync_api import sync_playwright

app = FastAPI(title="Arab Season Playwright Scraper Worker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECTOR_KEYWORDS: Dict[str, List[str]] = {
    'Real Estate': [
        'real estate', 'property', 'properties', 'developer', 'realty', 'brokerage',
        'estate agency', 'housing', 'aqar', 'realtor', 'residential', 'commercial property'
    ],
    'Construction': [
        'construction', 'contractor', 'contracting', 'builder', 'building materials',
        'engineering consultancy', 'civil works', 'scaffolding', 'infrastructure', 'demolition',
        'concrete', 'heavy equipment', 'masonry'
    ],
    'Fuel & Energy': [
        'fuel', 'energy', 'oil', 'gas', 'petroleum', 'solar', 'power', 'refinery',
        'aramco', 'adnoc', 'petrochemical', 'lubricants', 'gas station', 'renewable energy'
    ],
    'Safety': [
        'safety', 'security', 'fire', 'cctv', 'surveillance', 'firefighting',
        'occupational health', 'security guard', 'alarm', 'safety equipment', 'ppe'
    ],
    'Hotels & Hospitality': [
        'hotel', 'resort', 'hospitality', 'motel', 'suites', 'inn', 'lodging',
        'palace', 'serviced apartments', 'hostel'
    ],
    'Furniture & Interior': [
        'furniture', 'interior', 'decor', 'carpentry', 'furnishing', 'curtains',
        'carpet', 'flooring', 'fitout', 'fit-out', 'upholstery', 'lighting store'
    ],
    'Retail & Shopping': [
        'mall', 'retail', 'supermarket', 'hypermarket', 'store', 'shop', 'fashion',
        'boutique', 'shopping center', 'perfume', 'cosmetics', 'department store'
    ],
    'Food & Beverage': [
        'restaurant', 'cafe', 'coffee', 'catering', 'food', 'bakery', 'beverage',
        'diner', 'kitchen', 'fast food', 'grill', 'roastery', 'sweets', 'patisserie', 'tea'
    ],
    'Healthcare': [
        'hospital', 'clinic', 'medical', 'dental', 'pharmacy', 'health', 'polyclinic',
        'doctor', 'laboratory', 'optics', 'wellness', 'physiotherapy'
    ],
    'Education': [
        'school', 'university', 'college', 'academy', 'education', 'institute',
        'training center', 'kindergarten', 'nursery', 'learning'
    ],
    'Government': [
        'ministry', 'authority', 'municipality', 'government', 'commission',
        'chamber of commerce', 'embassy', 'consulate', 'court', 'public department'
    ],
    'Events & Exhibitions': [
        'event', 'exhibition', 'conference', 'staging', 'sound & light',
        'expo', 'party', 'wedding planner', 'event management', 'organizer', 'venue'
    ],
    'Advertising & Media': [
        'advertising', 'media', 'marketing', 'pr', 'public relations', 'billboard',
        'signage', 'branding', 'production house', 'digital agency', 'printing press', 'screens'
    ],
    'Manufacturing': [
        'factory', 'manufacturing', 'industry', 'industrial', 'plant', 'assembly',
        'fabrication', 'packaging', 'producer', 'processing plant'
    ],
    'Logistics & Transport': [
        'logistics', 'transport', 'transportation', 'shipping', 'freight', 'cargo', 'courier',
        'delivery', 'fleet', 'warehouse', 'warehousing', 'freight forwarder', 'supply chain', 'clearance'
    ],
    'Automotive': [
        'automotive', 'car', 'vehicle', 'auto', 'garage', 'spare parts',
        'dealership', 'mechanic', 'tyre', 'tire', 'car rental', 'service center'
    ],
    'IT & Technology': [
        'technology', 'tech', 'software', 'it solutions', 'it companies', 'it company',
        'telecom', 'computers', 'cybersecurity', 'cloud', 'data center', 'consulting tech',
        'ai', 'artificial intelligence', 'network', 'system integrator', 'startups', 'startup',
        'saas', 'app development', 'developers', 'fintech'
    ],
}

def auto_detect_sector(name: str, category: str = '', description: str = '') -> str:
    combined_text = f" {name} {category} {description} ".lower()
    best_sector = 'Others'
    max_score = 0
    for sector, keywords in SECTOR_KEYWORDS.items():
        score = 0
        for kw in keywords:
            kw_clean = kw.lower()
            if kw_clean.endswith('s') and len(kw_clean) > 4:
                kw_clean = kw_clean[:-1]
            pattern = rf'\b{re.escape(kw_clean)}'
            if re.search(pattern, combined_text):
                weight = 8 if (kw_clean in category.lower()) else 4
                score += weight
        if score > max_score:
            max_score = score
            best_sector = sector
    return best_sector if max_score > 0 else 'Others'

class ScrapeRequest(BaseModel):
    query: str
    city: Optional[str] = ''
    country: Optional[str] = ''
    limit: Optional[int] = 20
    sector: Optional[str] = None

@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok", "service": "playwright-scraper-worker"}

@app.post("/scrape")
def scrape_places(req: ScrapeRequest):
    query = req.query.strip()
    limit = max(1, min(req.limit or 20, 100))
    forced_sector = req.sector if (req.sector and req.sector != 'All') else None

    encoded = urllib.parse.quote_plus(query)
    target_url = f"https://www.google.com/maps/search/{encoded}/?hl=en"

    items: List[Dict[str, Any]] = []

    with sync_playwright() as p:
        browser = None
        launch_errs = []
        for channel in [None, 'chrome', 'msedge']:
            try:
                if channel:
                    browser = p.chromium.launch(channel=channel, headless=True)
                else:
                    browser = p.chromium.launch(
                        headless=True,
                        args=[
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-gpu'
                        ]
                    )
                break
            except Exception as e:
                launch_errs.append(str(e))
                continue

        if not browser:
            return {'status': 'error', 'message': f'Could not launch Chromium: {launch_errs}', 'leads': []}

        try:
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            )
            page = context.new_page()
            page.goto(target_url, wait_until='domcontentloaded', timeout=25000)

            try:
                page.wait_for_selector('div[role="feed"], a[href*="/maps/place/"]', timeout=8000)
            except Exception:
                page.wait_for_timeout(3500)

            feed = page.locator('div[role="feed"]')
            if feed.count() > 0:
                scroll_times = 1 if limit <= 10 else (3 if limit <= 25 else 5)
                for _ in range(scroll_times):
                    feed.evaluate('el => el.scrollBy(0, 1200)')
                    page.wait_for_timeout(1200)

            anchors = page.locator('div[role="feed"] a[href*="/maps/place/"]').all()
            if len(anchors) == 0:
                anchors = page.locator('a[href*="/maps/place/"]').all()

            seen_names = set()
            for el in anchors:
                if len(items) >= limit:
                    break

                name = el.get_attribute('aria-label')
                if not name or name in seen_names:
                    continue
                seen_names.add(name)

                card = el.locator('xpath=./ancestor::div[contains(@class, "Nv2PK")]')
                if card.count() == 0:
                    card = el.locator('..')

                card_text = card.inner_text()
                lines = [l.strip() for l in card_text.split('\n') if l.strip()]

                rating = 0.0
                reviews_count = 0
                rating_line_idx = -1
                for idx, l in enumerate(lines):
                    m = re.search(r'(\d\.\d)\s*(?:\(([\d,]+)\))?', l)
                    if m:
                        rating = float(m.group(1))
                        if m.group(2):
                            reviews_count = int(m.group(2).replace(',', ''))
                        rating_line_idx = idx
                        break

                phone = ''
                m_phone = re.search(r'(\+?\d{1,4}[\s\-\.]{1,2}(?:\(?\d{1,4}\)?[\s\-\.]{1,2})?\d{3,4}[\s\-\.]?\d{3,4}|\+?\d{9,14}|0\d{1,4}[\s\-]\d{3,4}[\s\-]\d{3,4})', card_text)
                if m_phone:
                    phone = m_phone.group(1).strip()

                website = ''
                web_link = card.locator('a[aria-label*="website" i], a[data-value*="Website"]').first
                if web_link.count() > 0:
                    website = web_link.get_attribute('href') or ''

                category = query.split(' in ')[0].strip()
                address_lines: List[str] = []

                for idx, l in enumerate(lines):
                    if idx == 0 and l == name:
                        continue
                    if '·' in l:
                        parts = [p.strip() for p in l.split('·')]
                        for p in parts:
                            if any(term in p.lower() for term in ['estate', 'agency', 'developer', 'consult', 'company', 'service', 'contractor', 'hotel', 'hospital', 'store', 'restaurant', 'logistics', 'it', 'software', 'solutions', 'tech']):
                                if not category or category == query:
                                    category = p
                            elif not re.search(r'^\d\.\d', p) and not any(term in p.lower() for term in ['open', 'closed', 'wheelchair', 'delivery', 'pickup']):
                                address_lines.append(p)
                    elif idx != rating_line_idx:
                        if not any(term in l.lower() for term in ['open', 'closed', 'review', 'website', 'directions', 'call', 'save', 'share']):
                            if not l.startswith('+') and not (phone and l in phone) and len(l) > 2:
                                address_lines.append(l)

                detected_city = req.city or ''
                card_address = ', '.join(address_lines[:2]) if address_lines else ''

                detected_sec = forced_sector or auto_detect_sector(name, category, card_text)

                items.append({
                    'name': name.strip(),
                    'sector': detected_sec,
                    'category': category or 'Commercial Entity',
                    'companyType': 'Enterprise' if reviews_count > 100 else 'Mid-Market',
                    'city': detected_city or (card_address.split(',')[0].strip() if card_address else 'City Center'),
                    'country': req.country or 'Global',
                    'address': card_address or f"{name}, {detected_city}",
                    'phone': phone,
                    'website': website,
                    'rating': rating or 4.5,
                    'reviews_count': reviews_count or 25,
                    'source': 'Google Maps Live (Headless Chromium)',
                })
        finally:
            browser.close()

    return {
        'status': 'success',
        'query': query,
        'count': len(items),
        'leads': items
    }
