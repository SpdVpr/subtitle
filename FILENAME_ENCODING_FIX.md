# Filename Encoding Fix for Non-ASCII Characters

## 🐛 Problem

Users reported errors when downloading subtitle files with non-ASCII characters in filenames:

```
Error: Download failed: Failed to download file: Cannot convert argument to a ByteString 
because the character at index 23 has a value of 7855 which is greater than 255.
```

**Example filenames that caused issues:**
- Vietnamese: `bắt cóc.srt`
- Czech: `příliš žluťoučký kůň.srt`
- Chinese: `字幕文件.srt`
- Arabic: `ترجمة.srt`

## ✅ Solution

Implemented **RFC 5987 encoding** for HTTP `Content-Disposition` headers to properly support international characters.

### What Changed

**Before:**
```typescript
'Content-Disposition': `attachment; filename="${filename}"`
```

**After:**
```typescript
'Content-Disposition': `attachment; filename="bat_coc.srt"; filename*=UTF-8''b%E1%BA%AFt%20c%C3%B3c.srt`
```

### Technical Details

The fix uses **dual encoding strategy** for maximum browser compatibility:

1. **`filename="..."`** - ASCII-safe fallback for older browsers
   - Non-ASCII characters replaced with underscores
   - Example: `bắt cóc.srt` → `bat_coc.srt`

2. **`filename*=UTF-8''...`** - RFC 5987 encoding for modern browsers
   - Properly encodes UTF-8 characters
   - Example: `bắt cóc.srt` → `b%E1%BA%AFt%20c%C3%B3c.srt`

## 📁 Files Changed

### New Files

1. **`src/lib/filename-encoder.ts`**
   - Core encoding utilities
   - Functions: `encodeContentDisposition()`, `sanitizeFilename()`, `hasNonASCII()`, `getSafeDownloadFilename()`

2. **`src/lib/__tests__/filename-encoder.test.ts`**
   - Comprehensive test suite
   - Tests for Vietnamese, Czech, Chinese, Arabic, and other languages

### Modified Files

1. **`src/app/api/translation-history/download/route.ts`**
   - Updated to use `encodeContentDisposition()` helper
   - Fixes download endpoint for translated subtitles

## 🧪 Testing

### Test Cases

```typescript
// Vietnamese
encodeContentDisposition('bắt cóc.srt')
// ✅ Works: Downloads with correct filename

// Czech
encodeContentDisposition('příliš žluťoučký kůň.srt')
// ✅ Works: Downloads with correct filename

// Chinese
encodeContentDisposition('字幕文件.srt')
// ✅ Works: Downloads with correct filename

// Arabic
encodeContentDisposition('ترجمة.srt')
// ✅ Works: Downloads with correct filename

// Emoji
encodeContentDisposition('movie 🎬.srt')
// ✅ Works: Downloads with correct filename
```

### Run Tests

```bash
npm test filename-encoder
```

## 🌍 Supported Languages

The fix supports **all Unicode characters**, including:

- ✅ Vietnamese (Tiếng Việt)
- ✅ Czech (Čeština)
- ✅ Chinese (中文)
- ✅ Japanese (日本語)
- ✅ Korean (한국어)
- ✅ Arabic (العربية)
- ✅ Russian (Русский)
- ✅ Greek (Ελληνικά)
- ✅ Hebrew (עברית)
- ✅ Thai (ไทย)
- ✅ And many more...

## 📊 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | RFC 5987 support |
| Firefox 88+ | ✅ Full | RFC 5987 support |
| Safari 14+ | ✅ Full | RFC 5987 support |
| Edge 90+ | ✅ Full | RFC 5987 support |
| Older browsers | ⚠️ Fallback | Uses ASCII-safe filename |

## 🔧 Usage in Other Endpoints

If you need to add download functionality elsewhere, use the helper:

```typescript
import { encodeContentDisposition } from '@/lib/filename-encoder'

// In your API route
const fileName = 'bắt cóc.srt'
const contentDisposition = encodeContentDisposition(fileName)

return new NextResponse(content, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Disposition': contentDisposition,
  },
})
```

## 📚 References

- [RFC 5987](https://tools.ietf.org/html/rfc5987) - Character Set and Language Encoding for HTTP Header Field Parameters
- [MDN: Content-Disposition](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)
- [Unicode in HTTP Headers](https://www.rfc-editor.org/rfc/rfc8187.html)

## 🎉 Result

Users can now download subtitle files with **any filename** in **any language** without errors! 🌍

---

**Fixed by:** AI Assistant  
**Date:** 2025-09-30  
**Issue:** Vietnamese user reported download error with filename "bắt cóc.srt"

