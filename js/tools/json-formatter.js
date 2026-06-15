(function () {
  'use strict';

  if (!document.getElementById('json-tool')) return;

  var jsonInput    = document.getElementById('json-input');
  var formatBtn    = document.getElementById('format-btn');
  var minifyBtn    = document.getElementById('minify-btn');
  var copyBtn      = document.getElementById('copy-btn');
  var sampleBtn    = document.getElementById('sample-btn');
  var clearBtn     = document.getElementById('clear-btn');
  var resultBox    = document.getElementById('result-box');
  var resultStatus = document.getElementById('result-status');
  var resultLabel  = document.getElementById('result-label');
  var resultBody   = document.getElementById('result-body');

  var SAMPLE = '{\n  "blog": "TechPulse",\n  "version": "2.0",\n  "categories": ["Software Testing", "Cloud Services", "Networking", "Retail Tech"],\n  "stats": {\n    "posts": 142,\n    "monthly_readers": 85000,\n    "tools_available": 4,\n    "uptime": 99.98\n  },\n  "featured_post": {\n    "title": "XPath & CSS Selector Mastery",\n    "author": "Alex Morgan",\n    "published": "2025-06-03",\n    "is_featured": true,\n    "tags": ["xpath", "selenium", "automation"],\n    "word_count": 3200\n  },\n  "settings": {\n    "adsense_enabled": true,\n    "cdn": null,\n    "languages": ["en"]\n  }\n}';

  function highlight(json) {
    var esc = json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return esc.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d*)?([eE][+-]?\d+)?)/g, function (m) {
      var cls = 'json-number';
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'json-key' : 'json-string';
      else if (/true|false/.test(m)) cls = 'json-boolean';
      else if (/null/.test(m)) cls = 'json-null';
      return '<span class="' + cls + '">' + m + '</span>';
    });
  }

  function showResult(type, statusText, bodyHTML, labelText) {
    resultBox.style.display = 'block';
    resultStatus.textContent = statusText;
    resultStatus.className = 'result-status ' + (type === 'error' ? 'error' : 'success');
    if (labelText && resultLabel) resultLabel.textContent = labelText;
    resultBody.innerHTML = bodyHTML;
  }

  formatBtn.addEventListener('click', function () {
    var raw = jsonInput.value.trim();
    if (!raw) { showResult('error','✕ INVALID JSON','<p class="result-error-msg">Input is empty. Paste some JSON to format.</p>'); return; }
    try {
      var parsed  = JSON.parse(raw);
      var pretty  = JSON.stringify(parsed, null, 2);
      jsonInput.value = pretty;
      var lines   = pretty.split('\n').length;
      var bytes   = new TextEncoder().encode(raw).length;
      var type    = Array.isArray(parsed) ? 'Array' : parsed === null ? 'null' : typeof parsed;
      var statsHTML = '<div style="display:flex;gap:16px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:12px">' +
        '<span style="font-family:monospace;font-size:.6875rem;color:#64748B">TYPE: <span style="color:var(--accent)">' + type.toUpperCase() + '</span></span>' +
        '<span style="font-family:monospace;font-size:.6875rem;color:#64748B">LINES: <span style="color:var(--accent)">' + lines + '</span></span>' +
        '<span style="font-family:monospace;font-size:.6875rem;color:#64748B">SIZE: <span style="color:var(--accent)">' + bytes + ' bytes</span></span>' +
        (Array.isArray(parsed) ? '<span style="font-family:monospace;font-size:.6875rem;color:#64748B">ITEMS: <span style="color:var(--accent)">' + parsed.length + '</span></span>' : '') +
        '</div>';
      showResult('success','✓ VALID JSON', statsHTML + '<pre class="result-pre">' + highlight(pretty) + '</pre>', 'OUTPUT // FORMATTED JSON');
    } catch (e) {
      showResult('error','✕ INVALID JSON','<div style="display:flex;align-items:flex-start;gap:12px"><span style="font-size:1.25rem;flex-shrink:0">⛔</span><div><p style="font-family:monospace;font-size:.75rem;color:#F87171;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Syntax Error</p><p class="result-error-msg">' + e.message + '</p><p style="font-family:monospace;font-size:.6875rem;color:#475569;margin-top:10px">💡 Common causes: trailing commas, single quotes, unquoted keys, comments.</p></div></div>');
    }
  });

  minifyBtn.addEventListener('click', function () {
    var raw = jsonInput.value.trim();
    if (!raw) { showResult('error','✕ INVALID JSON','<p class="result-error-msg">Input is empty.</p>'); return; }
    try {
      var minified = JSON.stringify(JSON.parse(raw));
      var savings  = raw.length - minified.length;
      var pct      = ((savings / raw.length) * 100).toFixed(1);
      jsonInput.value = minified;
      showResult('success','✓ MINIFIED',
        '<div class="result-item"><span class="result-item-label">Original Size</span><span class="result-item-value">' + raw.length + ' chars</span></div>' +
        '<div class="result-item"><span class="result-item-label">Minified Size</span><span class="result-item-value highlight">' + minified.length + ' chars</span></div>' +
        '<div class="result-item"><span class="result-item-label">Space Saved</span><span class="result-item-value" style="color:#34D399">' + savings + ' chars (' + pct + '%)</span></div>',
        'OUTPUT // MINIFIED');
    } catch (e) {
      showResult('error','✕ INVALID JSON','<p class="result-error-msg">' + e.message + '</p>');
    }
  });

  copyBtn.addEventListener('click', function () {
    if (!jsonInput.value) return;
    navigator.clipboard.writeText(jsonInput.value).then(function () {
      copyBtn.textContent = '✓ Copied!';
      setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
    });
  });

  sampleBtn.addEventListener('click', function () { jsonInput.value = SAMPLE; resultBox.style.display = 'none'; });
  clearBtn.addEventListener('click', function ()  { jsonInput.value = ''; resultBox.style.display = 'none'; });
  jsonInput.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') formatBtn.click();
  });
})();
