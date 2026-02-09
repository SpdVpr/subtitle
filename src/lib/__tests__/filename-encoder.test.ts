import { 
  encodeContentDisposition, 
  sanitizeFilename, 
  hasNonASCII, 
  getSafeDownloadFilename 
} from '../filename-encoder'

describe('filename-encoder', () => {
  describe('encodeContentDisposition', () => {
    it('should encode Vietnamese filename correctly', () => {
      const result = encodeContentDisposition('bắt cóc.srt')
      expect(result).toContain('attachment')
      expect(result).toContain('filename=')
      expect(result).toContain('filename*=UTF-8')
      expect(result).toContain('b%E1%BA%AFt')
    })

    it('should encode Czech filename correctly', () => {
      const result = encodeContentDisposition('příliš žluťoučký kůň.srt')
      expect(result).toContain('attachment')
      expect(result).toContain('filename*=UTF-8')
    })

    it('should handle ASCII filename without issues', () => {
      const result = encodeContentDisposition('simple_file.srt')
      expect(result).toContain('attachment')
      expect(result).toContain('filename="simple_file.srt"')
    })

    it('should handle Chinese characters', () => {
      const result = encodeContentDisposition('字幕文件.srt')
      expect(result).toContain('attachment')
      expect(result).toContain('filename*=UTF-8')
    })

    it('should handle Arabic characters', () => {
      const result = encodeContentDisposition('ترجمة.srt')
      expect(result).toContain('attachment')
      expect(result).toContain('filename*=UTF-8')
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove dangerous characters', () => {
      const result = sanitizeFilename('file<>:"/\\|?*.srt')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).not.toContain(':')
      expect(result).not.toContain('"')
      expect(result).not.toContain('/')
      expect(result).not.toContain('\\')
      expect(result).not.toContain('|')
      expect(result).not.toContain('?')
      expect(result).not.toContain('*')
    })

    it('should preserve Vietnamese characters', () => {
      const result = sanitizeFilename('bắt cóc.srt')
      expect(result).toBe('bắt cóc.srt')
    })

    it('should remove leading/trailing dots and spaces', () => {
      const result = sanitizeFilename('  ...file.srt...  ')
      expect(result).toBe('file.srt')
    })

    it('should limit length to 255 characters', () => {
      const longName = 'a'.repeat(300) + '.srt'
      const result = sanitizeFilename(longName)
      expect(result.length).toBeLessThanOrEqual(255)
    })
  })

  describe('hasNonASCII', () => {
    it('should detect Vietnamese characters', () => {
      expect(hasNonASCII('bắt cóc.srt')).toBe(true)
    })

    it('should detect Czech characters', () => {
      expect(hasNonASCII('příliš.srt')).toBe(true)
    })

    it('should return false for ASCII-only', () => {
      expect(hasNonASCII('simple_file.srt')).toBe(false)
    })

    it('should detect emoji', () => {
      expect(hasNonASCII('file 🎬.srt')).toBe(true)
    })
  })

  describe('getSafeDownloadFilename', () => {
    it('should preserve safe Vietnamese filename', () => {
      const result = getSafeDownloadFilename('bắt cóc.srt')
      expect(result).toBe('bắt cóc.srt')
    })

    it('should sanitize dangerous characters', () => {
      const result = getSafeDownloadFilename('file<test>.srt')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should return default for empty filename', () => {
      const result = getSafeDownloadFilename('')
      expect(result).toBe('download.srt')
    })

    it('should return default for filename with only dangerous chars', () => {
      const result = getSafeDownloadFilename('<<<>>>')
      expect(result).toBe('download.srt')
    })
  })
})

