// Buying Probability Engine (0-99)
// This is NOT an engagement score. It answers one question:
// "If this customer walked into the dealership right now, what is the probability they purchase a motorcycle?"

const WEIGHTS = {
  productInterest: 25,      // Specific bike, availability, photos, options
  transactionReadiness: 40, // Trade, financing, payments, credit app
  purchaseTimeline: 20,     // Immediate timeline, appointment activity
  engagementQuality: 14,    // Meaningful conversation, re-engagement
};

// Keywords that trigger each category
const SIGNALS = {
  productInterest: [
    'which bike', 'do you have', 'is it available', 'availability', 'in stock',
    'can i see', 'photos', 'pictures', 'colors', 'options', 'features',
    'street glide', 'road glide', 'fat boy', 'sportster', 'iron 883',
    'heritage', 'softail', 'road king', 'ultra limited', 'low rider',
    'pan america', 'nightster', 'breakout', 'fat bob', 'electra glide'
  ],
  transactionReadiness: [
    'trade', 'trade-in', 'trade in', 'my bike', 'financing', 'finance',
    'payment', 'monthly', 'down payment', 'credit', 'credit app',
    'credit application', 'apply', 'how much', 'price', 'cost',
    'what do you give', 'what would you give', 'loan', 'interest rate',
    'approved', 'pre-approved', 'buy', 'purchase', 'deal'
  ],
  purchaseTimeline: [
    'this week', 'this weekend', 'today', 'tomorrow', 'soon', 'asap',
    'right away', 'immediately', 'ready to buy', 'ready to purchase',
    'come in', 'visit', 'appointment', 'stop by', 'when can i',
    'schedule', 'available to meet', 'test ride'
  ],
  engagementQuality: [
    'thanks', 'thank you', 'appreciate', 'great', 'awesome', 'love it',
    'sounds good', 'perfect', 'absolutely', 'definitely', 'for sure',
    'tell me more', 'what else', 'good to know', 'makes sense'
  ]
};

// Flags that require human intervention
const HUMAN_FLAGS = [
  'price', 'pricing', 'how much', 'payment', 'monthly payment',
  'financing', 'finance', 'credit app', 'credit application',
  'interest rate', 'manager', 'speak to someone', 'talk to someone',
  'call me', 'human', 'real person'
];

function detectSignals(conversation) {
  const fullText = conversation
    .map(msg => msg.content.toLowerCase())
    .join(' ');

  const detected = {
    productInterest: [],
    transactionReadiness: [],
    purchaseTimeline: [],
    engagementQuality: []
  };

  for (const [category, keywords] of Object.entries(SIGNALS)) {
    for (const keyword of keywords) {
      if (fullText.includes(keyword) && !detected[category].includes(keyword)) {
        detected[category].push(keyword);
      }
    }
  }

  return detected;
}

function calculateScore(conversation, leadInfo) {
  const signals = detectSignals(conversation);

  // Base scores per category (0-100 scale per category, then weighted)
  let productScore = 0;
  let transactionScore = 0;
  let timelineScore = 0;
  let engagementScore = 0;

  // Product Interest (max 25 points)
  if (signals.productInterest.length >= 3) productScore = 100;
  else if (signals.productInterest.length === 2) productScore = 70;
  else if (signals.productInterest.length === 1) productScore = 40;

  // Transaction Readiness (max 40 points) — most important
  if (signals.transactionReadiness.some(s =>
    ['credit application', 'credit app', 'apply', 'approved', 'pre-approved'].includes(s)
  )) {
    transactionScore = 100; // Credit app is strongest signal
  } else if (signals.transactionReadiness.some(s =>
    ['financing', 'finance', 'trade', 'trade-in', 'trade in'].includes(s)
  )) {
    transactionScore = 75;
  } else if (signals.transactionReadiness.some(s =>
    ['payment', 'monthly', 'price', 'cost', 'how much'].includes(s)
  )) {
    transactionScore = 50;
  } else if (signals.transactionReadiness.length > 0) {
    transactionScore = 25;
  }

  // Purchase Timeline (max 20 points)
  if (signals.purchaseTimeline.some(s =>
    ['today', 'tomorrow', 'this week', 'this weekend', 'ready to buy', 'ready to purchase'].includes(s)
  )) {
    timelineScore = 100;
  } else if (signals.purchaseTimeline.some(s =>
    ['appointment', 'schedule', 'come in', 'visit', 'test ride'].includes(s)
  )) {
    timelineScore = 65;
  } else if (signals.purchaseTimeline.length > 0) {
    timelineScore = 35;
  }

  // Engagement Quality (max 14 points)
  const messageCount = conversation.filter(m => m.role === 'user').length;
  if (messageCount >= 5) engagementScore = 100;
  else if (messageCount >= 3) engagementScore = 65;
  else if (messageCount >= 1) engagementScore = 30;

  // Calculate weighted score
  let rawScore =
    (productScore * WEIGHTS.productInterest / 100) +
    (transactionScore * WEIGHTS.transactionReadiness / 100) +
    (timelineScore * WEIGHTS.purchaseTimeline / 100) +
    (engagementScore * WEIGHTS.engagementQuality / 100);

  // Apply spec rules
  // No lead exceeds ~75 without clear transaction intent
  if (transactionScore === 0 && rawScore > 75) rawScore = 74;

  // No lead exceeds ~85 without significant financial buying signal
  const hasFinancialSignal = signals.transactionReadiness.some(s =>
    ['financing', 'finance', 'credit app', 'credit application', 'apply', 'trade', 'trade-in'].includes(s)
  );
  if (!hasFinancialSignal && rawScore > 85) rawScore = 84;

  // 90+ should be rare — requires credit app + appointment + active engagement
  const hasCreditApp = signals.transactionReadiness.some(s =>
    ['credit application', 'credit app', 'apply', 'approved'].includes(s)
  );
  const hasAppointment = signals.purchaseTimeline.some(s =>
    ['appointment', 'schedule', 'come in'].includes(s)
  );
  if (rawScore >= 90 && !(hasCreditApp && hasAppointment && messageCount >= 5)) {
    rawScore = 89;
  }

  const finalScore = Math.min(99, Math.max(0, Math.round(rawScore)));

  return {
    score: finalScore,
    signals: getTop3Signals(signals),
    breakdown: {
      productInterest: Math.round(productScore * WEIGHTS.productInterest / 100),
      transactionReadiness: Math.round(transactionScore * WEIGHTS.transactionReadiness / 100),
      purchaseTimeline: Math.round(timelineScore * WEIGHTS.purchaseTimeline / 100),
      engagementQuality: Math.round(engagementScore * WEIGHTS.engagementQuality / 100)
    }
  };
}

function getTop3Signals(signals) {
  const all = [
    ...signals.transactionReadiness.map(s => ({ signal: s, category: 'Transaction' })),
    ...signals.purchaseTimeline.map(s => ({ signal: s, category: 'Timeline' })),
    ...signals.productInterest.map(s => ({ signal: s, category: 'Product' })),
    ...signals.engagementQuality.map(s => ({ signal: s, category: 'Engagement' }))
  ];
  return all.slice(0, 3);
}

function checkPriorityFlag(conversation) {
  const fullText = conversation
    .map(msg => msg.content.toLowerCase())
    .join(' ');

  const flagged = HUMAN_FLAGS.filter(flag => fullText.includes(flag));
  return {
    isPriority: flagged.length > 0,
    reasons: flagged.slice(0, 3)
  };
}

function getScoreColor(score) {
  if (score >= 90) return { color: 'green', label: 'Elite / Near-Certain Buyer' };
  if (score >= 75) return { color: 'red', label: 'High Probability Buyer' };
  if (score >= 60) return { color: 'orange', label: 'Strong Buyer' };
  if (score >= 40) return { color: 'yellow', label: 'Qualified Prospect' };
  if (score >= 20) return { color: 'blue', label: 'Casual Shopper' };
  return { color: 'darkgray', label: 'Very Low Probability' };
}

module.exports = { calculateScore, checkPriorityFlag, getScoreColor };