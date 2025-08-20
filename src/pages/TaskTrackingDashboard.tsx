import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  createdAt: Date;
}

export default function TaskTrackingDashboard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Sample Task",
      description: "This is a sample task to demonstrate the task tracking functionality",
      status: "todo",
      priority: "medium",
      createdAt: new Date()
    }
  ]);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"]
  });
  
  const [showAddForm, setShowAddForm] = useState(false);

  const addTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        status: "todo",
        priority: newTask.priority,
        createdAt: new Date()
      };
      setTasks([...tasks, task]);
      setNewTask({ title: "", description: "", priority: "medium" });
      setShowAddForm(false);
    }
  };

  const updateTaskStatus = (id: string, status: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "todo":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
    }
  };

  const todoTasks = tasks.filter(task => task.status === "todo");
  const inProgressTasks = tasks.filter(task => task.status === "in-progress");
  const completedTasks = tasks.filter(task => task.status === "completed");

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Tracking</h1>
            <p className="text-gray-600 mt-2">Manage and track your tasks efficiently</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={addTask}>Add Task</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Todo Column */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-500" />
                To Do ({todoTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todoTasks.map(task => (
                <Card key={task.id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <Button
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, "in-progress")}
                    className="w-full"
                  >
                    Start Task
                  </Button>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* In Progress Column */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                In Progress ({inProgressTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inProgressTasks.map(task => (
                <Card key={task.id} className="p-3 border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <Button
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, "completed")}
                    className="w-full"
                  >
                    Complete Task
                  </Button>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Completed Column */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completed ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.map(task => (
                <Card key={task.id} className="p-3 border-green-200 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-green-800">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                  <p className="text-sm text-green-600">{task.description}</p>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}