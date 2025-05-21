
import React from 'react';
import './PracticeGuide.css';

function PracticeGuide() {
  return (
    <div className="practice-guide-container">
      {/* Page 1 */}
      <div className="page">
        <div className="header-fpt">
          <img src="https://via.placeholder.com/50x50" alt="FPT Logo" className="fpt-logo" />
          <div className="fpt-school-name">
            FPT SCHOOL OF BUSINESS
            <br />
            & TECHNOLOGY
          </div>
        </div>
        <h1 className="guide-title">HƯỚNG DẪN THỰC HÀNH</h1>
        <h2 className="session-title">BUỔI 2: TỐI ƯU HÓA TUYỂN DỤNG VỚI AI</h2>

        <div className="section">
          <h3 className="section-heading">I. MỤC TIÊU BÀI THỰC HÀNH:</h3>
          <ul>
            <li>Biết cách xây dựng prompt hiệu quả để AI hỗ trợ các công việc HR nền tảng: Hoạch định nguồn lực, phân tích công việc, xây dựng mô tả công việc (JD). [cite: 1]</li>
            <li>Rèn luyện kỹ năng sử dụng AI để tự động hóa các quy trình phân tích & soạn thảo tài liệu nhân sự. [cite: 2]</li>
            <li>Nâng cao kỹ năng prompt engineering, so sánh kết quả nhận được giữa các model khác nhau/câu lệnh khác nhau. [cite: 3]</li>
          </ul>
        </div>

        <div className="section">
          <h3 className="section-heading">II. BỐI CẢNH THỰC HÀNH</h3>
          <p>Bạn là chuyên viên HR tại Công ty CP Bán lẻ SmartLife (SmartLife Retail JSC) - chuỗi siêu thị/cửa hàng tiện lợi quy mô 400 nhân sự, đang chuẩn bị mở 10 cửa hàng mới trong 6 tháng tới. [cite: 4]</p>
          <ul>
            <li>Turnover rate tại các vị trí nhân viên bán hàng và trưởng ca rất cao. [cite: 5]</li>
            <li>Đội ngũ quản lý trung gian nhiều người gắn bó lâu năm nhưng chưa quen công nghệ số, cần tái đào tạo/upskilling. [cite: 6]</li>
            <li>Ban lãnh đạo yêu cầu bộ phận HR phải chủ động ứng dụng công nghệ, đặc biệt là AI, để tối ưu hóa quy trình nhân sự, xây dựng đội ngũ đáp ứng giai đoạn tăng trưởng và chuyển đổi số. [cite: 7]</li>
          </ul>
        </div>

        <div className="section">
          <h3 className="section-heading">III. NHIỆM VỤ CHÍNH</h3>
          <p>Bạn sẽ sử dụng AI để thực hiện 3 nhiệm vụ:</p>
          <ol>
            <li>Planning: Hoạch định nhu cầu nhân sự cho giai đoạn mở rộng sắp tới. [cite: 8]</li>
            <li>Job Analysis: Phân tích chi tiết công việc cho một vị trí then chốt do bạn lựa chọn. [cite: 9]</li>
          </ol>
        </div>
      </div>

      {/* Page 2 */}
      <div className="page">
        <div className="header-fpt">
          <img src="https://via.placeholder.com/50x50" alt="FPT Logo" className="fpt-logo" />
          <div className="fpt-school-name">
            FPT SCHOOL OF BUSINESS
            <br />
            & TECHNOLOGY
          </div>
        </div>
        <ol start="3">
          <li>Job Description (JD): Viết bản mô tả công việc chuẩn hóa cho vị trí đó. [cite: 10]</li>
        </ol>

        <div className="section">
          <h3 className="section-heading">IV. QUY TRÌNH THỰC HIỆN CHI TIẾT</h3>
          <h4 className="step-heading">Bước 1: Chuẩn bị</h4>
          <ol>
            <li>Đọc kỹ bối cảnh doanh nghiệp. [cite: 11]</li>
            <li>Truy cập website thực hành: <a href="https://aphdemo.lovable.app/" target="_blank" rel="noopener noreferrer">https://aphdemo.lovable.app/</a> [cite: 12]</li>
          </ol>
        </div>

        <div className="section">
          <h4 className="step-heading">Bước 2: Lập prompt cho nhiệm vụ Planning</h4>
          <ul>
            <li>Mục tiêu: Xác định nhu cầu nhân sự mới/đào tạo lại, số lượng, kỹ năng cần ưu tiên. [cite: 13]</li>
            <li>Hướng dẫn:</li>
          </ul>
          <div className="guideline-content">
            <p>Vào AI chatbot trên website thực hành.</p>
            <p>Chọn model bạn muốn</p>
            <div className="model-selection">
              <div className="model-box">GPT 40 mini Default</div>
              <div className="model-box">GPT 40 mini Default</div>
              <div className="model-box">GPT 4.1 mini New</div>
              <div className="model-box">GPT 03 mini New</div>
              <div className="model-box">Gemini 2.0 flash Google</div>
              <div className="model-box">Gemini 2.5 flash Google</div>
            </div>
            <p>Viết Context prompt để chatbot hiểu ngữ cảnh cuộc trò chuyện. [cite: 14]</p>
          </div>
        </div>
      </div>

      {/* Page 3 */}
      <div className="page">
        <div className="header-fpt">
          <img src="https://via.placeholder.com/50x50" alt="FPT Logo" className="fpt-logo" />
          <div className="fpt-school-name">
            FPT SCHOOL OF BUSINESS
            <br />
            & TECHNOLOGY
          </div>
        </div>
        <div className="section">
          <div className="context-prompt-box">
            <h4 className="context-prompt-heading">Context Prompt</h4>
            <p className="context-prompt-instruction">Set context for your conversation with the chatbot...</p>
            <p className="context-prompt-example">
              Ví dụ: SmartLife Retail JSC là công ty bán lẻ hiện đại với chuỗi siêu thị, cửa hàng tiện lợi và thương mại điện tử. [cite: 15] Chúng tôi đang đẩy mạnh chuyển đổi số, ứng dụng AI và dữ liệu lớn vào vận hành, bán hàng và quản trị nhân sự để đột phá tăng trưởng. [cite: 16] Thách thức lớn là tỷ lệ nghỉ việc cao ở nhân viên tuyến đầu và đội ngũ quản lý trung gian thiếu kỹ năng số, cần tái đào tạo. [cite: 17] Công ty sắp mở 10 cửa hàng mới trong 6 tháng tới, đòi hỏi kế hoạch nguồn lực chi tiết để đảm bảo tăng trưởng đột phá và thành công trong chuyển đổi số, đồng thời xây dựng văn hóa đề cao học hỏi và đổi mới. [cite: 18]
            </p>
          </div>
          <p>Viết prompt cho yêu cầu của bạn (xem hướng dẫn bên phần INSTRUCTION) [cite: 19]</p>
          <ul className="instruction-list">
            <li>Đọc kỹ output và có thể đặt thêm các câu hỏi để chỉnh sửa kết quả cho phù hợp với mong muốn. [cite: 19]</li>
            <li>Ví dụ: Kế hoạch nguồn lực này đã phù hợp với chiến lược của công ty trong thời gian tới về đột phá doanh thu/thúc đẩy văn hóa đổi mới chưa?, ... [cite: 19]</li>
            <li>Lưu lại output cuối cùng nếu cần thiết. [cite: 20]</li>
          </ul>
        </div>

        <div className="section">
          <h4 className="step-heading">Bước 3: Lập prompt cho Job Analysis (Phân tích công việc)</h4>
          <ul>
            <li>Mục tiêu: Phân tích sâu về một vị trí lựa chọn ở Bước 1 [cite: 21]</li>
            <ul>
              <li>Nhiệm vụ chính. [cite: 21]</li>
              <li>Tiêu chí thành công. [cite: 21]</li>
              <li>Kỹ năng/kiến thức cần có. [cite: 21]</li>
              <li>Các thách thức đặc thù vị trí. [cite: 21]</li>
            </ul>
          </ul>
        </div>
      </div>

      {/* Page 4 */}
      <div className="page">
        <div className="header-fpt">
          <img src="https://via.placeholder.com/50x50" alt="FPT Logo" className="fpt-logo" />
          <div className="fpt-school-name">
            FPT SCHOOL OF BUSINESS
            <br />
            & TECHNOLOGY
          </div>
        </div>
        <div className="section">
          <ul>
            <li>Thực hiện: [cite: 22]</li>
            <ul>
              <li>Từ output của bước 2, hãy lựa chọn một job bạn muốn phân tích [cite: 22]</li>
              <li>Nhập prompt cho AI, lưu ý cần có đủ các tiêu chí cơ bản: [cite: 23]</li>
              <ul>
                <li>Nhiệm vụ chính. [cite: 23]</li>
                <li>Tiêu chí thành công. [cite: 23]</li>
                <li>Kỹ năng/kiến thức cần có. [cite: 23]</li>
                <li>Các thách thức đặc thù vị trí. [cite: 24]</li>
              </ul>
              <li>Đọc kỹ output, lưu lại, kiểm tra xem đã đủ ý chưa. [cite: 25]</li>
              <li>Nếu kết quả còn chung chung/hạn chế, hãy chỉnh lại prompt cho rõ hơn hoặc bổ sung thêm yêu cầu. [cite: 26]</li>
            </ul>
          </ul>
        </div>

        <div className="section">
          <h4 className="step-heading">Bước 4: Lập prompt cho JD (Mô tả công việc)</h4>
          <ul>
            <li>Mục tiêu: Xây dựng bản JD hoàn chỉnh, chuẩn hóa, hấp dẫn, sát với thực tế SmartLife JSC và bối cảnh chuyển đổi số. [cite: 27]</li>
            <li>Thực hiện: [cite: 28]</li>
            <ul>
              <li>Từ output của bước 3, hãy nhập prompt tạo JD vào AI, kiểm tra kết quả. [cite: 28]</li>
              <li>Chỉnh sửa prompt nếu cần để AI trả về JD đúng với mong muốn. [cite: 29]</li>
              <li>Có thể bổ sung yêu cầu về định dạng (ví dụ: Thông tin cơ bản về vị trí và bộ phận; phần Giới thiệu về công ty và văn hóa; Tóm tắt công việc; Trách nhiệm và nhiệm vụ chính; Yêu cầu ứng viên về kinh nghiệm, học vấn, kỹ năng cứng, kỹ năng mềm và phẩm chất cá nhân; Quyền lợi và phúc lợi hấp dẫn đi kèm cơ hội phát triển; Quy trình ứng tuyển ...). [cite: 30]</li>
            </ul>
          </ul>
        </div>
      </div>

      {/* Page 5 */}
      <div className="page">
        <div className="header-fpt">
          <img src="https://via.placeholder.com/50x50" alt="FPT Logo" className="fpt-logo" />
          <div className="fpt-school-name">
            FPT SCHOOL OF BUSINESS
            <br />
            & TECHNOLOGY
          </div>
        </div>
        <div className="section">
          <h4 className="step-heading">Bước 5: Đánh giá & tối ưu prompt</h4>
          <ul>
            <li>Đọc lại các prompt mình đã dùng và kết quả AI trả về. [cite: 31]</li>
            <li>Nếu cần, hãy thử sửa lại prompt (ví dụ bổ sung thông tin về số lượng cửa hàng, turnover cụ thể, kỹ năng số...) và so sánh kết quả mới. [cite: 32]</li>
            <li>Có thể hỏi thêm các câu follow up như: "Bạn còn đề xuất gì để JD này hấp dẫn hơn đối với nhân sự trẻ?", "Làm thế nào để bản JD này nhấn mạnh văn hóa đổi mới?" [cite: 33]</li>
            <li>Hãy so sánh kết quả nếu sử dụng các prompt khác nhau, hoặc các model khác nhau? [cite: 34]</li>
            <li>Sự khác biệt có rõ ràng không? [cite: 34]</li>
            <li>Chia sẻ những gì rút ra được cùng cả lớp.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PracticeGuide;
