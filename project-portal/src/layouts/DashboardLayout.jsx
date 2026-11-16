
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <div
      className={`app-layout ${
        isSidebarVisible ? "app-layout--sidebar-open" : ""
      }`}
    >
      {isSidebarVisible && (
        <button
          type="button"
          className="layout-sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}
      <div
        className="layout-sidebar"
        id="portal-sidebar"
        hidden={!isSidebarVisible}
      >
        <Sidebar onNavigate={() => setIsSidebarVisible(false)} />
      </div>
      <button
        type="button"
        className="layout-sidebar-toggle"
        aria-controls="portal-sidebar"
        aria-expanded={isSidebarVisible}
        onClick={() => setIsSidebarVisible((isVisible) => !isVisible)}
      >
        {isSidebarVisible ? <X size={18} /> : <Menu size={18} />}
        {isSidebarVisible ? "Hide sidebar" : "View sidebar"}
      </button>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
