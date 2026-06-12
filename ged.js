(function() {
  var secs = 0;
  var timerEl = document.getElementById('timer');
  if (timerEl) {
    setInterval(function() {
      secs++;
      timerEl.textContent = String(Math.floor(secs/60)).padStart(2,'0') + ':' + String(secs%60).padStart(2,'0');
    }, 1000);
  }

  document.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var group = this.closest('.tab-group');
      if (!group) return;
      group.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      group.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
      this.classList.add('active');
      var target = document.getElementById(this.getAttribute('data-target'));
      if (target) target.classList.add('active');
    });
  });

  document.querySelectorAll('.choices li').forEach(function(li) {
    li.addEventListener('click', function() {
      var block = this.closest('.qblock');
      block.querySelectorAll('.choices li').forEach(function(x) { x.classList.remove('selected'); });
      this.classList.add('selected');
    });
  });

  document.querySelectorAll('.btn-show').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var rev = document.getElementById(this.getAttribute('data-target'));
      if (!rev) return;
      if (rev.classList.contains('open')) {
        rev.classList.remove('open');
        this.textContent = 'Show answer';
      } else {
        rev.classList.add('open');
        this.textContent = 'Hide answer';
      }
    });
  });

  var btnCheck = document.getElementById('btnCheck');
  if (btnCheck) {
    btnCheck.addEventListener('click', function() {
      document.querySelectorAll('.qblock[data-answer]').forEach(function(block) {
        var correct = block.getAttribute('data-answer');
        var selected = block.querySelector('.choices li.selected');
        if (!selected) return;
        var chosen = selected.getAttribute('data-letter');
        block.querySelectorAll('.choices li').forEach(function(li) {
          li.classList.remove('correct','wrong');
          if (li.getAttribute('data-letter') === correct) li.classList.add('correct');
        });
        if (chosen !== correct) selected.classList.add('wrong');
        var rev = block.querySelector('.reveal');
        if (rev) rev.classList.add('open');
      });
      document.querySelectorAll('.reveal').forEach(function(r) { r.classList.add('open'); });
    });
  }

  document.querySelectorAll('.essay-area').forEach(function(ta) {
    ta.addEventListener('input', function() {
      var words = this.value.trim() ? this.value.trim().split(/\s+/).length : 0;
      var wc = document.querySelector('.word-count');
      if (wc) wc.textContent = words + ' words';
    });
  });

  var btnDl = document.getElementById('btnDl');
  if (btnDl) {
    btnDl.addEventListener('click', function() {
      var btn = this;
      btn.textContent = 'Loading\u2026';
      btn.disabled = true;
      if (window.docx) { buildDocx(btn); return; }
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/docx/7.8.2/docx.umd.min.js';
      s.onload = function() { buildDocx(btn); };
      s.onerror = function() {
        btn.textContent = '\u2b07 Download My Work (.docx)';
        btn.disabled = false;
        alert('Could not load the download library. Please check your internet connection and try again.');
      };
      document.head.appendChild(s);
    });
  }

  function buildDocx(btn) {
    var D = window.docx;
    var Document = D.Document, Packer = D.Packer, Paragraph = D.Paragraph, TextRun = D.TextRun;
    var dateStr = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    var title = document.title.replace(' | GED RLA','');

    function p(text, opts) {
      opts = opts || {};
      return new Paragraph({
        children: [new TextRun({ text: String(text||''), font:'Calibri', size:opts.size||22, bold:opts.bold||false, italics:opts.italic||false, color:opts.color||'1a1a1a' })],
        spacing: { before: opts.before||80, after: opts.after||80 },
        indent: opts.indent ? { left: opts.indent } : undefined
      });
    }
    function h2(text) { return p(text, { bold:true, size:26, color:'1b3a5c', before:200, after:100 }); }

    var kids = [];
    kids.push(p('GED\u00ae Reasoning Through Language Arts', { bold:true, size:28, color:'1b3a5c' }));
    kids.push(p(title, { bold:true, size:22, color:'1b75c0' }));
    kids.push(p('Downloaded: ' + dateStr, { italic:true, size:18, color:'666666' }));
    kids.push(p(''));

    kids.push(h2('PASSAGE'));
    var passageEls = document.querySelectorAll('.passage-content.active, .passage');
    passageEls.forEach(function(el) {
      var h3 = el.querySelector('h3');
      if (h3) kids.push(p(h3.textContent.trim(), { bold:true, size:24, after:120 }));
      el.querySelectorAll('p').forEach(function(pg) {
        var t = pg.textContent.trim();
        if (t && t.length > 10 && !t.startsWith('Source:')) kids.push(p(t, { size:21, after:100 }));
      });
      el.querySelectorAll('li').forEach(function(li) {
        kids.push(p('\u2022  ' + li.textContent.trim(), { size:21, before:40, after:40, indent:360 }));
      });
    });
    kids.push(p(''));

    kids.push(h2('QUESTIONS & RESPONSES'));
    document.querySelectorAll('.qblock').forEach(function(block, i) {
      var qnum = block.querySelector('.qnum');
      var qtext = block.querySelector('.qtext');
      if (!qtext) return;
      kids.push(p((qnum ? qnum.textContent : 'Q'+(i+1)), { bold:true, color:'1b75c0', size:20, before:160 }));
      kids.push(p(qtext.textContent.trim(), { size:22, after:100 }));
      block.querySelectorAll('.choices li').forEach(function(li) {
        var letter = li.getAttribute('data-letter') || '';
        var text = li.textContent.replace(letter,'').trim();
        var marker = li.classList.contains('correct') ? '\u2713  ' : li.classList.contains('wrong') ? '\u2717  ' : li.classList.contains('selected') ? '\u25ba  ' : '    ';
        var color = li.classList.contains('correct') ? '2a7a3b' : li.classList.contains('wrong') ? 'c0392b' : '333333';
        kids.push(new Paragraph({ children:[new TextRun({ text:marker+letter+'.  '+text, font:'Calibri', size:21, color:color, bold:li.classList.contains('correct')||li.classList.contains('wrong') })], spacing:{before:40,after:40}, indent:{left:360} }));
      });
      var wa = block.querySelector('textarea');
      if (wa) {
        kids.push(p('My response:', { bold:true, size:20, color:'1b3a5c', before:100 }));
        (wa.value.trim()||'[No response written]').split('\n').forEach(function(line) { kids.push(p(line||' ', { size:21, before:20, after:20 })); });
      }
      var rev = block.querySelector('.reveal');
      if (rev && rev.classList.contains('open')) kids.push(p(rev.textContent.trim(), { italic:true, size:19, color:'0e5fa6', before:60 }));
      kids.push(p(''));
    });

    document.querySelectorAll('.plan-box').forEach(function(box) {
      var h4 = box.querySelector('h4');
      if (h4) kids.push(p(h4.textContent, { bold:true, color:'1b75c0', size:20, before:160 }));
      box.querySelectorAll('label, textarea, input').forEach(function(el) {
        if (el.tagName === 'LABEL') { kids.push(p(el.textContent+':', { bold:true, size:19, color:'555555', before:80 })); }
        else { kids.push(p(el.value.trim()||'[No response]', { size:21, before:10, after:10 })); }
      });
    });

    var essay = document.querySelector('.essay-area');
    if (essay) {
      kids.push(h2('ESSAY RESPONSE'));
      (essay.value.trim()||'[No essay written]').split('\n').forEach(function(line) { kids.push(p(line||' ', { size:22, after:120 })); });
    }

    var rubricItems = document.querySelectorAll('.rubric-item');
    if (rubricItems.length) {
      kids.push(h2('SELF-CHECK'));
      rubricItems.forEach(function(item) {
        var cb = item.querySelector('input[type=checkbox]');
        kids.push(p((cb && cb.checked ? '\u2713  ' : '\u25a1  ') + item.textContent.trim(), { size:20, before:40, after:40 }));
      });
    }

    kids.push(p(''));
    kids.push(p('GED\u00ae is a registered trademark of the American Council on Education. GED Testing Service LLC. All rights reserved.', { italic:true, size:17, color:'888888', before:200 }));

    var doc = new Document({ sections:[{ properties:{ page:{ size:{ width:12240, height:15840 }, margin:{ top:1080, right:1080, bottom:1080, left:1080 } } }, children:kids }] });
    Packer.toBlob(doc).then(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = title.replace(/[^a-zA-Z0-9_-]/g,'_')+'_responses.docx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      btn.textContent = '\u2b07 Download My Work (.docx)'; btn.disabled = false;
    });
  }

})();
