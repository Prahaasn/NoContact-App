export const journalPrompts = [
  {
    id: 1,
    prompt: "What are 3 things you're grateful for today?",
    category: 'gratitude',
  },
  {
    id: 2,
    prompt: "Write about a moment when you felt truly happy before them.",
    category: 'reflection',
  },
  {
    id: 3,
    prompt: "What boundaries do you want in your next relationship?",
    category: 'growth',
  },
  {
    id: 4,
    prompt: "Describe your ideal day one year from now.",
    category: 'future',
  },
  {
    id: 5,
    prompt: "What did you learn about yourself from this relationship?",
    category: 'reflection',
  },
  {
    id: 6,
    prompt: "List 5 things you love about yourself.",
    category: 'self-love',
  },
  {
    id: 7,
    prompt: "What red flags did you ignore? Why?",
    category: 'reflection',
  },
  {
    id: 8,
    prompt: "Write a letter to your future healed self.",
    category: 'healing',
  },
  {
    id: 9,
    prompt: "What hobbies or interests did you neglect during the relationship?",
    category: 'rediscovery',
  },
  {
    id: 10,
    prompt: "Describe how you want to feel in 30 days.",
    category: 'future',
  },
  {
    id: 11,
    prompt: "What would you tell a friend going through the same thing?",
    category: 'perspective',
  },
  {
    id: 12,
    prompt: "List the reasons why no contact is the right choice.",
    category: 'clarity',
  },
  {
    id: 13,
    prompt: "What parts of yourself did you lose in the relationship?",
    category: 'reflection',
  },
  {
    id: 14,
    prompt: "Write about someone who truly supports you.",
    category: 'gratitude',
  },
  {
    id: 15,
    prompt: "What does self-love look like for you today?",
    category: 'self-love',
  },
  {
    id: 16,
    prompt: "Describe a small win you had this week.",
    category: 'progress',
  },
  {
    id: 17,
    prompt: "What triggered you today? How did you cope?",
    category: 'processing',
  },
  {
    id: 18,
    prompt: "Write about a goal you want to achieve now that you're single.",
    category: 'future',
  },
  {
    id: 19,
    prompt: "What do you miss about being alone?",
    category: 'rediscovery',
  },
  {
    id: 20,
    prompt: "How has your strength surprised you during this time?",
    category: 'strength',
  },
  {
    id: 21,
    prompt: "Write about a moment this week when you felt at peace.",
    category: 'healing',
  },
  {
    id: 22,
    prompt: "What non-negotiables do you have for future relationships?",
    category: 'growth',
  },
  {
    id: 23,
    prompt: "Describe how you've grown since the breakup.",
    category: 'progress',
  },
  {
    id: 24,
    prompt: "What advice would your 80-year-old self give you right now?",
    category: 'perspective',
  },
  {
    id: 25,
    prompt: "Write about something that made you smile today.",
    category: 'gratitude',
  },
];

// Get prompt by day of week
export const getDailyPrompt = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return journalPrompts[dayOfYear % journalPrompts.length];
};

// Get prompts by category
export const getPromptsByCategory = (category) => {
  return journalPrompts.filter((p) => p.category === category);
};

// Get random prompts
export const getRandomPrompts = (count = 3) => {
  const shuffled = [...journalPrompts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Prompts specifically for unsent letters
export const unsentLetterPrompts = [
  "Write the goodbye you never got to say.",
  "Tell them everything you wish you could say one last time.",
  "Write about what you wish had been different.",
  "Express the anger you've been holding back.",
  "Write about the moment you knew it was over.",
  "Tell them how their actions affected you.",
  "Write what you would say if they asked for you back.",
  "Describe the person you're becoming without them.",
  "Write about the future you imagined with them.",
  "Tell them the truth you were afraid to say.",
  "Write about what you loved and what you lost.",
  "Express gratitude for the lessons, even the painful ones.",
];

// Get random unsent letter prompt
export const getRandomUnsentLetterPrompt = () => {
  return unsentLetterPrompts[Math.floor(Math.random() * unsentLetterPrompts.length)];
};

export default journalPrompts;
