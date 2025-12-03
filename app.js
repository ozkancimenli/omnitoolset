// Tools Database - All 120+ tools
const tools = [
  // PDF Tools
  { id: 'pdf-merge', title: 'Merge PDF', description: 'Combine multiple PDF files into one', icon: '📄', category: 'PDF', page: 'tools/pdf-merge.html' },
  { id: 'pdf-split', title: 'Split PDF', description: 'Split your PDF file by pages', icon: '✂️', category: 'PDF', page: 'tools/pdf-split.html' },
  { id: 'pdf-compress', title: 'Compress PDF', description: 'Reduce PDF file size', icon: '🗜️', category: 'PDF', page: 'tools/pdf-compress.html' },
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Convert PDF file to Word format', icon: '📝', category: 'PDF', page: 'tools/pdf-to-word.html' },
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Convert PDF pages to JPG format', icon: '🖼️', category: 'PDF', page: 'tools/pdf-to-jpg.html' },
  { id: 'pdf-to-png', title: 'PDF to PNG', description: 'Convert PDF pages to PNG format', icon: '🖼️', category: 'PDF', page: 'tools/pdf-to-png.html' },
  { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Convert JPG images to PDF format', icon: '📄', category: 'PDF', page: 'tools/jpg-to-pdf.html' },
  { id: 'png-to-pdf', title: 'PNG to PDF', description: 'Convert PNG images to PDF format', icon: '📄', category: 'PDF', page: 'tools/png-to-pdf.html' },
  { id: 'word-to-pdf', title: 'Word to PDF', description: 'Convert Word file to PDF format', icon: '📝', category: 'PDF', page: 'tools/word-to-pdf.html' },
  { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Convert Excel file to PDF format', icon: '📊', category: 'PDF', page: 'tools/excel-to-pdf.html' },
  { id: 'powerpoint-to-pdf', title: 'PowerPoint to PDF', description: 'Convert PowerPoint file to PDF format', icon: '📽️', category: 'PDF', page: 'tools/powerpoint-to-pdf.html' },
  { id: 'txt-to-pdf', title: 'TXT to PDF', description: 'Convert text file to PDF format', icon: '📄', category: 'PDF', page: 'tools/txt-to-pdf.html' },
  { id: 'pdf-rotate', title: 'Rotate PDF', description: 'Rotate PDF pages 90, 180, or 270 degrees', icon: '🔄', category: 'PDF', page: 'tools/pdf-rotate.html' },
  { id: 'pdf-delete-pages', title: 'Delete PDF Pages', description: 'Remove specific pages from PDF', icon: '🗑️', category: 'PDF', page: 'tools/pdf-delete-pages.html' },
  { id: 'pdf-extract-text', title: 'Extract Text from PDF', description: 'Extract text content from PDF file', icon: '📝', category: 'PDF', page: 'tools/pdf-extract-text.html' },
  { id: 'pdf-page-count', title: 'PDF Page Counter', description: 'Count pages in PDF', icon: '📄', category: 'PDF', page: 'tools/pdf-page-count.html' },
  { id: 'pdf-merge-images', title: 'PDF from Images', description: 'Create PDF from multiple images', icon: '🖼️', category: 'PDF', page: 'tools/pdf-merge-images.html' },
  { id: 'epub-to-pdf', title: 'EPUB to PDF', description: 'Convert EPUB ebook files to PDF format', icon: '📚', category: 'PDF', page: 'tools/epub-to-pdf.html' },
  { id: 'document-converter', title: 'Document Converter', description: 'Convert between various document formats', icon: '📄', category: 'PDF', page: 'tools/document-converter.html' },
  
  // Image Tools
  { id: 'image-resize', title: 'Resize Image', description: 'Resize image dimensions', icon: '📏', category: 'Image', page: 'tools/image-resize.html' },
  { id: 'image-compress', title: 'Compress Image', description: 'Reduce image file size', icon: '🗜️', category: 'Image', page: 'tools/image-compress.html' },
  { id: 'jpg-png-convert', title: 'JPG ↔ PNG', description: 'Convert between JPG and PNG formats', icon: '🔄', category: 'Image', page: 'tools/jpg-png-convert.html' },
  { id: 'webp-convert', title: 'WEBP Converter', description: 'Convert WEBP to JPG/PNG or JPG/PNG to WEBP', icon: '🖼️', category: 'Image', page: 'tools/webp-convert.html' },
  { id: 'image-to-base64', title: 'Image to Base64', description: 'Convert image to Base64', icon: '🖼️', category: 'Image', page: 'tools/image-to-base64.html' },
  { id: 'base64-to-image', title: 'Base64 to Image', description: 'Convert Base64 to image', icon: '🖼️', category: 'Image', page: 'tools/base64-to-image.html' },
  { id: 'image-grayscale', title: 'Image Grayscale', description: 'Convert image to grayscale', icon: '⚫', category: 'Image', page: 'tools/image-grayscale.html' },
  { id: 'image-invert', title: 'Image Invert', description: 'Invert image colors', icon: '🔄', category: 'Image', page: 'tools/image-invert.html' },
  { id: 'image-sepia', title: 'Image Sepia', description: 'Apply sepia filter to image', icon: '📸', category: 'Image', page: 'tools/image-sepia.html' },
  { id: 'heic-to-jpg', title: 'HEIC to JPG', description: 'Convert HEIC images to JPG format', icon: '🖼️', category: 'Image', page: 'tools/heic-to-jpg.html' },
  { id: 'image-to-pdf', title: 'Image to PDF', description: 'Convert images to PDF format', icon: '📄', category: 'Image', page: 'tools/image-to-pdf.html' },
  
  // Media Tools
  { id: 'mp4-to-mp3', title: 'MP4 to MP3', description: 'Extract audio from video file', icon: '🎵', category: 'Media', page: 'tools/mp4-to-mp3.html' },
  { id: 'video-converter', title: 'Video Converter', description: 'Convert video files between different formats', icon: '🎬', category: 'Media', page: 'tools/video-converter.html' },
  { id: 'mp4-converter', title: 'MP4 Converter', description: 'Convert any video to MP4 format', icon: '🎥', category: 'Media', page: 'tools/mp4-converter.html' },
  { id: 'video-to-gif', title: 'Video to GIF', description: 'Convert video files to animated GIF format', icon: '🎞️', category: 'Media', page: 'tools/video-to-gif.html' },
  { id: 'mov-to-mp4', title: 'MOV to MP4', description: 'Convert MOV video files to MP4 format', icon: '🎬', category: 'Media', page: 'tools/mov-to-mp4.html' },
  { id: 'video-to-mp3', title: 'Video to MP3', description: 'Extract audio from video files and convert to MP3', icon: '🎵', category: 'Media', page: 'tools/video-to-mp3.html' },
  { id: 'audio-converter', title: 'Audio Converter', description: 'Convert audio files between different formats', icon: '🎵', category: 'Media', page: 'tools/audio-converter.html' },
  { id: 'mp3-converter', title: 'MP3 Converter', description: 'Convert any audio file to MP3 format', icon: '🎶', category: 'Media', page: 'tools/mp3-converter.html' },
  
  // Text Tools
  { id: 'text-case', title: 'Text Case Converter', description: 'Convert text case: uppercase, lowercase, title case', icon: '🔤', category: 'Text', page: 'tools/text-case.html' },
  { id: 'text-counter', title: 'Character Counter', description: 'Count words, characters, and paragraphs', icon: '🔢', category: 'Text', page: 'tools/text-counter.html' },
  { id: 'base64-encode', title: 'Base64 Encode', description: 'Encode text to Base64 format', icon: '🔐', category: 'Text', page: 'tools/base64-encode.html' },
  { id: 'base64-decode', title: 'Base64 Decode', description: 'Decode Base64 to text', icon: '🔓', category: 'Text', page: 'tools/base64-decode.html' },
  { id: 'url-encode', title: 'URL Encode', description: 'Encode text for URL', icon: '🔗', category: 'Text', page: 'tools/url-encode.html' },
  { id: 'url-decode', title: 'URL Decode', description: 'Decode URL encoded text', icon: '🔗', category: 'Text', page: 'tools/url-decode.html' },
  { id: 'lorem-generator', title: 'Lorem Ipsum Generator', description: 'Generate placeholder text', icon: '📝', category: 'Text', page: 'tools/lorem-generator.html' },
  { id: 'remove-duplicates', title: 'Remove Duplicate Lines', description: 'Remove duplicate lines from text', icon: '🧹', category: 'Text', page: 'tools/remove-duplicates.html' },
  { id: 'text-sorter', title: 'Text Sorter', description: 'Sort text lines alphabetically', icon: '🔤', category: 'Text', page: 'tools/text-sorter.html' },
  { id: 'text-diff', title: 'Text Diff', description: 'Compare two texts and find differences', icon: '🔍', category: 'Text', page: 'tools/text-diff.html' },
  { id: 'markdown-to-html', title: 'Markdown to HTML', description: 'Convert Markdown text to HTML', icon: '📝', category: 'Text', page: 'tools/markdown-to-html.html' },
  { id: 'html-escape', title: 'HTML Escape', description: 'Escape HTML special characters', icon: '🔐', category: 'Text', page: 'tools/html-escape.html' },
  { id: 'html-unescape', title: 'HTML Unescape', description: 'Unescape HTML entities', icon: '🔓', category: 'Text', page: 'tools/html-unescape.html' },
  { id: 'reverse-text', title: 'Reverse Text', description: 'Reverse text characters', icon: '🔄', category: 'Text', page: 'tools/reverse-text.html' },
  { id: 'text-replace', title: 'Text Replace', description: 'Find and replace text', icon: '🔍', category: 'Text', page: 'tools/text-replace.html' },
  { id: 'word-count', title: 'Word Count', description: 'Count words in text', icon: '📊', category: 'Text', page: 'tools/word-count.html' },
  { id: 'text-to-binary', title: 'Text to Binary', description: 'Convert text to binary', icon: '💻', category: 'Text', page: 'tools/text-to-binary.html' },
  { id: 'binary-to-text', title: 'Binary to Text', description: 'Convert binary to text', icon: '💻', category: 'Text', page: 'tools/binary-to-text.html' },
  { id: 'text-to-morse', title: 'Text to Morse Code', description: 'Convert text to Morse code', icon: '📡', category: 'Text', page: 'tools/text-to-morse.html' },
  { id: 'morse-to-text', title: 'Morse Code to Text', description: 'Convert Morse code to text', icon: '📡', category: 'Text', page: 'tools/morse-to-text.html' },
  { id: 'slug-generator', title: 'Slug Generator', description: 'Generate URL-friendly slugs', icon: '🔗', category: 'Text', page: 'tools/slug-generator.html' },
  { id: 'camel-case', title: 'Camel Case Converter', description: 'Convert text to camelCase', icon: '🐫', category: 'Text', page: 'tools/camel-case.html' },
  { id: 'snake-case', title: 'Snake Case Converter', description: 'Convert text to snake_case', icon: '🐍', category: 'Text', page: 'tools/snake-case.html' },
  { id: 'kebab-case', title: 'Kebab Case Converter', description: 'Convert text to kebab-case', icon: '🍢', category: 'Text', page: 'tools/kebab-case.html' },
  { id: 'pascal-case', title: 'Pascal Case Converter', description: 'Convert text to PascalCase', icon: '🔤', category: 'Text', page: 'tools/pascal-case.html' },
  { id: 'extract-emails', title: 'Extract Emails', description: 'Extract email addresses from text', icon: '📧', category: 'Text', page: 'tools/extract-emails.html' },
  { id: 'extract-urls', title: 'Extract URLs', description: 'Extract URLs from text', icon: '🔗', category: 'Text', page: 'tools/extract-urls.html' },
  { id: 'add-line-numbers', title: 'Add Line Numbers', description: 'Add line numbers to text', icon: '🔢', category: 'Text', page: 'tools/add-line-numbers.html' },
  { id: 'text-reverse-lines', title: 'Reverse Lines', description: 'Reverse order of text lines', icon: '🔄', category: 'Text', page: 'tools/text-reverse-lines.html' },
  { id: 'markdown-editor', title: 'Markdown Editor', description: 'Live Markdown editor with preview', icon: '✏️', category: 'Text', page: 'tools/markdown-editor.html' },
  
  // Developer Tools
  { id: 'json-formatter', title: 'JSON Formatter & Validator', description: 'Format, validate and beautify JSON code', icon: '📋', category: 'Developer', page: 'tools/json-formatter.html' },
  { id: 'json-validator', title: 'JSON Validator', description: 'Validate JSON syntax and format JSON code beautifully', icon: '📋', category: 'Developer', page: 'tools/json-validator.html' },
  { id: 'xml-validator', title: 'XML Validator', description: 'Validate XML syntax and format XML code', icon: '📄', category: 'Developer', page: 'tools/xml-validator.html' },
  { id: 'yaml-validator', title: 'YAML Validator', description: 'Validate YAML syntax and format YAML code', icon: '📝', category: 'Developer', page: 'tools/yaml-validator.html' },
  { id: 'git-command-generator', title: 'Git Command Generator', description: 'Generate Git commands for common operations and workflows', icon: '🔀', category: 'Developer', page: 'tools/git-command-generator.html' },
  { id: 'code-beautifier', title: 'Code Beautifier', description: 'Beautify and format code in HTML, CSS, JavaScript, and more', icon: '✨', category: 'Developer', page: 'tools/code-beautifier.html' },
  { id: 'css-minifier', title: 'CSS Minifier', description: 'Minify CSS code to reduce file size and improve load times', icon: '🗜️', category: 'Developer', page: 'tools/css-minifier.html' },
  { id: 'html-minifier', title: 'HTML Minifier', description: 'Minify HTML code to reduce file size and improve load times', icon: '🗜️', category: 'Developer', page: 'tools/html-minifier.html' },
  { id: 'javascript-minifier', title: 'JavaScript Minifier', description: 'Minify JavaScript code to reduce file size and improve load times', icon: '🗜️', category: 'Developer', page: 'tools/javascript-minifier.html' },
  { id: 'code-minifier', title: 'Code Minifier', description: 'Minify code in HTML, CSS, JavaScript, and more', icon: '🗜️', category: 'Developer', page: 'tools/code-minifier.html' },
  { id: 'advanced-password-generator', title: 'Advanced Password Generator', description: 'Generate secure passwords with customizable length, character sets, and options', icon: '🔐', category: 'Developer', page: 'tools/advanced-password-generator.html' },
  { id: 'color-contrast-checker', title: 'Color Contrast Checker', description: 'Check color contrast ratio for WCAG accessibility compliance', icon: '🎨', category: 'Developer', page: 'tools/color-contrast-checker.html' },
  { id: 'jwt-decoder', title: 'JWT Decoder', description: 'Decode and view JWT tokens', icon: '🔐', category: 'Developer', page: 'tools/jwt-decoder.html' },
  { id: 'uuid-generator', title: 'UUID Generator', description: 'Generate UUIDs', icon: '🆔', category: 'Developer', page: 'tools/uuid-generator.html' },
  { id: 'hash-generator', title: 'Hash Generator', description: 'Generate SHA1, SHA256, SHA512 hashes', icon: '🔐', category: 'Developer', page: 'tools/hash-generator.html' },
  { id: 'regex-tester', title: 'Regex Tester', description: 'Test regular expressions', icon: '🔍', category: 'Developer', page: 'tools/regex-tester.html' },
  { id: 'color-picker', title: 'Color Picker', description: 'Pick colors and convert Hex/RGB', icon: '🎨', category: 'Developer', page: 'tools/color-picker.html' },
  { id: 'timestamp-converter', title: 'Timestamp Converter', description: 'Convert Unix timestamp to date and vice versa', icon: '⏰', category: 'Developer', page: 'tools/timestamp-converter.html' },
  { id: 'json-minify', title: 'JSON Minify', description: 'Minify JSON code', icon: '📋', category: 'Developer', page: 'tools/json-minify.html' },
  { id: 'css-formatter', title: 'CSS Formatter', description: 'Format and beautify CSS code', icon: '🎨', category: 'Developer', page: 'tools/css-formatter.html' },
  { id: 'css-minify', title: 'CSS Minify', description: 'Minify CSS code', icon: '🗜️', category: 'Developer', page: 'tools/css-minify.html' },
  { id: 'html-formatter', title: 'HTML Formatter', description: 'Format and beautify HTML code', icon: '🌐', category: 'Developer', page: 'tools/html-formatter.html' },
  { id: 'html-minify', title: 'HTML Minify', description: 'Minify HTML code', icon: '🗜️', category: 'Developer', page: 'tools/html-minify.html' },
  { id: 'javascript-formatter', title: 'JavaScript Formatter', description: 'Format and beautify JavaScript code', icon: '📜', category: 'Developer', page: 'tools/javascript-formatter.html' },
  { id: 'sql-formatter', title: 'SQL Formatter', description: 'Format SQL queries', icon: '🗄️', category: 'Developer', page: 'tools/sql-formatter.html' },
  { id: 'xml-formatter', title: 'XML Formatter', description: 'Format XML code', icon: '📄', category: 'Developer', page: 'tools/xml-formatter.html' },
  { id: 'yaml-formatter', title: 'YAML Formatter', description: 'Format YAML code', icon: '📝', category: 'Developer', page: 'tools/yaml-formatter.html' },
  { id: 'url-parser', title: 'URL Parser', description: 'Parse and analyze URLs', icon: '🔗', category: 'Developer', page: 'tools/url-parser.html' },
  { id: 'password-strength', title: 'Password Strength Checker', description: 'Check password strength', icon: '🔐', category: 'Developer', page: 'tools/password-strength.html' },
  { id: 'jwt-encoder', title: 'JWT Encoder', description: 'Encode JWT tokens', icon: '🔐', category: 'Developer', page: 'tools/jwt-encoder.html' },
  { id: 'hmac-generator', title: 'HMAC Generator', description: 'Generate HMAC signatures', icon: '🔐', category: 'Developer', page: 'tools/hmac-generator.html' },
  { id: 'cron-expression', title: 'Cron Expression Generator', description: 'Generate cron expressions', icon: '⏰', category: 'Developer', page: 'tools/cron-expression.html' },
  { id: 'json-to-csv', title: 'JSON to CSV', description: 'Convert JSON to CSV', icon: '📊', category: 'Developer', page: 'tools/json-to-csv.html' },
  { id: 'csv-to-json', title: 'CSV to JSON', description: 'Convert CSV to JSON', icon: '📋', category: 'Developer', page: 'tools/csv-to-json.html' },
  { id: 'json-to-xml', title: 'JSON to XML', description: 'Convert JSON to XML', icon: '📄', category: 'Developer', page: 'tools/json-to-xml.html' },
  { id: 'xml-to-json', title: 'XML to JSON', description: 'Convert XML to JSON', icon: '📋', category: 'Developer', page: 'tools/xml-to-json.html' },
  { id: 'json-to-yaml', title: 'JSON to YAML', description: 'Convert JSON to YAML', icon: '📝', category: 'Developer', page: 'tools/json-to-yaml.html' },
  { id: 'yaml-to-json', title: 'YAML to JSON', description: 'Convert YAML to JSON', icon: '📋', category: 'Developer', page: 'tools/yaml-to-json.html' },
  { id: 'meta-tag-generator', title: 'Meta Tag Generator', description: 'Generate HTML meta tags', icon: '🏷️', category: 'Developer', page: 'tools/meta-tag-generator.html' },
  { id: 'open-graph-generator', title: 'Open Graph Generator', description: 'Generate Open Graph meta tags', icon: '📱', category: 'Developer', page: 'tools/open-graph-generator.html' },
  { id: 'twitter-card-generator', title: 'Twitter Card Generator', description: 'Generate Twitter Card meta tags', icon: '🐦', category: 'Developer', page: 'tools/twitter-card-generator.html' },
  { id: 'favicon-generator', title: 'Favicon Generator', description: 'Generate favicons from images', icon: '⭐', category: 'Developer', page: 'tools/favicon-generator.html' },
  { id: 'contrast-checker', title: 'Contrast Checker', description: 'Check color contrast ratio', icon: '🎨', category: 'Developer', page: 'tools/contrast-checker.html' },
  { id: 'color-palette-generator', title: 'Color Palette Generator', description: 'Generate beautiful color palettes for design projects', icon: '🎨', category: 'Developer', page: 'tools/color-palette-generator.html' },
  { id: 'css-gradient-generator', title: 'CSS Gradient Generator', description: 'Generate CSS gradients with live preview', icon: '🌈', category: 'Developer', page: 'tools/css-gradient-generator.html' },
  { id: 'api-tester', title: 'REST API Tester', description: 'Test REST API endpoints with GET, POST, PUT, DELETE', icon: '🔌', category: 'Developer', page: 'tools/api-tester.html' },
  { id: 'ip-address-lookup', title: 'IP Address Lookup', description: 'Lookup IP address information, location, and ISP details', icon: '🌐', category: 'Developer', page: 'tools/ip-address-lookup.html' },
  { id: 'user-agent-parser', title: 'User Agent Parser', description: 'Parse and analyze user agent strings', icon: '🔍', category: 'Developer', page: 'tools/user-agent-parser.html' },
  { id: 'http-status-checker', title: 'HTTP Status Checker', description: 'Check HTTP status codes and response headers', icon: '🔌', category: 'Developer', page: 'tools/http-status-checker.html' },
  { id: 'dns-lookup', title: 'DNS Lookup', description: 'Query DNS records (A, AAAA, MX, CNAME, TXT) for any domain', icon: '🌐', category: 'Developer', page: 'tools/dns-lookup.html' },
  { id: 'port-checker', title: 'Port Checker', description: 'Check if a port is open or closed on a remote server', icon: '🔌', category: 'Developer', page: 'tools/port-checker.html' },
  
  // GIS Tools
  { id: 'coordinate-converter', title: 'Coordinate Converter', description: 'Convert GPS coordinates between WGS84, UTM, MGRS formats', icon: '🗺️', category: 'GIS', page: 'tools/coordinate-converter.html' },
  { id: 'distance-calculator', title: 'Distance Calculator', description: 'Calculate distance between GPS coordinates using Haversine formula', icon: '📏', category: 'GIS', page: 'tools/distance-calculator.html' },
  { id: 'area-calculator', title: 'Area Calculator', description: 'Calculate area of polygons from GPS coordinates', icon: '📐', category: 'GIS', page: 'tools/area-calculator.html' },
  { id: 'bearing-calculator', title: 'Bearing Calculator', description: 'Calculate bearing (azimuth) between two GPS coordinates', icon: '🧭', category: 'GIS', page: 'tools/bearing-calculator.html' },
  { id: 'geocoding-tool', title: 'Geocoding Tool', description: 'Convert addresses to GPS coordinates (latitude and longitude)', icon: '📍', category: 'GIS', page: 'tools/geocoding-tool.html' },
  { id: 'reverse-geocoding', title: 'Reverse Geocoding', description: 'Convert GPS coordinates to human-readable addresses', icon: '📍', category: 'GIS', page: 'tools/reverse-geocoding.html' },
  { id: 'elevation-calculator', title: 'Elevation Calculator', description: 'Calculate elevation difference and gradient between GPS coordinates', icon: '⛰️', category: 'GIS', page: 'tools/elevation-calculator.html' },
  { id: 'route-distance-calculator', title: 'Route Distance Calculator', description: 'Calculate total distance along a route with multiple GPS waypoints', icon: '🛣️', category: 'GIS', page: 'tools/route-distance-calculator.html' },
  { id: 'map-projection-converter', title: 'Map Projection Converter', description: 'Convert coordinates between different map projection systems', icon: '🗺️', category: 'GIS', page: 'tools/map-projection-converter.html' },
  
  // Engineering Tools
  { id: 'engineering-unit-converter', title: 'Engineering Unit Converter', description: 'Convert engineering units: pressure, force, torque, power', icon: '⚙️', category: 'Engineering', page: 'tools/engineering-unit-converter.html' },
  { id: 'concrete-calculator', title: 'Concrete Calculator', description: 'Calculate concrete volume, mix ratios, and material requirements', icon: '🏗️', category: 'Engineering', page: 'tools/concrete-calculator.html' },
  { id: 'electrical-calculator', title: 'Electrical Calculator', description: 'Calculate electrical values using Ohm\'s law and power formulas', icon: '⚡', category: 'Engineering', page: 'tools/electrical-calculator.html' },
  { id: 'rebar-calculator', title: 'Rebar Calculator', description: 'Calculate rebar weight, length, and quantity for construction', icon: '🏗️', category: 'Engineering', page: 'tools/rebar-calculator.html' },
  { id: 'beam-calculator', title: 'Beam Calculator', description: 'Calculate beam bending moment, deflection, and stress', icon: '📐', category: 'Engineering', page: 'tools/beam-calculator.html' },
  { id: 'wire-size-calculator', title: 'Wire Size Calculator', description: 'Calculate appropriate wire size for electrical circuits', icon: '⚡', category: 'Engineering', page: 'tools/wire-size-calculator.html' },
  { id: 'voltage-drop-calculator', title: 'Voltage Drop Calculator', description: 'Calculate voltage drop in electrical circuits', icon: '⚡', category: 'Engineering', page: 'tools/voltage-drop-calculator.html' },
  { id: 'power-factor-calculator', title: 'Power Factor Calculator', description: 'Calculate power factor from real power and apparent power', icon: '⚡', category: 'Engineering', page: 'tools/power-factor-calculator.html' },
  { id: 'led-resistor-calculator', title: 'LED Resistor Calculator', description: 'Calculate the appropriate resistor value for LED circuits', icon: '💡', category: 'Engineering', page: 'tools/led-resistor-calculator.html' },
  { id: 'battery-life-calculator', title: 'Battery Life Calculator', description: 'Calculate how long a battery will last based on capacity and current draw', icon: '🔋', category: 'Engineering', page: 'tools/battery-life-calculator.html' },
  { id: 'steel-weight-calculator', title: 'Steel Weight Calculator', description: 'Calculate weight of steel bars, plates, and beams', icon: '🏗️', category: 'Engineering', page: 'tools/steel-weight-calculator.html' },
  { id: 'circuit-calculator', title: 'Circuit Calculator', description: 'Calculate resistance, current, and voltage in series and parallel circuits', icon: '⚡', category: 'Engineering', page: 'tools/circuit-calculator.html' },
  { id: 'torque-calculator', title: 'Torque Calculator', description: 'Calculate torque from force and distance', icon: '⚙️', category: 'Engineering', page: 'tools/torque-calculator.html' },
  { id: 'pump-calculator', title: 'Pump Calculator', description: 'Calculate pump flow rate, head, and power requirements', icon: '🔧', category: 'Engineering', page: 'tools/pump-calculator.html' },
  { id: 'gear-ratio-calculator', title: 'Gear Ratio Calculator', description: 'Calculate gear ratios, output speed, and torque', icon: '⚙️', category: 'Engineering', page: 'tools/gear-ratio-calculator.html' },
  { id: 'belt-length-calculator', title: 'Belt Length Calculator', description: 'Calculate the required belt length for two pulleys', icon: '🔧', category: 'Engineering', page: 'tools/belt-length-calculator.html' },
  { id: 'spring-calculator', title: 'Spring Calculator', description: 'Calculate spring force, deflection, and spring constant', icon: '🪀', category: 'Engineering', page: 'tools/spring-calculator.html' },
  { id: 'heat-transfer-calculator', title: 'Heat Transfer Calculator', description: 'Calculate heat transfer, thermal conductivity, and heat flux', icon: '🔥', category: 'Engineering', page: 'tools/heat-transfer-calculator.html' },
  { id: 'vibration-calculator', title: 'Vibration Calculator', description: 'Calculate vibration frequency, amplitude, and velocity', icon: '📳', category: 'Engineering', page: 'tools/vibration-calculator.html' },
  { id: 'chain-length-calculator', title: 'Chain Length Calculator', description: 'Calculate the required chain length for two sprockets', icon: '⛓️', category: 'Engineering', page: 'tools/chain-length-calculator.html' },
  { id: 'thread-calculator', title: 'Thread Calculator', description: 'Calculate thread dimensions, pitch, and tolerances', icon: '🔩', category: 'Engineering', page: 'tools/thread-calculator.html' },
  { id: 'bearing-life-calculator', title: 'Bearing Life Calculator', description: 'Calculate bearing life (L10) in hours based on load and speed', icon: '🔧', category: 'Engineering', page: 'tools/bearing-life-calculator.html' },
  { id: 'transformer-calculator', title: 'Transformer Calculator', description: 'Calculate transformer turns ratio, voltage, and current transformation', icon: '⚡', category: 'Engineering', page: 'tools/transformer-calculator.html' },
  { id: 'motor-current-calculator', title: 'Motor Current Calculator', description: 'Calculate motor current from power, voltage, and efficiency', icon: '⚡', category: 'Engineering', page: 'tools/motor-current-calculator.html' },
  { id: 'floor-area-calculator', title: 'Floor Area Calculator', description: 'Calculate floor area for rectangular, circular, and irregular shapes', icon: '🏗️', category: 'Engineering', page: 'tools/floor-area-calculator.html' },
  { id: 'roof-pitch-calculator', title: 'Roof Pitch Calculator', description: 'Calculate roof pitch, angle, and slope from rise and run', icon: '🏠', category: 'Engineering', page: 'tools/roof-pitch-calculator.html' },
  { id: 'stair-calculator', title: 'Stair Calculator', description: 'Calculate stair dimensions, rise, run, and number of steps', icon: '🪜', category: 'Engineering', page: 'tools/stair-calculator.html' },
  { id: 'material-strength-calculator', title: 'Material Strength Calculator', description: 'Calculate stress, strain, and material strength properties', icon: '⚙️', category: 'Engineering', page: 'tools/material-strength-calculator.html' },
  { id: 'efficiency-calculator', title: 'Efficiency Calculator', description: 'Calculate efficiency percentage from input and output values', icon: '⚡', category: 'Engineering', page: 'tools/efficiency-calculator.html' },
  { id: 'stress-strain-calculator', title: 'Stress Strain Calculator', description: 'Calculate stress, strain, and Young\'s modulus', icon: '📐', category: 'Engineering', page: 'tools/stress-strain-calculator.html' },
  { id: 'foundation-calculator', title: 'Foundation Calculator', description: 'Calculate foundation dimensions, volume, and material requirements', icon: '🏗️', category: 'Engineering', page: 'tools/foundation-calculator.html' },
  { id: 'material-cost-estimator', title: 'Material Cost Estimator', description: 'Estimate costs for construction materials', icon: '💰', category: 'Engineering', page: 'tools/material-cost-estimator.html' },
  { id: 'pipe-flow-calculator', title: 'Pipe Flow Calculator', description: 'Calculate flow rate, velocity, and pressure drop in pipes', icon: '🔧', category: 'Engineering', page: 'tools/pipe-flow-calculator.html' },
  { id: 'molar-mass-calculator', title: 'Molar Mass Calculator', description: 'Calculate the molar mass of chemical compounds', icon: '🧪', category: 'Engineering', page: 'tools/molar-mass-calculator.html' },
  { id: 'solution-calculator', title: 'Solution Calculator', description: 'Calculate solution concentrations, molarity, and dilution ratios', icon: '🧪', category: 'Engineering', page: 'tools/solution-calculator.html' },
  { id: 'ph-calculator', title: 'pH Calculator', description: 'Calculate pH from hydrogen ion concentration (H+)', icon: '🧪', category: 'Engineering', page: 'tools/ph-calculator.html' },
  { id: 'gas-law-calculator', title: 'Gas Law Calculator', description: 'Calculate pressure, volume, temperature using ideal gas law (PV = nRT)', icon: '🧪', category: 'Engineering', page: 'tools/gas-law-calculator.html' },
  { id: 'concentration-calculator', title: 'Concentration Calculator', description: 'Calculate solution concentrations, ppm, ppb, and dilution factors', icon: '🧪', category: 'Engineering', page: 'tools/concentration-calculator.html' },
  { id: 'stoichiometry-calculator', title: 'Stoichiometry Calculator', description: 'Calculate reactant and product quantities in chemical reactions', icon: '🧪', category: 'Engineering', page: 'tools/stoichiometry-calculator.html' },
  { id: 'chemical-equation-balancer', title: 'Chemical Equation Balancer', description: 'Balance chemical equations and calculate coefficients', icon: '⚗️', category: 'Engineering', page: 'tools/chemical-equation-balancer.html' },
  
  // QR Code Tools
  { id: 'qr-generator', title: 'QR Code Generator', description: 'Generate QR codes for text or URL', icon: '📱', category: 'QR Code', page: 'tools/qr-generator.html' },
  { id: 'qr-code-reader', title: 'QR Code Reader', description: 'Decode QR codes from uploaded images', icon: '📱', category: 'QR Code', page: 'tools/qr-code-reader.html' },
  
  // Other Tools
  { id: 'password-generator', title: 'Password Generator', description: 'Generate secure passwords', icon: '🔑', category: 'Other', page: 'tools/password-generator.html' },
  { id: 'date-converter', title: 'Date Converter', description: 'Convert date formats', icon: '📅', category: 'Other', page: 'tools/date-converter.html' },
  { id: 'random-number', title: 'Random Number Generator', description: 'Generate random numbers', icon: '🎲', category: 'Other', page: 'tools/random-number.html' },
  { id: 'number-base-converter', title: 'Number Base Converter', description: 'Convert between number bases', icon: '🔢', category: 'Other', page: 'tools/number-base-converter.html' },
  { id: 'percentage-calculator', title: 'Percentage Calculator', description: 'Calculate percentages', icon: '📊', category: 'Other', page: 'tools/percentage-calculator.html' },
  { id: 'tip-calculator', title: 'Tip Calculator', description: 'Calculate tips', icon: '💰', category: 'Other', page: 'tools/tip-calculator.html' },
  { id: 'age-calculator', title: 'Age Calculator', description: 'Calculate age from birthdate', icon: '🎂', category: 'Other', page: 'tools/age-calculator.html' },
  { id: 'bmi-calculator', title: 'BMI Calculator', description: 'Calculate Body Mass Index', icon: '⚖️', category: 'Other', page: 'tools/bmi-calculator.html' },
  { id: 'timezone-converter', title: 'Timezone Converter', description: 'Convert between timezones', icon: '🌐', category: 'Other', page: 'tools/timezone-converter.html' },
  { id: 'stopwatch', title: 'Stopwatch', description: 'Digital stopwatch timer', icon: '⏱️', category: 'Other', page: 'tools/stopwatch.html' },
  { id: 'countdown-timer', title: 'Countdown Timer', description: 'Countdown timer', icon: '⏲️', category: 'Other', page: 'tools/countdown-timer.html' },
  { id: 'rar-to-zip', title: 'RAR to ZIP', description: 'Convert RAR archive files to ZIP format', icon: '📦', category: 'Other', page: 'tools/rar-to-zip.html' },
  { id: 'pst-to-est', title: 'PST to EST', description: 'Convert Pacific Standard Time to Eastern Standard Time', icon: '🕐', category: 'Other', page: 'tools/pst-to-est.html' },
  { id: 'cst-to-est', title: 'CST to EST', description: 'Convert Central Standard Time to Eastern Standard Time', icon: '🕐', category: 'Other', page: 'tools/cst-to-est.html' },
  { id: 'archive-converter', title: 'Archive Converter', description: 'Convert between archive formats', icon: '📦', category: 'Other', page: 'tools/archive-converter.html' },
  { id: 'lbs-to-kg', title: 'Lbs to Kg', description: 'Convert pounds to kilograms', icon: '⚖️', category: 'Other', page: 'tools/lbs-to-kg.html' },
  { id: 'kg-to-lbs', title: 'Kg to Lbs', description: 'Convert kilograms to pounds', icon: '⚖️', category: 'Other', page: 'tools/kg-to-lbs.html' },
  { id: 'feet-to-meters', title: 'Feet to Meters', description: 'Convert feet to meters', icon: '📏', category: 'Other', page: 'tools/feet-to-meters.html' },
  { id: 'unit-converter', title: 'Unit Converter', description: 'Convert between various units', icon: '🔄', category: 'Other', page: 'tools/unit-converter.html' },
  { id: 'currency-converter', title: 'Currency Converter', description: 'Convert between different currencies with real-time exchange rates', icon: '💱', category: 'Other', page: 'tools/currency-converter.html' },
  { id: 'gis-converter', title: 'GIS/CAD Converter', description: 'Convert GIS and CAD formats', icon: '🗺️', category: 'Other', page: 'tools/gis-converter.html' },
  { id: 'epub-to-mobi', title: 'EPUB to MOBI', description: 'Convert EPUB ebook files to MOBI format for Kindle', icon: '📖', category: 'Other', page: 'tools/epub-to-mobi.html' },
  { id: 'salary-calculator', title: 'Salary Calculator', description: 'Calculate weekly, monthly, and yearly salary from hourly rate', icon: '💰', category: 'Other', page: 'tools/salary-calculator.html' },
  { id: 'length-converter', title: 'Length Converter', description: 'Convert between length units', icon: '📏', category: 'Other', page: 'tools/length-converter.html' },
  { id: 'temperature-converter', title: 'Temperature Converter', description: 'Convert between Celsius, Fahrenheit, and Kelvin', icon: '🌡️', category: 'Other', page: 'tools/temperature-converter.html' },
  { id: 'barcode-generator', title: 'Barcode Generator', description: 'Generate barcodes (EAN-13, Code 128) for products and labels', icon: '📊', category: 'Other', page: 'tools/barcode-generator.html' },
  { id: 'invoice-generator', title: 'Invoice Generator', description: 'Generate professional invoices for businesses and freelancers', icon: '🧾', category: 'Other', page: 'tools/invoice-generator.html' },
  { id: 'credit-card-validator', title: 'Credit Card Validator', description: 'Validate credit card numbers and identify card type', icon: '💳', category: 'Other', page: 'tools/credit-card-validator.html' },
  { id: 'iban-validator', title: 'IBAN Validator', description: 'Validate International Bank Account Numbers (IBAN)', icon: '🏦', category: 'Other', page: 'tools/iban-validator.html' },
  { id: 'isbn-validator', title: 'ISBN Validator', description: 'Validate International Standard Book Numbers (ISBN)', icon: '📚', category: 'Other', page: 'tools/isbn-validator.html' },
  { id: 'receipt-generator', title: 'Receipt Generator', description: 'Create professional receipts quickly and easily', icon: '🧾', category: 'Other', page: 'tools/receipt-generator.html' },
  { id: 'certificate-generator', title: 'Certificate Generator', description: 'Create professional certificates for awards, achievements, and completion', icon: '🏆', category: 'Other', page: 'tools/certificate-generator.html' },
  { id: 'business-card-generator', title: 'Business Card Generator', description: 'Create professional business cards quickly and easily', icon: '💼', category: 'Other', page: 'tools/business-card-generator.html' },
  { id: 'label-generator', title: 'Label Generator', description: 'Create professional labels for products, packages, and shipping', icon: '🏷️', category: 'Other', page: 'tools/label-generator.html' },
  { id: 'coupon-generator', title: 'Coupon Generator', description: 'Create professional discount coupons and promotional codes', icon: '🎫', category: 'Other', page: 'tools/coupon-generator.html' },
  { id: 'voucher-generator', title: 'Voucher Generator', description: 'Create professional gift vouchers and certificates', icon: '🎁', category: 'Other', page: 'tools/voucher-generator.html' },
  { id: 'ean-barcode-validator', title: 'EAN Barcode Validator', description: 'Validate EAN-13 and EAN-8 barcode numbers using check digit algorithm', icon: '📊', category: 'Other', page: 'tools/ean-barcode-validator.html' },
  { id: 'id-card-generator', title: 'ID Card Generator', description: 'Create professional ID cards quickly and easily', icon: '🪪', category: 'Other', page: 'tools/id-card-generator.html' },
  // Student Tools
  { id: 'quadratic-equation-solver', title: 'Quadratic Equation Solver', description: 'Solve quadratic equations step by step with detailed solutions', icon: '📐', category: 'Student', page: 'tools/quadratic-equation-solver.html' },
  { id: 'triangle-calculator', title: 'Triangle Calculator', description: 'Calculate triangle area, perimeter, angles, and sides', icon: '🔺', category: 'Student', page: 'tools/triangle-calculator.html' },
  { id: 'circle-calculator', title: 'Circle Calculator', description: 'Calculate circle area, circumference, diameter, and radius', icon: '⭕', category: 'Student', page: 'tools/circle-calculator.html' },
  { id: 'statistics-calculator', title: 'Statistics Calculator', description: 'Calculate mean, median, mode, standard deviation, and more', icon: '📊', category: 'Student', page: 'tools/statistics-calculator.html' },
  { id: 'fraction-calculator', title: 'Fraction Calculator', description: 'Add, subtract, multiply, and divide fractions with step-by-step solutions', icon: '🔢', category: 'Student', page: 'tools/fraction-calculator.html' },
  { id: 'gpa-calculator', title: 'GPA Calculator', description: 'Calculate your GPA from course grades and credit hours', icon: '🎓', category: 'Student', page: 'tools/gpa-calculator.html' },
  { id: 'compound-interest-calculator', title: 'Compound Interest Calculator', description: 'Calculate compound interest with detailed breakdown and formula', icon: '💰', category: 'Student', page: 'tools/compound-interest-calculator.html' },
  { id: 'word-counter', title: 'Word Counter', description: 'Count words, characters, sentences, paragraphs, and reading time', icon: '📝', category: 'Student', page: 'tools/word-counter.html' },
  { id: 'linear-equation-solver', title: 'Linear Equation Solver', description: 'Solve linear equations (ax + b = c) with step-by-step solutions', icon: '📐', category: 'Student', page: 'tools/linear-equation-solver.html' },
  { id: 'trigonometry-calculator', title: 'Trigonometry Calculator', description: 'Calculate sin, cos, tan, and inverse trigonometric functions', icon: '📐', category: 'Student', page: 'tools/trigonometry-calculator.html' },
  { id: 'logarithm-calculator', title: 'Logarithm Calculator', description: 'Calculate logarithms (log base 10, natural log, custom base) with step-by-step solutions', icon: '📊', category: 'Student', page: 'tools/logarithm-calculator.html' },
  { id: 'rectangle-calculator', title: 'Rectangle Calculator', description: 'Calculate rectangle area, perimeter, and diagonal from length and width', icon: '▭', category: 'Student', page: 'tools/rectangle-calculator.html' },
  { id: 'parallelogram-calculator', title: 'Parallelogram Calculator', description: 'Calculate parallelogram area and perimeter from base, height, and sides', icon: '▱', category: 'Student', page: 'tools/parallelogram-calculator.html' },
  { id: 'trapezoid-calculator', title: 'Trapezoid Calculator', description: 'Calculate trapezoid area and perimeter from bases, height, and sides', icon: '🔷', category: 'Student', page: 'tools/trapezoid-calculator.html' },
  { id: 'simple-interest-calculator', title: 'Simple Interest Calculator', description: 'Calculate simple interest with detailed breakdown and formula explanation', icon: '💰', category: 'Student', page: 'tools/simple-interest-calculator.html' },
  { id: 'loan-calculator', title: 'Loan Calculator', description: 'Calculate monthly loan payments, total interest, and amortization schedule', icon: '💳', category: 'Student', page: 'tools/loan-calculator.html' },
  { id: 'roman-numeral-converter', title: 'Roman Numeral Converter', description: 'Convert between Roman numerals (I, V, X, L, C, D, M) and Arabic numbers', icon: '🔢', category: 'Student', page: 'tools/roman-numeral-converter.html' },
  { id: 'prime-number-checker', title: 'Prime Number Checker', description: 'Check if a number is prime and find its prime factors', icon: '🔢', category: 'Student', page: 'tools/prime-number-checker.html' },
  { id: 'physics-velocity-calculator', title: 'Velocity Calculator', description: 'Calculate velocity, distance, and time using physics formulas', icon: '⚡', category: 'Student', page: 'tools/physics-velocity-calculator.html' },
  { id: 'physics-acceleration-calculator', title: 'Acceleration Calculator', description: 'Calculate acceleration using velocity and time', icon: '⚡', category: 'Student', page: 'tools/physics-acceleration-calculator.html' },
  { id: 'physics-force-calculator', title: 'Force Calculator', description: 'Calculate force using mass and acceleration (F = ma)', icon: '⚡', category: 'Student', page: 'tools/physics-force-calculator.html' },
  { id: 'physics-kinetic-energy', title: 'Kinetic Energy Calculator', description: 'Calculate kinetic energy from mass and velocity (KE = ½mv²)', icon: '⚡', category: 'Student', page: 'tools/physics-kinetic-energy.html' },
  { id: 'physics-potential-energy', title: 'Potential Energy Calculator', description: 'Calculate gravitational potential energy from mass, height, and gravity (PE = mgh)', icon: '⚡', category: 'Student', page: 'tools/physics-potential-energy.html' },
  { id: 'molecular-weight-calculator', title: 'Molecular Weight Calculator', description: 'Calculate molecular weight from chemical formula (e.g., H2O, CO2)', icon: '🧪', category: 'Student', page: 'tools/molecular-weight-calculator.html' },
  { id: 'dilution-calculator', title: 'Dilution Calculator', description: 'Calculate dilution ratios using C1V1 = C2V2 formula', icon: '🧪', category: 'Student', page: 'tools/dilution-calculator.html' },
  { id: 'anagram-generator', title: 'Anagram Generator', description: 'Generate all possible anagrams from a word or phrase', icon: '🔤', category: 'Student', page: 'tools/anagram-generator.html' },
  { id: 'palindrome-checker', title: 'Palindrome Checker', description: 'Check if a word, phrase, or number is a palindrome', icon: '🔤', category: 'Student', page: 'tools/palindrome-checker.html' },
  { id: 'rhyme-finder', title: 'Rhyme Finder', description: 'Find words that rhyme with your input word', icon: '🎵', category: 'Student', page: 'tools/rhyme-finder.html' },
  { id: 'matrix-calculator', title: 'Matrix Calculator', description: 'Perform matrix operations: addition, subtraction, and multiplication', icon: '🔢', category: 'Student', page: 'tools/matrix-calculator.html' },
  { id: 'permutation-combination', title: 'Permutation & Combination', description: 'Calculate permutations (nPr) and combinations (nCr) with formulas', icon: '🔢', category: 'Student', page: 'tools/permutation-combination.html' },
  { id: 'binary-calculator', title: 'Binary Calculator', description: 'Convert between binary, decimal, hexadecimal, and octal number systems', icon: '🔢', category: 'Student', page: 'tools/binary-calculator.html' },
  { id: 'scientific-notation-converter', title: 'Scientific Notation Converter', description: 'Convert numbers to and from scientific notation (e.g., 1.23 × 10⁴)', icon: '🔬', category: 'Student', page: 'tools/scientific-notation-converter.html' },
  { id: 'angle-converter', title: 'Angle Converter', description: 'Convert angles between degrees, radians, and gradians', icon: '📐', category: 'Student', page: 'tools/angle-converter.html' },
  { id: 'time-duration-calculator', title: 'Time Duration Calculator', description: 'Calculate the duration between two dates and times', icon: '⏰', category: 'Student', page: 'tools/time-duration-calculator.html' },
  { id: 'discount-calculator', title: 'Discount Calculator', description: 'Calculate discount amount and final price after discount', icon: '💰', category: 'Student', page: 'tools/discount-calculator.html' }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderTools();
    setupSearch();
    setupCategoryFilter();
});

function renderTools(filteredTools = tools) {
    const grid = document.getElementById('toolsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (filteredTools.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No tools found matching your search.</p>';
        return;
    }
    
    filteredTools.forEach(tool => {
        const card = document.createElement('a');
        card.href = tool.page;
        card.className = 'tool-card';
        card.innerHTML = `
            <span class="tool-icon">${tool.icon}</span>
            <h3 class="tool-title">${tool.title}</h3>
            <p class="tool-description">${tool.description}</p>
            <span class="tool-category">${tool.category}</span>
        `;
        grid.appendChild(card);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = tools.filter(tool => 
            tool.title.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query)
        );
        renderTools(filtered);
        updateCategoryButtons();
    });
}

function setupCategoryFilter() {
    const categories = Array.from(new Set(tools.map(t => t.category))).sort();
    const categoryContainer = document.getElementById('categoryFilter');
    if (!categoryContainer) return;
    
    // Create "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'All';
    allBtn.onclick = () => {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        allBtn.classList.add('active');
        filterByCategory(null);
    };
    categoryContainer.appendChild(allBtn);
    
    // Create category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        btn.onclick = () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByCategory(category);
        };
        categoryContainer.appendChild(btn);
    });
}

function filterByCategory(category) {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    let filtered = tools;
    
    if (category) {
        filtered = filtered.filter(tool => tool.category === category);
    }
    
    if (query) {
        filtered = filtered.filter(tool => 
            tool.title.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query)
        );
    }
    
    renderTools(filtered);
}

function updateCategoryButtons() {
    // This can be used to update category button states based on filtered results
}
