
/// <reference types="vite/client" />

// Social media embed widgets
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
    onGitHubUploadComplete?: (data: any) => void;
  }
}
