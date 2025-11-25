// Tools Database
const tools = [
    // PDF Tools
    {
        id: 'pdf-merge',
        title: 'PDF Birleştir',
        description: 'Birden fazla PDF dosyasını tek bir dosyada birleştirin',
        icon: '📄',
        category: 'PDF',
        page: 'tools/pdf-merge.html'
    },
    {
        id: 'pdf-split',
        title: 'PDF Böl',
        description: 'PDF dosyanızı sayfalara göre bölün',
        icon: '✂️',
        category: 'PDF',
        page: 'tools/pdf-split.html'
    },
    {
        id: 'pdf-compress',
        title: 'PDF Sıkıştır',
        description: 'PDF dosya boyutunu küçültün',
        icon: '🗜️',
        category: 'PDF',
        page: 'tools/pdf-compress.html'
    },
    {
        id: 'pdf-to-word',
        title: 'PDF\'den Word\'e',
        description: 'PDF dosyasını Word formatına dönüştürün',
        icon: '📝',
        category: 'PDF',
        page: 'tools/pdf-to-word.html'
    },
    {
        id: 'pdf-to-image',
        title: 'PDF\'den JPG',
        description: 'PDF sayfalarını JPG formatına dönüştürün',
        icon: '🖼️',
        category: 'PDF',
        page: 'tools/pdf-to-jpg.html'
    },
    {
        id: 'jpg-to-pdf',
        title: 'JPG\'den PDF',
        description: 'JPG resimlerini PDF formatına dönüştürün',
        icon: '📄',
        category: 'PDF',
        page: 'tools/jpg-to-pdf.html'
    },
    {
        id: 'word-to-pdf',
        title: 'Word\'den PDF',
        description: 'Word dosyasını PDF formatına dönüştürün',
        icon: '📝',
        category: 'PDF',
        page: 'tools/word-to-pdf.html'
    },
    {
        id: 'excel-to-pdf',
        title: 'Excel\'den PDF',
        description: 'Excel dosyasını PDF formatına dönüştürün',
        icon: '📊',
        category: 'PDF',
        page: 'tools/excel-to-pdf.html'
    },
    {
        id: 'powerpoint-to-pdf',
        title: 'PowerPoint\'den PDF',
        description: 'PowerPoint dosyasını PDF formatına dönüştürün',
        icon: '📽️',
        category: 'PDF',
        page: 'tools/powerpoint-to-pdf.html'
    },
    {
        id: 'pdf-encrypt',
        title: 'PDF Şifrele',
        description: 'PDF dosyanıza şifre koruması ekleyin',
        icon: '🔒',
        category: 'PDF',
        page: 'tools/pdf-encrypt.html'
    },
    {
        id: 'pdf-rotate',
        title: 'PDF Döndür',
        description: 'PDF sayfalarını döndürün',
        icon: '🔄',
        category: 'PDF',
        page: 'tools/pdf-rotate.html'
    },
    
    // Image Tools
    {
        id: 'image-compress',
        title: 'Resim Sıkıştır',
        description: 'Resim dosya boyutunu küçültün',
        icon: '🗜️',
        category: 'Görsel',
        page: 'tools/image-compress.html'
    },
    {
        id: 'image-convert',
        title: 'JPG ↔ PNG',
        description: 'JPG ve PNG formatları arasında dönüştürün',
        icon: '🔄',
        category: 'Görsel',
        page: 'tools/jpg-png-convert.html'
    },
    {
        id: 'webp-convert',
        title: 'WEBP Dönüştürücü',
        description: 'WEBP\'yi JPG/PNG\'ye veya JPG/PNG\'yi WEBP\'ye dönüştürün',
        icon: '🖼️',
        category: 'Görsel',
        page: 'tools/webp-convert.html'
    },
    {
        id: 'image-resize',
        title: 'Resim Boyutlandır',
        description: 'Resim boyutlarını değiştirin',
        icon: '📏',
        category: 'Görsel',
        page: 'tools/image-resize.html'
    },
    {
        id: 'image-crop',
        title: 'Resim Kırp',
        description: 'Resimden istediğiniz bölümü kırpın',
        icon: '✂️',
        category: 'Görsel',
        page: 'tools/image-crop.html'
    },
    {
        id: 'image-watermark',
        title: 'Filigran Ekle',
        description: 'Resimlere filigran ekleyin',
        icon: '💧',
        category: 'Görsel',
        page: 'tools/image-watermark.html'
    },
    
    // Text Tools
    {
        id: 'text-case',
        title: 'Metin Dönüştürücü',
        description: 'Büyük/küçük harf, başlık formatı vb.',
        icon: '🔤',
        category: 'Metin',
        page: 'tools/text-case.html'
    },
    {
        id: 'text-counter',
        title: 'Karakter Sayacı',
        description: 'Kelime, karakter ve paragraf sayısını öğrenin',
        icon: '🔢',
        category: 'Metin',
        page: 'tools/text-counter.html'
    },
    {
        id: 'base64-encode',
        title: 'Base64 Encode',
        description: 'Metni Base64 formatına dönüştürün',
        icon: '🔐',
        category: 'Metin',
        page: 'tools/base64-encode.html'
    },
    {
        id: 'base64-decode',
        title: 'Base64 Decode',
        description: 'Base64 kodunu metne dönüştürün',
        icon: '🔓',
        category: 'Metin',
        page: 'tools/base64-decode.html'
    },
    {
        id: 'url-encode',
        title: 'URL Encode',
        description: 'URL kodlaması yapın',
        icon: '🔗',
        category: 'Metin',
        page: 'tools/url-encode.html'
    },
    {
        id: 'json-formatter',
        title: 'JSON Formatla & Doğrula',
        description: 'JSON kodunu düzenleyin, formatlayın ve doğrulayın',
        icon: '📋',
        category: 'Developer',
        page: 'tools/json-formatter.html'
    },
    {
        id: 'text-diff',
        title: 'Metin Karşılaştır',
        description: 'İki metni karşılaştırın ve farkları görün',
        icon: '🔍',
        category: 'Metin',
        page: 'tools/text-diff.html'
    },
    
    // Media Tools
    {
        id: 'mp4-to-mp3',
        title: 'MP4\'den MP3\'e',
        description: 'Video dosyasından ses çıkarın',
        icon: '🎵',
        category: 'Medya',
        page: 'tools/mp4-to-mp3.html'
    },
    
    // QR Code Tools
    {
        id: 'qr-generator',
        title: 'QR Kod Oluştur',
        description: 'Metin veya URL için QR kod oluşturun',
        icon: '📱',
        category: 'QR Kod',
        page: 'tools/qr-generator.html'
    },
    {
        id: 'qr-reader',
        title: 'QR Kod Oku',
        description: 'QR kod resimlerini okuyun',
        icon: '📷',
        category: 'QR Kod',
        page: 'tools/qr-reader.html'
    },
    
    // Other Tools
    {
        id: 'password-generator',
        title: 'Şifre Üreteci',
        description: 'Güvenli şifreler oluşturun',
        icon: '🔑',
        category: 'Diğer',
        page: 'tools/password-generator.html'
    },
    {
        id: 'hash-generator',
        title: 'Hash Üreteci',
        description: 'MD5, SHA256 vb. hash değerleri oluşturun',
        icon: '🔐',
        category: 'Diğer',
        page: 'tools/hash-generator.html'
    },
    {
        id: 'color-picker',
        title: 'Renk Seçici',
        description: 'Renk paleti oluşturun ve hex kodlarını alın',
        icon: '🎨',
        category: 'Diğer',
        page: 'tools/color-picker.html'
    },
    {
        id: 'lorem-generator',
        title: 'Lorem Ipsum',
        description: 'Placeholder metin oluşturun',
        icon: '📝',
        category: 'Diğer',
        page: 'tools/lorem-generator.html'
    },
    {
        id: 'date-converter',
        title: 'Tarih Dönüştürücü',
        description: 'Tarih formatlarını dönüştürün',
        icon: '📅',
        category: 'Diğer',
        page: 'tools/date-converter.html'
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderTools();
    setupSearch();
});

function renderTools(filteredTools = tools) {
    const grid = document.getElementById('toolsGrid');
    grid.innerHTML = '';
    
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
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = tools.filter(tool => 
            tool.title.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query)
        );
        renderTools(filtered);
    });
}
