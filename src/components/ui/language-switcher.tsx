'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' }
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Detect current language from pathname
    const pathLang = pathname.startsWith('/cs') ? 'cs' : 'en';
    setCurrentLang(pathLang);
  }, [pathname]);

  const handleLanguageChange = (newLang: string) => {
    setCurrentLang(newLang);
    
    if (newLang === 'cs') {
      // Redirect to Czech version
      if (pathname === '/') {
        router.push('/cs');
      } else if (!pathname.startsWith('/cs')) {
        router.push(`/cs${pathname}`);
      }
    } else {
      // Redirect to English version (default)
      if (pathname === '/cs') {
        router.push('/');
      } else if (pathname.startsWith('/cs/')) {
        router.push(pathname.replace('/cs', ''));
      }
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[100px] h-9">
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          <SelectValue>
            <span className="flex items-center gap-1">
              <span>{currentLanguage.flag}</span>
              <span className="hidden lg:inline text-sm">{currentLanguage.name}</span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
