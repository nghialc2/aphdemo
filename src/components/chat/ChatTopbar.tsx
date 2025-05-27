
import { Button } from "@/components/ui/button";
import { GitCompareArrows, History, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ModelSelector from "./ModelSelector";
import ComparisonModelSelectors from "./ComparisonModelSelectors";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatTopbarProps {
  showContextPrompt: boolean;
  setShowContextPrompt: (show: boolean) => void;
  isCompareMode: boolean;
  handleToggleCompareMode: () => void;
}

const ChatTopbar = ({
  showContextPrompt,
  setShowContextPrompt,
  isCompareMode,
  handleToggleCompareMode,
}: ChatTopbarProps) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      {/* Main topbar with title and right-side controls */}
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="font-medium text-fpt-orange">Chat</h2>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Context Button */}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContextPrompt(!showContextPrompt)}
                className="h-8 px-2 sm:px-3"
              >
                <Settings className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Context</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px]">
              <p>{showContextPrompt ? "Hide Context" : "Set Context"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Compare Mode Button */}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCompareMode}
                className={`h-8 px-2 sm:px-3 ${isCompareMode ? "bg-blue-100 text-blue-800" : ""}`}
              >
                <GitCompareArrows className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{isCompareMode ? "Exit" : "Compare"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px]">
              <p>{isCompareMode ? "Exit Compare Mode" : "Enter Compare Mode"}</p>
            </TooltipContent>
          </Tooltip>

          {/* History Button */}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <SidebarTrigger className="h-8 px-2 sm:px-3">
                <History className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">History</span>
              </SidebarTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px]">
              <p>View Chat History</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      {/* Model selector section - appears below the main topbar */}
      <div className="px-4 py-1 border-t border-gray-100 flex justify-end">
        {isCompareMode ? <ComparisonModelSelectors /> : <ModelSelector />}
      </div>
    </div>
  );
};

export default ChatTopbar;
