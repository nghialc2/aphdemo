
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContextPromptProps {
  onSave: (prompt: string) => void;
}

const ContextPrompt = ({ onSave }: ContextPromptProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const { toast } = useToast();

  const handleSave = () => {
    onSave(prompt);
    toast({
      title: "Context saved",
      description: "Your context has been saved and applied to the conversation",
    });
  };

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
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px] text-sm"
      />
      <Button 
        onClick={handleSave} 
        className="w-full"
        variant="outline"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Context
      </Button>
    </div>
  );
};

export default ContextPrompt;
