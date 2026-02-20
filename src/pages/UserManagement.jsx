import { useState, useMemo, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Users as UsersIcon,
    Mail,
    Building2,
    X,
} from "lucide-react";
import { subscribeToUsers } from "../services/firestoreService";
import LoadingSpinner from "../components/LoadingSpinner";
import "./UserManagement.css";

const PAGE_SIZE = 8;

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dept, setDept] = useState("All Departments");
    const [batch, setBatch] = useState("All Batches");
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);

    // Real-time subscription to users collection
    useEffect(() => {
        const unsub = subscribeToUsers((data) => {
            setUsers(data);
            setLoading(false);
        });
        return unsub;
    }, []);

    // Dynamically build department and batch filter lists from real data
    const departments = useMemo(() => {
        const set = new Set(users.map((u) => u.department).filter(Boolean));
        return ["All Departments", ...Array.from(set).sort()];
    }, [users]);

    const batches = useMemo(() => {
        const set = new Set(users.map((u) => u.batch).filter(Boolean));
        return ["All Batches", ...Array.from(set).sort()];
    }, [users]);

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                (u.name || "").toLowerCase().includes(q) ||
                (u.email || "").toLowerCase().includes(q) ||
                (u.company || "").toLowerCase().includes(q);
            const matchDept = dept === "All Departments" || u.department === dept;
            const matchBatch = batch === "All Batches" || u.batch === batch;
            return matchSearch && matchDept && matchBatch;
        });
    }, [search, dept, batch, users]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const exportCSV = () => {
        const headers = ["Name", "Email", "Batch", "Department", "Company", "Designation"];
        const rows = filtered.map((u) => [
            u.name || "", u.email || "", u.batch || "", u.department || "", u.company || "", u.designation || "",
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "alumni_data.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <LoadingSpinner message="Loading alumni data..." />;

    return (
        <div className="user-mgmt">
            {/* Header */}
            <div className="um-header animate-fade-in-up">
                <div>
                    <h2 className="um-title">Alumni Directory</h2>
                    <p className="um-subtitle">
                        Manage and monitor {users.length} registered alumni
                    </p>
                </div>
                <button className="um-export-btn" onClick={exportCSV} id="export-csv-btn">
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="um-filters animate-fade-in-up">
                <div className="um-search-wrap">
                    <Search size={16} className="um-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or company..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="um-search-input"
                        id="user-search"
                    />
                    {search && (
                        <button className="um-search-clear" onClick={() => setSearch("")}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="um-filter-group">
                    <Filter size={16} className="um-filter-icon" />
                    <div className="um-select-wrap">
                        <select
                            value={dept}
                            onChange={(e) => { setDept(e.target.value); setPage(1); }}
                            className="um-select"
                            id="dept-filter"
                        >
                            {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="um-select-arrow" />
                    </div>
                    <div className="um-select-wrap">
                        <select
                            value={batch}
                            onChange={(e) => { setBatch(e.target.value); setPage(1); }}
                            className="um-select"
                            id="batch-filter"
                        >
                            {batches.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="um-select-arrow" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="um-table-wrap animate-fade-in-up">
                <table className="um-table" id="users-table">
                    <thead>
                        <tr>
                            <th>Alumni</th>
                            <th>Department</th>
                            <th>Batch</th>
                            <th>Company</th>
                            <th>Designation</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((u) => {
                            const joinedRaw = u.joinedAt || u.createdAt;
                            const joinedStr = joinedRaw
                                ? (joinedRaw.toDate ? joinedRaw.toDate() : new Date(joinedRaw)).toLocaleDateString()
                                : "—";
                            return (
                                <tr
                                    key={u.id}
                                    className="um-row"
                                    onClick={() => setSelectedUser(u)}
                                >
                                    <td>
                                        <div className="um-user-cell">
                                            <div className="um-avatar">
                                                {(u.name || u.email || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="um-user-name">{u.name || "Unknown"}</div>
                                                <div className="um-user-email">{u.email || "—"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="um-dept-badge">{u.department || "—"}</span>
                                    </td>
                                    <td>{u.batch || "—"}</td>
                                    <td>
                                        <div className="um-company-cell">
                                            <Building2 size={13} />
                                            {u.company || "—"}
                                        </div>
                                    </td>
                                    <td>{u.designation || "—"}</td>
                                    <td className="um-date">{joinedStr}</td>
                                </tr>
                            );
                        })}
                        {paged.length === 0 && (
                            <tr>
                                <td colSpan={6} className="um-empty">
                                    No alumni found matching your criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
                <div className="um-pagination animate-fade-in">
                    <span className="um-page-info">
                        Showing {(page - 1) * PAGE_SIZE + 1}–
                        {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="um-page-btns">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="um-page-btn"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`um-page-btn ${page === i + 1 ? "active" : ""}`}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="um-page-btn"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="um-modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div
                        className="um-modal animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="um-modal-close"
                            onClick={() => setSelectedUser(null)}
                        >
                            <X size={18} />
                        </button>
                        <div className="um-modal-avatar">
                            {(selectedUser.name || selectedUser.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <h3 className="um-modal-name">{selectedUser.name || "Unknown"}</h3>
                        <p className="um-modal-designation">{selectedUser.designation || "—"}</p>
                        <div className="um-modal-details">
                            <div className="um-modal-detail">
                                <Mail size={15} />
                                <span>{selectedUser.email || "—"}</span>
                            </div>
                            <div className="um-modal-detail">
                                <Building2 size={15} />
                                <span>{selectedUser.company || "—"}</span>
                            </div>
                            <div className="um-modal-detail">
                                <UsersIcon size={15} />
                                <span>{selectedUser.department || "N/A"} · Batch {selectedUser.batch || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
