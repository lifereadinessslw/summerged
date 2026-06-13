(function() {

  // Timer
  var secs = 0;
  var timerEl = document.getElementById('timer');
  if (timerEl) {
    setInterval(function() {
      secs++;
      timerEl.textContent = String(Math.floor(secs/60)).padStart(2,'0') + ':' + String(secs%60).padStart(2,'0');
    }, 1000);
  }

  // Tab switching
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

  // Choice selection
  document.querySelectorAll('.choices li').forEach(function(li) {
    li.addEventListener('click', function() {
      var block = this.closest('.qblock');
      block.querySelectorAll('.choices li').forEach(function(x) { x.classList.remove('selected'); });
      this.classList.add('selected');
    });
  });

  // Show/hide answer buttons
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

  // Check Answers
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

  // Word counter
  document.querySelectorAll('.essay-area').forEach(function(ta) {
    ta.addEventListener('input', function() {
      var words = this.value.trim() ? this.value.trim().split(/\s+/).length : 0;
      var wc = document.querySelector('.word-count');
      if (wc) wc.textContent = words + ' words';
    });
  });

  // Download as plain text — no external library needed
  var btnDl = document.getElementById('btnDl');
  if (btnDl) {
    btnDl.addEventListener('click', function() {
      var title = document.title.replace(' | GED RLA', '');
      var dateStr = new Date().toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
      var lines = [];

      lines.push('GED REASONING THROUGH LANGUAGE ARTS');
      lines.push(title);
      lines.push('Downloaded: ' + dateStr);
      lines.push('============================================================');
      lines.push('');

      lines.push('PASSAGE');
      lines.push('------------------------------------------------------------');
      var passageEl = document.querySelector('.passage-content.active') || document.querySelector('.passage');
      if (passageEl) {
        var h3 = passageEl.querySelector('h3');
        if (h3) { lines.push(h3.textContent.trim()); lines.push(''); }
        passageEl.querySelectorAll('p').forEach(function(p) {
          var t = p.textContent.trim();
          if (t && t.length > 10 && !t.startsWith('Source:')) { lines.push(t); lines.push(''); }
        });
        passageEl.querySelectorAll('li').forEach(function(li) {
          lines.push('  - ' + li.textContent.trim());
        });
      }
      lines.push('');

      lines.push('QUESTIONS AND RESPONSES');
      lines.push('------------------------------------------------------------');
      document.querySelectorAll('.qblock').forEach(function(block, i) {
        var qnum = block.querySelector('.qnum');
        var qtext = block.querySelector('.qtext');
        if (!qtext) return;
        lines.push('');
        lines.push((qnum ? qnum.textContent.trim() : 'Question ' + (i+1)).toUpperCase());
        lines.push(qtext.textContent.trim());
        lines.push('');
        block.querySelectorAll('.choices li').forEach(function(li) {
          var letter = li.getAttribute('data-letter') || '';
          var text = li.textContent.replace(letter, '').trim();
          var marker = li.classList.contains('correct')  ? '[CORRECT]  ' :
                       li.classList.contains('wrong')    ? '[WRONG]    ' :
                       li.classList.contains('selected') ? '[SELECTED] ' : '           ';
          lines.push(marker + letter + '.  ' + text);
        });
        var wa = block.querySelector('textarea');
        if (wa) {
          lines.push('');
          lines.push('My answer: ' + (wa.value.trim() || '[No response written]'));
        }
        var rev = block.querySelector('.reveal');
        if (rev && rev.classList.contains('open')) {
          lines.push('');
          lines.push('Answer key: ' + rev.textContent.trim());
        }
      });

      var planBoxes = document.querySelectorAll('.plan-box');
      if (planBoxes.length) {
        lines.push(''); lines.push('');
        lines.push('PLANNING NOTES');
        lines.push('------------------------------------------------------------');
        planBoxes.forEach(function(box) {
          var h4 = box.querySelector('h4');
          if (h4) { lines.push(''); lines.push(h4.textContent.trim()); }
          box.querySelectorAll('label, textarea, input').forEach(function(el) {
            if (el.tagName === 'LABEL') lines.push(el.textContent.trim() + ':');
            else lines.push(el.value.trim() || '[No response]');
          });
        });
      }

      var essay = document.querySelector('.essay-area');
      if (essay) {
        lines.push(''); lines.push('');
        lines.push('ESSAY RESPONSE');
        lines.push('------------------------------------------------------------');
        lines.push(essay.value.trim() || '[No essay written]');
      }

      var rubricItems = document.querySelectorAll('.rubric-item');
      if (rubricItems.length) {
        lines.push(''); lines.push('');
        lines.push('SELF-CHECK');
        lines.push('------------------------------------------------------------');
        rubricItems.forEach(function(item) {
          var cb = item.querySelector('input[type=checkbox]');
          lines.push((cb && cb.checked ? '[x] ' : '[ ] ') + item.textContent.trim());
        });
      }

      lines.push('');
      lines.push('============================================================');
      lines.push('GED is a registered trademark of the American Council on Education.');

      var blob = new Blob([lines.join('\n')], {type: 'text/plain;charset=utf-8'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = title.replace(/[^a-zA-Z0-9_-]/g, '_') + '_responses.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

})();
