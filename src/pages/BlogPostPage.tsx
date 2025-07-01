import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { blogService, BlogPostWithAuthor } from "@/services/blogService";
import logoFSB from "/logo_FSB_new.png";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPostWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.email === 'nghialc2@fsb.edu.vn';


  useEffect(() => {
    if (id) {
      loadBlogPost(parseInt(id));
    }
  }, [id]);


  const loadBlogPost = async (postId: number) => {
    try {
      setLoading(true);
      const posts = await blogService.getAllBlogPosts();
      const foundPost = posts.find(p => p.id === postId);
      if (foundPost) {
        setPost(foundPost);
      } else {
        toast({
          title: "Không tìm thấy bài viết",
          description: "Bài viết này không tồn tại hoặc đã bị xóa.",
          variant: "destructive",
        });
        navigate('/blog');
      }
    } catch (error) {
      toast({
        title: "Lỗi tải bài viết",
        description: "Không thể tải nội dung bài viết.",
        variant: "destructive",
      });
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      setDeleting(true);
      await blogService.deleteBlogPost(post.id);
      toast({
        title: "Bài viết đã được xóa",
        description: "Bài viết đã được xóa thành công.",
      });
      navigate('/blog');
    } catch (error) {
      toast({
        title: "Lỗi xóa bài viết",
        description: "Không thể xóa bài viết.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="w-full bg-white/95 backdrop-blur-sm shadow-sm py-4 px-6 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/blog" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Quay lại Blog</span>
            </Link>
            <img src={logoFSB} alt="FSB Logo" className="h-16" />
            <div className="w-32"></div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="w-full bg-white/95 backdrop-blur-sm shadow-sm py-4 px-6 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/blog" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Quay lại Blog</span>
            </Link>
            <img src={logoFSB} alt="FSB Logo" className="h-16" />
            <div className="w-32"></div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h1>
            <p className="text-gray-600 mb-4">Bài viết này không tồn tại hoặc đã bị xóa.</p>
            <Link to="/blog" className="text-blue-600 hover:text-blue-800">Quay lại trang Blog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-sm shadow-sm py-4 px-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/blog" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Quay lại Blog</span>
          </Link>
          <img src={logoFSB} alt="FSB Logo" className="h-16" />
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/blog/edit/${post.id}`)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Image */}
      {post.image && (
        <div className="relative h-96 overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {post.featured && (
            <div className="absolute top-6 left-6">
              <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm">
                Nổi bật
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Tag className="h-3 w-3 mr-1" />
                {post.category}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.date).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar || undefined} />
                <AvatarFallback>{post.author.initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{post.author.name}</span>
                </div>
                <p className="text-sm text-gray-600">Tác giả</p>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-xl leading-relaxed text-gray-700 mb-8" style={{ whiteSpace: 'pre-wrap' }}>
              {post.excerpt}
            </div>
            
            {/* Full Content */}
            <div className="space-y-6 text-gray-800 leading-relaxed">
              {post.content ? (
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-7 prose-p:mb-4 prose-strong:text-gray-900 prose-em:text-gray-700 prose-ul:space-y-2 prose-ol:space-y-2 prose-li:text-gray-800"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800">
                    📝 <strong>Nội dung đầy đủ chưa được thêm.</strong>
                  </p>
                  <p className="text-yellow-700 mt-2">
                    Hiện tại chỉ có phần mô tả ngắn của bài viết. Admin có thể chỉnh sửa bài viết để thêm nội dung đầy đủ.
                  </p>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/blog/edit/${post.id}`)}
                      className="mt-3 text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Thêm nội dung
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Link 
                to="/blog"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại trang Blog
              </Link>
              
              <div className="text-sm text-gray-500">
                Cập nhật lần cuối: {new Date(post.date).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <img src={logoFSB} alt="FSB Logo" className="h-16 mx-auto mb-4 brightness-0 invert" />
            <p className="text-gray-400">
              © 2025 Viện Quản trị và Công nghệ FSB. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}