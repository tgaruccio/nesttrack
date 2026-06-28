/* NestTrack Contact Widget — drop-in lead capture for any website.
   Usage:
     <div id="nesttrack-form"></div>
     <script src="https://app.nesttrack.io/widget.js" data-agent="YOURID" data-source="My Website"></script>
   Optional data- attributes: target, accent, title, subtitle, button, source, fields
   (fields = comma list from: name,email,phone,address,message)
   Lead routing (status/segment/smart plan) and styling can also be set per-agent
   in NestTrack (Marketing > Landing Pages > Contact Widget), which writes the
   landing_pages/{agent}_widget config this script reads. */
(function(){
  var WORKER_URL='https://app.tom-b52.workers.dev';
  var FB_PROJECT='buyers-880bc';
  var FB_KEY='AIzaSyCy5ZkbPcGtk7I_88dVbNsX40LY-M4R_sY';

  var me=document.currentScript||(function(){var ss=document.getElementsByTagName('script');return ss[ss.length-1];})();
  function attr(n,d){ var v=me&&me.getAttribute('data-'+n); return (v==null||v==='')?d:v; }

  var AGENT=(attr('agent','')||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  var TARGET=attr('target','nesttrack-form');
  var CFG={
    accent:attr('accent','#2A6EF4'),
    title:attr('title','Get in touch'),
    subtitle:attr('subtitle','Tell me a bit about what you need and I\u2019ll reach out personally.'),
    button:attr('button','Send'),
    source:attr('source','Website Contact'),
    fields:attr('fields','name,email,phone,address,message')
  };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fsVal(v){ if(!v)return''; if(v.stringValue!==undefined)return v.stringValue; if(v.integerValue!==undefined)return v.integerValue; if(v.booleanValue!==undefined)return v.booleanValue; return ''; }

  // resolve the container: target id, else insert a div right before the script
  function container(){
    var el=document.getElementById(TARGET);
    if(el) return el;
    el=document.createElement('div'); el.id=TARGET;
    if(me&&me.parentNode) me.parentNode.insertBefore(el,me); else document.body.appendChild(el);
    return el;
  }

  function injectStyles(accent){
    if(document.getElementById('ntw-style')) { setAccent(accent); return; }
    var css=''
      +'.ntw{--ntw-accent:'+accent+';max-width:440px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#0F1B33;line-height:1.5;box-sizing:border-box;}'
      +'.ntw *{box-sizing:border-box;}'
      +'.ntw-card{background:#fff;border:1px solid #e8ebf1;border-radius:16px;padding:22px;box-shadow:0 10px 30px rgba(15,27,51,0.06);}'
      +'.ntw-title{font-size:19px;font-weight:800;letter-spacing:-0.3px;margin:0 0 4px;}'
      +'.ntw-sub{font-size:13.5px;color:#5b6472;margin:0 0 14px;}'
      +'.ntw-label{display:block;font-size:12px;font-weight:700;margin:11px 0 5px;color:#0F1B33;}'
      +'.ntw-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}'
      +'.ntw input,.ntw textarea{width:100%;font-size:16px;padding:12px;border:1.5px solid #e8ebf1;border-radius:10px;font-family:inherit;outline:none;background:#fbfcfe;color:#0F1B33;}'
      +'.ntw textarea{resize:vertical;min-height:74px;}'
      +'.ntw input:focus,.ntw textarea:focus{border-color:var(--ntw-accent);background:#fff;}'
      +'.ntw-btn{width:100%;margin-top:16px;background:var(--ntw-accent);color:#fff;border:none;border-radius:12px;padding:15px;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;}'
      +'.ntw-btn:disabled{opacity:0.6;cursor:default;}'
      +'.ntw-fine{font-size:11px;color:#5b6472;text-align:center;margin-top:10px;}'
      +'.ntw-err{display:none;background:#fdecec;color:#b3261e;font-size:13px;border-radius:9px;padding:10px 12px;margin-top:12px;}'
      +'.ntw-thanks{display:none;text-align:center;padding:20px 4px;}'
      +'.ntw-thanks .b{font-size:40px;}'
      +'.ntw-thanks h4{font-size:19px;margin:6px 0 4px;}'
      +'.ntw-thanks p{color:#5b6472;font-size:14px;margin:0;}';
    var st=document.createElement('style'); st.id='ntw-style'; st.textContent=css; document.head.appendChild(st);
  }
  function setAccent(a){ var r=document.querySelector('.ntw'); if(r) r.style.setProperty('--ntw-accent',a); }

  function render(){
    var has=function(k){ return CFG.fields.toLowerCase().indexOf(k)>=0; };
    var c=container();
    injectStyles(CFG.accent);
    var h='<div class="ntw"><div class="ntw-card"><div id="ntw-body">'
      +'<div class="ntw-title">'+esc(CFG.title)+'</div>'
      +'<div class="ntw-sub">'+esc(CFG.subtitle)+'</div>';
    if(has('name')) h+='<div class="ntw-row"><div><label class="ntw-label">First name</label><input id="ntw-first" autocomplete="given-name"/></div><div><label class="ntw-label">Last name</label><input id="ntw-last" autocomplete="family-name"/></div></div>';
    if(has('email')) h+='<label class="ntw-label">Email</label><input id="ntw-email" type="email" autocomplete="email"/>';
    if(has('phone')) h+='<label class="ntw-label">Phone</label><input id="ntw-phone" type="tel" autocomplete="tel"/>';
    if(has('address')) h+='<label class="ntw-label">Address <span style="opacity:.6;font-weight:400;">(optional)</span></label><input id="ntw-address" autocomplete="street-address"/>';
    if(has('message')) h+='<label class="ntw-label">How can I help? <span style="opacity:.6;font-weight:400;">(optional)</span></label><textarea id="ntw-message" rows="3"></textarea>';
    h+='<div class="ntw-err" id="ntw-err"></div>'
      +'<button class="ntw-btn" id="ntw-btn" type="button">'+esc(CFG.button)+'</button>'
      +'<div class="ntw-fine">\uD83D\uDD12 Goes straight to me \u2014 never sold or shared.</div>'
      +'</div>'
      +'<div class="ntw-thanks" id="ntw-thanks"><div class="b">\uD83C\uDF89</div><h4>Got it \u2014 talk soon!</h4><p>Thanks! I\u2019ll reach out shortly.</p></div>'
      +'</div></div>';
    c.innerHTML=h;
    var btn=document.getElementById('ntw-btn');
    if(btn) btn.addEventListener('click',submit);
  }

  function val(id){ var e=document.getElementById(id); return e?e.value.trim():''; }
  function cErr(m){ var e=document.getElementById('ntw-err'); if(e){ e.textContent=m; e.style.display='block'; } }

  function submit(){
    var first=val('ntw-first'),last=val('ntw-last'),email=val('ntw-email'),phone=val('ntw-phone'),address=val('ntw-address'),message=val('ntw-message');
    var e=document.getElementById('ntw-err'); if(e) e.style.display='none';
    if(!AGENT){ cErr('This form isn\u2019t configured yet (missing agent id).'); return; }
    if(!first){ cErr('Please enter your first name.'); return; }
    if(!email&&!phone){ cErr('Please add an email or phone so I can reach you.'); return; }
    var btn=document.getElementById('ntw-btn'); if(btn){ btn.disabled=true; btn.textContent='Sending\u2026'; }
    var noteParts=[];
    if(message) noteParts.push(message);
    noteParts.push('via website contact widget');
    if(address) noteParts.push('Address: '+address);
    var payload={
      firstName:first,lastName:last,email:email,phone:phone,address:address,agentId:AGENT,
      source:(CFG.source||'Website Contact'),
      notes:noteParts.join(' \u2014 '),
      leadStatus:(CFG.leadStatus||'pipeline'),
      leadSegment:(CFG.leadSegment||''),
      smartPlanId:(CFG.smartPlanId||''),
      smartPlanName:(CFG.smartPlanName||'')
    };
    fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json','X-Action':'inbound-lead'},body:JSON.stringify(payload)})
      .then(function(r){ return r.json().catch(function(){return{};}); })
      .then(function(){ var b=document.getElementById('ntw-body'),t=document.getElementById('ntw-thanks'); if(b)b.style.display='none'; if(t)t.style.display='block'; })
      .catch(function(){ if(btn){ btn.disabled=false; btn.textContent=CFG.button; } cErr('Something went wrong. Please try again.'); });
  }

  function loadConfig(cb){
    if(!AGENT){ cb(); return; }
    fetch('https://firestore.googleapis.com/v1/projects/'+FB_PROJECT+'/databases/(default)/documents/landing_pages/'+AGENT+'_widget?key='+FB_KEY)
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(d){ if(d&&d.fields){ var k,o={}; for(k in d.fields){ o[k]=fsVal(d.fields[k]); }
        // doc overrides data- attributes only where set
        ['accent','title','subtitle','button','source','fields','leadStatus','leadSegment','smartPlanId','smartPlanName'].forEach(function(key){ if(o[key]!==undefined&&o[key]!=='') CFG[key]=o[key]; });
      } cb(); })
      .catch(function(){ cb(); });
  }

  function start(){ loadConfig(render); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
