// Admin SPA entry. Routes are nested under /admin/* and gated by useSession().
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "../styles/colors_and_type.css";
import "../styles/admin.css";

import { useToast } from "./Toast";
import { Login } from "./Login";
import { useSession } from "./auth";
import { Shell } from "./Shell";
import Overview from "./Overview";
import NewsAdmin from "./NewsAdmin";
import Pages from "./Pages";
import Members from "./Members";
import Messages from "./Messages";
import Settings from "./Settings";

function AdminApp() {
  // Hooks are called unconditionally at the top, in stable order across renders.
  const session = useSession();
  const { node: toastNode, toast } = useToast();

  if (!session) {
    return (
      <>
        <Login onIn={() => {
          /* useSession listens for session changes and re-renders */
        }} />
        {toastNode}
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/admin" element={<Shell onSignOut={() => { /* useSession re-renders */ }} />}>
          <Route index element={<Overview />} />
          <Route path="news" element={<NewsAdmin toast={toast} />} />
          <Route path="pages" element={<Pages toast={toast} />} />
          <Route path="members" element={<Members toast={toast} />} />
          <Route path="messages" element={<Messages toast={toast} />} />
          <Route path="settings" element={<Settings toast={toast} />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      {toastNode}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AdminApp />
    </BrowserRouter>
  </StrictMode>
);
