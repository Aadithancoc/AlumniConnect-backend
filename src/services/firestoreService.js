import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

// ─── Collection Names (matching your Firebase) ───────────
const USERS_COL = "users";
const JOBS_COL = "jobs";
const EVENTS_COL = "events";

// ─── Users / Alumni ──────────────────────────────────────
export function subscribeToUsers(callback) {
    console.log("📡 Subscribing to", USERS_COL, "collection...");
    const ref = collection(db, USERS_COL);
    return onSnapshot(
        ref,
        (snapshot) => {
            const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            console.log(`✅ ${USERS_COL}: ${users.length} documents loaded`);
            if (users.length > 0) console.log("   Sample fields:", Object.keys(users[0]));
            users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            callback(users);
        },
        (error) => {
            console.error(`❌ Error reading ${USERS_COL}:`, error.code, error.message);
            callback([]);
        }
    );
}

export async function fetchUsers() {
    try {
        console.log("📥 Fetching", USERS_COL, "...");
        const snap = await getDocs(collection(db, USERS_COL));
        const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log(`✅ ${USERS_COL}: ${users.length} documents fetched`);
        if (users.length > 0) console.log("   Sample fields:", Object.keys(users[0]));
        users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        return users;
    } catch (error) {
        console.error(`❌ Error fetching ${USERS_COL}:`, error.code, error.message);
        return [];
    }
}

// ─── Jobs ────────────────────────────────────────────────
export function subscribeToJobs(callback) {
    console.log("📡 Subscribing to", JOBS_COL, "collection...");
    const ref = collection(db, JOBS_COL);
    return onSnapshot(
        ref,
        (snapshot) => {
            const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            console.log(`✅ ${JOBS_COL}: ${jobs.length} documents loaded`);
            if (jobs.length > 0) console.log("   Sample fields:", Object.keys(jobs[0]));
            callback(jobs);
        },
        (error) => {
            console.error(`❌ Error reading ${JOBS_COL}:`, error.code, error.message);
            callback([]);
        }
    );
}

export async function fetchJobs() {
    try {
        console.log("📥 Fetching", JOBS_COL, "...");
        const snap = await getDocs(collection(db, JOBS_COL));
        const jobs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log(`✅ ${JOBS_COL}: ${jobs.length} documents fetched`);
        if (jobs.length > 0) console.log("   Sample fields:", Object.keys(jobs[0]));
        return jobs;
    } catch (error) {
        console.error(`❌ Error fetching ${JOBS_COL}:`, error.code, error.message);
        return [];
    }
}

export async function deleteJob(jobId) {
    await deleteDoc(doc(db, JOBS_COL, jobId));
}

// ─── Events ──────────────────────────────────────────────
export function subscribeToEvents(callback) {
    console.log("📡 Subscribing to", EVENTS_COL, "collection...");
    const ref = collection(db, EVENTS_COL);
    return onSnapshot(
        ref,
        (snapshot) => {
            const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            console.log(`✅ ${EVENTS_COL}: ${events.length} documents loaded`);
            if (events.length > 0) console.log("   Sample fields:", Object.keys(events[0]));
            callback(events);
        },
        (error) => {
            console.error(`❌ Error reading ${EVENTS_COL}:`, error.code, error.message);
            callback([]);
        }
    );
}

export async function fetchEvents() {
    try {
        console.log("📥 Fetching", EVENTS_COL, "...");
        const snap = await getDocs(collection(db, EVENTS_COL));
        const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log(`✅ ${EVENTS_COL}: ${events.length} documents fetched`);
        if (events.length > 0) console.log("   Sample fields:", Object.keys(events[0]));
        return events;
    } catch (error) {
        console.error(`❌ Error fetching ${EVENTS_COL}:`, error.code, error.message);
        return [];
    }
}

export async function deleteEvent(eventId) {
    await deleteDoc(doc(db, EVENTS_COL, eventId));
}

// ─── Dashboard Stats ─────────────────────────────────────
export async function fetchDashboardStats() {
    const [users, jobs, events] = await Promise.all([
        fetchUsers(),
        fetchJobs(),
        fetchEvents(),
    ]);

    return {
        totalAlumni: users.length,
        totalJobs: jobs.length,
        totalEvents: events.length,
        recentUsers: users.slice(0, 5),
        recentJobs: jobs.slice(0, 4),
        upcomingEvents: events.filter((e) => {
            if (e.status === "upcoming") return true;
            const raw = e.date;
            if (!raw) return false;
            const d = raw.toDate ? raw.toDate() : new Date(raw);
            return d > new Date();
        }),
        users,
        jobs,
        events,
    };
}

// ─── Analytics Helpers ───────────────────────────────────

export function computeUserGrowth(users) {
    const monthMap = {};
    users.forEach((u) => {
        const raw = u.joinedAt || u.createdAt;
        if (!raw) return;
        const date = raw.toDate ? raw.toDate() : new Date(raw);
        if (isNaN(date.getTime())) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (!monthMap[key]) monthMap[key] = { key, month: label, users: 0 };
        monthMap[key].users += 1;
    });

    return Object.values(monthMap)
        .sort((a, b) => a.key.localeCompare(b.key))
        .slice(-12);
}

export function computeTopCompanies(jobs, topN = 8) {
    const counts = {};
    jobs.forEach((j) => {
        const company = j.company || "Unknown";
        counts[company] = (counts[company] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, jobCount]) => ({ name, jobs: jobCount }))
        .sort((a, b) => b.jobs - a.jobs)
        .slice(0, topN);
}

export function computeDepartmentDistribution(users) {
    const PIE_COLORS = [
        "#2BB673", "#34d68a", "#6ee7a7", "#a7f3d0",
        "#d1fae5", "#bbf7d0", "#059669", "#10B981",
    ];
    const counts = {};
    users.forEach((u) => {
        const dept = u.department || "Other";
        counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
        .sort((a, b) => b.value - a.value);
}

export function computeEventParticipation(events) {
    return events.map((e) => ({
        name: e.title?.length > 18 ? e.title.slice(0, 18) + "…" : e.title || "Untitled",
        value: e.participants || 0,
    }));
}

export async function fetchEngagementData() {
    try {
        const snap = await getDocs(collection(db, "engagement"));
        if (snap.size > 0) {
            return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
    } catch {
        // collection may not exist
    }
    return [];
}
