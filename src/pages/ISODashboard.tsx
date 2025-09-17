import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Award, Calendar, AlertTriangle, CheckCircle, Clock, Plus, FileText } from "lucide-react";

interface ISOStandard {
  id: string;
  standard: string;
  title: string;
  status: "certified" | "in-progress" | "pending" | "expired";
  certificationDate?: Date;
  expiryDate?: Date;
  compliance: number;
  lastAudit: Date;
  nextAudit: Date;
  auditor: string;
}

interface Requirement {
  id: string;
  standardId: string;
  requirement: string;
  status: "compliant" | "non-compliant" | "in-review" | "action-required";
  priority: "high" | "medium" | "low";
  dueDate: Date;
  responsible: string;
  notes: string;
}

export default function ISODashboard() {
  const [standards, setStandards] = useState<ISOStandard[]>([
    {
      id: "1",
      standard: "ISO 9001:2015",
      title: "Quality Management Systems",
      status: "certified",
      certificationDate: new Date("2023-06-15"),
      expiryDate: new Date("2026-06-15"),
      compliance: 95,
      lastAudit: new Date("2024-12-01"),
      nextAudit: new Date("2025-06-15"),
      auditor: "SGS Vietnam"
    },
    {
      id: "2",
      standard: "ISO 27001:2022",
      title: "Information Security Management",
      status: "in-progress",
      compliance: 78,
      lastAudit: new Date("2024-11-20"),
      nextAudit: new Date("2025-05-20"),
      auditor: "BSI Group"
    },
    {
      id: "3",
      standard: "ISO 14001:2015",
      title: "Environmental Management Systems",
      status: "pending",
      compliance: 45,
      lastAudit: new Date("2024-10-10"),
      nextAudit: new Date("2025-04-10"),
      auditor: "DNV GL"
    },
    {
      id: "4",
      standard: "ISO 45001:2018",
      title: "Occupational Health and Safety",
      status: "certified",
      certificationDate: new Date("2024-01-20"),
      expiryDate: new Date("2027-01-20"),
      compliance: 92,
      lastAudit: new Date("2024-11-15"),
      nextAudit: new Date("2025-05-15"),
      auditor: "TUV Rheinland"
    }
  ]);

  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: "1",
      standardId: "1",
      requirement: "Document Control Procedure Review",
      status: "action-required",
      priority: "high",
      dueDate: new Date("2025-02-15"),
      responsible: "Quality Manager",
      notes: "Update document control matrix and approval workflows"
    },
    {
      id: "2",
      standardId: "2",
      requirement: "Risk Assessment Update",
      status: "in-review",
      priority: "medium",
      dueDate: new Date("2025-03-01"),
      responsible: "CISO",
      notes: "Complete annual risk assessment for information assets"
    },
    {
      id: "3",
      standardId: "3",
      requirement: "Environmental Impact Assessment",
      status: "non-compliant",
      priority: "high",
      dueDate: new Date("2025-01-30"),
      responsible: "Facilities Manager",
      notes: "Conduct comprehensive environmental impact study"
    }
  ]);

  const [showAddStandard, setShowAddStandard] = useState(false);
  const [showAddRequirement, setShowAddRequirement] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      certified: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
      compliant: "bg-green-100 text-green-800",
      "non-compliant": "bg-red-100 text-red-800",
      "in-review": "bg-blue-100 text-blue-800",
      "action-required": "bg-orange-100 text-orange-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return "text-green-600";
    if (compliance >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const certifiedStandards = standards.filter(s => s.status === "certified").length;
  const inProgressStandards = standards.filter(s => s.status === "in-progress").length;
  const overallCompliance = Math.round(standards.reduce((sum, s) => sum + s.compliance, 0) / standards.length);
  const criticalRequirements = requirements.filter(r => r.priority === "high" && r.status !== "compliant").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ISO Management System</h1>
            <p className="text-gray-600 mt-2">Manage ISO standards, compliance, and certification processes</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddStandard(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Standard
            </Button>
            <Button onClick={() => setShowAddRequirement(true)} variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Requirement
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certified Standards</p>
                  <p className="text-2xl font-bold text-green-600">{certifiedStandards}</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgressStandards}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
                  <p className={`text-2xl font-bold ${getComplianceColor(overallCompliance)}`}>{overallCompliance}%</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">{criticalRequirements}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ISO Standards Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                ISO Standards Overview
              </CardTitle>
              <CardDescription>
                Current certification status and compliance levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {standards.map(standard => (
                <Card key={standard.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{standard.standard}</h3>
                      <p className="text-sm text-gray-600">{standard.title}</p>
                    </div>
                    <Badge className={getStatusColor(standard.status)}>{standard.status}</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Compliance Level</span>
                      <span className={`font-medium ${getComplianceColor(standard.compliance)}`}>
                        {standard.compliance}%
                      </span>
                    </div>
                    <Progress value={standard.compliance} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Last Audit:</span><br />
                      {standard.lastAudit.toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Next Audit:</span><br />
                      {standard.nextAudit.toLocaleDateString()}
                    </div>
                    {standard.expiryDate && (
                      <>
                        <div>
                          <span className="font-medium">Expires:</span><br />
                          {standard.expiryDate.toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Auditor:</span><br />
                          {standard.auditor}
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Requirements & Actions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Requirements & Actions
              </CardTitle>
              <CardDescription>
                Compliance requirements and action items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirements.map(requirement => (
                <Card key={requirement.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{requirement.requirement}</h3>
                    <div className="flex gap-1">
                      <Badge className={getPriorityColor(requirement.priority)} variant="outline">
                        {requirement.priority}
                      </Badge>
                      <Badge className={getStatusColor(requirement.status)}>
                        {requirement.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">Due Date:</span><br />
                      {requirement.dueDate.toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Responsible:</span><br />
                      {requirement.responsible}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                    {requirement.notes}
                  </p>
                  
                  <div className="flex justify-end mt-3">
                    <Button size="sm" variant="outline">
                      Update Status
                    </Button>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}