(function () {
  'use strict';

  if (!document.getElementById('subnet-tool')) return;

  var ipInput    = document.getElementById('ip-input');
  var cidrInput  = document.getElementById('cidr-input');
  var calcBtn    = document.getElementById('calc-btn');
  var resetBtn   = document.getElementById('reset-btn');
  var exampleBtn = document.getElementById('example-btn');
  var ipErr      = document.getElementById('ip-err');
  var cidrErr    = document.getElementById('cidr-err');
  var resultBox  = document.getElementById('result-box');
  var resultStatus = document.getElementById('result-status');
  var resultBody = document.getElementById('result-body');

  var IP_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

  function ipToInt(ip) { return ip.split('.').reduce(function(acc,o){return(acc<<8)+parseInt(o,10)},0)>>>0; }
  function intToIp(n)  { return [(n>>>24)&0xFF,(n>>>16)&0xFF,(n>>>8)&0xFF,n&0xFF].join('.'); }
  function cidrToMask(c){ return c===0?0:(0xFFFFFFFF<<(32-c))>>>0; }
  function intToBin32(n){ return (n>>>0).toString(2).padStart(32,'0').match(/.{8}/g).join('.'); }
  function getClass(ip){ var f=parseInt(ip.split('.')[0],10); if(f<127)return'A'; if(f===127)return'Loopback'; if(f<192)return'B'; if(f<224)return'C'; if(f<240)return'D (Multicast)'; return'E (Reserved)'; }
  function isPrivate(ip){ var p=ip.split('.').map(Number); return p[0]===10||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168); }

  function clearErrors() {
    ipErr.textContent=''; ipErr.classList.add('hidden');
    cidrErr.textContent=''; cidrErr.classList.add('hidden');
  }

  function validate(ipVal, cidrVal) {
    var ok = true;
    var cidrStr = cidrVal.replace(/^\//,'').trim();
    var cidrNum = parseInt(cidrStr, 10);
    if (!ipVal) { ipErr.textContent='⚠ IP address is required.'; ipErr.classList.remove('hidden'); ok=false; }
    else if (!IP_RE.test(ipVal)) { ipErr.textContent='⚠ Invalid format. Use dotted-decimal (e.g. 192.168.1.1).'; ipErr.classList.remove('hidden'); ok=false; }
    else if (ipVal.split('.').some(function(o){return parseInt(o)<0||parseInt(o)>255;})) { ipErr.textContent='⚠ Each octet must be 0–255.'; ipErr.classList.remove('hidden'); ok=false; }
    if (!cidrStr) { cidrErr.textContent='⚠ CIDR prefix is required (e.g. 24).'; cidrErr.classList.remove('hidden'); ok=false; }
    else if (isNaN(cidrNum)||cidrNum<0||cidrNum>32) { cidrErr.textContent='⚠ CIDR must be 0–32.'; cidrErr.classList.remove('hidden'); ok=false; }
    return { ok: ok, cidrNum: cidrNum };
  }

  function calculate() {
    clearErrors();
    var ipVal   = ipInput.value.trim();
    var cidrVal = cidrInput.value.trim();
    var v = validate(ipVal, cidrVal);
    if (!v.ok) return;

    var cidrNum = v.cidrNum;
    var ipInt   = ipToInt(ipVal);
    var maskInt = cidrToMask(cidrNum);
    var netInt  = (ipInt & maskInt) >>> 0;
    var brdInt  = (netInt | (~maskInt>>>0)) >>> 0;
    var total   = cidrNum===32?1:cidrNum===31?2:Math.pow(2,32-cidrNum);
    var usable  = cidrNum>=31?total:total-2;
    var first   = cidrNum>=31?intToIp(netInt):intToIp(netInt+1);
    var last    = cidrNum>=31?intToIp(brdInt):intToIp(brdInt-1);

    resultBox.style.display = 'block';
    resultStatus.textContent = '✓ CALCULATED';
    resultStatus.className = 'result-status success';

    var rows = [
      ['Network Address', intToIp(netInt), true],
      ['Broadcast Address', intToIp(brdInt), true],
      ['Subnet Mask', intToIp(maskInt), false],
      ['Wildcard Mask', intToIp(~maskInt>>>0), false],
      ['First Usable Host', first, false],
      ['Last Usable Host', last, false],
      ['Usable Hosts', usable.toLocaleString(), true],
      ['Total Addresses', total.toLocaleString(), false],
      ['IP Class', getClass(ipVal), false],
      ['IP Type', isPrivate(ipVal) ? '🔒 Private' : '🌐 Public', false],
    ];

    var html = rows.map(function(r){
      return '<div class="result-item"><span class="result-item-label">' + r[0] + '</span><span class="result-item-value' + (r[2]?' highlight':'') + '">' + r[1] + '</span></div>';
    }).join('');

    html += '<div style="margin-top:16px;margin-bottom:8px;font-family:monospace;font-size:.625rem;color:#64748B;letter-spacing:.08em;text-transform:uppercase">Binary Notation</div>';
    html += '<div class="binary-display">';
    [['IP Addr', intToBin32(ipInt),'#7DD3FC'],['Mask',intToBin32(maskInt),'#A3E635'],['Network',intToBin32(netInt),'#0D9488'],['Broadcast',intToBin32(brdInt),'#FB923C']].forEach(function(row){
      html += '<div><span style="color:#64748B;display:inline-block;width:90px">' + row[0] + ':</span> <span style="color:' + row[2] + '">' + row[1] + '</span></div>';
    });
    html += '</div>';

    resultBody.innerHTML = html;
  }

  calcBtn.addEventListener('click', calculate);
  resetBtn.addEventListener('click', function () {
    ipInput.value=''; cidrInput.value=''; clearErrors(); resultBox.style.display='none';
  });
  exampleBtn.addEventListener('click', function () {
    ipInput.value='192.168.1.100'; cidrInput.value='24'; clearErrors(); resultBox.style.display='none';
  });
  [ipInput, cidrInput].forEach(function(inp){
    inp.addEventListener('input', clearErrors);
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') calculate(); });
  });
})();
