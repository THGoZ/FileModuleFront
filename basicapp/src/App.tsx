import { Route, BrowserRouter as Router, Routes } from "react-router";
import "./App.css";
import Login from "./pages/account/login";
import Register from "./pages/account/register";
import NotFoundPage from "./pages/not-found";
import Navbar from "./components/navbar";
import { AuthProvider } from "./context/AuthContext";
import PublicRoutes from "./routes/PublicRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Dashboard from "./pages/dashboard";
import Home from "./pages/home";
import UploadImageForm from "./pages/images/upload-image-form";
import { ImagesProvider } from "./context/ImagesContext";
import ImageGallery from "./pages/images/image-gallery";
import Profile from "./pages/account/profile";
import UserImages from "./pages/images/user-images";

function App() {
  return (
    <AuthProvider>
      <ImagesProvider>
        <div className="my-4">
          <Router>
            <main className="flex flex-col">
              <Navbar />
              <Routes>
                <Route
                  path="/login"
                  element={<PublicRoutes element={<Login />} />}
                />
                <Route
                  path="/register"
                  element={<PublicRoutes element={<Register />} />}
                />
                <Route
                  path="/account/profile"
                  element={<ProtectedRoutes element={<Profile />} />}
                />
                <Route
                  path="/account/images"
                  element={<ProtectedRoutes element={<UserImages />} />}
                />
                <Route path="/" element={<PublicRoutes element={<Home />} />} />
                <Route path="/images" element={<ImageGallery />} />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoutes element={<Dashboard />} />}
                />
                <Route
                  path="/upload-image"
                  element={<ProtectedRoutes element={<UploadImageForm />} />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </Router>
        </div>
      </ImagesProvider>
    </AuthProvider>
  );
}

export default App;
