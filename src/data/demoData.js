// Demo / mock data used across the admin panel for demonstration.
// In production, all data comes from Firestore.

export const demoUsers = [
    { id: "u1", name: "Rahul Sharma", email: "rahul.sharma@gmail.com", batch: "2020", department: "Computer Science", company: "Google", designation: "Software Engineer", joinedAt: "2025-01-15", avatar: null },
    { id: "u2", name: "Priya Patel", email: "priya.patel@outlook.com", batch: "2019", department: "Electronics", company: "Microsoft", designation: "Product Manager", joinedAt: "2025-01-22", avatar: null },
    { id: "u3", name: "Arjun Nair", email: "arjun.nair@yahoo.com", batch: "2021", department: "Mechanical", company: "Tesla", designation: "Design Engineer", joinedAt: "2025-02-01", avatar: null },
    { id: "u4", name: "Sneha Reddy", email: "sneha.reddy@gmail.com", batch: "2018", department: "Computer Science", company: "Amazon", designation: "Data Scientist", joinedAt: "2025-02-05", avatar: null },
    { id: "u5", name: "Vikram Singh", email: "vikram.singh@gmail.com", batch: "2020", department: "Civil", company: "L&T", designation: "Project Manager", joinedAt: "2025-02-10", avatar: null },
    { id: "u6", name: "Ananya Gupta", email: "ananya.gupta@gmail.com", batch: "2021", department: "Computer Science", company: "Flipkart", designation: "Frontend Developer", joinedAt: "2025-02-14", avatar: null },
    { id: "u7", name: "Karan Mehta", email: "karan.mehta@hotmail.com", batch: "2019", department: "IT", company: "Infosys", designation: "Tech Lead", joinedAt: "2025-03-01", avatar: null },
    { id: "u8", name: "Divya Krishnan", email: "divya.k@gmail.com", batch: "2022", department: "Biotechnology", company: "Biocon", designation: "Research Associate", joinedAt: "2025-03-05", avatar: null },
    { id: "u9", name: "Amit Joshi", email: "amit.joshi@gmail.com", batch: "2017", department: "Electrical", company: "Siemens", designation: "Senior Engineer", joinedAt: "2025-03-10", avatar: null },
    { id: "u10", name: "Meera Iyer", email: "meera.iyer@gmail.com", batch: "2020", department: "Computer Science", company: "Adobe", designation: "UX Designer", joinedAt: "2025-03-15", avatar: null },
    { id: "u11", name: "Rohan Das", email: "rohan.das@gmail.com", batch: "2021", department: "IT", company: "TCS", designation: "Software Developer", joinedAt: "2025-03-20", avatar: null },
    { id: "u12", name: "Kavya Menon", email: "kavya.m@gmail.com", batch: "2018", department: "Electronics", company: "Intel", designation: "Chip Designer", joinedAt: "2025-04-01", avatar: null },
];

export const demoJobs = [
    { id: "j1", title: "Senior React Developer", company: "Google", location: "Bangalore", type: "Full-time", postedBy: "Rahul Sharma", postedAt: "2025-12-10", salary: "₹25-35 LPA", description: "Looking for an experienced React developer..." },
    { id: "j2", title: "Product Manager", company: "Microsoft", location: "Hyderabad", type: "Full-time", postedBy: "Priya Patel", postedAt: "2025-12-15", salary: "₹30-40 LPA", description: "Seeking a product manager for Azure team..." },
    { id: "j3", title: "Data Science Intern", company: "Amazon", location: "Remote", type: "Internship", postedBy: "Sneha Reddy", postedAt: "2025-12-20", salary: "₹50K/month", description: "Internship opportunity in data science..." },
    { id: "j4", title: "Full Stack Developer", company: "Flipkart", location: "Bangalore", type: "Full-time", postedBy: "Ananya Gupta", postedAt: "2026-01-05", salary: "₹18-28 LPA", description: "Join our platform engineering team..." },
    { id: "j5", title: "DevOps Engineer", company: "Infosys", location: "Pune", type: "Full-time", postedBy: "Karan Mehta", postedAt: "2026-01-10", salary: "₹15-22 LPA", description: "Looking for DevOps professionals..." },
    { id: "j6", title: "ML Engineer", company: "Adobe", location: "Noida", type: "Full-time", postedBy: "Meera Iyer", postedAt: "2026-01-15", salary: "₹28-38 LPA", description: "Machine learning engineer for Creative Cloud..." },
    { id: "j7", title: "Frontend Developer", company: "Razorpay", location: "Bangalore", type: "Full-time", postedBy: "Rohan Das", postedAt: "2026-01-20", salary: "₹16-24 LPA", description: "Building next-gen payment interfaces..." },
    { id: "j8", title: "Cloud Architect", company: "TCS", location: "Mumbai", type: "Contract", postedBy: "Vikram Singh", postedAt: "2026-02-01", salary: "₹40-55 LPA", description: "Enterprise cloud migration projects..." },
];

export const demoEvents = [
    { id: "e1", title: "Annual Alumni Meet 2026", date: "2026-03-15", location: "Main Auditorium", organizer: "Alumni Cell", participants: 245, status: "upcoming", description: "Flagship annual gathering of all alumni batches." },
    { id: "e2", title: "Tech Talk: AI in Healthcare", date: "2026-02-28", location: "Virtual (Zoom)", organizer: "Sneha Reddy", participants: 120, status: "upcoming", description: "Industry expert talk on AI applications in healthcare." },
    { id: "e3", title: "Career Guidance Workshop", date: "2026-01-20", location: "Seminar Hall B", organizer: "Placement Cell", participants: 189, status: "completed", description: "Workshop for current students with alumni mentors." },
    { id: "e4", title: "Startup Pitch Night", date: "2026-02-10", location: "Innovation Hub", organizer: "E-Cell", participants: 76, status: "completed", description: "Alumni founders pitch their startups to investors." },
    { id: "e5", title: "Hackathon 2026", date: "2026-04-05", location: "CS Department", organizer: "Coding Club", participants: 312, status: "upcoming", description: "48-hour hackathon with alumni mentors and judges." },
    { id: "e6", title: "Networking Mixer", date: "2026-01-30", location: "Grand Hotel, Bangalore", organizer: "Bangalore Chapter", participants: 95, status: "completed", description: "Casual networking event for Bangalore-based alumni." },
];

export const userGrowthData = [
    { month: "Jul", users: 45 },
    { month: "Aug", users: 78 },
    { month: "Sep", users: 112 },
    { month: "Oct", users: 156 },
    { month: "Nov", users: 198 },
    { month: "Dec", users: 267 },
    { month: "Jan", users: 345 },
    { month: "Feb", users: 412 },
];

export const topCompanies = [
    { name: "Google", jobs: 12 },
    { name: "Microsoft", jobs: 9 },
    { name: "Amazon", jobs: 8 },
    { name: "Flipkart", jobs: 7 },
    { name: "Infosys", jobs: 6 },
    { name: "TCS", jobs: 5 },
    { name: "Adobe", jobs: 4 },
    { name: "Razorpay", jobs: 3 },
];

export const engagementData = [
    { month: "Jul", posts: 34, comments: 89, likes: 234 },
    { month: "Aug", posts: 56, comments: 123, likes: 345 },
    { month: "Sep", posts: 67, comments: 156, likes: 412 },
    { month: "Oct", posts: 89, comments: 198, likes: 523 },
    { month: "Nov", posts: 102, comments: 234, likes: 612 },
    { month: "Dec", posts: 115, comments: 267, likes: 789 },
    { month: "Jan", posts: 134, comments: 312, likes: 856 },
    { month: "Feb", posts: 156, comments: 345, likes: 934 },
];

export const eventParticipation = [
    { name: "Alumni Meet", value: 245 },
    { name: "Tech Talk", value: 120 },
    { name: "Career Workshop", value: 189 },
    { name: "Startup Night", value: 76 },
    { name: "Hackathon", value: 312 },
    { name: "Networking", value: 95 },
];

export const departmentDistribution = [
    { name: "Computer Science", value: 156, color: "#2BB673" },
    { name: "Electronics", value: 89, color: "#34d68a" },
    { name: "Mechanical", value: 67, color: "#6ee7a7" },
    { name: "IT", value: 54, color: "#a7f3d0" },
    { name: "Civil", value: 23, color: "#d1fae5" },
    { name: "Biotechnology", value: 15, color: "#ecfdf5" },
    { name: "Electrical", value: 8, color: "#bbf7d0" },
];
