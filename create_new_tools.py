#!/usr/bin/env python3
"""
Yeni tool'ları toplu olarak oluşturma scripti
"""

import os
from pathlib import Path

# Template dosyasını oku
template_path = Path('tools/qr-generator.html')
if not template_path.exists():
    print("❌ Template dosyası bulunamadı!")
    exit(1)

with open(template_path, 'r', encoding='utf-8') as f:
    template = f.read()

# Yeni tool'lar
new_tools = [
    {
        'filename': 'coordinate-converter.html',
        'title': 'Coordinate Converter - GIS Tool | OmniToolset',
        'description': 'Convert coordinates between WGS84, UTM, MGRS, and other formats. Free GIS tool for surveyors and mapping professionals.',
        'h2': '🗺️ Coordinate Converter',
        'p': 'Convert GPS coordinates between different formats (WGS84, UTM, MGRS, etc.).',
        'keywords': 'coordinate converter, gis tool, wgs84, utm, mgrs, gps coordinates, surveyor tools, mapping tools'
    },
    {
        'filename': 'distance-calculator.html',
        'title': 'Distance Calculator - Haversine Formula | OmniToolset',
        'description': 'Calculate distance between two GPS coordinates using Haversine formula. Perfect for GIS and mapping applications.',
        'h2': '📏 Distance Calculator',
        'p': 'Calculate the distance between two GPS coordinates using the Haversine formula.',
        'keywords': 'distance calculator, haversine formula, gps distance, coordinate distance, gis calculator, mapping tools'
    },
    {
        'filename': 'color-palette-generator.html',
        'title': 'Color Palette Generator | OmniToolset',
        'description': 'Generate beautiful color palettes for your design projects. Free color scheme generator for developers and designers.',
        'h2': '🎨 Color Palette Generator',
        'p': 'Generate beautiful color palettes for your design projects.',
        'keywords': 'color palette generator, color scheme, color picker, design tools, color combinations, palette generator'
    },
    {
        'filename': 'css-gradient-generator.html',
        'title': 'CSS Gradient Generator | OmniToolset',
        'description': 'Generate CSS gradients with live preview. Free gradient tool for web developers.',
        'h2': '🌈 CSS Gradient Generator',
        'p': 'Generate beautiful CSS gradients with live preview.',
        'keywords': 'css gradient generator, gradient maker, css gradients, web design tools, gradient tool, css generator'
    },
    {
        'filename': 'api-tester.html',
        'title': 'REST API Tester | OmniToolset',
        'description': 'Test REST API endpoints. Free API testing tool for developers.',
        'h2': '🔌 REST API Tester',
        'p': 'Test REST API endpoints with GET, POST, PUT, DELETE methods.',
        'keywords': 'api tester, rest api, api testing, http client, api tool, rest client, api debugger'
    },
    {
        'filename': 'engineering-unit-converter.html',
        'title': 'Engineering Unit Converter | OmniToolset',
        'description': 'Convert engineering units: pressure, force, torque, power, and more. Free tool for engineers.',
        'h2': '⚙️ Engineering Unit Converter',
        'p': 'Convert engineering units: pressure, force, torque, power, energy, and more.',
        'keywords': 'engineering unit converter, pressure converter, force converter, torque converter, engineering calculator'
    },
    {
        'filename': 'concrete-calculator.html',
        'title': 'Concrete Calculator | OmniToolset',
        'description': 'Calculate concrete volume and mix ratios. Free construction calculator for civil engineers.',
        'h2': '🏗️ Concrete Calculator',
        'p': 'Calculate concrete volume, mix ratios, and material requirements.',
        'keywords': 'concrete calculator, construction calculator, concrete volume, mix ratio, civil engineering tools'
    },
    {
        'filename': 'electrical-calculator.html',
        'title': 'Electrical Calculator | OmniToolset',
        'description': 'Calculate electrical values: Ohm\'s law, power, voltage, current. Free tool for electrical engineers.',
        'h2': '⚡ Electrical Calculator',
        'p': 'Calculate electrical values using Ohm\'s law and power formulas.',
        'keywords': 'electrical calculator, ohm law calculator, power calculator, voltage calculator, electrical engineering tools'
    }
]

print(f"🛠️ {len(new_tools)} yeni tool oluşturuluyor...\n")

created = 0
for tool in new_tools:
    filepath = Path('tools') / tool['filename']
    
    if filepath.exists():
        print(f"⏭️  {tool['filename']} zaten var, atlanıyor...")
        continue
    
    # Template'i customize et
    content = template
    
    # Title değiştir
    content = content.replace(
        '<title>QR Code Generator - Generate QR Codes | OmniToolset</title>',
        f'<title>{tool["title"]}</title>'
    )
    
    # Meta description değiştir
    content = content.replace(
        '<meta name="description" content="Generate QR codes for text or URL. Free, online, no registration required.">',
        f'<meta name="description" content="{tool["description"]}">'
    )
    
    # Keywords ekle
    if '<meta name="keywords"' not in content or 'keywords' not in content.lower():
        # Meta keywords ekle (title tag'inden sonra)
        keywords_tag = f'    <meta name="keywords" content="{tool["keywords"]}">\n'
        content = content.replace(
            '<meta name="description"',
            keywords_tag + '    <meta name="description"'
        )
    
    # H2 ve p değiştir
    content = content.replace(
        '<h2>📱 QR Code Generator</h2>',
        f'<h2>{tool["h2"]}</h2>'
    )
    content = content.replace(
        '<p>Generate QR codes for text, URLs, or other data.</p>',
        f'<p>{tool["p"]}</p>'
    )
    
    # JavaScript kısmını basit placeholder ile değiştir
    # (Her tool için özel JavaScript sonra eklenecek)
    js_start = content.find('<script src="https://cdn.jsdelivr.net/npm/qrcodejs')
    if js_start != -1:
        js_end = content.find('</script>', js_start) + 9
        placeholder_js = '''    <script>
        // Tool functionality will be implemented here
        function processTool() {
            alert('Tool functionality coming soon!');
        }
    </script>'''
        content = content[:js_start] + placeholder_js + content[js_end:]
    
    # Input alanlarını basit placeholder ile değiştir
    if 'inputText' in content:
        content = content.replace(
            '<textarea id="inputText"',
            '<textarea id="inputText" placeholder="Enter input here..."'
        )
    
    # Dosyayı kaydet
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    created += 1
    print(f"✅ {tool['filename']} oluşturuldu")

print(f"\n📊 Özet: {created} yeni tool oluşturuldu!")
print(f"⚠️  Not: JavaScript fonksiyonları sonra eklenecek")

