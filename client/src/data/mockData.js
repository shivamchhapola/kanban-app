export const MOCK_BOARDS = [
  { id: 1, name: 'Platform Launch' },
  { id: 2, name: 'Marketing Plan' },
  { id: 3, name: 'Roadmap' },
];

export const MOCK_BOARD_DETAIL = {
  id: 1,
  name: 'Platform Launch',
  columns: [
    {
      id: 1, name: 'Todo', color: '#49C4E5',
      tasks: [
        { id: 1, title: 'Build UI for onboarding flow', description: 'We need to build pages for the sign up, sign in and welcome flows.', subtasks: [{ id: 1, title: 'Sign up page', isCompleted: false }, { id: 2, title: 'Sign in page', isCompleted: false }, { id: 3, title: 'Welcome page', isCompleted: false }] },
        { id: 2, title: 'Build UI for search', description: '', subtasks: [{ id: 4, title: 'Search page', isCompleted: false }] },
        { id: 3, title: 'Build settings UI', description: '', subtasks: [{ id: 5, title: 'Account page', isCompleted: false }, { id: 6, title: 'Billing page', isCompleted: false }] },
        { id: 4, title: 'QA and test all major user journeys', description: 'Test all user flows end-to-end.', subtasks: [{ id: 7, title: 'Internal QA', isCompleted: false }, { id: 8, title: 'External user testing', isCompleted: false }] },
      ],
    },
    {
      id: 2, name: 'Doing', color: '#8471F2',
      tasks: [
        { id: 5, title: 'Design settings and search pages', description: '', subtasks: [{ id: 9, title: 'Settings page', isCompleted: true }, { id: 10, title: 'General page', isCompleted: false }, { id: 11, title: 'Profile page', isCompleted: false }] },
        { id: 6, title: 'Add account management endpoints', description: '', subtasks: [{ id: 12, title: 'Endpoint for updating username', isCompleted: true }, { id: 13, title: 'Endpoint for updating email', isCompleted: true }, { id: 14, title: 'Endpoint for updating password', isCompleted: false }] },
        { id: 7, title: 'Design onboarding flow', description: '', subtasks: [{ id: 15, title: 'Sign up page', isCompleted: true }, { id: 16, title: 'Sign in page', isCompleted: false }, { id: 17, title: 'Welcome page', isCompleted: false }] },
        { id: 8, title: 'Add search endpoints', description: '', subtasks: [{ id: 18, title: 'Add search endpoint', isCompleted: true }, { id: 19, title: 'Define search filters', isCompleted: false }] },
        { id: 9, title: 'Add authentication endpoints', description: '', subtasks: [{ id: 20, title: 'Define user model', isCompleted: true }, { id: 21, title: 'Add auth endpoints', isCompleted: false }, { id: 22, title: 'Write unit tests', isCompleted: false }] },
        { id: 10, title: 'Research pricing points of various competitors and trial different business models', description: '', subtasks: [{ id: 23, title: 'Research competitor pricing', isCompleted: true }, { id: 24, title: 'Create spreadsheet with findings', isCompleted: false }, { id: 25, title: 'Discuss with team', isCompleted: false }] },
      ],
    },
    {
      id: 3, name: 'Done', color: '#67E2AE',
      tasks: [
        { id: 11, title: 'Conduct 5 wireframe tests', description: '', subtasks: [{ id: 26, title: 'Complete 5 wireframe prototype tests', isCompleted: true }] },
        { id: 12, title: 'Create wireframe prototype', description: '', subtasks: [{ id: 27, title: 'Create clickable wireframe prototype', isCompleted: true }] },
        { id: 13, title: 'Review results of usability tests and iterate', description: '', subtasks: [{ id: 28, title: 'Review results', isCompleted: true }, { id: 29, title: 'Iterate on designs', isCompleted: true }, { id: 30, title: 'Hand off to dev team', isCompleted: true }] },
        { id: 14, title: 'Create paper prototypes and conduct 10 usability tests with potential customers', description: '', subtasks: [{ id: 31, title: 'Create paper prototypes', isCompleted: true }, { id: 32, title: 'Conduct 10 usability tests', isCompleted: true }] },
        { id: 15, title: 'Market discovery', description: '', subtasks: [{ id: 33, title: 'Interview 10 target users', isCompleted: true }] },
        { id: 16, title: 'Competitor analysis', description: '', subtasks: [{ id: 34, title: 'Find direct competitors', isCompleted: true }, { id: 35, title: 'SWOT analysis', isCompleted: true }] },
        { id: 17, title: 'Research the market', description: '', subtasks: [{ id: 36, title: 'Identify target audience', isCompleted: true }, { id: 37, title: 'Define market segments', isCompleted: true }] },
      ],
    },
  ],
};
