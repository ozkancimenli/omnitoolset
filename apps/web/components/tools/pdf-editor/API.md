# PDF Editor API Documentation

## Core APIs

### PDF Loading
```typescript
import { usePdfLoader } from './hooks';

const { loadPDF, pdfDoc, isLoading } = usePdfLoader();
```

### Annotations
```typescript
import { useAnnotations } from './hooks';

const {
  annotations,
  addAnnotation,
  updateAnnotation,
  deleteAnnotation,
  undo,
  redo,
} = useAnnotations();
```

### Text Editing
```typescript
import { useTextEditing } from './hooks';

const {
  extractTextLayer,
  pdfTextRuns,
  editTextRun,
} = useTextEditing();
```

## Utility APIs

### Advanced Export
```typescript
import { getAdvancedExport } from './utils/advancedExport';

const exporter = getAdvancedExport();
const blob = await exporter.export(pdfDoc, {
  format: 'png',
  quality: 0.9,
  pages: [1, 2, 3],
});
```

### PDF Comparison
```typescript
import { getPDFComparison } from './utils/pdfComparison';

const comparison = getPDFComparison();
const result = await comparison.compare(pdf1Bytes, pdf2Bytes);
```

### Batch Processing
```typescript
import { getBatchProcessor } from './utils/batchProcessor';

const processor = getBatchProcessor();
const job = processor.createJob([
  { file: pdf1, operation: 'compress' },
  { file: pdf2, operation: 'merge' },
]);
```

### Cloud Storage
```typescript
import { getCloudStorageManager } from './utils/cloudStorage';

const storage = getCloudStorageManager();
await storage.connect('Google Drive');
await storage.uploadFile(file, '/path/to/file.pdf');
```

### Version Control
```typescript
import { getVersionControl } from './utils/versionControl';

const vc = getVersionControl();
const versionId = await vc.createVersion(pdfBytes, annotations, 'Initial version');
vc.createBranch('feature-branch', versionId);
```

### Advanced Search
```typescript
import { getAdvancedSearch } from './utils/advancedSearch';

const search = getAdvancedSearch();
const results = await search.search(pdfData, {
  query: 'search term',
  regex: false,
  caseSensitive: false,
  filters: [
    { type: 'text', operator: 'contains', value: 'keyword' },
  ],
});
```

### Document Analytics
```typescript
import { getDocumentAnalytics } from './utils/documentAnalytics';

const analytics = getDocumentAnalytics();
const stats = await analytics.analyze(pdfData, annotations);
console.log(stats.complexity.score);
```

### Performance Profiling
```typescript
import { getPerformanceProfiler } from './utils/performanceProfiler';

const profiler = getPerformanceProfiler();
const stop = profiler.start('operation-name');
// ... do work ...
stop();
const report = profiler.getReport();
```

### Advanced Logging
```typescript
import { getAdvancedLogger } from './utils/advancedLogging';

const logger = getAdvancedLogger();
logger.setLevel('debug');
logger.info('Operation started', { userId: '123' });
logger.error('Operation failed', error, { context: 'data' });
```

### Configuration Management
```typescript
import { getConfigManager } from './utils/configManager';

const config = getConfigManager();
config.set('editor.autoSave', true);
const autoSave = config.get<boolean>('editor.autoSave');
const exported = config.export();
```

### Internationalization
```typescript
import { getI18nManager } from './utils/i18n';

const i18n = getI18nManager();
i18n.setLocale('tr');
const text = i18n.t('common.save', { count: 5 });
```

## Hook APIs

### useZoom
```typescript
const { zoom, setZoom, zoomMode, setZoomMode } = useZoom();
```

### useCanvas
```typescript
const { canvasRef, containerRef, renderPage } = useCanvas();
```

### useDrawing
```typescript
const { startDrawing, updateDrawing, finishDrawing } = useDrawing();
```

### usePanning
```typescript
const { isPanning, startPan, updatePan, endPan } = usePanning();
```

## Component APIs

### Toolbar
```typescript
<Toolbar
  tool={tool}
  setTool={setTool}
  isEditable={isEditable}
  // ... other props
/>
```

### CanvasContainer
```typescript
<CanvasContainer
  containerRef={containerRef}
  canvasRef={canvasRef}
  tool={tool}
  // ... other props
/>
```

## Error Handling

```typescript
import { getErrorBoundaryManager } from './utils/errorBoundary';

const errorManager = getErrorBoundaryManager();
errorManager.onError((errorInfo) => {
  console.error('Error occurred:', errorInfo);
});
```

## Testing

```typescript
import { getTestUtilities } from './utils/testUtilities';

const testUtils = getTestUtilities();
await testUtils.runTest('test name', async () => {
  testUtils.assertEquals(actual, expected);
});
```

