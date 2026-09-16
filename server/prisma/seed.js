// prisma/seed.js
// Run with: node prisma/seed.js
// Seeds the "Platform Launch" demo board matching the reference design

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  await prisma.board.deleteMany();

  // ── Board 1: Platform Launch ──────────────────────────────────────
  const platformLaunch = await prisma.board.create({
    data: {
      name: 'Platform Launch',
      columns: {
        create: [
          {
            name: 'Todo',
            color: '#49C4E5',
            position: 0,
            tasks: {
              create: [
                {
                  title: 'Build UI for onboarding flow',
                  description: '',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Sign up page' },
                      { title: 'Sign in page' },
                      { title: 'Welcome page' },
                    ],
                  },
                },
                {
                  title: 'Build UI for search',
                  description: '',
                  position: 1,
                  subtasks: {
                    create: [{ title: 'Search page' }],
                  },
                },
                {
                  title: 'Build settings UI',
                  description: '',
                  position: 2,
                  subtasks: {
                    create: [
                      { title: 'Account page' },
                      { title: 'Billing page' },
                    ],
                  },
                },
                {
                  title: 'QA and test all major user journeys',
                  description: 'Test all user flows end-to-end.',
                  position: 3,
                  subtasks: {
                    create: [
                      { title: 'Internal QA' },
                      { title: 'External user testing' },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Doing',
            color: '#8471F2',
            position: 1,
            tasks: {
              create: [
                {
                  title: 'Design settings and search pages',
                  description: '',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Settings page', isCompleted: true },
                      { title: 'General page' },
                      { title: 'Profile page' },
                    ],
                  },
                },
                {
                  title: 'Add account management endpoints',
                  description: '',
                  position: 1,
                  subtasks: {
                    create: [
                      { title: 'Endpoint for updating username', isCompleted: true },
                      { title: 'Endpoint for updating email', isCompleted: true },
                      { title: 'Endpoint for updating password' },
                    ],
                  },
                },
                {
                  title: 'Design onboarding flow',
                  description: '',
                  position: 2,
                  subtasks: {
                    create: [
                      { title: 'Sign up page', isCompleted: true },
                      { title: 'Sign in page' },
                      { title: 'Welcome page' },
                    ],
                  },
                },
                {
                  title: 'Add search endpoints',
                  description: '',
                  position: 3,
                  subtasks: {
                    create: [
                      { title: 'Add search endpoint', isCompleted: true },
                      { title: 'Define search filters' },
                    ],
                  },
                },
                {
                  title: 'Add authentication endpoints',
                  description: '',
                  position: 4,
                  subtasks: {
                    create: [
                      { title: 'Define user model', isCompleted: true },
                      { title: 'Add auth endpoints' },
                      { title: 'Write unit tests' },
                    ],
                  },
                },
                {
                  title: 'Research pricing points of various competitors and trial different business models',
                  description: 'Investigate SaaS pricing and alternatives.',
                  position: 5,
                  subtasks: {
                    create: [
                      { title: 'Research competitor pricing', isCompleted: true },
                      { title: 'Create spreadsheet with findings' },
                      { title: 'Discuss with team' },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Done',
            color: '#67E2AE',
            position: 2,
            tasks: {
              create: [
                {
                  title: 'Conduct 5 wireframe tests',
                  description: '',
                  position: 0,
                  subtasks: {
                    create: [{ title: 'Complete 5 wireframe prototype tests', isCompleted: true }],
                  },
                },
                {
                  title: 'Create wireframe prototype',
                  description: '',
                  position: 1,
                  subtasks: {
                    create: [{ title: 'Create clickable wireframe prototype', isCompleted: true }],
                  },
                },
                {
                  title: 'Review results of usability tests and iterate',
                  description: '',
                  position: 2,
                  subtasks: {
                    create: [
                      { title: 'Review results', isCompleted: true },
                      { title: 'Iterate on designs', isCompleted: true },
                      { title: 'Hand off to dev team', isCompleted: true },
                    ],
                  },
                },
                {
                  title: 'Create paper prototypes and conduct 10 usability tests with potential customers',
                  description: '',
                  position: 3,
                  subtasks: {
                    create: [
                      { title: 'Create paper prototypes', isCompleted: true },
                      { title: 'Conduct 10 usability tests', isCompleted: true },
                    ],
                  },
                },
                {
                  title: 'Market discovery',
                  description: '',
                  position: 4,
                  subtasks: {
                    create: [{ title: 'Interview 10 target users', isCompleted: true }],
                  },
                },
                {
                  title: 'Competitor analysis',
                  description: '',
                  position: 5,
                  subtasks: {
                    create: [
                      { title: 'Find direct competitors', isCompleted: true },
                      { title: 'SWOT analysis', isCompleted: true },
                    ],
                  },
                },
                {
                  title: 'Research the market',
                  description: '',
                  position: 6,
                  subtasks: {
                    create: [
                      { title: 'Identify target audience', isCompleted: true },
                      { title: 'Define market segments', isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── Board 2: Marketing Plan ───────────────────────────────────────
  await prisma.board.create({
    data: {
      name: 'Marketing Plan',
      columns: {
        create: [
          { name: 'Todo', color: '#49C4E5', position: 0 },
          { name: 'Doing', color: '#8471F2', position: 1 },
          { name: 'Done', color: '#67E2AE', position: 2 },
        ],
      },
    },
  });

  // ── Board 3: Roadmap ──────────────────────────────────────────────
  await prisma.board.create({
    data: {
      name: 'Roadmap',
      columns: {
        create: [
          { name: 'Now', color: '#49C4E5', position: 0 },
          { name: 'Next', color: '#8471F2', position: 1 },
          { name: 'Later', color: '#67E2AE', position: 2 },
        ],
      },
    },
  });

  console.log(`✅ Seeded: Platform Launch board (id=${platformLaunch.id})`);
  console.log('✅ Seeded: Marketing Plan board');
  console.log('✅ Seeded: Roadmap board');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
