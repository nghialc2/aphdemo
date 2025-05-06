
import { useSession } from "@/context/SessionContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

const ModelSelector = () => {
  const { availableModels, selectedModel, selectModel } = useSession();
  
  return (
    <div className="flex items-center">
      <Select
        value={selectedModel.id}
        onValueChange={selectModel}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={model.id} value={model.id} className="flex items-center justify-between">
              <span>{model.name}</span>
              {model.tags && model.tags.length > 0 && (
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {model.tags[0]}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-2 text-gray-500 hover:text-gray-700">
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center" className="max-w-xs">
          <p>Mỗi model sẽ kết nối đến một endpoint n8n riêng biệt</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ModelSelector;
