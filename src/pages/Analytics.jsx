import { useEffect, useState } from "react";
import {
    BarChart3,
    TrendingUp,
    Users,
    Briefcase,
    CalendarDays,
    Award,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
} from "recharts";
import {
    fetchUsers,
    fetchJobs,
    fetchEvents,
    fetchEngagementData,
    computeUserGrowth,
    computeTopCompanies,
    computeDepartmentDistribution,
    computeEventParticipation,
} from "../services/firestoreService";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Analytics.css";

const PIE_COLORS = [
    "#2BB673", "#34d68a", "#6ee7a7", "#a7f3d0",
    "#d1fae5", "#bbf7d0", "#059669",
];

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [growthData, setGrowthData] = useState([]);
    const [topCompanies, setTopCompanies] = useState([]);
    const [deptDistribution, setDeptDistribution] = useState([]);
    const [eventParticipation, setEventParticipation] = useState([]);
    const [engagementData, setEngagementData] = useState([]);
    const [radarData, setRadarData] = useState([]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const [users, jobs, events, engagement] = await Promise.all([
                    fetchUsers(),
                    fetchJobs(),
                    fetchEvents(),
                    fetchEngagementData(),
                ]);

                if (cancelled) return;

                setGrowthData(computeUserGrowth(users));
                setTopCompanies(computeTopCompanies(jobs));
                setDeptDistribution(computeDepartmentDistribution(users));
                setEventParticipation(computeEventParticipation(events));

                // If engagement collection exists, use it; otherwise build from available data
                if (engagement.length > 0) {
                    setEngagementData(engagement);
                } else {
                    // Build engagement proxy from jobs + events per month
                    const monthMap = {};
                    jobs.forEach((j) => {
                        const raw = j.postedAt || j.createdAt;
                        if (!raw) return;
                        const date = raw.toDate ? raw.toDate() : new Date(raw);
                        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                        const month = date.toLocaleDateString("en-US", { month: "short" });
                        if (!monthMap[key]) monthMap[key] = { key, month, posts: 0, events: 0, activity: 0 };
                        monthMap[key].posts += 1;
                        monthMap[key].activity += 1;
                    });
                    events.forEach((e) => {
                        const raw = e.date || e.createdAt;
                        if (!raw) return;
                        const date = raw.toDate ? raw.toDate() : new Date(raw);
                        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                        const month = date.toLocaleDateString("en-US", { month: "short" });
                        if (!monthMap[key]) monthMap[key] = { key, month, posts: 0, events: 0, activity: 0 };
                        monthMap[key].events += 1;
                        monthMap[key].activity += (e.participants || 0);
                    });
                    setEngagementData(
                        Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key)).slice(-12)
                    );
                }

                // Build radar from actual data
                const totalParticipants = events.reduce((s, e) => s + (e.participants || 0), 0);
                setRadarData([
                    { subject: "Registrations", A: Math.min(users.length, 100) },
                    { subject: "Job Posts", A: Math.min(jobs.length * 5, 100) },
                    { subject: "Events", A: Math.min(events.length * 8, 100) },
                    { subject: "Participation", A: Math.min(Math.round(totalParticipants / Math.max(events.length, 1)), 100) },
                    { subject: "Companies", A: Math.min(new Set(jobs.map((j) => j.company)).size * 8, 100) },
                    { subject: "Departments", A: Math.min(new Set(users.map((u) => u.department)).size * 12, 100) },
                ]);
            } catch (err) {
                console.error("Failed to load analytics:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <LoadingSpinner message="Loading analytics..." />;

    return (
        <div className="analytics">
            <div className="an-header animate-fade-in-up">
                <div>
                    <h2 className="an-title">Analytics & Insights</h2>
                    <p className="an-subtitle">
                        Data-driven overview of the AlumniConnect ecosystem
                    </p>
                </div>
                <div className="an-badge">
                    <BarChart3 size={14} />
                    Real-time data
                </div>
            </div>

            {/* Row 1: Growth + Top Companies */}
            <div className="an-row an-row-2 stagger">
                <div className="an-card animate-fade-in-up">
                    <div className="an-card-header">
                        <div>
                            <h3 className="an-card-title">
                                <TrendingUp size={16} /> Alumni Growth Trend
                            </h3>
                            <p className="an-card-subtitle">Registration growth over time</p>
                        </div>
                    </div>
                    {growthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={growthData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="growthGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2BB673" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2BB673" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", fontSize: 13 }} />
                                <Area type="monotone" dataKey="users" stroke="#2BB673" strokeWidth={2.5} fill="url(#growthGrad2)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="an-empty">No growth data available yet. Add users with a joinedAt or createdAt field.</p>
                    )}
                </div>

                <div className="an-card animate-fade-in-up">
                    <div className="an-card-header">
                        <div>
                            <h3 className="an-card-title">
                                <Briefcase size={16} /> Top Hiring Companies
                            </h3>
                            <p className="an-card-subtitle">Most active companies posting jobs</p>
                        </div>
                    </div>
                    {topCompanies.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topCompanies} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} width={80} />
                                <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", fontSize: 13 }} />
                                <Bar dataKey="jobs" fill="#2BB673" radius={[0, 6, 6, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="an-empty">No job data available yet.</p>
                    )}
                </div>
            </div>

            {/* Row 2: Engagement + Department Distribution */}
            <div className="an-row an-row-2 stagger">
                <div className="an-card animate-fade-in-up">
                    <div className="an-card-header">
                        <div>
                            <h3 className="an-card-title">
                                <Award size={16} /> Activity Metrics
                            </h3>
                            <p className="an-card-subtitle">Platform activity over time</p>
                        </div>
                    </div>
                    {engagementData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={engagementData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", fontSize: 13 }} />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                <Bar dataKey="posts" fill="#2BB673" radius={[4, 4, 0, 0]} barSize={14} name="Jobs Posted" />
                                <Bar dataKey="events" fill="#6ee7a7" radius={[4, 4, 0, 0]} barSize={14} name="Events Created" />
                                {engagementData[0]?.activity !== undefined && (
                                    <Line type="monotone" dataKey="activity" stroke="#1f9e5e" strokeWidth={2} dot={{ r: 3 }} name="Activity" />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="an-empty">No activity data available yet.</p>
                    )}
                </div>

                <div className="an-card animate-fade-in-up">
                    <div className="an-card-header">
                        <div>
                            <h3 className="an-card-title">
                                <Users size={16} /> Department Distribution
                            </h3>
                            <p className="an-card-subtitle">Alumni by academic department</p>
                        </div>
                    </div>
                    {deptDistribution.length > 0 ? (
                        <div className="an-pie-wrap">
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={deptDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {deptDistribution.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", fontSize: 13 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="an-pie-legend">
                                {deptDistribution.map((d, i) => (
                                    <div className="an-pie-legend-item" key={i}>
                                        <span className="an-pie-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="an-pie-label">{d.name}</span>
                                        <span className="an-pie-value">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="an-empty">No department data available yet.</p>
                    )}
                </div>
            </div>

            {/* Row 3: Event Participation + Engagement Radar */}
            <div className="an-row an-row-2 stagger">
                <div className="an-card animate-fade-in-up">
                    <div className="an-card-header">
                        <div>
                            <h3 className="an-card-title">
                                <CalendarDays size={16} /> Event Participation
                            </h3>
                            <p className="an-card-subtitle">Attendance across platform events</p>
                        </div>
                    </div>
                    {eventParticipation.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={eventParticipation} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", fontSize: 13 }} />
                                <Bar dataKey="value" fill="#2BB673" radius={[6, 6, 0, 0]} barSize={32} name="Participants" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="an-empty">No event participation data yet.</p>
                    )}
                </div>

                <div className="an-card animate-fade-in-up">
                    <div className="an-card-header">
                        <div>
                            <h3 className="an-card-title">
                                <BarChart3 size={16} /> Platform Activity Radar
                            </h3>
                            <p className="an-card-subtitle">Alumni engagement categories</p>
                        </div>
                    </div>
                    {radarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart cx="50%" cy="50%" outerRadius={100} data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6B7280" }} />
                                <PolarRadiusAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                                <Radar name="Score" dataKey="A" stroke="#2BB673" fill="#2BB673" fillOpacity={0.2} strokeWidth={2} />
                                <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", fontSize: 13 }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="an-empty">Not enough data for radar chart.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
