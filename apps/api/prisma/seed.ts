import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default',
      plan: 'FREE',
    },
  });

  console.log(`Created organization: ${org.name} (${org.id})`);

  // Create sample templates
  const templates = [
    {
      name: 'Lead Generation',
      description: 'Automatically capture leads from web forms and add them to your CRM',
      category: 'lead-gen',
      isPublic: true,
      definition: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'TRIGGER',
            category: 'TRIGGER_WEBHOOK',
            label: 'New Form Submission',
            position: { x: 250, y: 100 },
            config: { method: 'POST', path: '/lead-capture' },
          },
          {
            id: 'action-1',
            type: 'ACTION',
            category: 'ACTION_OPENAI',
            label: 'Qualify Lead',
            position: { x: 500, y: 100 },
            config: {
              model: 'gpt-4o-mini',
              prompt: 'Analyze this lead and provide a qualification score from 1-10.',
            },
          },
          {
            id: 'action-2',
            type: 'ACTION',
            category: 'ACTION_SLACK',
            label: 'Notify Team',
            position: { x: 750, y: 100 },
            config: { channelId: '#leads', message: 'New lead: {{lead.name}} - Score: {{score}}' },
          },
        ],
        edges: [
          { id: 'edge-1', source: 'trigger-1', target: 'action-1' },
          { id: 'edge-2', source: 'action-1', target: 'action-2' },
        ],
      },
    },
    {
      name: 'Email Follow-up',
      description: 'Send automated follow-up emails based on user behavior',
      category: 'email',
      isPublic: true,
      definition: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'TRIGGER',
            category: 'TRIGGER_SCHEDULE',
            label: 'Daily Check',
            position: { x: 250, y: 100 },
            config: { interval: 1440 },
          },
          {
            id: 'action-1',
            type: 'ACTION',
            category: 'ACTION_EMAIL',
            label: 'Send Follow-up',
            position: { x: 500, y: 100 },
            config: {
              to: '{{email}}',
              subject: 'Following up on our conversation',
              body: 'Hi {{name}}, I wanted to follow up...',
            },
          },
        ],
        edges: [{ id: 'edge-1', source: 'trigger-1', target: 'action-1' }],
      },
    },
    {
      name: 'Content Generator',
      description: 'Generate social media content from a topic using AI',
      category: 'content',
      isPublic: true,
      definition: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'TRIGGER',
            category: 'TRIGGER_WEBHOOK',
            label: 'Content Request',
            position: { x: 250, y: 100 },
            config: { method: 'POST', path: '/generate-content' },
          },
          {
            id: 'action-1',
            type: 'ACTION',
            category: 'ACTION_OPENAI',
            label: 'Generate Content',
            position: { x: 500, y: 100 },
            config: {
              model: 'gpt-4o',
              prompt: 'Create a social media post about: {{topic}}',
              temperature: 0.8,
            },
          },
          {
            id: 'action-2',
            type: 'ACTION',
            category: 'ACTION_SLACK',
            label: 'Post to Channel',
            position: { x: 750, y: 100 },
            config: { channelId: '#content', message: '{{content}}' },
          },
        ],
        edges: [
          { id: 'edge-1', source: 'trigger-1', target: 'action-1' },
          { id: 'edge-2', source: 'action-1', target: 'action-2' },
        ],
      },
    },
  ];

  for (const template of templates) {
    const existing = await prisma.template.findFirst({
      where: { name: template.name },
    });

    if (!existing) {
      await prisma.template.create({
        data: {
          ...template,
          definition: JSON.stringify(template.definition),
        },
      });
      console.log(`Created template: ${template.name}`);
    }
  }

  // Create default subscription
  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      plan: 'FREE',
      status: 'active',
    },
  });

  // Create default usage record for current period
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  await prisma.usage.upsert({
    where: {
      organizationId_period: {
        organizationId: org.id,
        period,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      period,
      executions: 0,
      aiTokens: 0,
      apiCalls: 0,
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
