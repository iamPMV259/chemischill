// Mock data for Chemistry EdTech Platform

export interface Tag {
  id: string;
  name: string;
  category: 'topic' | 'grade' | 'difficulty';
}

export interface Document {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  views: number;
  downloads: number;
  uploadDate: string;
  fileType: 'PDF' | 'DOC' | 'DOCX';
  featured: boolean;
  status: 'public' | 'private' | 'draft';
  allowDownload: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  tags: string[];
  questionCount: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: boolean;
  rewardDescription?: string;
  participants: number;
  status: 'published' | 'draft';
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  image?: string;
}

export interface CommunityQuestion {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  answerCount: number;
  postedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  points: number;
  rank: number;
  quizzesJoined: number;
  questionsPosted: number;
  joinDate: string;
  status: 'active' | 'blocked';
}

export const tags: Tag[] = [
  { id: '1', name: 'Organic Chemistry', category: 'topic' },
  { id: '2', name: 'Inorganic Chemistry', category: 'topic' },
  { id: '3', name: 'Electrochemistry', category: 'topic' },
  { id: '4', name: 'Ester', category: 'topic' },
  { id: '5', name: 'Amines', category: 'topic' },
  { id: '6', name: 'Redox Reactions', category: 'topic' },
  { id: '7', name: 'Grade 12', category: 'grade' },
  { id: '8', name: 'Grade 11', category: 'grade' },
  { id: '9', name: 'Advanced Exercises', category: 'difficulty' },
  { id: '10', name: 'Specialized Chemistry', category: 'difficulty' },
  { id: '11', name: 'Exam Preparation', category: 'difficulty' },
];

export const documents: Document[] = [
  {
    id: '1',
    title: 'Summary of Common Ester Reactions',
    description: 'Comprehensive guide covering all major ester reactions including synthesis, hydrolysis, and transesterification with detailed mechanisms.',
    tags: ['Ester', 'Organic Chemistry', 'Grade 12'],
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop',
    views: 1243,
    downloads: 856,
    uploadDate: '2026-03-15',
    fileType: 'PDF',
    featured: true,
    status: 'public',
    allowDownload: true,
  },
  {
    id: '2',
    title: '50 Advanced Redox Problems with Solutions',
    description: 'Challenging redox reaction problems with step-by-step solutions. Perfect for olympiad preparation.',
    tags: ['Redox Reactions', 'Advanced Exercises', 'Specialized Chemistry'],
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=250&fit=crop',
    views: 2156,
    downloads: 1432,
    uploadDate: '2026-03-10',
    fileType: 'PDF',
    featured: true,
    status: 'public',
    allowDownload: false,
  },
  {
    id: '3',
    title: 'Electrochemistry Practice Set',
    description: 'Complete practice problems covering galvanic cells, electrolysis, and electrode potentials.',
    tags: ['Electrochemistry', 'Grade 12', 'Exam Preparation'],
    thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=250&fit=crop',
    views: 1876,
    downloads: 1243,
    uploadDate: '2026-03-08',
    fileType: 'PDF',
    featured: false,
    status: 'public',
    allowDownload: true,
  },
  {
    id: '4',
    title: 'Amines and Amino Acids Review Notes',
    description: 'Detailed notes on amine nomenclature, properties, reactions, and amino acid chemistry.',
    tags: ['Amines', 'Organic Chemistry', 'Grade 12'],
    thumbnail: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=400&h=250&fit=crop',
    views: 1534,
    downloads: 987,
    uploadDate: '2026-03-05',
    fileType: 'PDF',
    featured: false,
    status: 'public',
    allowDownload: false,
  },
  {
    id: '5',
    title: 'Advanced Chemistry Olympiad Exercises',
    description: 'High-level problems from past chemistry olympiads with comprehensive solutions.',
    tags: ['Specialized Chemistry', 'Advanced Exercises'],
    thumbnail: 'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?w=400&h=250&fit=crop',
    views: 2943,
    downloads: 1876,
    uploadDate: '2026-03-01',
    fileType: 'PDF',
    featured: true,
    status: 'public',
    allowDownload: true,
  },
  {
    id: '6',
    title: 'Inorganic Chemistry Fundamentals',
    description: 'Core concepts in inorganic chemistry including coordination compounds and transition metals.',
    tags: ['Inorganic Chemistry', 'Grade 11'],
    thumbnail: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=250&fit=crop',
    views: 1654,
    downloads: 1123,
    uploadDate: '2026-02-28',
    fileType: 'PDF',
    featured: false,
    status: 'public',
    allowDownload: false,
  },
];

export const quizzes: Quiz[] = [
  {
    id: '1',
    title: '15-Question Quiz: Basic Ester Theory',
    description: 'Test your understanding of ester formation, properties, and reactions.',
    topic: 'Ester',
    tags: ['Ester', 'Organic Chemistry'],
    questionCount: 15,
    timeLimit: 20,
    difficulty: 'medium',
    reward: false,
    participants: 342,
    status: 'published',
  },
  {
    id: '2',
    title: 'Weekly Advanced Chemistry Challenge',
    description: 'This week\'s challenge covers electrochemistry and redox reactions.',
    topic: 'Electrochemistry',
    tags: ['Electrochemistry', 'Redox Reactions'],
    questionCount: 20,
    timeLimit: 30,
    difficulty: 'hard',
    reward: true,
    rewardDescription: 'Top 3 winners receive exclusive study materials',
    participants: 567,
    status: 'published',
  },
  {
    id: '3',
    title: 'Reward Quiz: Electrochemistry Mastery',
    description: 'Master electrochemistry concepts and compete for rewards!',
    topic: 'Electrochemistry',
    tags: ['Electrochemistry', 'Advanced Exercises'],
    questionCount: 25,
    timeLimit: 35,
    difficulty: 'hard',
    reward: true,
    rewardDescription: 'Winners get premium document access for 1 month',
    participants: 789,
    status: 'published',
  },
  {
    id: '4',
    title: 'Organic Chemistry Speed Test',
    description: 'Quick-fire questions on organic chemistry fundamentals.',
    topic: 'Organic Chemistry',
    tags: ['Organic Chemistry'],
    questionCount: 30,
    timeLimit: 15,
    difficulty: 'easy',
    reward: false,
    participants: 1234,
    status: 'published',
  },
];

export const sampleQuestions: Question[] = [
  {
    id: '1',
    question: 'Which of the following is the correct IUPAC name for CH₃COOCH₂CH₃?',
    options: [
      'Ethyl methanoate',
      'Ethyl ethanoate',
      'Methyl ethanoate',
      'Propyl methanoate',
    ],
    correctAnswer: 1,
    explanation: 'Ethyl ethanoate is formed from ethanoic acid (CH₃COOH) and ethanol (CH₃CH₂OH). The acid part gives "ethanoate" and the alcohol part gives "ethyl".',
  },
  {
    id: '2',
    question: 'In a galvanic cell, which electrode acts as the cathode?',
    options: [
      'The electrode where oxidation occurs',
      'The electrode where reduction occurs',
      'The negative electrode',
      'The electrode that loses electrons',
    ],
    correctAnswer: 1,
    explanation: 'The cathode is the electrode where reduction occurs. In a galvanic cell, the cathode is the positive electrode where electrons are gained.',
  },
];

export const communityQuestions: CommunityQuestion[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Nguyễn Minh An',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    title: 'Please help me solve this electrochemistry problem',
    description: 'I am stuck on calculating the cell potential for this galvanic cell. The problem involves Cu²⁺ and Zn electrodes but I cannot balance the half-reactions correctly.',
    tags: ['Electrochemistry', 'Advanced Exercises'],
    images: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop'],
    answerCount: 5,
    postedDate: '2026-04-08',
    status: 'approved',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Trần Thị Bình',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    title: 'I do not understand electron balance in this reaction',
    description: 'For the redox reaction between KMnO₄ and FeSO₄ in acidic solution, how do I balance the electrons transferred?',
    tags: ['Redox Reactions', 'Inorganic Chemistry'],
    images: [],
    answerCount: 8,
    postedDate: '2026-04-07',
    status: 'approved',
  },
  {
    id: '3',
    userId: '3',
    userName: 'Lê Hoàng Duy',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    title: 'How can I distinguish alcohol and phenol reactions?',
    description: 'Both alcohols and phenols have -OH groups. What are the key reactions that help differentiate them in laboratory tests?',
    tags: ['Organic Chemistry', 'Grade 12'],
    images: [],
    answerCount: 12,
    postedDate: '2026-04-06',
    status: 'approved',
  },
  {
    id: '4',
    userId: '4',
    userName: 'Phạm Quốc Hưng',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    title: 'Can someone explain this advanced ester problem?',
    description: 'This olympiad-level problem involves multiple esterification steps and I cannot determine the final product structure.',
    tags: ['Ester', 'Specialized Chemistry'],
    images: ['https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&h=400&fit=crop'],
    answerCount: 3,
    postedDate: '2026-04-09',
    status: 'approved',
  },
  {
    id: '5',
    userId: '5',
    userName: 'Võ Thị Cẩm',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    title: 'Need help with amine nomenclature',
    description: 'How do I name complex amines with multiple substituents? Is there a systematic approach?',
    tags: ['Amines', 'Organic Chemistry'],
    images: [],
    answerCount: 0,
    postedDate: '2026-04-10',
    status: 'pending',
  },
];

export const leaderboardUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader1',
    points: 2450,
    rank: 1,
    quizzesJoined: 45,
    questionsPosted: 12,
    joinDate: '2025-09-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    phone: '0902345678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader2',
    points: 2380,
    rank: 2,
    quizzesJoined: 42,
    questionsPosted: 18,
    joinDate: '2025-10-01',
    status: 'active',
  },
  {
    id: '3',
    name: 'Lê Minh Châu',
    phone: '0903456789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader3',
    points: 2290,
    rank: 3,
    quizzesJoined: 38,
    questionsPosted: 15,
    joinDate: '2025-10-10',
    status: 'active',
  },
  {
    id: '4',
    name: 'Phạm Quốc Duy',
    phone: '0904567890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader4',
    points: 2150,
    rank: 4,
    quizzesJoined: 36,
    questionsPosted: 9,
    joinDate: '2025-11-05',
    status: 'active',
  },
  {
    id: '5',
    name: 'Hoàng Thị Em',
    phone: '0905678901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader5',
    points: 2050,
    rank: 5,
    quizzesJoined: 34,
    questionsPosted: 11,
    joinDate: '2025-11-20',
    status: 'active',
  },
  {
    id: '6',
    name: 'Đặng Văn Phong',
    phone: '0906789012',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader6',
    points: 1920,
    rank: 6,
    quizzesJoined: 31,
    questionsPosted: 7,
    joinDate: '2025-12-01',
    status: 'active',
  },
  {
    id: '7',
    name: 'Vũ Thị Giang',
    phone: '0907890123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader7',
    points: 1850,
    rank: 7,
    quizzesJoined: 29,
    questionsPosted: 13,
    joinDate: '2025-12-15',
    status: 'active',
  },
  {
    id: '8',
    name: 'Bùi Minh Hiếu',
    phone: '0908901234',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader8',
    points: 1780,
    rank: 8,
    quizzesJoined: 27,
    questionsPosted: 8,
    joinDate: '2026-01-10',
    status: 'active',
  },
  {
    id: '9',
    name: 'Ngô Thị Lan',
    phone: '0909012345',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader9',
    points: 1690,
    rank: 9,
    quizzesJoined: 25,
    questionsPosted: 10,
    joinDate: '2026-01-25',
    status: 'active',
  },
  {
    id: '10',
    name: 'Đinh Văn Khải',
    phone: '0900123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader10',
    points: 1620,
    rank: 10,
    quizzesJoined: 23,
    questionsPosted: 6,
    joinDate: '2026-02-05',
    status: 'active',
  },
];
