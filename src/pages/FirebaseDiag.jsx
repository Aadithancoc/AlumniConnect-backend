import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const COLLECTIONS_TO_CHECK = [
    "users", "Users",
    "jobs", "Jobs",
    "events", "Events",
    "alumni", "Alumni",
    "job_posts", "jobPosts", "job-posts",
    "posts", "Posts",
    "profiles", "Profiles",
];

export default function FirebaseDiag() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function check() {
            const output = [];
            for (const name of COLLECTIONS_TO_CHECK) {
                try {
                    const snap = await getDocs(collection(db, name));
                    output.push({
                        name,
                        count: snap.size,
                        sampleFields: snap.size > 0
                            ? Object.keys(snap.docs[0].data()).join(", ")
                            : "—",
                    });
                } catch (err) {
                    output.push({ name, count: "ERROR", sampleFields: err.message });
                }
            }
            setResults(output);
            setLoading(false);
        }
        check();
    }, []);

    return (
        <div style={{ padding: 40, fontFamily: "monospace", maxWidth: 900, margin: "0 auto" }}>
            <h1 style={{ color: "#2BB673" }}>🔍 Firebase Diagnostic</h1>
            <p style={{ color: "#666", marginBottom: 24 }}>
                Checking which Firestore collections have data...
            </p>
            {loading ? (
                <p>Scanning collections...</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                        <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                            <th style={{ padding: "10px 14px", border: "1px solid #e5e7eb" }}>Collection</th>
                            <th style={{ padding: "10px 14px", border: "1px solid #e5e7eb" }}>Documents</th>
                            <th style={{ padding: "10px 14px", border: "1px solid #e5e7eb" }}>Sample Fields</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((r) => (
                            <tr
                                key={r.name}
                                style={{ background: r.count > 0 ? "#dcfce7" : "white" }}
                            >
                                <td style={{ padding: "10px 14px", border: "1px solid #e5e7eb", fontWeight: 600 }}>
                                    {r.count > 0 ? "✅" : "⬜"} {r.name}
                                </td>
                                <td style={{ padding: "10px 14px", border: "1px solid #e5e7eb" }}>
                                    <strong>{r.count}</strong>
                                </td>
                                <td style={{ padding: "10px 14px", border: "1px solid #e5e7eb", color: "#666", fontSize: 12 }}>
                                    {r.sampleFields}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <p style={{ marginTop: 20, color: "#888", fontSize: 13 }}>
                Green rows = collections with data. Share this output so we can map the correct collection names.
            </p>
        </div>
    );
}
