export const truthReminders = [
  {
    id: 1,
    text: "They chose to leave. That's the answer you needed.",
    category: 'acceptance',
  },
  {
    id: 2,
    text: "You deserve someone who stays.",
    category: 'self-worth',
  },
  {
    id: 3,
    text: "Healing isn't linear. Be patient with yourself.",
    category: 'healing',
  },
  {
    id: 4,
    text: "The urge to text will pass. The regret won't.",
    category: 'urge',
  },
  {
    id: 5,
    text: "You're not missing them. You're missing the idea of them.",
    category: 'clarity',
  },
  {
    id: 6,
    text: "Your peace is more important than their presence.",
    category: 'peace',
  },
  {
    id: 7,
    text: "They're not the one if they let you go.",
    category: 'acceptance',
  },
  {
    id: 8,
    text: "You survived every bad day before this. You'll survive this too.",
    category: 'strength',
  },
  {
    id: 9,
    text: "Closure doesn't come from them. It comes from you.",
    category: 'closure',
  },
  {
    id: 10,
    text: "Don't let loneliness make you forget why you left.",
    category: 'clarity',
  },
  {
    id: 11,
    text: "The right person won't make you question your worth.",
    category: 'self-worth',
  },
  {
    id: 12,
    text: "Missing them doesn't mean you should go back.",
    category: 'urge',
  },
  {
    id: 13,
    text: "You're allowed to grieve and move on at the same time.",
    category: 'healing',
  },
  {
    id: 14,
    text: "Their loss, not yours.",
    category: 'self-worth',
  },
  {
    id: 15,
    text: "Silence is a response. Accept it.",
    category: 'acceptance',
  },
  {
    id: 16,
    text: "You can love someone and still know they're not right for you.",
    category: 'clarity',
  },
  {
    id: 17,
    text: "Don't go back to what broke you.",
    category: 'strength',
  },
  {
    id: 18,
    text: "Your future self will thank you for staying strong today.",
    category: 'motivation',
  },
  {
    id: 19,
    text: "They're not thinking about you as much as you're thinking about them.",
    category: 'clarity',
  },
  {
    id: 20,
    text: "One day you'll be grateful this didn't work out.",
    category: 'hope',
  },
  {
    id: 21,
    text: "You can't force someone to love you the way you deserve.",
    category: 'acceptance',
  },
  {
    id: 22,
    text: "Stop watering dead plants.",
    category: 'clarity',
  },
  {
    id: 23,
    text: "You're not alone in this. Millions are healing too.",
    category: 'comfort',
  },
  {
    id: 24,
    text: "Pain is temporary. Growth is permanent.",
    category: 'healing',
  },
  {
    id: 25,
    text: "Don't let a bad chapter ruin your whole book.",
    category: 'hope',
  },
  {
    id: 26,
    text: "You're stronger than the urge to reach out.",
    category: 'urge',
  },
  {
    id: 27,
    text: "The best revenge is becoming the best version of yourself.",
    category: 'motivation',
  },
  {
    id: 28,
    text: "You didn't come this far to only come this far.",
    category: 'strength',
  },
  {
    id: 29,
    text: "Some people are meant to be lessons, not lifetime partners.",
    category: 'acceptance',
  },
  {
    id: 30,
    text: "Your worth isn't determined by someone who couldn't see it.",
    category: 'self-worth',
  },
  {
    id: 31,
    text: "Every day of no contact is a day of self-respect.",
    category: 'motivation',
  },
  {
    id: 32,
    text: "You're not starting over. You're starting with experience.",
    category: 'hope',
  },
  {
    id: 33,
    text: "The relationship ended. That doesn't mean you failed.",
    category: 'healing',
  },
  {
    id: 34,
    text: "Love yourself enough to walk away from what no longer serves you.",
    category: 'self-worth',
  },
  {
    id: 35,
    text: "They showed you who they are. Believe them.",
    category: 'clarity',
  },
];

// Get truth by day of year (for daily rotation)
export const getDailyTruth = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return truthReminders[dayOfYear % truthReminders.length];
};

// Get random truth (for emergency screen)
export const getRandomTruth = () => {
  return truthReminders[Math.floor(Math.random() * truthReminders.length)];
};

// Get multiple random truths
export const getRandomTruths = (count = 5) => {
  const shuffled = [...truthReminders].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Encouragement messages for the home screen
export const encouragementMessages = [
  "You're on fire this week! Keep that momentum going.",
  "Every day you stay strong, you're building a better future.",
  "Your strength is inspiring. One day at a time.",
  "You've got this! Each day is a victory.",
  "Look how far you've come. Be proud of yourself.",
  "Healing takes courage, and you have plenty of it.",
  "Your future self is thanking you right now.",
  "You're doing something incredibly hard, and you're succeeding.",
  "This streak represents your commitment to yourself.",
  "Every day of no contact is an act of self-love.",
  "You're breaking old patterns and creating new ones.",
  "Trust the process. You're exactly where you need to be.",
  "Your peace of mind is worth protecting.",
  "You're not just surviving, you're thriving.",
  "Keep going - the best is yet to come.",
  "You're stronger than you realize.",
  "This journey is proof of your resilience.",
  "Celebrate every single day of progress.",
  "You're choosing yourself, and that's beautiful.",
  "The hardest part is behind you. Keep moving forward.",
];

// Get random encouragement message
export const getRandomEncouragement = () => {
  return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
};

// Get encouragement based on streak
export const getStreakEncouragement = (streak) => {
  if (streak === 0) return "Today is the perfect day to start fresh.";
  if (streak === 1) return "Day one - the hardest step is already done!";
  if (streak < 7) return "You're building momentum. Keep it up!";
  if (streak < 14) return "A whole week strong! You're incredible!";
  if (streak < 30) return "Two weeks of strength! You're unstoppable!";
  if (streak < 60) return "A month of healing! You should be so proud!";
  if (streak < 90) return "Two months! You're transforming your life!";
  return "90+ days! You've proven you can do anything!";
};

export default truthReminders;
