const express = require('express');

module.exports = function (leads) {
  const router = express.Router();

  router.get('/', (req, res) => {
    // ── Score tier breakdown ──────────────────────────────
    const tiers = { cold: 0, warm: 0, hot: 0, elite: 0 };
    leads.forEach(l => {
      if      (l.score >= 90) tiers.elite++;
      else if (l.score >= 75) tiers.hot++;
      else if (l.score >= 40) tiers.warm++;
      else                    tiers.cold++;
    });

    // ── Score distribution (buckets of 10) ───────────────
    const distribution = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}–${i * 10 + 9}`,
      count: 0
    }));
    leads.forEach(l => {
      const bucket = Math.min(Math.floor((l.score ?? 0) / 10), 9);
      distribution[bucket].count++;
    });

    // ── Total Jake messages ───────────────────────────────
    let jakeMessages = 0;
    leads.forEach(l => {
      jakeMessages += (l.conversation || []).filter(m => m.role === 'assistant').length;
    });

    // ── Priority count / rate ─────────────────────────────
    const priorityCount = leads.filter(l => l.priority).length;
    const priorityRate  = leads.length
      ? Math.round((priorityCount / leads.length) * 100)
      : 0;

    // ── Average score ─────────────────────────────────────
    const avgScore = leads.length
      ? Math.round(leads.reduce((s, l) => s + (l.score ?? 0), 0) / leads.length)
      : 0;

    // ── Top buying signals ────────────────────────────────
    const signalCounts = {};
    leads.forEach(l => {
      (l.buyingSignals || []).forEach(sig => {
        const key = sig.signal;
        signalCounts[key] = (signalCounts[key] || 0) + 1;
      });
    });
    const topSignals = Object.entries(signalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([signal, count]) => ({ signal, count }));

    // ── Leads per day (last 14 days) ──────────────────────
    const leadsPerDay = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      leadsPerDay[key] = 0;
    }
    leads.forEach(l => {
      if (!l.createdAt) return;
      const d   = new Date(l.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in leadsPerDay) leadsPerDay[key]++;
    });
    const leadsOverTime = Object.entries(leadsPerDay).map(([date, count]) => ({ date, count }));

    // ── Manual takeover count ─────────────────────────────
    const manualTakeoverCount = leads.filter(l => l.manualTakeover).length;

    res.json({
      success: true,
      analytics: {
        totalLeads:          leads.length,
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
