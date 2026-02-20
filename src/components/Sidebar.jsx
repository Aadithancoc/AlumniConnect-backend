import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    CalendarDays,
    BarChart3,
    LogOut,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import "./Sidebar.css";

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/users", label: "User Management", icon: Users },
    { to: "/jobs", label: "Job Moderation", icon: Briefcase },
    { to: "/events", label: "Event Management", icon: CalendarDays },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar({ collapsed, setCollapsed }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await logout(); } catch { }
        navigate("/");
    };

    return (
        <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <GraduationCap size={24} strokeWidth={2.2} />
                </div>
                {!collapsed && (
                    <div className="sidebar-brand-text animate-fade-in">
                        <span className="sidebar-brand-name">AlumniConnect</span>
                        <span className="sidebar-brand-sub">Admin Panel</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-nav-label">
                    {!collapsed && "MENU"}
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
                        }
                        title={item.label}
                    >
                        <item.icon size={20} strokeWidth={1.8} />
                        {!collapsed && <span>{item.label}</span>}
                        {!collapsed && <div className="sidebar-link-indicator" />}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom actions */}
            <div className="sidebar-bottom">
                <button className="sidebar-link sidebar-logout" onClick={handleLogout} title="Sign Out">
                    <LogOut size={20} strokeWidth={1.8} />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                <button
                    className="sidebar-collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </aside>
    );
}
