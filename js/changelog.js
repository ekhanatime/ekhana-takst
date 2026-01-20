/* Minimal docs renderer: loads local markdown files and renders a small subset of Markdown.
   Supported: # ## ###, paragraphs, ul/ol, inline code, fenced code blocks (``` and ```mermaid), hr.
*/

(function(){
  const $ = (sel) => document.querySelector(sel);
  const docEl = $('#doc');

  const DOCS = {
    changelog: { file: './changelog.md', title: 'Changelog' },
    project: { file: './project.md', title: 'Prosjektbeskrivelse' },
    tasklog: { file: './tasklog.md', title: 'Tasklog' },
  };

  function escapeHtml(s){
    return s
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function renderMarkdown(md){
    const lines = md.replace(/\r\n/g,'\n').split('\n');
    let html = '';
    let inCode = false;
    let codeLang = '';
    let codeBuf = [];
    let listMode = null; // 'ul' | 'ol'

    const closeList = () => {
      if (listMode){ html += `</${listMode}>`; listMode = null; }
    };

    for (let i=0;i<lines.length;i++){
      const line = lines[i];

      // fenced code start/end
      const fence = line.match(/^```\s*([a-zA-Z0-9_-]+)?\s*$/);
      if (fence){
        if (!inCode){
          inCode = true;
          codeLang = (fence[1]||'').toLowerCase();
          codeBuf = [];
        } else {
          // close
          const code = codeBuf.join('\n');
          if (codeLang === 'mermaid'){
            html += `<pre class="mermaid">${escapeHtml(code)}</pre>`;
          } else {
            html += `<pre><code>${escapeHtml(code)}</code></pre>`;
          }
          inCode = false;
          codeLang = '';
          codeBuf = [];
        }
        continue;
      }

      if (inCode){
        codeBuf.push(line);
        continue;
      }

      // hr
      if (/^---\s*$/.test(line)){
        closeList();
        html += '<hr/>';
        continue;
      }

      // headings
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h){
        closeList();
        const lvl = h[1].length;
        html += `<h${lvl}>${inline(escapeHtml(h[2].trim()))}</h${lvl}>`;
        continue;
      }

      // ordered list
      const ol = line.match(/^\s*\d+\.\s+(.*)$/);
      if (ol){
        if (listMode !== 'ol'){ closeList(); listMode='ol'; html += '<ol>'; }
        html += `<li>${inline(escapeHtml(ol[1]))}</li>`;
        continue;
      }

      // unordered list
      const ul = line.match(/^\s*[-*]\s+(.*)$/);
      if (ul){
        if (listMode !== 'ul'){ closeList(); listMode='ul'; html += '<ul>'; }
        html += `<li>${inline(escapeHtml(ul[1]))}</li>`;
        continue;
      }

      // blank
      if (/^\s*$/.test(line)){
        closeList();
        continue;
      }

      // paragraph
      closeList();
      html += `<p>${inline(escapeHtml(line))}</p>`;
    }

    closeList();
    return html;
  }

  function inline(s){
    // bold **x**
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // inline code `x`
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    // simple emoji/links left as text; avoid auto-linking for safety
    return s;
  }

  async function loadDoc(key){
    const info = DOCS[key] || DOCS.changelog;
    // active link
    document.querySelectorAll('.docSide a[data-doc]').forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-doc') === key);
    });

    document.title = `Ekhana – ${info.title}`;
    docEl.innerHTML = '<p>Laster…</p>';

    try {
      const res = await fetch(info.file, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const md = await res.text();
      docEl.innerHTML = renderMarkdown(md);
      // if mermaid is available, try to render
      try {
        if (window.mermaid && typeof window.mermaid.run === 'function') {
          window.mermaid.run({ querySelector: '.mermaid' });
        }
      } catch (e) {}
    } catch (e){
      docEl.innerHTML = `<p><strong>Kunne ikke laste dokument.</strong> (${escapeHtml(String(e))})</p>`;
    }
  }

  function currentKey(){
    const h = (location.hash||'').replace('#','');
    if (h === 'project') return 'project';
    if (h === 'tasklog') return 'tasklog';
    return 'changelog';
  }

  window.addEventListener('hashchange', () => loadDoc(currentKey()));
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[data-doc]');
    if (!a) return;
    ev.preventDefault();
    const key = a.getAttribute('data-doc');
    location.hash = key;
  });

  // boot
  loadDoc(currentKey());
})();
