
import React from 'react';
import PDFViewer from './PDFViewer';

const ThongTinContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-fpt-blue mb-4">Thông Tin Chi Tiết</h3>
      <PDFViewer
        pdfUrl="/smartlife_retail_case_study.pdf"
        fileName="SmartLife Retail Case Study"
        fallbackUrls={[
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        ]}
      />
    </div>
  );
};

export default ThongTinContent;
