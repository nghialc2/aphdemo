
import { Button } from "@/components/ui/button";
import { GitCompareArrows, History, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ModelSelector from "./ModelSelector";
import ComparisonModelSelectors from "./ComparisonModelSelectors";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
      <div className="flex items-center justify-between px-2 py-1">
        <h2 className="text-sm font-medium text-fpt-orange">Chat</h2>
        
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            {/* Context Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContextPrompt(!showContextPrompt)}
                  className="h-7 px-1.5"
                >
                  <Settings className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">Context</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p>{showContextPrompt ? "Hide Context" : "Set Context"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Compare Mode Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleCompareMode}
                  className={`h-7 px-1.5 ${isCompareMode ? "bg-blue-100 text-blue-800" : ""}`}
                >
                  <GitCompareArrows className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">{isCompareMode ? "Exit" : "Compare"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p>{isCompareMode ? "Exit Compare Mode" : "Enter Compare Mode"}</p>
              </TooltipContent>
            </Tooltip>

            {/* History Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="h-7 px-1.5">
                  <History className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">History</span>
                </SidebarTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p>View Chat History</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Model selector section - appears below the main topbar */}
      <div className="px-2 py-1 border-t border-gray-100 flex justify-end">
        {isCompareMode ? <ComparisonModelSelectors /> : <ModelSelector />}
      </div>
    </div>
  );
};

export default ChatTopbar;
