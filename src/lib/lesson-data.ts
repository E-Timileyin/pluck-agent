export interface LessonData {
  id: string;
  title: string;
  order: number;
  content: string;
  durationMinutes: number;
}

export const LESSONS: LessonData[] = [
  {
    id: 'lesson-1',
    title: 'Introduction & Core Sales Principles',
    order: 1,
    content: 'Welcome to the Promoter Sales Agent training program. In this module, you will learn our core value propositions, customer engagement fundamentals, and communication guidelines.',
    durationMinutes: 5,
  },
  {
    id: 'lesson-2',
    title: 'Handling Objections & Customer Inquiries',
    order: 2,
    content: 'Every sales agent will encounter resistance. This lesson covers active listening, empathy mapping, and proven frameworks for turning hesitation into conversion.',
    durationMinutes: 7,
  },
  {
    id: 'lesson-3',
    title: 'Compliance, Ethics & Critical Rules',
    order: 3,
    content: 'Compliance is non-negotiable. Learn our strict guidelines regarding customer data privacy, transparent pricing structures, and critical compliance pitfalls to avoid.',
    durationMinutes: 10,
  },
  {
    id: 'lesson-4',
    title: 'Closing Techniques & Final Assessment Prep',
    order: 4,
    content: 'Master the art of the close. This final lesson reviews call-to-action strategies and prepares you for the certification quiz that follows.',
    durationMinutes: 5,
  },
];
