# SubtitleBot SEO operations

## Inputs needed after deployment

Export Google Search Console data for the longest available period with these dimensions:

- Queries: query, clicks, impressions, CTR, position.
- Pages: page, clicks, impressions, CTR, position.
- Countries and devices.
- Search appearance, including the Generative AI report when available for the property.

Run the local query analysis with:

```bash
npm run seo:gsc -- path/to/Queries.csv
```

The script accepts English or Czech GSC column labels and prints keyword clusters, position 4–15 opportunities, and high-impression low-CTR queries. It does not upload the export.

## Deployment day

1. Deploy the production build.
2. Confirm 200 responses for `/`, `/subtitles-search`, `/guides`, `/tools`, `/subtitles/movies`, and one catalog detail.
3. Confirm `X-Robots-Tag: noindex, nofollow` on `/login` and `/dashboard`.
4. Submit `https://www.subtitlebot.com/sitemap.xml` in Search Console.
5. Request recrawling for the homepage, finder, guide hub, tool hub, movie hub, and one high-value detail page.
6. Record the deployment date in the analytics changelog.

## Quality gates for catalog expansion

A catalog URL may be indexed only when:

- the provider request succeeded;
- the current response contains at least two subtitle items;
- the movie or series has a stable title, year, type, and IMDb identifier;
- the page has a canonical URL and is present in internal navigation;
- results link to the source and no subtitle file is copied or hosted;
- the page is not a duplicate created from filter combinations.

New seeds should be added in small batches. After 28–60 days, keep expanding patterns that receive impressions and prune or `noindex` patterns that remain empty.

## Review cadence

### Day 14

- Check crawl errors, robots, sitemap processing, canonical selection, and structured-data errors.
- Confirm the new hubs and a sample of detail pages are indexed.
- Do not rewrite titles solely because rankings fluctuate.

### Day 28

- Compare query clusters and landing pages against the pre-deployment baseline.
- Review CTR for `subtitles`, `subtitle finder`, `movie subtitles`, and `english subtitles`.
- Review `subtitle_tool_used`, `subtitle_tool_exported`, `subtitle_search_completed`, and `subtitle_source_opened` events.

### Day 60

- Identify guides and tools with impressions but weak CTR.
- Identify detail templates that receive no impressions and check content/data quality.
- Add the next controlled catalog batch based on real search demand.

### Day 90

- Measure traffic share outside `/subtitles-search`.
- Measure finder → source, finder → translation, tool → export, and organic → registration conversion.
- Select original data or tool assets for outreach and link acquisition.

## External actions requiring account access or approval

- Search Console sitemap submission and URL inspection.
- Production deployment if the hosting account is not connected locally.
- Contacting publishers, communities, or partners.
- Commercial licensing approval for TMDB data or other restricted providers.
- Native-language review before adding more localized markets.
