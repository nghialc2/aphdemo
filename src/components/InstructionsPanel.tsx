
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Book, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InstructionsPanelProps {
  collapsible?: boolean;
  onCollapse?: () => void;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ 
  collapsible = false,
  onCollapse
}) => {
  const [activeTab, setActiveTab] = useState<string>("instructions");
  
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="font-bold text-lg text-fpt-blue">Hướng dẫn</h2>
        {collapsible && (
          <Button variant="ghost" size="icon" onClick={onCollapse}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Thu gọn</span>
          </Button>
        )}
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="px-4 py-2 justify-start border-b w-full rounded-none bg-gray-50 flex-shrink-0">
          <TabsTrigger value="instructions" className="flex items-center text-gray-900">
            <Book className="mr-2 h-4 w-4" />
            <span>Hướng dẫn</span>
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center text-gray-900">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Ví dụ</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 relative overflow-hidden">
          <TabsContent 
            value="instructions" 
            className="absolute inset-0 m-0 tab-content bg-white"
          >
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-fpt-orange break-words instruction-heading">
                    Xin chào mừng các bạn đã đến với Lab thực hành của chương trình AI-Powered HRM
                  </h3>
                  
                  <div className="space-y-3">
                    <p className="text-gray-900 font-medium tab-instructions-text">
                      Lab này cho phép bạn thực hành xây dựng các câu prompt hiệu quả cho
                      các mô hình ngôn ngữ lớn. Bạn sẽ học cách:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li className="text-gray-900 font-medium tab-instructions-text">Viết hướng dẫn rõ ràng, cụ thể</li>
                      <li className="text-gray-900 font-medium tab-instructions-text">Cấu trúc prompt để nhận được phản hồi tối ưu</li>
                      <li className="text-gray-900 font-medium tab-instructions-text">So sánh kết quả giữa các mô hình khác nhau</li>
                      <li className="text-gray-900 font-medium tab-instructions-text">Cải tiến và nâng cao kỹ năng kỹ thuật prompt của bạn</li>
                    </ul>
                    
                    <div className="bg-fpt-lightGreen p-4 rounded-md">
                      <p className="font-medium text-fpt-green">Bắt đầu:</p>
                      <ol className="list-decimal list-inside ml-2 space-y-1">
                        <li className="text-gray-900 font-medium tab-instructions-text">Chọn một mô hình từ danh sách trong bảng điều khiển chat</li>
                        <li className="text-gray-900 font-medium tab-instructions-text">Nhập prompt của bạn vào ô nhập tin nhắn</li>
                        <li className="text-gray-900 font-medium tab-instructions-text">Xem xét phản hồi và điều chỉnh phương pháp của bạn</li>
                      </ol>
                    </div>
                    
                    <p className="text-sm text-gray-900 italic tab-instructions-text">
                      Lưu ý: Chất lượng prompt của bạn ảnh hưởng trực tiếp đến chất lượng phản hồi!
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-fpt-blue instruction-heading">
                    Bài tập hôm nay
                  </h3>
                  
                  <div className="border-l-4 border-fpt-blue pl-3">
                    <p className="font-medium text-gray-900 instruction-heading">Bài tập 1: Xác định vai trò</p>
                    <p className="text-sm text-gray-900 tab-instructions-text">
                      Viết một prompt xác định rõ vai trò mà AI nên đảm nhận (ví dụ: chuyên viên viết nội dung, cố vấn tài chính).
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-fpt-orange pl-3">
                    <p className="font-medium text-gray-900 instruction-heading">Bài tập 2: Thiết lập ràng buộc</p>
                    <p className="text-sm text-gray-900 tab-instructions-text">
                      Tạo prompt với các ràng buộc cụ thể (số từ, định dạng, đối tượng mục tiêu).
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-fpt-green pl-3">
                    <p className="font-medium text-gray-900 instruction-heading">Bài tập 3: Hướng dẫn tuần tự</p>
                    <p className="text-sm text-gray-900 tab-instructions-text">
                      Phát triển prompt nhiều bước hướng dẫn AI thông qua một nhiệm vụ phức tạp.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent 
            value="examples" 
            className="absolute inset-0 m-0 tab-content bg-white"
          >
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-fpt-blue instruction-heading">
                    Ví dụ về Prompt
                  </h3>
                  
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="font-medium text-gray-900 instruction-heading">Prompt cơ bản:</p>
                    <p className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200 text-gray-900 example-code">
                      Viết một đoạn ngắn về trí tuệ nhân tạo.
                    </p>
                    <p className="text-xs mt-2 text-gray-900 tab-instructions-text">
                      Quá mơ hồ, có khả năng nhận được kết quả chung chung
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="font-medium text-gray-900 instruction-heading">Prompt cải thiện:</p>
                    <p className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200 text-gray-900 example-code">
                      Hãy đóng vai một nhà báo công nghệ viết cho đối tượng doanh nghiệp. Viết một đoạn văn hấp dẫn dài 100 từ về cách AI sinh thành đang biến đổi dịch vụ khách hàng trong năm 2025. Bao gồm một ví dụ cụ thể và một số liệu thống kê.
                    </p>
                    <p className="text-xs mt-2 text-gray-900 tab-instructions-text">
                      Vai trò rõ ràng, đối tượng, độ dài và yêu cầu cụ thể
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="font-medium text-gray-900 instruction-heading">Prompt nâng cao:</p>
                    <p className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200 text-gray-900 break-words example-code">
                      Tôi muốn bạn đóng vai một nhà nghiên cứu UX cấp cao tạo báo cáo cho quản lý sản phẩm.
                      
                      Bước 1: Xác định 3 vấn đề khả dụng chính thường ảnh hưởng đến ứng dụng ngân hàng di động.
                      
                      Bước 2: Đối với mỗi vấn đề, giải thích tác động đến cả trải nghiệm người dùng và các chỉ số kinh doanh.
                      
                      Bước 3: Đề xuất các giải pháp dựa trên bằng chứng cho từng vấn đề, trích dẫn nghiên cứu hoặc nguyên tắc UX liên quan.
                      
                      Định dạng phản hồi như một báo cáo có cấu trúc với các điểm đánh dấu và tiêu đề phần rõ ràng.
                    </p>
                    <p className="text-xs mt-2 text-gray-900 tab-instructions-text">
                      Hướng dẫn nhiều bước với hướng dẫn định dạng rõ ràng
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default InstructionsPanel;
