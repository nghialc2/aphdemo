
import React from 'react';
import PDFViewer from './PDFViewer';

const ThongTinContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-fpt-blue mb-4">Thông Tin Chi Tiết</h3>
      <PDFViewer
        pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/smartlife_retail_case_study.pdf"
        fileName="SmartLife Retail Case Study"
        fallbackUrls={[
          "/smartlife_retail_case_study.pdf"
        ]}
      />
    </div>
  );
};

export default ThongTinContent;
