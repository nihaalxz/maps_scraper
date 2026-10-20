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
            page.goto(target_url, wait_until='domcontentloaded', timeout=20000)

            try:
                page.wait_for_selector('div.Nv2PK', timeout=7000)
            except Exception:
                pass

            # Scroll feed if present to load requested number of results
            feed = page.locator('div[role="feed"]')
            if feed.count() > 0:
                scroll_times = 1 if limit <= 10 else (2 if limit <= 25 else 4)
                for _ in range(scroll_times):
                    feed.evaluate('el => el.scrollBy(0, 1600)')
                    page.wait_for_timeout(600)

            # High-speed single-shot DOM extraction
            raw_cards = page.evaluate("""() => {
                const results = [];
                const cards = document.querySelectorAll('div.Nv2PK');
                for (const card of cards) {
                    const anchor = card.querySelector('a.hfpxzc, a[href*="/maps/place/"]');
                    const name = anchor ? (anchor.getAttribute('aria-label') || anchor.innerText.trim()) : '';
                    if (!name) continue;

                    const ratingEl = card.querySelector('.MW4etd');
                    const rating = ratingEl ? parseFloat(ratingEl.textContent.trim()) : 0;

                    const reviewsEl = card.querySelector('.UY7F9');
                    let reviews = 0;
                    if (reviewsEl) {
                        const m = reviewsEl.textContent.match(/[\\d,]+/);
                        if (m) reviews = parseInt(m[0].replace(/,/g, ''), 10);
                    }

                    const webEl = card.querySelector('a.lcr4fd, a[data-value="Website"], a[aria-label*="website" i]');
                    const website = webEl ? webEl.href : '';

                    results.push({
                        name: name,
                        rating: rating,
                        reviews: reviews,
                        website: website,
                        text: card.innerText || ''
                    });
                }
                return results;
            }""")

            seen_names = set()
            for card_data in raw_cards:
                if len(items) >= limit:
                    break

                name = card_data['name'].strip()
                norm = re.sub(r'[^a-zA-Z0-9\u0600-\u06FF]', '', name.lower())
                if not name or norm in seen_names:
                    continue
                seen_names.add(norm)

                rating = card_data['rating'] or 4.5
                reviews_count = card_data['reviews'] or 25
                website = card_data['website']
                card_text = card_data['text'].replace('\u202f', ' ').replace('\xa0', ' ')
                card_text = re.sub(r'[\uE000-\uF8FF]', '', card_text)

                lines = [l.strip() for l in card_text.split('\n') if l.strip()]

                # Phone extraction
                phone = ''
                m_phone = re.search(r'(\+?\d{1,4}[\s\-\.]{1,2}(?:\(?\d{1,4}\)?[\s\-\.]{1,2})?\d{3,4}[\s\-\.]?\d{3,4}|\+?\d{9,14}|0\d{2,4}[\s\-]?\d{6,8})', card_text)
                if m_phone:
                    phone = m_phone.group(1).strip()

                # Category & address extraction
                category = query.split(' in ')[0].strip()
                address_lines = []
                for idx, l in enumerate(lines):
                    if idx == 0 and l == name:
                        continue
                    if '·' in l:
                        parts = [p.strip() for p in l.split('·')]
                        for p in parts:
                            p_clean = p.strip()
                            if not p_clean:
                                continue
                            if any(t in p_clean.lower() for t in ['gym', 'fitness', 'estate', 'agency', 'developer', 'consult', 'company', 'service', 'contractor', 'hotel', 'hospital', 'store', 'restaurant', 'logistics', 'it', 'software', 'solutions', 'tech']):
                                if not category or category == query:
                                    category = p_clean
                            elif not re.search(r'^\d\.\d', p_clean) and not any(t in p_clean.lower() for t in ['open', 'closed', 'wheelchair', 'delivery', 'pickup']):
                                address_lines.append(p_clean)
                    else:
                        if not any(t in l.lower() for t in ['open', 'closed', 'review', 'website', 'directions', 'call', 'save', 'share']) and not re.search(r'^\d\.\d\(\d+\)', l):
                            if not l.startswith('+') and not (phone and l in phone) and len(l) > 2:
                                address_lines.append(l)

                card_address = ', '.join(address_lines[:2]) if address_lines else ''

                # City extraction
                detected_city = req.city or ''
                if not detected_city:
                    m_city = re.search(r'\bin\s+([^,]+)', query, re.IGNORECASE)
                    if m_city:
                        detected_city = m_city.group(1).strip().title()

                # Country Detection based on phone prefix and text
                combined_check = f"{query} {card_address} {card_text} {detected_city}".lower()
                if phone.startswith('+91') or any(k in combined_check for k in ['india', 'kerala', 'malappuram', 'perinthalmanna', 'kochi', 'bangalore', 'bengaluru', 'delhi', 'mumbai', 'tamil nadu', 'chennai', 'hyderabad', 'gurugram', 'noida', 'pune', 'calicut', 'kozhikode']):
                    inferred_country = 'India'
                elif phone.startswith('+966') or any(k in combined_check for k in ['saudi', 'riyadh', 'jeddah', 'dammam', 'khobar', 'mecca', 'medina', 'jubail']):
                    inferred_country = 'Saudi Arabia'
                elif phone.startswith('+971') or any(k in combined_check for k in ['uae', 'dubai', 'abu dhabi', 'sharjah', 'ajman']):
                    inferred_country = 'UAE'
                elif phone.startswith('+44') or any(k in combined_check for k in ['united kingdom', 'london', 'manchester', 'birmingham', 'uk']):
                    inferred_country = 'United Kingdom'
                elif phone.startswith('+1') or any(k in combined_check for k in ['usa', 'united states', 'new york', 'california', 'texas', 'chicago']):
                    inferred_country = 'United States'
                elif any(k in combined_check for k in ['singapore']):
                    inferred_country = 'Singapore'
                elif any(k in combined_check for k in ['japan', 'tokyo']):
                    inferred_country = 'Japan'
                elif any(k in combined_check for k in ['germany', 'berlin', 'munich', 'frankfurt']):
                    inferred_country = 'Germany'
                elif any(k in combined_check for k in ['qatar', 'doha']):
                    inferred_country = 'Qatar'
                elif any(k in combined_check for k in ['kuwait']):
                    inferred_country = 'Kuwait'
                elif any(k in combined_check for k in ['bahrain', 'manama']):
                    inferred_country = 'Bahrain'
                elif any(k in combined_check for k in ['oman', 'muscat']):
                    inferred_country = 'Oman'
                else:
                    inferred_country = req.country if (req.country and req.country.lower() not in ['global', 'all', '', 'any']) else 'Global'

                detected_sec = forced_sector or auto_detect_sector(name, category, card_text)

                items.append({
                    'name': name,
                    'sector': detected_sec,
                    'category': category or 'Commercial Entity',
                    'companyType': 'Enterprise' if reviews_count > 100 else 'Mid-Market',
                    'city': detected_city or (card_address.split(',')[0].strip() if card_address else 'City Center'),
                    'country': inferred_country,
                    'address': card_address or f"{name}, {detected_city}",
                    'phone': phone,
                    'website': website,
                    'rating': rating,
                    'reviews_count': reviews_count,
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
