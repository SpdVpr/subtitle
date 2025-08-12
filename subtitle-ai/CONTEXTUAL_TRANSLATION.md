# Contextual AI Translation System

## Overview

The Premium Translation Service now includes advanced contextual translation that analyzes the filename to detect the show/movie and provides context-aware translations that preserve character names, cultural references, and maintain the appropriate tone.

## How It Works

### 1. Filename Analysis
The system extracts show/movie information from subtitle filenames using various patterns:

**TV Show Patterns:**
- `Show.Name.S01E01.srt` → Show: "Show Name", Season: 1, Episode: 1
- `Show.Name.1x01.srt` → Show: "Show Name", Season: 1, Episode: 1
- `Show Name Season 1 Episode 1.srt` → Show: "Show Name", Season: 1, Episode: 1

**Movie Patterns:**
- `Movie.Name.(2023).srt` → Movie: "Movie Name", Year: 2023
- `Movie.Name.2023.srt` → Movie: "Movie Name", Year: 2023

**Anime Patterns:**
- `Anime.Name.01.[tags].srt` → Anime: "Anime Name", Episode: 1
- `Anime Name Episode 01.srt` → Anime: "Anime Name", Episode: 1

### 2. Context Generation
Once the show is identified, the system queries OpenAI to get contextual information:

- **Genre and tone** (comedy, drama, horror, anime, etc.)
- **Setting and time period**
- **Character names** that should NOT be translated
- **Place names** that should remain in original language
- **Cultural context** and themes
- **Special terminology** or jargon
- **Target audience** and appropriate style

### 3. Context-Aware Translation
The translation process uses this context to:

- **Preserve proper names** (characters, places, special terms)
- **Maintain character voices** and relationships
- **Keep cultural references** when appropriate
- **Use appropriate tone** for the target audience
- **Handle special terminology** correctly

## Examples

### Naruto Subtitles
**Filename:** `Naruto.S01E01.The.Hokage.srt`

**Context Generated:**
- Anime series with ninja themes
- Keep Japanese terms: Hokage, jutsu, ninja, dattebayo
- Character names: Naruto, Sasuke, Sakura (don't translate)
- Village names: Konoha, Hidden Leaf (keep original)

**Translation Result:**
- "Believe it!" → "Věř tomu, dattebayo!" (keeps signature phrase)
- "Shadow Clone Jutsu" → "Stínový klon jutsu" (translates technique, keeps "jutsu")
- "Hokage" → "Hokage" (keeps Japanese title)

### Wednesday Addams Subtitles
**Filename:** `Wednesday.S01E01.srt`

**Context Generated:**
- Dark comedy, gothic humor
- School name: Nevermore Academy (don't translate)
- Character: Wednesday Addams
- Macabre themes and dry humor

**Translation Result:**
- Maintains dark, dry tone in target language
- Keeps "Nevermore" as school name
- Preserves gothic atmosphere in translation choices

## Technical Implementation

### Caching System
- Context information is cached to avoid repeated API calls
- Cache key based on show title (case-insensitive)
- Improves performance for batch translations

### Fallback Handling
- If show is unknown, provides generic translation guidance
- Graceful degradation if context generation fails
- Always maintains subtitle timing and formatting

### API Integration
```typescript
// Usage in translation service
const translatedEntries = await premiumService.translateSubtitles(
  subtitleEntries,
  targetLanguage,
  sourceLanguage,
  fileName  // New parameter for context
)
```

## Benefits

1. **Better Character Consistency** - Names and relationships preserved
2. **Cultural Accuracy** - Appropriate handling of cultural references
3. **Tone Preservation** - Maintains the show's unique voice and style
4. **Professional Quality** - Translations feel natural and context-appropriate
5. **Automatic Detection** - No manual configuration needed

## Supported Languages

The contextual system works with all supported target languages:
- Czech (cs) - Full contextual mock translations available
- German (de), French (fr), Spanish (es), Italian (it)
- Polish (pl), Russian (ru), Portuguese (pt)
- Dutch (nl), Swedish (sv), and more

## Future Enhancements

- **Genre-specific translation rules** (comedy vs. drama vs. horror)
- **Character voice consistency** across episodes
- **Cultural adaptation options** (localize vs. preserve)
- **User feedback integration** for translation quality
- **Multi-language context support** for international shows
