
import React from 'react';

const ExamplesContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-fpt-blue">
          Ví Dụ Về Câu Lệnh
        </h3>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-medium">Instruction-based Prompting (Ra lệnh trực tiếp):</p>
          <p className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200">
            Tạo JD cho vị trí quản lý cửa hàng.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Hơi mơ hồ, có thể nhận kết quả chung chung. Nếu chưa setup context trước thì kết quả gần như sẽ không chính xác.
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-medium">Structured Prompting (Prompt có cấu trúc):</p>
          <div className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200 whitespace-pre-wrap">
{`
Bạn là chuyên viên HR tại Công ty CP Bán lẻ SmartLife (SmartLife Retail JSC) - chuỗi siêu thị/cửa hàng tiện lợi quy mô 400 nhân sự, đang chuẩn bị mở 10 cửa hàng mới trong 6 tháng tới. Công ty đang đẩy mạnh chuyển đổi số và ứng dụng AI. Tỷ lệ nghỉ việc ở nhân viên tuyến đầu cao.

#ROLE: Chuyên viên Tuyển dụng (Recruitment Specialist)

#TASK: Viết bản mô tả công việc chuẩn hóa (JD) cho vị trí "Trưởng ca cửa hàng" tại SmartLife Retail JSC.

#REQUIREMENT:
- JD phải hấp dẫn, thể hiện rõ vai trò quan trọng của vị trí trong bối cảnh tăng trưởng và chuyển đổi số của công ty.
- Các mục cần có trong JD:
    - Chức danh/Vị trí
    - Bộ phận/Phòng ban
    - Báo cáo trực tiếp cho
    - Địa điểm làm việc
    - Tóm tắt công việc (Job Summary)
    - Trách nhiệm và nhiệm vụ chính (Key Responsibilities & Duties) - cần chi tiết và nhấn mạnh yếu tố quản lý, điều hành và ứng dụng công nghệ.
    - Yêu cầu ứng viên (Candidate Requirements) - bao gồm kinh nghiệm, học vấn, kỹ năng cứng (có yếu tố công nghệ, dữ liệu) và kỹ năng mềm, phẩm chất cá nhân (chủ động, khả năng thích ứng).
    - Quyền lợi và phúc lợi (Benefits & Perks) - nêu bật cơ hội phát triển trong môi trường chuyển đổi số.
    - Quy trình ứng tuyển
    - Tuyên bố về sự đa dạng và hòa nhập (Diversity & Inclusion Statement).
- Giọng văn chuyên nghiệp nhưng truyền cảm hứng, thu hút nhân sự trẻ, có khả năng thích ứng với công nghệ.
- Độ dài khoảng 500-700 từ.
`}
          </div>
          <p className="text-xs mt-2 text-gray-500">
            Vai trò rõ ràng, đối tượng, độ dài, và yêu cầu cụ thể
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-medium">Nâng cao: Context-Aware Iterative Prompting (Ví dụ tạo JD):</p>
          <div className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200">
            <p className="font-semibold text-fpt-blue mb-2">Giai đoạn 1: Thiết lập Ngữ cảnh Doanh nghiệp và Mục tiêu Tổng thể (Context Prompt)</p>
            <div className="whitespace-pre-wrap mb-4 p-2 bg-gray-100 rounded">
              <strong>Prompt 1 (Thiết lập ngữ cảnh)</strong>
              <pre>
{`Bạn là một chuyên viên HR đang làm việc với tôi. Tôi là chuyên viên tuyển dụng tại Công ty CP Bán lẻ SmartLife (SmartLife Retail JSC).

**Về SmartLife:**
- Chuỗi siêu thị/cửa hàng tiện lợi quy mô 400 nhân sự.
- Đang chuẩn bị mở 10 cửa hàng mới trong 6 tháng tới (giai đoạn tăng trưởng mạnh).
- Đẩy mạnh chuyển đổi số, ứng dụng AI và dữ liệu lớn vào vận hành, bán hàng và quản trị nhân sự để đột phá tăng trưởng.
- Văn hóa công ty đề cao học hỏi và đổi mới.

**Thách thức hiện tại:**
- Tỷ lệ nghỉ việc cao ở các vị trí nhân viên bán hàng và trưởng ca.
- Đội ngũ quản lý trung gian nhiều người gắn bó lâu năm nhưng chưa quen công nghệ số, cần tái đào tạo/upskilling.

**Mục tiêu của bộ phận HR:**
- Chủ động ứng dụng công nghệ, đặc biệt là AI, để tối ưu hóa quy trình nhân sự.
- Xây dựng đội ngũ đáp ứng giai đoạn tăng trưởng và chuyển đổi số.

Hãy xác nhận bạn đã hiểu ngữ cảnh công ty chúng tôi.`}
              </pre>
            </div>

            <p className="font-semibold text-fpt-blue mb-2">Giai đoạn 2: Bắt đầu Hoạch định Nhân sự và Phân tích Công việc (Initial Task Prompt & Iteration)</p>
            <div className="whitespace-pre-wrap mb-4 p-2 bg-gray-100 rounded">
              <strong>Prompt 2 (Hoạch định nhân sự ban đầu)</strong>
              <pre>
{`Dựa trên ngữ cảnh đã cho, hãy hoạch định nhu cầu nhân sự tổng thể cho giai đoạn mở rộng sắp tới (10 cửa hàng mới trong 6 tháng).
- Xác định các vị trí cần tuyển mới và các vị trí cần tái đào tạo.
- Ước tính số lượng nhân sự cần cho mỗi vị trí chủ chốt.
- Liệt kê các kỹ năng ưu tiên (cả cứng và mềm) cho nhân sự mới và cần phát triển ở nhân sự hiện tại.`}
              </pre>
              <br />
              <strong>Prompt 3 (Tinh chỉnh Kế hoạch & Chọn vị trí)</strong>
              <pre>
{`Kế hoạch này khá tốt. Bây giờ, tôi muốn tập trung vào vị trí "Trưởng ca cửa hàng". Vị trí này rất quan trọng vì liên quan trực tiếp đến tỷ lệ nghỉ việc cao.

Hãy phân tích chi tiết công việc cho vị trí "Trưởng ca cửa hàng", bao gồm:
- Mục tiêu chính của vị trí.
- Các nhiệm vụ và trách nhiệm cụ thể.
- Tiêu chí thành công của một Trưởng ca xuất sắc.
- Những thách thức đặc thù mà một Trưởng ca có thể gặp phải tại SmartLife trong bối cảnh chuyển đổi số.`}
              </pre>
            </div>

            <p className="font-semibold text-fpt-blue mb-2">Giai đoạn 3: Soạn thảo JD và Tinh chỉnh Cuối cùng (Iterative & Constraint Prompt)</p>
            <div className="whitespace-pre-wrap p-2 bg-gray-100 rounded">
              <strong>Prompt 4 (Soạn thảo JD)</strong>
              <pre>
{`Dựa trên phân tích công việc bạn vừa cung cấp cho vị trí Trưởng ca cửa hàng, hãy soạn thảo một bản mô tả công việc (JD) hoàn chỉnh.

#REQUIREMENT:
- JD phải hấp dẫn, thể hiện rõ vai trò quan trọng của vị trí trong bối cảnh tăng trưởng và chuyển đổi số của SmartLife.
- Các mục bắt buộc trong JD: Chức danh, Bộ phận, Báo cáo cho, Địa điểm, Tóm tắt công việc, Trách nhiệm chính, Yêu cầu ứng viên (kinh nghiệm, học vấn, kỹ năng cứng - có yếu tố công nghệ, dữ liệu; kỹ năng mềm, phẩm chất cá nhân), Quyền lợi & phúc lợi, Quy trình ứng tuyển, Tuyên bố Đa dạng & Hòa nhập.
- Giọng văn chuyên nghiệp nhưng truyền cảm hứng, thu hút nhân sự trẻ, có khả năng thích ứng với công nghệ.
- Độ dài khoảng 500-700 từ.`}
              </pre>
              <br />
              <strong>Prompt 5 (Tinh chỉnh JD)</strong>
              <pre>
{`Bản JD này tốt, nhưng tôi muốn nhấn mạnh hơn nữa yếu tố "chuyển đổi số" và "văn hóa học hỏi" trong phần trách nhiệm và yêu cầu ứng viên.
- Hãy thêm cụ thể hơn về việc Trưởng ca sẽ sử dụng dữ liệu/công cụ số trong công việc hàng ngày.
- Làm nổi bật khả năng học hỏi công nghệ mới là một kỹ năng quan trọng.
- Đồng thời, đề xuất một câu tagline hấp dẫn cho JD để thu hút nhân sự trẻ, năng động.`}
              </pre>
              <br />
              <strong>Prompt 6 (Kiểm tra cuối cùng)</strong>
              <pre>
{`Bạn có thể đọc lại toàn bộ JD và đảm bảo rằng nó không có lỗi chính tả, ngữ pháp và tuân thủ tất cả các yêu cầu tôi đã đưa ra không? Cuối cùng, hãy đưa ra một đánh giá ngắn về mức độ hấp dẫn của JD này đối với một ứng viên tiềm năng trong ngành bán lẻ hiện đại.`}
              </pre>
            </div>
          </div>
          <p className="text-xs mt-2 text-gray-500">
            Ví dụ về Context-Aware Iterative Prompting để tạo và tinh chỉnh Job Description, mô phỏng quy trình tương tác nhiều bước.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamplesContent;
