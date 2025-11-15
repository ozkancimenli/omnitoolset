# OmniPDF Editor - Standalone PDF Editor Application

A calm, professional, standalone PDF editor application designed to feel trustworthy and encourage engagement.

## 🎨 Design Philosophy

This editor follows a **calm, minimal, professional** design philosophy:

- **No flashy colors** - Uses soft blues and cool grays
- **Plenty of whitespace** - Breathable layouts
- **Clear typography** - Good hierarchy and readable text
- **Trustworthy appearance** - Professional productivity tool feel
- **Not overwhelming** - Designed to make users want to stay

## 🚀 Running the App

### Local Development

```bash
# Install dependencies (if not already installed)
npm install

# Run development server
npm run dev

# Visit the editor at:
http://localhost:3000/pdf-editor
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 File Structure

```
app/pdf-editor/
├── page.tsx              # Main page (Server Component with metadata)
├── StandaloneClient.tsx  # Client component wrapper
└── README.md            # This file

components/pdf-editor/
├── Navbar.tsx           # Top navigation bar
├── Hero.tsx             # Hero section with CTA
├── PdfEditorStandalone.tsx  # Main PDF editor component
├── PageThumbnail.tsx    # Individual page card component
├── Toolbar.tsx          # Editor toolbar
├── HowItWorksSection.tsx # How-to guide section
└── Footer.tsx           # Footer component

lib/
└── theme.ts             # Theme configuration (colors, spacing, etc.)
```

## 🎨 Theme Customization

To adjust the color palette, edit `lib/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: {
      600: '#2563eb', // Main primary color - change this
    },
    background: {
      primary: '#f9fafb', // Main background - change this
    },
    // ... other colors
  },
};
```

Then update corresponding Tailwind classes in components:
- `bg-blue-600` → your primary color
- `bg-gray-50` → your background color
- etc.

## 🔧 Main Editor Logic

The core PDF editing logic lives in:
- **`components/pdf-editor/PdfEditorStandalone.tsx`**

Key functions:
- `handleFileSelect()` - Loads PDF and creates page data
- `rotatePage()` - Rotates a page left/right
- `deletePage()` - Removes a page
- `handleDragStart/Over/End()` - Handles drag & drop reordering
- `applyChanges()` - Generates and downloads edited PDF

PDF manipulation uses **pdf-lib** library:
- `PDFDocument.load()` - Loads PDF
- `PDFDocument.create()` - Creates new PDF
- `copyPages()` - Copies pages with modifications
- `setRotation()` - Applies rotation
- `save()` - Exports final PDF

## 📱 Features

### Current Features
- ✅ PDF upload (drag & drop or file picker)
- ✅ Page reordering (drag & drop)
- ✅ Page rotation (left/right)
- ✅ Page deletion
- ✅ Download edited PDF
- ✅ Reset changes
- ✅ Responsive design
- ✅ Keyboard accessible
- ✅ SEO optimized (FAQ JSON-LD)

### Future Enhancements (TODOs)
- [ ] Real PDF thumbnail rendering (currently placeholders)
- [ ] Multiple file upload
- [ ] Page extraction to separate PDFs
- [ ] Page duplication
- [ ] Undo/redo for individual operations
- [ ] Page preview on hover

## 🔗 Linking from Main Site

To link to this editor from your main OmniToolset site:

```tsx
// In your main site
<Link href="/pdf-editor" target="_blank">
  Edit PDF
</Link>

// Or as an iframe
<iframe 
  src="/pdf-editor" 
  width="100%" 
  height="800px"
  title="PDF Editor"
/>
```

## 🌐 Subdomain Setup

To host on a subdomain (e.g., `editor.omnitoolset.com`):

1. Configure your DNS to point the subdomain to your server
2. Update Next.js config if needed for subdomain routing
3. Update canonical URLs in metadata if using separate domain

## 🎯 SEO

The page includes:
- Complete metadata (title, description, keywords)
- Open Graph tags
- Twitter Card tags
- FAQ JSON-LD structured data
- Semantic HTML (h1, h2, etc.)
- Canonical URL

## ♿ Accessibility

- Keyboard navigation (Tab, Enter, Space)
- ARIA labels on all interactive elements
- Focus states visible
- Screen reader friendly
- Semantic HTML structure

## 📝 Notes

- All PDF processing happens in the browser (no server upload)
- Maximum file size: 50MB
- Works on all modern browsers
- No registration or account required
- No watermarks added to PDFs

