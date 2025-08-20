import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, Calendar, MapPin, Plus } from "lucide-react";
import Layout from "@/components/Layout";

interface Partnership {
  id: string;
  institution: string;
  country: string;
  type: "university" | "research" | "corporate" | "government";
  status: "active" | "pending" | "completed";
  description: string;
  startDate: Date;
}

interface Event {
  id: string;
  title: string;
  type: "conference" | "workshop" | "exchange" | "collaboration";
  location: string;
  date: Date;
  participants: number;
  status: "upcoming" | "ongoing" | "completed";
}

export default function InternationalRelationsDashboard() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([
    {
      id: "1",
      institution: "MIT Sloan School of Management",
      country: "United States",
      type: "university",
      status: "active",
      description: "Research collaboration on AI in business education",
      startDate: new Date("2024-01-15")
    },
    {
      id: "2",
      institution: "INSEAD",
      country: "France",
      type: "university",
      status: "active",
      description: "Student exchange program and joint MBA courses",
      startDate: new Date("2023-09-01")
    }
  ]);

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Global AI in Education Summit",
      type: "conference",
      location: "Singapore",
      date: new Date("2025-03-15"),
      participants: 120,
      status: "upcoming"
    },
    {
      id: "2",
      title: "International Business Research Workshop",
      type: "workshop",
      location: "Ho Chi Minh City",
      date: new Date("2025-02-20"),
      participants: 45,
      status: "upcoming"
    }
  ]);

  const [showAddPartnership, setShowAddPartnership] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const getTypeColor = (type: string) => {
    const colors = {
      university: "bg-blue-100 text-blue-800",
      research: "bg-purple-100 text-purple-800",
      corporate: "bg-green-100 text-green-800",
      government: "bg-gray-100 text-gray-800",
      conference: "bg-orange-100 text-orange-800",
      workshop: "bg-teal-100 text-teal-800",
      exchange: "bg-pink-100 text-pink-800",
      collaboration: "bg-indigo-100 text-indigo-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-gray-100 text-gray-800",
      upcoming: "bg-blue-100 text-blue-800",
      ongoing: "bg-orange-100 text-orange-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">International Relations</h1>
            <p className="text-gray-600 mt-2">Manage global partnerships and international activities</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddPartnership(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Partnership
            </Button>
            <Button onClick={() => setShowAddEvent(true)} variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Partnerships</p>
                  <p className="text-2xl font-bold">{partnerships.filter(p => p.status === 'active').length}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  <p className="text-2xl font-bold">{new Set(partnerships.map(p => p.country)).size}</p>
                </div>
                <MapPin className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold">{events.filter(e => e.status === 'upcoming').length}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold">{events.reduce((sum, e) => sum + e.participants, 0)}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Partnerships Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                International Partnerships
              </CardTitle>
              <CardDescription>
                Current and ongoing institutional partnerships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {partnerships.map(partnership => (
                <Card key={partnership.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{partnership.institution}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {partnership.country}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(partnership.type)}>{partnership.type}</Badge>
                      <Badge className={getStatusColor(partnership.status)}>{partnership.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{partnership.description}</p>
                  <p className="text-xs text-gray-500">
                    Started: {partnership.startDate.toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Events Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                International Events
              </CardTitle>
              <CardDescription>
                Conferences, workshops, and collaborative events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map(event => (
                <Card key={event.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {event.date.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.participants} participants
                    </span>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}