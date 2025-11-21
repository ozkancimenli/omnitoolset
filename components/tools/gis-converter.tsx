'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

type FormatType = 'vector' | 'raster';

const VECTOR_FORMATS = [
  { value: 'geojson', label: 'GeoJSON (.geojson, .json)', extensions: ['.geojson', '.json'] },
  { value: 'kml', label: 'KML (.kml)', extensions: ['.kml'] },
  { value: 'kmz', label: 'KMZ (.kmz)', extensions: ['.kmz'] },
  { value: 'shp', label: 'ESRI Shapefile (.shp)', extensions: ['.shp', '.shx', '.dbf', '.prj'] },
  { value: 'gpx', label: 'GPS Exchange Format (.gpx)', extensions: ['.gpx'] },
  { value: 'gml', label: 'Geography Markup Language (.gml)', extensions: ['.gml', '.xml'] },
  { value: 'dxf', label: 'AutoCAD DXF (.dxf)', extensions: ['.dxf'] },
  { value: 'dwg', label: 'AutoCAD DWG (.dwg)', extensions: ['.dwg'] },
  { value: 'dgn', label: 'Microstation DGN (.dgn)', extensions: ['.dgn'] },
  { value: 'gpkg', label: 'GeoPackage (.gpkg)', extensions: ['.gpkg'] },
  { value: 'csv', label: 'CSV (.csv)', extensions: ['.csv'] },
  { value: 'xlsx', label: 'MS Excel (.xlsx, .xls)', extensions: ['.xlsx', '.xls'] },
  { value: 'topojson', label: 'TopoJSON (.topojson)', extensions: ['.topojson'] },
];

const RASTER_FORMATS = [
  { value: 'geotiff', label: 'GeoTIFF (.tif, .tiff)', extensions: ['.tif', '.tiff'] },
  { value: 'png', label: 'PNG (.png)', extensions: ['.png'] },
  { value: 'jpg', label: 'JPEG (.jpg, .jpeg)', extensions: ['.jpg', '.jpeg'] },
  { value: 'jp2', label: 'JPEG2000 (.jp2)', extensions: ['.jp2'] },
  { value: 'webp', label: 'WEBP (.webp)', extensions: ['.webp'] },
  { value: 'mbtiles', label: 'MBTiles (.mbtiles)', extensions: ['.mbtiles'] },
  { value: 'asc', label: 'Arc/Info ASCII Grid (.asc, .grd)', extensions: ['.asc', '.grd'] },
];

const COORDINATE_SYSTEMS = [
  { code: 'EPSG:4326', name: 'WGS 84 (Lat/Lon)' },
  { code: 'EPSG:3857', name: 'Web Mercator' },
  { code: 'EPSG:4269', name: 'NAD83' },
  { code: 'EPSG:4267', name: 'NAD27' },
  { code: 'EPSG:32633', name: 'WGS 84 / UTM zone 33N' },
  { code: 'EPSG:32634', name: 'WGS 84 / UTM zone 34N' },
  { code: 'EPSG:32635', name: 'WGS 84 / UTM zone 35N' },
  { code: 'EPSG:32636', name: 'WGS 84 / UTM zone 36N' },
  { code: 'EPSG:32637', name: 'WGS 84 / UTM zone 37N' },
  { code: 'EPSG:32638', name: 'WGS 84 / UTM zone 38N' },
];

export default function GisConverter() {
  const [formatType, setFormatType] = useState<FormatType>('vector');
  const [files, setFiles] = useState<File[]>([]);
  const [inputFormat, setInputFormat] = useState('geojson');
  const [outputFormat, setOutputFormat] = useState('kml');
  const [sourceCRS, setSourceCRS] = useState('EPSG:4326');
  const [targetCRS, setTargetCRS] = useState('EPSG:4326');
  const [transformCoordinates, setTransformCoordinates] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Please select files to convert');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: Full GIS conversion requires server-side processing
      // This is a client-side demo that handles basic formats
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress((i / files.length) * 100);

        // Basic GeoJSON to KML conversion example
        if (inputFormat === 'geojson' && outputFormat === 'kml') {
          const text = await file.text();
          try {
            const geojson = JSON.parse(text);
            const kml = convertGeoJSONToKML(geojson);
            downloadFile(kml, file.name.replace('.geojson', '.kml'), 'application/vnd.google-earth.kml+xml');
          } catch (error) {
            console.error('Error converting GeoJSON to KML:', error);
            toast.error(`Failed to convert ${file.name}`);
          }
        } else if (inputFormat === 'kml' && outputFormat === 'geojson') {
          const text = await file.text();
          try {
            const geojson = convertKMLToGeoJSON(text);
            downloadFile(JSON.stringify(geojson, null, 2), file.name.replace('.kml', '.geojson'), 'application/json');
          } catch (error) {
            console.error('Error converting KML to GeoJSON:', error);
            toast.error(`Failed to convert ${file.name}`);
          }
        } else {
          toast.info(`Conversion from ${inputFormat} to ${outputFormat} requires server-side processing. Please use a backend service for production.`);
        }
      }

      setProgress(100);
      toast.success(`Converted ${files.length} file(s)`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred during conversion');
    } finally {
      setIsProcessing(false);
    }
  };

  const convertGeoJSONToKML = (geojson: any): string => {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Converted from GeoJSON</name>
`;

    if (geojson.features) {
      geojson.features.forEach((feature: any, index: number) => {
        const name = feature.properties?.name || `Feature ${index + 1}`;
        const description = feature.properties?.description || '';
        
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates;
          kml += `    <Placemark>
      <name>${escapeXML(name)}</name>
      <description>${escapeXML(description)}</description>
      <Point>
        <coordinates>${lon},${lat},0</coordinates>
      </Point>
    </Placemark>
`;
        } else if (feature.geometry.type === 'LineString') {
          const coordinates = feature.geometry.coordinates.map((coord: number[]) => `${coord[0]},${coord[1]},0`).join(' ');
          kml += `    <Placemark>
      <name>${escapeXML(name)}</name>
      <description>${escapeXML(description)}</description>
      <LineString>
        <coordinates>${coordinates}</coordinates>
      </LineString>
    </Placemark>
`;
        } else if (feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0].map((coord: number[]) => `${coord[0]},${coord[1]},0`).join(' ');
          kml += `    <Placemark>
      <name>${escapeXML(name)}</name>
      <description>${escapeXML(description)}</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordinates}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
`;
        }
      });
    }

    kml += `  </Document>
</kml>`;
    return kml;
  };

  const convertKMLToGeoJSON = (kmlText: string): any => {
    // Simple KML to GeoJSON conversion (basic implementation)
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
    const features: any[] = [];

    const placemarks = kmlDoc.getElementsByTagName('Placemark');
    Array.from(placemarks).forEach((placemark) => {
      const nameEl = placemark.getElementsByTagName('name')[0];
      const descEl = placemark.getElementsByTagName('description')[0];
      const pointEl = placemark.getElementsByTagName('Point')[0];
      const lineStringEl = placemark.getElementsByTagName('LineString')[0];
      const polygonEl = placemark.getElementsByTagName('Polygon')[0];

      let geometry: any = null;

      if (pointEl) {
        const coordEl = pointEl.getElementsByTagName('coordinates')[0];
        if (coordEl) {
          const [lon, lat] = coordEl.textContent?.split(',').map(Number) || [0, 0];
          geometry = { type: 'Point', coordinates: [lon, lat] };
        }
      } else if (lineStringEl) {
        const coordEl = lineStringEl.getElementsByTagName('coordinates')[0];
        if (coordEl) {
          const coords = coordEl.textContent?.trim().split(/\s+/).map(coord => {
            const [lon, lat] = coord.split(',').map(Number);
            return [lon, lat];
          }) || [];
          geometry = { type: 'LineString', coordinates: coords };
        }
      } else if (polygonEl) {
        const linearRingEl = polygonEl.getElementsByTagName('LinearRing')[0];
        if (linearRingEl) {
          const coordEl = linearRingEl.getElementsByTagName('coordinates')[0];
          if (coordEl) {
            const coords = coordEl.textContent?.trim().split(/\s+/).map(coord => {
              const [lon, lat] = coord.split(',').map(Number);
              return [lon, lat];
            }) || [];
            geometry = { type: 'Polygon', coordinates: [coords] };
          }
        }
      }

      if (geometry) {
        features.push({
          type: 'Feature',
          properties: {
            name: nameEl?.textContent || '',
            description: descEl?.textContent || '',
          },
          geometry,
        });
      }
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  };

  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelectWrapper = (selectedFile: File) => {
    setFiles(prev => [...prev, selectedFile]);
    toast.success(`File added: ${selectedFile.name}`);
  };

  const formats = formatType === 'vector' ? VECTOR_FORMATS : RASTER_FORMATS;

  return (
    <ToolBase
      title="GIS/CAD Data Converter"
      description="Convert between vector and raster GIS formats"
      icon="🗺️"
      helpText="Convert between vector and raster GIS formats, transform coordinate systems, and process geospatial data. Currently supports basic GeoJSON ↔ KML conversion. Full conversion requires server-side processing."
      tips={[
        'Select vector or raster format type',
        'Upload GIS/CAD files',
        'Choose input and output formats',
        'Transform coordinate systems',
        'Full conversion requires backend'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Format Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setFormatType('vector')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                formatType === 'vector'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Vector
            </button>
            <button
              onClick={() => setFormatType('raster')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                formatType === 'raster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Raster
            </button>
          </div>
        </div>

        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelectWrapper}
            acceptedFileTypes={formatType === 'vector' ? [] : []}
            acceptedExtensions={formatType === 'vector' 
              ? ['.geojson', '.json', '.kml', '.kmz', '.shp', '.shx', '.dbf', '.prj', '.gpx', '.gml', '.dxf', '.dwg', '.dgn', '.gpkg', '.csv', '.xlsx', '.xls', '.topojson']
              : ['.tif', '.tiff', '.png', '.jpg', '.jpeg', '.jp2', '.webp', '.mbtiles', '.asc', '.grd']}
            multiple={true}
            icon="🗺️"
            text={files.length > 0 ? `${files.length} file(s) selected` : 'Drop GIS/CAD files here or click to browse'}
            subtext={formatType === 'vector' 
              ? 'Supported: GeoJSON, KML, KMZ, Shapefile, DXF, DWG, DGN, GPX, GML, CSV, Excel, TopoJSON, and more'
              : 'Supported: GeoTIFF, PNG, JPG, JPEG2000, WEBP, MBTiles, ASCII Grid, and more'}
          />
        )}

        {files.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Files ({files.length})
              </h3>
              <button
                onClick={() => {
                  setFiles([]);
                  toast.info('Files cleared');
                }}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {files.slice(0, 5).map((file, index) => (
                <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  {file.name}
                </p>
              ))}
              {files.length > 5 && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  +{files.length - 5} more files
                </p>
              )}
            </div>
          </div>
        )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Input Format
              </label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              >
                {formats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              >
                {formats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formatType === 'vector' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={transformCoordinates}
                  onChange={(e) => setTransformCoordinates(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Transform Coordinate System
                </span>
              </label>

              {transformCoordinates && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source CRS
                    </label>
                    <select
                      value={sourceCRS}
                      onChange={(e) => setSourceCRS(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    >
                      {COORDINATE_SYSTEMS.map((crs) => (
                        <option key={crs.code} value={crs.code}>
                          {crs.code} - {crs.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target CRS
                    </label>
                    <select
                      value={targetCRS}
                      onChange={(e) => setTargetCRS(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    >
                      {COORDINATE_SYSTEMS.map((crs) => (
                        <option key={crs.code} value={crs.code}>
                          {crs.code} - {crs.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing || inputFormat === outputFormat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? `Converting... ${Math.round(progress)}%` : `Convert to ${outputFormat.toUpperCase()}`}
          </button>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Full GIS/CAD conversion with coordinate transformation requires server-side processing. 
              Currently supports basic GeoJSON ↔ KML conversion. For production use, implement a backend service using GDAL, 
              PROJ, or similar libraries.
            </p>
          </div>
        </div>
      )}

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Supported Formats</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Vector Formats</h5>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• GeoJSON, KML, KMZ</li>
                <li>• ESRI Shapefile</li>
                <li>• AutoCAD DXF, DWG</li>
                <li>• Microstation DGN</li>
                <li>• GPS Exchange Format (GPX)</li>
                <li>• Geography Markup Language (GML)</li>
                <li>• GeoPackage, TopoJSON</li>
                <li>• CSV, Excel</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Raster Formats</h5>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• GeoTIFF</li>
                <li>• PNG, JPG, JPEG2000</li>
                <li>• WEBP, MBTiles</li>
                <li>• Arc/Info ASCII Grid</li>
                <li>• ENVI, ERMapper</li>
                <li>• NetCDF, HDF4/HDF5</li>
                <li>• SRTM HGT, USGS DEM</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolBase>
  );
}

