
import { useSession } from "@/context/SessionContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    </div>
  );
};

export default ModelSelector;
