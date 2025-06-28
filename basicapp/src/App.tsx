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
import { ToastProvider } from "./context/ToastContext";
import UploadDocumentForm from "./pages/documents/upload-document-form";
import { DocumentsProvider } from "./context/DocumentsContext";
import DocumentList from "./pages/documents/document-list";
import DocumentManagement from "./pages/documents/document-management";
import type { UserRole } from "./constants/enums";
import { UsersProvider } from "./context/UsersContext";
import ManageUsers from "./pages/administrator/admin-users";
import UnauthorizedPage from "./pages/unauthorized";

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <ImagesProvider>
          <DocumentsProvider>
            <ToastProvider>
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
                      <Route
                        path="/account/documents"
                        element={
                          <ProtectedRoutes element={<DocumentManagement />} />
                        }
                      />
                      <Route
                        path="/"
                        element={<PublicRoutes element={<Home />} />}
                      />
                      <Route path="/images" element={<ImageGallery />} />
                      <Route path="/documents" element={<DocumentList />} />
                      <Route
                        path="/dashboard"
                        element={<ProtectedRoutes element={<Dashboard />} />}
                      />
                      <Route
                        path="/uploads/image"
                        element={
                          <ProtectedRoutes element={<UploadImageForm />} />
                        }
                      />
                      <Route
                        path="/uploads/document"
                        element={
                          <ProtectedRoutes
                            element={<UploadDocumentForm />}
                            allowedRoles={["user" as UserRole, "admin" as UserRole]}
                          />
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <ProtectedRoutes element={<ManageUsers />} allowedRoles={["admin" as UserRole]} />
                        }
                      />
                      <Route path="/unauthorized" element={<UnauthorizedPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                </Router>
              </div>
            </ToastProvider>
          </DocumentsProvider>
        </ImagesProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;
