export type RelationshipStatus = "Cold" | "Networking" | "Warm" | "Mentor" | "Advocate";

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  industry: string;
  university: string;
  location: string;
  email: string;
  avatarColor: string;
  initials: string;
  score: number; // 0-100
  status: RelationshipStatus;
  lastContactDays: number;
  notes?: string;
  aiRecommendation?: string;
}

export interface TimelineEvent {
  id: string;
  contactId: string;
  date: string;
  type: "outreach" | "meeting" | "email" | "signal" | "note";
  title: string;
  detail?: string;
}

export interface Meeting {
  id: string;
  contactId: string;
  date: string;
  time: string;
  title: string;
  location: string;
}

const colors = [
  "oklch(0.7 0.12 30)", "oklch(0.65 0.14 200)", "oklch(0.6 0.15 280)",
  "oklch(0.7 0.13 140)", "oklch(0.68 0.14 70)", "oklch(0.62 0.16 340)",
  "oklch(0.66 0.13 250)", "oklch(0.72 0.11 110)",
];

const c = (i: number) => colors[i % colors.length];
const initials = (n: string) => n.split(" ").map(w => w[0]).slice(0,2).join("");

export const contacts: Contact[] = [
  { id: "1", name: "Jane Smith", role: "VP, Infrastructure", company: "Brookfield Infrastructure", industry: "Private Equity", university: "Wharton", location: "Toronto, CA", email: "jane.smith@brookfield.com", avatarColor: c(0), initials: initials("Jane Smith"), score: 86, status: "Warm", lastContactDays: 94, aiRecommendation: "Congratulate Jane on her recent promotion and ask how renewable infrastructure hiring is progressing." },
  { id: "2", name: "Michael Chen", role: "Principal", company: "Sequoia Capital", industry: "Venture Capital", university: "Stanford GSB", location: "Menlo Park, US", email: "mchen@sequoiacap.com", avatarColor: c(1), initials: initials("Michael Chen"), score: 72, status: "Networking", lastContactDays: 120, aiRecommendation: "Michael recently posted about AI infra investing — share your latest market thesis to re-engage." },
  { id: "3", name: "Sarah Patel", role: "Senior Associate", company: "Brookfield Renewable", industry: "Energy", university: "Ivey", location: "New York, US", email: "spatel@brookfieldrenewable.com", avatarColor: c(2), initials: initials("Sarah Patel"), score: 91, status: "Mentor", lastContactDays: 21, aiRecommendation: "Sarah just joined Brookfield Renewable — congratulate her and offer to make introductions." },
  { id: "4", name: "David Rodriguez", role: "Engagement Manager", company: "McKinsey & Company", industry: "Consulting", university: "Harvard Business School", location: "Chicago, US", email: "david_rodriguez@mckinsey.com", avatarColor: c(3), initials: initials("David Rodriguez"), score: 64, status: "Networking", lastContactDays: 58, aiRecommendation: "Ask David about his recent energy-transition project — natural lead-in to discuss your current role." },
  { id: "5", name: "Priya Anand", role: "Director, Talent", company: "Stripe", industry: "Technology", university: "MIT Sloan", location: "San Francisco, US", email: "priya@stripe.com", avatarColor: c(4), initials: initials("Priya Anand"), score: 78, status: "Warm", lastContactDays: 12, aiRecommendation: "Priya is hiring for PM roles — share your updated profile and ask about her team's roadmap." },
  { id: "6", name: "Tom Whitfield", role: "Managing Director", company: "CPP Investments", industry: "Pension Fund", university: "Rotman", location: "Toronto, CA", email: "tom.whitfield@cppib.com", avatarColor: c(5), initials: initials("Tom Whitfield"), score: 88, status: "Advocate", lastContactDays: 7, aiRecommendation: "Tom just published a piece on long-duration capital — comment thoughtfully on LinkedIn." },
  { id: "7", name: "Aisha Khan", role: "Founder & CEO", company: "Lumen AI", industry: "Technology", university: "Waterloo", location: "Toronto, CA", email: "aisha@lumenai.co", avatarColor: c(6), initials: initials("Aisha Khan"), score: 70, status: "Networking", lastContactDays: 145, aiRecommendation: "Aisha closed a Series A — congratulate her and ask about her go-to-market hiring needs." },
  { id: "8", name: "Marcus Lee", role: "Partner", company: "Bain & Company", industry: "Consulting", university: "Kellogg", location: "Boston, US", email: "marcus.lee@bain.com", avatarColor: c(7), initials: initials("Marcus Lee"), score: 55, status: "Cold", lastContactDays: 210, aiRecommendation: "It's been a while — share a relevant industry article to gently re-open the conversation." },
  { id: "9", name: "Elena Müller", role: "Investment Director", company: "KKR", industry: "Private Equity", university: "INSEAD", location: "London, UK", email: "elena.muller@kkr.com", avatarColor: c(0), initials: initials("Elena Müller"), score: 81, status: "Warm", lastContactDays: 35, aiRecommendation: "Elena's team is active in European infrastructure — propose a quick London catch-up." },
  { id: "10", name: "James O'Connor", role: "Head of Recruiting", company: "Goldman Sachs", industry: "Investment Banking", university: "Columbia Business School", location: "New York, US", email: "james.oconnor@gs.com", avatarColor: c(1), initials: initials("James O'Connor"), score: 67, status: "Networking", lastContactDays: 76, aiRecommendation: "James handles campus pipelines — offer to refer high-quality candidates from your network." },
  { id: "11", name: "Olivia Brooks", role: "Chief of Staff", company: "Ramp", industry: "Fintech", university: "NYU Stern", location: "New York, US", email: "olivia@ramp.com", avatarColor: c(2), initials: initials("Olivia Brooks"), score: 74, status: "Warm", lastContactDays: 42, aiRecommendation: "Olivia mentioned wanting an intro to product operators — send 2 warm introductions this week." },
  { id: "12", name: "Daniel Park", role: "VP Engineering", company: "Notion", industry: "Technology", university: "Berkeley", location: "San Francisco, US", email: "daniel@notion.so", avatarColor: c(3), initials: initials("Daniel Park"), score: 59, status: "Cold", lastContactDays: 168, aiRecommendation: "Re-engage with a specific question about scaling collaboration infra at his team's size." },
];

export const meetings: Meeting[] = [
  { id: "m1", contactId: "1", date: "2026-06-12", time: "10:00 AM", title: "Coffee chat — career update", location: "Dineen Coffee, Toronto" },
  { id: "m2", contactId: "5", date: "2026-06-14", time: "2:30 PM", title: "Informational interview", location: "Zoom" },
  { id: "m3", contactId: "9", date: "2026-06-18", time: "9:00 AM", title: "London catch-up", location: "Notes, Shoreditch" },
  { id: "m4", contactId: "11", date: "2026-06-22", time: "4:00 PM", title: "Product ops intro discussion", location: "Google Meet" },
];

export const timeline: TimelineEvent[] = [
  { id: "t1", contactId: "1", date: "Jan 10", type: "outreach", title: "Initial outreach sent", detail: "LinkedIn message regarding Brookfield infrastructure team" },
  { id: "t2", contactId: "1", date: "Jan 15", type: "meeting", title: "Coffee chat completed", detail: "30-minute call discussing renewable infrastructure strategy" },
  { id: "t3", contactId: "1", date: "Apr 3", type: "email", title: "Follow-up email sent", detail: "Shared CIBC infrastructure report and asked for feedback" },
  { id: "t4", contactId: "1", date: "Jul 1", type: "signal", title: "Promotion detected", detail: "Jane was promoted to VP, Infrastructure" },
];

export function getContact(id: string) {
  return contacts.find(c => c.id === id);
}

export const kpis = {
  active: 247,
  reconnect: 18,
  meetings: 9,
  warmIntros: 6,
};

export const intelligenceFeed = {
  goingCold: contacts.filter(c => c.lastContactDays > 100).slice(0, 4),
  recentlyPromoted: [contacts[0], contacts[5]],
  newOpportunities: [contacts[2], contacts[6], contacts[10]],
  warmIntros: [
    { id: "wi1", target: "VP at CPP Investments", through: ["Tom Whitfield", "Elena Müller"] },
    { id: "wi2", target: "Partner at Sequoia", through: ["Michael Chen"] },
    { id: "wi3", target: "Head of Talent at Ramp", through: ["Olivia Brooks", "Priya Anand"] },
  ],
};
