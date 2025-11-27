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

export default truthReminders;
