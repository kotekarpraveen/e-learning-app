
import { Course, User } from './types';

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
  role: 'admin',
  avatar: 'https://picsum.photos/id/65/200/200'
};

// Public domain / Creative Commons sample audio for testing background play
const SAMPLE_AUDIO_1 = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3";
const SAMPLE_AUDIO_2 = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"; 

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
          { id: 'l6-audio', title: 'React Ecosystem Overview', type: 'podcast', duration: '15:00', contentUrl: SAMPLE_AUDIO_1, completed: false },
          { id: 'l7-audio', title: 'Developer Career Tips', type: 'podcast', duration: '22:00', contentUrl: SAMPLE_AUDIO_2, completed: false },
          { id: 'l8-audio', title: 'Redux Concepts Audio', type: 'podcast', duration: '18:30', contentUrl: SAMPLE_AUDIO_1, completed: false }
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
          { id: 'l2', title: 'Data Structures Deep Dive', type: 'podcast', duration: '25:00', contentUrl: SAMPLE_AUDIO_2, completed: false },
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
          { id: 'ga-l1', title: 'The Future of AI Agents', type: 'podcast', duration: '12:30', contentUrl: SAMPLE_AUDIO_1, completed: false },
          { id: 'ga-l2', title: 'Breaking into Web3', type: 'podcast', duration: '18:45', contentUrl: SAMPLE_AUDIO_2, completed: false },
          { id: 'ga-l3', title: 'Mental Health for Devs', type: 'podcast', duration: '15:00', contentUrl: SAMPLE_AUDIO_1, completed: false }
        ]
      }
    ]
  }
];
