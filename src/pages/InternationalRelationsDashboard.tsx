import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, Calendar, MapPin, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WorldMap from "@/components/international-relations/WorldMap";
import CollaborationTable from "@/components/international-relations/CollaborationTableNew";
import { Collaboration, CollaborationSummary } from "@/types/international-relations";
import { 
  processMOUFile, 
  downloadMOUFromSupabase, 
  getCoordinatesForCountry 
} from "@/services/mouProcessingService";

// Default collaborations data
const defaultCollaborations: Collaboration[] = [
  {
    id: "1",
    universityName: "MIT Sloan School of Management",
    country: "United States",
    countryCode: "USA",
    coordinates: [-71.0942, 42.3601],
    contactPerson: "Dr. John Smith",
    contactEmail: "j.smith@mit.edu",
    contactPhone: "+1-617-555-0123",
    mouSignDate: new Date("2024-01-15"),
    mouExpiryDate: new Date("2027-01-15"),
    mouStatus: "active",
    collaborationType: "research",
    status: "active",
    notes: "Research collaboration on AI in business education. Strong partnership with high potential for expansion.",
    achievements: [
      "Published 3 joint research papers",
      "Hosted 2 joint conferences",
      "Faculty exchange program established"
    ],
    upcomingActivities: [
      "Joint AI symposium in March 2025",
      "Student exchange program launch"
    ],
    studentsExchanged: 15,
    facultyExchanged: 8,
    jointProjects: 3,
    publicationsProduced: 5,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-01"),
    createdBy: "admin@fsb.edu.vn"
  },
    {
      id: "2",
      universityName: "INSEAD",
      country: "France",
      countryCode: "FRA",
      coordinates: [2.3522, 48.8566],
      contactPerson: "Prof. Marie Dubois",
      contactEmail: "marie.dubois@insead.edu",
      mouSignDate: new Date("2023-09-01"),
      mouExpiryDate: new Date("2026-09-01"),
      mouStatus: "active",
      collaborationType: "student_exchange",
      status: "active",
      notes: "Comprehensive student exchange program and joint MBA courses. Very successful partnership.",
      achievements: [
        "50+ students exchanged successfully",
        "Joint MBA program launched",
        "International business case competition"
      ],
      studentsExchanged: 52,
      facultyExchanged: 12,
      jointProjects: 2,
      publicationsProduced: 3,
      createdAt: new Date("2023-08-15"),
      updatedAt: new Date("2024-11-20"),
      createdBy: "admin@fsb.edu.vn"
    },
    {
      id: "3",
      universityName: "University of Melbourne",
      country: "Australia",
      countryCode: "AUS",
      coordinates: [144.9631, -37.8136],
      contactPerson: "Dr. Sarah Wilson",
      contactEmail: "s.wilson@unimelb.edu.au",
      mouSignDate: new Date("2024-03-10"),
      mouExpiryDate: new Date("2025-03-10"),
      mouStatus: "pending_renewal",
      collaborationType: "joint_program",
      status: "active",
      notes: "Dual degree program in international business. MOU expiring soon, renewal in progress.",
      achievements: [
        "Dual degree program established",
        "Joint research center opened"
      ],
      studentsExchanged: 25,
      facultyExchanged: 6,
      jointProjects: 1,
      publicationsProduced: 2,
      createdAt: new Date("2024-02-28"),
      updatedAt: new Date("2024-12-15"),
      createdBy: "admin@fsb.edu.vn"
    },
    {
      id: "4",
      universityName: "National University of Singapore",
      country: "Singapore",
      countryCode: "SGP",
      coordinates: [103.8518, 1.2966],
      contactPerson: "Prof. Lim Wei Ming",
      contactEmail: "limweiming@nus.edu.sg",
      mouSignDate: new Date("2024-06-01"),
      mouExpiryDate: new Date("2029-06-01"),
      mouStatus: "active",
      collaborationType: "research",
      status: "active",
      notes: "Regional collaboration focused on Southeast Asian business studies and fintech research.",
      achievements: [
        "ASEAN business research project launched",
        "Fintech innovation lab established"
      ],
      upcomingActivities: [
        "ASEAN Fintech Conference 2025"
      ],
      studentsExchanged: 8,
      facultyExchanged: 4,
      jointProjects: 2,
      publicationsProduced: 1,
      createdAt: new Date("2024-05-15"),
      updatedAt: new Date("2024-12-10"),
      createdBy: "admin@fsb.edu.vn"
    }
  ];

// Custom hook for localStorage persistence
function usePersistedCollaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>(() => {
    try {
      const stored = localStorage.getItem('ir-collaborations');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((collab: any) => ({
          ...collab,
          mouSignDate: collab.mouSignDate ? new Date(collab.mouSignDate) : undefined,
          mouExpiryDate: collab.mouExpiryDate ? new Date(collab.mouExpiryDate) : undefined,
          mouUploadedAt: collab.mouUploadedAt ? new Date(collab.mouUploadedAt) : undefined,
          createdAt: new Date(collab.createdAt),
          updatedAt: new Date(collab.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load collaborations from localStorage:', error);
    }
    return defaultCollaborations;
  });

  // Save to localStorage whenever collaborations change
  useEffect(() => {
    try {
      localStorage.setItem('ir-collaborations', JSON.stringify(collaborations));
    } catch (error) {
      console.error('Failed to save collaborations to localStorage:', error);
    }
  }, [collaborations]);

  return [collaborations, setCollaborations] as const;
}

export default function InternationalRelationsDashboard() {
  const [collaborations, setCollaborations] = usePersistedCollaborations();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/explore');
  };

  // Transform collaborations data for the map
  const collaborationSummaries: CollaborationSummary[] = collaborations.reduce((acc, collab) => {
    const existingCountry = acc.find(item => item.countryCode === collab.countryCode);
    
    if (existingCountry) {
      existingCountry.institutions.push(collab.universityName);
      existingCountry.partnerships += 1;
      existingCountry.totalStudents = (existingCountry.totalStudents || 0) + (collab.studentsExchanged || 0);
      existingCountry.totalFaculty = (existingCountry.totalFaculty || 0) + (collab.facultyExchanged || 0);
    } else {
      acc.push({
        countryCode: collab.countryCode,
        countryName: collab.country,
        institutions: [collab.universityName],
        partnerships: 1,
        coordinates: collab.coordinates,
        totalStudents: collab.studentsExchanged || 0,
        totalFaculty: collab.facultyExchanged || 0
      });
    }
    
    return acc;
  }, [] as CollaborationSummary[]);

  // CRUD operations for collaborations
  const handleAddCollaboration = (newCollaboration: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>) => {
    const collaboration: Collaboration = {
      ...newCollaboration,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCollaborations([...collaborations, collaboration]);
  };

  const handleEditCollaboration = (id: string, updates: Partial<Collaboration>) => {
    setCollaborations(prev => 
      prev.map(collab => 
        collab.id === id 
          ? { ...collab, ...updates, updatedAt: new Date() }
          : collab
      )
    );
  };

  const handleDeleteCollaboration = (id: string) => {
    setCollaborations(prev => prev.filter(collab => collab.id !== id));
  };

  // MOU file handling
  const handleUploadMOU = async (file: File): Promise<void> => {
    try {
      // Process the MOU file (upload to Supabase + AI extraction)
      const { fileInfo, extractedData } = await processMOUFile(file);
      
      // Create new collaboration from extracted data
      const newCollaboration: Collaboration = {
        id: Date.now().toString(),
        universityName: extractedData.universityName || 'Unknown University',
        country: extractedData.country || 'Unknown Country',
        countryCode: extractedData.country?.toUpperCase().slice(0, 3) || 'UNK',
        coordinates: getCoordinatesForCountry(extractedData.country || ''),
        contactPerson: extractedData.contactPerson,
        contactEmail: extractedData.contactEmail,
        contactPhone: extractedData.contactPhone,
        mouSignDate: extractedData.mouSignDate,
        mouExpiryDate: extractedData.mouExpiryDate,
        mouStatus: extractedData.mouStatus,
        collaborationType: extractedData.collaborationType,
        status: 'active',
        notes: extractedData.notes,
        achievements: extractedData.achievements,
        upcomingActivities: extractedData.upcomingActivities,
        studentsExchanged: extractedData.studentsExchanged,
        facultyExchanged: extractedData.facultyExchanged,
        jointProjects: extractedData.jointProjects,
        publicationsProduced: extractedData.publicationsProduced,
        // MOU file information
        mouFileUrl: fileInfo.url,
        mouFileName: fileInfo.fileName,
        mouFileSize: fileInfo.fileSize,
        mouUploadedAt: fileInfo.uploadedAt,
        extractedBy: 'ai',
        aiExtractionStatus: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin@fsb.edu.vn'
      };

      setCollaborations(prev => [...prev, newCollaboration]);
    } catch (error) {
      console.error('MOU processing failed:', error);
      throw error;
    }
  };

  const handleDownloadMOU = async (collaboration: Collaboration): Promise<void> => {
    if (!collaboration.mouFileUrl || !collaboration.mouFileName) {
      alert('No MOU file available for download');
      return;
    }

    try {
      await downloadMOUFromSupabase(collaboration.mouFileUrl, collaboration.mouFileName);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download MOU file');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-particles" aria-hidden="true">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${(i * 7 + Math.random() * 10)}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}>
              <div className="particle-inner">
                {i % 4 === 0 ? '⭐' : i % 4 === 1 ? '💎' : i % 4 === 2 ? '🔷' : '✨'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Header with glassmorphism background */}
      <div className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-emerald-200/50 relative z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            {/* FSB Logo */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="mr-6 cursor-pointer transition-opacity hover:opacity-80"
                    onClick={handleLogoClick}
                  >
                    <img 
                      src="/logo_FSB_new.png" 
                      alt="FPT School of Business & Technology" 
                      className="h-12 w-auto"
                      onError={(e) => {
                        console.error('Logo failed to load:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-gray-900 text-white px-2 py-1 text-sm">
                  Trở về trang chủ
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-5">
              <span className="text-4xl rotating-globe">
                🌍
              </span>
              <div className="flex-1">
                <h1 className="text-4xl font-light bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-wide">
                  International Relations
                </h1>
                <p className="text-slate-500 mt-1 font-medium">FSB Global Partnerships & Collaborations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-emerald-200/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 font-medium">{collaborations.length} Active Partnerships</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Collaborations</p>
                  <p className="text-3xl font-bold text-white">{collaborations.length}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-blue-100">Global partnerships</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Countries</p>
                  <p className="text-3xl font-bold text-white">{collaborationSummaries.length}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-green-100">Worldwide presence</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100">Students Exchanged</p>
                  <p className="text-3xl font-bold text-white">
                    {collaborations.reduce((sum, c) => sum + (c.studentsExchanged || 0), 0)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-orange-100">International mobility</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Active MOUs</p>
                  <p className="text-3xl font-bold text-white">
                    {collaborations.filter(c => c.mouStatus === 'active').length}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-purple-100">Legal agreements</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* World Map Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-xl border-emerald-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Globe className="w-5 h-5 text-emerald-600" />
              Global Collaboration Map
            </CardTitle>
            <CardDescription className="text-gray-600">
              Interactive map showing FSB's international partnerships and collaborations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: '600px' }} className="rounded-lg overflow-hidden futuristic-map-container">
              <WorldMap />
            </div>
          </CardContent>
        </Card>

        {/* Collaboration Table Section */}
        <Card className="bg-white/80 backdrop-blur-xl border-emerald-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Users className="w-5 h-5 text-emerald-600" />
              Collaboration Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              Detailed view and management of all international collaborations, MOUs, and partnerships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CollaborationTable 
              collaborations={collaborations}
              onAdd={handleAddCollaboration}
              onEdit={handleEditCollaboration}
              onDelete={handleDeleteCollaboration}
              onUploadMOU={handleUploadMOU}
              onDownloadMOU={handleDownloadMOU}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}