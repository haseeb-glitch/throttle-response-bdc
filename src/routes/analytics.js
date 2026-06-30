const express = require('express');

module.exports = function (leads) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const data = leads.data;

    const tiers = { cold: 0, warm: 0, hot: 0, elite: 0 };
    data.forEach(l => {
      if      (l.score >= 90) tiers.elite++;
      else if (l.score >= 75) tiers.hot++;
      else if (l.score >= 40) tiers.warm++;
      else                    tiers.cold++;
    });

    const distribution = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}–${i * 10 + 9}`,
      count: 0
    }));
    data.forEach(l => {
      const bucket = Math.min(Math.floor((l.score ?? 0) / 10), 9);
      distribution[bucket].count++;
    });

    let jakeMessages = 0;
    data.forEach(l => {
      jakeMessages += (l.conversation || []).filter(m => m.role === 'assistant').length;
    });

    const priorityCount = data.filter(l => l.priority).length;
    const priorityRate  = data.length
      ? Math.round((priorityCount / data.length) * 100)
      : 0;

    const avgScore = data.length
      ? Math.round(data.reduce((s, l) => s + (l.score ?? 0), 0) / data.length)
      : 0;

    const signalCounts = {};
    data.forEach(l => {
      (l.buyingSignals || []).forEach(sig => {
        const key = sig.signal;
        signalCounts[key] = (signalCounts[key] || 0) + 1;
      });
    });
    const topSignals = Object.entries(signalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([signal, count]) => ({ signal, count }));

    const leadsPerDay = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      leadsPerDay[key] = 0;
    }
    data.forEach(l => {
      if (!l.createdAt) return;
      const d   = new Date(l.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in leadsPerDay) leadsPerDay[key]++;
    });
    const leadsOverTime = Object.entries(leadsPerDay).map(([date, count]) => ({ date, count }));

    const manualTakeoverCount = data.filter(l => l.manualTakeover).length;

    res.json({
      success: true,
      analytics: {
        totalLeads:          data.length,
        jakeMessages,
        priorityCount,
        priorityRate,
        avgScore,
        manualTakeoverCount,
        tiers,
        distribution,
        topSignals,
        leadsOverTime
      }
    });
  });

  return router;
};