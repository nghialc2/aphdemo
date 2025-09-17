import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  FileText, 
  Eye,
  EyeOff,
  Settings
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
  // New fields for MOU management
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
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});
  const [uploadingMOU, setUploadingMOU] = useState<string | null>(null);

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
      // Reset input
      event.target.value = '';
    }
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({
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
          <div className="text-sm text-emerald-700">
            {adminMode === 'manual' ? (
              <p>Fill in collaboration information manually using the form fields.</p>
            ) : (
              <div className="space-y-2">
                <p>Upload MOU PDF files. AI will automatically extract collaboration details.</p>
                <div className="flex items-center gap-2">
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
                        {uploadingMOU ? `Uploading ${uploadingMOU}...` : 'Upload MOU PDF'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Partnerships List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-800">Partnership Details</CardTitle>
          <Button onClick={() => {}} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4" />
            Add Partnership
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborations.map((collaboration) => (
              <Card key={collaboration.id} className="p-4 border-l-4 border-l-emerald-400">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{collaboration.universityName}</h3>
                        <p className="text-gray-600">{collaboration.country}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge variant={collaboration.status === 'active' ? 'default' : 'secondary'}>
                            {collaboration.status}
                          </Badge>
                          {collaboration.collaborationType && (
                            <Badge variant="outline">{collaboration.collaborationType}</Badge>
                          )}
                          {collaboration.extractedBy && (
                            <Badge 
                              variant={collaboration.extractedBy === 'ai' ? 'default' : 'secondary'}
                              className={collaboration.extractedBy === 'ai' ? 'bg-emerald-100 text-emerald-800' : ''}
                            >
                              {collaboration.extractedBy === 'ai' ? '🤖 AI Extracted' : '✋ Manual Entry'}
                            </Badge>
                          )}
                          {collaboration.aiExtractionStatus && collaboration.aiExtractionStatus !== 'completed' && (
                            <Badge variant="outline" className="text-orange-600">
                              AI: {collaboration.aiExtractionStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => toggleDetails(collaboration.id)}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          {showDetails[collaboration.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {}}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(collaboration.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* MOU File Information */}
                    {collaboration.mouFileUrl && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                {collaboration.mouFileName || 'MOU Document'}
                              </p>
                              <p className="text-xs text-blue-600">
                                {collaboration.mouFileSize && formatFileSize(collaboration.mouFileSize)}
                                {collaboration.mouUploadedAt && (
                                  <> • Uploaded {collaboration.mouUploadedAt.toLocaleDateString()}</>
                                )}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onDownloadMOU(collaboration)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-100"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {collaboration.notes && (
                      <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{collaboration.notes}</p>
                    )}
                    
                    {/* Detailed Information - Collapsible */}
                    {showDetails[collaboration.id] && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          {collaboration.studentsExchanged && (
                            <div className="bg-emerald-50 p-3 rounded-lg">
                              <span className="font-medium text-emerald-800">Students Exchanged:</span>
                              <p className="text-emerald-700">{collaboration.studentsExchanged}</p>
                            </div>
                          )}
                          {collaboration.facultyExchanged && (
                            <div className="bg-teal-50 p-3 rounded-lg">
                              <span className="font-medium text-teal-800">Faculty Exchanged:</span>
                              <p className="text-teal-700">{collaboration.facultyExchanged}</p>
                            </div>
                          )}
                          {collaboration.jointProjects && (
                            <div className="bg-cyan-50 p-3 rounded-lg">
                              <span className="font-medium text-cyan-800">Joint Projects:</span>
                              <p className="text-cyan-700">{collaboration.jointProjects}</p>
                            </div>
                          )}
                          {collaboration.publicationsProduced && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <span className="font-medium text-blue-800">Publications:</span>
                              <p className="text-blue-700">{collaboration.publicationsProduced}</p>
                            </div>
                          )}
                        </div>

                        {/* Contact Information */}
                        {(collaboration.contactPerson || collaboration.contactEmail) && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Contact Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              {collaboration.contactPerson && (
                                <div>
                                  <span className="text-gray-600">Contact Person:</span>
                                  <p className="font-medium">{collaboration.contactPerson}</p>
                                </div>
                              )}
                              {collaboration.contactEmail && (
                                <div>
                                  <span className="text-gray-600">Email:</span>
                                  <p className="font-medium">{collaboration.contactEmail}</p>
                                </div>
                              )}
                              {collaboration.contactPhone && (
                                <div>
                                  <span className="text-gray-600">Phone:</span>
                                  <p className="font-medium">{collaboration.contactPhone}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* MOU Information */}
                        {(collaboration.mouSignDate || collaboration.mouExpiryDate) && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <h4 className="font-medium text-purple-800 mb-2">MOU Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              {collaboration.mouSignDate && (
                                <div>
                                  <span className="text-purple-600">Sign Date:</span>
                                  <p className="font-medium">{collaboration.mouSignDate.toLocaleDateString()}</p>
                                </div>
                              )}
                              {collaboration.mouExpiryDate && (
                                <div>
                                  <span className="text-purple-600">Expiry Date:</span>
                                  <p className="font-medium">{collaboration.mouExpiryDate.toLocaleDateString()}</p>
                                </div>
                              )}
                              {collaboration.mouStatus && (
                                <div>
                                  <span className="text-purple-600">Status:</span>
                                  <Badge variant="outline" className="ml-2">{collaboration.mouStatus}</Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Achievements & Activities */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {collaboration.achievements && collaboration.achievements.length > 0 && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h4 className="font-medium text-green-800 mb-2">Achievements</h4>
                              <ul className="text-sm text-green-700 space-y-1">
                                {collaboration.achievements.map((achievement, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {collaboration.upcomingActivities && collaboration.upcomingActivities.length > 0 && (
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <h4 className="font-medium text-orange-800 mb-2">Upcoming Activities</h4>
                              <ul className="text-sm text-orange-700 space-y-1">
                                {collaboration.upcomingActivities.map((activity, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    {activity}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationTable;