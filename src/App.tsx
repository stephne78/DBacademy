import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Formations from "./pages/Formations.tsx";
import MesFormations from "./pages/MesFormations.tsx";
import MonCompte from "./pages/MonCompte.tsx";
import CourseView from "./pages/CourseView.tsx";
import CourseChapter from "./pages/CourseChapter.tsx";
import CourseQuiz from "./pages/CourseQuiz.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/formations"
            element={
              <ProtectedRoute>
                <Formations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-formations"
            element={
              <ProtectedRoute>
                <MesFormations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mon-compte"
            element={
              <ProtectedRoute>
                <MonCompte />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cours/:courseId/chapitre/:chapterId"
            element={
              <ProtectedRoute>
                <CourseChapter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cours/:courseId/quiz"
            element={
              <ProtectedRoute>
                <CourseQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cours/:courseId"
            element={
              <ProtectedRoute>
                <CourseView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
