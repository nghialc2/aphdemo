import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Eye, EyeOff, Plus, Shield, Key, Trash2, Edit, Clock, AlertTriangle } from "lucide-react";

interface SecretNote {
  id: string;
  title: string;
  content: string;
  category: "confidential" | "top-secret" | "restricted" | "internal";
  isEncrypted: boolean;
  createdAt: Date;
  lastModified: Date;
  accessLevel: "admin" | "manager" | "user";
  tags: string[];
  isLocked: boolean;
}

export default function SecretNoteDashboard() {
  const [notes, setNotes] = useState<SecretNote[]>([
    {
      id: "1",
      title: "Strategic Partnership Negotiations",
      content: "█████████ ████ ███████ ████████ █████████",
      category: "top-secret",
      isEncrypted: true,
      createdAt: new Date("2024-12-15"),
      lastModified: new Date("2024-12-20"),
      accessLevel: "admin",
      tags: ["partnerships", "negotiations", "strategic"],
      isLocked: true
    },
    {
      id: "2",
      title: "Research & Development Roadmap",
      content: "Key technological developments planned for Q1-Q2 2025...",
      category: "confidential",
      isEncrypted: false,
      createdAt: new Date("2024-12-10"),
      lastModified: new Date("2024-12-18"),
      accessLevel: "manager",
      tags: ["R&D", "roadmap", "technology"],
      isLocked: false
    },
    {
      id: "3",
      title: "Competitive Intelligence Report",
      content: "Analysis of competitor activities and market positioning...",
      category: "restricted",
      isEncrypted: true,
      createdAt: new Date("2024-12-05"),
      lastModified: new Date("2024-12-15"),
      accessLevel: "manager",
      tags: ["intelligence", "competitors", "market"],
      isLocked: true
    },
    {
      id: "4",
      title: "Internal Process Optimization",
      content: "Recommendations for improving internal workflows and efficiency metrics...",
      category: "internal",
      isEncrypted: false,
      createdAt: new Date("2024-12-01"),
      lastModified: new Date("2024-12-12"),
      accessLevel: "user",
      tags: ["process", "optimization", "internal"],
      isLocked: false
    }
  ]);

  const [selectedNote, setSelectedNote] = useState<SecretNote | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [unlockedNotes, setUnlockedNotes] = useState<Set<string>>(new Set());
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "internal" as SecretNote["category"],
    accessLevel: "user" as SecretNote["accessLevel"],
    tags: "",
    isEncrypted: false
  });

  const getCategoryColor = (category: SecretNote["category"]) => {
    const colors = {
      "top-secret": "bg-red-100 text-red-800 border-red-200",
      "confidential": "bg-orange-100 text-orange-800 border-orange-200",
      "restricted": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "internal": "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[category];
  };

  const getAccessLevelColor = (level: SecretNote["accessLevel"]) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      manager: "bg-green-100 text-green-800",
      user: "bg-gray-100 text-gray-800"
    };
    return colors[level];
  };

  const getCategoryIcon = (category: SecretNote["category"]) => {
    switch (category) {
      case "top-secret":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "confidential":
        return <Shield className="w-4 h-4 text-orange-600" />;
      case "restricted":
        return <Lock className="w-4 h-4 text-yellow-600" />;
      case "internal":
        return <Eye className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleUnlockNote = (noteId: string, password: string) => {
    // Simulate password verification
    if (password === "admin123" || password === "secure") {
      setUnlockedNotes(prev => new Set([...prev, noteId]));
      setShowPasswordDialog(false);
    } else {
      alert("Incorrect password");
    }
  };

  const addNote = () => {
    const note: SecretNote = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      isEncrypted: newNote.isEncrypted,
      createdAt: new Date(),
      lastModified: new Date(),
      accessLevel: newNote.accessLevel,
      tags: newNote.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      isLocked: newNote.isEncrypted
    };
    setNotes([note, ...notes]);
    setNewNote({
      title: "",
      content: "",
      category: "internal",
      accessLevel: "user",
      tags: "",
      isEncrypted: false
    });
    setShowAddNote(false);
  };

  const isNoteAccessible = (note: SecretNote) => {
    if (!note.isLocked) return true;
    return unlockedNotes.has(note.id);
  };

  const getVisibleContent = (note: SecretNote) => {
    if (isNoteAccessible(note)) {
      return note.content;
    }
    return note.isEncrypted ? "█████████ ████ ███████ ████████ █████████" : note.content;
  };

  const categoryStats = {
    "top-secret": notes.filter(n => n.category === "top-secret").length,
    "confidential": notes.filter(n => n.category === "confidential").length,
    "restricted": notes.filter(n => n.category === "restricted").length,
    "internal": notes.filter(n => n.category === "internal").length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Secret Note System</h1>
            <p className="text-gray-600 mt-2">Secure note-taking with encryption and access controls</p>
          </div>
          <Button onClick={() => setShowAddNote(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Secret Note
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Top Secret</p>
                  <p className="text-2xl font-bold text-red-700">{categoryStats["top-secret"]}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Confidential</p>
                  <p className="text-2xl font-bold text-orange-700">{categoryStats["confidential"]}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Restricted</p>
                  <p className="text-2xl font-bold text-yellow-700">{categoryStats["restricted"]}</p>
                </div>
                <Lock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Internal</p>
                  <p className="text-2xl font-bold text-blue-700">{categoryStats["internal"]}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <Card key={note.id} className={`${getCategoryColor(note.category)} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(note.category)}
                    <CardTitle className="text-base">{note.title}</CardTitle>
                  </div>
                  {note.isLocked && !isNoteAccessible(note) && (
                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setSelectedNote(note)}
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Unlock Secret Note</DialogTitle>
                          <DialogDescription>
                            Enter password to access "{selectedNote?.title}"
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input 
                            type="password" 
                            placeholder="Enter password"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && selectedNote) {
                                handleUnlockNote(selectedNote.id, e.currentTarget.value);
                              }
                            }}
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => {
                              const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                              if (selectedNote && input) {
                                handleUnlockNote(selectedNote.id, input.value);
                              }
                            }}>
                              Unlock
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(note.category)}>{note.category}</Badge>
                  <Badge className={getAccessLevelColor(note.accessLevel)}>{note.accessLevel}</Badge>
                  {note.isEncrypted && <Badge variant="outline"><Key className="w-3 h-3 mr-1" />Encrypted</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {getVisibleContent(note)}
                  </p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {note.lastModified.toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Note Dialog */}
        <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Secret Note</DialogTitle>
              <DialogDescription>
                Create a new secure note with encryption and access controls
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <Textarea
                placeholder="Note content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={6}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value as SecretNote["category"] })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="internal">Internal</option>
                  <option value="restricted">Restricted</option>
                  <option value="confidential">Confidential</option>
                  <option value="top-secret">Top Secret</option>
                </select>
                <select
                  value={newNote.accessLevel}
                  onChange={(e) => setNewNote({ ...newNote, accessLevel: e.target.value as SecretNote["accessLevel"] })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Input
                placeholder="Tags (comma separated)"
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="encrypt"
                  checked={newNote.isEncrypted}
                  onChange={(e) => setNewNote({ ...newNote, isEncrypted: e.target.checked })}
                />
                <label htmlFor="encrypt" className="text-sm">Enable encryption and password protection</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddNote(false)}>Cancel</Button>
                <Button onClick={addNote}>Create Secret Note</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}