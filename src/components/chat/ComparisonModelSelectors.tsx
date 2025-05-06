
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ComparisonModelSelectors = () => {
  const { availableModels } = useSession();
  const { leftModelId, rightModelId, setLeftModel, setRightModel } = useCompare();
  
  return (
    <div className="flex items-center space-x-2">
      <Select value={leftModelId} onValueChange={setLeftModel}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Left model" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={`left-${model.id}`} value={model.id} className="flex items-center justify-between">
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
      
      <span className="text-gray-400">vs</span>
      
      <Select value={rightModelId} onValueChange={setRightModel}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Right model" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={`right-${model.id}`} value={model.id} className="flex items-center justify-between">
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

export default ComparisonModelSelectors;
