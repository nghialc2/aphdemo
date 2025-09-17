export interface Collaboration {
  id: string;
  universityName: string;
  country: string;
  countryCode: string;
  coordinates: [number, number];
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // MOU Information
  mouSignDate?: Date;
  mouExpiryDate?: Date;
  mouStatus?: "active" | "expired" | "pending_renewal" | "cancelled";
  mouDocument?: string; // URL or file reference
  
  // MOU File Management
  mouFileUrl?: string;
  mouFileName?: string;
  mouFileSize?: number;
  mouUploadedAt?: Date;
  extractedBy?: 'manual' | 'ai';
  aiExtractionStatus?: 'pending' | 'completed' | 'failed';
  
  // Collaboration Details
  collaborationType?: "research" | "student_exchange" | "joint_program" | "faculty_exchange" | "internship" | "dual_degree" | "conference" | "workshop";
  
  // Status and Activity
  status: "active" | "inactive" | "suspended" | "planning";
  lastActivity?: Date;
  
  // Notes and Documentation
  notes?: string;
  achievements?: string[];
  upcomingActivities?: string[];
  
  // Metrics
  studentsExchanged?: number;
  facultyExchanged?: number;
  jointProjects?: number;
  publicationsProduced?: number;
  
  // Administrative
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface CollaborationSummary {
  countryCode: string;
  countryName: string;
  institutions: string[];
  partnerships: number;
  coordinates: [number, number];
  totalStudents?: number;
  totalFaculty?: number;
}

export interface CollaborationFilters {
  status?: string[];
  collaborationType?: string[];
  mouStatus?: string[];
  country?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CollaborationFormData {
  universityName: string;
  country: string;
  countryCode: string;
  coordinates: [number, number];
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  mouSignDate: string; // ISO date string for form handling
  mouExpiryDate: string; // ISO date string for form handling
  mouStatus: Collaboration['mouStatus'];
  collaborationType: Collaboration['collaborationType'];
  status: Collaboration['status'];
  notes?: string;
  achievements?: string;
  upcomingActivities?: string;
  studentsExchanged?: number;
  facultyExchanged?: number;
  jointProjects?: number;
  publicationsProduced?: number;
}