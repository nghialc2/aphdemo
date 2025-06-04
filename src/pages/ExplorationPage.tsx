
import { CircularRevealHeading } from "@/components/ui/circular-reveal-heading";
import { Link } from "react-router-dom";
import { useState } from "react";

// Import the logo directly
import logoFSB from "/logo_FSB_new.png";
import CEO from "/CEO.jpg";
import CIO from "/CIO.jpg";
import CTO from "/CTO.jpg";

// FPT brand colors
const fptBlue = "#2D4B9A";
const fptOrange = "#F37021";
const fptGreen = "#7BC144";
const burgundy = "#800020"; // Burgundy/maroon color

const items = [
    {
        text: "AI-Informed Business Leaders (CEO track)",
        description: "Những nhà lãnh đạo hiểu biết về AI, có khả năng ứng dụng AI cho các việc ra quyết định và các tác vụ hàng ngày\n\n- Ứng dụng AI chủ yếu:\n   • Các mô hình LLM\n   • AI Assistant\n\n- Các chương trình đào tạo tại FSB:\n   • SEMBA\n   • AIS\n   • GMM\n   • MicroMBA",
        color: fptBlue,
        image: CEO
    },
    {
        text: "AI Practitioner/Integrator (CIO track)",
        description: "Những chuyên gia có khả năng triển khai và tích hợp các công nghệ AI vào hoạt động kinh doanh và quản trị. Có năng lực lựa chọn, điều chỉnh và tối ưu hóa các giải pháp AI trong môi trường thực tiễn.\n\n- Ứng dụng AI chủ yếu:\n   • Các giải pháp AI tích hợp\n   • Tự động hóa quy trình (Automation)\n   • AI Agents\n   • Data-driven model\n\n- Các chương trình đào tạo tại FSB:\n   • MSE-BA\n   • AIA\n   • APH",
        color: fptOrange,
        image: CIO
    },
    {
        text: "AI Specialist/Expert (CTO track)",
        description: "Các chuyên gia hàng đầu về công nghệ AI, nắm vững kiến thức chuyên môn sâu về thuật toán, mô hình AI, và khả năng nghiên cứu phát triển các giải pháp AI mới trong tương lai\n\n- Ứng dụng AI chủ yếu:\n   • Nghiên cứu phát triển thuật toán mới\n   • Tối ưu hóa các mô hình AI tiên tiến:\n      * Machine Learning\n      * Deep Learning\n      * NLP\n      * Computer Vision\n\n- Các chương trình đào tạo tại FSB:\n   • MSE-AI",
        color: fptGreen,
        image: CTO
    }
];

export default function ExplorationPage() {
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  
  const toggleProgramDropdown = () => {
    setProgramDropdownOpen(!programDropdownOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Header with FSB Logo and Navigation */}
      <header className="w-full bg-white shadow-sm py-2 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <img src={logoFSB} alt="FSB Logo" className="h-16" />
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex items-center space-x-6">
            <Link to="/blog" className="text-gray-700 hover:text-fptBlue font-medium">Blog</Link>
            
            {/* Program dropdown */}
            <div className="relative">
              <button 
                onClick={toggleProgramDropdown}
                className="text-gray-700 hover:text-fptBlue font-medium flex items-center"
              >
                Program Lab
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="ml-1"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {programDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <Link 
                    to="/login?redirect=app" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProgramDropdownOpen(false)}
                  >
                    APH
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 flex flex-col">
        <div className="text-center mb-2 mt-4">
          <h1 className="text-3xl font-bold text-gray-900">AI-Integrated Career Path for Leaders</h1>
        </div>

        <div className="flex justify-center mt-10 mb-16">
          <CircularRevealHeading
            items={items}
            centerText={
              <div className="text-2xl font-bold" style={{ color: burgundy }}>
                AI Road Map
              </div>
            }
            size="lg"
          />
        </div>
      </main>
      
      {/* Copyright text - fixed at the bottom */}
      <div className="w-full text-center py-4 text-gray-500 text-sm absolute bottom-0 left-0 right-0 bg-gray-50">
        © 2025 Designed by NghiaLC2. All rights reserved.
      </div>
    </div>
  );
} 
