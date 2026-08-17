export type GuideLocale = 'en' | 'cs'

export interface GuideSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
  example?: { label: string; content: string }
}

export interface Guide {
  slug: string
  locale: GuideLocale
  title: string
  description: string
  category: 'finding' | 'sync' | 'formats' | 'players' | 'translation'
  readTime: string
  updated: string
  sections: GuideSection[]
  faq: Array<{ question: string; answer: string }>
}

const updated = '2026-08-17'

export const guides: Guide[] = [
  {
    slug: 'how-to-find-the-right-subtitles', locale: 'en', category: 'finding', readTime: '8 min', updated,
    title: 'How to Find Subtitles That Match Your Video Release',
    description: 'A practical method for matching movie and TV subtitles by title, year, season, episode, release group, frame rate, and runtime.',
    sections: [
      {
        heading: 'Why the movie title is not enough',
        paragraphs: [
          'Two video files with the same movie title can use different cuts, opening logos, frame rates, or episode recaps. A subtitle made for one release may start correctly and drift later, or remain offset for the entire video.',
          'The most reliable result is usually the subtitle whose release label resembles the video filename. Title and language narrow the catalog; release details determine synchronization.',
        ],
        bullets: ['Match the release year for remakes.', 'For TV, verify both season and episode.', 'Compare WEB-DL, WEBRip, BluRay, HDTV, and DVDRip labels.', 'Prefer the same release group when it is shown.', 'Check FPS and runtime when available.'],
      },
      {
        heading: 'A repeatable search workflow',
        paragraphs: ['Start broad, then add one constraint at a time. This avoids hiding a good result because one provider uses slightly different metadata.'],
        bullets: ['Search the original title.', 'Choose movie or episode.', 'Select the required language.', 'Add the year only when results are ambiguous.', 'Enable trusted sources.', 'Compare release names before opening the source.'],
        example: { label: 'Example release comparison', content: 'Video: Example.Movie.2025.1080p.BluRay-GROUP\nBest candidate: Example.Movie.2025.1080p.BluRay-GROUP.srt\nRisky candidate: Example.Movie.2025.WEB-DL.srt' },
      },
      {
        heading: 'How to diagnose a mismatch',
        paragraphs: ['If every subtitle appears the same number of seconds early or late, the file probably needs a constant offset. If the difference grows over time, the release may use another frame rate or runtime. Missing scenes indicate a different cut and are rarely fixed by a simple time shift.'],
        bullets: ['Constant error: use the subtitle sync tool.', 'Growing error: check FPS conversion.', 'Sudden jump: look for another release or cut.', 'Wrong dialogue: verify season, episode, and language.'],
      },
      {
        heading: 'What to do when your language is missing',
        paragraphs: ['Choose a well-rated subtitle in a language you understand, preferably one matching the exact release. Translate that file while preserving timestamps, then review names, idioms, line length, and reading speed in the editor.'],
      },
    ],
    faq: [
      { question: 'What is a subtitle release name?', answer: 'It is a label describing the video source, resolution, encoding, and often the group that prepared the release. Matching it reduces timing differences.' },
      { question: 'Should I include machine-translated subtitles?', answer: 'Use them when a reviewed human subtitle is unavailable, but review names, idioms, line length, and timing before watching or publishing.' },
      { question: 'Can the wrong subtitle file damage my video?', answer: 'No. External subtitle files do not modify the video. They can simply display the wrong text or timing.' },
    ],
  },
  {
    slug: 'fix-subtitles-out-of-sync', locale: 'en', category: 'sync', readTime: '9 min', updated,
    title: 'How to Fix Subtitles That Are Out of Sync',
    description: 'Diagnose constant subtitle offsets, progressive drift, and mismatched cuts, then choose the correct repair.',
    sections: [
      { heading: 'Identify the type of timing error', paragraphs: ['Test one subtitle near the beginning and another near the end. The relationship between those two errors tells you which repair is appropriate.'], bullets: ['Same error at both points: constant offset.', 'Small error first, larger error later: progressive drift.', 'Correct sections separated by sudden jumps: different edit or missing scene.', 'Random errors: damaged or poorly authored subtitle.'] },
      { heading: 'Repair a constant offset', paragraphs: ['Measure how early or late the subtitle appears. Add a positive offset when text appears too early; subtract time when it appears too late. Apply the change to every cue, preview the first and last minutes, then export a new file.'], example: { label: 'Offset example', content: 'Subtitle appears 2.4 seconds early\nApply: +2400 ms\n00:01:10,000 becomes 00:01:12,400' } },
      { heading: 'Repair progressive drift', paragraphs: ['Progressive drift usually comes from a frame-rate or duration difference. Convert timestamps using the ratio between the subtitle source FPS and video FPS. Common cinema and PAL values are 23.976, 24, and 25 FPS.'], example: { label: 'FPS conversion', content: 'New time = old time × source FPS ÷ target FPS\n23.976 → 25: multiply timestamps by 0.95904' } },
      { heading: 'Know when not to repair', paragraphs: ['If a director’s cut contains extra scenes or an episode version omits a recap, a global transformation cannot align every cue. Finding a subtitle for the correct cut is faster and more reliable than manually repairing hundreds of discontinuities.'] },
    ],
    faq: [
      { question: 'Should I use plus or minus offset?', answer: 'If subtitles appear too early, move them later with a positive offset. If they appear too late, move them earlier with a negative offset.' },
      { question: 'Why do subtitles start correctly and become late?', answer: 'That pattern usually indicates a duration or frame-rate mismatch rather than a constant delay.' },
      { question: 'Does changing subtitle FPS change the video?', answer: 'No. It only rescales subtitle timestamps.' },
    ],
  },
  {
    slug: 'subtitle-frame-rate-conversion', locale: 'en', category: 'sync', readTime: '7 min', updated,
    title: 'Subtitle Frame Rate Conversion: 23.976, 24 and 25 FPS',
    description: 'Understand subtitle drift caused by frame-rate conversion and calculate corrected timestamps safely.',
    sections: [
      { heading: 'Why frame rate affects subtitle timing', paragraphs: ['Subtitle files store time, not frames, but releases converted between cinema and broadcast speeds often have different runtimes. A subtitle timed against one version gradually moves away from dialogue in another.'] },
      { heading: 'Use the correct ratio', paragraphs: ['Rescale every start and end timestamp with the same ratio. Do not round each intermediate calculation to whole seconds; retain millisecond precision until export.'], example: { label: 'Formula', content: 'corrected time = original time × source FPS ÷ target FPS\n24 → 25 = × 0.96\n25 → 24 = × 1.0416667' } },
      { heading: 'Common conversions', paragraphs: ['23.976 and 24 are close but can still create visible drift in a long film. The difference between 24 and 25 is about four percent and becomes obvious quickly.'], bullets: ['23.976 → 25: × 0.95904', '25 → 23.976: × 1.042709', '24 → 25: × 0.96', '25 → 24: × 1.041667'] },
      { heading: 'Validate after conversion', paragraphs: ['Check a cue near the beginning, middle, and end. If all three align, the conversion is likely correct. If only one section aligns, the video may be a different cut.'] },
    ],
    faq: [
      { question: 'Is 23.976 the same as 24 FPS?', answer: 'No. The difference is small but accumulates over a long runtime.' },
      { question: 'Can I infer FPS from an SRT file?', answer: 'Not reliably. SRT stores timestamps rather than a frame-rate declaration.' },
      { question: 'Should I also add an offset?', answer: 'Sometimes. Apply the FPS correction first, then add a constant offset if the corrected file is uniformly early or late.' },
    ],
  },
  {
    slug: 'srt-vs-vtt-vs-ass', locale: 'en', category: 'formats', readTime: '8 min', updated,
    title: 'SRT vs VTT vs ASS: Which Subtitle Format Should You Use?',
    description: 'Compare subtitle compatibility, styling, metadata, timing syntax, and conversion risks across SRT, WebVTT, and ASS.',
    sections: [
      { heading: 'SRT: the compatibility default', paragraphs: ['SubRip SRT is simple, readable, and supported by most desktop players, TVs, and editing tools. It stores numbered cues with start and end timestamps. Styling support is limited and inconsistent.'], example: { label: 'SRT cue', content: '1\n00:00:03,500 --> 00:00:06,200\nWhere are we going?' } },
      { heading: 'WebVTT: subtitles for the web', paragraphs: ['WebVTT uses a WEBVTT header, periods for milliseconds, and optional cue settings. It integrates with the HTML video element and supports metadata that SRT cannot represent.'], example: { label: 'WebVTT cue', content: 'WEBVTT\n\n00:00:03.500 --> 00:00:06.200 align:middle\nWhere are we going?' } },
      { heading: 'ASS/SSA: advanced typesetting', paragraphs: ['Advanced SubStation Alpha supports fonts, positioning, colors, animation, karaoke, and reusable styles. It is common in anime and fansubbing, but many web and television players ignore its advanced features.'] },
      { heading: 'Choose by destination', paragraphs: ['Use SRT for broad playback compatibility, VTT for browser video, and ASS when visual typesetting is essential. Converting ASS to SRT preserves dialogue and timing but usually discards positioning and style instructions.'], bullets: ['VLC/Plex/basic playback: SRT', 'HTML5 video: VTT', 'Anime typesetting/karaoke: ASS', 'Transcription interchange: SRT or VTT'] },
    ],
    faq: [
      { question: 'Can SRT contain colors and fonts?', answer: 'Some players accept limited markup, but support is not consistent. ASS is more appropriate for controlled styling.' },
      { question: 'Why does VTT use a period instead of a comma?', answer: 'WebVTT timestamps use a period before milliseconds; SRT conventionally uses a comma.' },
      { question: 'Will conversion preserve every style?', answer: 'Only when the target format supports the same feature. Converting to SRT usually removes advanced styling.' },
    ],
  },
  {
    slug: 'add-subtitles-vlc-plex-kodi', locale: 'en', category: 'players', readTime: '8 min', updated,
    title: 'How to Add External Subtitles in VLC, Plex and Kodi',
    description: 'Name, place, load, and troubleshoot external subtitle files in popular video players and media servers.',
    sections: [
      { heading: 'Use matching filenames', paragraphs: ['The most portable setup places the video and subtitle in the same folder with matching base names. Add a language code before the extension when storing multiple languages.'], example: { label: 'Filename example', content: 'Movie.Name.2025.mkv\nMovie.Name.2025.en.srt\nMovie.Name.2025.cs.srt' } },
      { heading: 'VLC', paragraphs: ['Open the video, choose Subtitle → Add Subtitle File, and select SRT, VTT, or ASS. VLC also detects matching filenames automatically. Use the subtitle track menu to switch languages and the synchronization controls for temporary offsets.'] },
      { heading: 'Plex', paragraphs: ['Place external subtitles beside the media file, scan the library, and select the subtitle track during playback. Follow Plex naming conventions and ensure the server process can read the file. Forced and hearing-impaired suffixes can distinguish track purpose.'] },
      { heading: 'Kodi', paragraphs: ['Kodi detects sidecar subtitles with matching names. During playback, open subtitle settings to choose a track, set a temporary delay, or download another result through a configured provider.'] },
      { heading: 'Common troubleshooting', paragraphs: ['If a player shows boxes or corrupted characters, save the subtitle as UTF-8. If it does not appear, verify the extension and filename. If it drifts, match another release or apply FPS correction.'] },
    ],
    faq: [
      { question: 'Should the subtitle filename exactly match the video?', answer: 'Matching the base filename is the most reliable convention. A language suffix such as .en or .cs is normally safe.' },
      { question: 'Why are accented characters broken?', answer: 'The file is probably decoded with the wrong character encoding. UTF-8 is the safest modern choice.' },
      { question: 'Can I load ASS subtitles in VLC?', answer: 'Yes. VLC supports ASS, including much of its styling.' },
    ],
  },
  {
    slug: 'translate-subtitles-with-ai', locale: 'en', category: 'translation', readTime: '10 min', updated,
    title: 'How to Translate Subtitles with AI Without Breaking Timing',
    description: 'A quality-control workflow for translating subtitle files while preserving timestamps, speaker intent, readability, and file structure.',
    sections: [
      { heading: 'Protect the subtitle structure', paragraphs: ['Translate cue text, not timestamps or cue identifiers. Keep the original file as a backup and export to the same format unless the destination requires another one.'] },
      { heading: 'Provide context', paragraphs: ['Names, relationships, genre, period, and recurring terminology affect translation. A line that looks simple in isolation may refer to a character, fictional place, or joke established earlier. Review important terms before translating the full file.'] },
      { heading: 'Control line length and reading speed', paragraphs: ['A linguistically correct sentence can still be unusable when it is too long for its display time. Split natural phrases, remove unnecessary repetition, and review cues with high characters per second.'], bullets: ['Prefer one or two lines.', 'Break at punctuation or phrase boundaries.', 'Avoid separating articles from nouns.', 'Review fast cues manually.', 'Keep speaker labels and meaningful sound descriptions.'] },
      { heading: 'Run a three-pass review', paragraphs: ['First check structure and missing cues. Next review terminology, names, and tone. Finally watch representative scenes and verify timing, readability, and line breaks.'], example: { label: 'Minimum QA sample', content: 'Opening scene: names and setting\nDialogue-heavy scene: speed and line breaks\nFinal scene: terminology consistency and end timing' } },
    ],
    faq: [
      { question: 'Will AI translation change timestamps?', answer: 'A subtitle-aware workflow should preserve them. Always validate the exported file before publishing.' },
      { question: 'Should I translate sound descriptions?', answer: 'Translate meaningful accessibility descriptions while preserving their function and clear formatting.' },
      { question: 'Can I publish an unreviewed machine translation?', answer: 'It is safer to review terminology, names, timing, readability, and sensitive dialogue before distribution.' },
    ],
  },
]

const czechTranslations: Record<string, Pick<Guide, 'title' | 'description' | 'readTime' | 'sections' | 'faq'>> = {
  'how-to-find-the-right-subtitles': {
    title: 'Jak najít titulky, které odpovídají vaší verzi videa', description: 'Praktický postup pro výběr filmových a seriálových titulků podle názvu, roku, epizody, release, FPS a délky.', readTime: '8 min',
    sections: [
      { heading: 'Proč nestačí název filmu', paragraphs: ['Dva video soubory stejného filmu mohou mít jiný střih, úvodní loga, snímkovou frekvenci nebo rekapitulaci. Titulky pro jinou verzi mohou být posunuté nebo se postupně rozcházet.', 'Nejspolehlivější bývá soubor, jehož release označení se podobá názvu videa. Název a jazyk zúží výběr, ale synchronizaci určuje konkrétní verze.'], bullets: ['U remaků ověřte rok.', 'U seriálu ověřte řadu i epizodu.', 'Porovnejte WEB-DL, BluRay, HDTV a další zdroje.', 'Pokud je uvedena release skupina, hledejte shodu.', 'Porovnejte FPS a délku.'] },
      { heading: 'Opakovatelný postup hledání', paragraphs: ['Začněte obecně a přidávejte filtry postupně. Příliš přísný filtr může skrýt dobrý výsledek kvůli odlišným metadatům.'], bullets: ['Použijte originální název.', 'Vyberte film nebo epizodu.', 'Nastavte jazyk.', 'Rok přidejte při nejednoznačnosti.', 'Zapněte důvěryhodné zdroje.', 'Před otevřením porovnejte release.'], example: { label: 'Porovnání release', content: 'Video: Film.2025.1080p.BluRay-GROUP\nNejlepší kandidát: Film.2025.1080p.BluRay-GROUP.srt\nRizikový kandidát: Film.2025.WEB-DL.srt' } },
      { heading: 'Jak poznat příčinu neshody', paragraphs: ['Stejný rozdíl na začátku i konci znamená konstantní posun. Rostoucí rozdíl ukazuje na jiné FPS nebo délku. Náhlý skok obvykle znamená jiný střih.'], bullets: ['Konstantní chyba: použijte posun.', 'Rostoucí chyba: převeďte FPS.', 'Náhlý skok: najděte jiný release.', 'Jiný dialog: ověřte epizodu a jazyk.'] },
      { heading: 'Když požadovaný jazyk chybí', paragraphs: ['Vyberte kvalitní titulky odpovídající release v dostupném jazyce, přeložte je se zachováním časování a následně zkontrolujte jména, idiomy, délku řádků a rychlost čtení.'] },
    ],
    faq: [
      { question: 'Co je release název titulků?', answer: 'Označuje zdroj videa, rozlišení, kódování a často skupinu vydání. Shoda s videem snižuje riziko špatného časování.' },
      { question: 'Mám zahrnout strojově přeložené titulky?', answer: 'Použijte je, pokud není lidská verze, ale před sledováním nebo publikací je zkontrolujte.' },
      { question: 'Mohou špatné titulky poškodit video?', answer: 'Ne. Externí subtitle soubor video nemění, pouze může zobrazovat chybný text nebo časování.' },
    ],
  },
  'fix-subtitles-out-of-sync': {
    title: 'Jak opravit titulky mimo synchronizaci', description: 'Rozlište konstantní posun, postupný drift a jiný střih a zvolte správnou opravu.', readTime: '9 min',
    sections: [
      { heading: 'Určete typ chyby', paragraphs: ['Porovnejte jednu repliku na začátku a druhou ke konci. Vztah obou odchylek určí vhodnou opravu.'], bullets: ['Stejná chyba: konstantní posun.', 'Rostoucí chyba: postupný drift.', 'Náhlé skoky: jiný střih.', 'Náhodné chyby: poškozené nebo špatně vytvořené titulky.'] },
      { heading: 'Konstantní posun', paragraphs: ['Pokud se titulky zobrazují příliš brzy, přidejte kladný posun. Pokud pozdě, použijte záporný. Zkontrolujte začátek i konec a exportujte nový soubor.'], example: { label: 'Příklad', content: 'Titulky jsou o 2,4 s napřed\nPoužijte: +2400 ms\n00:01:10,000 → 00:01:12,400' } },
      { heading: 'Postupný drift', paragraphs: ['Drift obvykle způsobuje rozdílná snímková frekvence nebo délka. Přepočítejte všechny časové značky poměrem zdrojového a cílového FPS.'], example: { label: 'Vzorec', content: 'nový čas = původní čas × zdrojové FPS ÷ cílové FPS' } },
      { heading: 'Kdy opravu vzdát', paragraphs: ['Jiný střih s přidanými nebo vynechanými scénami nelze opravit jedním posunem. Rychlejší a spolehlivější je najít odpovídající release.'] },
    ],
    faq: [
      { question: 'Mám použít plus, nebo minus?', answer: 'Příliš časné titulky posuňte později kladnou hodnotou; příliš pozdní posuňte zápornou.' },
      { question: 'Proč se chyba postupně zvětšuje?', answer: 'Nejčastěji jde o rozdílné FPS nebo délku verze videa.' },
      { question: 'Změní převod FPS video?', answer: 'Ne. Přepočítají se pouze časové značky titulků.' },
    ],
  },
  'subtitle-frame-rate-conversion': {
    title: 'Převod FPS titulků: 23,976, 24 a 25', description: 'Pochopte drift způsobený snímkovou frekvencí a bezpečně přepočítejte časování.', readTime: '7 min',
    sections: [
      { heading: 'Proč FPS ovlivňuje titulky', paragraphs: ['Subtitle soubory ukládají čas, ale video verze převedené mezi filmovou a televizní rychlostí mají jinou délku. Rozdíl se postupně hromadí.'] },
      { heading: 'Správný poměr', paragraphs: ['Každý začátek a konec přepočítejte stejným poměrem a zachovejte milisekundy až do exportu.'], example: { label: 'Vzorec', content: 'nový čas = původní čas × zdrojové FPS ÷ cílové FPS\n24 → 25 = × 0,96' } },
      { heading: 'Běžné převody', paragraphs: ['I malý rozdíl mezi 23,976 a 24 se u dlouhého filmu projeví. Rozdíl mezi 24 a 25 je přibližně čtyři procenta.'], bullets: ['23,976 → 25: × 0,95904', '25 → 23,976: × 1,042709', '24 → 25: × 0,96', '25 → 24: × 1,041667'] },
      { heading: 'Kontrola výsledku', paragraphs: ['Ověřte repliku na začátku, uprostřed a na konci. Pokud sedí jen jedna část, pravděpodobně jde o jiný střih.'] },
    ],
    faq: [
      { question: 'Je 23,976 stejné jako 24 FPS?', answer: 'Ne. Rozdíl je malý, ale u dlouhého videa se nahromadí.' },
      { question: 'Lze zjistit FPS ze SRT?', answer: 'Ne spolehlivě. SRT ukládá čas, nikoli deklaraci FPS.' },
      { question: 'Mám přidat i posun?', answer: 'Nejdřív opravte FPS a až potom případný rovnoměrný posun.' },
    ],
  },
  'srt-vs-vtt-vs-ass': {
    title: 'SRT vs. VTT vs. ASS: jaký formát titulků zvolit', description: 'Porovnání kompatibility, stylů, časování a rizik převodu mezi SRT, WebVTT a ASS.', readTime: '8 min',
    sections: [
      { heading: 'SRT: nejširší kompatibilita', paragraphs: ['SRT je jednoduchý a podporuje ho většina přehrávačů, televizí a editorů. Pokročilé styly jsou omezené.'], example: { label: 'SRT', content: '1\n00:00:03,500 --> 00:00:06,200\nKam jdeme?' } },
      { heading: 'WebVTT: titulky pro web', paragraphs: ['WebVTT používá hlavičku WEBVTT, tečku před milisekundami a volitelné nastavení cue. Je určen pro HTML video.'] },
      { heading: 'ASS/SSA: pokročilá sazba', paragraphs: ['ASS podporuje fonty, pozici, barvy, animace a karaoke. Je běžný u anime, ale řada webových a televizních přehrávačů jeho funkce ignoruje.'] },
      { heading: 'Volba podle cíle', paragraphs: ['SRT zvolte pro běžné přehrávání, VTT pro web a ASS pro důležitou grafickou sazbu. Převod ASS do SRT zachová text a čas, ale obvykle zahodí styly.'], bullets: ['VLC/Plex: SRT', 'HTML5 video: VTT', 'Anime/karaoke: ASS'] },
    ],
    faq: [
      { question: 'Umí SRT barvy a fonty?', answer: 'Některé přehrávače přijímají omezené značky, ale podpora není jednotná.' },
      { question: 'Proč VTT používá tečku?', answer: 'WebVTT zapisuje milisekundy s tečkou, zatímco SRT tradičně s čárkou.' },
      { question: 'Zachová převod všechny styly?', answer: 'Jen pokud cílový formát podporuje stejnou funkci.' },
    ],
  },
  'add-subtitles-vlc-plex-kodi': {
    title: 'Jak přidat externí titulky do VLC, Plex a Kodi', description: 'Pojmenování, načtení a řešení problémů s externími titulky v populárních přehrávačích.', readTime: '8 min',
    sections: [
      { heading: 'Shodné názvy souborů', paragraphs: ['Nejspolehlivější je uložit video a titulky do stejné složky se shodným základním názvem. Pro více jazyků přidejte kód.'], example: { label: 'Příklad', content: 'Film.2025.mkv\nFilm.2025.en.srt\nFilm.2025.cs.srt' } },
      { heading: 'VLC', paragraphs: ['Otevřete video, zvolte Titulky → Přidat soubor titulků a vyberte SRT, VTT nebo ASS. VLC také automaticky najde shodně pojmenovaný soubor.'] },
      { heading: 'Plex', paragraphs: ['Uložte externí titulky vedle média, obnovte knihovnu a při přehrávání vyberte stopu. Server musí mít právo soubor číst.'] },
      { heading: 'Kodi', paragraphs: ['Kodi detekuje sidecar titulky se shodným názvem. Během přehrávání lze vybrat stopu a dočasně upravit zpoždění.'] },
      { heading: 'Časté problémy', paragraphs: ['Poškozené znaky opravte uložením v UTF-8. Při driftu najděte správný release nebo převeďte FPS.'] },
    ],
    faq: [
      { question: 'Musí název přesně odpovídat?', answer: 'Shodný základ názvu je nejspolehlivější; jazyková přípona je obvykle v pořádku.' },
      { question: 'Proč nefunguje diakritika?', answer: 'Soubor je pravděpodobně otevřen ve špatném kódování. Doporučeno je UTF-8.' },
      { question: 'Umí VLC ASS?', answer: 'Ano, VLC podporuje ASS včetně velké části stylování.' },
    ],
  },
  'translate-subtitles-with-ai': {
    title: 'Jak přeložit titulky pomocí AI bez poškození časování', description: 'Postup kontroly kvality při překladu titulků se zachováním času, významu a čitelnosti.', readTime: '10 min',
    sections: [
      { heading: 'Chraňte strukturu souboru', paragraphs: ['Překládejte text cue, nikoli časové značky nebo identifikátory. Originál si ponechte jako zálohu.'] },
      { heading: 'Dodejte kontext', paragraphs: ['Jména, vztahy, žánr, období a opakované termíny ovlivňují překlad. Před celým souborem zkontrolujte klíčové pojmy.'] },
      { heading: 'Délka řádků a rychlost čtení', paragraphs: ['Jazykově správná věta může být nečitelná, pokud je příliš dlouhá. Dělte přirozené fráze a kontrolujte vysoký počet znaků za sekundu.'], bullets: ['Jeden nebo dva řádky.', 'Dělení na hranici frází.', 'Kontrola rychlých cue.', 'Zachování smyslu zvukových popisů.'] },
      { heading: 'Tříkolová kontrola', paragraphs: ['Nejdřív struktura a chybějící cue, potom terminologie a tón, nakonec sledování reprezentativních scén.'], example: { label: 'Minimální vzorek', content: 'Úvod: jména a prostředí\nRychlý dialog: čitelnost\nZávěr: konzistence a časování' } },
    ],
    faq: [
      { question: 'Změní AI časové značky?', answer: 'Subtitle-aware postup by je měl zachovat, ale export vždy validujte.' },
      { question: 'Mám překládat zvukové popisy?', answer: 'Ano, pokud jsou důležité pro přístupnost, a zachovejte jejich funkci.' },
      { question: 'Lze publikovat nekontrolovaný AI překlad?', answer: 'Před distribucí je vhodné zkontrolovat jména, terminologii, čitelnost a citlivé pasáže.' },
    ],
  },
}

for (const guide of guides.filter((item) => item.locale === 'en')) {
  const translation = czechTranslations[guide.slug]
  if (translation) guides.push({ ...guide, ...translation, locale: 'cs' })
}

export function getGuides(locale: GuideLocale) {
  return guides.filter((guide) => guide.locale === locale)
}

export function getGuide(slug: string, locale: GuideLocale) {
  return guides.find((guide) => guide.slug === slug && guide.locale === locale)
}
