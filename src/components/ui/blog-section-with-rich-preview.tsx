import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blogService, BlogPostWithAuthor, truncateText } from "@/services/blogService";
import { useNavigate } from "react-router-dom";

// Blog data with AI/FSB relevant content
const initialBlogPosts = [
  {
    id: 1,
    title: "AI-Powered HRM: Transforming Workforce Management in 2025",
    excerpt: "Discover how artificial intelligence is revolutionizing human resource management, from recruitment automation to employee engagement analytics. Learn the latest trends and best practices for implementing AI in your HR strategy.",
    category: "AI & Công nghệ",
    author: {
      name: "Dr. Nguyễn Văn An",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      initials: "NA"
    },
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    date: "2025-01-15",
    featured: true
  },
  {
    id: 2,
    title: "Building Effective AI Training Programs for Business Leaders",
    excerpt: "A comprehensive guide to designing and implementing AI literacy programs for executives and managers. Includes practical frameworks and real-world case studies from successful organizations.",
    category: "Giáo dục",
    author: {
      name: "Lê Thị Minh",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      initials: "LM"
    },
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=300&fit=crop",
    date: "2025-01-12"
  },
  {
    id: 3,
    title: "The Future of Business Education: Integrating AI into MBA Programs",
    excerpt: "How top business schools are incorporating artificial intelligence into their curricula. Explore innovative teaching methods and the skills future business leaders need to succeed in an AI-driven world.",
    category: "Giáo dục Kinh doanh",
    author: {
      name: "Prof. Trần Đức Huy",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      initials: "TH"
    },
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=300&fit=crop",
    date: "2025-01-10"
  }
];

interface BlogProps {
  isAdmin?: boolean;
}

function Blog({ isAdmin = false }: BlogProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPostWithAuthor[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPostWithAuthor | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: {
      name: '',
      avatar: '',
      initials: ''
    },
    image: '',
    featured: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load blog posts from Supabase on component mount
  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const posts = await blogService.getAllBlogPosts();
      setBlogPosts(posts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách bài viết.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  const handleEditPost = (post: BlogPostWithAuthor) => {
    setEditingPost({...post});
  };

  const handleSavePost = async () => {
    if (!editingPost) return;
    
    // Validate required fields
    if (!editingPost.title.trim() || !editingPost.excerpt.trim() || !editingPost.category || !editingPost.author.name.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ tiêu đề, mô tả, danh mục và tên tác giả.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const updatedPost = await blogService.updateBlogPost(editingPost.id, {
        title: editingPost.title,
        excerpt: editingPost.excerpt,
        content: editingPost.content,
        category: editingPost.category,
        author: {
          name: editingPost.author.name.trim(),
          avatar: editingPost.author.avatar,
          initials: editingPost.author.name.trim().split(' ').map(n => n[0]).join('').toUpperCase()
        },
        image: editingPost.image,
        featured: editingPost.featured
      });

      setBlogPosts(posts => posts.map(post => 
        post.id === editingPost.id ? updatedPost : post
      ));
      setEditingPost(null);
      toast({
        title: "Bài viết đã được cập nhật",
        description: "Thay đổi đã được lưu thành công.",
      });
    } catch (error) {
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật bài viết.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      setSaving(true);
      await blogService.deleteBlogPost(postId);
      setBlogPosts(posts => posts.filter(post => post.id !== postId));
      toast({
        title: "Bài viết đã được xóa",
        description: "Bài viết đã được xóa khỏi blog.",
      });
    } catch (error) {
      toast({
        title: "Lỗi xóa bài viết",
        description: "Không thể xóa bài viết.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPost = async () => {
    // Validate required fields
    if (!newPost.title.trim() || !newPost.excerpt.trim() || !newPost.category || !newPost.author.name.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ tiêu đề, mô tả, danh mục và tên tác giả.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const postToAdd = {
        title: newPost.title,
        excerpt: newPost.excerpt,
        content: newPost.content || null,
        category: newPost.category,
        author: {
          name: newPost.author.name.trim(),
          avatar: newPost.author.avatar || null,
          initials: newPost.author.name.trim().split(' ').map(n => n[0]).join('').toUpperCase()
        },
        image: newPost.image || null,
        featured: newPost.featured
      };
      
      const createdPost = await blogService.createBlogPost(postToAdd);
      setBlogPosts(posts => [createdPost, ...posts]);
      setNewPost({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        author: {
          name: '',
          avatar: '',
          initials: ''
        },
        image: '',
        featured: false
      });
      setIsAddingNew(false);
      toast({
        title: "Bài viết mới đã được thêm",
        description: "Bài viết đã được thêm vào blog thành công.",
      });
    } catch (error) {
      toast({
        title: "Lỗi thêm bài viết",
        description: "Không thể thêm bài viết.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-20 lg:py-40 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20 lg:py-40 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto flex flex-col gap-14">
        <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
          <div className="flex flex-col gap-4">
            <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Bài Viết Mới Nhất
            </h4>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Cập nhật xu hướng mới nhất về AI, giáo dục kinh doanh và chuyển đổi số từ giảng viên và chuyên gia hàng đầu.
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm Bài Viết
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Thêm Bài Viết Mới</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tiêu đề bài viết *</label>
                    <Input
                      placeholder="Tiêu đề bài viết"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mô tả bài viết *</label>
                    <Textarea
                      placeholder="Mô tả bài viết (nhấn Enter để xuống dòng)"
                      value={newPost.excerpt}
                      onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                      rows={3}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sử dụng Enter để xuống dòng, định dạng sẽ được giữ nguyên khi hiển thị</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nội dung đầy đủ</label>
                    <div className="mt-1">
                      <RichTextEditor
                        value={newPost.content}
                        onChange={(content) => setNewPost({...newPost, content})}
                        placeholder="Nhập nội dung đầy đủ của bài viết..."
                        rows={8}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Sử dụng thanh công cụ để định dạng văn bản: đậm, nghiêng, căn chỉnh, danh sách...</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Danh mục *</label>
                    <Select onValueChange={(value) => setNewPost({...newPost, category: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AI & Công nghệ">AI & Công nghệ</SelectItem>
                        <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                        <SelectItem value="Giáo dục Kinh doanh">Giáo dục Kinh doanh</SelectItem>
                        <SelectItem value="Chuyển đổi Số">Chuyển đổi Số</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tên tác giả *</label>
                    <Input
                      placeholder="Tên tác giả"
                      value={newPost.author.name}
                      onChange={(e) => setNewPost({...newPost, author: {...newPost.author, name: e.target.value}})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">URL hình ảnh</label>
                    <Input
                      placeholder="URL hình ảnh"
                      value={newPost.image}
                      onChange={(e) => setNewPost({...newPost, image: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">URL avatar tác giả</label>
                    <Input
                      placeholder="URL avatar tác giả"
                      value={newPost.author.avatar}
                      onChange={(e) => setNewPost({...newPost, author: {...newPost.author, avatar: e.target.value}})}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newPost.featured}
                      onChange={(e) => setNewPost({...newPost, featured: e.target.checked})}
                    />
                    <label htmlFor="featured">Bài viết nổi bật</label>
                  </div>
                  </div>
                </ScrollArea>
                <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddPost} className="flex-1" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Đang thêm...
                        </>
                      ) : (
                        'Thêm Bài Viết'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingNew(false)} disabled={saving}>
                      Hủy
                    </Button>
                  </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Featured Article */}
          {featuredPost && (
            <div 
              className="flex flex-col gap-4 hover:opacity-75 cursor-pointer md:col-span-2 group"
              onClick={() => navigate(`/blog/${featuredPost.id}`)}
            >
              <div 
                className="bg-muted rounded-xl aspect-video overflow-hidden relative transition-transform group-hover:scale-[1.02]"
                style={{
                  backgroundImage: `url(${featuredPost.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm">
                    Nổi bật
                  </Badge>
                </div>
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPost(featuredPost);
                      }}
                      className="bg-white/90 text-black backdrop-blur-sm hover:bg-white"
                      disabled={saving}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(featuredPost.id);
                      }}
                      className="bg-red-500/90 hover:bg-red-600 backdrop-blur-sm"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-4 items-center">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {featuredPost.category}
                </Badge>
                <p className="flex flex-row gap-2 text-sm items-center">
                  <span className="text-muted-foreground">Bởi</span>{" "}
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={featuredPost.author.avatar} />
                    <AvatarFallback>{featuredPost.author.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{featuredPost.author.name}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{new Date(featuredPost.date).toLocaleDateString('vi-VN')}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="max-w-3xl text-4xl tracking-tight font-semibold leading-tight">
                  {featuredPost.title}
                </h3>
                <p className="max-w-3xl text-muted-foreground text-base leading-relaxed whitespace-pre-wrap">
                  {truncateText(featuredPost.excerpt, 150)}
                </p>
                <span className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                  Đọc thêm →
                </span>
              </div>
            </div>
          )}

          {/* Regular Articles */}
          {regularPosts.map((post) => (
            <div 
              key={post.id} 
              className="flex flex-col gap-4 hover:opacity-75 cursor-pointer group"
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              <div 
                className="bg-muted rounded-xl aspect-video overflow-hidden relative transition-transform group-hover:scale-[1.02]"
                style={{
                  backgroundImage: `url(${post.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="w-full h-full bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPost(post);
                      }}
                      className="bg-white/90 text-black backdrop-blur-sm hover:bg-white"
                      disabled={saving}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post.id);
                      }}
                      className="bg-red-500/90 hover:bg-red-600 backdrop-blur-sm"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-4 items-center">
                <Badge variant="outline" className="border-purple-200 text-purple-700">
                  {post.category}
                </Badge>
                <p className="flex flex-row gap-2 text-sm items-center">
                  <span className="text-muted-foreground">Bởi</span>{" "}
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.author.name}</span>
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="max-w-3xl text-2xl tracking-tight font-semibold leading-tight">
                  {post.title}
                </h3>
                <p className="max-w-3xl text-muted-foreground text-base leading-relaxed whitespace-pre-wrap">
                  {truncateText(post.excerpt, 120)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                    Đọc thêm →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-4 pt-8 border-t">
          <h5 className="text-xl font-semibold text-center">
            Muốn cập nhật những kiến thức mới nhất từ chúng tôi?
          </h5>
          <p className="text-muted-foreground text-center max-w-lg">
            Đăng ký nhận bản tin để nhận những bài viết mới nhất về AI, giáo dục kinh doanh và chuyển đổi số.
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Đăng Ký Ngay
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Xem Tất Cả Bài Viết
            </button>
          </div>
        </div>

        {/* Edit Post Dialog */}
        {isAdmin && editingPost && (
          <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Chỉnh Sửa Bài Viết</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tiêu đề bài viết *</label>
                  <Input
                    placeholder="Tiêu đề bài viết"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Mô tả bài viết *</label>
                  <Textarea
                    placeholder="Mô tả bài viết (nhấn Enter để xuống dòng)"
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sử dụng Enter để xuống dòng, định dạng sẽ được giữ nguyên khi hiển thị</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Nội dung đầy đủ</label>
                  <div className="mt-1">
                    <RichTextEditor
                      value={editingPost.content || ''}
                      onChange={(content) => setEditingPost({...editingPost, content})}
                      placeholder="Nhập nội dung đầy đủ của bài viết..."
                      rows={8}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Sử dụng thanh công cụ để định dạng văn bản: đậm, nghiêng, căn chỉnh, danh sách...</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Danh mục *</label>
                  <Select value={editingPost.category} onValueChange={(value) => setEditingPost({...editingPost, category: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI & Công nghệ">AI & Công nghệ</SelectItem>
                      <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                      <SelectItem value="Giáo dục Kinh doanh">Giáo dục Kinh doanh</SelectItem>
                      <SelectItem value="Chuyển đổi Số">Chuyển đổi Số</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tên tác giả *</label>
                  <Input
                    placeholder="Tên tác giả"
                    value={editingPost.author.name}
                    onChange={(e) => setEditingPost({...editingPost, author: {...editingPost.author, name: e.target.value}})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">URL hình ảnh</label>
                  <Input
                    placeholder="URL hình ảnh"
                    value={editingPost.image}
                    onChange={(e) => setEditingPost({...editingPost, image: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">URL avatar tác giả</label>
                  <Input
                    placeholder="URL avatar tác giả"
                    value={editingPost.author.avatar}
                    onChange={(e) => setEditingPost({...editingPost, author: {...editingPost.author, avatar: e.target.value}})}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editFeatured"
                    checked={editingPost.featured}
                    onChange={(e) => setEditingPost({...editingPost, featured: e.target.checked})}
                  />
                  <label htmlFor="editFeatured">Bài viết nổi bật</label>
                </div>
                </div>
              </ScrollArea>
              <div className="flex gap-2 pt-4">
                  <Button onClick={handleSavePost} className="flex-1" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu Thay Đổi'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPost(null)} disabled={saving}>
                    Hủy
                  </Button>
                </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export { Blog };