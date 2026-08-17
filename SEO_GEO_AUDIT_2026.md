# SEO a GEO audit SubtitleBot

Datum: 17. 8. 2026  
Web: https://www.subtitlebot.com  
Rozsah: technické SEO, on-page SEO, informační architektura, strukturovaná data, crawl/indexace, GEO/AI vyhledávání, výkon, analytika a plán růstu.

## Executive summary

SubtitleBot má nadprůměrně silný organický základ: za tři měsíce přibližně 38,2 tisíce kliků z 498 tisíc zobrazení, CTR 7,7 % a průměrnou pozici 5,9. To odpovídá zhruba 424 organickým klikům denně. Přehled zároveň ukazuje 31% růst kliků a 23% růst zobrazení. Značková návštěvnost je prakticky nulová, takže výkon stojí na reálné nebrandové poptávce.

Největší slabinou není základní relevance, ale extrémní koncentrace výkonu do jedné URL. V přiloženém přehledu získala `/subtitles-search` přibližně 14,1 tisíce z 14,3 tisíce kliků, tedy asi 98,6 %. Homepage měla jen 141 kliků, česká homepage 33 a `/translate` 4. Před úpravou navíc crawler na homepage viděl pouze text `Loading...`, protože hlavní obsah čekal na klientské ověření přihlášení.

## Stav realizace po rozšíření

Navazující růstová fáze je implementovaná v kódu:

- šest odborných návodů v angličtině a češtině, včetně viditelného FAQ a interních odkazů;
- pět lokálních nástrojů: sync/FPS, validátor, reading speed, SRT/VTT převod a detekce kódování/UTF-8;
- řízený katalog 27 filmů a seriálů ve dvou jazycích;
- detailní stránky s aktuálním šestihodinovým OpenSubtitles API vzorkem, release, FPS a kvalitativními signály;
- filmové, seriálové, populární, nejnovější a jazykové huby s automatickým `noindex`, když nemají dost skutečných položek;
- on-demand generování katalogu, omezení API rate limitů a 404 pro neznámé seedy;
- lokalizovaný sitemap, GSC CSV analyzátor, měřicí události, provozní checklist a outreach podklady.

Katalog nepoužívá TMDB data ani obrázky, protože projekt nemá TMDB klíč a oficiální podmínky vyžadují pro komerční použití samostatnou licenci. Jimaku zůstává ve finderu, ale není použit pro hromadně indexovaný katalog, protože se nepodařilo dohledat veřejné podmínky umožňující takové použití.

Cíl několik tisíc návštěv denně znamená přibližně čtyř- až sedminásobný růst proti dnešnímu výkonu. Samotná změna title a description tento rozdíl nepokryje. I kdyby se CTR dvou největších dotazů (`subtitles`, `subtitle`) zvýšilo na 10 %, přinese to přibližně 5 500 kliků navíc za 90 dní, tedy jen asi 61 denně. Hlavní růst proto musí přijít ze tří zdrojů:

1. posun vítězné stránky z průměru kolem pozice 6 do top 3;
2. vytvoření skutečně užitečných, indexovatelných inventory stránek pro konkrétní filmy, seriály, jazyky a typy titulků;
3. originální nástroje a obsah, který získá odkazy a citace.

## Data z Google Search Console

### Souhrn

| Metrika | Hodnota | Interpretace |
|---|---:|---|
| Kliky / 3 měsíce | 38 200 | Přibližně 424 denně |
| Zobrazení / 3 měsíce | 498 000 | Velká existující poptávka |
| CTR | 7,7 % | Dobré vzhledem k průměrné pozici |
| Průměrná pozice | 5,9 | Největší krátkodobá příležitost je top 3 |
| Značkové kliky | 0 % | Organika nestojí na znalosti značky |
| Top země | Indie 21 %, Filipíny 9 %, USA 6 %, Indonésie 3 %, Írán 3 % | Angličtina je správný primární jazyk; další lokalizace vyžadují rodilou QA |

### Top dotazy

| Dotaz | Kliky | Zobrazení | CTR |
|---|---:|---:|---:|
| subtitles | 19 513 | 228 018 | 8,56 % |
| subtitle | 5 337 | 75 544 | 7,06 % |
| english subtitles | 1 731 | 14 920 | 11,60 % |
| movie subtitles | 1 479 | 7 697 | 19,22 % |
| subtitle finder | 592 | 1 658 | 35,71 % |
| subtitles for movies | 462 | 1 863 | 24,80 % |
| subtitle search | 364 | 1 053 | 34,57 % |
| movie subtitle | 323 | 1 342 | 24,07 % |
| find subtitles | 262 | 780 | 33,59 % |
| subtitle for movies | 241 | 621 | 38,81 % |
| movies subtitles | 232 | 886 | 26,19 % |
| subtitles finder | 211 | 578 | 36,51 % |
| english subtitle | 170 | 2 312 | 7,35 % |
| subtitle seeker | 131 | 639 | 20,50 % |
| subtitles search | 130 | 460 | 28,26 % |
| tv subtitles | 122 | 1 417 | 8,61 % |
| subtitels | 118 | 1 786 | 6,61 % |
| subtitle movie | 95 | 968 | 9,81 % |
| subtitles movies | 90 | 1 326 | 6,79 % |
| substitle | 79 | 1 134 | 6,97 % |

Dotazy tvoří jeden jasný intent cluster: najít a stáhnout správné titulky pro film, seriál nebo anime, často v angličtině. Proto byla posílena jedna hlavní landing page místo vytváření desítek téměř totožných stránek. Varianty s překlepy není vhodné vkládat do textu; vyhledávače jim rozumějí a umělé opakování by snižovalo kvalitu.

## Nejzávažnější nalezené problémy

### P0 — crawler na homepage viděl jen loader

Živý crawl před úpravou vracel navigaci, text `Loading...` a footer, ale žádný hlavní obsah homepage. Příčinou byl klientský auth gate. Google sice JavaScript renderuje, ale rendering je složitější, pomalejší a méně spolehlivý než dostupný HTML obsah. Stejný problém měla česká homepage.

Stav po úpravě: homepage i `/cs` obsahují H1, hlavní text a JSON-LD už v prvním HTML dokumentu; loader se v HTML nevyskytuje.

### P0 — celý web byl bez cache a dynamický

Root layout používal `force-dynamic`, `revalidate = 0` a `force-no-store`. Produkce proto vracela `Cache-Control: private, no-cache, no-store`. Po odstranění globálního přepínače build předrenderuje všech 106 stránek jako statický obsah (API zůstávají dynamická). Lokální produkční ověření vrací pro veřejné stránky dlouhou sdílenou cache a HTML je okamžitě dostupné.

### P1 — jedna URL nese téměř celý organický výkon

`/subtitles-search` měla před úpravou pouze krátký nadpis, dvě vyhledávací komponenty a několik vět. Stránka nyní pokrývá celý vítězný cluster, vysvětluje výběr správného release, synchronizaci, práci s anglickými titulky, zdroje dat a další krok s překladem. Obsah je viditelný, konkrétní a provázaný s editorem, překladačem a video nástroji.

### P1 — konfliktní nebo nepravdivé signály

Web střídal názvy SubtitleAI a SubtitleBot, 100 a 200 uvítacích kreditů a podporu 50+, 60+ a 100+ jazyků. Metadata odkazovala na neexistující OG soubory a footer na obecné homepage GitHubu a Twitteru. Tyto rozpory byly sjednoceny podle skutečné registrace (100 kreditů), existujícího produktu a existujících assetů. Neověřené sociální odkazy a nepodložená tvrzení byla odstraněna.

### P1 — strukturovaná data neodpovídala stránce

FAQ JSON-LD bylo přítomné i tam, kde uživatel FAQ neviděl. Strukturovaná data se navíc vkládala z root layoutu na všechny URL jako data homepage. Implementace byla nahrazena konzistentním `@graph` s entitami Organization, WebSite, WebApplication a WebPage, stabilními `@id`, breadcrumbs a page-specific Service nebo subtitle finder aplikací. Data odpovídají viditelnému obsahu.

### P1 — crawl pravidla pro AI vyhledávače byla zastaralá

Původní robots používal neaktuální `Claude-Web` a chyběl `OAI-SearchBot`, který OpenAI používá pro vyhledávání a citace. Přidány byly oddělené search/user crawlery OpenAI, Anthropic a Perplexity. Soukromé a aplikační URL zůstávají blokované. Existující povolení training crawlerů GPTBot a ClaudeBot bylo zachováno; lze je samostatně zakázat bez zablokování search crawlerů.

### P1 — indexační šum

Login, registrace, dashboard, nákup, feedback a další utility dědily globální `index,follow`. Proxy nyní vrací `X-Robots-Tag: noindex, nofollow` pro utility a soukromé obrazovky. Sitemap obsahuje pouze zamýšlené veřejné URL a pro každou EN/CS dvojici uvádí hreflang včetně `x-default`.

### P2 — výkon a nadbytečný JavaScript

Marketingové stránky načítaly globálně subscription, credits, batch, Stripe, Firebase, oba OG obrázky a vzdálený web-vitals skript. Providers byly přesunuty pouze na cesty, které je potřebují; Stripe je dynamický; škodlivé preloads a duplicitní analytics byly odstraněny. Analytics se nyní načte až po souhlasu.

Lokální Lighthouse na `/subtitles-search`:

| Stav | Performance | Accessibility | Best Practices | SEO | Přenos |
|---|---:|---:|---:|---:|---:|
| první diagnostický běh | 69 | 92 | 73 | 100 | 4 239 KiB |
| po optimalizaci | 73 | 100 | 100 | 100 | 1 845 KiB |

Simulované LCP zůstává v laboratorním modelu vysoké (10,5 s), ale přímo pozorované LCP v posledním běhu bylo 255 ms, TBT 80 ms a CLS 0. Rozdíl způsobuje především simulace klientského bundle a cookie overlay. Rozhodující budou field data v CrUX/Search Console po nasazení.

## GEO / AI vyhledávání

Google v aktuální dokumentaci uvádí, že pro AI Overviews a AI Mode nejsou zvláštní technické požadavky ani speciální schema; stránka musí být indexovatelná, textově dostupná, kvalitní a dobře interně propojená. Google zároveň nedoporučuje vyrábět zbytečné AI soubory typu `llms.txt` ani mnoho stránek pro varianty stejného dotazu. Proto takový soubor nebyl přidán.

Implementovaný GEO základ:

- hlavní fakta jsou dostupná přímo v HTML a v sekci „SubtitleBot at a glance“;
- jasná entita SubtitleBot a stabilní JSON-LD identifikátory;
- fakta, formáty, cena a zdroje jsou konzistentní napříč stránkou a schema;
- vítězná stránka obsahuje krátké odpovědi na navazující otázky;
- je povolen OAI-SearchBot, Claude-SearchBot a PerplexityBot;
- zdroje OpenSubtitles a Jimaku jsou transparentně pojmenované;
- interní odkazy spojují hledání, překlad, synchronizaci a přehrávání;
- GA měří dokončené hledání a odchod k poskytovateli bez odesílání hledaného názvu.

Relevantní primární zdroje:

- [Google: optimalizace pro generativní AI ve vyhledávání](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [OpenAI: publisher and developer FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Anthropic: web crawlery](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: crawlery](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

## Plán růstu na několik tisíc návštěv denně

### 0–30 dní: bezpečné využití současné autority

1. Nasadit změny a odeslat nový sitemap v Search Console.
2. Požádat o novou indexaci `/`, `/subtitles-search`, `/translate`, `/subtitle-editor` a jejich českých variant.
3. V Search Console vytvořit anotaci data nasazení a týdně sledovat query × page × country × device.
4. Měřit `subtitle_search_completed`, `subtitle_source_opened`, registraci a zahájení překladu.
5. Vyhodnotit CTR vítězné URL po 14 a 28 dnech; title netestovat častěji, aby data byla čitelná.
6. Ověřit reálné Core Web Vitals po dostatečném vzorku návštěv.

### 30–90 dní: obsah, který řeší skutečné problémy

Priorita není obecný blog generovaný podle klíčových slov, ale originální návody napojené na produkt:

- jak vybrat subtitle release přesně pro video soubor;
- titulky mimo synchronizaci: konstantní posun vs. postupný drift;
- převod snímkové frekvence 23.976 / 24 / 25 fps;
- SRT vs. VTT vs. ASS: zachované funkce a ztráty při převodu;
- bezpečný pracovní postup pro překlad filmových a seriálových titulků;
- titulky pro neslyšící vs. překladové titulky;
- jak pojmenovat a načíst titulky ve VLC, Plex, Kodi a běžných přehrávačích.

Každý návod má obsahovat konkrétní příklad, vlastní screenshot nebo mini nástroj, autora/revizora, datum poslední kontroly a odkazy na relevantní funkci SubtitleBot.

### 60–180 dní: indexovatelný subtitle inventory

To je největší potenciální růstová páka. Současné výsledky vznikají pouze po klientském hledání, takže jednotlivé filmy a seriály nemají indexovatelnou URL. Doporučená architektura, pouze pokud to dovolují licence a podmínky API:

```text
/subtitles                         hlavní finder
/subtitles/english                 jazykový hub se skutečným inventářem
/subtitles/movies                  filmový hub
/subtitles/tv                      seriálový hub
/subtitles/anime                   anime hub
/subtitles/movie/[slug]-[year]     kanonická stránka konkrétního filmu
/subtitles/tv/[slug]/season-[n]    seriál a řada
```

Každá indexovaná stránka musí mít reálnou hodnotu: aktuální dostupné jazyky, release varianty, rok, typ, zdroj, instrukci k výběru, související tituly a možnost otevřít výsledek. Prázdné, duplicitní a filtrované kombinace musí mít `noindex` nebo canonical. Nevytvářet URL jen kvůli přesné shodě klíčového slova.

### 90–270 dní: odkazy, citace a nové trhy

- publikovat anonymizovaný datový report o nejhledanějších jazycích a typech subtitle problémů;
- nabídnout bezplatné embeddable nástroje: posun časování, fps převod, kontrolu SRT a detekci kódování;
- oslovit komunity VLC, Plex, Kodi, video editory a jazykové školy s konkrétním nástrojem, ne generickou žádostí o odkaz;
- lokalizovat nejprve podle Search Console dat a pouze s rodilou jazykovou kontrolou; Indie, Filipíny a Indonésie jsou kandidáti, ale anglický obsah už velkou část poptávky obsluhuje;
- budovat značkovou poptávku: dnes je 100 % návštěvnosti nebrandové, což je příležitost i riziko.

## KPI a rozhodovací pravidla

| Horizont | KPI | Rozhodnutí |
|---|---|---|
| 14 dní | indexace a crawl klíčových URL | řešit jen technické chyby, nepanikařit nad rankingem |
| 28 dní | CTR clusterů subtitles / finder / movie / English | title ponechat, pokud roste CTR bez ztráty pozice |
| 60 dní | nebrandové kliky mimo `/subtitles-search` | cílit alespoň 10–15 % kliků z dalších kvalitních URL |
| 90 dní | top 3 podíl a konverze finder → provider / translate | rozšiřovat jen témata a funkce s prokázaným použitím |
| 180 dní | počet indexovaných inventory URL s impresí a klikem | odstranit nebo noindexovat prázdné/duplicitní šablony |
| 270 dní | denní organika a brand share | cíl 1 000+ denně je realistický mezikrok; 2–3 tisíce vyžadují inventory a odkazy |

Pro přesnější forecast je potřeba export minimálně 16 měsíců z GSC po dimenzích query, page, country a device. Screenshoty ukazují směr a top 20 dotazů, ale ne distribuci pozic, long tail ani sezónnost. Žádná SEO nebo GEO úprava nemůže garantovat konkrétní návštěvnost; plán je postavený tak, aby byl růst měřitelný a jednotlivé investice šly zastavit nebo rozšířit podle dat.
