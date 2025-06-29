// GitHub Upload Service
// This service handles uploading files to GitHub repository

interface GitHubUploadConfig {
  owner: string;
  repo: string;
  token?: string;
}

interface UploadResult {
  success: boolean;
  fileName: string;
  githubUrl: string;
  rawUrl: string;
  fallbackUrl: string;
  error?: string;
}

const DEFAULT_CONFIG: GitHubUploadConfig = {
  owner: 'nghialc2',
  repo: 'aphdemo',
  // In production, get token from environment variables or secure storage
  // token: process.env.GITHUB_TOKEN
};

export class GitHubUploadService {
  private config: GitHubUploadConfig;

  constructor(config: Partial<GitHubUploadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async deleteFile(fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const path = `public/${fileName}`;
      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      
      
      if (!githubToken) {
        console.error('❌ No GitHub token found');
        return { success: false, error: 'GitHub token not found' };
      }

      this.config.token = githubToken;

      // First, get the file SHA which is required for deletion
      const getResponse = await fetch(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (!getResponse.ok) {
        if (getResponse.status === 404) {
          return { success: false, error: 'File not found in repository' };
        }
        const errorText = await getResponse.text();
        throw new Error(`Failed to get file info: ${getResponse.statusText}`);
      }

      const fileInfo = await getResponse.json();
      const sha = fileInfo.sha;

      // Delete the file
      const deleteResponse = await fetch(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `Delete PDF: ${fileName}`,
          sha: sha,
          branch: 'main'
        })
      });

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(`GitHub delete error (${deleteResponse.status}): ${errorData.message || deleteResponse.statusText}`);
      }

      console.log('✅ File successfully deleted from GitHub');
      return { success: true };

    } catch (error) {
      console.error('❌ GitHub delete failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown delete error' 
      };
    }
  }

  async uploadFile(file: File, targetPath?: string): Promise<UploadResult> {
    try {
      // Generate safe filename with timestamp
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = targetPath || `${timestamp}_${safeFileName}`;
      const path = `public/${fileName}`;

      // Create blob URL for immediate viewing - this always works
      const localUrl = URL.createObjectURL(file);
      console.log('✅ Created local blob URL for immediate viewing:', localUrl);

      // Generate GitHub URLs for potential future use
      const githubUrl = `https://github.com/${this.config.owner}/${this.config.repo}/blob/main/${path}`;
      const rawUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/main/${path}`;
      const fallbackUrl = `/${fileName}`;

      // Try real GitHub API upload with environment token (but don't block on it)
      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      
      if (githubToken) {
        this.config.token = githubToken;
        
        // Upload to GitHub in background (don't await)
        this.uploadToGitHubInBackground(file, path, fileName);
        
        console.log('🚀 Starting GitHub upload in background. Using blob URL for immediate access.');
        
        // Return blob URL immediately for instant viewing
        return {
          success: true,
          fileName: fileName,
          githubUrl: localUrl, // Use blob URL for immediate access
          rawUrl: localUrl,    // blob URL as primary
          fallbackUrl: ''      // Clear fallback since GitHub URLs are unreliable
        };
      } else {
        console.warn('⚠️ No GitHub token found. Using local blob URL only.');
        console.warn('To enable persistent uploads:');
        console.warn('1. Create a GitHub Personal Access Token with repo permissions');
        console.warn('2. Add VITE_GITHUB_TOKEN to your .env file');
        console.warn('3. Restart the development server');
        
        return {
          success: true,
          fileName: fileName,
          githubUrl: localUrl, 
          rawUrl: localUrl,
          fallbackUrl: localUrl
        };
      }

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        fileName: file.name,
        githubUrl: '',
        rawUrl: '',
        fallbackUrl: '',
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  // Background upload method that doesn't block the UI
  private async uploadToGitHubInBackground(file: File, path: string, fileName: string): Promise<string | null> {
    try {
      // Convert file to base64 for GitHub API
      const base64Content = await this.fileToBase64(file);
      const content = base64Content.split(',')[1]; // Remove data URL prefix
      
      await this.uploadToGitHubAPI(content, path, fileName);
      const githubRawUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/main/${path}`;
      console.log('✅ Successfully uploaded to GitHub in background:', fileName);
      console.log('📎 GitHub raw URL:', githubRawUrl);
      
      // Notify that GitHub upload is complete
      if (window.onGitHubUploadComplete) {
        window.onGitHubUploadComplete(fileName, githubRawUrl);
      }
      
      return githubRawUrl;
    } catch (error) {
      console.error('❌ Background GitHub upload failed:', error);
      return null;
    }
  }

  private async uploadToGitHubAPI(content: string, path: string, fileName: string): Promise<void> {
    if (!this.config.token) {
      throw new Error('GitHub token is required for real uploads');
    }

    try {
      // First, check if file already exists to handle updates
      let sha: string | undefined;
      try {
        const checkResponse = await fetch(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        });
        
        if (checkResponse.ok) {
          const existingFile = await checkResponse.json();
          sha = existingFile.sha;
          console.log('📝 File exists, will update existing file');
        }
      } catch (error) {
        // File doesn't exist, that's fine - we'll create it
        console.log('📄 Creating new file');
      }

      // Upload or update the file
      const uploadBody: any = {
        message: `Upload PDF: ${fileName}`,
        content: content,
        branch: 'main'
      };

      if (sha) {
        uploadBody.sha = sha;
      }

      const response = await fetch(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify(uploadBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(`GitHub API error (${response.status}): ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Successfully uploaded to GitHub:', result.content.download_url);
      
    } catch (error) {
      console.error('GitHub upload failed:', error);
      throw error;
    }
  }

  private async simulateUpload(file: File, fileName: string, path: string): Promise<void> {
    return new Promise((resolve) => {
      console.log('🚀 GitHub Upload Simulation');
      console.log(`📁 File: ${file.name}`);
      console.log(`📊 Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📍 Target: ${path}`);
      console.log(`🔗 Raw URL: https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/main/${path}`);
      console.log('✅ Upload simulated successfully');
      console.log('');
      console.log('📝 To enable real uploads:');
      console.log('1. Create GitHub Personal Access Token with repo permissions');
      console.log('2. Add token to environment variables: VITE_GITHUB_TOKEN');
      console.log('3. Set useRealAPI to true in githubUpload.ts');
      
      // Simulate network delay
      setTimeout(resolve, 1500);
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }


  // Utility method to validate file
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are allowed' };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    // Check filename
    if (file.name.length > 255) {
      return { valid: false, error: 'Filename is too long' };
    }

    return { valid: true };
  }
}

// Export a default instance
export const githubUploadService = new GitHubUploadService();