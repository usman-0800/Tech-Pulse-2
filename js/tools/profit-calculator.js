(function () {
  'use strict';

  if (!document.getElementById('profit-tool')) return;

  var costInput   = document.getElementById('cost-price');
  var sellInput   = document.getElementById('sell-price');
  var calcBtn     = document.getElementById('calc-btn');
  var resetBtn    = document.getElementById('reset-btn');
  var costErr     = document.getElementById('cost-err');
  var sellErr     = document.getElementById('sell-err');
  var resultBox   = document.getElementById('result-box');
  var resultStatus = document.getElementById('result-status');
  var resultBody  = document.getElementById('result-body');

  function f(n) { return Math.abs(n).toFixed(2); }
  function fp(n) { return n.toFixed(2) + '%'; }

  function clearErrors() {
    costErr.textContent = ''; costErr.classList.add('hidden');
    sellErr.textContent = ''; sellErr.classList.add('hidden');
  }

  function validate(c, s) {
    var valid = true;
    if (costInput.value.trim() === '') { costErr.textContent = '⚠ Cost price is required.'; costErr.classList.remove('hidden'); valid = false; }
    else if (isNaN(c))  { costErr.textContent = '⚠ Please enter a valid number.'; costErr.classList.remove('hidden'); valid = false; }
    else if (c < 0)     { costErr.textContent = '⚠ Cost price cannot be negative.'; costErr.classList.remove('hidden'); valid = false; }

    if (sellInput.value.trim() === '')  { sellErr.textContent = '⚠ Selling price is required.'; sellErr.classList.remove('hidden'); valid = false; }
    else if (isNaN(s))  { sellErr.textContent = '⚠ Please enter a valid number.'; sellErr.classList.remove('hidden'); valid = false; }
    else if (s < 0)     { sellErr.textContent = '⚠ Selling price cannot be negative.'; sellErr.classList.remove('hidden'); valid = false; }
    else if (s === 0)   { sellErr.textContent = '⚠ Selling price cannot be zero.'; sellErr.classList.remove('hidden'); valid = false; }
    return valid;
  }

  function calculate() {
    clearErrors();
    var c = parseFloat(costInput.value);
    var s = parseFloat(sellInput.value);
    if (!validate(c, s)) return;

    var gp     = s - c;
    var margin = (gp / s) * 100;
    var markup = c > 0 ? (gp / c) * 100 : null;
    var isLoss = gp < 0;

    resultBox.style.display = 'block';
    resultStatus.textContent = isLoss ? '✕ LOSS DETECTED' : '✓ CALCULATED';
    resultStatus.className = 'result-status ' + (isLoss ? 'error' : 'success');

    var warnHTML = isLoss ? '<p style="font-family:monospace;font-size:.75rem;color:#FBBF24;margin-top:12px;padding:8px;background:rgba(251,191,36,.08);border-radius:6px;">⚠ WARNING: Selling below cost. Loss of $' + f(gp) + ' per unit.</p>' : '';

    resultBody.innerHTML =
      '<div class="result-item"><span class="result-item-label">Cost Price</span><span class="result-item-value">$' + f(c) + '</span></div>' +
      '<div class="result-item"><span class="result-item-label">Selling Price</span><span class="result-item-value">$' + f(s) + '</span></div>' +
      '<div style="height:1px;background:rgba(255,255,255,.06);margin:12px 0"></div>' +
      '<div class="metric-grid">' +
        '<div class="metric-item"><div class="metric-label">' + (isLoss ? 'GROSS LOSS' : 'GROSS PROFIT') + '</div><div class="metric-value" style="color:' + (isLoss?'#F87171':'#34D399') + '">$' + f(gp) + '</div></div>' +
        '<div class="metric-item"><div class="metric-label">PROFIT MARGIN %</div><div class="metric-value" style="color:' + (isLoss?'#F87171':'#34D399') + '">' + fp(margin) + '</div></div>' +
        '<div class="metric-item"><div class="metric-label">MARKUP %</div><div class="metric-value" style="color:' + (markup!==null?'#34D399':'#64748B') + '">' + (markup!==null?fp(markup):'N/A') + '</div></div>' +
        '<div class="metric-item"><div class="metric-label">BREAK-EVEN</div><div class="metric-value" style="color:#94A3B8">$' + f(c) + '</div></div>' +
      '</div>' + warnHTML;
  }

  calcBtn.addEventListener('click', calculate);
  resetBtn.addEventListener('click', function () {
    costInput.value = ''; sellInput.value = ''; clearErrors(); resultBox.style.display = 'none';
  });
  [costInput, sellInput].forEach(function (inp) {
    inp.addEventListener('input', clearErrors);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); });
  });
})();
