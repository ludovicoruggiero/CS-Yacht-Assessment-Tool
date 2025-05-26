"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Calculator,
  Ship,
  CheckCircle,
  Shield,
  RotateCcw,
  Menu,
  X,
  Home,
  BarChart3,
  Database,
  Bell,
  TrendingUp,
  Activity,
  Zap,
  Package,
  Settings,
  LogOut,
} from "lucide-react"
import FileUploader from "@/components/file-uploader"
import DocumentProcessor from "@/components/document-processor"
import ParsingValidation from "@/components/parsing-validation"
import GWPCalculator from "@/components/gwp-calculator"
import ResultsDisplay from "@/components/results-display"
import MaterialsManager from "@/components/materials-manager"
import LoginForm from "@/components/login-form"
import { authService } from "@/lib/auth"
import { useAppState } from "@/lib/services/app-state"
import ProjectCreator from "@/components/project-creator"
import ProjectsList from "@/components/projects-list"
import { projectsService, type Project } from "@/lib/services/projects-service"

export default function LightshipweightGWPTool() {
  const {
    user,
    setUser,
    currentStep,
    setCurrentStep,
    uploadedFiles,
    setUploadedFiles,
    processedData,
    setProcessedData,
    validatedData,
    setValidatedData,
    gwpResults,
    setGWPResults,
    resetAppState,
    currentProject,
    setCurrentProject,
  } = useAppState()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeView, setActiveView] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setUploadedFiles([])
    setProcessedData(null)
    setValidatedData(null)
    setGWPResults(null)
    setCurrentStep(1)
    setIsProcessing(false)
    setActiveView("dashboard")
    setCurrentProject(null)
  }

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files)
    setCurrentStep(2)
    // Update project with file count
    if (currentProject) {
      projectsService.updateProjectAnalysisData(currentProject.id, {
        uploaded_files_count: files.length,
      })
      projectsService.updateProjectStatus(currentProject.id, "processing")
    }
  }

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project)
    setCurrentStep(1)
    setActiveView("calculator")
  }

  const handleProjectSelected = (project: Project) => {
    setCurrentProject(project)
    // Determine step based on project status and data
    if (project.status === "completed") {
      setCurrentStep(5)
      setActiveView("calculator")
    } else if (project.uploaded_files_count > 0) {
      setCurrentStep(2)
      setActiveView("calculator")
    } else {
      setCurrentStep(1)
      setActiveView("calculator")
    }
  }

  const handleCreateNewProject = () => {
    console.log("Creating new project, setting activeView to create-project")
    setActiveView("create-project")
  }

  const handleDataProcessed = (data: any) => {
    setProcessedData(data)
    setCurrentStep(3)
  }

  const handleValidationComplete = (data: any) => {
    setValidatedData(data)
    setCurrentStep(4)
  }

  const handleGWPCalculated = (results: any) => {
    setGWPResults(results)
    setCurrentStep(5)
  }

  const resetTool = () => {
    resetAppState()
    setIsProcessing(false)
    setActiveView("dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-slate-700">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  const mainSections = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview and analytics",
    },
    {
      id: "projects",
      label: "My Projects",
      icon: Ship,
      description: "Manage your assessments",
      badge: currentProject ? "Active" : undefined,
    },
  ]

  // Add Materials DB only for admin
  if (authService.hasAccess("admin")) {
    mainSections.push({
      id: "materials",
      label: "Materials Database",
      icon: Database,
      description: "Manage materials library",
    })
  }

  const getProgressPercentage = () => {
    return ((currentStep - 1) / 4) * 100
  }

  const getQuickStats = () => {
    const stats = []

    if (uploadedFiles.length > 0) {
      stats.push({
        label: "Files Uploaded",
        value: uploadedFiles.length,
        icon: FileText,
        color: "text-blue-600",
      })
    }

    if (processedData) {
      const totalMaterials = processedData.reduce((sum: number, doc: any) => sum + doc.materials.length, 0)
      stats.push({
        label: "Materials Found",
        value: totalMaterials,
        icon: Package,
        color: "text-green-600",
      })
    }

    if (gwpResults) {
      stats.push({
        label: "Total GWP",
        value: `${(gwpResults.totalGWP / 1000).toFixed(1)}t`,
        icon: TrendingUp,
        color: "text-red-600",
      })
    }

    return stats
  }

  const getCurrentStepInfo = () => {
    const steps = [
      { step: 1, label: "Upload Files", description: "Upload documentation" },
      { step: 2, label: "Processing", description: "Analyzing documents" },
      { step: 3, label: "Validation", description: "Review materials" },
      { step: 4, label: "Calculation", description: "Calculate GWP" },
      { step: 5, label: "Results", description: "View analysis" },
    ]
    return steps.find((s) => s.step === currentStep) || steps[0]
  }

  console.log("Current activeView:", activeView)
  console.log("Current user:", user?.id)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Ship className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">GWP Calculator</h1>
              <p className="text-xs text-slate-500">Maritime Assessment</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {mainSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveView(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeView === section.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{section.label}</div>
                    <div className="text-xs text-slate-500">{section.description}</div>
                  </div>
                  {section.badge && (
                    <Badge variant={activeView === section.id ? "default" : "secondary"} className="text-xs">
                      {section.badge}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>

          {/* Analysis Progress - Solo se c'è un'analisi in corso */}
          {(currentStep > 1 || uploadedFiles.length > 0) && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Current Analysis</h3>
                <div className="text-xs text-slate-500 mb-3">{getCurrentStepInfo().description}</div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Progress</span>
                  <span className="text-slate-500">{Math.round(getProgressPercentage())}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Reset analysis? All progress will be lost.")) {
                    resetTool()
                  }
                }}
                className="w-full flex items-center gap-2 text-slate-600"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Analysis
              </Button>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-slate-700">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.fullName}</p>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {user.role === "admin" ? "Administrator" : "User"}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-slate-600 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {activeView === "dashboard" && "Dashboard"}
                  {activeView === "calculator" && "GWP Calculator"}
                  {activeView === "materials" && "Materials Database"}
                  {activeView === "projects" && "My Projects"}
                  {activeView === "create-project" && "Create Project"}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeView === "dashboard" && "Overview of your environmental analysis"}
                  {activeView === "calculator" && getCurrentStepInfo().description}
                  {activeView === "materials" && "Manage your materials library"}
                  {activeView === "projects" && "Manage your projects"}
                  {activeView === "create-project" && "Create a new project"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Welcome back, {user.fullName.split(" ")[0]}
                      {currentProject && <span className="text-blue-200"> • {currentProject.name}</span>}
                    </h3>
                    <p className="text-blue-100 mb-4">Ready to analyze your maritime project's environmental impact?</p>
                    <Button
                      onClick={() => setActiveView("calculator")}
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      {currentStep === 1 ? "Start New Analysis" : "Continue Analysis"}
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Ship className="h-12 w-12 text-blue-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {getQuickStats().length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getQuickStats().map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center`}>
                              <Icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Current Analysis Status */}
              {(currentStep > 1 || uploadedFiles.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Analysis Progress
                    </CardTitle>
                    <CardDescription>Track your environmental assessment progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Steps */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                          { step: 1, label: "Upload", icon: Upload, completed: currentStep >= 1 },
                          { step: 2, label: "Processing", icon: Activity, completed: currentStep >= 2 },
                          { step: 3, label: "Validation", icon: CheckCircle, completed: currentStep >= 3 },
                          { step: 4, label: "Calculation", icon: Calculator, completed: currentStep >= 4 },
                          { step: 5, label: "Results", icon: BarChart3, completed: currentStep >= 5 },
                        ].map((item) => {
                          const Icon = item.icon
                          return (
                            <div
                              key={item.step}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                item.completed
                                  ? "border-green-200 bg-green-50"
                                  : currentStep === item.step
                                    ? "border-blue-200 bg-blue-50"
                                    : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    item.completed
                                      ? "bg-green-100 text-green-600"
                                      : currentStep === item.step
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                                  <p className="text-xs text-slate-500">Step {item.step}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Next Action */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{getCurrentStepInfo().label}</p>
                          <p className="text-sm text-slate-600">{getCurrentStepInfo().description}</p>
                        </div>
                        <Button onClick={() => setActiveView("calculator")}>
                          {currentStep === 5 ? "View Results" : "Continue"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">Automated Processing</h4>
                    <p className="text-sm text-slate-600">
                      Advanced AI-powered material recognition from your documentation
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">PCR Compliance</h4>
                    <p className="text-sm text-slate-600">
                      Automatic categorization according to maritime PCR standards
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">Industry Benchmarks</h4>
                    <p className="text-sm text-slate-600">Compare your results against maritime industry standards</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === "projects" && (
            <ProjectsList
              userId={user.id}
              onProjectSelect={handleProjectSelected}
              onCreateNew={handleCreateNewProject}
            />
          )}

          {activeView === "create-project" && (
            <>
              {console.log("Rendering ProjectCreator component")}
              <ProjectCreator onProjectCreated={handleProjectCreated} userId={user.id} />
            </>
          )}

          {activeView === "calculator" && !currentProject && (
            <div className="text-center py-12">
              <Ship className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Project Selected</h3>
              <p className="text-slate-600 mb-4">Create or select a project to start the GWP analysis</p>
              <Button onClick={() => setActiveView("projects")} className="bg-blue-600 hover:bg-blue-700">
                <Ship className="h-4 w-4 mr-2" />
                Go to Projects
              </Button>
            </div>
          )}

          {activeView === "calculator" && currentProject && (
            <div className="space-y-6">
              {/* Calculator Steps Navigation */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Analysis Workflow</h3>
                    <Badge variant="outline">Step {currentStep} of 5</Badge>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { step: 1, label: "Upload", icon: Upload },
                      { step: 2, label: "Processing", icon: Activity },
                      { step: 3, label: "Validation", icon: CheckCircle },
                      { step: 4, label: "Calculation", icon: Calculator },
                      { step: 5, label: "Results", icon: BarChart3 },
                    ].map((item) => {
                      const Icon = item.icon
                      const isActive = currentStep === item.step
                      const isCompleted = currentStep > item.step
                      return (
                        <div
                          key={item.step}
                          className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-blue-50 border border-blue-200"
                              : isCompleted
                                ? "bg-green-50 border border-green-200"
                                : "bg-slate-50 border border-slate-200"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                              isActive
                                ? "bg-blue-100 text-blue-600"
                                : isCompleted
                                  ? "bg-green-100 text-green-600"
                                  : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{item.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Step Content */}
              {currentStep === 1 && (
                <FileUploader onFilesUploaded={handleFilesUploaded} uploadedFiles={uploadedFiles} />
              )}

              {currentStep === 2 && (
                <DocumentProcessor
                  files={uploadedFiles}
                  onDataProcessed={handleDataProcessed}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}

              {currentStep === 3 && processedData && (
                <ParsingValidation parsedDocuments={processedData} onValidationComplete={handleValidationComplete} />
              )}

              {currentStep === 4 && (
                <GWPCalculator processedData={validatedData} onGWPCalculated={handleGWPCalculated} />
              )}

              {currentStep === 5 && gwpResults && <ResultsDisplay gwpResults={gwpResults} onReset={resetTool} />}
            </div>
          )}

          {activeView === "materials" && authService.hasAccess("admin") && <MaterialsManager />}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
