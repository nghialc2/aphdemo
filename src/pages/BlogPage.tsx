import { Link } from "react-router-dom";
import { Blog } from "@/components/ui/blog-section-with-rich-preview";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Import the logo directly
import logoFSB from "/logo_FSB_new.png";

export default function BlogPage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin (nghialc2@fsb.edu.vn)
  const checkAdminStatus = () => {
    return user?.email === 'nghialc2@fsb.edu.vn';
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with FSB Logo and Navigation */}
      <header className="w-full bg-white/95 backdrop-blur-sm shadow-sm py-4 px-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Về trang chủ</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <img src={logoFSB} alt="FSB Logo" className="h-16" />
          </div>

          <div className="flex items-center gap-4 w-32 justify-end">
            {user ? (
              checkAdminStatus() ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Admin</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </Button>
              )
            ) : (
              <Button
                onClick={signInWithGoogle}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                Admin Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Trung Tâm Tri Thức FSB
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Kiến thức chuyên sâu, nghiên cứu và tư duy lãnh đạo từ Viện Quản trị và Công nghệ FSB
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                AI & Công nghệ
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Giáo dục Kinh doanh
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                Chuyển đổi Số
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Blog Content */}
      <main className="flex-1">
        <Blog isAdmin={checkAdminStatus()} />
      </main>

      {/* Additional Sections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Xuất Sắc Học Thuật</h3>
              <p className="text-gray-600">
                Kiến thức dựa trên nghiên cứu từ giảng viên và chuyên gia hàng đầu
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đổi Mới AI</h3>
              <p className="text-gray-600">
                Phát triển mới nhất trong trí tuệ nhân tạo và ứng dụng kinh doanh
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sẵn Sàng Tương Lai</h3>
              <p className="text-gray-600">
                Chuẩn bị lãnh đạo cho nền kinh tế số và tương lai định hướng AI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <img src={logoFSB} alt="FSB Logo" className="h-16 mb-4 brightness-0 invert" />
              <p className="text-gray-400 mb-4 max-w-md">
                Viện Quản trị và Công nghệ FSB - Dẫn đầu tương lai giáo dục kinh doanh với tích hợp AI và chuyển đổi số.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  YouTube
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Chương Trình</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">SEMBA</a></li>
                <li><a href="#" className="hover:text-white transition-colors">MSE-AI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">APH</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AIA</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tài Nguyên</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nghiên cứu</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tình huống thực tế</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Viện Quản trị và Công nghệ FSB. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}