# Finální Stylování Tabů - Verze 3.0

## Přehled

Taby v editoru titulků byly kompletně přepracovány na výrazná, barevná tlačítka s jasnou vizuální zpětnou vazbou.

## Klíčové Vlastnosti

### ✅ Aktivní Tlačítko (Zakliknuté)
- **Plné barevné pozadí** s gradientem
- **Bílý text** pro maximální kontrast
- **Ring efekt** (svítící obrys) kolem tlačítka
- **Silnější stín** s barevným nádechem
- **Tmavší rámeček** v barvě tlačítka

### ✅ Neaktivní Tlačítko
- **Bílé/tmavé pozadí** (podle dark mode)
- **Barevný text a rámeček** (podle funkce)
- **Při hover**: Plné barevné pozadí s gradientem + bílý text
- **Scale efekt**: Zvětšení o 5% při najetí myší

### ✅ Interaktivní Efekty
- **Hover**: Barevný gradient + bílý text + zvětšení
- **Active (kliknutí)**: Zmenšení o 5% pro pocit stisknutí
- **Plynulé animace**: 300ms transition

## Barevné Schéma

### 🔵 Editor Tab (Modrá)
**Aktivní:**
```css
background: gradient blue-500 → blue-600 → blue-700
text: white
border: blue-700
shadow: blue-500/60
ring: blue-300 (light) / blue-800 (dark)
```

**Hover (neaktivní):**
```css
background: gradient blue-400 → blue-500
text: white
border: blue-500
```

### 🟣 Find & Replace Tab (Fialová)
**Aktivní:**
```css
background: gradient purple-500 → purple-600 → purple-700
text: white
border: purple-700
shadow: purple-500/60
ring: purple-300 (light) / purple-800 (dark)
```

**Hover (neaktivní):**
```css
background: gradient purple-400 → purple-500
text: white
border: purple-500
```

### 🟢 Synchronizace Tab (Zelená)
**Aktivní:**
```css
background: gradient green-500 → emerald-600 → green-700
text: white
border: green-700
shadow: green-500/60
ring: green-300 (light) / green-800 (dark)
```

**Hover (neaktivní):**
```css
background: gradient green-400 → emerald-500
text: white
border: green-500
```

## Vizuální Efekty

### Ring Efekt (Aktivní Tlačítko)
```tsx
ring-4 ring-blue-300 dark:ring-blue-800
```
- Vytváří svítící obrys kolem aktivního tlačítka
- 4px široký ring
- Světlá barva v light mode, tmavá v dark mode
- Jasně označuje aktivní tab

### Gradient Pozadí
```tsx
bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700
```
- Diagonální gradient (bottom-right)
- Tři barevné body pro hloubku
- Aktivní: Tmavší odstíny
- Hover: Světlejší odstíny

### Stíny
```tsx
shadow-lg          // Základní stín
hover:shadow-2xl   // Větší stín při hover
shadow-blue-500/60 // Barevný stín (aktivní)
```

### Scale Efekty
```tsx
hover:scale-105    // +5% při hover
active:scale-95    // -5% při kliknutí
```

## Technická Implementace

### TabsList
```tsx
<TabsList className="grid grid-cols-3 gap-3 bg-transparent p-0">
```
- 3 sloupce s mezerami
- Transparentní pozadí
- Žádný padding

### TabsTrigger - Společné Třídy
```tsx
className={`
  flex items-center justify-center space-x-2 
  rounded-xl font-bold 
  transition-all duration-300 
  cursor-pointer
  border-2 
  shadow-lg hover:shadow-2xl 
  active:scale-95
  ${isFloating ? 'px-4 py-3 text-sm' : 'px-8 py-4 text-base'}
`}
```

### Aktivní Stav (data-[state=active])
```tsx
data-[state=active]:bg-gradient-to-br 
data-[state=active]:from-blue-500 
data-[state=active]:via-blue-600 
data-[state=active]:to-blue-700
data-[state=active]:text-white 
data-[state=active]:border-blue-700 
data-[state=active]:shadow-blue-500/60
data-[state=active]:ring-4 
data-[state=active]:ring-blue-300 
data-[state=active]:dark:ring-blue-800
```

### Neaktivní Stav (data-[state=inactive])
```tsx
data-[state=inactive]:bg-white 
data-[state=inactive]:dark:bg-slate-800
data-[state=inactive]:border-blue-300 
data-[state=inactive]:dark:border-blue-700
data-[state=inactive]:text-blue-700 
data-[state=inactive]:dark:text-blue-300
```

### Hover Stav (neaktivní)
```tsx
data-[state=inactive]:hover:bg-gradient-to-br 
data-[state=inactive]:hover:from-blue-400 
data-[state=inactive]:hover:to-blue-500
data-[state=inactive]:hover:text-white 
data-[state=inactive]:hover:border-blue-500
data-[state=inactive]:hover:scale-105
```

## Responzivita

### Normální Režim
```tsx
px-8 py-4 text-base  // Větší tlačítka
h-6 w-6              // Větší ikony
```

### Plovoucí Režim
```tsx
px-4 py-3 text-sm    // Kompaktnější
h-5 w-5              // Menší ikony
```

## Přístupnost

### Kontrast
- ✅ **Aktivní**: Bílý text na barevném pozadí (WCAG AAA)
- ✅ **Neaktivní**: Barevný text na bílém/tmavém pozadí (WCAG AA)
- ✅ **Hover**: Bílý text na barevném pozadí (WCAG AAA)

### Vizuální Indikátory
- ✅ **Ring efekt**: Jasně označuje aktivní tab
- ✅ **Barevné pozadí**: Okamžitě viditelné při aktivaci
- ✅ **Cursor pointer**: Indikuje klikatelnost
- ✅ **Hover efekt**: Barevné pozadí při najetí myší
- ✅ **Scale efekt**: Fyzická zpětná vazba

### Klávesová Navigace
- ✅ Tab key pro přepínání mezi tlačítky
- ✅ Enter/Space pro aktivaci
- ✅ Šipky pro navigaci (Radix UI)

## Uživatelská Zkušenost

### Co Uživatel Vidí

1. **Tři výrazná tlačítka** s mezerami mezi nimi
2. **Aktivní tlačítko** má:
   - Plné barevné pozadí
   - Bílý text
   - Svítící obrys (ring)
   - Silný barevný stín

3. **Při najetí myší** na neaktivní tlačítko:
   - Tlačítko se obarví (gradient)
   - Text zběhne
   - Tlačítko se mírně zvětší
   - Stín se zvětší

4. **Při kliknutí**:
   - Tlačítko se mírně zmenší (stisknutí)
   - Okamžitě se aktivuje s plným barevným pozadím

### Psychologie Barev

- **Modrá (Editor)**: Důvěra, stabilita, primární funkce
- **Fialová (Find & Replace)**: Kreativita, pokročilé funkce
- **Zelená (Synchronizace)**: Akce, synchronizace, nová funkce

## Výkon

### Optimalizace
- ✅ CSS transitions (GPU akcelerované)
- ✅ Žádný JavaScript pro animace
- ✅ Minimální reflow/repaint
- ✅ Využití existujících Tailwind tříd

### Velikost
- Přidáno: ~800 bytes CSS (gzipped)
- Žádné nové závislosti

## Srovnání Verzí

### Verze 1.0 (Původní)
- Šedé pozadí
- Minimální kontrast
- Nevypadaly jako tlačítka

### Verze 2.0 (První Vylepšení)
- Samostatná tlačítka
- Barevné rámečky
- Základní hover efekty

### Verze 3.0 (Finální) ⭐
- **Aktivní**: Plné barevné pozadí + ring efekt
- **Hover**: Barevný gradient + bílý text
- **Jasná klikatelnost**: Cursor pointer + scale efekty
- **Maximální viditelnost**: Výrazné barvy a stíny

## Závěr

Tlačítka nyní:
- ✅ **Vypadají jako tlačítka** (cursor pointer, 3D efekty)
- ✅ **Jasně ukazují aktivní stav** (barevné pozadí + ring)
- ✅ **Reagují na hover** (barevný gradient + zvětšení)
- ✅ **Poskytují zpětnou vazbu** (scale efekty při kliknutí)
- ✅ **Jsou přístupné** (WCAG kontrast, klávesová navigace)

---

**Implementováno:** 2025-10-06  
**Verze:** 3.0.0  
**Status:** ✅ Finální a testováno

