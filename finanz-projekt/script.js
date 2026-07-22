// ====================================================
// 1. TRANSACTION STATE & STORAGE
// ====================================================
let transactions = [
  { id: 'tx-1', desc: 'Gehalt', amount: 2500.00, type: 'income', category: 'sonstiges', date: '12. Juni' },
  { id: 'tx-2', desc: 'Miete', amount: 450.00, type: 'expense', category: 'wohnen', date: '11. Juni' },
  { id: 'tx-3', desc: 'Wocheneinkauf', amount: 120.00, type: 'expense', category: 'lebensmittel', date: '10. Juni' },
  { id: 'tx-4', desc: 'Kino & Snacks', amount: 89.50, type: 'expense', category: 'freizeit', date: '09. Juni' }
];

// Budget Limits config
const budgetLimits = {
  wohnen: 1000,
  lebensmittel: 400,
  freizeit: 250
};

// Colors config for categories
const categoryColors = {
  wohnen: '#6366f1',      // Indigo
  lebensmittel: '#f59e0b',  // Amber
  freizeit: '#ec4899',      // Pink
  transport: '#3b82f6',     // Blue
  sonstiges: '#10b981'      // Emerald
};

const categoryLabels = {
  wohnen: '🏠 Wohnen',
  lebensmittel: '🛒 Lebensmittel',
  freizeit: '🍿 Freizeit',
  transport: '🚗 Transport',
  sonstiges: '📦 Sonstiges'
};

// DOM Elements
const totalBalanceEl = document.getElementById('total-balance');
const flowInEl = document.getElementById('flow-in');
const flowOutEl = document.getElementById('flow-out');

const txForm = document.getElementById('tx-form');
const txDesc = document.getElementById('tx-desc');
const txAmount = document.getElementById('tx-amount');
const txType = document.getElementById('tx-type');
const txCategory = document.getElementById('tx-category');

const historyList = document.getElementById('history-list');
const donutSegmentsGroup = document.getElementById('donut-segments-group');
const chartLegend = document.getElementById('chart-legend');
const donutTotalVal = document.getElementById('donut-total-val');

// Format Currency Utility
function formatCurrency(val) {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

// Recalculate totals
function updateTotals() {
  let balance = 0;
  let incomeTotal = 0;
  let expenseTotal = 0;

  transactions.forEach(tx => {
    if (tx.type === 'income') {
      balance += tx.amount;
      incomeTotal += tx.amount;
    } else {
      balance -= tx.amount;
      expenseTotal += tx.amount;
    }
  });

  totalBalanceEl.textContent = formatCurrency(balance);
  flowInEl.textContent = '+' + formatCurrency(incomeTotal);
  flowOutEl.textContent = '-' + formatCurrency(expenseTotal);

  updateBudgetLimits();
  updateChart(expenseTotal);
}

// Update limit progress bars
function updateBudgetLimits() {
  // Sum expenses per category
  const categorySums = { wohnen: 0, lebensmittel: 0, freizeit: 0 };

  transactions.forEach(tx => {
    if (tx.type === 'expense' && categorySums[tx.category] !== undefined) {
      categorySums[tx.category] += tx.amount;
    }
  });

  // Render limits list progress bars
  Object.keys(budgetLimits).forEach(cat => {
    const sum = categorySums[cat];
    const limit = budgetLimits[cat];
    const percentage = Math.min((sum / limit) * 100, 100);

    // Update texts
    const valText = document.getElementById(`limit-${cat}-val`);
    if (valText) {
      valText.textContent = sum.toFixed(0);
    }

    // Update progress widths
    const fillBar = document.getElementById(`pb-${cat}`);
    if (fillBar) {
      fillBar.style.width = percentage + '%';
      // Over-limit indicator warning style
      const limitItem = fillBar.closest('.limit-item');
      if (limitItem) {
        if (sum > limit) {
          limitItem.classList.add('warning');
        } else {
          limitItem.classList.remove('warning');
        }
      }
    }
  });
}

// Update Donut Chart
function updateChart(totalExpenses) {
  donutTotalVal.textContent = formatCurrency(totalExpenses);

  // Reset previous paths
  donutSegmentsGroup.innerHTML = '';
  chartLegend.innerHTML = '';

  if (totalExpenses === 0) {
    // Renders an empty background circle
    chartLegend.innerHTML = '<p class="subtitle" style="text-align:center;width:100%">Keine Ausgaben verzeichnet.</p>';
    return;
  }

  // Sum expenses per category
  const categorySums = { wohnen: 0, lebensmittel: 0, freizeit: 0, transport: 0, sonstiges: 0 };
  transactions.forEach(tx => {
    if (tx.type === 'expense') {
      categorySums[tx.category] += tx.amount;
    }
  });

  // Calculate segments
  // Circumference = 2 * Math.PI * 60 = 376.99
  const circumference = 376.99;
  let currentOffset = 0;

  Object.keys(categorySums).forEach(cat => {
    const amount = categorySums[cat];
    if (amount === 0) return;

    const percentage = amount / totalExpenses;
    const dashArrayVal = percentage * circumference;
    const strokeOffset = circumference - dashArrayVal;

    // Create Circle Path Element
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'donut-segment');
    circle.setAttribute('cx', '80');
    circle.setAttribute('cy', '80');
    circle.setAttribute('r', '60');
    circle.setAttribute('stroke', categoryColors[cat]);
    circle.setAttribute('stroke-dasharray', `${dashArrayVal} ${circumference - dashArrayVal}`);
    circle.setAttribute('stroke-dashoffset', -currentOffset);

    donutSegmentsGroup.appendChild(circle);
    currentOffset += dashArrayVal;

    // Create Legend Item
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';

    legendItem.innerHTML = `
      <div class="legend-label-group">
        <span class="legend-color" style="background-color:${categoryColors[cat]}"></span>
        <span>${categoryLabels[cat]}</span>
      </div>
      <span class="legend-val">${formatCurrency(amount)}</span>
    `;

    chartLegend.appendChild(legendItem);
  });
}

// Render Transaction History
function renderHistory() {
  historyList.innerHTML = '';

  // Reverse array to show newest first
  const reversedTxs = [...transactions].reverse();

  reversedTxs.forEach(tx => {
    const item = document.createElement('div');
    item.className = 'tx-item';

    item.innerHTML = `
      <div class="tx-details">
        <span class="tx-title">${tx.desc}</span>
        <span class="tx-meta">${tx.date} · ${tx.type === 'income' ? 'Einnahme' : 'Ausgabe'} · ${categoryLabels[tx.category]}</span>
      </div>
      <div style="display:flex;align-items:center;">
        <span class="tx-amount ${tx.type === 'income' ? 'income' : 'expense'}">
          ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
        </span>
        <button class="tx-delete-btn" onclick="deleteTransaction('${tx.id}')" title="Transaktion löschen">✕</button>
      </div>
    `;

    historyList.appendChild(item);
  });
}

// Add Transaction Form submit
txForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const desc = txDesc.value.trim();
  const amount = parseFloat(txAmount.value);
  const type = txType.value;
  const category = txCategory.value;

  if (!desc || isNaN(amount)) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });

  const newTx = {
    id: 'tx-' + Date.now(),
    desc,
    amount,
    type,
    category,
    date: dateStr
  };

  transactions.push(newTx);

  // Reset Form
  txDesc.value = '';
  txAmount.value = '';
  txType.value = 'expense';
  txCategory.value = 'wohnen';

  // Recalculate and Re-render
  updateTotals();
  renderHistory();
});

// Delete Transaction
window.deleteTransaction = function(id) {
  transactions = transactions.filter(tx => tx.id !== id);

  // Recalculate and Re-render
  updateTotals();
  renderHistory();
};

// Initialize app
updateTotals();
renderHistory();
