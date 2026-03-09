import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Breeders from "./pages/Breeders";
import Trainers from "./pages/Trainers";
import DogProfile from "./pages/DogProfile";
import Auth from "./pages/Auth";
import BreederDashboard from "./pages/BreederDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import SuperadminDashboard from "./pages/SuperadminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Routes>
                <Route path="/" element={<><Navigation /><Home /></>} />
                <Route path="/about" element={<><Navigation /><About /></>} />
                <Route path="/breeders" element={<><Navigation /><Breeders /></>} />
                <Route path="/trainers" element={<><Navigation /><Trainers /></>} />
                <Route path="/dog/:id" element={<><Navigation /><DogProfile /></>} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/breeder-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["breeder", "superadmin", "admin"]}>
                      <BreederDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["trainer", "superadmin", "admin"]}>
                      <TrainerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/superadmin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                      <SuperadminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<><Navigation /><NotFound /></>} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;



// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./contexts/AuthContext";
// import { NotificationProvider } from "./contexts/NotificationContext";
// import Navigation from "./components/Navigation";
// import Home from "./pages/Home";
// import About from "./pages/About";
// import Breeders from "./pages/Breeders";
// import Trainers from "./pages/Trainers";
// import DogProfile from "./pages/DogProfile";
// import Auth from "./pages/Auth";
// import BreederDashboard from "./pages/BreederDashboard";
// import TrainerDashboard from "./pages/TrainerDashboard";
// import SuperadminDashboard from "./pages/SuperadminDashboard";
// import NotFound from "./pages/NotFound";
//
// const queryClient = new QueryClient();
//
// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <AuthProvider>
//       <NotificationProvider>
//         <TooltipProvider>
//           <Toaster />
//           <Sonner />
//           <BrowserRouter>
//             <div className="min-h-screen flex flex-col">
//               <Routes>
//                 <Route path="/" element={<><Navigation /><Home /></>} />
//                 <Route path="/about" element={<><Navigation /><About /></>} />
//                 <Route path="/breeders" element={<><Navigation /><Breeders /></>} />
//                 <Route path="/trainers" element={<><Navigation /><Trainers /></>} />
//                 <Route path="/dog/:id" element={<><Navigation /><DogProfile /></>} />
//                 <Route path="/auth" element={<Auth />} />
//                 <Route path="/breeder-dashboard" element={<BreederDashboard />} />
//                 <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
//                 <Route path="/superadmin-dashboard" element={<SuperadminDashboard />} />
//                 <Route path="*" element={<><Navigation /><NotFound /></>} />
//               </Routes>
//             </div>
//           </BrowserRouter>
//         </TooltipProvider>
//       </NotificationProvider>
//     </AuthProvider>
//   </QueryClientProvider>
// );
//
// export default App;
