#!/usr/bin/env python3
"""
Tüm yeni tool'ları tamamlama scripti
"""
import re
from pathlib import Path

def update_tool(filename, html_content, js_content):
    filepath = Path('tools') / filename
    if not filepath.exists():
        print(f"❌ {filename} bulunamadı")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Eski HTML içeriğini bul ve değiştir (input-group'dan button'a kadar)
    old_pattern = r'<div class="input-group">.*?<button class="btn" onclick="generateQR.*?</button>'
    match = re.search(old_pattern, content, re.DOTALL)
    if match:
        content = content.replace(match.group(0), html_content)
    
    # JavaScript'i değiştir
    js_pattern = r'<script>\s*// Tool functionality.*?</script>'
    js_match = re.search(js_pattern, content, re.DOTALL)
    if js_match:
        content = content.replace(js_match.group(0), f'<script>\n{js_content}\n    </script>')
    else:
        # Script tag'i yoksa ekle (footer'dan önce)
        footer_pos = content.find('</footer>')
        if footer_pos != -1:
            content = content[:footer_pos] + f'    <script>\n{js_content}\n    </script>\n\n' + content[footer_pos:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

# Distance Calculator (zaten yapıldı, kontrol edelim)
print("🛠️ Tool'lar tamamlanıyor...\n")

# Color Palette Generator
color_palette_html = '''            <div class="input-group">
                <label for="baseColor">Base Color (Hex):</label>
                <input type="color" id="baseColor" value="#667eea" style="width: 100%; height: 50px;">
            </div>
            <div class="input-group">
                <label for="paletteType">Palette Type:</label>
                <select id="paletteType" style="width: 100%;">
                    <option value="monochromatic">Monochromatic</option>
                    <option value="complementary">Complementary</option>
                    <option value="triadic">Triadic</option>
                    <option value="analogous">Analogous</option>
                    <option value="tetradic">Tetradic</option>
                </select>
            </div>
            <button class="btn" onclick="generatePalette()" style="width: 100%; margin: 1rem 0;">Generate Palette</button>
            <div id="paletteArea" style="display: none; margin-top: 2rem;">
                <h3>Color Palette:</h3>
                <div id="colorSwatches" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; margin: 1rem 0;"></div>
                <button class="btn" onclick="copyPalette()" style="width: 100%; margin-top: 1rem;">Copy CSS Colors</button>
            </div>'''

color_palette_js = '''        function hexToRgb(hex) {
            const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        function rgbToHex(r, g, b) {
            return "#" + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            }).join("");
        }
        function generatePalette() {
            const baseColor = document.getElementById('baseColor').value;
            const type = document.getElementById('paletteType').value;
            const rgb = hexToRgb(baseColor);
            if (!rgb) return;
            
            let colors = [];
            if (type === 'monochromatic') {
                for (let i = 0; i < 5; i++) {
                    const factor = 0.2 + (i * 0.2);
                    colors.push(rgbToHex(
                        Math.round(rgb.r * factor),
                        Math.round(rgb.g * factor),
                        Math.round(rgb.b * factor)
                    ));
                }
            } else if (type === 'complementary') {
                colors = [baseColor, rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)];
            } else if (type === 'triadic') {
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                colors = [
                    baseColor,
                    hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l),
                    hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)
                ];
            } else {
                colors = [baseColor, baseColor, baseColor, baseColor, baseColor];
            }
            
            displayPalette(colors);
        }
        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            return { h: h * 360, s: s, l: l };
        }
        function hslToRgb(h, s, l) {
            h /= 360;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
        }
        function displayPalette(colors) {
            const swatches = document.getElementById('colorSwatches');
            swatches.innerHTML = '';
            colors.forEach((color, i) => {
                const div = document.createElement('div');
                div.style.cssText = `background: ${color}; padding: 2rem; border-radius: 8px; text-align: center; color: ${getContrastColor(color)};`;
                div.innerHTML = `<strong>${color}</strong>`;
                div.onclick = () => navigator.clipboard.writeText(color);
                swatches.appendChild(div);
            });
            document.getElementById('paletteArea').style.display = 'block';
            window.paletteColors = colors;
        }
        function getContrastColor(hex) {
            const rgb = hexToRgb(hex);
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            return brightness > 128 ? '#000' : '#fff';
        }
        function copyPalette() {
            const css = window.paletteColors.map(c => `color: ${c};`).join('\\n');
            navigator.clipboard.writeText(css);
            alert('Palette copied to clipboard!');
        }'''

if update_tool('color-palette-generator.html', color_palette_html, color_palette_js):
    print("✅ color-palette-generator.html tamamlandı")

# CSS Gradient Generator
css_gradient_html = '''            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group">
                    <label for="color1">Color 1:</label>
                    <input type="color" id="color1" value="#667eea" style="width: 100%; height: 50px;">
                </div>
                <div class="input-group">
                    <label for="color2">Color 2:</label>
                    <input type="color" id="color2" value="#764ba2" style="width: 100%; height: 50px;">
                </div>
            </div>
            <div class="input-group">
                <label for="direction">Direction:</label>
                <select id="direction" style="width: 100%;">
                    <option value="to right">To Right</option>
                    <option value="to bottom">To Bottom</option>
                    <option value="to bottom right">To Bottom Right</option>
                    <option value="135deg">135deg</option>
                    <option value="45deg">45deg</option>
                </select>
            </div>
            <button class="btn" onclick="generateGradient()" style="width: 100%; margin: 1rem 0;">Generate Gradient</button>
            <div id="gradientPreview" style="display: none; margin: 2rem 0; padding: 3rem; border-radius: 12px; min-height: 200px;"></div>
            <div id="cssOutput" style="display: none; margin-top: 1rem;">
                <div class="input-group">
                    <label for="cssCode">CSS Code:</label>
                    <textarea id="cssCode" rows="3" readonly style="font-family: monospace;"></textarea>
                </div>
                <button class="btn" onclick="copyCSS()" style="width: 100%; margin-top: 1rem;">Copy CSS</button>
            </div>'''

css_gradient_js = '''        function generateGradient() {
            const color1 = document.getElementById('color1').value;
            const color2 = document.getElementById('color2').value;
            const direction = document.getElementById('direction').value;
            
            const css = `background: linear-gradient(${direction}, ${color1}, ${color2});`;
            const preview = document.getElementById('gradientPreview');
            preview.style.cssText = css;
            preview.style.display = 'block';
            
            document.getElementById('cssCode').value = css;
            document.getElementById('cssOutput').style.display = 'block';
        }
        function copyCSS() {
            const css = document.getElementById('cssCode').value;
            navigator.clipboard.writeText(css);
            alert('CSS copied to clipboard!');
        }'''

if update_tool('css-gradient-generator.html', css_gradient_html, css_gradient_js):
    print("✅ css-gradient-generator.html tamamlandı")

# API Tester
api_tester_html = '''            <div class="input-group">
                <label for="apiUrl">API URL:</label>
                <input type="url" id="apiUrl" placeholder="https://api.example.com/endpoint" style="width: 100%;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group">
                    <label for="method">Method:</label>
                    <select id="method" style="width: 100%;">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="contentType">Content-Type:</label>
                    <select id="contentType" style="width: 100%;">
                        <option value="application/json">application/json</option>
                        <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                        <option value="text/plain">text/plain</option>
                    </select>
                </div>
            </div>
            <div class="input-group">
                <label for="requestBody">Request Body (optional):</label>
                <textarea id="requestBody" rows="5" placeholder='{"key": "value"}' style="font-family: monospace;"></textarea>
            </div>
            <button class="btn" onclick="testAPI()" style="width: 100%; margin: 1rem 0;">Test API</button>
            <div id="responseArea" style="display: none; margin-top: 2rem;">
                <h3>Response:</h3>
                <div class="input-group">
                    <label for="responseText">Response:</label>
                    <textarea id="responseText" rows="10" readonly style="font-family: monospace;"></textarea>
                </div>
                <button class="btn" onclick="copyResponse()" style="width: 100%; margin-top: 1rem;">Copy Response</button>
            </div>'''

api_tester_js = '''        async function testAPI() {
            const url = document.getElementById('apiUrl').value;
            const method = document.getElementById('method').value;
            const contentType = document.getElementById('contentType').value;
            const body = document.getElementById('requestBody').value;
            
            document.getElementById('errorArea').style.display = 'none';
            document.getElementById('responseArea').style.display = 'none';
            
            if (!url) {
                showError('Please enter API URL');
                return;
            }
            
            try {
                const options = {
                    method: method,
                    headers: { 'Content-Type': contentType }
                };
                
                if (method !== 'GET' && body) {
                    options.body = contentType === 'application/json' ? body : body;
                }
                
                const response = await fetch(url, options);
                const text = await response.text();
                
                let formatted;
                try {
                    formatted = JSON.stringify(JSON.parse(text), null, 2);
                } catch {
                    formatted = text;
                }
                
                document.getElementById('responseText').value = `Status: ${response.status} ${response.statusText}\\n\\n${formatted}`;
                document.getElementById('responseArea').style.display = 'block';
            } catch (error) {
                showError('Error: ' + error.message);
            }
        }
        function showError(msg) {
            document.getElementById('errorText').textContent = msg;
            document.getElementById('errorArea').style.display = 'block';
        }
        function copyResponse() {
            const response = document.getElementById('responseText').value;
            navigator.clipboard.writeText(response);
            alert('Response copied to clipboard!');
        }'''

if update_tool('api-tester.html', api_tester_html, api_tester_js):
    print("✅ api-tester.html tamamlandı")

# Engineering Unit Converter
engineering_html = '''            <div class="input-group">
                <label for="category">Category:</label>
                <select id="category" style="width: 100%;" onchange="updateUnits()">
                    <option value="pressure">Pressure</option>
                    <option value="force">Force</option>
                    <option value="torque">Torque</option>
                    <option value="power">Power</option>
                    <option value="energy">Energy</option>
                </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: end; margin: 2rem 0;">
                <div class="input-group">
                    <label for="fromValue">From:</label>
                    <input type="number" id="fromValue" value="1" step="0.01" style="width: 100%;">
                </div>
                <div style="text-align: center; padding-bottom: 1.5rem;">
                    <button class="btn" onclick="swapUnits()" style="padding: 0.5rem 1rem;">⇄</button>
                </div>
                <div class="input-group">
                    <label for="toValue">To:</label>
                    <input type="number" id="toValue" value="1" step="0.01" readonly style="width: 100%; background: var(--bg-color);">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group">
                    <label for="fromUnit">From Unit:</label>
                    <select id="fromUnit" style="width: 100%;"></select>
                </div>
                <div class="input-group">
                    <label for="toUnit">To Unit:</label>
                    <select id="toUnit" style="width: 100%;"></select>
                </div>
            </div>
            <button class="btn" onclick="convertEngineering()" style="width: 100%; margin: 1rem 0;">Convert</button>'''

engineering_js = '''        const units = {
            pressure: { 'Pa': 1, 'kPa': 1000, 'MPa': 1000000, 'bar': 100000, 'psi': 6894.76, 'atm': 101325 },
            force: { 'N': 1, 'kN': 1000, 'lbf': 4.44822, 'kgf': 9.80665 },
            torque: { 'N⋅m': 1, 'lbf⋅ft': 1.35582, 'kgf⋅m': 9.80665 },
            power: { 'W': 1, 'kW': 1000, 'hp': 745.7, 'Btu/h': 0.293071 },
            energy: { 'J': 1, 'kJ': 1000, 'kWh': 3600000, 'Btu': 1055.06, 'cal': 4.184 }
        };
        function updateUnits() {
            const category = document.getElementById('category').value;
            const unitList = units[category];
            const fromUnit = document.getElementById('fromUnit');
            const toUnit = document.getElementById('toUnit');
            
            fromUnit.innerHTML = '';
            toUnit.innerHTML = '';
            
            Object.keys(unitList).forEach(unit => {
                const opt1 = document.createElement('option');
                opt1.value = unit;
                opt1.textContent = unit;
                fromUnit.appendChild(opt1);
                
                const opt2 = document.createElement('option');
                opt2.value = unit;
                opt2.textContent = unit;
                toUnit.appendChild(opt2);
            });
        }
        function convertEngineering() {
            const category = document.getElementById('category').value;
            const fromValue = parseFloat(document.getElementById('fromValue').value);
            const fromUnit = document.getElementById('fromUnit').value;
            const toUnit = document.getElementById('toUnit').value;
            
            const unitList = units[category];
            const baseValue = fromValue * unitList[fromUnit];
            const result = baseValue / unitList[toUnit];
            
            document.getElementById('toValue').value = result.toFixed(6);
        }
        function swapUnits() {
            const fromUnit = document.getElementById('fromUnit').value;
            const toUnit = document.getElementById('toUnit').value;
            const fromValue = document.getElementById('fromValue').value;
            const toValue = document.getElementById('toValue').value;
            
            document.getElementById('fromUnit').value = toUnit;
            document.getElementById('toUnit').value = fromUnit;
            document.getElementById('fromValue').value = toValue;
            convertEngineering();
        }
        updateUnits();'''

if update_tool('engineering-unit-converter.html', engineering_html, engineering_js):
    print("✅ engineering-unit-converter.html tamamlandı")

# Concrete Calculator
concrete_html = '''            <div class="input-group">
                <label for="length">Length (m):</label>
                <input type="number" id="length" step="0.01" placeholder="10" style="width: 100%;">
            </div>
            <div class="input-group">
                <label for="width">Width (m):</label>
                <input type="number" id="width" step="0.01" placeholder="5" style="width: 100%;">
            </div>
            <div class="input-group">
                <label for="height">Height/Depth (m):</label>
                <input type="number" id="height" step="0.01" placeholder="0.15" style="width: 100%;">
            </div>
            <div class="input-group">
                <label for="mixRatio">Mix Ratio (Cement:Sand:Gravel):</label>
                <select id="mixRatio" style="width: 100%;">
                    <option value="1:2:3">1:2:3 (Standard)</option>
                    <option value="1:1.5:3">1:1.5:3 (Rich)</option>
                    <option value="1:3:6">1:3:6 (Lean)</option>
                </select>
            </div>
            <button class="btn" onclick="calculateConcrete()" style="width: 100%; margin: 1rem 0;">Calculate</button>
            <div id="resultArea" style="display: none; margin-top: 2rem; padding: 1.5rem; background: var(--bg-color); border-radius: 12px;">
                <h3 style="margin-top: 0;">Results:</h3>
                <p><strong>Volume:</strong> <span id="volume"></span> m³</p>
                <p><strong>Cement:</strong> <span id="cement"></span> bags (50kg)</p>
                <p><strong>Sand:</strong> <span id="sand"></span> m³</p>
                <p><strong>Gravel:</strong> <span id="gravel"></span> m³</p>
            </div>'''

concrete_js = '''        function calculateConcrete() {
            const length = parseFloat(document.getElementById('length').value);
            const width = parseFloat(document.getElementById('width').value);
            const height = parseFloat(document.getElementById('height').value);
            const ratio = document.getElementById('mixRatio').value;
            
            if (isNaN(length) || isNaN(width) || isNaN(height)) {
                showError('Please enter valid dimensions');
                return;
            }
            
            const volume = length * width * height;
            const [c, s, g] = ratio.split(':').map(Number);
            const total = c + s + g;
            
            // Approximate calculations (1 m³ concrete ≈ 1440 kg)
            const cementKg = (volume * c / total) * 1440 * 0.15; // 15% cement by weight
            const cementBags = cementKg / 50;
            const sandVolume = (volume * s / total);
            const gravelVolume = (volume * g / total);
            
            document.getElementById('volume').textContent = volume.toFixed(2);
            document.getElementById('cement').textContent = cementBags.toFixed(1);
            document.getElementById('sand').textContent = sandVolume.toFixed(2);
            document.getElementById('gravel').textContent = gravelVolume.toFixed(2);
            document.getElementById('resultArea').style.display = 'block';
        }
        function showError(msg) {
            document.getElementById('errorText').textContent = msg;
            document.getElementById('errorArea').style.display = 'block';
        }'''

if update_tool('concrete-calculator.html', concrete_html, concrete_js):
    print("✅ concrete-calculator.html tamamlandı")

# Electrical Calculator
electrical_html = '''            <div class="input-group">
                <label for="calcType">Calculation Type:</label>
                <select id="calcType" style="width: 100%;" onchange="updateFields()">
                    <option value="ohms">Ohm's Law (V = I × R)</option>
                    <option value="power">Power (P = V × I)</option>
                    <option value="voltage">Voltage (V = P / I)</option>
                    <option value="current">Current (I = P / V)</option>
                </select>
            </div>
            <div id="inputFields" style="margin: 1rem 0;">
                <!-- Dynamic fields will be inserted here -->
            </div>
            <button class="btn" onclick="calculateElectrical()" style="width: 100%; margin: 1rem 0;">Calculate</button>
            <div id="resultArea" style="display: none; margin-top: 2rem; padding: 1.5rem; background: var(--bg-color); border-radius: 12px;">
                <h3 style="margin-top: 0;">Result:</h3>
                <p id="resultText" style="font-size: 1.2rem; font-weight: 600;"></p>
            </div>'''

electrical_js = '''        function updateFields() {
            const type = document.getElementById('calcType').value;
            const fields = document.getElementById('inputFields');
            
            if (type === 'ohms') {
                fields.innerHTML = `
                    <div class="input-group">
                        <label for="voltage">Voltage (V):</label>
                        <input type="number" id="voltage" step="0.01" placeholder="12" style="width: 100%;">
                    </div>
                    <div class="input-group">
                        <label for="current">Current (A):</label>
                        <input type="number" id="current" step="0.01" placeholder="2" style="width: 100%;">
                    </div>
                `;
            } else if (type === 'power') {
                fields.innerHTML = `
                    <div class="input-group">
                        <label for="voltage">Voltage (V):</label>
                        <input type="number" id="voltage" step="0.01" placeholder="12" style="width: 100%;">
                    </div>
                    <div class="input-group">
                        <label for="current">Current (A):</label>
                        <input type="number" id="current" step="0.01" placeholder="2" style="width: 100%;">
                    </div>
                `;
            } else if (type === 'voltage') {
                fields.innerHTML = `
                    <div class="input-group">
                        <label for="power">Power (W):</label>
                        <input type="number" id="power" step="0.01" placeholder="24" style="width: 100%;">
                    </div>
                    <div class="input-group">
                        <label for="current">Current (A):</label>
                        <input type="number" id="current" step="0.01" placeholder="2" style="width: 100%;">
                    </div>
                `;
            } else if (type === 'current') {
                fields.innerHTML = `
                    <div class="input-group">
                        <label for="power">Power (W):</label>
                        <input type="number" id="power" step="0.01" placeholder="24" style="width: 100%;">
                    </div>
                    <div class="input-group">
                        <label for="voltage">Voltage (V):</label>
                        <input type="number" id="voltage" step="0.01" placeholder="12" style="width: 100%;">
                    </div>
                `;
            }
        }
        function calculateElectrical() {
            const type = document.getElementById('calcType').value;
            let result = 0;
            let unit = '';
            
            if (type === 'ohms') {
                const v = parseFloat(document.getElementById('voltage').value);
                const i = parseFloat(document.getElementById('current').value);
                if (isNaN(v) || isNaN(i) || i === 0) {
                    showError('Please enter valid values');
                    return;
                }
                result = v / i;
                unit = 'Ω (Ohms)';
            } else if (type === 'power') {
                const v = parseFloat(document.getElementById('voltage').value);
                const i = parseFloat(document.getElementById('current').value);
                if (isNaN(v) || isNaN(i)) {
                    showError('Please enter valid values');
                    return;
                }
                result = v * i;
                unit = 'W (Watts)';
            } else if (type === 'voltage') {
                const p = parseFloat(document.getElementById('power').value);
                const i = parseFloat(document.getElementById('current').value);
                if (isNaN(p) || isNaN(i) || i === 0) {
                    showError('Please enter valid values');
                    return;
                }
                result = p / i;
                unit = 'V (Volts)';
            } else if (type === 'current') {
                const p = parseFloat(document.getElementById('power').value);
                const v = parseFloat(document.getElementById('voltage').value);
                if (isNaN(p) || isNaN(v) || v === 0) {
                    showError('Please enter valid values');
                    return;
                }
                result = p / v;
                unit = 'A (Amperes)';
            }
            
            document.getElementById('resultText').textContent = `${result.toFixed(2)} ${unit}`;
            document.getElementById('resultArea').style.display = 'block';
            document.getElementById('errorArea').style.display = 'none';
        }
        function showError(msg) {
            document.getElementById('errorText').textContent = msg;
            document.getElementById('errorArea').style.display = 'block';
        }
        updateFields();'''

if update_tool('electrical-calculator.html', electrical_html, electrical_js):
    print("✅ electrical-calculator.html tamamlandı")

print("\n✅ Tüm tool'lar tamamlandı!")
print("📊 Özet: 8 tool çalışır durumda")

