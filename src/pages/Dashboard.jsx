import { useEffect, useState } from "react";
import {
    Users,
    Briefcase,
    CalendarDays,
    TrendingUp,
    ArrowUpRight,
    Activity,
    UserPlus,
    Clock,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import {
    fetchDashboardStats,
    computeUserGrowth,
} from "../services/firestoreService";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Dashboard.css";

const colorMap = {
    green: { bg: "rgba(43,182,115,0.1)", fg: "#2BB673" },
    blue: { bg: "rgba(59,130,246,0.1)", fg: "#3B82F6" },
    purple: { bg: "rgba(139,92,246,0.1)", fg: "#8B5CF6" },
    orange: { bg: "rgba(245,158,11,0.1)", fg: "#F59E0B" },
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const result = await fetchDashboardStats();
                if (!cancelled) setData(result);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <LoadingSpinner message="Loading dashboard..." />;
    if (!data) return <p style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Failed to load data. Check Firebase configuration.</p>;

    const { totalAlumni, totalJobs, totalEvents, recentUsers, recentJobs, upcomingEvents, users } = data;

    const growthData = computeUserGrowth(users);

    // Compute a simple engagement proxy from jobs (posts per month)
    const engagementByMonth = {};
    data.jobs.forEach((j) => {
        const raw = j.postedAt || j.createdAt;
        if (!raw) return;
        const date = raw.toDate ? raw.toDate() : new Date(raw);
        const month = date.toLocaleDateString("en-US", { month: "short" });
        if (!engagementByMonth[month]) engagementByMonth[month] = { month, posts: 0, events: 0 };
        engagementByMonth[month].posts += 1;
    });
    data.events.forEach((e) => {
        const raw = e.date || e.createdAt;
        if (!raw) return;
        const date = raw.toDate ? raw.toDate() : new Date(raw);
        const month = date.toLocaleDateString("en-US", { month: "short" });
        if (!engagementByMonth[month]) engagementByMonth[month] = { month, posts: 0, events: 0 };
        engagementByMonth[month].events += 1;
    });
    const engagementData = Object.values(engagementByMonth).slice(-6);

    const totalParticipants = data.events.reduce((s, e) => s + (e.participants || 0), 0);
    const engagementRate = totalAlumni > 0
        ? Math.round(((totalJobs + totalEvents + totalParticipants) / totalAlumni) * 100)
        : 0;

    const stats = [
        { label: "Total Alumni", value: totalAlumni.toLocaleString(), icon: Users, color: "green" },
        { label: "Job Postings", value: totalJobs.toLocaleString(), icon: Briefcase, color: "blue" },
        { label: "Events Created", value: totalEvents.toLocaleString(), icon: CalendarDays, color: "purple" },
        { label: "Engagement Rate", value: `${Math.min(engagementRate, 100)}%`, icon: TrendingUp, color: "orange" },
    ];

    return (
        <div className="dashboard">
            {/* Stat Cards */}
            <div className="dash-stats stagger">
                {stats.map((s, i) => {
                    const c = colorMap[s.color];
                    return (
                        <div className="dash-stat-card animate-fade-in-up" key={i}>
                            <div className="dash-stat-top">
                                <div className="dash-stat-icon" style={{ background: c.bg, color: c.fg }}>
                                    <s.icon size={20} strokeWidth={1.8} />
                                </div>
                                <span className="dash-stat-change up">
                                    <ArrowUpRight size={14} />
                                    Live
                                </span>
                            </div>
                            <div className="dash-stat-value">{s.value}</div>
                            <div className="dash-stat-label">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="dash-charts stagger">
                <div className="dash-card dash-card--wide animate-fade-in-up">
                    <div className="dash-card-header">
                        <div>
                            <h3 className="dash-card-title">Alumni Growth</h3>
                            <p className="dash-card-subtitle">Registration trend over time</p>
                        </div>
                        <div className="dash-badge">
                            <Activity size={14} />
                            Live
                        </div>
                    </div>
                    <div className="dash-chart-wrap">
                        {growthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2BB673" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#2BB673" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", fontSize: 13 }} />
                                    <Area type="monotone" dataKey="users" stroke="#2BB673" strokeWidth={2.5} fill="url(#growthGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="dash-empty-chart">No registration data available yet</p>
                        )}
                    </div>
                </div>

                <div className="dash-card animate-fade-in-up">
                    <div className="dash-card-header">
                        <div>
                            <h3 className="dash-card-title">Activity</h3>
                            <p className="dash-card-subtitle">Jobs & events per month</p>
                        </div>
                    </div>
                    <div className="dash-chart-wrap">
                        {engagementData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", fontSize: 13 }} />
                                    <Bar dataKey="posts" fill="#2BB673" radius={[4, 4, 0, 0]} barSize={14} name="Jobs" />
                                    <Bar dataKey="events" fill="#6ee7a7" radius={[4, 4, 0, 0]} barSize={14} name="Events" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="dash-empty-chart">No activity data available yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="dash-bottom stagger">
                {/* Recent Users */}
                <div className="dash-card animate-fade-in-up">
                    <div className="dash-card-header">
                        <div>
                            <h3 className="dash-card-title">Recent Registrations</h3>
                            <p className="dash-card-subtitle">Newest alumni members</p>
                        </div>
                        <UserPlus size={18} className="dash-card-header-icon" />
                    </div>
                    <div className="dash-user-list">
                        {recentUsers.length > 0 ? recentUsers.map((u) => (
                            <div className="dash-user-item" key={u.id}>
                                <div className="dash-user-avatar">
                                    {(u.name || u.email || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="dash-user-info">
                                    <span className="dash-user-name">{u.name || "Unknown"}</span>
                                    <span className="dash-user-meta">
                                        {u.department || "N/A"} · Batch {u.batch || "N/A"}
                                    </span>
                                </div>
                                <span className="dash-user-company">{u.company || "—"}</span>
                            </div>
                        )) : (
                            <p className="dash-empty-chart">No alumni registered yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Jobs */}
                <div className="dash-card animate-fade-in-up">
                    <div className="dash-card-header">
                        <div>
                            <h3 className="dash-card-title">Latest Job Postings</h3>
                            <p className="dash-card-subtitle">Recently posted opportunities</p>
                        </div>
                        <Briefcase size={18} className="dash-card-header-icon" />
                    </div>
                    <div className="dash-job-list">
                        {recentJobs.length > 0 ? recentJobs.map((j) => (
                            <div className="dash-job-item" key={j.id}>
                                <div className="dash-job-icon">
                                    <Briefcase size={16} />
                                </div>
                                <div className="dash-job-info">
                                    <span className="dash-job-title">{j.title || "Untitled"}</span>
                                    <span className="dash-job-company">
                                        {j.company || "Unknown"} · {j.location || "N/A"}
                                    </span>
                                </div>
                                <span className="dash-job-type">{j.type || "Job"}</span>
                            </div>
                        )) : (
                            <p className="dash-empty-chart">No jobs posted yet</p>
                        )}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="dash-card animate-fade-in-up">
                    <div className="dash-card-header">
                        <div>
                            <h3 className="dash-card-title">Upcoming Events</h3>
                            <p className="dash-card-subtitle">Scheduled activities</p>
                        </div>
                        <CalendarDays size={18} className="dash-card-header-icon" />
                    </div>
                    <div className="dash-event-list">
                        {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 4).map((ev) => {
                            const rawDate = ev.date?.toDate ? ev.date.toDate() : new Date(ev.date);
                            const dateStr = rawDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                            return (
                                <div className="dash-event-item" key={ev.id}>
                                    <div className="dash-event-date">
                                        <Clock size={14} />
                                        <span>{dateStr}</span>
                                    </div>
                                    <div className="dash-event-info">
                                        <span className="dash-event-title">{ev.title || "Untitled"}</span>
                                        <span className="dash-event-meta">
                                            {ev.location || "TBD"} · {ev.participants || 0} participants
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="dash-empty-chart">No upcoming events</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
