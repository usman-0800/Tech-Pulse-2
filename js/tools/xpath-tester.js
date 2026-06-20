(function () {
  'use strict';

  if (!document.getElementById('xpath-tool')) return;

  var htmlInput  = document.getElementById('html-input');
  var selectorInput = document.getElementById('selector-input');
  var typeSelect = document.getElementById('selector-type');
  var runBtn     = document.getElementById('run-btn');
  var sampleBtn  = document.getElementById('sample-btn');
  var clearBtn   = document.getElementById('clear-btn');
  var resultBox  = document.getElementById('result-box');
  var resultLabel = document.getElementById('result-label');
  var resultStatus = document.getElementById('result-status');
  var resultBody = document.getElementById('result-body');

  var SAMPLE_HTML = '<html>\n<body>\n  <div id="main" class="container">\n    <header>\n      <h1 class="site-title">TechPulse Blog</h1>\n      <nav>\n        <a href="/" class="nav-link active">Home</a>\n        <a href="./blog/xpath-guide-2024.html" class="nav-link">Blog</a>\n        <a href="./tools/index.html" class="nav-link">Tools</a>\n      </nav>\n    </header>\n    <main>\n      <article class="post" data-id="1">\n        <h2 class="post-title">AWS Cost Optimization Guide</h2>\n        <p class="excerpt">Learn how to cut AWS costs by 40%.</p>\n        <span class="category">Cloud Services</span>\n      </article>\n      <article class="post" data-id="2">\n        <h2 class="post-title">XPath Mastery for QA Engineers</h2>\n        <p class="excerpt">Master XPath in Selenium and Cypress.</p>\n        <span class="category">Software Testing</span>\n      </article>\n      <article class="post" data-id="3">\n        <h2 class="post-title">IP Subnetting Explained</h2>\n        <p class="excerpt">CIDR notation from scratch.</p>\n        <span class="category">Networking</span>\n      </article>\n    </main>\n  </div>\n</body>\n</html>';

  function esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function serializeNode(node) {
    try {
      return new XMLSerializer().serializeToString(node).replace(/ xmlns="[^"]*"/g,'');
    } catch(e) {
      return node.outerHTML || node.textContent || String(node);
    }
  }

  function showResult(success, statusText, html) {
    resultBox.style.display = 'block';
    resultStatus.textContent = statusText;
    resultStatus.className = 'result-status ' + (success ? 'success' : 'error');
    resultBody.innerHTML = html;
  }

  function runTest() {
    var html = htmlInput.value.trim();
    var sel  = selectorInput.value.trim();
    var type = typeSelect.value;

    if (!html) { showResult(false, '✕ ERROR', '<p class="result-error-msg">Please paste some HTML into the input area.</p>'); return; }
    if (!sel)  { showResult(false, '✕ ERROR', '<p class="result-error-msg">Please enter an XPath expression or CSS selector.</p>'); return; }

    var parser = new DOMParser();
    var doc    = parser.parseFromString(html, 'text/html');
    var nodes  = [];

    try {
      if (type === 'xpath') {
        var r = doc.evaluate(sel, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < r.snapshotLength; i++) nodes.push(r.snapshotItem(i));
      } else {
        nodes = Array.from(doc.querySelectorAll(sel));
      }
    } catch (e) {
      showResult(false, '✕ ERROR', '<p class="result-error-msg">' + esc(e.message) + '</p>');
      return;
    }

    if (nodes.length === 0) {
      showResult(false, '✕ NO MATCHES', '<p style="color:#FBBF24;font-family:monospace;font-size:.875rem;">No elements matched. Check your expression and HTML structure.</p>');
      return;
    }

    var count = nodes.length;
    var out = '<p class="matches-header">' + count + ' MATCH' + (count !== 1 ? 'ES' : '') + ' FOUND &middot; ' + type.toUpperCase() + '</p>';
    nodes.forEach(function(node, idx) {
      out += '<div class="result-match-block"><span class="match-index">Match ' + (idx+1) + ' of ' + count + ' &middot; &lt;' + (node.nodeName || 'node').toLowerCase() + '&gt;</span>' + esc(serializeNode(node)) + '</div>';
    });

    showResult(true, '✓ ' + count + ' MATCH' + (count !== 1 ? 'ES' : ''), out);
  }

  runBtn.addEventListener('click', runTest);
  clearBtn.addEventListener('click', function () {
    htmlInput.value = ''; selectorInput.value = ''; resultBox.style.display = 'none';
  });
  sampleBtn.addEventListener('click', function () {
    htmlInput.value = SAMPLE_HTML;
    selectorInput.value = typeSelect.value === 'xpath' ? '//h2[@class="post-title"]' : 'h2.post-title';
    resultBox.style.display = 'none';
  });
  typeSelect.addEventListener('change', function () {
    selectorInput.placeholder = typeSelect.value === 'xpath' ? '//h2[@class="post-title"]' : 'h2.post-title';
  });
  selectorInput.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runTest();
  });
})();
