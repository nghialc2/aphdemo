import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoordinatesForCountry } from "@/services/mouProcessingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  FileText, 
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Users
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Collaboration {
  id: string;
  universityName: string;
  country: string;
  countryCode: string;
  coordinates: [number, number];
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  mouSignDate?: Date;
  mouExpiryDate?: Date;
  mouStatus?: string;
  collaborationType?: string;
  status: string;
  notes?: string;
  achievements?: string[];
  upcomingActivities?: string[];
  studentsExchanged?: number;
  facultyExchanged?: number;
  jointProjects?: number;
  publicationsProduced?: number;
  mouFileUrl?: string;
  mouFileName?: string;
  mouFileSize?: number;
  mouUploadedAt?: Date;
  extractedBy?: 'manual' | 'ai';
  aiExtractionStatus?: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

interface CollaborationTableProps {
  collaborations: Collaboration[];
  onAdd: (collaboration: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEdit: (id: string, updates: Partial<Collaboration>) => void;
  onDelete: (id: string) => void;
  onUploadMOU: (file: File) => Promise<void>;
  onDownloadMOU: (collaboration: Collaboration) => void;
}

const CollaborationTable: React.FC<CollaborationTableProps> = ({ 
  collaborations, 
  onAdd, 
  onEdit, 
  onDelete,
  onUploadMOU,
  onDownloadMOU
}) => {
  const [adminMode, setAdminMode] = useState<'manual' | 'upload'>('manual');
  const [expandedRows, setExpandedRows] = useState<{[key: string]: boolean}>({});
  const [uploadingMOU, setUploadingMOU] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCollaboration, setNewCollaboration] = useState<Partial<Collaboration>>({
    status: 'active',
    mouStatus: 'active',
    collaborationType: 'research',
    extractedBy: 'manual'
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('pdf')) {
      alert('Please select a PDF file');
      return;
    }

    try {
      setUploadingMOU(file.name);
      await onUploadMOU(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingMOU(null);
      event.target.value = '';
    }
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAddCollaboration = () => {
    if (!newCollaboration.universityName || !newCollaboration.country) {
      alert('Please fill in required fields (University Name and Country)');
      return;
    }

    onAdd({
      ...newCollaboration,
      countryCode: newCollaboration.country?.slice(0, 3).toUpperCase() || 'UNK',
      coordinates: getCoordinatesForCountry(newCollaboration.country || '')
    } as Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>);
    
    setNewCollaboration({
      status: 'active',
      mouStatus: 'active',
      collaborationType: 'research',
      extractedBy: 'manual'
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Admin Mode Toggle */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Settings className="w-5 h-5" />
              Administration Mode
            </CardTitle>
            <div className="flex items-center gap-4">
              <Tabs value={adminMode} onValueChange={(value) => setAdminMode(value as 'manual' | 'upload')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    PDF Upload
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-emerald-700">
              {adminMode === 'manual' ? (
                <p>Fill in collaboration information manually using the form.</p>
              ) : (
                <p>Upload MOU PDF files. AI will automatically extract collaboration details.</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {adminMode === 'upload' ? (
                <>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="mou-upload"
                    disabled={!!uploadingMOU}
                  />
                  <label htmlFor="mou-upload">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer"
                      disabled={!!uploadingMOU}
                      asChild
                    >
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadingMOU ? `Uploading...` : 'Upload PDF'}
                      </span>
                    </Button>
                  </label>
                </>
              ) : (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Partnership
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Partnership</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new international collaboration.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="universityName">University Name *</Label>
                        <Input
                          id="universityName"
                          value={newCollaboration.universityName || ''}
                          onChange={(e) => setNewCollaboration(prev => ({...prev, universityName: e.target.value}))}
                          placeholder="Stanford University"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={newCollaboration.country || ''}
                          onChange={(e) => setNewCollaboration(prev => ({...prev, country: e.target.value}))}
                          placeholder="United States"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={newCollaboration.contactPerson || ''}
                          onChange={(e) => setNewCollaboration(prev => ({...prev, contactPerson: e.target.value}))}
                          placeholder="Dr. John Smith"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={newCollaboration.contactEmail || ''}
                          onChange={(e) => setNewCollaboration(prev => ({...prev, contactEmail: e.target.value}))}
                          placeholder="john.smith@stanford.edu"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          value={newCollaboration.contactPhone || ''}
                          onChange={(e) => setNewCollaboration(prev => ({...prev, contactPhone: e.target.value}))}
                          placeholder="+1-555-123-4567"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="collaborationType">Collaboration Type</Label>
                        <Select value={newCollaboration.collaborationType} onValueChange={(value) => setNewCollaboration(prev => ({...prev, collaborationType: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="research">Research</SelectItem>
                            <SelectItem value="student_exchange">Student Exchange</SelectItem>
                            <SelectItem value="joint_program">Joint Program</SelectItem>
                            <SelectItem value="faculty_exchange">Faculty Exchange</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                            <SelectItem value="dual_degree">Dual Degree</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="studentsExchanged">Students Exchanged</Label>
                        <Input
                          id="studentsExchanged"
                          type="number"
                          value={newCollaboration.studentsExchanged || ''}
                          onChange={(e) => setNewCollaboration(prev => ({...prev, studentsExchanged: parseInt(e.target.value) || 0}))}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="facultyExchanged">Faculty Exchanged</Label>
                        <Input
                          id="facultyExchanged"
                          type="number"
                          value={newCollaboration.facultyExchanged || ''}
                          onChange={(e) => setNewCollaboration(prev => ({...prev, facultyExchanged: parseInt(e.target.value) || 0}))}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newCollaboration.notes || ''}
                          onChange={(e) => setNewCollaboration(prev => ({...prev, notes: e.target.value}))}
                          placeholder="Additional notes about this collaboration..."
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCollaboration} className="bg-emerald-600 hover:bg-emerald-700">
                        Add Partnership
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partnerships Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800">International Partnerships ({collaborations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>MOU File</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborations.map((collab) => (
                <React.Fragment key={collab.id}>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(collab.id)}
                        className="h-6 w-6 p-0"
                      >
                        {expandedRows[collab.id] ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{collab.universityName}</div>
                        {collab.contactPerson && (
                          <div className="text-sm text-gray-500">{collab.contactPerson}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {collab.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {collab.collaborationType?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={collab.status === 'active' ? 'default' : 'secondary'}>
                          {collab.status}
                        </Badge>
                        {collab.extractedBy === 'ai' && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                            🤖 AI
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {collab.studentsExchanged || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {collab.facultyExchanged || 0}
                    </TableCell>
                    <TableCell>
                      {collab.mouFileUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadMOU(collab)}
                          className="flex items-center gap-1 h-7 px-2 text-xs"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">No file</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          onClick={() => onDelete(collab.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row Details */}
                  {expandedRows[collab.id] && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-gray-50 p-0">
                        <div className="p-4 space-y-4">
                          {/* Contact Information */}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Contact Information
                              </h4>
                              <div className="space-y-1 text-sm">
                                {collab.contactEmail && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <a href={`mailto:${collab.contactEmail}`} className="text-blue-600 hover:underline">
                                      {collab.contactEmail}
                                    </a>
                                  </div>
                                )}
                                {collab.contactPhone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <span>{collab.contactPhone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                MOU Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                {collab.mouSignDate && (
                                  <div>Sign Date: {collab.mouSignDate.toLocaleDateString()}</div>
                                )}
                                {collab.mouExpiryDate && (
                                  <div>Expiry Date: {collab.mouExpiryDate.toLocaleDateString()}</div>
                                )}
                                {collab.mouFileName && (
                                  <div className="text-blue-600">
                                    {collab.mouFileName} ({formatFileSize(collab.mouFileSize)})
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Statistics
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Projects: {collab.jointProjects || 0}</div>
                                <div>Publications: {collab.publicationsProduced || 0}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Notes */}
                          {collab.notes && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                                {collab.notes}
                              </p>
                            </div>
                          )}
                          
                          {/* Achievements and Activities */}
                          {(collab.achievements?.length || collab.upcomingActivities?.length) && (
                            <div className="grid grid-cols-2 gap-4">
                              {collab.achievements && collab.achievements.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-2">Achievements</h4>
                                  <ul className="text-sm space-y-1">
                                    {collab.achievements.map((achievement, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        {achievement}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {collab.upcomingActivities && collab.upcomingActivities.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-2">Upcoming Activities</h4>
                                  <ul className="text-sm space-y-1">
                                    {collab.upcomingActivities.map((activity, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          
          {collaborations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No partnerships found</p>
              <p className="text-sm">Add your first partnership using the button above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationTable;