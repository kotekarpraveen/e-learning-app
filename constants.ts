
import { Course, User } from './types';

export const MOCK_USER_STUDENT: User = {
  id: 's1',
  name: 'Alex Johnson',
  email: 'student@alego.com',
  role: 'student',
  avatar: 'https://picsum.photos/id/64/200/200'
};

export const MOCK_USER_ADMIN: User = {
  id: 'a1',
  name: 'Sarah Connor',
  email: 'admin@alego.com',
  role: 'admin',
  avatar: 'https://picsum.photos/id/65/200/200'
};

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
          { id: 'l2', title: 'Data Structures Podcast', type: 'podcast', duration: '25:00', completed: false },
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
  }
];
