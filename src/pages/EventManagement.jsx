import { useState, useEffect } from "react";
import {
    CalendarDays,
    MapPin,
    Users,
    Trash2,
    Eye,
    X,
    Search,
    AlertTriangle,
    Clock,
    CheckCircle2,
    CalendarCheck,
} from "lucide-react";
import { subscribeToEvents, deleteEvent } from "../services/firestoreService";
import LoadingSpinner from "../components/LoadingSpinner";
import "./EventManagement.css";

export default function EventManagement() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Real-time subscription to events collection
    useEffect(() => {
        const unsub = subscribeToEvents((data) => {
            setEvents(data);
            setLoading(false);
        });
        return unsub;
    }, []);

    const getEventStatus = (ev) => {
        if (ev.status) return ev.status;
        const date = ev.date?.toDate ? ev.date.toDate() : new Date(ev.date);
        return date > new Date() ? "upcoming" : "completed";
    };

    const filtered = events.filter((ev) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            (ev.title || "").toLowerCase().includes(q) ||
            (ev.organizer || "").toLowerCase().includes(q);
        const status = getEventStatus(ev);
        const matchFilter = filter === "all" || status === filter;
        return matchSearch && matchFilter;
    });

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            await deleteEvent(id);
        } catch (err) {
            console.error("Failed to delete event:", err);
            alert("Failed to delete event. Please try again.");
        }
        setDeleting(false);
        setDeleteConfirm(null);
    };

    const totalParticipants = events.reduce((s, e) => s + (e.participants || 0), 0);
    const upcomingCount = events.filter((e) => getEventStatus(e) === "upcoming").length;
    const completedCount = events.filter((e) => getEventStatus(e) === "completed").length;

    if (loading) return <LoadingSpinner message="Loading events..." />;

    return (
        <div className="event-mgmt">
            {/* Header */}
            <div className="em-header animate-fade-in-up">
                <div>
                    <h2 className="em-title">Event Management</h2>
                    <p className="em-subtitle">Monitor and manage platform events</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="em-quick-stats stagger">
                <div className="em-qstat animate-fade-in-up">
                    <CalendarDays size={20} className="em-qstat-icon" />
                    <div>
                        <div className="em-qstat-value">{events.length}</div>
                        <div className="em-qstat-label">Total Events</div>
                    </div>
                </div>
                <div className="em-qstat animate-fade-in-up">
                    <CalendarCheck size={20} className="em-qstat-icon" style={{ color: "var(--primary)" }} />
                    <div>
                        <div className="em-qstat-value">{upcomingCount}</div>
                        <div className="em-qstat-label">Upcoming</div>
                    </div>
                </div>
                <div className="em-qstat animate-fade-in-up">
                    <CheckCircle2 size={20} className="em-qstat-icon" style={{ color: "var(--info)" }} />
                    <div>
                        <div className="em-qstat-value">{completedCount}</div>
                        <div className="em-qstat-label">Completed</div>
                    </div>
                </div>
                <div className="em-qstat animate-fade-in-up">
                    <Users size={20} className="em-qstat-icon" style={{ color: "#8B5CF6" }} />
                    <div>
                        <div className="em-qstat-value">{totalParticipants.toLocaleString()}</div>
                        <div className="em-qstat-label">Total Participants</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="em-controls animate-fade-in-up">
                <div className="em-search-wrap">
                    <Search size={16} className="em-search-icon" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="em-search-input"
                        id="event-search"
                    />
                </div>
                <div className="em-tabs">
                    {["all", "upcoming", "completed"].map((f) => (
                        <button
                            key={f}
                            className={`em-tab ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Event List */}
            <div className="em-list stagger">
                {filtered.map((ev) => {
                    const status = getEventStatus(ev);
                    const rawDate = ev.date?.toDate ? ev.date.toDate() : new Date(ev.date);
                    const dateStr = rawDate.toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                    });

                    return (
                        <div className="em-card animate-fade-in-up" key={ev.id}>
                            <div className="em-card-left">
                                <div className={`em-card-status-dot ${status}`} />
                                <div className="em-card-date-block">
                                    <span className="em-card-day">{rawDate.getDate()}</span>
                                    <span className="em-card-month">
                                        {rawDate.toLocaleDateString("en-US", { month: "short" })}
                                    </span>
                                </div>
                            </div>

                            <div className="em-card-body">
                                <div className="em-card-top-row">
                                    <h3 className="em-card-title">{ev.title || "Untitled"}</h3>
                                    <span className={`em-status-badge ${status}`}>
                                        {status === "upcoming" ? (
                                            <><Clock size={11} /> Upcoming</>
                                        ) : (
                                            <><CheckCircle2 size={11} /> Completed</>
                                        )}
                                    </span>
                                </div>
                                {ev.description && (
                                    <p className="em-card-desc">{ev.description}</p>
                                )}
                                <div className="em-card-meta">
                                    <span>
                                        <MapPin size={13} /> {ev.location || "TBD"}
                                    </span>
                                    <span>
                                        <Users size={13} /> {ev.participants || 0} participants
                                    </span>
                                    {ev.organizer && (
                                        <span>
                                            <CalendarDays size={13} /> Organized by {ev.organizer}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="em-card-actions">
                                <button
                                    className="jm-action-btn jm-view"
                                    onClick={() => setSelectedEvent(ev)}
                                    title="View details"
                                >
                                    <Eye size={15} />
                                </button>
                                <button
                                    className="jm-action-btn jm-delete"
                                    onClick={() => setDeleteConfirm(ev)}
                                    title="Remove event"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="jm-empty">
                        <CalendarDays size={40} strokeWidth={1} />
                        <p>No events found</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedEvent && (
                <div className="jm-modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="jm-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <button className="jm-modal-close" onClick={() => setSelectedEvent(null)}>
                            <X size={18} />
                        </button>
                        <div className="jm-modal-icon" style={{ background: "var(--primary-bg)", color: "var(--primary)" }}>
                            <CalendarDays size={24} />
                        </div>
                        <h3 className="jm-modal-title">{selectedEvent.title || "Untitled"}</h3>
                        <p className="jm-modal-company">{selectedEvent.organizer || "—"}</p>

                        <div className="jm-modal-grid">
                            <div className="jm-modal-item">
                                <span className="jm-modal-label">Date</span>
                                <span className="jm-modal-value">
                                    {selectedEvent.date
                                        ? (selectedEvent.date.toDate
                                            ? selectedEvent.date.toDate()
                                            : new Date(selectedEvent.date)
                                        ).toLocaleDateString()
                                        : "—"}
                                </span>
                            </div>
                            <div className="jm-modal-item">
                                <span className="jm-modal-label">Status</span>
                                <span className="jm-modal-value" style={{ textTransform: "capitalize" }}>
                                    {getEventStatus(selectedEvent)}
                                </span>
                            </div>
                            <div className="jm-modal-item">
                                <span className="jm-modal-label">Location</span>
                                <span className="jm-modal-value">{selectedEvent.location || "TBD"}</span>
                            </div>
                            <div className="jm-modal-item">
                                <span className="jm-modal-label">Participants</span>
                                <span className="jm-modal-value">{selectedEvent.participants || 0}</span>
                            </div>
                        </div>

                        {selectedEvent.description && (
                            <div className="jm-modal-desc">
                                <span className="jm-modal-label">Description</span>
                                <p>{selectedEvent.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="jm-modal-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
                    <div className="jm-confirm animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="jm-confirm-icon">
                            <AlertTriangle size={28} />
                        </div>
                        <h3>Remove Event?</h3>
                        <p>
                            Are you sure you want to remove <strong>"{deleteConfirm.title || "this event"}"</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="jm-confirm-actions">
                            <button className="jm-confirm-cancel" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                                Cancel
                            </button>
                            <button className="jm-confirm-delete" onClick={() => handleDelete(deleteConfirm.id)} disabled={deleting}>
                                {deleting ? (
                                    <span className="login-spinner" style={{ width: 16, height: 16 }} />
                                ) : (
                                    <>
                                        <Trash2 size={15} />
                                        Remove
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
