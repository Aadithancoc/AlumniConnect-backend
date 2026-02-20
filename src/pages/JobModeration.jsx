import { useState, useEffect } from "react";
import {
    Briefcase,
    MapPin,
    User,
    DollarSign,
    Trash2,
    Eye,
    X,
    Search,
    AlertTriangle,
} from "lucide-react";
import { subscribeToJobs, deleteJob } from "../services/firestoreService";
import LoadingSpinner from "../components/LoadingSpinner";
import "./JobModeration.css";

export default function JobModeration() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Real-time subscription to jobs collection
    useEffect(() => {
        const unsub = subscribeToJobs((data) => {
            setJobs(data);
            setLoading(false);
        });
        return unsub;
    }, []);

    const filtered = jobs.filter((j) => {
        const q = search.toLowerCase();
        return (
            !q ||
            (j.title || "").toLowerCase().includes(q) ||
            (j.company || "").toLowerCase().includes(q) ||
            (j.postedBy || "").toLowerCase().includes(q)
        );
    });

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            await deleteJob(id);
            // The real-time listener will update the list automatically
        } catch (err) {
            console.error("Failed to delete job:", err);
            alert("Failed to delete job. Please try again.");
        }
        setDeleting(false);
        setDeleteConfirm(null);
    };

    if (loading) return <LoadingSpinner message="Loading job postings..." />;

    return (
        <div className="job-mod">
            {/* Header */}
            <div className="jm-header animate-fade-in-up">
                <div>
                    <h2 className="jm-title">Job Moderation</h2>
                    <p className="jm-subtitle">
                        Review and manage {jobs.length} job postings
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="jm-search-bar animate-fade-in-up">
                <Search size={16} className="jm-search-icon" />
                <input
                    type="text"
                    placeholder="Search jobs by title, company, or poster..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="jm-search-input"
                    id="job-search"
                />
            </div>

            {/* Job Cards Grid */}
            <div className="jm-grid stagger">
                {filtered.map((job) => {
                    const postedDate = job.postedAt
                        ? (job.postedAt.toDate ? job.postedAt.toDate() : new Date(job.postedAt)).toLocaleDateString()
                        : "—";
                    return (
                        <div className="jm-card animate-fade-in-up" key={job.id}>
                            <div className="jm-card-top">
                                <div className="jm-card-icon">
                                    <Briefcase size={18} />
                                </div>
                                <span className="jm-card-type">{job.type || "Job"}</span>
                            </div>

                            <h3 className="jm-card-title">{job.title || "Untitled"}</h3>

                            <div className="jm-card-details">
                                <div className="jm-card-detail">
                                    <MapPin size={13} />
                                    <span>{job.company || "Unknown"} · {job.location || "N/A"}</span>
                                </div>
                                {job.salary && (
                                    <div className="jm-card-detail">
                                        <DollarSign size={13} />
                                        <span>{job.salary}</span>
                                    </div>
                                )}
                                <div className="jm-card-detail">
                                    <User size={13} />
                                    <span>Posted by {job.postedBy || "Unknown"}</span>
                                </div>
                            </div>

                            <div className="jm-card-footer">
                                <span className="jm-card-date">{postedDate}</span>
                                <div className="jm-card-actions">
                                    <button
                                        className="jm-action-btn jm-view"
                                        onClick={() => setSelectedJob(job)}
                                        title="View details"
                                    >
                                        <Eye size={15} />
                                    </button>
                                    <button
                                        className="jm-action-btn jm-delete"
                                        onClick={() => setDeleteConfirm(job)}
                                        title="Remove posting"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="jm-empty">
                        <Briefcase size={40} strokeWidth={1} />
                        <p>No job postings found</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedJob && (
                <div className="jm-modal-overlay" onClick={() => setSelectedJob(null)}>
                    <div className="jm-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <button className="jm-modal-close" onClick={() => setSelectedJob(null)}>
                            <X size={18} />
                        </button>

                        <div className="jm-modal-icon">
                            <Briefcase size={24} />
                        </div>
                        <h3 className="jm-modal-title">{selectedJob.title || "Untitled"}</h3>
                        <p className="jm-modal-company">{selectedJob.company || "Unknown"}</p>

                        <div className="jm-modal-grid">
                            <div className="jm-modal-item">
                                <span className="jm-modal-label">Location</span>
                                <span className="jm-modal-value">{selectedJob.location || "N/A"}</span>
                            </div>
                            <div className="jm-modal-item">
                                <span className="jm-modal-label">Type</span>
                                <span className="jm-modal-value">{selectedJob.type || "N/A"}</span>
                            </div>
                            {selectedJob.salary && (
                                <div className="jm-modal-item">
                                    <span className="jm-modal-label">Salary</span>
                                    <span className="jm-modal-value">{selectedJob.salary}</span>
                                </div>
                            )}
                            <div className="jm-modal-item">
                                <span className="jm-modal-label">Posted By</span>
                                <span className="jm-modal-value">{selectedJob.postedBy || "Unknown"}</span>
                            </div>
                            <div className="jm-modal-item">
                                <span className="jm-modal-label">Posted On</span>
                                <span className="jm-modal-value">
                                    {selectedJob.postedAt
                                        ? (selectedJob.postedAt.toDate
                                            ? selectedJob.postedAt.toDate()
                                            : new Date(selectedJob.postedAt)
                                        ).toLocaleDateString()
                                        : "—"}
                                </span>
                            </div>
                        </div>

                        {selectedJob.description && (
                            <div className="jm-modal-desc">
                                <span className="jm-modal-label">Description</span>
                                <p>{selectedJob.description}</p>
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
                        <h3>Remove Job Posting?</h3>
                        <p>
                            Are you sure you want to remove <strong>"{deleteConfirm.title || "this job"}"</strong>
                            {deleteConfirm.postedBy ? ` by ${deleteConfirm.postedBy}` : ""}? This action cannot be undone.
                        </p>
                        <div className="jm-confirm-actions">
                            <button
                                className="jm-confirm-cancel"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="jm-confirm-delete"
                                onClick={() => handleDelete(deleteConfirm.id)}
                                disabled={deleting}
                            >
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
