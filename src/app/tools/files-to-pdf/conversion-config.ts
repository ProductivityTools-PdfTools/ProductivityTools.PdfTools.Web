import { AcceptTypes, IMAGE_TYPES, WORD_TYPES } from '../file-access.service';

/**
 * Settings of a "convert every file to its own PDF and download a ZIP" tool.
 * The FilesToPdf component is reused for several such tools via route data:
 *   { path: '...', loadComponent: ..., data: { conversion: WORD_CONVERSION } }
 */
export interface ConversionConfig {
  title: string;
  description: string;
  /** Lower-case extensions without the dot. */
  extensions: string[];
  /** Human-readable list of supported formats. */
  formats: string;
  /** `accept` attribute of the native file input. */
  accept: string;
  /** Types for the File System Access picker. */
  pickerTypes: AcceptTypes;
  /** API endpoint relative to API_URL. */
  endpoint: string;
  zipName: string;
}

export const WORD_CONVERSION: ConversionConfig = {
  title: 'Files to PDF',
  description: 'Convert Word documents (.doc, .docx) to PDF. All PDFs are downloaded together in one ZIP file.',
  extensions: ['doc', 'docx'],
  formats: '.doc / .docx',
  accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pickerTypes: WORD_TYPES,
  endpoint: 'files-to-pdf',
  zipName: 'converted.zip',
};

export const IMAGE_CONVERSION: ConversionConfig = {
  title: 'Images to PDF',
  description: 'Convert every image to its own PDF. All PDFs are downloaded together in one ZIP file.',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
  formats: 'JPG / PNG / GIF / BMP',
  accept: '.jpg,.jpeg,.png,.gif,.bmp,image/jpeg,image/png,image/gif,image/bmp',
  pickerTypes: IMAGE_TYPES,
  endpoint: 'images-to-pdf-files',
  zipName: 'images.zip',
};
