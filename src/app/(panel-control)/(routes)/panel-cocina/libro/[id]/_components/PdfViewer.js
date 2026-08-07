"use client";

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Spinner from '@/app/components/Spinner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function PdfViewer({ file, pageNumber, onDocumentLoadSuccess }) {
  return (
    <Document
      file={file}
      onLoadSuccess={onDocumentLoadSuccess}
      loading={
        <div className="flex justify-center items-center h-[600px] w-[450px]">
          <Spinner size="md" />
        </div>
      }
    >
      <Page 
        pageNumber={pageNumber} 
        width={500} 
        className="pdf-page-container" 
        renderTextLayer={false} 
        renderAnnotationLayer={false}
      />
    </Document>
  );
}
