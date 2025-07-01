-- Simple migration to add content column to existing blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Update the existing posts with some sample content
UPDATE public.blog_posts 
SET content = CASE 
    WHEN title LIKE '%AI-Powered HRM%' THEN 
        '<p>Trong kỷ nguyên số hóa, trí tuệ nhân tạo (AI) đang cách mạng hóa cách thức quản lý nguồn nhân lực. Từ việc tự động hóa quy trình tuyển dụng đến phân tích dự đoán hiệu suất nhân viên, AI mang lại những cơ hội chưa từng có.</p>

<h3>Ứng dụng AI trong Tuyển dụng</h3>
<p>Các hệ thống AI hiện đại có thể:</p>
<ul>
<li>Sàng lọc CV tự động dựa trên tiêu chí được định sẵn</li>
<li>Phân tích video phỏng vấn để đánh giá kỹ năng giao tiếp</li>
<li>Dự đoán khả năng phù hợp với văn hóa công ty</li>
</ul>

<h3>Quản lý Hiệu suất với AI</h3>
<p>AI giúp HR theo dõi và cải thiện hiệu suất nhân viên thông qua:</p>
<ul>
<li>Phân tích dữ liệu hiệu suất theo thời gian thực</li>
<li>Đưa ra khuyến nghị cá nhân hóa cho từng nhân viên</li>
<li>Dự báo nguy cơ nghỉ việc và đề xuất biện pháp giữ chân</li>
</ul>

<p><strong>Kết luận:</strong> AI không thay thế con người trong HR mà tăng cường khả năng của họ, giúp tạo ra những quyết định chính xác và hiệu quả hơn.</p>'
    
    WHEN title LIKE '%AI Training Programs%' THEN 
        '<p>Việc xây dựng chương trình đào tạo AI hiệu quả cho lãnh đạo doanh nghiệp đòi hỏi một phương pháp tiếp cận có hệ thống và thực tiễn.</p>

<h3>Khung Thiết kế Chương trình</h3>
<p>Một chương trình đào tạo AI thành công cần bao gồm:</p>
<ol>
<li><strong>Đánh giá Nhu cầu:</strong> Xác định mức độ hiểu biết hiện tại và mục tiêu học tập</li>
<li><strong>Nội dung Phù hợp:</strong> Từ khái niệm cơ bản đến ứng dụng thực tế</li>
<li><strong>Phương pháp Tương tác:</strong> Kết hợp lý thuyết với thực hành hands-on</li>
</ol>

<h3>Nghiên cứu Trường hợp Thực tế</h3>
<p>Các tổ chức thành công đã áp dụng:</p>
<ul>
<li>Chương trình học tập dần tiến từ cơ bản đến nâng cao</li>
<li>Workshop thực hành với các công cụ AI phổ biến</li>
<li>Mentoring và hỗ trợ sau khóa học</li>
</ul>

<p>Đầu tư vào giáo dục AI cho lãnh đạo là chìa khóa để doanh nghiệp thành công trong tương lai.</p>'
    
    WHEN title LIKE '%Future of Business Education%' THEN 
        '<p>Giáo dục kinh doanh đang trải qua một cuộc cách mạng với việc tích hợp AI vào chương trình MBA và các khóa học quản lý.</p>

<h3>Phương pháp Giảng dạy Mới</h3>
<p>Các trường kinh doanh hàng đầu đang:</p>
<ul>
<li>Sử dụng simulation AI để mô phỏng tình huống kinh doanh thực tế</li>
<li>Áp dụng machine learning trong phân tích case study</li>
<li>Tích hợp chatbot AI làm trợ lý học tập cá nhân</li>
</ul>

<h3>Kỹ năng Cần thiết cho Tương lai</h3>
<p>Sinh viên MBA thế hệ mới cần được trang bị:</p>
<ol>
<li><strong>AI Literacy:</strong> Hiểu biết cơ bản về AI và khả năng ứng dụng</li>
<li><strong>Data-driven Decision Making:</strong> Ra quyết định dựa trên dữ liệu</li>
<li><strong>Human-AI Collaboration:</strong> Kỹ năng làm việc hiệu quả với AI</li>
<li><strong>Ethical AI Leadership:</strong> Lãnh đạo có trách nhiệm trong kỷ nguyên AI</li>
</ol>

<h3>Thách thức và Cơ hội</h3>
<p>Việc tích hợp AI vào giáo dục kinh doanh mang lại cả thách thức và cơ hội lớn. Các tổ chức giáo dục cần cân bằng giữa công nghệ và yếu tố con người để tạo ra những lãnh đạo thực sự của tương lai.</p>'
    
    ELSE content
END
WHERE content IS NULL OR content = '';