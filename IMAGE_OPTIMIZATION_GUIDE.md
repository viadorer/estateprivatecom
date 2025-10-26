# Průvodce Optimalizací Fotografií

## AKTUÁLNÍ STAV

### Co máme implementováno:

**Knihovna:** Sharp (https://sharp.pixelplumbing.com/)
- Nejrychlejší knihovna pro zpracování obrázků v Node.js
- Používá libvips (C knihovna) - 4-5x rychlejší než ImageMagick
- Automatická komprese při uploadu

**Aktuální konfigurace:**

```javascript
// backend/server.js řádky 676-683
await sharp(file.path)
  .resize(1920, 1080, {
    fit: 'inside',
    withoutEnlargement: true
  })
  .jpeg({ quality: 85, progressive: true })
  .toFile(outputPath);
```

**Parametry:**
- Max rozlišení: 1920x1080 (Full HD)
- Kvalita JPEG: 85% (dobrý kompromis kvalita/velikost)
- Progressive JPEG: Ano (rychlejší načítání)
- Fit: 'inside' (zachová poměr stran)

---

## VYLEPŠENÍ SHARP - POKROČILÉ FUNKCE

### 1. Více Velikostí (Responsive Images)

```javascript
// Vytvořit thumbnail, medium a full size
const sizes = [
  { name: 'thumb', width: 300, height: 200 },
  { name: 'medium', width: 800, height: 600 },
  { name: 'full', width: 1920, height: 1080 }
];

const processedImages = [];

for (const file of req.files) {
  const images = {};
  
  for (const size of sizes) {
    const outputPath = path.join(
      path.dirname(file.path),
      `${size.name}-${path.basename(file.path)}`
    );
    
    await sharp(file.path)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    
    images[size.name] = `http://localhost:${PORT}/uploads/${req.params.type}/${path.basename(outputPath)}`;
  }
  
  processedImages.push(images);
}
```

### 2. WebP Formát (Lepší Komprese)

WebP je moderní formát od Google - o 25-35% menší než JPEG při stejné kvalitě.

```javascript
await sharp(file.path)
  .resize(1920, 1080, {
    fit: 'inside',
    withoutEnlargement: true
  })
  .webp({ quality: 85, effort: 6 })
  .toFile(outputPath);

// NEBO generovat oba formáty (JPEG + WebP)
const jpegPath = outputPath.replace(/\.\w+$/, '.jpg');
const webpPath = outputPath.replace(/\.\w+$/, '.webp');

await Promise.all([
  sharp(file.path).jpeg({ quality: 85 }).toFile(jpegPath),
  sharp(file.path).webp({ quality: 85 }).toFile(webpPath)
]);
```

### 3. AVIF Formát (Nejlepší Komprese)

AVIF je nejnovější formát - o 50% menší než JPEG!

```javascript
await sharp(file.path)
  .resize(1920, 1080, {
    fit: 'inside',
    withoutEnlargement: true
  })
  .avif({ quality: 85, effort: 6 })
  .toFile(outputPath);
```

### 4. Automatická Detekce Formátu

```javascript
const metadata = await sharp(file.path).metadata();

let pipeline = sharp(file.path)
  .resize(1920, 1080, {
    fit: 'inside',
    withoutEnlargement: true
  });

// Zachovat původní formát nebo použít WebP
if (metadata.format === 'png') {
  pipeline = pipeline.png({ quality: 90, compressionLevel: 9 });
} else if (metadata.format === 'gif') {
  pipeline = pipeline.gif();
} else {
  // JPEG nebo WebP
  pipeline = pipeline.webp({ quality: 85 });
}

await pipeline.toFile(outputPath);
```

### 5. Watermark (Vodoznak)

```javascript
const watermark = await sharp('watermark.png')
  .resize(200, 50)
  .toBuffer();

await sharp(file.path)
  .resize(1920, 1080, {
    fit: 'inside',
    withoutEnlargement: true
  })
  .composite([{
    input: watermark,
    gravity: 'southeast'
  }])
  .jpeg({ quality: 85 })
  .toFile(outputPath);
```

### 6. EXIF Data Removal (Bezpečnost)

```javascript
await sharp(file.path)
  .resize(1920, 1080)
  .rotate() // Automaticky rotuje podle EXIF
  .withMetadata(false) // Odstraní EXIF data (GPS, datum, ...)
  .jpeg({ quality: 85 })
  .toFile(outputPath);
```

### 7. Smart Crop (AI-based)

```javascript
// Sharp má vestavěný smart crop
await sharp(file.path)
  .resize(800, 600, {
    fit: 'cover',
    position: 'attention' // AI detekce důležité oblasti
  })
  .jpeg({ quality: 85 })
  .toFile(outputPath);
```

---

## POKROČILÉ KNIHOVNY (ZDARMA)

### 1. Sharp (DOPORUČENO - UŽ MÁME)

**Výhody:**
- Nejrychlejší (4-5x rychlejší než ImageMagick)
- Nízká spotřeba paměti
- Podpora WebP, AVIF, JPEG, PNG, GIF, SVG, TIFF
- Automatická rotace podle EXIF
- Smart crop s AI
- Watermarking
- Metadata manipulace

**Nevýhody:**
- Vyžaduje native dependencies (libvips)
- Složitější instalace na některých systémech

**Instalace:**
```bash
npm install sharp
```

**Hodnocení:** 10/10 - Nejlepší volba pro produkci

---

### 2. Jimp (Pure JavaScript)

**Výhody:**
- Pure JavaScript (žádné native dependencies)
- Snadná instalace
- Podpora základních operací
- Funguje i v browseru

**Nevýhody:**
- Pomalejší než Sharp (10-20x)
- Omezená podpora formátů
- Horší kvalita komprese

**Instalace:**
```bash
npm install jimp
```

**Použití:**
```javascript
import Jimp from 'jimp';

const image = await Jimp.read(file.path);
await image
  .resize(1920, 1080)
  .quality(85)
  .writeAsync(outputPath);
```

**Hodnocení:** 6/10 - Dobrá pro jednoduché projekty

---

### 3. ImageMagick (CLI wrapper)

**Výhody:**
- Velmi mocný nástroj
- Podpora 200+ formátů
- Pokročilé efekty

**Nevýhody:**
- Pomalý
- Vysoká spotřeba paměti
- Vyžaduje instalaci ImageMagick

**Instalace:**
```bash
brew install imagemagick
npm install imagemagick
```

**Hodnocení:** 7/10 - Dobrý pro složité operace

---

### 4. Squoosh (Google)

**Výhody:**
- Nejlepší komprese (používá Google algoritmy)
- Podpora WebP, AVIF, MozJPEG
- CLI i Web verze

**Nevýhody:**
- Pomalejší než Sharp
- Složitější API

**Instalace:**
```bash
npm install @squoosh/lib
```

**Použití:**
```javascript
import { ImagePool } from '@squoosh/lib';

const imagePool = new ImagePool();
const image = imagePool.ingestImage(file.path);

await image.encode({
  mozjpeg: { quality: 85 },
  webp: { quality: 85 }
});

const { binary } = await image.encodedWith.mozjpeg;
await fs.writeFile(outputPath, binary);
```

**Hodnocení:** 8/10 - Nejlepší komprese, ale pomalejší

---

## DOPORUČENÍ PRO ESTATE PRIVATE

### Aktuální Řešení (Sharp) je VÝBORNÉ!

Sharp je nejlepší volba pro produkční aplikaci jako Estate Private.

### Doporučená Vylepšení:

#### 1. Přidat WebP Formát

```javascript
// Generovat JPEG + WebP
const jpegPath = path.join(uploadPath, `${filename}.jpg`);
const webpPath = path.join(uploadPath, `${filename}.webp`);

await Promise.all([
  sharp(file.path)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toFile(jpegPath),
  
  sharp(file.path)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toFile(webpPath)
]);

// Frontend použije <picture> tag
// <picture>
//   <source srcset="image.webp" type="image/webp">
//   <img src="image.jpg" alt="Property">
// </picture>
```

**Výhoda:** 30% menší soubory, rychlejší načítání

#### 2. Více Velikostí (Responsive)

```javascript
const sizes = {
  thumb: { width: 400, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1920, height: 1080 }
};

for (const [name, size] of Object.entries(sizes)) {
  await sharp(file.path)
    .resize(size.width, size.height, {
      fit: 'cover',
      position: 'attention'
    })
    .webp({ quality: 85 })
    .toFile(`${uploadPath}/${name}-${filename}.webp`);
}
```

**Výhoda:** Rychlejší načítání na mobilech

#### 3. Odstranit EXIF Data (GDPR)

```javascript
await sharp(file.path)
  .resize(1920, 1080)
  .rotate() // Zachová správnou orientaci
  .withMetadata(false) // Odstraní GPS, datum, model fotoaparátu
  .webp({ quality: 85 })
  .toFile(outputPath);
```

**Výhoda:** Ochrana soukromí (GPS lokace)

#### 4. Lazy Loading Placeholder

```javascript
// Vygenerovat malý blur placeholder (LQIP)
const placeholder = await sharp(file.path)
  .resize(20, 15, { fit: 'cover' })
  .blur(10)
  .webp({ quality: 20 })
  .toBuffer();

const placeholderBase64 = `data:image/webp;base64,${placeholder.toString('base64')}`;

// Uložit do DB jako property.placeholder
```

**Výhoda:** Lepší UX při načítání

---

## SROVNÁNÍ FORMÁTŮ

| Formát | Velikost | Kvalita | Podpora | Doporučení |
|--------|----------|---------|---------|------------|
| JPEG | 100% | Dobrá | 100% | Základní |
| WebP | 70% | Stejná | 97% | DOPORUČENO |
| AVIF | 50% | Lepší | 85% | Budoucnost |
| PNG | 300% | Lossless | 100% | Jen pro loga |

---

## IMPLEMENTACE - KROK ZA KROKEM

### Krok 1: Vylepšit Upload Endpoint

```javascript
// backend/server.js
app.post('/api/upload/:type', upload.array('images', 10), async (req, res) => {
  try {
    const processedImages = [];

    for (const file of req.files) {
      const filename = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const uploadPath = path.join(__dirname, 'uploads', req.params.type);

      // Generovat 3 velikosti v WebP
      const sizes = {
        thumb: { width: 400, height: 300 },
        medium: { width: 800, height: 600 },
        large: { width: 1920, height: 1080 }
      };

      const urls = {};

      for (const [name, size] of Object.entries(sizes)) {
        const outputPath = path.join(uploadPath, `${name}-${filename}.webp`);
        
        await sharp(file.path)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'attention'
          })
          .rotate()
          .withMetadata(false)
          .webp({ quality: 85, effort: 6 })
          .toFile(outputPath);

        urls[name] = `http://localhost:${PORT}/uploads/${req.params.type}/${name}-${filename}.webp`;
      }

      // Smazat původní soubor
      fs.unlinkSync(file.path);

      processedImages.push(urls);
    }

    res.json({ 
      success: true, 
      images: processedImages
    });
  } catch (error) {
    console.error('Chyba při uploadu:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Krok 2: Frontend - Responsive Images

```jsx
// PropertyCard.jsx
<picture>
  <source 
    srcSet={`${image.thumb} 400w, ${image.medium} 800w, ${image.large} 1920w`}
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1920px"
    type="image/webp"
  />
  <img 
    src={image.medium} 
    alt="Property" 
    loading="lazy"
    className="w-full h-64 object-cover"
  />
</picture>
```

---

## MONITORING VELIKOSTI

```javascript
// Přidat do upload endpointu
const originalSize = fs.statSync(file.path).size;
const compressedSize = fs.statSync(outputPath).size;
const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

console.log(`Komprese: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${savings}% úspora)`);
```

---

## ZÁVĚR

**Aktuální stav:** Sharp s JPEG (85% kvalita) - DOBRÝ ✅

**Doporučené vylepšení:**
1. Přidat WebP formát (30% úspora)
2. Generovat 3 velikosti (responsive)
3. Odstranit EXIF data (GDPR)
4. Lazy loading s placeholdery

**Náklady:** 0 Kč (vše zdarma)
**Čas implementace:** 2-3 hodiny
**Výsledek:** 50-70% menší soubory, rychlejší načítání

---

**Vytvořeno:** 26. října 2024  
**Verze:** 1.0
