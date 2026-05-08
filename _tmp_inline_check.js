
  /* ════════════════════════════════════════════════════════
     MEDIOCRE MARKUP — FULL ANIMATION SYSTEM
     ════════════════════════════════════════════════════════ */

  /* ── 1. CURSOR — magnetic particle field ── */
  if (window.innerWidth > 900) {
    /* One canvas covers the viewport — all cursor drawing happens here */
    const cc = document.createElement('canvas');
    cc.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(cc);
    const cx = cc.getContext('2d');
    cc.width  = innerWidth;
    cc.height = innerHeight;
    window.addEventListener('resize', () => { cc.width = innerWidth; cc.height = innerHeight; });

    /* Label div for hover text */
    const cLabel = document.createElement('div');
    cLabel.style.cssText = 'position:fixed;pointer-events:none;z-index:10000;font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(240,99,90,0.85);opacity:0;transition:opacity .18s;white-space:nowrap;';
    document.body.appendChild(cLabel);

    /* Mouse position */
    let mx = innerWidth / 2, my = innerHeight / 2;
    let hovered = false;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    /* ── Particles orbiting the cursor ── */
    const N_PARTICLES = 6;
    const particles = Array.from({ length: N_PARTICLES }, (_, i) => ({
      angle:  (i / N_PARTICLES) * Math.PI * 2,  // orbit angle
      radius: 18 + (i % 2) * 8,                 // alternating inner/outer orbit
      speed:  0.045 + i * 0.008,                // angular velocity
      size:   1.2 + (i % 3) * 0.6,
      alpha:  0.5 + (i % 2) * 0.3,
      x: mx, y: my,                             // actual screen pos (lerped)
      px: mx, py: my,                           // prev pos for trail
    }));

    /* ── Core dot — magnetic spring ── */
    let cx_ = mx, cy_ = my, cvx = 0, cvy = 0; // underscore to avoid conflict with ctx alias

    /* ── Ripple on click ── */
    let ripples = []; // {x,y,r,max,alpha}
    document.addEventListener('mousedown', () => {
      ripples.push({ x: mx, y: my, r: 0, max: 38, alpha: 0.6 });
    });

    /* ── Hover state ── */
    const HOVER_MAP = [
      ['a[href^="mailto"]', 'email'],
      ['.price-card',       'select'],
      ['.showcase-label',   'view'],
      ['.what-item',        'read'],
      ['a,.btn,button',     'open'],
    ];
    const getLabel = el => {
      for (const [sel, lbl] of HOVER_MAP) {
        const root = sel.split(',')[0].trim();
        if (el.closest(root)) return lbl;
      }
      return '';
    };
    document.querySelectorAll('a,.btn,button,.price-card,.what-item,.showcase-label,.service-chip').forEach(el => {
      el.addEventListener('mouseenter', e => {
        hovered = true;
        const lbl = getLabel(e.target);
        cLabel.textContent = lbl;
        cLabel.style.opacity = lbl ? '1' : '0';
      });
      el.addEventListener('mouseleave', () => {
        hovered = false;
        cLabel.style.opacity = '0';
      });
    });

    /* ── Draw loop ── */
    (function draw() {
      cx.clearRect(0, 0, cc.width, cc.height);

      /* Spring-pull core toward mouse */
      const ax = (mx - cx_) * 0.18;
      const ay = (my - cy_) * 0.18;
      cvx = (cvx + ax) * 0.62;
      cvy = (cvy + ay) * 0.62;
      cx_ += cvx; cy_ += cvy;
      const coreSpeed = Math.sqrt(cvx * cvx + cvy * cvy);

      /* Core dot */
      const coreR = hovered ? 3.5 : 4.5;
      const grd = cx.createRadialGradient(cx_, cy_, 0, cx_, cy_, coreR * 2.5);
      grd.addColorStop(0,   'rgba(240,99,90,0.95)');
      grd.addColorStop(0.5, 'rgba(240,99,90,0.3)');
      grd.addColorStop(1,   'rgba(240,99,90,0)');
      cx.beginPath();
      cx.arc(cx_, cy_, coreR * 2.5, 0, Math.PI * 2);
      cx.fillStyle = grd;
      cx.fill();
      cx.beginPath();
      cx.arc(cx_, cy_, coreR, 0, Math.PI * 2);
      cx.fillStyle = '#F0635A';
      cx.fill();

      /* Orbit ring — faint, scales with hover */
      const ringR = hovered ? 32 : 22;
      cx.beginPath();
      cx.arc(cx_, cy_, ringR, 0, Math.PI * 2);
      cx.strokeStyle = hovered ? 'rgba(240,99,90,0.35)' : 'rgba(240,99,90,0.18)';
      cx.lineWidth = 0.8;
      cx.stroke();

      /* Orbiting particles */
      particles.forEach((p, i) => {
        p.px = p.x; p.py = p.y;
        /* Slightly perturb orbit speed by core speed for fluid feel */
        p.angle += p.speed * (1 + coreSpeed * 0.04);
        const orbitR = hovered ? p.radius * 1.55 : p.radius;
        const tx = cx_ + Math.cos(p.angle) * orbitR;
        const ty = cy_ + Math.sin(p.angle) * orbitR;
        /* Particles lazily chase their target orbit position */
        p.x += (tx - p.x) * 0.3;
        p.y += (ty - p.y) * 0.3;

        /* Particle trail */
        cx.beginPath();
        cx.moveTo(p.px, p.py);
        cx.lineTo(p.x, p.y);
        cx.strokeStyle = `rgba(240,99,90,${p.alpha * 0.45})`;
        cx.lineWidth = p.size * 0.9;
        cx.lineCap = 'round';
        cx.stroke();

        /* Particle dot */
        cx.beginPath();
        cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${hovered ? '234,144,133' : '212,93,121'},${p.alpha})`;
        cx.fill();
      });

      /* Click ripples */
      ripples = ripples.filter(rip => rip.alpha > 0.01);
      ripples.forEach(rip => {
        rip.r   += (rip.max - rip.r) * 0.12;
        rip.alpha *= 0.88;
        cx.beginPath();
        cx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        cx.strokeStyle = `rgba(240,99,90,${rip.alpha})`;
        cx.lineWidth = 1;
        cx.stroke();
      });

      /* Label position */
      cLabel.style.left = (cx_ + 20) + 'px';
      cLabel.style.top  = (cy_ - 6) + 'px';

      requestAnimationFrame(draw);
    })();
  }

  /* ── 2. PARTICLE SYSTEM (hero) ── */
  {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let W, H;
    const resize = () => { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    let particles=[], mouseX=-1000, mouseY=-1000;
    const SYM_POOL = ['</', '/>', '{}', '()', '=>', '[]', '//', '+=', 'fn', 'px', 'vh', '&&', 'rem', '/*'];
    const initP = () => {
      particles=[];
      for(let i=0;i<100;i++) particles.push({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4,
        sym: SYM_POOL[Math.floor(Math.random()*SYM_POOL.length)],
        fs: 7 + Math.random() * 5,   // 7–12px — very small, subtle
        color:['#F0635A','#F0635A','#8b3a54','#F4A261','#F4A261'][Math.floor(Math.random()*5)],
        alpha:(Math.random()*0.18+0.06)  // very faint — 0.06–0.24
      });
    };
    initP();
    const hero = document.getElementById('hero');
    hero.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouseX=e.clientX-r.left;mouseY=e.clientY-r.top;});
    hero.addEventListener('mouseleave',()=>{mouseX=-1000;mouseY=-1000;});
    (function drawP(){
      ctx.clearRect(0,0,W,H);
      particles.forEach((p,i)=>{
        const dx=p.x-mouseX, dy=p.y-mouseY, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<60&&dist>0){const f=(60-dist)/60;p.vx+=(dx/dist)*f*0.4;p.vy+=(dy/dist)*f*0.4;}
        const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy), maxSpd=1.4;
        if(spd>maxSpd){p.vx=(p.vx/spd)*maxSpd;p.vy=(p.vy/spd)*maxSpd;}
        p.vx*=0.98; p.vy*=0.98; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        // Draw tiny symbol instead of dot
        ctx.globalAlpha=p.alpha;
        ctx.font=`600 ${p.fs}px 'JetBrains Mono',monospace`;
        ctx.fillStyle=p.color;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(p.sym,p.x,p.y);
        // Constellation lines between nearby symbols
        for(let j=i+1;j<particles.length;j++){
          const p2=particles[j],dx2=p.x-p2.x,dy2=p.y-p2.y,d2=Math.sqrt(dx2*dx2+dy2*dy2);
          if(d2<90){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle=p.color;ctx.globalAlpha=(1-d2/90)*0.06;ctx.lineWidth=0.5;ctx.stroke();}
        }
        ctx.globalAlpha=1;
      });
      requestAnimationFrame(drawP);
    })();
  }

  /* ── 3. BOKEH SPAWNER — disabled, symbols are the only floating elements ── */

  /* ── 4. AMBIENT MORPHING BLOBS ── */
  {
    // Spline interpolation for smooth organic blob paths
    function blobPath(cx, cy, r, pts, seed) {
      const n = pts || 7;
      const points = [];
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const variance = 0.38;
        const rad = r * (1 + (Math.sin(seed + i * 2.3) * variance));
        points.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
      }
      // Smooth closed catmull-rom
      let d = 'M ' + points[0][0] + ' ' + points[0][1];
      for (let i = 0; i < n; i++) {
        const p0 = points[(i - 1 + n) % n];
        const p1 = points[i];
        const p2 = points[(i + 1) % n];
        const p3 = points[(i + 2) % n];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
      }
      return d + ' Z';
    }
    let blobT = 0;
    const ab1p = document.getElementById('ab1-path');
    const ab2p = document.getElementById('ab2-path');
    const ab3p = document.getElementById('ab3-path');
    function animBlobs() {
      blobT += 0.004;
      if (ab1p) ab1p.setAttribute('d', blobPath(300, 300, 230, 7, blobT));
      if (ab2p) ab2p.setAttribute('d', blobPath(250, 250, 195, 6, blobT * 0.7 + 1));
      if (ab3p) ab3p.setAttribute('d', blobPath(190, 190, 150, 8, blobT * 1.3 + 3));
      requestAnimationFrame(animBlobs);
    }
    animBlobs();
  }

  /* ── 5. WHIRLPOOL — Symbol vortex → fall → phone reassembly ── */
  {
    const container = document.getElementById('whirlpool-container');
    const vCanvas   = document.getElementById('vortex-canvas');
    const vCtx      = vCanvas.getContext('2d');
    const cta       = document.getElementById('whirlpool-cta');
    let VW, VH, DPR;
    const resizeV = () => {
      DPR = window.devicePixelRatio || 1;
      VW = window.innerWidth;
      VH = window.innerHeight;
      vCanvas.width  = VW * DPR;
      vCanvas.height = VH * DPR;
      vCanvas.style.width  = VW + 'px';
      vCanvas.style.height = VH + 'px';
      vCtx.scale(DPR, DPR);
    };
    resizeV(); window.addEventListener('resize', resizeV);

    const SYMS = ['</', '/>', '{}', '()', '//', '=>', '[]', '&&', '/*', '*/', '<>', '::', '+=', 'fn', 'px', 'vh', 'rem', 'var', 'url', '##'];
    const N = window.innerWidth < 600 ? 18 : 34;
    const motes = [];

    // All symbols are canvas-drawn — no DOM elements, no compositing streaks
    const syms = Array.from({ length: N }, (_, i) => ({
      text:   SYMS[i % SYMS.length],
      r:      60 + Math.random() * 200,
      phase:  (i / N) * Math.PI * 2,
      speed:  0.4 + Math.random() * 0.7,
      fsize:  16 + Math.random() * 12,
      color:  Math.random() < 0.6 ? '#F0635A' : (Math.random() < 0.5 ? '#F4A261' : '#5A547A'),
      // animation state
      state:  'orbit',   // orbit | fall | impact | done
      x: 0, y: 0,
      vx: 0, vy: 0,
      alpha: 0,          // fades in on boot
      spin: Math.random() * Math.PI * 2,
      spinV: (Math.random() - 0.5) * 0.08,
      trail: [],
    }));

    // ── STATES: orbit → fall → land ──
    // dispProgress 0→0.6: pure orbit
    // dispProgress 0.6→1.0: symbols break orbit, fall downward with gravity
    // After all landed: whirlpool hides, phone reveal triggers
    let wpDone      = false;
    let fallStarted = false;
    let wpT         = 0;
    let dispProgress = 0;

    function spawnMote(x, y, count, color) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.5 + Math.random() * 3.2;
        motes.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - Math.random() * 1.5,
          r: 0.8 + Math.random() * 2.2,
          life: 1,
          decay: 0.018 + Math.random() * 0.028,
          color: color || (Math.random() < 0.55 ? '#F0635A' : '#F4A261')
        });
      }
    }

    function drawMotes() {
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.vy += 0.025;
        m.vx *= 0.985;
        m.vy *= 0.985;
        m.x += m.vx;
        m.y += m.vy;
        m.life -= m.decay;
        if (m.life <= 0) {
          motes.splice(i, 1);
          continue;
        }
        vCtx.save();
        vCtx.globalAlpha = Math.max(0, m.life);
        vCtx.shadowColor = m.color;
        vCtx.shadowBlur = 12;
        vCtx.beginPath();
        vCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        vCtx.fillStyle = m.color;
        vCtx.fill();
        vCtx.restore();
      }
    }

    // Phone frame anchor points — normalized 0..1, resolved to px when needed
    // These sit on the phone frame edges: corners, notch, sides, bottom bar
    const PHONE_ANCHORS_NORM = [
      { x: 0.5,   y: 0.18 },  // notch top
      { x: 0.35,  y: 0.22 },  // notch left
      { x: 0.65,  y: 0.22 },  // notch right
      { x: 0.18,  y: 0.28 },  // top-left corner
      { x: 0.82,  y: 0.28 },  // top-right corner
      { x: 0.12,  y: 0.5  },  // left mid
      { x: 0.88,  y: 0.5  },  // right mid
      { x: 0.18,  y: 0.75 },  // bottom-left
      { x: 0.82,  y: 0.75 },  // bottom-right
      { x: 0.5,   y: 0.82 },  // home bar
      { x: 0.3,   y: 0.88 },  // bottom left
      { x: 0.7,   y: 0.88 },  // bottom right
      { x: 0.5,   y: 0.92 },  // very bottom
      { x: 0.14,  y: 0.4  },  // left side button
      { x: 0.86,  y: 0.38 },  // right side button top
      { x: 0.86,  y: 0.48 },  // right side button bottom
      { x: 0.5,   y: 0.12 },  // top edge center
      { x: 0.25,  y: 0.15 },  // top left quarter
      { x: 0.75,  y: 0.15 },  // top right quarter
      { x: 0.5,   y: 0.55 },  // screen center
    ];

    // ── ORBIT + FALL ANIMATION — fully canvas-drawn, no DOM elements ──

    function getPhoneRect() {
      const pw = document.getElementById('phone-wrapper');
      if (!pw) return null;
      return pw.getBoundingClientRect();
    }

    function animWhirlpool(ts) {
      if (wpDone) return;
      wpT = ts * 0.001;
      vCtx.clearRect(0, 0, VW, VH);

      const cx = VW / 2, cy = VH / 2;
      const pr = getPhoneRect();
      let fallProg = 0;
      if (pr) {
        const enterY = VH;
        const readyY = VH * 0.55;
        fallProg = Math.max(0, Math.min(1, (enterY - pr.top) / (enterY - readyY)));
      }
      const aura = 0.28 + Math.sin(wpT * 1.4) * 0.08;
      vCtx.save();
      vCtx.globalAlpha = Math.max(0, 1 - fallProg * 0.75);
      for (let ring = 0; ring < 3; ring++) {
        const rr = 92 + ring * 82 + Math.sin(wpT * (0.8 + ring * 0.18)) * 18;
        vCtx.beginPath();
        vCtx.arc(cx, cy, rr, 0, Math.PI * 2);
        vCtx.strokeStyle = ring === 1 ? `rgba(244,162,97,${aura * 0.32})` : `rgba(240,99,90,${aura * 0.42})`;
        vCtx.lineWidth = 1;
        vCtx.setLineDash([2 + ring * 2, 14 - ring * 2]);
        vCtx.lineDashOffset = -wpT * (24 + ring * 12);
        vCtx.stroke();
      }
      vCtx.restore();

      syms.forEach((s, i) => {
        if (s.state === 'done') return;

        if (s.state === 'orbit') {
          const angle = s.phase + wpT * s.speed;
          const breathe = 1 + Math.sin(wpT * 1.6 + i) * 0.08;
          const wobble = Math.sin(wpT * 2.2 + s.phase) * 18;
          s.x = cx + Math.cos(angle) * (s.r * breathe + wobble);
          s.y = cy + Math.sin(angle) * (s.r * breathe) + Math.cos(angle * 2) * 10;
          s.spin += s.spinV;
          if (Math.random() < 0.018) spawnMote(s.x, s.y, 1, s.color);

          // Fade in on boot
          s.alpha = Math.min(1, s.alpha + 0.04);

          // Stagger into fall as phone scrolls into view
          if (fallProg > (i / N) * 0.6) {
            s.state = 'fall';
            const kickSpeed = 2.5 + Math.random() * 3;
            s.vx = Math.cos(s.phase) * kickSpeed * 0.5 + (Math.random() - 0.5) * 2;
            s.vy = -2 - Math.random() * 3;
            spawnMote(s.x, s.y, 5, s.color);
          }

        } else if (s.state === 'fall') {
          const pr2 = getPhoneRect();
          if (!pr2) return;

          const anchor  = PHONE_ANCHORS_NORM[i % PHONE_ANCHORS_NORM.length];
          const targetX = pr2.left + anchor.x * pr2.width;
          const targetY = pr2.top  + anchor.y * pr2.height;
          const dx = targetX - s.x, dy = targetY - s.y;
          const dist = Math.hypot(dx, dy);

          const proximity = 1 - Math.min(1, dist / 350);
          const homing = 0.012 + proximity * proximity * 0.08;
          s.vx += dx * homing;
          s.vy += dy * homing + 0.35;
          s.vx *= 0.91;
          s.vy *= 0.91;
          s.trail.push({ x: s.x, y: s.y, a: s.alpha });
          if (s.trail.length > 8) s.trail.shift();
          s.x += s.vx;
          s.y += s.vy;
          s.spin += s.spinV * 2.5;

          if (dist < 16) {
            s.state = 'impact';
            spawnMote(s.x, s.y, 14, s.color);
            const pf = document.querySelector('.phone-frame');
            if (pf) {
              pf.style.transition = 'box-shadow 0.05s';
              pf.style.boxShadow = '0 0 0 2px #2B2547, 0 28px 70px rgba(0,0,0,.35), 0 0 28px 10px rgba(240,99,90,0.7), 0 0 0 1px rgba(255,255,255,.06) inset';
              setTimeout(() => { pf.style.transition = 'box-shadow 1s'; pf.style.boxShadow = ''; }, 80);
            }
          }

        } else if (s.state === 'impact') {
          s.alpha -= 0.025;
          s.spin += s.spinV * 3;
          if (s.alpha <= 0) { s.alpha = 0; s.state = 'done'; return; }
        }

        if (s.trail.length && s.state !== 'orbit') {
          s.trail.forEach((pt, ti) => {
            const ta = (ti / s.trail.length) * s.alpha * 0.20;
            vCtx.save();
            vCtx.globalAlpha = ta;
            vCtx.font = `600 ${Math.max(8, s.fsize * (0.58 + ti / s.trail.length * 0.28))}px 'JetBrains Mono', monospace`;
            vCtx.fillStyle = s.color;
            vCtx.textAlign = 'center';
            vCtx.textBaseline = 'middle';
            vCtx.fillText(s.text, pt.x, pt.y);
            vCtx.restore();
          });
        }

        vCtx.save();
        vCtx.globalAlpha = s.alpha;
        vCtx.translate(s.x, s.y);
        vCtx.rotate(s.spin);
        vCtx.shadowColor = s.color;
        vCtx.shadowBlur = s.state === 'fall' ? 22 : 12;
        vCtx.font = `600 ${s.fsize}px 'JetBrains Mono', monospace`;
        vCtx.fillStyle = s.color;
        vCtx.textAlign = 'center';
        vCtx.textBaseline = 'middle';
        vCtx.fillText(s.text, 0, 0);
        vCtx.restore();
      });

      drawMotes();

      // All done → fire flicker
      if (!wpDone && syms.every(s => s.state === 'done')) {
        wpDone = true;
        container.style.transition = 'opacity 0.3s';
        container.style.opacity = '0';
        setTimeout(() => { container.style.display = 'none'; }, 320);
        window._wpSymbolsDone = true;
        document.dispatchEvent(new CustomEvent('wp-symbols-done'));
      }

      requestAnimationFrame(animWhirlpool);
    }

    // ── BOOT ──
    setTimeout(() => {
      cta.style.opacity = '1';
      requestAnimationFrame(animWhirlpool);
    }, 400);

    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      if (sy > 10) cta.style.opacity = '0';

      // Legacy dispProgress kept for fast-skip detection only
      dispProgress = Math.min(1, sy / (window.innerHeight * 1.6));

      // If user scrolled well past showcase and we're not done, force-close cleanly
      const showcaseEl = document.getElementById('showcase');
      if (!wpDone && showcaseEl) {
        const scr = showcaseEl.getBoundingClientRect();
        if (scr.bottom < 0) {
          wpDone = true;
          syms.forEach(s => { s.alpha = 0; s.state = 'done'; });
          container.style.opacity = '0';
          container.style.display = 'none';
          window._wpSymbolsDone = true;
          document.dispatchEvent(new CustomEvent('wp-symbols-done'));
        }
      }
    }, { passive: true });
  }

  /* ── 6 & 7. SHOWCASE — immersive physics phone stage ── */
  {
    const showcase    = document.getElementById('showcase');
    const physCanvas  = document.getElementById('sc-physics-canvas');
    const burstCanvas = document.getElementById('phone-burst-canvas');
    const depthRing   = document.getElementById('showcase-depth-ring');
    const phoneWrap   = document.getElementById('phone-wrapper');
    const namePill    = document.getElementById('sc-name-pill');
    const NAMES = ['Meridian Law Group','Bloom & Co.','Coastal Properties','Eleven North Coffee'];
    let currentTpl = 0;
    const tplCount = 4;
    let scVisible = false, landed = false, tiltOn = false;
    let gx = 0, gy = 0, tx = 0, ty = 0;
    let pauseScroll = false, scrollRaf = null;

    /* ── Physics canvas: floating UI fragments ── */
    const pc = physCanvas ? physCanvas.getContext('2d') : null;
    const FRAGMENTS = [
      { text: '⚖ Law · $500',     w: 98,  h: 26 },
      { text: 'Mobile-first',      w: 88,  h: 24 },
      { text: '7-day delivery',    w: 100, h: 24 },
      { text: '</>',               w: 36,  h: 36 },
      { text: '4.9 ★',            w: 58,  h: 26 },
      { text: '$624,900',          w: 90,  h: 26 },
      { text: 'Free Consult',      w: 94,  h: 24 },
      { text: '↗ +38% CTR',       w: 90,  h: 26 },
      { text: 'Est. 1998',         w: 72,  h: 24 },
      { text: 'Hand-coded',        w: 86,  h: 24 },
      { text: '{ }',               w: 34,  h: 34 },
      { text: '2,400+ cases',      w: 100, h: 24 },
      { text: 'Bloom & Co.',       w: 86,  h: 26 },
      { text: '<1s load',          w: 72,  h: 24 },
      { text: '☕ On Tap',         w: 72,  h: 26 },
      { text: '🌸 Weddings',       w: 90,  h: 26 },
      { text: 'A-rated schools',   w: 106, h: 24 },
      { text: '0 px bug',          w: 70,  h: 24 },
    ];

    let frags = [];
    function initFrags() {
      if (!physCanvas) return;
      physCanvas.width  = physCanvas.offsetWidth;
      physCanvas.height = physCanvas.offsetHeight;
      const W = physCanvas.width, H = physCanvas.height;
      frags = FRAGMENTS.map((f, i) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.12 + Math.random() * 0.22;
        return {
          ...f,
          x: 60 + Math.random() * (W - 120),
          y: 40 + Math.random() * (H - 80),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.07 + Math.random() * 0.13,
          targetAlpha: 0.07 + Math.random() * 0.13,
          rot: (Math.random() - 0.5) * 0.08,
          rotV: (Math.random() - 0.5) * 0.0006,
          isCode: f.text === '</>' || f.text === '{ }',
        };
      });
    }

    let mouseX = -9999, mouseY = -9999;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    function drawFrags() {
      if (!pc || !physCanvas) return;
      const W = physCanvas.width, H = physCanvas.height;
      pc.clearRect(0, 0, W, H);
      if (!scVisible) return;

      const rect = physCanvas.getBoundingClientRect();
      const lmx = mouseX - rect.left, lmy = mouseY - rect.top;

      frags.forEach(f => {
        /* mouse repulsion */
        const dx = f.x - lmx, dy = f.y - lmy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140 * 0.18;
          f.vx += (dx / dist) * force;
          f.vy += (dy / dist) * force;
        }

        /* gentle center gravity */
        f.vx += (W / 2 - f.x) * 0.000015;
        f.vy += (H / 2 - f.y) * 0.000015;

        f.vx *= 0.985; f.vy *= 0.985;
        f.x += f.vx; f.y += f.vy;
        f.rot += f.rotV;

        /* bounce walls */
        const hw = f.w / 2 + 8;
        if (f.x < hw)     { f.x = hw;     f.vx = Math.abs(f.vx) * 0.6; }
        if (f.x > W - hw) { f.x = W - hw; f.vx = -Math.abs(f.vx) * 0.6; }
        if (f.y < 16)      { f.y = 16;     f.vy = Math.abs(f.vy) * 0.6; }
        if (f.y > H - 16)  { f.y = H - 16; f.vy = -Math.abs(f.vy) * 0.6; }

        /* draw */
        pc.save();
        pc.translate(f.x, f.y);
        pc.rotate(f.rot);
        pc.globalAlpha = f.alpha;

        if (f.isCode) {
          pc.font = `bold 15px 'JetBrains Mono', monospace`;
          pc.fillStyle = '#F0635A';
          pc.textAlign = 'center';
          pc.textBaseline = 'middle';
          pc.fillText(f.text, 0, 0);
        } else {
          const pad = 10;
          const rx = -f.w / 2 - pad, ry = -f.h / 2 - 2, rw = f.w + pad * 2, rh = f.h + 4, cr = 6;
          pc.beginPath();
          pc.moveTo(rx + cr, ry);
          pc.lineTo(rx + rw - cr, ry); pc.arcTo(rx + rw, ry, rx + rw, ry + cr, cr);
          pc.lineTo(rx + rw, ry + rh - cr); pc.arcTo(rx + rw, ry + rh, rx + rw - cr, ry + rh, cr);
          pc.lineTo(rx + cr, ry + rh); pc.arcTo(rx, ry + rh, rx, ry + rh - cr, cr);
          pc.lineTo(rx, ry + cr); pc.arcTo(rx, ry, rx + cr, ry, cr);
          pc.closePath();
          pc.strokeStyle = 'rgba(240,99,90,0.35)';
          pc.lineWidth = 1;
          pc.stroke();
          pc.fillStyle = 'rgba(28,17,24,0.55)';
          pc.fill();
          pc.font = `10px 'JetBrains Mono', monospace`;
          pc.fillStyle = 'rgba(250,250,248,0.7)';
          pc.textAlign = 'center';
          pc.textBaseline = 'middle';
          pc.fillText(f.text, 0, 0);
        }
        pc.restore();
      });
    }

    function physLoop() { drawFrags(); requestAnimationFrame(physLoop); }

    window.addEventListener('resize', () => {
      if (!physCanvas) return;
      physCanvas.width  = physCanvas.offsetWidth;
      physCanvas.height = physCanvas.offsetHeight;
    });

    /* ── Particle burst on template switch ── */
    function fireBurst() {
      if (!burstCanvas) return;
      const bc = burstCanvas.getContext('2d');
      const W = burstCanvas.offsetWidth || 260, H = burstCanvas.offsetHeight || 520;
      burstCanvas.width = W; burstCanvas.height = H;
      const pts = Array.from({ length: 32 }, () => {
        const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5;
        return { x: W / 2, y: H / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.2,
                 r: 1.2 + Math.random() * 2.2, al: 0.85,
                 col: Math.random() < 0.6 ? '#F0635A' : '#F4A261' };
      });
      (function bl() {
        bc.clearRect(0, 0, W, H); let any = false;
        pts.forEach(p => {
          p.vy += 0.12; p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.al *= 0.93;
          if (p.al < 0.02) return; any = true;
          bc.beginPath(); bc.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          bc.fillStyle = p.col; bc.globalAlpha = p.al; bc.fill(); bc.globalAlpha = 1;
        });
        if (any) requestAnimationFrame(bl); else bc.clearRect(0, 0, W, H);
      })();
    }

    /* ── Phone template switcher ── */
    function switchPhoneTpl(idx) {
      document.querySelectorAll('.phone-template').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
        if (i === idx) el.scrollTop = 0;
      });
      document.querySelectorAll('.phone-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
      currentTpl = idx;
      if (namePill) {
        namePill.style.opacity = '0';
        setTimeout(() => { namePill.textContent = NAMES[idx]; namePill.style.opacity = '1'; }, 220);
      }
    }

    /* ── 3D flip on template change ── */
    function flipTo(idx) {
      if (!phoneWrap) return;
      phoneWrap.style.transition = 'transform 0.32s cubic-bezier(0.4,0,1,1), opacity 0.2s';
      phoneWrap.style.transform  = 'rotateY(90deg) scale(0.9)';
      phoneWrap.style.opacity    = '0.35';
      setTimeout(() => {
        switchPhoneTpl(idx);
        phoneWrap.style.transition = 'transform 0.38s cubic-bezier(0,0,0.2,1.15), opacity 0.25s';
        phoneWrap.style.transform  = tiltOn ? '' : 'rotateY(0deg) scale(1)';
        phoneWrap.style.opacity    = '1';
        fireBurst();
        startScrollCycle();
      }, 320);
    }

    /* ── Auto-scroll cycler ── */
    function startScrollCycle() {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      let lastTime = null, atBottomSince = null, dwellSince = null;
      const PX_PER_SEC = 42, PAUSE_AT_BOTTOM_MS = 2000, DWELL_MS = 6000;
      function tick(ts) {
        if (pauseScroll) { lastTime = null; scrollRaf = requestAnimationFrame(tick); return; }
        if (!lastTime) lastTime = ts;
        const dt = Math.min(ts - lastTime, 50); lastTime = ts;
        const el = document.querySelectorAll('.phone-template')[currentTpl];
        if (!el) return;
        const canScroll = el.scrollHeight > el.clientHeight + 2;
        if (canScroll) {
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
          if (atBottom) {
            if (!atBottomSince) atBottomSince = ts;
            if (ts - atBottomSince >= PAUSE_AT_BOTTOM_MS) { flipTo((currentTpl + 1) % tplCount); return; }
          } else { atBottomSince = null; el.scrollTop += (PX_PER_SEC * dt) / 1000; }
        } else {
          if (!dwellSince) dwellSince = ts;
          if (ts - dwellSince >= DWELL_MS) { flipTo((currentTpl + 1) % tplCount); return; }
        }
        scrollRaf = requestAnimationFrame(tick);
      }
      scrollRaf = requestAnimationFrame(tick);
    }

    const phoneScreen = document.getElementById('phone-screen');
    if (phoneScreen) {
      phoneScreen.addEventListener('mouseenter', () => { pauseScroll = true; });
      phoneScreen.addEventListener('mouseleave', () => { pauseScroll = false; });
      phoneScreen.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
    }

    /* ── Mouse tilt ── */
    document.addEventListener('mousemove', e => {
      if (!tiltOn || !scVisible) return;
      const r = showcase.getBoundingClientRect();
      gx = (e.clientX - r.left) / r.width - 0.5;
      gy = (e.clientY - r.top)  / r.height - 0.5;
    });
    (function tiltLoop() {
      tx += (gx - tx) * 0.08; ty += (gy - ty) * 0.08;
      if (phoneWrap && tiltOn) {
        const ry = tx * -16, rx = ty * 10;
        phoneWrap.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg) scale(1.01) translateZ(16px)`;
        phoneWrap.style.filter = `drop-shadow(${tx * -24}px ${24 + ty * 12}px ${44 + Math.abs(tx) * 12}px rgba(0,0,0,${0.22 + Math.abs(tx) * 0.07}))`;
      }
      requestAnimationFrame(tiltLoop);
    })();

    /* ── Phone flicker-to-life ── */
    let flickerDone = false;
    function flickerToLife() {
      if (flickerDone) return;
      flickerDone = true;
      const screenOff = document.getElementById('phone-screen-off');
      const sweep     = document.getElementById('phone-crt-sweep');
      const screen    = document.getElementById('phone-screen');
      if (!screenOff) return;

      // Slow, dramatic CRT boot — flickers spread over 1.4s so you can follow each one
      // Pattern: dark → flash bright → dim → flicker rapidly → hold bright → sweep
      const flickers = [
        { t:   0, op: '0.10', tr: '0.08s' },  // dim — starting to wake
        { t: 180, op: '0.92', tr: '0.06s' },  // first flash
        { t: 320, op: '0.20', tr: '0.10s' },  // fall back dark
        { t: 500, op: '0.80', tr: '0.05s' },  // flash
        { t: 620, op: '0.05', tr: '0.08s' },  // almost on
        { t: 740, op: '0.75', tr: '0.04s' },  // quick flutter
        { t: 820, op: '0.08', tr: '0.06s' },  // nearly there
        { t: 920, op: '0.60', tr: '0.04s' },  // last stutter
        { t:1020, op: '0.04', tr: '0.15s' },  // settles dim — ready for sweep
      ];
      flickers.forEach(({ t, op, tr }) => {
        setTimeout(() => {
          screenOff.style.transition = `opacity ${tr}`;
          screenOff.style.opacity = op;
        }, t);
      });

      // After flicker sequence: sweep scan-line slowly top to bottom
      setTimeout(() => {
        screenOff.style.transition = 'opacity 0.2s';
        screenOff.style.opacity = '0.04';
        if (sweep) {
          sweep.style.opacity = '1';
          sweep.style.top = '0px';
          const screenH = screen ? screen.offsetHeight : 440;
          const duration = 700; // slow sweep — 700ms so you can watch it travel
          const start = performance.now();
          const animate = (now) => {
            const t = Math.min(1, (now - start) / duration);
            // ease-in-out for a more organic feel
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            sweep.style.top = (ease * screenH) + 'px';
            // Sweep line pulses slightly brighter as it passes midpoint
            const brightness = 0.8 + Math.sin(t * Math.PI) * 0.2;
            sweep.style.opacity = brightness.toFixed(2);
            if (t < 1) requestAnimationFrame(animate);
            else {
              sweep.style.opacity = '0';
              // Screen fully on — fade out the black overlay slowly
              screenOff.style.transition = 'opacity 0.5s';
              screenOff.style.opacity = '0';
              // Fire burst + settle
              setTimeout(fireBurst, 120);
              setTimeout(() => {
                if (phoneWrap) { phoneWrap.classList.add('phone-settled'); tiltOn = true; }
                namePill?.classList.add('sc-in');
                if (depthRing) depthRing.classList.add('ring-pop');
                startScrollCycle();
              }, 400);
            }
          };
          requestAnimationFrame(animate);
        }
      }, 1200);
    }

    /* ── Entrance ── */
    function doShowcaseReveal() {
      if (landed) return;
      landed = true;
      initFrags();
      physLoop();

      // Text fades in immediately
      setTimeout(() => {
        document.getElementById('sc-eyebrow')?.classList.add('sc-in');
        document.getElementById('sc-headline')?.classList.add('sc-in');
        document.getElementById('sc-tagline')?.classList.add('sc-in');
      }, 80);

      // If symbols are already done (fast scroll), flicker right away
      // Otherwise flickerToLife is called by wp-symbols-done
      if (window._wpSymbolsDone) {
        setTimeout(flickerToLife, 300);
      }
    }

    // Symbols done → trigger flicker
    document.addEventListener('wp-symbols-done', () => {
      doShowcaseReveal();
      setTimeout(flickerToLife, 200);
    });

    new IntersectionObserver(([e]) => {
      scVisible = e.isIntersecting;
      if (e.isIntersecting && !landed) {
        if (window._wpSymbolsDone || window.scrollY > window.innerHeight * 0.95) {
          doShowcaseReveal();
        } else {
          // Give symbols up to 2.8s then force reveal with flicker
          setTimeout(() => {
            if (!landed) doShowcaseReveal();
          }, 400);
          setTimeout(() => {
            if (!window._wpSymbolsDone) flickerToLife();
          }, 2800);
        }
      }
    }, { threshold: 0.01 }).observe(showcase);
  }

  /* ── 8a. NAV HIDE/SHOW ON HERO EXIT ── */
  {
    const nav = document.querySelector('nav');
    const hero = document.getElementById('hero');
    let navHidden = false;
    function updateNav() {
      if (!hero || !nav) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const shouldHide = heroBottom < 0;
      if (shouldHide !== navHidden) {
        navHidden = shouldHide;
        nav.classList.toggle('nav-hidden', shouldHide);
      }
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ── 8. SCROLL-PINNED DIVE REVEAL ── */
  {
    const revealSection = document.getElementById('video-reveal');
    const mask          = document.getElementById('video-clip-mask');
    const progressFill  = document.getElementById('video-progress-fill');
    const progressLabel = document.getElementById('video-progress-label');
    const eyebrow       = document.getElementById('video-eyebrow');
    const headline      = document.getElementById('video-headline');
    const fc            = document.getElementById('video-canvas-fallback');
    const fCtx          = fc.getContext('2d');
    const inner3d       = document.getElementById('video-inner-3d');
    const portalGlow    = document.getElementById('dive-portal-glow');
    const edgeVignette  = document.getElementById('dive-edge-vignette');
    const scanlines     = document.getElementById('dive-scanlines');
    const depthHud      = document.getElementById('dive-depth-hud');
    const depthVal      = document.getElementById('dive-depth-val');
    const lbTop         = document.getElementById('dive-letterbox-top');
    const lbBottom      = document.getElementById('dive-letterbox-bottom');

    // ── BUILD STAGE references ──
    const buildStage    = document.getElementById('build-stage');
    const buildFrame    = document.getElementById('build-frame');
    const buildSite     = document.getElementById('build-site');
    const buildSvg      = document.getElementById('build-svg');
    const buildOrbs     = document.getElementById('build-orbs');
    const blCode        = document.getElementById('build-code');
    const codeStream    = document.getElementById('code-stream');
    const codeLines     = codeStream ? codeStream.querySelectorAll('.ct-line') : [];
    // Pieces in build order — must match assembly sequence
    const sitePieces    = buildSite ? Array.from(buildSite.querySelectorAll('.bs-piece')) : [];
    const blueprintGroups = buildSvg ? Array.from(buildSvg.querySelectorAll('.bs-bp')) : [];
    const phaseRows     = document.querySelectorAll('.bp-row');
    const bcEyebrow     = document.getElementById('bc-eyebrow');
    const bcTitle       = document.getElementById('bc-title');
    const bcBody        = document.getElementById('bc-body');
    const bcNotes       = document.getElementById('bc-notes');
    const bcProgressFill = document.getElementById('bc-progress-fill');
    const buildCaption  = document.getElementById('build-caption');
    const btPhase       = document.getElementById('bt-phase');
    const btLines       = document.getElementById('bt-lines');
    const btRender      = document.getElementById('bt-render');
    const btDeploy      = document.getElementById('bt-deploy');
    const btCpu         = document.getElementById('bt-cpu');
    const btSize        = document.getElementById('bt-size');
    const btSpark       = document.getElementById('bt-spark');
    const overlayText   = document.getElementById('video-text-overlay');
    const bfSweep       = document.querySelector('.bf-sweep');
    const bfGlitch      = document.querySelector('.bf-glitch');
    const bfRail        = document.querySelector('.bf-rail');
    const bfRailText    = document.getElementById('bf-rail-text');
    const bfRailTime    = document.getElementById('bf-rail-time');
    const fakeCursor    = document.querySelector('.bld-fakecursor');
    const tapRing       = document.querySelector('.bld-tapring');
    const shipParticles = document.getElementById('ship-particles');
    const buildAtmosphere = document.getElementById('build-atmosphere');

    // Phase copy — captions update at each major beat
    const PHASE_COPY = [
      {
        eyebrow: 'PHASE 01 / 04 · BLUEPRINT',
        title:   'The offer gets mapped first.',
        body:    'Before the polish, we decide what a visitor should understand, trust, and do.',
        notes:   'SCENE LOCKED · CAMERA CALM · INTENT ESTABLISHED',
        ph:      'BLUEPRINT',
        rail:    'build · blueprint',
      },
      {
        eyebrow: 'PHASE 02 / 04 · ASSEMBLE',
        title:   'The page gets thrown together like a machine under load.',
        body:    'Navigation, proof, service cards, and booking slam into place around the customer journey, not around decoration.',
        notes:   'MAGNETIC LOCKS ONLINE · MASS ARRIVING · STRUCTURE TAKES WEIGHT',
        ph:      'ASSEMBLE',
        rail:    'build · assemble',
      },
      {
        eyebrow: 'PHASE 03 / 04 · CODE',
        title:   'Now the thing starts breathing.',
        body:    'Real HTML, CSS, and JS turn the layout into a responsive, living surface that can move fast without falling apart.',
        notes:   'SIGNAL UP · SYSTEMS HOT · LIGHT LEAKS THROUGH THE SEAMS',
        ph:      'CODE',
        rail:    'build · code',
      },
      {
        eyebrow: 'PHASE 04 / 04 · SHIPPED',
        title:   'Release should feel like impact, not just completion.',
        body:    'A live domain, working actions, clean copy, and a page that lands with enough force to make the next scroll feel quiet.',
        notes:   'FIELD STABLE · MOTION BLEEDS OFF · LIVE AND TAKING CUSTOMERS',
        ph:      'SHIPPED',
        rail:    'build · shipped',
      },
    ];

    const cameraState = {
      shiftX: 0,
      shiftY: 0,
      rotX: 0,
      rotY: 0,
      scale: 1,
      vx: 0,
      vy: 0,
      vrx: 0,
      vry: 0,
      vs: 0,
      impulse: 0,
    };
    const targetCamera = { shiftX: 0, shiftY: 0, rotX: 0, rotY: 0, scale: 1 };
    let cameraLast = performance.now();
    function kickCamera(dx = 0, dy = 0, rx = 0, ry = 0, scaleKick = 0) {
      cameraState.vx += dx;
      cameraState.vy += dy;
      cameraState.vrx += rx;
      cameraState.vry += ry;
      cameraState.vs += scaleKick;
      cameraState.impulse = Math.min(1, cameraState.impulse + Math.abs(dx + dy + rx + ry) * 0.015 + Math.abs(scaleKick) * 40);
    }
    function tickCamera() {
      const now = performance.now();
      const dt = Math.min(2, (now - cameraLast) / 16.6667);
      cameraLast = now;

      cameraState.vx += (targetCamera.shiftX - cameraState.shiftX) * 0.085 * dt;
      cameraState.vy += (targetCamera.shiftY - cameraState.shiftY) * 0.085 * dt;
      cameraState.vrx += (targetCamera.rotX - cameraState.rotX) * 0.085 * dt;
      cameraState.vry += (targetCamera.rotY - cameraState.rotY) * 0.085 * dt;
      cameraState.vs += (targetCamera.scale - cameraState.scale) * 0.07 * dt;

      cameraState.vx *= 0.76;
      cameraState.vy *= 0.76;
      cameraState.vrx *= 0.74;
      cameraState.vry *= 0.74;
      cameraState.vs *= 0.72;

      cameraState.shiftX += cameraState.vx;
      cameraState.shiftY += cameraState.vy;
      cameraState.rotX += cameraState.vrx;
      cameraState.rotY += cameraState.vry;
      cameraState.scale += cameraState.vs;
      cameraState.impulse *= 0.9;

      if (buildStage) {
        buildStage.style.setProperty('--stage-shift-x', `${cameraState.shiftX.toFixed(2)}px`);
        buildStage.style.setProperty('--stage-shift-y', `${cameraState.shiftY.toFixed(2)}px`);
        buildStage.style.setProperty('--stage-rot-x', `${cameraState.rotX.toFixed(2)}deg`);
        buildStage.style.setProperty('--stage-rot-y', `${cameraState.rotY.toFixed(2)}deg`);
        buildStage.style.setProperty('--stage-scale', cameraState.scale.toFixed(4));
        buildStage.style.setProperty('--impact-flash', cameraState.impulse.toFixed(3));
      }

      requestAnimationFrame(tickCamera);
    }
    requestAnimationFrame(tickCamera);

    // Trigger the coral scan-line sweep across the device screen
    function fireSweep() {
      if (!bfSweep) return;
      bfSweep.classList.remove('bf-sweep-go');
      void bfSweep.offsetWidth;
      bfSweep.classList.add('bf-sweep-go');
    }
    // Trigger glitch effect (used on code → render hand-off)
    function fireGlitch() {
      if (!bfGlitch) return;
      bfGlitch.classList.remove('bf-glitch-go');
      void bfGlitch.offsetWidth;
      bfGlitch.classList.add('bf-glitch-go');
    }
    // Flicker a telemetry value as it updates
    function flickerVal(el) {
      if (!el) return;
      el.classList.remove('bt-flicker');
      void el.offsetWidth;
      el.classList.add('bt-flicker');
    }

    // Burst of coral flakes around the frame on ship
    function fireShipParticles() {
      if (!shipParticles) return;
      shipParticles.innerHTML = '';
      const N = 44;
      for (let i = 0; i < N; i++) {
        const f = document.createElement('div');
        f.className = 'sp-flake';
        const angle = (i / N) * Math.PI * 2 + Math.random() * 0.4;
        const dist  = 120 + Math.random() * 200;
        const dx    = Math.cos(angle) * dist;
        const dy    = Math.sin(angle) * dist - 40;
        const rot   = (Math.random() - 0.5) * 720;
        const dur   = 1100 + Math.random() * 900;
        const delay = Math.random() * 250;
        const sz    = 4 + Math.random() * 6;
        f.style.width = f.style.height = sz + 'px';
        f.style.left = '50%'; f.style.top = '50%';
        f.style.background = Math.random() < 0.6 ? '#F0635A' : '#F4A261';
        f.style.transform = 'translate(-50%,-50%)';
        shipParticles.appendChild(f);
        // Animate via WAAPI
        f.animate([
          { transform: 'translate(-50%,-50%) rotate(0deg) scale(0.4)', opacity: 0 },
          { transform: `translate(calc(-50% + ${dx*0.3}px), calc(-50% + ${dy*0.3}px)) rotate(${rot*0.4}deg) scale(1)`, opacity: 1, offset: 0.18 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg) scale(0.6)`, opacity: 0 },
        ], { duration: dur, delay, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' });
      }
    }

    // Fake cursor walk for the render phase — moves to CTA, taps it, then to a card
    let cursorTimers = [];
    function clearCursorTimers() {
      cursorTimers.forEach(t => clearTimeout(t));
      cursorTimers = [];
    }
    function startCursorDemo() {
      if (!fakeCursor || !buildSite) return;
      clearCursorTimers();
      const moveTo = (selector, after, withTap) => {
        cursorTimers.push(setTimeout(() => {
          const target = buildSite.querySelector(selector);
          if (!target) return;
          const tRect = target.getBoundingClientRect();
          const sRect = buildSite.getBoundingClientRect();
          const x = tRect.left - sRect.left + tRect.width  * 0.5;
          const y = tRect.top  - sRect.top  + tRect.height * 0.65;
          fakeCursor.style.transition = 'transform 0.95s cubic-bezier(0.34,1.32,0.36,1), opacity 0.3s ease';
          fakeCursor.style.transform = `translate(${x}px, ${y}px)`;
          if (withTap) {
            cursorTimers.push(setTimeout(() => {
              if (selector === '.bs-cta') buildSite.classList.add('bs-cta-hovered');
              fireTap(x, y);
              cursorTimers.push(setTimeout(() => buildSite.classList.remove('bs-cta-hovered'), 700));
            }, 1000));
          }
        }, after));
      };
      moveTo('.bs-cta',                    400,  true);
      moveTo('.bs-card:nth-child(1)',      2400, true);
      moveTo('.bs-card:nth-child(2)',      4100, true);
      moveTo('.bs-cta',                    5700, true);
    }
    function stopCursorDemo() {
      clearCursorTimers();
      if (fakeCursor) {
        fakeCursor.style.transition = 'opacity 0.3s ease';
        fakeCursor.style.opacity = '0';
      }
    }
    function fireTap(x, y) {
      if (!tapRing) return;
      tapRing.style.left = x + 'px';
      tapRing.style.top  = y + 'px';
      tapRing.classList.remove('tap-go');
      void tapRing.offsetWidth;
      tapRing.classList.add('tap-go');
    }

    // ── ASSEMBLY: pieces fly in like Iron Man parts ──
    // Each piece has a "landed" state. Blueprint draws → orb flies in → piece lands.
    const pieceState = sitePieces.map(() => ({ landed: false, blueprintShown: false }));
    let activeOrbs = [];

    // Get position of a piece in screen coords
    function pieceCenter(idx) {
      if (!sitePieces[idx] || !buildFrame) return null;
      const pr = sitePieces[idx].getBoundingClientRect();
      const fr = buildFrame.getBoundingClientRect();
      return {
        x: pr.left - fr.left + pr.width / 2,
        y: pr.top  - fr.top  + pr.height / 2,
      };
    }

    // Spawn an orb that flies in from a side, then lands on a piece
    function spawnDeliveryOrb(targetIdx, fromSide) {
      if (!buildOrbs || !sitePieces[targetIdx]) return;
      const target = pieceCenter(targetIdx);
      if (!target) return;
      const orb = document.createElement('div');
      orb.className = 'bo-orb';
      buildOrbs.appendChild(orb);
      activeOrbs.push(orb);

      const fr = buildFrame.getBoundingClientRect();
      const startX = fromSide === 'left'  ? -60
                   : fromSide === 'right' ? fr.width + 60
                   : fr.width / 2 + (Math.random() - 0.5) * 80;
      const startY = fromSide === 'top'    ? -40
                   : fromSide === 'bottom' ? fr.height + 40
                   : Math.random() * fr.height;

      orb.style.left = startX + 'px';
      orb.style.top  = startY + 'px';
      orb.style.opacity = '0';

      // Curved flight via two keyframes with control bezier
      const ctrlX = (startX + target.x) / 2 + (Math.random() - 0.5) * 120;
      const ctrlY = (startY + target.y) / 2 - 86;

      orb.animate([
        { left: startX + 'px', top: startY + 'px', opacity: 0,   transform: 'scale(0.35) rotate(0deg)', filter: 'blur(2px)' },
        { left: ctrlX  + 'px', top: ctrlY  + 'px', opacity: 1,   transform: 'scale(1.15) rotate(180deg)', filter: 'blur(0)', offset: 0.52 },
        { left: target.x + 'px', top: target.y + 'px', opacity: 1, transform: 'scale(0.72) rotate(320deg)', filter: 'blur(0)' },
      ], { duration: 920, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });

      // Cleanup + trigger piece land slightly before arrival
      setTimeout(() => {
        // Quick flash on arrival
        orb.animate([
          { opacity: 1,   transform: 'scale(0.7)', boxShadow: '0 0 12px 2px rgba(240,99,90,0.7)' },
          { opacity: 1,   transform: 'scale(2.2)', boxShadow: '0 0 30px 8px rgba(240,99,90,0.4)' },
          { opacity: 0,   transform: 'scale(0.5)', boxShadow: '0 0 0 0 rgba(240,99,90,0)' },
        ], { duration: 380, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' });
        landPiece(targetIdx);
      }, 790);

      setTimeout(() => {
        if (orb.parentNode) orb.parentNode.removeChild(orb);
        activeOrbs = activeOrbs.filter(o => o !== orb);
      }, 1450);
    }

    // Make a piece "land" — physics overshoot snap
    function landPiece(idx) {
      const piece = sitePieces[idx];
      if (!piece || pieceState[idx].landed) return;
      pieceState[idx].landed = true;
      piece.classList.add('bs-piece-in');
      const from = piece.dataset.from || 'top';
      const impactMap = {
        left:   { dx: 14, dy: -3, rx: 1.2,  ry: -2.8 },
        right:  { dx: -14, dy: -3, rx: 1.2,  ry: 2.8 },
        top:    { dx: 0,  dy: 10, rx: -3.6, ry: 0.8 },
        bottom: { dx: 0,  dy: -10, rx: 3.0, ry: -0.8 },
      };
      const impact = impactMap[from] || impactMap.top;
      kickCamera(impact.dx, impact.dy, impact.rx, impact.ry, 0.014);
      piece.animate([
        { transform: `translate3d(${impact.dx * 0.24}px, ${impact.dy * 0.24}px, 0) rotate(${impact.ry * 0.65}deg) scale(0.94)`, filter: 'brightness(1.18)' },
        { transform: `translate3d(${impact.dx * -0.08}px, ${impact.dy * -0.08}px, 0) rotate(${impact.ry * -0.18}deg) scale(1.03)`, filter: 'brightness(1.1)', offset: 0.48 },
        { transform: 'translate3d(0,0,0) rotate(0deg) scale(1)', filter: 'brightness(1)' },
      ], { duration: 760, easing: 'cubic-bezier(0.16,1,0.3,1)' });
      // Bloom ring on landing
      piece.classList.remove('bs-piece-land');
      void piece.offsetWidth;
      piece.classList.add('bs-piece-land');
      // Hide the blueprint group for this piece a moment after landing
      setTimeout(() => {
        const bp = blueprintGroups.find(g => g.dataset.for === piece.dataset.piece);
        if (bp) {
          bp.classList.remove('bp-draw');
          bp.classList.add('bp-fade');
        }
      }, 250);
    }

    // Show blueprint for a piece (precedes its delivery)
    function showBlueprint(idx) {
      const piece = sitePieces[idx];
      if (!piece || pieceState[idx].blueprintShown) return;
      pieceState[idx].blueprintShown = true;
      const bp = blueprintGroups.find(g => g.dataset.for === piece.dataset.piece);
      if (bp) {
        bp.classList.remove('bp-fade');
        bp.classList.add('bp-draw');
      }
    }

    // Reset all pieces (when scrolling out of section)
    function resetAssembly() {
      pieceState.forEach((s, i) => {
        s.landed = false;
        s.blueprintShown = false;
        if (sitePieces[i]) {
          sitePieces[i].classList.remove('bs-piece-in', 'bs-piece-land');
        }
      });
      blueprintGroups.forEach(g => g.classList.remove('bp-draw', 'bp-fade'));
      activeOrbs.forEach(o => { if (o.parentNode) o.parentNode.removeChild(o); });
      activeOrbs = [];
      if (buildSite) buildSite.classList.remove('bs-cta-hovered');
    }

    // Drive assembly progress (0..1) — chains blueprint → orb → land per piece
    let assemblyProgress = -1;
    function setAssemblyProgress(t) {
      if (sitePieces.length === 0) return;
      const N = sitePieces.length;
      // Reverse if scrolling back significantly
      if (t < assemblyProgress - 0.05) {
        // Unwind landed pieces beyond current threshold
        sitePieces.forEach((p, i) => {
          const myT = (i + 0.6) / N;
          if (t < myT - 0.08 && pieceState[i].landed) {
            pieceState[i].landed = false;
            pieceState[i].blueprintShown = false;
            p.classList.remove('bs-piece-in', 'bs-piece-land');
            const bp = blueprintGroups.find(g => g.dataset.for === p.dataset.piece);
            if (bp) bp.classList.remove('bp-draw', 'bp-fade');
          }
        });
      }
      assemblyProgress = t;
      // For each piece, fire blueprint at threshold-0.10, deliver at threshold
      sitePieces.forEach((p, i) => {
        const arriveT  = (i + 0.85) / N;
        const blueT    = arriveT - 0.10;
        if (t >= blueT && !pieceState[i].blueprintShown) {
          showBlueprint(i);
        }
        if (t >= arriveT && !pieceState[i].landed) {
          const fromMap = { left:'left', right:'right', top:'top', bottom:'bottom' };
          spawnDeliveryOrb(i, fromMap[p.dataset.from] || 'top');
        }
      });
    }

    let currentPhase = -1;
    function setPhase(p) {
      if (p === currentPhase) return;
      const prevPhase = currentPhase;
      currentPhase = p;

      buildStage.setAttribute('data-phase', String(p));
      buildFrame.classList.toggle('bf-shipped', p === 3);

      // Code overlay only visible in phase 2
      blCode.classList.toggle('bl-show', p === 2);

      // Phase track
      phaseRows.forEach((row, i) => {
        row.classList.toggle('bp-active', i === p);
        row.classList.toggle('bp-done', i < p);
      });

      // Caption flip animation
      buildCaption.classList.add('bc-flip');
      setTimeout(() => {
        const copy = PHASE_COPY[p] || PHASE_COPY[0];
        bcEyebrow.textContent = copy.eyebrow;
        bcTitle.textContent   = copy.title;
        bcBody.textContent    = copy.body;
        if (bcNotes) bcNotes.textContent = copy.notes || '';
        btPhase.textContent   = copy.ph;
        if (bfRailText) bfRailText.textContent = copy.rail;
        flickerVal(btPhase);
        buildCaption.classList.remove('bc-flip');
      }, 220);

      if (p === 0) kickCamera(0, -2, -0.8, 0.6, 0.004);
      if (p === 1) kickCamera(0, -6, -1.4, 1.1, 0.008);
      if (p === 2) kickCamera(0, -5, -1.8, -1.3, 0.01);
      if (p === 3) kickCamera(0, -10, -2.6, 0, 0.018);

      // Cursor demo runs in phase 3 (render phase = ship buildup actually no, phase 2 in old, 3 here is ship)
      // We'll start the cursor when assembly is mostly complete (phase 2 = code, but pieces are already there)
      // Actually cursor should run during phase 2 (code) OR during the assembly phase 1 once everything has landed
      if (p === 2) {
        // start a cursor demo on the now-built site (slight delay to let glitch finish)
        setTimeout(startCursorDemo, 600);
      } else {
        stopCursorDemo();
      }

      // Phase transition effects
      if (prevPhase >= 0 && p > prevPhase) {
        if (prevPhase === 0 && p === 1) fireSweep();
        else if (prevPhase === 1 && p === 2) {
          fireGlitch();
          setTimeout(fireSweep, 100);
        }
        else if (prevPhase === 2 && p === 3) {
          fireSweep();
          setTimeout(fireShipParticles, 80);
        }
      }

      // Deploy badge
      if (p === 3) {
        btDeploy.textContent = 'LIVE';
        btDeploy.classList.add('bt-live');
        flickerVal(btDeploy);
        if (bfRail) bfRail.classList.add('bf-rail-shipped');
      } else {
        btDeploy.textContent = 'PENDING';
        btDeploy.classList.remove('bt-live');
        if (bfRail) bfRail.classList.remove('bf-rail-shipped');
      }
    }

    // Build elapsed timer + sparkline + cpu/size telemetry
    let buildStartTime = 0;
    let sparkData = [];
    function tickTelemetry() {
      if (currentPhase < 0) return;
      // Elapsed
      if (buildStartTime === 0) buildStartTime = performance.now();
      const elapsed = (performance.now() - buildStartTime) / 1000;
      const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
      if (bfRailTime) bfRailTime.textContent = mm + ':' + ss;
      // CPU usage — fake but believable curve per phase
      const cpuBase = currentPhase === 1 ? 60 : currentPhase === 2 ? 78 : currentPhase === 3 ? 22 : 12;
      const cpu = Math.max(2, Math.min(99, cpuBase + (Math.sin(elapsed * 1.7) * 12) + (Math.random() - 0.5) * 8));
      btCpu.textContent = String(Math.round(cpu)).padStart(2, '0') + ' %';
      // Bundle size grows through code & render
      const sizeBase = currentPhase === 0 ? 4 : currentPhase === 1 ? 12 + (codeLines.length ? Array.from(codeLines).filter(l => l.classList.contains('ct-typed')).length * 0.6 : 0) : currentPhase === 2 ? 28 : 32;
      btSize.textContent = sizeBase.toFixed(1) + ' kb';
      // Sparkline
      sparkData.push(cpu);
      if (sparkData.length > 30) sparkData.shift();
      if (btSpark) {
        const pts = sparkData.map((v, i) => {
          const x = (i / 29) * 100;
          const y = 30 - (v / 100) * 28;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
        btSpark.setAttribute('points', pts);
      }
    }
    setInterval(tickTelemetry, 180);

    // Populate headline with word-wrapped spans for staggered reveal
    const HEADLINE_TEXT = [
      'Organic code.',
      'Not a template',
      'with your logo on it.',
    ];
    HEADLINE_TEXT.forEach(text => {
      const line = document.createElement('span');
      line.style.display = 'block';
      text.split(' ').forEach((word, wi) => {
        const wrap = document.createElement('span');
        wrap.className = 'vhl-word';
        const inner = document.createElement('span');
        inner.className = 'vhl-inner';
        inner.textContent = (wi > 0 ? ' ' : '') + word + ' ';
        wrap.appendChild(inner);
        line.appendChild(wrap);
      });
      headline.appendChild(line);
    });

    // ── SIZE CANVASES ──
    const sw   = document.getElementById('shockwave-canvas');
    const swCtx = sw.getContext('2d');
    const tc   = document.getElementById('tunnel-canvas');
    const tCtx = tc.getContext('2d');
    const sc   = document.getElementById('speed-canvas');
    const sCtx = sc.getContext('2d');

    const sizeCanvases = () => {
      const w = fc.parentElement.offsetWidth || window.innerWidth;
      const h = fc.parentElement.offsetHeight || window.innerHeight;
      // fc is 110% size for zoom headroom
      fc.width = Math.ceil(w * 1.15); fc.height = Math.ceil(h * 1.15);
      sw.width  = w; sw.height  = h;
      tc.width  = w; tc.height  = h;
      sc.width  = w; sc.height  = h;
    };
    sizeCanvases(); window.addEventListener('resize', sizeCanvases);

    const baCtx = buildAtmosphere ? buildAtmosphere.getContext('2d') : null;
    let atmoParticles = [];
    function initAtmosphere() {
      if (!buildAtmosphere || !baCtx) return;
      const rect = buildAtmosphere.parentElement.getBoundingClientRect();
      buildAtmosphere.width = Math.max(1, Math.round(rect.width));
      buildAtmosphere.height = Math.max(1, Math.round(rect.height));
      atmoParticles = Array.from({ length: 56 }, () => ({
        x: Math.random() * buildAtmosphere.width,
        y: Math.random() * buildAtmosphere.height,
        z: 0.2 + Math.random() * 0.8,
        size: 0.6 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.12,
        vy: 0.12 + Math.random() * 0.38,
        twinkle: Math.random() * Math.PI * 2,
      }));
    }
    initAtmosphere();
    window.addEventListener('resize', initAtmosphere);

    function drawAtmosphere() {
      if (!buildAtmosphere || !baCtx) {
        requestAnimationFrame(drawAtmosphere);
        return;
      }
      const W = buildAtmosphere.width;
      const H = buildAtmosphere.height;
      baCtx.clearRect(0, 0, W, H);

      const phaseBoost = currentPhase < 0 ? 0 : currentPhase / 3;
      const horizonY = H * (0.48 - displayRatio * 0.05);
      const horizonGlow = baCtx.createRadialGradient(W * 0.5, horizonY, 0, W * 0.5, horizonY, Math.min(W, H) * 0.48);
      horizonGlow.addColorStop(0, `rgba(240,99,90,${(0.1 + phaseBoost * 0.16).toFixed(3)})`);
      horizonGlow.addColorStop(0.35, `rgba(244,162,97,${(0.06 + phaseBoost * 0.08).toFixed(3)})`);
      horizonGlow.addColorStop(1, 'rgba(244,162,97,0)');
      baCtx.fillStyle = horizonGlow;
      baCtx.fillRect(0, 0, W, H);

      const lineAlpha = Math.max(0, Math.min(0.3, displayRatio * 0.28));
      baCtx.strokeStyle = `rgba(43,37,71,${lineAlpha.toFixed(3)})`;
      baCtx.lineWidth = 1;
      for (let i = -8; i <= 8; i++) {
        const sx = W * 0.5 + i * W * 0.06;
        baCtx.beginPath();
        baCtx.moveTo(sx, H);
        baCtx.lineTo(W * 0.5 + i * W * 0.012, horizonY);
        baCtx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const y = horizonY + Math.pow(i / 7, 1.9) * (H - horizonY);
        baCtx.beginPath();
        baCtx.moveTo(W * 0.16, y);
        baCtx.quadraticCurveTo(W * 0.5, y - 16 + i * 4, W * 0.84, y);
        baCtx.stroke();
      }

      atmoParticles.forEach(p => {
        p.twinkle += 0.02 + p.z * 0.01;
        p.x += p.vx + Math.sin(p.twinkle) * 0.08;
        p.y += p.vy + displayRatio * p.z * 0.8;
        if (p.y > H + 8) { p.y = -10; p.x = Math.random() * W; }
        if (p.x < -12) p.x = W + 12;
        if (p.x > W + 12) p.x = -12;
        const alpha = (0.05 + p.z * 0.22 + Math.sin(p.twinkle) * 0.02) * Math.max(0.1, displayRatio);
        baCtx.fillStyle = `rgba(${p.z > 0.65 ? '240,99,90' : '43,37,71'},${alpha.toFixed(3)})`;
        baCtx.beginPath();
        baCtx.arc(p.x, p.y, p.size * (0.85 + phaseBoost * 0.5), 0, Math.PI * 2);
        baCtx.fill();
      });

      requestAnimationFrame(drawAtmosphere);
    }
    requestAnimationFrame(drawAtmosphere);

    // ── PERSPECTIVE GRID + FALLING CODE COLUMNS ──
    // A vanishing-point grid floor/ceiling rushes toward the viewer as they scroll.
    // Columns of code glyphs fall through it — like rain through venetian blinds.
    // Grounded, cinematic, not trippy.

    const GLYPHS = ['</', '/>', '{}', '()', '=>', '&&', '//', '[]', '+=', 'fn',
                    'px', 'vh', 'rem', '/*', '*/', '00', '01', '10', '11', ';;'];

    // Code column particles — gentle ambient drift, kept far from screen centre so
    // they don't compete with the build frame
    const COL_COUNT = 14;
    let cols = [];

    function initCols() {
      cols = [];
      const W = fc.width, H = fc.height;
      for (let i = 0; i < COL_COUNT; i++) {
        cols.push(mkCol(W, H, true));
      }
    }

    function mkCol(W, H, preplace) {
      // Bias columns toward edges of the screen, leaving the centre clear for the frame
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const laneX = side === 'left'
        ? Math.random() * W * 0.22
        : W - Math.random() * W * 0.22;
      return {
        x:     laneX,
        y:     preplace ? Math.random() * H : -20,
        speed: 0.4 + Math.random() * 0.9,
        glyphs: Array.from({ length: 6 + Math.floor(Math.random() * 8) }, () =>
          GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        ),
        spacing: 16 + Math.random() * 6,
        alpha:  0.10 + Math.random() * 0.22,
        size:   9 + Math.random() * 4,
        accent: Math.random() < 0.15,
        headBright: 1 + Math.floor(Math.random() * 2),
      };
    }

    initCols();
    window.addEventListener('resize', initCols);

    let fcRaf, fcRunning = false;
    let diveRatio = 0;
    let impactFired = false;

    function drawFC() {
      const W = fc.width, H = fc.height;

      fCtx.clearRect(0, 0, W, H);

      // Gentle drift only — the build frame is the centerpiece, this is ambient
      const speed = 0.7 + diveRatio * 0.8;
      const vis = Math.min(1, diveRatio / 0.10);

      // ── FALLING CODE COLUMNS ──
      cols.forEach((col, ci) => {
        col.y += col.speed * speed;
        const totalH = col.glyphs.length * col.spacing;
        if (col.y - totalH > H + 40) {
          cols[ci] = mkCol(W, H, false);
          return;
        }

        col.glyphs.forEach((sym, gi) => {
          const gy = col.y - gi * col.spacing;
          if (gy < -col.spacing || gy > H + col.spacing) return;

          // Head glyphs are bright, trail fades
          const isBright = gi < col.headBright;
          const trailFade = isBright ? 1 : Math.max(0, 1 - (gi - col.headBright) / (col.glyphs.length - col.headBright));
          const a = col.alpha * trailFade * vis;
          if (a < 0.008) return;

          fCtx.globalAlpha = a;
          fCtx.font = `500 ${col.size}px "JetBrains Mono", monospace`;

          if (col.accent && isBright) {
            fCtx.fillStyle = '#F0635A';
          } else if (isBright) {
            fCtx.fillStyle = '#2B2547';
          } else {
            // Fading trail: plum to coral gradient per-glyph
            const mix = 1 - trailFade;
            const r = Math.round(43  + (240 - 43)  * mix);
            const g = Math.round(37  + (99  - 37)  * mix);
            const b = Math.round(71  + (90  - 71)  * mix);
            fCtx.fillStyle = `rgb(${r},${g},${b})`;
          }

          fCtx.textAlign = 'center';
          fCtx.textBaseline = 'middle';
          fCtx.fillText(sym, col.x, gy);
        });
        fCtx.globalAlpha = 1;
      });

      fcRaf = requestAnimationFrame(drawFC);
    }

    // ── TUNNEL CANVAS — unused in new design, kept for shockwave z-ordering ──
    function drawTunnel() {
      tCtx.clearRect(0, 0, tc.width, tc.height);
      requestAnimationFrame(drawTunnel);
    }
    tCtx.clearRect(0, 0, tc.width, tc.height);

    // ── SPEED STREAKS — horizontal blurs shoot across on impact ──
    let streaks = [];
    let streakRaf = null;
    let streaksRunning = false;

    function spawnStreaks(count) {
      const W = sc.width, H = sc.height;
      for (let i = 0; i < count; i++) {
        // Streaks shoot horizontally left or right from random Y
        const goRight = Math.random() < 0.5;
        streaks.push({
          x:     goRight ? 0 : W,
          y:     H * (0.1 + Math.random() * 0.8),
          vx:    (goRight ? 1 : -1) * (30 + Math.random() * 55),
          len:   60 + Math.random() * 200,
          alpha: 0.35 + Math.random() * 0.50,
          width: 0.5 + Math.random() * 1.8,
          hue:   Math.random() < 0.65 ? '240,99,90' : '43,37,71',
          life:  1.0,
          decay: 0.022 + Math.random() * 0.028,
        });
      }
      startStreaks();
    }

    function drawStreaks() {
      const W = sc.width, H = sc.height;
      sCtx.clearRect(0, 0, W, H);

      streaks = streaks.filter(s => s.life > 0.02);
      streaks.forEach(s => {
        s.x    += s.vx;
        s.life -= s.decay;
        const a = s.alpha * Math.pow(s.life, 1.2);
        if (a < 0.008 || s.x < -s.len || s.x > W + s.len) return;

        const x2 = s.x + (s.vx > 0 ? -s.len : s.len) * s.life;
        const g = sCtx.createLinearGradient(s.x, s.y, x2, s.y);
        g.addColorStop(0,   `rgba(${s.hue},${a.toFixed(3)})`);
        g.addColorStop(0.6, `rgba(${s.hue},${(a * 0.4).toFixed(3)})`);
        g.addColorStop(1,   `rgba(${s.hue},0)`);
        sCtx.beginPath();
        sCtx.moveTo(s.x, s.y);
        sCtx.lineTo(x2, s.y);
        sCtx.strokeStyle = g;
        sCtx.lineWidth = s.width;
        sCtx.stroke();
      });

      if (streaks.length) {
        streakRaf = requestAnimationFrame(drawStreaks);
      } else {
        streaksRunning = false;
        streakRaf = null;
      }
    }
    function startStreaks() {
      if (streaksRunning) return;
      streaksRunning = true;
      streakRaf = requestAnimationFrame(drawStreaks);
    }

    // ── SHOCKWAVE RINGS — concentric ink circles on impact ──
    let rings = [];
    let swRaf;
    let swRunning = false;

    function fireShockwave() {
      const cx = sw.width / 2, cy = sw.height / 2;
      const sets = [
        { color: '240,99,90', count: 4, speedBase: 5,  alphaBase: 0.65, lw: 2.0 },
        { color: '43,37,71',  count: 3, speedBase: 10, alphaBase: 0.40, lw: 1.0 },
        { color: '244,162,97',count: 2, speedBase: 18, alphaBase: 0.50, lw: 1.5 },
      ];
      let delay = 0;
      sets.forEach(set => {
        for (let i = 0; i < set.count; i++) {
          setTimeout(() => {
            rings.push({
              cx, cy, r: 0,
              maxR:  Math.max(sw.width, sw.height) * 0.88,
              alpha: set.alphaBase - i * 0.07,
              lineW: set.lw,
              speed: set.speedBase + i * 4,
              color: set.color,
            });
          }, delay + i * 50);
        }
        delay += 75;
      });
    }

    function drawSW() {
      swCtx.clearRect(0, 0, sw.width, sw.height);
      rings = rings.filter(r => r.r < r.maxR);
      rings.forEach(ring => {
        ring.r += ring.speed;
        const t = ring.r / ring.maxR;
        const a = ring.alpha * Math.pow(1 - t, 1.8);
        if (a < 0.005) return;
        swCtx.beginPath();
        swCtx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2);
        swCtx.strokeStyle = `rgba(${ring.color},${a.toFixed(3)})`;
        swCtx.lineWidth = ring.lineW * (1 - t * 0.4);
        swCtx.stroke();
        swCtx.beginPath();
        swCtx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2);
        swCtx.strokeStyle = `rgba(${ring.color},${(a * 0.15).toFixed(3)})`;
        swCtx.lineWidth = ring.lineW * 7 * (1 - t);
        swCtx.stroke();
      });
      swRaf = requestAnimationFrame(drawSW);
    }

    // ── SCREEN SHAKE ──
    function screenShake(el, intensity, duration) {
      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        if (elapsed >= duration) { el.style.transform = ''; return; }
        const t = elapsed / duration;
        const decay = 1 - t;
        const dx = (Math.random() - 0.5) * intensity * 2 * decay;
        const dy = (Math.random() - 0.5) * intensity * 2 * decay;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    // ── SHIP IMPACT — fires once when build hits phase 3 (SHIPPED)
    let textRevealed = false;
    function slamText() {
      if (textRevealed) return;
      textRevealed = true;

      const stickyEl = document.getElementById('video-sticky');

      // Coral celebration flash on the screen
      const flashEl = mask;
      if (flashEl) {
        flashEl.style.background = 'rgba(240,99,90,0.18)';
        flashEl.style.mixBlendMode = 'multiply';
        flashEl.style.transition = 'none';
        flashEl.style.opacity = '1';
        setTimeout(() => {
          flashEl.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1)';
          flashEl.style.opacity = '0';
        }, 35);
      }

      // Soft screen jolt
      if (stickyEl) screenShake(stickyEl, 5, 380);
      kickCamera(0, -18, -4.8, 0.5, 0.024);

      // Shockwave + particles
      setTimeout(fireShockwave, 0);
      setTimeout(() => spawnStreaks(34), 0);
      setTimeout(() => spawnStreaks(22), 160);
      setTimeout(() => spawnStreaks(14), 320);
      setTimeout(fireShipParticles, 80);
    }

    // ── SCROLL STATE ──
    let currentRatio = 0;
    let rafPending   = false;
    let impactDone   = false;

    // Smooth display ratio (lerped) for visual effects — avoids jitter
    let displayRatio = 0;

    // Wheel/touch interception state
    let intercepting = false;
    let animDone = false;      // permanent — once animation finishes, never intercept again
    let virtualScrolled = 0;
    let touchStartY = 0;
    let scrollWritePending = false;
    let pendingScrollTop = 0;
    let doneLockUntil = null; // timestamp — hold at ratio=1 for a beat before releasing

    function scheduleScrollTo(top) {
      pendingScrollTop = top;
      if (scrollWritePending) return;
      scrollWritePending = true;
      requestAnimationFrame(() => {
        scrollWritePending = false;
        window.scrollTo({ top: pendingScrollTop, behavior: 'instant' });
      });
    }

    function applyReveal() {
      rafPending = false;
      const ratio = currentRatio;

      // Responsive but smooth lerp so the build follows scroll without stutter
      displayRatio += (ratio - displayRatio) * 0.32;
      if (Math.abs(displayRatio - ratio) < 0.002) displayRatio = ratio;
      diveRatio = displayRatio;

      // Start ambient rain + shockwave system on entry
      if (ratio > 0 && !fcRunning) { fcRunning = true; drawFC(); drawSW(); swRunning = true; }
      if (ratio <= 0 && fcRunning) {
        fcRunning = false; swRunning = false;
        cancelAnimationFrame(fcRaf); cancelAnimationFrame(swRaf);
        swCtx.clearRect(0, 0, sw.width, sw.height);
        diveRatio = 0; displayRatio = 0;
        fc.style.opacity = '0';
        buildStage.classList.remove('bs-in');
        buildStage.removeAttribute('data-phase');
        currentPhase = -1;
        buildStartTime = 0;
        sparkData = [];
        assemblyProgress = -1;
        stopCursorDemo();
        resetAssembly();
        codeLines.forEach(l => l.classList.remove('ct-typed'));
        if (bcProgressFill) bcProgressFill.style.width = '0%';
        targetCamera.shiftX = 0;
        targetCamera.shiftY = 0;
        targetCamera.rotX = 0;
        targetCamera.rotY = 0;
        targetCamera.scale = 1;
      }

      const bsIn = displayRatio > 0.04;
      buildStage.classList.toggle('bs-in', bsIn);

      // Tiny letterbox just for cinematic framing
      const lbT = Math.max(0, Math.min(1, (displayRatio - 0.04) / 0.18));
      const lbH = Math.round(lbT * lbT * 28);
      lbTop.style.height    = lbH + 'px';
      lbBottom.style.height = lbH + 'px';

      // Background ambient rain — minimal
      const fcA = Math.max(0, Math.min(0.4, (displayRatio - 0.06) / 0.20));
      fc.style.opacity = fcA.toFixed(3);

      const driftX = Math.sin(displayRatio * Math.PI * 1.15) * 18;
      const driftY = Math.cos(displayRatio * Math.PI * 1.6) * -10 - displayRatio * 18;
      const rotY = (displayRatio - 0.5) * 8 + Math.sin(displayRatio * 8) * 1.2;
      const rotX = Math.sin(displayRatio * Math.PI * 1.4) * -4.2;
      targetCamera.shiftX = driftX;
      targetCamera.shiftY = driftY;
      targetCamera.rotX = rotX;
      targetCamera.rotY = rotY;
      targetCamera.scale = 0.965 + displayRatio * 0.1;

      if (portalGlow) {
        portalGlow.style.opacity = (0.14 + Math.max(0, Math.min(0.42, displayRatio * 0.52))).toFixed(3);
      }
      if (edgeVignette) {
        edgeVignette.style.opacity = Math.max(0, Math.min(0.72, displayRatio * 0.82)).toFixed(3);
      }
      if (scanlines) {
        scanlines.style.opacity = Math.max(0, Math.min(0.22, (displayRatio - 0.42) * 0.55)).toFixed(3);
      }
      if (mask) {
        mask.style.opacity = Math.max(0, Math.min(0.44, displayRatio * 0.36 + cameraState.impulse * 0.2)).toFixed(3);
      }

      // ── PHASE GATING ──
      // 0.04→0.18 BLUEPRINT (frame settles, atmospheric warmup)
      // 0.18→0.62 ASSEMBLE (the meat — pieces fly in)
      // 0.62→0.82 CODE (overlay appears, types out, dissolves)
      // 0.82→1.00 SHIPPED (final glow, deploy stamp)
      let p;
      if      (displayRatio < 0.16) p = 0;
      else if (displayRatio < 0.58) p = 1;
      else if (displayRatio < 0.80) p = 2;
      else                          p = 3;
      if (bsIn) setPhase(p);

      // ── ASSEMBLY: 0.16 → 0.60 maps to assemblyT 0..1 ──
      const assemT = Math.max(0, Math.min(1, (displayRatio - 0.13) / 0.49));
      setAssemblyProgress(assemT);

      // ── CODE OVERLAY: 0.62 → 0.80 maps to typing 0..1 ──
      if (p === 2) {
        const codeT = (displayRatio - 0.58) / 0.20;
        const totalLines = codeLines.length;
        const visibleLines = Math.floor(codeT * totalLines);
        codeLines.forEach((line, i) => {
          line.classList.toggle('ct-typed', i <= visibleLines);
        });
        const lineCount = Math.min(totalLines, visibleLines + 1) * 3 + 12;
        btLines.textContent = String(lineCount).padStart(3, '0');
        positionCursor(visibleLines);
      } else if (p < 2) {
        codeLines.forEach(line => line.classList.remove('ct-typed'));
        btLines.textContent = '000';
      } else {
        codeLines.forEach(line => line.classList.add('ct-typed'));
        btLines.textContent = String(codeLines.length * 3 + 12).padStart(3, '0');
      }

      // Render telemetry % — driven by assembly progress
      const renderPct = Math.min(100, Math.round(assemT * 100));
      btRender.textContent = renderPct + ' %';
      btRender.classList.toggle('bt-live', renderPct === 100);
      if (bcProgressFill) bcProgressFill.style.width = (displayRatio * 100).toFixed(1) + '%';

      // ── PHASE 3: SHIP impact (one-shot) ──
      if (p === 3 && !impactDone) {
        impactDone = true;
        slamText();
      }
      if (p < 3 && impactDone) {
        impactDone = false;
      }

      // Build percentage HUD
      if (displayRatio > 0.04) {
        depthHud.style.opacity = Math.min(1, (displayRatio - 0.04) / 0.10).toFixed(3);
        depthVal.textContent = String(Math.round(displayRatio * 100)).padStart(3, '0');
      } else {
        depthHud.style.opacity = '0';
      }

      // No mid-section fade-out anymore — the device IS the punchline
      buildFrame.style.opacity = '';

      const pct = Math.round(ratio * 100);
      progressFill.style.width = pct + '%';
      progressLabel.textContent = String(pct).padStart(3, '0') + '%';

      // Keep ticking while lerp catches up
      if (fcRunning && Math.abs(displayRatio - ratio) > 0.001) {
        rafPending = true;
        requestAnimationFrame(applyReveal);
      }
    }

    // Position the blinking cursor at the end of the last typed line's content
    function positionCursor(lineIdx) {
      const cursor = document.getElementById('code-cursor');
      if (!cursor || lineIdx < 0 || lineIdx >= codeLines.length) return;
      const line = codeLines[lineIdx];
      if (!line) return;
      const content = line.querySelector('.ct-content') || line;
      const cRect = content.getBoundingClientRect();
      const codeRect = blCode.getBoundingClientRect();
      cursor.style.left = (cRect.right - codeRect.left + 2) + 'px';
      cursor.style.top  = (cRect.top   - codeRect.top  + 2) + 'px';
    }

    // ── Compute ratio from real scroll position (used for nav jumps / fallback) ──
    function getRatioFromScroll() {
      if (!revealSection) return 0;
      const rect  = revealSection.getBoundingClientRect();
      const total = revealSection.offsetHeight - window.innerHeight;
      return Math.max(0, Math.min(1, -rect.top / total));
    }

    function setRatio(r) {
      currentRatio = Math.max(0, Math.min(1, r));
      if (!rafPending) { rafPending = true; requestAnimationFrame(applyReveal); }
    }

    // ── Intercept wheel while animation is in progress ──
    function onWheel(e) {
      if (window._navJumping || animDone) return;

      const rect = revealSection ? revealSection.getBoundingClientRect() : null;
      if (!rect) return;

      const inSection = rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (!inSection) return;

      // Section is filling the viewport — intercept unconditionally until animDone
      e.preventDefault();

      // In the hold window: absorb events silently, then release permanently
      if (doneLockUntil !== null) {
        if (performance.now() >= doneLockUntil) {
          animDone = true;
          doneLockUntil = null;
          // Scroll past the section end so native scroll continues naturally
          if (revealSection) {
            const sectionEnd = revealSection.offsetTop + revealSection.offsetHeight - window.innerHeight;
            scheduleScrollTo(sectionEnd + 1);
          }
        }
        return;
      }

      // Mid-animation — drive ratio from wheel delta
      intercepting = true;
      const total = revealSection.offsetHeight - window.innerHeight;
      const rawDelta = e.deltaY;
      const normalized = e.deltaMode === 1 ? rawDelta * 30
                       : e.deltaMode === 2 ? rawDelta * 300
                       : rawDelta;
      const capped = Math.max(-160, Math.min(160, normalized));
      virtualScrolled = Math.max(0, Math.min(total, virtualScrolled + capped));
      const newRatio = virtualScrolled / total;

      setRatio(newRatio);

      // Hit the end — arm the hold timer
      if (newRatio >= 1 && doneLockUntil === null) {
        doneLockUntil = performance.now() + 350;
      }

      scheduleScrollTo(revealSection.offsetTop + virtualScrolled);
    }

    // ── Touch support ──
    function onTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e) {
      if (window._navJumping) return;
      const rect = revealSection ? revealSection.getBoundingClientRect() : null;
      if (!rect) return;
      const inSection = rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (!inSection || currentRatio >= 1) return;

      e.preventDefault();
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      const total = revealSection.offsetHeight - window.innerHeight;
      virtualScrolled = Math.max(0, Math.min(total, virtualScrolled + dy * 1.4));
      setRatio(virtualScrolled / total);

      if (revealSection) {
        const sectionTop = revealSection.offsetTop;
        scheduleScrollTo(sectionTop + virtualScrolled);
      }
    }

    // ── Fallback: real scroll events (keyboard, scrollbar, programmatic) ──
    function onScroll() {
      if (!revealSection || window._navJumping) return;

      const rect  = revealSection.getBoundingClientRect();
      const total = revealSection.offsetHeight - window.innerHeight;

      // Fast-scroll overshoot guard: if animation isn't done and user has scrolled
      // past the section bottom, snap them back to the section end instantly
      if (!animDone && rect.bottom < window.innerHeight) {
        scheduleScrollTo(revealSection.offsetTop + total);
        setRatio(1);
        virtualScrolled = total;
        if (doneLockUntil === null) doneLockUntil = performance.now() + 350;
        return;
      }

      if (!intercepting) {
        const r = Math.max(0, Math.min(1, -rect.top / total));
        setRatio(r);
        virtualScrolled = r * total;
      }
    }

    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !fcRunning) {
          fcRunning = true; swRunning = true; drawFC(); drawSW();
          // Sync virtual scroll when we enter
          const total = revealSection.offsetHeight - window.innerHeight;
          const r = getRatioFromScroll();
          virtualScrolled = r * total;
          currentRatio = r;
        }
        if (!e.isIntersecting && e.boundingClientRect.top > 0) {
          // Scrolled back above — full reset
          intercepting = false;
          animDone = false;
          virtualScrolled = 0;
          currentRatio = 0;
          doneLockUntil = null;
        }
      });
    }, { threshold: 0 });
    if (revealSection) sectionObs.observe(revealSection);

    // Block keyboard scroll keys while animation is running
    function onKeyDown(e) {
      if (window._navJumping || animDone) return;
      const keys = { ' ': 1, PageDown: 1, PageUp: 1, ArrowDown: 1, ArrowUp: 1, End: 1 };
      if (!keys[e.key]) return;
      const rect = revealSection ? revealSection.getBoundingClientRect() : null;
      if (!rect) return;
      // Only block when we own the viewport
      const nearSection = rect.top <= 10 && rect.bottom > 0;
      if (!nearSection) return;
      e.preventDefault();
    }

    // Non-passive wheel listener so we can preventDefault mid-animation
    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('scroll',     onScroll,     { passive: true  });
    window.addEventListener('keydown',    onKeyDown,    { passive: false });
    onScroll();

    window._videoRevealUnlock = () => {
      intercepting = false;
      animDone = true;
      doneLockUntil = null;
      currentRatio = 1;
      virtualScrolled = revealSection ? revealSection.offsetHeight - window.innerHeight : 0;
    };
  }

  function jumpToSection(targetId) {
    const target = document.getElementById(targetId);
    const reveal = document.getElementById('video-reveal');
    if (!target) return;

    /* Kill any active lock */
    if (window._videoRevealUnlock) window._videoRevealUnlock();

    /* Set nav-jump flag — this silences the scroll lock for the whole journey */
    window._navJumping = true;

    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const revealEnd = reveal ? reveal.offsetTop + reveal.offsetHeight : 0;

    /* If we have to cross the video-reveal section, skip past it instantly
       so our smooth scroll never enters the lockable range mid-flight */
    if (reveal && window.scrollY < revealEnd && targetTop > revealEnd) {
      window.scrollTo({ top: revealEnd + 2, behavior: 'instant' });
    }

    /* Small rAF gap lets the instant jump settle before smooth takes over */
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      /* Clear the flag after enough time for smooth scroll to finish */
      setTimeout(() => { window._navJumping = false; }, 1200);
    });
  }

  function jumpToPricing(e) {
    e && e.preventDefault();
    jumpToSection('pricing');
  }

  function jumpToContact(e) {
    e && e.preventDefault();
    jumpToSection('contact');
  }

  /* ── 9. PRICING — canvas + scroll reveals ── */
  {
    const pricingSection = document.getElementById('pricing');

    // Canvas
    const pc = document.getElementById('pricing-canvas');
    if (pc && pricingSection) {
      const ctx = pc.getContext('2d');
      // Size canvas from parent section, not itself (it's position:absolute)
      const resize = () => {
        pc.width  = pricingSection.offsetWidth;
        pc.height = pricingSection.offsetHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      const SYMS = ['$500','$1,200','$50/mo','</>','{}','→','fn()','px','rem','//','&&','::','*','#'];
      const particles = Array.from({length: 32}, () => ({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00010,
        vy: 0.00005 + Math.random() * 0.00010,
        sym: SYMS[Math.floor(Math.random() * SYMS.length)],
        alpha: 0.03 + Math.random() * 0.07,
        size: 10 + Math.random() * 10,
      }));

      let pcRunning = false;
      function drawPricing() {
        if (!pcRunning) return;
        ctx.clearRect(0, 0, pc.width, pc.height);
        const now = Date.now() * 0.001;
        particles.forEach(p => {
          p.x += p.vx + Math.sin(now * 0.3 + p.y * 5) * 0.00006;
          p.y += p.vy;
          if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); p.sym = SYMS[Math.floor(Math.random() * SYMS.length)]; }
          if (p.x < -0.1) p.x = 1.1;
          if (p.x > 1.1) p.x = -0.1;
          ctx.font = `${p.size}px "JetBrains Mono", monospace`;
          ctx.fillStyle = `rgba(240,99,90,${p.alpha})`;
          ctx.fillText(p.sym, p.x * pc.width, p.y * pc.height);
        });
        requestAnimationFrame(drawPricing);
      }

      // Start canvas as soon as any part of the section is visible
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !pcRunning) { pcRunning = true; drawPricing(); }
        if (!entries[0].isIntersecting) pcRunning = false;
      }, { threshold: 0 }).observe(pricingSection);
    }

    // Reveal: fire as soon as the top edge of the section hits the viewport
    if (pricingSection) {
      const cards = pricingSection.querySelectorAll('.price-card');

      function triggerPricingReveal() {
        pricingSection.classList.add('in-view');
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('card-visible'), 150 + i * 130);
        });
      }

      // Use threshold:0 so it fires the moment 1px is visible
      const revealObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          triggerPricingReveal();
          revealObs.disconnect();
        }
      }, { threshold: 0 });
      revealObs.observe(pricingSection);

      // Safety fallback — if already in view on load (e.g. direct #pricing link)
      const r = pricingSection.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) triggerPricingReveal();
    }
  }

  /* ── 10. GSAP SECTION REVEALS (with GSAP + ScrollTrigger) ── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Utility: split element text into word spans
    function splitWords(el) {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span class="split-word"><span class="split-inner">${w}</span></span>`).join(' ');
      return el.querySelectorAll('.split-inner');
    }

    // Hero text entrance — lines rise in sequence, right column fades
    gsap.timeline({ delay: 0.25 })
      .from('#hero-eyebrow',   { opacity:0, x:-20, duration:0.6, ease:'power2.out' })
      .from('#hl1',            { opacity:0, y:60, duration:0.8, ease:'power3.out' }, '-=0.3')
      .from('#hl2',            { opacity:0, y:60, duration:0.8, ease:'power3.out' }, '-=0.6')
      .from('#hl3',            { opacity:0, y:60, duration:0.8, ease:'power3.out' }, '-=0.6')
      .from('.hero-tag',       { opacity:0, y:16, duration:0.5, ease:'power2.out' }, '-=0.3')
      .from('#hero-sub',       { opacity:0, y:16, duration:0.6, ease:'power2.out' }, '-=0.35')
      .from('#hero-actions',   { opacity:0, y:16, duration:0.5, ease:'power2.out' }, '-=0.3')
      .from('#hero-stats .stat', { opacity:0, y:12, stagger:0.1, duration:0.5, ease:'power2.out' }, '-=0.25')
      .from('#hero-right > *', { opacity:0, y:24, stagger:0.15, duration:0.7, ease:'power2.out' }, '-=0.5')
      .from('.hero-status-bar', { opacity:0, y:10, duration:0.5, ease:'power2.out' }, '-=0.3');

    // Section title reveals
    document.querySelectorAll('.section-title').forEach(el => {
      const spans = splitWords(el);
      gsap.from(spans, {
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        opacity: 0, y: '100%', duration: 0.8, stagger: 0.06, ease: 'power3.out'
      });
    });

    // Feature band quote
    gsap.from('.feature-quote', {
      scrollTrigger: { trigger: '.feature-band', start: 'top 70%', once: true },
      opacity: 0, x: -60, duration: 1, ease: 'power3.out'
    });
    gsap.from('.feature-list li', {
      scrollTrigger: { trigger: '.feature-band', start: 'top 70%', once: true },
      opacity: 0, x: 40, stagger: 0.12, duration: 0.7, ease: 'power2.out', delay: 0.3
    });

    // What you get — numbers count up on enter
    document.querySelectorAll('.what-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 85%', once: true },
        opacity: 0, y: 40, duration: 0.7, delay: i * 0.08, ease: 'power2.out'
      });
    });

    // Pricing header
    gsap.from('.pricing-eyebrow', {
      scrollTrigger: { trigger: '#pricing', start: 'top 80%', once: true },
      opacity: 0, x: -20, duration: 0.6, ease: 'power2.out'
    });
    gsap.from('.pricing-headline', {
      scrollTrigger: { trigger: '#pricing', start: 'top 80%', once: true },
      opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', delay: 0.1
    });
    gsap.from('.pricing-sub', {
      scrollTrigger: { trigger: '#pricing', start: 'top 80%', once: true },
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', delay: 0.25
    });

    // Pricing cards — stagger + subtle clip-path
    gsap.from('.price-card', {
      scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%', once: true },
      opacity: 0, y: 50, clipPath: 'inset(20% 0% 0% 0%)', stagger: 0.15,
      duration: 0.9, ease: 'power3.out'
    });
    gsap.from('.pricing-note', {
      scrollTrigger: { trigger: '.pricing-grid', start: 'top 60%', once: true },
      opacity: 0, y: 16, duration: 0.6, ease: 'power2.out'
    });

    // Process steps fan in
    gsap.from('.process-step', {
      scrollTrigger: { trigger: '.process-steps', start: 'top 80%', once: true },
      opacity: 0, y: 60, stagger: 0.18, duration: 0.9, ease: 'power3.out'
    });

    // CTA mega text
    gsap.from('.cta h2', {
      scrollTrigger: { trigger: '.cta', start: 'top 75%', once: true },
      opacity: 0, y: 80, duration: 1.2, ease: 'power4.out'
    });

    // Parallax blobs
    ['#blob1','#blob2','#blob3'].forEach((id, i) => {
      const el = document.querySelector(id);
      if (!el) return;
      gsap.to(el, {
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
        y: (i + 1) * -80, ease: 'none'
      });
    });

    // Orb parallax
    gsap.to('#orb1', { scrollTrigger: { scrub: 2 }, y: -120 });
    gsap.to('#orb2', { scrollTrigger: { scrub: 3 }, y:  100 });
    gsap.to('#orb3', { scrollTrigger: { scrub: 1.5 }, y: -80 });

    // Ambient blob scroll drift
    gsap.to('#ab1', { scrollTrigger: { scrub: 4 }, y: -200, x: 80 });
    gsap.to('#ab2', { scrollTrigger: { scrub: 3 }, y:  150, x: -60 });
    gsap.to('#ab3', { scrollTrigger: { scrub: 2 }, y: -100 });

    // Hero exit — content drifts up + fades as you scroll away
    gsap.to('#hero-content', {
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
      y: -80,
      opacity: 0,
      ease: 'none',
    });
    // Stats fade out faster so they don't hang at the bottom as showcase loads
    gsap.to('#hero-stats', {
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '60% top', scrub: 0.8 },
      opacity: 0, y: -20, ease: 'none',
    });
    // Hero tokens parallax slower — linger as content leaves
    gsap.to('.hero-token', {
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.8 },
      y: -40,
      opacity: 0,
      ease: 'none',
    });
    // Showcase phone rises into view — no section-level opacity, so there's never a black void
    gsap.fromTo('#sc-phone-col', { y: 50 }, {
      scrollTrigger: { trigger: '#showcase', start: 'top 70%', end: 'top 10%', scrub: 1.5 },
      y: 0, ease: 'none',
    });
    // Physics fragments drift in from slight scale
    gsap.fromTo('#sc-physics-canvas', { opacity: 0, scale: 1.05 }, {
      scrollTrigger: { trigger: '#showcase', start: 'top 80%', end: 'top 25%', scrub: 1.2 },
      opacity: 1, scale: 1, ease: 'none',
      transformOrigin: '50% 50%',
    });

    // Dive reveal — portal glow pulses on approach before section is pinned
    gsap.fromTo('#dive-portal-glow', { opacity: 0 }, {
      scrollTrigger: { trigger: '#video-reveal', start: 'top 85%', end: 'top 40%', scrub: 1.5 },
      opacity: 0.35, ease: 'none',
    });
  }


  /* ── 11. STANDARD SCROLL REVEAL (fallback for non-GSAP elements) ── */
  {
    document.querySelectorAll('.what-list, .pricing-grid').forEach(c =>
      Array.from(c.children).forEach((el, i) => { el.style.transitionDelay = (i * 0.08) + 's'; }));
    document.querySelectorAll('.process-step').forEach((el, i) => { el.style.transitionDelay = (i * 0.12) + 's'; });
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); }});
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

  /* ── BOOT ── */
  {
    const phoneSite = document.getElementById('build-site');
    const buildStageEl = document.getElementById('build-stage');
    if (phoneSite) {
      const phoneIsLive = () => buildStageEl && buildStageEl.dataset.phase === '3';
      const keepPhoneInputInside = e => {
        if (phoneIsLive()) e.stopPropagation();
      };
      phoneSite.addEventListener('wheel', keepPhoneInputInside, { passive: true });
      phoneSite.addEventListener('touchmove', keepPhoneInputInside, { passive: true });

      phoneSite.querySelectorAll('[data-phone-target]').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          if (!phoneIsLive()) return;
          const target = phoneSite.querySelector('#' + link.dataset.phoneTarget);
          if (!target) return;
          const siteRect = phoneSite.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          phoneSite.scrollTo({
            top: phoneSite.scrollTop + targetRect.top - siteRect.top - 54,
            behavior: 'smooth'
          });
        });
      });

      const phoneForm = phoneSite.querySelector('.bs-book-form');
      if (phoneForm) {
        phoneForm.addEventListener('submit', e => {
          e.preventDefault();
          if (!phoneIsLive()) return;
          const data = new FormData(phoneForm);
          const note = phoneForm.querySelector('.bs-form-note');
          if (note) note.textContent = 'Opening email draft...';
          const subject = 'North & Needle fitting request from ' + (data.get('name') || 'website visitor');
          const body = [
            'Name: ' + (data.get('name') || ''),
            'Email: ' + (data.get('email') || ''),
            'Service: ' + (data.get('service') || ''),
            '',
            'Notes:',
            data.get('notes') || ''
          ].join('\n');
          window.location.href = 'mailto:hello@northandneedle.com?subject=' +
            encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        });
      }
    }
  }

  switchPhoneTpl(0);

  