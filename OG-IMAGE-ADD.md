# OG Image Ekleme Talimatları

## Görseli Ekleme

1. **Görseli indir/kaydet**
   - Görseli `og-image.jpg` olarak kaydet
   - Boyut: 1200x630px (ideal)
   - Format: JPG veya PNG

2. **Site root'una koy**
   - Dosyayı `/Users/ozkancimenli/Desktop/projects/omnitoolset/` klasörüne koy
   - Dosya adı: `og-image.jpg` (tam olarak bu isim)

3. **Vercel'e push et**
   ```bash
   git add og-image.jpg
   git commit -m "Add OG image for social sharing"
   git push origin main
   ```

## Test Etme

Görseli ekledikten sonra test edin:

1. **Facebook Debugger:**
   https://developers.facebook.com/tools/debug/
   - URL'yi girin: `https://www.omnitoolset.com`
   - "Scrape Again" butonuna tıklayın
   - Görselin göründüğünü kontrol edin

2. **Twitter Card Validator:**
   https://cards-dev.twitter.com/validator
   - URL'yi girin
   - Görselin göründüğünü kontrol edin

3. **LinkedIn Post Inspector:**
   https://www.linkedin.com/post-inspector/
   - URL'yi girin
   - Görselin göründüğünü kontrol edin

## Not

Görseli ekledikten sonra bana haber verin, test edip doğrulayabilirim!

