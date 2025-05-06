
import { Textarea } from "@/components/ui/textarea";

interface ContextPromptProps {
  value: string;
  onChange: (value: string) => void;
}

const ContextPrompt = ({ value, onChange }: ContextPromptProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor="context-prompt" className="text-sm font-medium text-gray-700">
          Context Prompt
        </label>
      </div>
      <Textarea
        id="context-prompt"
        placeholder="Set context for your conversation with the chatbot..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] text-sm"
      />
    </div>
  );
};

export default ContextPrompt;
