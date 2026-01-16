
import { Course, User, Instructor, TeamMember, Category } from './types';

export const MOCK_USER_STUDENT: User = {
  id: 's1',
  name: 'Alex Johnson',
  email: 'student@aelgo.com',
  role: 'student',
  avatar: 'https://picsum.photos/id/64/200/200'
};

export const MOCK_USER_ADMIN: User = {
  id: 'a1',
  name: 'Sarah Connor',
  email: 'admin@aelgo.com',
  role: 'super_admin',
  avatar: 'https://picsum.photos/id/65/200/200',
  permissions: ['manage_users', 'manage_team', 'create_course', 'manage_billing'] // Full access
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Development', slug: 'development', count: 12, description: 'Programming, coding, and software engineering.' },
  { id: 'cat2', name: 'Design', slug: 'design', count: 8, description: 'UI/UX, Graphic Design, and Art.' },
  { id: 'cat3', name: 'Business', slug: 'business', count: 5, description: 'Entrepreneurship, Strategy, and Sales.' },
  { id: 'cat4', name: 'Data Science', slug: 'data-science', count: 4, description: 'AI, ML, and Statistics.' },
  { id: 'cat5', name: 'Audio Series', slug: 'audio-series', count: 1, description: 'Podcast-style learning tracks.' },
];

export const MOCK_TEAM: TeamMember[] = [
  {
    id: 't1',
    name: 'Sarah Connor',
    email: 'admin@aelgo.com',
    role: 'super_admin',
    avatar: 'https://picsum.photos/id/65/200/200',
    status: 'Active',
    lastActive: 'Just now',
    permissions: [
      'manage_users', 'manage_team', 'create_course', 'edit_course', 'delete_course', 
      'manage_library', 'approve_content', 'view_analytics', 'manage_billing', 'manage_settings'
    ]
  },
  {
    id: 't2',
    name: 'John Smith',
    email: 'john@aelgo.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=random',
    status: 'Active',
    lastActive: '2 hours ago',
    permissions: [
      'manage_users', 'create_course', 'edit_course', 'manage_library', 'view_analytics'
    ]
  },
  {
    id: 't3',
    name: 'Emily Chen',
    email: 'emily@aelgo.com',
    role: 'viewer',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=random',
    status: 'Active',
    lastActive: '1 day ago',
    permissions: ['view_analytics']
  },
  {
    id: 't4',
    name: 'Mike Ross',
    email: 'mike@aelgo.com',
    role: 'approver',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=random',
    status: 'Inactive',
    lastActive: '5 days ago',
    permissions: ['approve_content', 'view_analytics']
  }
];

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: 'i1',
    name: 'Dr. Angela Yu',
    email: 'angela@aelgo.com',
    role: 'Lead Instructor',
    bio: 'Angela is a developer and teacher who is passionate about teaching others how to code. She has taught over 1 million students.',
    avatar: 'https://ui-avatars.com/api/?name=Angela+Yu&background=random',
    status: 'Active',
    expertise: ['Web Development', 'iOS', 'Python'],
    joinedDate: '2023-01-15',
    totalStudents: 15400,
    coursesCount: 3
  },
  {
    id: 'i2',
    name: 'Andrew Ng',
    email: 'andrew@aelgo.com',
    role: 'AI Research Scientist',
    bio: 'Co-founder of Coursera and Adjunct Professor at Stanford University. Pioneer in Machine Learning and Online Education.',
    avatar: 'https://ui-avatars.com/api/?name=Andrew+Ng&background=random',
    status: 'Active',
    expertise: ['Machine Learning', 'AI', 'Deep Learning'],
    joinedDate: '2023-03-22',
    totalStudents: 8500,
    coursesCount: 2
  },
  {
    id: 'i3',
    name: 'Gary Simon',
    email: 'gary@aelgo.com',
    role: 'UI/UX Designer',
    bio: 'Gary has been a full-stack developer and designer for 20 years. He runs DesignCourse and teaches UI/UX.',
    avatar: 'https://ui-avatars.com/api/?name=Gary+Simon&background=random',
    status: 'Inactive',
    expertise: ['UI Design', 'CSS', 'Figma'],
    joinedDate: '2023-06-10',
    totalStudents: 3200,
    coursesCount: 1
  }
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Fullstack React & Node Mastery',
    description: 'Learn to build scalable web applications from scratch using modern technologies. Master Hooks, Redux, Express, and MongoDB.',
    thumbnail: 'https://picsum.photos/id/1/800/600',
    instructor: 'Dr. Angela Yu',
    progress: 35,
    totalModules: 4,
    price: 89.99,
    level: 'Intermediate',
    category: 'Development',
    enrolledStudents: 1205,
    learningOutcomes: [
      'Build production-ready React applications',
      'Master State Management with Redux & Context',
      'Create RESTful APIs with Node.js & Express',
      'Deploy applications to cloud platforms'
    ],
    modules: [
      {
        id: 'm1',
        title: 'Introduction to React',
        lessons: [
          { id: 'l1', title: 'Why React?', type: 'video', duration: '5:20', contentUrl: 'dQw4w9WgXcQ', completed: true },
          { id: 'l2', title: 'Virtual DOM Explained', type: 'reading', duration: '10 min', completed: true },
          { id: 'l3', title: 'React Basics Quiz', type: 'quiz', duration: '5 min', completed: false },
        ]
      },
      {
        id: 'm2',
        title: 'Advanced State Management',
        lessons: [
          { id: 'l4', title: 'Context API vs Redux', type: 'video', duration: '15:00', contentUrl: 'dQw4w9WgXcQ', completed: false },
          { id: 'l5', title: 'Practice Lab', type: 'jupyter', duration: '20 min', completed: false },
        ]
      },
      // Course-Based Podcast Module
      {
        id: 'm3-audio',
        title: 'Audio Companion: React on the Go',
        isPodcast: true,
        lessons: [
          { id: 'l6-audio', title: 'React Ecosystem Overview', type: 'podcast', duration: '15:00', completed: false },
          { id: 'l7-audio', title: 'Developer Career Tips', type: 'podcast', duration: '22:00', completed: false },
          { id: 'l8-audio', title: 'Redux Concepts Audio', type: 'podcast', duration: '18:30', completed: false }
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'Data Science with Python',
    description: 'Master data analysis, visualization, and machine learning algorithms using real-world datasets and Jupyter notebooks.',
    thumbnail: 'https://picsum.photos/id/20/800/600',
    instructor: 'Andrew Ng',
    progress: 10,
    totalModules: 5,
    price: 129.00,
    level: 'Advanced',
    category: 'Data Science',
    enrolledStudents: 850,
    learningOutcomes: [
      'Analyze complex datasets with Pandas',
      'Create stunning visualizations with Matplotlib',
      'Build Machine Learning models with Scikit-Learn',
      'Understand Neural Networks basics'
    ],
    modules: [
      {
        id: 'm1',
        title: 'Python Basics',
        lessons: [
          { id: 'l1', title: 'Variables & Types', type: 'jupyter', duration: '15 min', completed: true },
          // Course-based podcast (Specific to Data Science)
          { id: 'l2', title: 'Data Structures Deep Dive', type: 'podcast', duration: '25:00', completed: false },
        ]
      }
    ]
  },
  {
    id: 'c3',
    title: 'UI/UX Design Fundamentals',
    description: 'Create stunning user interfaces and experiences that users love. Learn Figma, prototyping, and design theory.',
    thumbnail: 'https://picsum.photos/id/3/800/600',
    instructor: 'Gary Simon',
    progress: 0,
    totalModules: 3,
    price: 49.99,
    level: 'Beginner',
    category: 'Design',
    enrolledStudents: 3200,
    learningOutcomes: [
      'Master Figma for UI Design',
      'Understand Color Theory & Typography',
      'Create interactive prototypes',
      'Conduct user research and testing'
    ],
    modules: []
  },
  // General Audio Series Course (Visible on Dashboard)
  {
    id: 'general-audio-1',
    title: 'Aelgo Tech Talks',
    description: 'Weekly insights into the changing world of technology, featuring industry experts and quick tips.',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    instructor: 'Aelgo Team',
    progress: 0,
    totalModules: 1,
    price: 0,
    level: 'Beginner',
    category: 'Audio Series', // Key identifier for Dashboard widget
    enrolledStudents: 5000,
    modules: [
      {
        id: 'ga-m1',
        title: 'Season 1: Future Tech',
        isPodcast: true,
        lessons: [
          { id: 'ga-l1', title: 'The Future of AI Agents', type: 'podcast', duration: '12:30', completed: false },
          { id: 'ga-l2', title: 'Breaking into Web3', type: 'podcast', duration: '18:45', completed: false },
          { id: 'ga-l3', title: 'Mental Health for Devs', type: 'podcast', duration: '15:00', completed: false }
        ]
      }
    ]
  }
];
