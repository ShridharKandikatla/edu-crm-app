// ── Mock Data for UniCRM ──

export const currentUser = {
  id: 'usr-001',
  name: 'Rajesh Kumar',
  email: 'rajesh@university.edu',
  role: 'ADMIN',
  avatar: 'RK',
};

export const users = [
  { id: 'usr-001', name: 'Rajesh Kumar', email: 'rajesh@university.edu', role: 'ADMIN', phone: '+91 98765 43210', isActive: true, monthlyTarget: 100, conversions: 0, avatar: 'RK', color: '#4f46e5' },
  { id: 'usr-002', name: 'Priya Sharma', email: 'priya@university.edu', role: 'MANAGER', phone: '+91 98765 43211', isActive: true, monthlyTarget: 80, conversions: 45, avatar: 'PS', color: '#7c3aed' },
  { id: 'usr-003', name: 'Amit Patel', email: 'amit@university.edu', role: 'COUNSELOR', phone: '+91 98765 43212', isActive: true, monthlyTarget: 40, conversions: 32, avatar: 'AP', color: '#059669' },
  { id: 'usr-004', name: 'Sneha Reddy', email: 'sneha@university.edu', role: 'COUNSELOR', phone: '+91 98765 43213', isActive: true, monthlyTarget: 40, conversions: 28, avatar: 'SR', color: '#dc2626' },
  { id: 'usr-005', name: 'Vikram Singh', email: 'vikram@university.edu', role: 'COUNSELOR', phone: '+91 98765 43214', isActive: true, monthlyTarget: 40, conversions: 35, avatar: 'VS', color: '#d97706' },
  { id: 'usr-006', name: 'Kavita Nair', email: 'kavita@university.edu', role: 'TELECALLER', phone: '+91 98765 43215', isActive: true, monthlyTarget: 60, conversions: 22, avatar: 'KN', color: '#0891b2' },
  { id: 'usr-007', name: 'Rohit Joshi', email: 'rohit@university.edu', role: 'TELECALLER', phone: '+91 98765 43216', isActive: true, monthlyTarget: 60, conversions: 18, avatar: 'RJ', color: '#be185d' },
  { id: 'usr-008', name: 'Deepa Menon', email: 'deepa@university.edu', role: 'COUNSELOR', phone: '+91 98765 43217', isActive: false, monthlyTarget: 40, conversions: 15, avatar: 'DM', color: '#4338ca' },
];

export const courses = [
  { id: 'crs-001', name: 'B.Tech Computer Science', department: 'Engineering', duration: '4 years', fee: 250000, seats: 120, isActive: true },
  { id: 'crs-002', name: 'B.Tech Electronics', department: 'Engineering', duration: '4 years', fee: 220000, seats: 60, isActive: true },
  { id: 'crs-003', name: 'MBA General', department: 'Management', duration: '2 years', fee: 400000, seats: 80, isActive: true },
  { id: 'crs-004', name: 'MBA Finance', department: 'Management', duration: '2 years', fee: 450000, seats: 40, isActive: true },
  { id: 'crs-005', name: 'BBA', department: 'Management', duration: '3 years', fee: 180000, seats: 100, isActive: true },
  { id: 'crs-006', name: 'B.Sc Data Science', department: 'Science', duration: '3 years', fee: 200000, seats: 60, isActive: true },
  { id: 'crs-007', name: 'M.Tech AI & ML', department: 'Engineering', duration: '2 years', fee: 350000, seats: 30, isActive: true },
  { id: 'crs-008', name: 'B.Com Honours', department: 'Commerce', duration: '3 years', fee: 120000, seats: 90, isActive: true },
];

export const intakes = [
  { id: 'int-001', name: 'Fall 2026', startDate: '2026-08-01', endDate: '2026-12-31', isActive: true },
  { id: 'int-002', name: 'Spring 2027', startDate: '2027-01-15', endDate: '2027-05-31', isActive: true },
  { id: 'int-003', name: 'Fall 2027', startDate: '2027-08-01', endDate: '2027-12-31', isActive: false },
];

const leadNames = [
  'Arun Mehta', 'Snehalata Das', 'Mohammed Farhan', 'Anjali Verma', 'Suresh Iyer',
  'Pooja Gupta', 'Rahul Khanna', 'Nisha Aggarwal', 'Karthik Rajan', 'Suman Bose',
  'Divya Pillai', 'Arjun Malhotra', 'Lavanya Rao', 'Siddharth Jain', 'Meera Nambiar',
  'Vishal Chauhan', 'Tanvi Kulkarni', 'Rohan Deshmukh', 'Swati Pandey', 'Gaurav Saxena',
  'Pallavi Hegde', 'Nitin Agarwal', 'Shreya Dutta', 'Varun Kapoor', 'Deepika Srinivasan',
  'Akash Bhatt', 'Ritu Mishra', 'Harsh Vardhan', 'Simran Kaur', 'Pranav Kulkarni',
  'Kriti Bansal', 'Manish Yadav', 'Aparna Goel', 'Vivek Tiwari', 'Neha Thakur',
  'Rajat Arora', 'Isha Mahajan', 'Sameer Patil', 'Bhavna Shah', 'Yash Tandon',
];

const sources = ['WEBSITE', 'FACEBOOK', 'GOOGLE_ADS', 'INSTAGRAM', 'JUSTDIAL', 'WALK_IN', 'REFERRAL', 'PHONE_INQUIRY', 'EMAIL_INQUIRY', 'EVENT'];
const scores = ['HOT', 'WARM', 'COLD'];
const failureReasons = ['Fee too high', 'Chose competitor', 'Not reachable', 'Lost interest', 'Location issue', 'Joined another course', 'Financial constraints', 'Postponed admission'];
const counselorIds = ['usr-003', 'usr-004', 'usr-005', 'usr-008'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhone() {
  return `+91 ${Math.floor(70000 + Math.random() * 29999)} ${Math.floor(10000 + Math.random() * 89999)}`;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const leads = leadNames.map((name, i) => {
  const status = i < 5 ? 'NEW' : i < 10 ? 'CONTACTED' : i < 15 ? 'INTERESTED' : i < 18 ? 'FOLLOW_UP' : i < 20 ? 'VISITED' : i < 22 ? 'APPLICATION_STARTED' : i < 28 ? 'CONVERTED' : i < 35 ? 'FAILED' : 'RE_ENGAGED';
  const score = status === 'CONVERTED' ? 'HOT' : status === 'INTERESTED' || status === 'VISITED' ? 'WARM' : status === 'FAILED' ? 'COLD' : randomElement(scores);
  const createdAt = randomDate(new Date('2026-01-01'), new Date('2026-04-02'));
  const course = randomElement(courses);

  return {
    id: `lead-${String(i + 1).padStart(3, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    phone: randomPhone(),
    alternatePhone: Math.random() > 0.6 ? randomPhone() : null,
    source: randomElement(sources),
    status,
    score,
    courseId: course.id,
    courseName: course.name,
    intakeId: 'int-001',
    intakeName: 'Fall 2026',
    assignedTo: status === 'NEW' ? null : randomElement(counselorIds),
    assignedCounselor: status === 'NEW' ? null : users.find(u => counselorIds.includes(u.id))?.name,
    assignedAt: status === 'NEW' ? null : randomDate(createdAt, new Date('2026-04-02')),
    failureReason: status === 'FAILED' ? randomElement(failureReasons) : null,
    failedAt: status === 'FAILED' ? randomDate(createdAt, new Date('2026-04-02')) : null,
    reEngageFlag: status === 'RE_ENGAGED',
    reEngageDate: status === 'RE_ENGAGED' ? randomDate(new Date('2026-03-01'), new Date('2026-04-02')) : null,
    lastContactDate: status !== 'NEW' ? randomDate(new Date('2026-03-01'), new Date('2026-04-02')) : null,
    convertedAt: status === 'CONVERTED' ? randomDate(new Date('2026-02-01'), new Date('2026-04-02')) : null,
    isDuplicate: false,
    tags: Math.random() > 0.7 ? ['Scholarship candidate'] : [],
    notes: Math.random() > 0.5 ? 'Student showed interest during campus visit.' : '',
    createdAt: createdAt.toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

// Assign proper counselor names
leads.forEach(lead => {
  if (lead.assignedTo) {
    const counselor = users.find(u => u.id === lead.assignedTo);
    if (counselor) lead.assignedCounselor = counselor.name;
  }
});

export const followUps = [];
const followUpTypes = ['CALL', 'EMAIL', 'WHATSAPP', 'SMS', 'IN_PERSON'];
const outcomes = ['CONNECTED', 'NOT_REACHABLE', 'CALL_BACK', 'INTERESTED', 'NOT_INTERESTED', 'WRONG_NUMBER'];

leads.filter(l => l.status !== 'NEW').forEach((lead) => {
  const count = Math.floor(Math.random() * 4) + 1;
  for (let j = 0; j < count; j++) {
    const scheduledAt = randomDate(new Date('2026-02-01'), new Date('2026-04-10'));
    const isPast = scheduledAt < new Date();
    followUps.push({
      id: `fu-${String(followUps.length + 1).padStart(3, '0')}`,
      leadId: lead.id,
      leadName: lead.name,
      userId: lead.assignedTo || 'usr-003',
      userName: lead.assignedCounselor || 'Amit Patel',
      type: randomElement(followUpTypes),
      scheduledAt: scheduledAt.toISOString(),
      completedAt: isPast && Math.random() > 0.3 ? scheduledAt.toISOString() : null,
      outcome: isPast && Math.random() > 0.3 ? randomElement(outcomes) : null,
      notes: isPast ? 'Discussed course details and fee structure.' : 'Need to follow up on scholarship query.',
      isEscalated: !isPast && Math.random() > 0.85,
      courseName: lead.courseName,
      leadScore: lead.score,
      leadStatus: lead.status,
    });
  }
});

export const activityLog = [
  { id: 'act-001', leadId: 'lead-001', userId: 'usr-003', action: 'LEAD_CREATED', description: 'Lead created from website form', createdAt: '2026-03-28T09:30:00Z' },
  { id: 'act-002', leadId: 'lead-001', userId: 'usr-003', action: 'STATUS_CHANGED', description: 'Status changed from New to Contacted', oldValue: 'NEW', newValue: 'CONTACTED', createdAt: '2026-03-28T11:00:00Z' },
  { id: 'act-003', leadId: 'lead-001', userId: 'usr-003', action: 'FOLLOW_UP_CREATED', description: 'Scheduled a call follow-up', createdAt: '2026-03-28T11:05:00Z' },
  { id: 'act-004', leadId: 'lead-001', userId: 'usr-003', action: 'FOLLOW_UP_COMPLETED', description: 'Call completed - Student interested in B.Tech CS', createdAt: '2026-03-29T14:00:00Z' },
  { id: 'act-005', leadId: 'lead-001', userId: 'usr-003', action: 'STATUS_CHANGED', description: 'Status changed from Contacted to Interested', oldValue: 'CONTACTED', newValue: 'INTERESTED', createdAt: '2026-03-29T14:05:00Z' },
  { id: 'act-006', leadId: 'lead-001', userId: 'usr-003', action: 'NOTE_ADDED', description: 'Added note: Student wants scholarship information', createdAt: '2026-03-30T10:00:00Z' },
  { id: 'act-007', leadId: 'lead-002', userId: 'usr-004', action: 'LEAD_CREATED', description: 'Lead created from Facebook ad', createdAt: '2026-03-25T08:00:00Z' },
  { id: 'act-008', leadId: 'lead-002', userId: 'usr-004', action: 'FOLLOW_UP_CREATED', description: 'Scheduled WhatsApp follow-up', createdAt: '2026-03-25T09:00:00Z' },
];

export const notifications = [
  { id: 'notif-001', userId: 'usr-001', title: 'New Lead Assigned', message: 'Arun Mehta has been assigned to Amit Patel', type: 'LEAD_ASSIGNED', isRead: false, createdAt: '2026-04-02T10:30:00Z' },
  { id: 'notif-002', userId: 'usr-001', title: 'Follow-up Due', message: 'Follow-up with Snehalata Das is due today', type: 'FOLLOW_UP_REMINDER', isRead: false, createdAt: '2026-04-02T09:00:00Z' },
  { id: 'notif-003', userId: 'usr-001', title: 'Lead Converted', message: 'Karthik Rajan has been successfully converted', type: 'LEAD_CONVERTED', isRead: false, createdAt: '2026-04-01T16:00:00Z' },
  { id: 'notif-004', userId: 'usr-001', title: 'Escalation Alert', message: 'Follow-up with Pooja Gupta has been missed for 48hrs', type: 'ESCALATION', isRead: true, createdAt: '2026-04-01T10:00:00Z' },
  { id: 'notif-005', userId: 'usr-001', title: 'Bulk Import Complete', message: '45 leads imported successfully, 3 duplicates found', type: 'IMPORT_COMPLETE', isRead: true, createdAt: '2026-03-31T14:00:00Z' },
];

// ── Dashboard Stats ──
export const dashboardStats = {
  totalLeads: leads.length,
  newLeadsThisMonth: leads.filter(l => new Date(l.createdAt) > new Date('2026-03-01')).length,
  converted: leads.filter(l => l.status === 'CONVERTED').length,
  conversionRate: Math.round((leads.filter(l => l.status === 'CONVERTED').length / leads.length) * 100),
  pendingFollowUps: followUps.filter(f => !f.completedAt && new Date(f.scheduledAt) <= new Date()).length,
  failedLeads: leads.filter(l => l.status === 'FAILED').length,
  hotLeads: leads.filter(l => l.score === 'HOT' && l.status !== 'CONVERTED' && l.status !== 'FAILED').length,
  revenue: leads.filter(l => l.status === 'CONVERTED').reduce((sum, l) => {
    const course = courses.find(c => c.id === l.courseId);
    return sum + (course?.fee || 0);
  }, 0),
  totalLeadsChange: 12.5,
  convertedChange: 8.3,
  followUpChange: -5.2,
  failedChange: -3.1,
};

// ── Chart Data ──
export const leadFunnelData = [
  { name: 'New', value: leads.filter(l => l.status === 'NEW').length, color: '#60a5fa' },
  { name: 'Contacted', value: leads.filter(l => l.status === 'CONTACTED').length, color: '#818cf8' },
  { name: 'Interested', value: leads.filter(l => l.status === 'INTERESTED').length, color: '#fbbf24' },
  { name: 'Follow-up', value: leads.filter(l => l.status === 'FOLLOW_UP').length, color: '#a78bfa' },
  { name: 'Visited', value: leads.filter(l => l.status === 'VISITED').length, color: '#34d399' },
  { name: 'Applied', value: leads.filter(l => l.status === 'APPLICATION_STARTED').length, color: '#2dd4bf' },
  { name: 'Converted', value: leads.filter(l => l.status === 'CONVERTED').length, color: '#10b981' },
  { name: 'Failed', value: leads.filter(l => l.status === 'FAILED').length, color: '#f87171' },
];

export const sourceData = [
  { name: 'Website', value: leads.filter(l => l.source === 'WEBSITE').length, color: '#4f46e5' },
  { name: 'Facebook', value: leads.filter(l => l.source === 'FACEBOOK').length, color: '#1877f2' },
  { name: 'Google Ads', value: leads.filter(l => l.source === 'GOOGLE_ADS').length, color: '#ea4335' },
  { name: 'Instagram', value: leads.filter(l => l.source === 'INSTAGRAM').length, color: '#e1306c' },
  { name: 'Walk-in', value: leads.filter(l => l.source === 'WALK_IN').length, color: '#10b981' },
  { name: 'Referral', value: leads.filter(l => l.source === 'REFERRAL').length, color: '#f59e0b' },
  { name: 'JustDial', value: leads.filter(l => l.source === 'JUSTDIAL').length, color: '#0ea5e9' },
  { name: 'Others', value: leads.filter(l => ['PHONE_INQUIRY', 'EMAIL_INQUIRY', 'EVENT', 'OTHER'].includes(l.source)).length, color: '#8b5cf6' },
];

export const trendData = [
  { date: 'Mar 1', leads: 5, converted: 1 },
  { date: 'Mar 5', leads: 8, converted: 2 },
  { date: 'Mar 10', leads: 12, converted: 3 },
  { date: 'Mar 15', leads: 7, converted: 2 },
  { date: 'Mar 20', leads: 15, converted: 5 },
  { date: 'Mar 25', leads: 10, converted: 4 },
  { date: 'Mar 30', leads: 18, converted: 6 },
  { date: 'Apr 1', leads: 14, converted: 4 },
  { date: 'Apr 2', leads: 9, converted: 3 },
];

export const counselorPerformance = users
  .filter(u => u.role === 'COUNSELOR' && u.isActive)
  .map(u => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    color: u.color,
    assigned: leads.filter(l => l.assignedTo === u.id).length,
    converted: leads.filter(l => l.assignedTo === u.id && l.status === 'CONVERTED').length,
    failed: leads.filter(l => l.assignedTo === u.id && l.status === 'FAILED').length,
    pending: followUps.filter(f => f.userId === u.id && !f.completedAt).length,
    target: u.monthlyTarget,
  }))
  .sort((a, b) => b.converted - a.converted);
