(function () {
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (error) {}
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('motion-ready');
  window.__cmcOpeningComplete = reduced;
  if (!reduced) window.scrollTo(0, 0);

  if (!reduced) {
    const opening = document.createElement('div');
    opening.className = 'cmc-opening';
    opening.innerHTML = '<div class="cmc-opening__top"><span>Film Department</span><span>Visual Index / 2026</span></div><div class="cmc-opening__mark"><canvas class="cmc-opening__particles" aria-label="CMC"></canvas></div><div class="cmc-opening__bottom"><span class="cmc-opening__label">Loading experience</span><span class="cmc-opening__progress">000</span></div><div class="cmc-opening__line"></div>';
    document.body.appendChild(opening);
    const progress = opening.querySelector('.cmc-opening__progress');
    const createParticleText = () => {
      const canvas = opening.querySelector('.cmc-opening__particles');
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return () => {};
      let particles = [];
      let frame = 0;
      let lastFrame = 0;
      let width = 0;
      let height = 0;
      let startedAt = performance.now() + 180;
      const maxParticles = window.innerWidth < 700 ? 850 : 1400;
      const palette = ['#0ea5e9', '#22d3ee', '#10b981'];
      const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
      const ease = value => 1 - Math.pow(1 - value, 3);

      const build = () => {
        const rect = canvas.getBoundingClientRect();
        width = Math.max(1, Math.floor(rect.width));
        height = Math.max(1, Math.floor(rect.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const sample = document.createElement('canvas');
        const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
        if (!sampleCtx) return;
        let size = Math.min(height * .8, width / 3.05);
        sampleCtx.font = `900 ${size}px Arial Black, Inter, sans-serif`;
        const measured = sampleCtx.measureText('CMC').width;
        size *= Math.min(1, (width * .9) / measured);
        sampleCtx.font = `900 ${size}px Arial Black, Inter, sans-serif`;
        const metrics = sampleCtx.measureText('CMC');
        const firstCWidth = sampleCtx.measureText('C').width;
        const firstCMWidth = sampleCtx.measureText('CM').width;
        const textWidth = Math.ceil(metrics.width);
        const textHeight = Math.ceil((metrics.actualBoundingBoxAscent || size * .76) + (metrics.actualBoundingBoxDescent || size * .22));
        sample.width = textWidth + 16;
        sample.height = textHeight + 16;
        sampleCtx.font = `900 ${size}px Arial Black, Inter, sans-serif`;
        sampleCtx.fillStyle = '#fff';
        sampleCtx.textBaseline = 'alphabetic';
        sampleCtx.fillText('CMC', 8, 8 + (metrics.actualBoundingBoxAscent || size * .76));
        const pixels = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
        const targets = [];
        const step = window.innerWidth < 700 ? 7 : 6;
        for (let y = 0; y < sample.height; y += step) {
          for (let x = 0; x < sample.width; x += step) {
            if (pixels[(y * sample.width + x) * 4 + 3] > 60) {
              const charIndex = x < 8 + firstCWidth ? 0 : x < 8 + firstCMWidth ? 1 : 2;
              targets.push({ x: width / 2 - sample.width / 2 + x, y: height / 2 - sample.height / 2 + y, charIndex });
            }
          }
        }
        const stride = Math.max(1, Math.ceil(targets.length / maxParticles));
        particles = targets.filter((_, index) => index % stride === 0).map((target, index) => {
          const seed = ((index * 9301 + 49297) % 233280) / 233280;
          const angle = seed * Math.PI * 2;
          const spread = Math.min(210, Math.max(120, width * .22));
          return { targetX: target.x, targetY: target.y, x: target.x + Math.cos(angle) * spread, y: target.y + Math.sin(angle) * spread, seed, size: 1.15 + seed * 1.35, color: palette[index % palette.length], charIndex: target.charIndex };
        });
        startedAt = performance.now() + 180;
      };

      const render = now => {
        frame = requestAnimationFrame(render);
        if (now - lastFrame < 22) return;
        lastFrame = now;
        ctx.clearRect(0, 0, width, height);
        particles.forEach(particle => {
          const progress = clamp((now - startedAt - particle.seed * 540) / 1750, 0, 1);
          const gathered = ease(progress);
          const drift = progress === 1 ? Math.sin(now * .001 + particle.seed * 16) * .42 : 0;
          const jumpProgress = clamp((now - startedAt - 2450 - particle.charIndex * 330) / 650, 0, 1);
          const jump = jumpProgress < .74
            ? -Math.sin(Math.PI * (jumpProgress / .74)) * 14
            : -Math.sin(Math.PI * ((jumpProgress - .74) / .26)) * 4;
          const x = particle.x + (particle.targetX - particle.x) * gathered + drift;
          const y = particle.y + (particle.targetY - particle.y) * gathered + drift + (progress === 1 ? jump : 0);
          ctx.globalAlpha = .18 + progress * .82;
          ctx.fillStyle = particle.color;
          ctx.fillRect(x - particle.size / 2, y - particle.size / 2, particle.size, particle.size);
        });
        ctx.globalAlpha = 1;
      };

      const resize = () => build();
      build();
      frame = requestAnimationFrame(render);
      window.addEventListener('resize', resize, { passive: true });
      return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
    };
    const stopParticles = createParticleText();
    const start = performance.now();
    const duration = 4400;
    const tick = (now) => {
      const value = Math.min(100, Math.round(((now - start) / duration) * 100));
      progress.textContent = String(value).padStart(3, '0');
      opening.style.setProperty('--opening-progress', `${value}%`);
      if (value < 100) requestAnimationFrame(tick);
      else {
        window.setTimeout(() => opening.classList.add('is-curling'), 460);
        window.setTimeout(() => {
          stopParticles();
          opening.remove();
          window.__cmcOpeningComplete = true;
          window.dispatchEvent(new Event('cmc:opening-complete'));
        }, 2400);
      }
    };
    requestAnimationFrame(tick);
  }

  function replayHeroTitle() {
    const title = document.querySelector('#hero .animate-fade-up.font-display .flex.flex-col');
    if (!title || title.dataset.openingReplay) return;
    const originals = Array.from(title.querySelectorAll('.stroke-text'));
    if (originals.length !== 2) return;
    title.dataset.openingReplay = 'true';

    const clones = originals.map((original) => {
      const clone = original.cloneNode(true);
      clone.classList.add('cmc-title-clone');
      clone.querySelectorAll('[data-stroke-char]').forEach((node) => {
        node.style.strokeDasharray = '6300';
        node.style.strokeDashoffset = '6300';
      });
      clone.querySelectorAll('clipPath rect').forEach((node) => node.setAttribute('width', '0'));
      original.replaceWith(clone);
      return clone;
    });

    const dot = title.querySelector('.text-primary');
    if (dot) {
      dot.style.visibility = 'visible';
      dot.style.opacity = '0';
      dot.style.translate = '-12px 10px';
    }
    document.documentElement.classList.remove('hero-title-pending');

    clones.forEach((clone, groupIndex) => {
      const groupDelay = groupIndex === 0 ? 0 : 900;
      const svg = clone.querySelector('svg');
      const width = svg?.viewBox?.baseVal?.width || 1800;
      clone.querySelectorAll('[data-stroke-char]').forEach((node, index) => {
        node.animate(
          [{ strokeDashoffset: 6300 }, { strokeDashoffset: 0 }],
          { duration: 980, delay: groupDelay + index * 110, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
        );
      });
      const fillDelay = groupDelay + 310;
      clone.querySelectorAll('[data-fill-char]').forEach((node, index) => {
        node.style.opacity = '0';
        node.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 700, delay: fillDelay + index * 80, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
        );
      });
      window.setTimeout(() => {
        clone.querySelectorAll('clipPath rect').forEach((node) => node.setAttribute('width', String(width)));
      }, fillDelay);
    });
    if (dot) dot.animate(
      [{ opacity: 0, translate: '-12px 10px' }, { opacity: 1, translate: '0 0' }],
      { duration: 600, delay: 1650, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
    );
  }

  const mark = () => {
    const sections = Array.from(document.querySelectorAll('main section, #about, #projects, #departments, #contact'));
    sections.forEach((section) => {
      const heading = section.querySelector('h1, h2, h3');
      if (heading && !heading.dataset.motion) heading.dataset.motion = 'title';
      const media = section.querySelector('img');
      if (media && media.parentElement && !media.parentElement.dataset.motion && !media.parentElement.classList.contains('absolute')) media.parentElement.dataset.motion = 'media';
      const cards = section.querySelectorAll('article, .border-glow-card, [class*="border-2"][class*="bg-background"]');
      cards.forEach((card, index) => {
        if (!card.dataset.motion) {
          card.dataset.motion = 'card';
          card.style.setProperty('--motion-delay', `${Math.min(index, 7) * 90}ms`);
        }
      });
    });
  };

  const syncDepartmentCopy = () => {
    const path = window.location.pathname;
    document.body.classList.toggle('cmc-department-page', path.startsWith('/department/'));
    if (path.startsWith('/department/')) {
      const title = document.querySelector('main h1');
      const trailingDot = title && [...title.children].find((node) =>
        node.textContent.trim() === '.'
      );
      trailingDot?.remove();
    }
    if (path === '/department/film') {
      const courseHeading = [...document.querySelectorAll('h3')].find((heading) => heading.textContent.trim() === '社团课程');
      const firstCourseItem = courseHeading?.closest('div.p-8')?.querySelector('li');
      const firstCourseLabel = firstCourseItem?.querySelector('span:nth-child(2)');
      if (firstCourseLabel && !firstCourseLabel.dataset.cmcCopySynced) {
        firstCourseLabel.textContent = firstCourseLabel.textContent.replace('每周', '');
        firstCourseLabel.dataset.cmcCopySynced = 'true';
      }
    }
    if (path === '/department/radio') {
      const intro = [...document.querySelectorAll('p')].find((paragraph) => paragraph.textContent.includes('广播系是校园里最温暖的声音来源'));
      if (intro && !intro.dataset.cmcCopySynced) {
        intro.textContent = '广播系是校园里最温暖的声音来源。我们设置固定播出时段：中午、下午放学各放送半小时音乐节目。我们用声音陪伴全校师生度过每一天。新闻资讯、音乐点歌、红歌播放等丰富栏目，让广播系成为校园文化不可或缺的一部分。';
        intro.dataset.cmcCopySynced = 'true';
      }
      const airtime = [...document.querySelectorAll('*')].find((element) => element.childElementCount === 0 && element.textContent.trim() === '4h+');
      if (airtime && !airtime.dataset.cmcCopySynced) {
        airtime.textContent = '1h+';
        airtime.dataset.cmcCopySynced = 'true';
      }
    }
  };

  const syncHomeCourseCopy = () => {
    if (window.location.pathname !== '/') return;
    const coursePrompt = [...document.querySelectorAll('#about p')].find((paragraph) =>
      paragraph.textContent.includes('担心零基础')
    );
    coursePrompt?.classList.add('cmc-home-course-prompt');
    const courseCards = [...document.querySelectorAll('#about .border-glow-card')].filter((card) =>
      ['摄影技巧教学', '交流与分享', '影视制作课程', '主持与表达', '你将创造什么', '零基础指南', '后期魔法工坊', '社团氛围'].includes(card.querySelector('h3')?.textContent.trim())
    );
    courseCards.forEach((card) => {
      card.classList.add('cmc-home-course-card');
      const description = card.querySelector('p');
      description?.classList.add('cmc-home-course-desc');
      const tags = card.querySelectorAll('.mt-6.flex > span');
      (tags.length ? tags : card.querySelectorAll('span:not(.edge-light)'))
        .forEach((tag) => tag.classList.add('cmc-home-course-tag'));
    });
  };

  const prepareImages = () => {
    const path = window.location.pathname;
    const departmentHero = path.startsWith('/department/')
      ? document.querySelector('main > div > section:first-of-type img')
      : null;
    document.querySelectorAll('img').forEach((image) => {
      if (image.dataset.cmcMediaPrepared) return;
      image.dataset.cmcMediaPrepared = 'true';
      image.decoding = 'async';
      const isHero = image.closest('#hero') || image === departmentHero;
      if (isHero) {
        image.loading = 'eager';
        image.fetchPriority = 'high';
      } else if (!image.closest('.cmc-film-image-lightbox')) {
        image.loading = 'lazy';
      }
    });
  };

  const syncHomePlasma = () => {
    const isHome = window.location.pathname === '/';
    if (!isHome) {
      window.__cmcHomePlasmaCleanup?.();
      return;
    }
    const main = document.querySelector('main');
    if (!main) return;
    const plasmaMounted = document.querySelector('.cmc-home-plasma__canvas, .cmc-home-plasma__fallback');
    if (window.__cmcHomePlasmaActive && plasmaMounted) return;
    if (window.__cmcHomePlasmaActive) {
      window.__cmcHomePlasmaCleanup?.();
      window.__cmcHomePlasmaActive = false;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'cmc-home-plasma__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    main.prepend(canvas);
    document.body.classList.add('cmc-home-plasma');
    const plasmaFallback = document.createElement('div');
    plasmaFallback.className = 'cmc-home-plasma__fallback';
    plasmaFallback.setAttribute('aria-hidden', 'true');
    canvas.after(plasmaFallback);

    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) {
      canvas.remove();
      document.body.classList.add('cmc-home-plasma-active');
      window.__cmcHomePlasmaActive = true;
      window.__cmcHomePlasmaCleanup = () => {
        plasmaFallback.remove();
        document.body.classList.remove('cmc-home-plasma');
        document.body.classList.remove('cmc-home-plasma-active');
        window.__cmcHomePlasmaActive = false;
        window.__cmcHomePlasmaCleanup = null;
      };
      return;
    }
    plasmaFallback.hidden = true;

    const vertexSource = `#version 300 es
      precision highp float;
      in vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;
    const fragmentSource = `#version 300 es
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec3 uCustomColor;
      uniform float uSpeed;
      uniform float uScale;
      uniform float uOpacity;
      out vec4 fragColor;
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 p) {
        vec3 cell = floor(p);
        vec3 local = fract(p);
        local = local * local * (3.0 - 2.0 * local);
        float a = hash(cell);
        float b = hash(cell + vec3(1.0, 0.0, 0.0));
        float c = hash(cell + vec3(0.0, 1.0, 0.0));
        float d = hash(cell + vec3(1.0, 1.0, 0.0));
        float e = hash(cell + vec3(0.0, 0.0, 1.0));
        float f = hash(cell + vec3(1.0, 0.0, 1.0));
        float g = hash(cell + vec3(0.0, 1.0, 1.0));
        float h = hash(cell + vec3(1.0, 1.0, 1.0));
        return mix(mix(mix(a, b, local.x), mix(c, d, local.x), local.y), mix(mix(e, f, local.x), mix(g, h, local.x), local.y), local.z);
      }
      void main() {
        vec2 C = gl_FragCoord.xy;
        vec2 center = iResolution.xy * 0.5;
        C = (C - center) / uScale + center;
        float i = 0.0;
        float z = 0.0;
        float T = iTime * uSpeed * 0.4;
        vec3 O = vec3(0.0);
        vec3 p;
        vec3 S;
        vec2 Q;
        for (int step = 0; step < ${window.innerWidth < 760 ? 18 : 28}; step++) {
          p = z * normalize(vec3(C - 0.5 * iResolution.xy, iResolution.y));
          p.z -= 4.0;
          S = p;
          float organic = noise(p * 1.35 + vec3(T * 0.18, T * 0.1, -T * 0.14));
          float drift = noise(p * 2.1 - vec3(T * 0.08, -T * 0.12, T * 0.06)) - 0.5;
          float d = p.y - T + (organic - 0.5) * 0.22;
          p.x += 0.4 * (1.0 + p.y) * sin(d + p.x * 0.1 + drift) * cos(0.34 * d + p.x * 0.05);
          p.xz *= mat2(cos(p.y + vec4(0.0, 11.0, 33.0, 0.0) - T + organic * 0.8));
          Q = p.xz;
          float distanceField = (abs(sqrt(dot(Q, Q)) - 0.25 * (5.0 + S.y + (organic - 0.5) * 0.8)) / 3.0 + 8e-4);
          z += distanceField * 1.42;
          vec4 color = 1.0 + sin(S.y + p.z * 0.5 + S.z - length(S - p) + vec4(2.0, 1.0, 0.0, 8.0));
          O += color.w / max(distanceField, 0.001) * color.xyz;
          i += 1.0;
        }
        vec3 rgb = tanh(O / 1e4);
        float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
        vec3 finalColor = intensity * uCustomColor;
        float alpha = clamp(length(rgb) * uOpacity, 0.0, 0.9);
        fragColor = vec4(finalColor, alpha);
      }
    `;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const keepFallback = () => {
      canvas.remove();
      plasmaFallback.hidden = false;
      document.body.classList.add('cmc-home-plasma-active');
      window.__cmcHomePlasmaActive = true;
      window.__cmcHomePlasmaCleanup = () => {
        plasmaFallback.remove();
        document.body.classList.remove('cmc-home-plasma');
        document.body.classList.remove('cmc-home-plasma-active');
        window.__cmcHomePlasmaActive = false;
        window.__cmcHomePlasmaCleanup = null;
      };
    };
    if (!vertex || !fragment) {
      keepFallback();
      return;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      keepFallback();
      return;
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    const uniforms = {
      resolution: gl.getUniformLocation(program, 'iResolution'),
      time: gl.getUniformLocation(program, 'iTime'),
      color: gl.getUniformLocation(program, 'uCustomColor'),
      speed: gl.getUniformLocation(program, 'uSpeed'),
      scale: gl.getUniformLocation(program, 'uScale'),
      opacity: gl.getUniformLocation(program, 'uOpacity')
    };
    let width = 1;
    let height = 1;
    let frame = 0;
    let visible = false;
    let lastFrame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setSize = () => {
      const renderScale = window.innerWidth < 760
        ? Math.min(0.26, Math.max(0.18, 300 / Math.max(window.innerWidth, 1)))
        : Math.min(0.42, Math.max(0.28, 420 / Math.max(window.innerWidth, 1)));
      width = Math.max(1, Math.floor(window.innerWidth * renderScale));
      height = Math.max(1, Math.floor(window.innerHeight * renderScale));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };
    const render = (time) => {
      if (!visible) return;
      if (document.documentElement.classList.contains('cmc-wall-open')) {
        frame = requestAnimationFrame(render);
        return;
      }
      const frameGap = window.innerWidth < 760 ? 1000 / 18 : 1000 / 24;
      if (!reducedMotion && time - lastFrame < frameGap) {
        frame = requestAnimationFrame(render);
        return;
      }
      lastFrame = time;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform1f(uniforms.time, reducedMotion ? 0 : time * 0.001);
      gl.uniform3f(uniforms.color, 0.16, 0.86, 1.0);
      gl.uniform1f(uniforms.speed, 0.9);
      gl.uniform1f(uniforms.scale, 0.42);
      gl.uniform1f(uniforms.opacity, 0.92);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };
    const updateActive = () => {
      const active = !document.hidden
        && !document.documentElement.classList.contains('cmc-wall-open');
      document.body.classList.toggle('cmc-home-plasma-active', active);
      if (active !== visible) {
        visible = active;
        if (visible && !reducedMotion) {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(render);
        } else if (!visible) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      }
    };
    let activeFrame = 0;
    const scheduleActiveUpdate = () => {
      if (activeFrame) return;
      activeFrame = requestAnimationFrame(() => {
        activeFrame = 0;
        updateActive();
      });
    };
    const handleResize = () => {
      setSize();
      updateActive();
    };
    const handleVisibilityChange = () => updateActive();
    window.addEventListener('scroll', scheduleActiveUpdate, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('cmc:plasma-pause', scheduleActiveUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    setSize();
    updateActive();
    if (visible && !reducedMotion) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(render);
    }
    window.__cmcHomePlasmaActive = true;
    window.__cmcHomePlasmaCleanup = () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(activeFrame);
      window.removeEventListener('scroll', scheduleActiveUpdate);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('cmc:plasma-pause', scheduleActiveUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      plasmaFallback.remove();
      canvas.remove();
      document.body.classList.remove('cmc-home-plasma');
      document.body.classList.remove('cmc-home-plasma-active');
      window.__cmcHomePlasmaActive = false;
      window.__cmcHomePlasmaCleanup = null;
    };
  };

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  const observe = () => {
    mark();
    syncDepartmentCopy();
    syncHomeCourseCopy();
    prepareImages();
    syncHomePlasma();
    document.querySelectorAll('img[src^="/assets/join-qr.jpg"]').forEach((image) => {
      if (!image.src.includes('v=qr-20260821')) image.src = '/assets/join-qr.jpg?v=qr-20260821';
    });
    document.querySelectorAll('.cmc-specular-button').forEach((button) => {
      if (button.dataset.specularBound) return;
      button.dataset.specularBound = 'true';
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty('--specular-x', `${event.clientX - rect.left}px`);
        button.style.setProperty('--specular-y', `${event.clientY - rect.top}px`);
        button.classList.add('is-specular-active');
      });
      button.addEventListener('pointerleave', () => button.classList.remove('is-specular-active'));
    });
    document.querySelectorAll('a[href="#hero"], a[href="/"]').forEach((link) => {
      if (link.dataset.topBound) return;
      link.dataset.topBound = 'true';
      link.addEventListener('click', (event) => {
        if (link.getAttribute('href') === '/' && window.location.pathname !== '/') return;
        event.preventDefault();
        window.__cmcReleaseDetailStage?.();
        window.__cmcResetPageScroll?.(0);
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#hero`);
      });
    });
    if (!reduced) {
      document.querySelectorAll('a[href^="/department/"]').forEach((link) => {
        if (link.dataset.routeTransitionBound) return;
        link.dataset.routeTransitionBound = 'true';
        link.addEventListener('click', (event) => {
          if (link.dataset.routeTransitionBypass === 'true') {
            delete link.dataset.routeTransitionBypass;
            return;
          }
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            document.body.classList.contains('cmc-route-transitioning')
          ) return;

          const rect = link.getBoundingClientRect();
          const originX = Math.round(rect.left + rect.width / 2);
          const originY = Math.round(rect.top + rect.height / 2);
          const radius = Math.ceil(Math.hypot(
            Math.max(originX, window.innerWidth - originX),
            Math.max(originY, window.innerHeight - originY)
          ) * 1.08);
          const href = link.getAttribute('href');
          const routeColor = href.includes('/film')
            ? '#0ea5e9'
            : href.includes('/radio')
              ? '#10b981'
              : '#a855f7';

          event.preventDefault();
          document.body.classList.add('cmc-route-transitioning');
          const transition = document.createElement('div');
          transition.className = 'cmc-route-transition';
          transition.dataset.routeTransition = 'true';
          transition.setAttribute('aria-hidden', 'true');
          transition.style.setProperty('--route-origin-x', `${originX}px`);
          transition.style.setProperty('--route-origin-y', `${originY}px`);
          transition.style.setProperty('--route-radius', `${radius}px`);
          transition.style.setProperty('--route-color', routeColor);
          document.body.appendChild(transition);
          window.requestAnimationFrame(() => transition.classList.add('is-expanding'));

          window.setTimeout(() => {
            window.__cmcResetPageScroll?.(0);
            link.dataset.routeTransitionBypass = 'true';
            link.click();
          }, 520);
          window.setTimeout(() => {
            transition.remove();
            document.body.classList.remove('cmc-route-transitioning');
          }, 1250);
        });
      });
    }
    document.body.classList.add('motion-enhanced');
    document.querySelectorAll('[data-motion]').forEach((el) => reveal.observe(el));
  };
  const boot = () => {
    observe();
    const root = document.getElementById('root');
    if (!root) return;
    const mutation = new MutationObserver(() => window.requestAnimationFrame(observe));
    mutation.observe(root, { childList: true, subtree: true });
  };
  if (document.getElementById('root')) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();

// Keep the original page-level momentum settings available on every route.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.__cmcPageInertiaCleanup) return;

  const scrollOptions = {
    duration: 1.2,
    easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
    smoothWheel: true,
    touchMultiplier: 2,
    infinite: false,
    wheelMultiplier: 1,
    lerp: 0.1,
    syncTouch: true,
    syncTouchLerp: 0.075,
    touchInertiaMultiplier: 35,
    touchInertia: 0.6
  };
  let lenisFrame = null;
  let lenisAnimating = false;
  let lenisTarget = window.scrollY;

  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clampToDetailPin = (target, deltaY = 0) => {
    const pinTop = window.__cmcGetDetailPinTop?.();
    if (typeof pinTop !== 'number' || Number.isNaN(pinTop)) return { target, pin: false };
    if (!window.__cmcOpeningComplete) return { target, pin: false };
    const pinned = document.documentElement.classList.contains('cmc-detail-pinned');
    const cycleComplete = window.__cmcDetailCycleComplete?.() === true;
    if (pinned) return { target: pinTop, pin: true };
    if (!cycleComplete && (deltaY > 0 || target > pinTop) && target >= pinTop) {
      return { target: pinTop, pin: true };
    }
    if (cycleComplete && (deltaY < 0 || target < pinTop) && target <= pinTop) {
      return { target: pinTop, pin: true };
    }
    return { target, pin: false };
  };
  const runLenis = () => {
    if (lenisAnimating || !scrollOptions.smoothWheel) return;
    if (document.documentElement.classList.contains('cmc-detail-pinned')) {
      const pinTop = window.__cmcGetDetailPinTop?.();
      if (typeof pinTop === 'number') lenisTarget = pinTop;
      lenisAnimating = false;
      if (lenisFrame !== null) {
        window.cancelAnimationFrame(lenisFrame);
        lenisFrame = null;
      }
      return;
    }
    lenisAnimating = true;
    const tick = () => {
      if (document.documentElement.classList.contains('cmc-detail-pinned')) {
        lenisAnimating = false;
        lenisFrame = null;
        return;
      }
      const clamped = clampToDetailPin(lenisTarget);
      lenisTarget = clamped.target;
      const current = window.scrollY;
      const next = current + (lenisTarget - current) * scrollOptions.lerp;
      window.scrollTo(0, Math.abs(lenisTarget - next) < 0.5 ? lenisTarget : next);
      if (document.documentElement.classList.contains('cmc-detail-pinned') || Math.abs(lenisTarget - window.scrollY) < 0.5) {
        if (clamped.pin && Math.abs(window.scrollY - lenisTarget) <= 8) window.__cmcPinDetailStage?.();
        lenisAnimating = false;
        lenisFrame = null;
        return;
      }
      lenisFrame = window.requestAnimationFrame(tick);
    };
    lenisFrame = window.requestAnimationFrame(tick);
  };
  const handleWheel = (event) => {
    if (!window.__cmcOpeningComplete) {
      event.preventDefault();
      return;
    }
    if (document.documentElement.classList.contains('cmc-detail-pinned')) {
      event.preventDefault();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey || !scrollOptions.smoothWheel) return;
    event.preventDefault();
    const rawTarget = Math.min(Math.max(0, lenisTarget + event.deltaY * scrollOptions.wheelMultiplier), maxScroll());
    const clamped = clampToDetailPin(rawTarget, event.deltaY);
    lenisTarget = clamped.target;
    runLenis();
  };
  const handleScroll = () => {
    if (document.documentElement.classList.contains('cmc-detail-pinned')) return;
    if (!lenisAnimating) lenisTarget = window.scrollY;
  };
  const resetPageScroll = (top = 0) => {
    lenisTarget = top;
    lenisAnimating = false;
    if (lenisFrame !== null) {
      window.cancelAnimationFrame(lenisFrame);
      lenisFrame = null;
    }
    window.scrollTo(0, top);
  };
  const smoothPageScrollTo = (top = 0) => {
    const target = Math.min(Math.max(0, top), maxScroll());
    lenisTarget = target;
    if (Math.abs(target - window.scrollY) < 0.5) return;
    runLenis();
  };
  const cleanup = () => {
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('scroll', handleScroll);
    if (lenisFrame !== null) window.cancelAnimationFrame(lenisFrame);
    document.documentElement.classList.remove('cmc-lenis-active');
    window.__cmcSmoothPageScrollTo = null;
    window.__cmcPageInertiaCleanup = null;
    window.__cmcPageInertiaActive = false;
  };

  document.documentElement.classList.add('cmc-lenis-active');
  window.__cmcPageInertiaActive = true;
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.__cmcResetPageScroll = resetPageScroll;
  window.__cmcSmoothPageScrollTo = smoothPageScrollTo;
  window.__cmcPageInertiaCleanup = cleanup;
})();

// Apply the page-specific review adjustments after the app renders.
(() => {
  const removeFilmMetrics = () => {
    if (window.location.pathname === '/department/film') {
      const panel = [...document.querySelectorAll('div.border-2.border-foreground')].find((element) =>
        element.textContent.includes('年均作品') &&
        element.textContent.includes('成员规模') &&
        element.textContent.includes('设备套数')
      );
      if (panel) panel.remove();
    }

    if (window.location.pathname === '/department/theatre') {
      const recruitment = [...document.querySelectorAll('div')].find((element) =>
        element.querySelector('h3')?.textContent.trim() === '招新方向' &&
        element.textContent.includes('表演方向：热爱表演，敢于展示') &&
        element.textContent.includes('舞美方向：有美术或手工基础')
      );
      if (recruitment) recruitment.remove();
    }

    if (window.location.pathname === '/') {
      const invite = [...document.querySelectorAll('p')].find((element) =>
        element.textContent.includes('不要担心自己能力不足') &&
        element.textContent.includes('兴趣就是最好的入场券')
      );
      if (invite) invite.classList.add('cmc-about-invite');

      const contact = [...document.querySelectorAll('footer div')]
        .filter((element) =>
          element.textContent.includes('media@campus.edu') &&
          element.textContent.includes('138 0000 0000') &&
          element.textContent.includes('203室')
        )
        .sort((left, right) => left.textContent.length - right.textContent.length)[0];
      if (contact) contact.remove();
    }

    const cleanupFilmScrollStack = () => {
      if (typeof window.__cmcFilmScrollStackCleanup === 'function') {
        window.__cmcFilmScrollStackCleanup();
        window.__cmcFilmScrollStackCleanup = null;
      }
    };
    const cleanupFilmImageStack = () => {
      if (typeof window.__cmcFilmImageStackCleanup === 'function') {
        window.__cmcFilmImageStackCleanup();
        window.__cmcFilmImageStackCleanup = null;
      }
    };

    if (window.location.pathname !== '/department/film') {
      cleanupFilmScrollStack();
      cleanupFilmImageStack();
      return;
    }

    const cards = [...document.querySelectorAll('h3')]
      .filter((heading) => ['主要职能', '社团课程', '团队构成'].includes(heading.textContent.trim()))
      .map((heading) => heading.closest('div.p-8'))
      .filter(Boolean);
    const stack = cards[0]?.parentElement;
    if (!stack || cards.length !== 3 || stack.dataset.scrollStackReady) return;

    const joinMessage = [...document.querySelectorAll('p')].find((element) =>
      element.textContent.includes('无论你是否拥有相机')
    );
    const joinWrapper = joinMessage?.parentElement;
    if (joinWrapper && !document.querySelector('.cmc-film-image-stack')) {
      const imageStack = document.createElement('div');
      imageStack.className = 'cmc-film-image-stack';
      imageStack.dataset.filmImageStackReady = 'true';
      imageStack.innerHTML = `
        <div class="cmc-film-image-stack__intro">
          <span class="cmc-film-image-stack__eyebrow">VISUAL ARCHIVE</span>
          <span class="cmc-film-image-stack__hint">拖动图片，翻阅镜头</span>
        </div>
        <div class="cmc-film-image-stack__stage" aria-label="影视系影像作品集"></div>
        <div class="cmc-film-image-stack__count"><strong>20</strong><span>FRAME STUDIES</span></div>
      `;
      const stage = imageStack.querySelector('.cmc-film-image-stack__stage');
      const imageOrder = [12, 4, 18, 7, 1, 15, 5, 20, 9, 3, 14, 6, 19, 10, 2, 17, 8, 13, 16, 11];
      const imageUrls = imageOrder.map((imageIndex) =>
        `/assets/film-stack-v3/film-${String(imageIndex).padStart(2, '0')}.webp`
      );
      const cards = imageUrls.map((src, index) => {
        const card = document.createElement('div');
        card.className = 'cmc-film-image-card';
        card.dataset.stackIndex = String(index);
        card.innerHTML = `<img ${index < 5 ? `src="${src}"` : `data-src="${src}"`} alt="影视系影像作品 ${index + 1}" loading="${index < 5 ? 'eager' : 'lazy'}" decoding="async" draggable="false" />`;
        stage.appendChild(card);
        return card;
      });
      joinWrapper.parentElement.insertBefore(imageStack, joinWrapper);

      const lightbox = document.createElement('div');
      lightbox.className = 'cmc-film-image-lightbox';
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.innerHTML = '<button class="cmc-film-image-lightbox__close" type="button" aria-label="关闭预览">&times;</button><img alt="影视系影像作品预览" />';
      const lightboxImage = lightbox.querySelector('img');
      document.body.appendChild(lightbox);
      const closeLightbox = () => {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.removeAttribute('src');
      };
      const openLightbox = (card) => {
        lightboxImage.src = card.querySelector('img').src;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
      };
      const handleLightboxClick = (event) => {
        if (event.target === lightbox || event.target.closest('.cmc-film-image-lightbox__close')) closeLightbox();
      };
      const handleLightboxKeydown = (event) => {
        if (event.key === 'Escape') closeLightbox();
      };
      lightbox.addEventListener('click', handleLightboxClick);
      document.addEventListener('keydown', handleLightboxKeydown);

      let order = cards.map((_, index) => index);
      let activePointer = null;
      let activeCard = null;
      let startX = 0;
      let startY = 0;
      let moved = false;
      const renderImageStack = () => {
        cards.forEach((card, index) => {
          const depth = order.indexOf(index);
          const visibleDepth = cards.length - 1 - depth;
          const isVisible = visibleDepth < 5;
          const isTop = visibleDepth === 0;
          const image = card.querySelector('img');
          if (isVisible && image?.dataset.src && !image.getAttribute('src')) image.src = image.dataset.src;
          card.style.setProperty('--visible-depth', Math.min(visibleDepth, 4));
          card.classList.toggle('is-top', isTop);
          card.style.zIndex = isVisible ? String(10 - visibleDepth) : '1';
          card.style.opacity = isVisible ? '1' : '0';
          card.style.visibility = isVisible ? 'visible' : 'hidden';
          card.style.pointerEvents = isTop ? 'auto' : 'none';
        });
      };
      const handlePointerDown = (event) => {
        const card = event.currentTarget;
        if (order[order.length - 1] !== Number(card.dataset.stackIndex)) return;
        activePointer = event.pointerId;
        activeCard = card;
        startX = event.clientX;
        startY = event.clientY;
        moved = false;
        card.setPointerCapture?.(event.pointerId);
        card.classList.add('is-dragging');
      };
      const handlePointerMove = (event) => {
        if (!activeCard || event.pointerId !== activePointer) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        moved = moved || Math.abs(dx) > 4 || Math.abs(dy) > 4;
        activeCard.style.setProperty('--drag-x', `${dx}px`);
        activeCard.style.setProperty('--drag-y', `${dy}px`);
        activeCard.style.setProperty('--drag-rotate', `${Math.max(-12, Math.min(12, dx / 18))}deg`);
      };
      const handlePointerUp = (event) => {
        if (!activeCard || event.pointerId !== activePointer) return;
        const dx = event.clientX - startX;
        activeCard.classList.remove('is-dragging');
        activeCard.releasePointerCapture?.(event.pointerId);
        activeCard.style.removeProperty('--drag-x');
        activeCard.style.removeProperty('--drag-y');
        activeCard.style.removeProperty('--drag-rotate');
        if (moved && Math.abs(dx) > 72) {
          const topIndex = order.pop();
          order.unshift(topIndex);
          renderImageStack();
        } else if (!moved) {
          openLightbox(activeCard);
        }
        activePointer = null;
        activeCard = null;
      };
      cards.forEach((card) => {
        card.addEventListener('pointerdown', handlePointerDown);
        card.addEventListener('pointermove', handlePointerMove);
        card.addEventListener('pointerup', handlePointerUp);
        card.addEventListener('pointercancel', handlePointerUp);
      });
      renderImageStack();
      window.__cmcFilmImageStackCleanup = () => {
        cards.forEach((card) => {
          card.removeEventListener('pointerdown', handlePointerDown);
          card.removeEventListener('pointermove', handlePointerMove);
          card.removeEventListener('pointerup', handlePointerUp);
          card.removeEventListener('pointercancel', handlePointerUp);
        });
        lightbox.removeEventListener('click', handleLightboxClick);
        document.removeEventListener('keydown', handleLightboxKeydown);
        lightbox.remove();
        imageStack.remove();
      };
    }

    stack.classList.add('cmc-film-scroll-stack');
    cards.forEach((card, index) => {
      card.classList.add('scroll-stack-card', 'cmc-film-scroll-card');
      card.dataset.scrollStackIndex = String(index);
    });
    stack.dataset.scrollStackReady = 'true';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ownsInertia = !window.__cmcPageInertiaActive;
    let frame = null;
    let lenisFrame = null;
    let lenisAnimating = false;
    let lenisTarget = window.scrollY;
    const scrollOptions = {
      duration: 1.2,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchInertiaMultiplier: 35,
      touchInertia: 0.6
    };
    let destroyed = false;
    const transforms = new Map();
    const getCardDocumentTops = () => {
      const transformsBeforeMeasure = cards.map((card) => card.style.transform);
      cards.forEach((card) => card.style.removeProperty('transform'));
      const tops = cards.map((card) => card.getBoundingClientRect().top + window.scrollY);
      cards.forEach((card, index) => {
        if (transformsBeforeMeasure[index]) card.style.transform = transformsBeforeMeasure[index];
      });
      return tops;
    };
    const cardDocumentTops = getCardDocumentTops();
    const getStackContentBottom = () =>
      stack.getBoundingClientRect().bottom + window.scrollY - parseFloat(stack.style.paddingBottom || '0');
    const setReleaseSpace = () => {
      const followingContent = stack.nextElementSibling;
      const followingGap = followingContent ? parseFloat(getComputedStyle(followingContent).marginTop) || 0 : 0;
      const finalCardHeight = cards[cards.length - 1]?.offsetHeight || 0;
      const minimumRelease = finalCardHeight - window.innerHeight * 0.3 + 60 + 16 - followingGap;
      const releaseSpace = Math.min(180, Math.max(72, Math.ceil(minimumRelease)));
      stack.style.paddingBottom = `${releaseSpace}px`;
    };
    setReleaseSpace();
    let stackEndTop = getStackContentBottom();
    const updateCardTransforms = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const stackPosition = viewportHeight * 0.2;
        const scaleEndPosition = viewportHeight * 0.1;
        const pinEnd = stackEndTop - viewportHeight / 2;
        cards.forEach((card, index) => {
          const cardTop = cardDocumentTops[index];
          const triggerStart = cardTop - stackPosition - 30 * index;
          const triggerEnd = cardTop - scaleEndPosition;
          const progress = Math.min(1, Math.max(0, (window.scrollY - triggerStart) / Math.max(1, triggerEnd - triggerStart)));
          const scale = 1 - progress * (1 - (0.85 + index * 0.03));
          let translateY = 0;
          if (scrollTop >= triggerStart && scrollTop <= pinEnd) {
            translateY = scrollTop - cardTop + stackPosition + 30 * index;
          } else if (scrollTop > pinEnd) {
            translateY = pinEnd - cardTop + stackPosition + 30 * index;
          }
          const transform = `translate3d(0, ${Math.round(translateY * 100) / 100}px, 0) scale(${scale.toFixed(3)})`;
          if (transforms.get(index) !== transform) {
            card.style.transform = transform;
            transforms.set(index, transform);
          }
        });
      });
    };
    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const runLenis = () => {
      if (lenisAnimating || !scrollOptions.smoothWheel) return;
      lenisAnimating = true;
      const tick = () => {
        const current = window.scrollY;
        const next = current + (lenisTarget - current) * scrollOptions.lerp;
        window.scrollTo(0, Math.abs(lenisTarget - next) < 0.5 ? lenisTarget : next);
        updateCardTransforms();
        if (Math.abs(lenisTarget - window.scrollY) >= 0.5) {
          lenisFrame = window.requestAnimationFrame(tick);
        } else {
          lenisAnimating = false;
          lenisFrame = null;
        }
      };
      lenisFrame = window.requestAnimationFrame(tick);
    };
    const handleLenisWheel = (event) => {
      if (document.documentElement.classList.contains('cmc-detail-pinned')) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey || !scrollOptions.smoothWheel) return;
      event.preventDefault();
      lenisTarget = Math.min(Math.max(0, lenisTarget + event.deltaY * scrollOptions.wheelMultiplier), maxScroll());
      runLenis();
    };
    const handleLenisScroll = () => {
      if (document.documentElement.classList.contains('cmc-detail-pinned')) return;
      if (!lenisAnimating) lenisTarget = window.scrollY;
      updateCardTransforms();
    };
    let handleFilmResize = null;
    const cleanup = () => {
      if (destroyed) return;
      destroyed = true;
      window.removeEventListener('scroll', updateCardTransforms);
      if (handleFilmResize) window.removeEventListener('resize', handleFilmResize);
      if (frame !== null) window.cancelAnimationFrame(frame);
      if (lenisFrame !== null) window.cancelAnimationFrame(lenisFrame);
      window.removeEventListener('wheel', handleLenisWheel);
      window.removeEventListener('scroll', handleLenisScroll);
      if (ownsInertia) document.documentElement.classList.remove('cmc-lenis-active');
      cards.forEach((card) => {
        card.style.removeProperty('transform');
        card.style.removeProperty('z-index');
      });
      transforms.clear();
      stack.style.removeProperty('padding-bottom');
      delete stack.dataset.scrollStackReady;
    };
    handleFilmResize = () => {
      setReleaseSpace();
      cardDocumentTops.splice(0, cardDocumentTops.length, ...getCardDocumentTops());
      stackEndTop = getStackContentBottom();
      transforms.clear();
      updateCardTransforms();
      lenisTarget = Math.min(lenisTarget, maxScroll());
    };
    if (ownsInertia) {
      document.documentElement.classList.add('cmc-lenis-active');
      window.addEventListener('wheel', handleLenisWheel, { passive: false });
      window.addEventListener('scroll', handleLenisScroll, { passive: true });
    }
    window.addEventListener('scroll', updateCardTransforms, { passive: true });
    window.addEventListener('resize', handleFilmResize, { passive: true });
    updateCardTransforms();
    window.__cmcFilmScrollStackCleanup = cleanup;
  };

  removeFilmMetrics();
  const root = document.getElementById('root');
  if (root) new MutationObserver(removeFilmMetrics).observe(root, { childList: true, subtree: true });
})();

(function removeDepartmentContent() {
  const updateDepthText = (root, value) => {
    root.querySelectorAll('.depth-text__glow, .depth-text__layer, .depth-text__face').forEach((node) => {
      node.textContent = value;
    });
  };

  const startFilmHeroTitleMotion = (title) => {
    if (!title || title.dataset.cmcStrokeReady) return;
    title.dataset.cmcStrokeReady = 'true';
    const wipe = title.querySelector('.cmc-film-title-wipe');
    const finishFill = () => wipe?.setAttribute('width', '1200');
    const play = () => {
      title.classList.add('is-drawn');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finishFill();
        return;
      }
      window.setTimeout(finishFill, 3200);
    };
    if (window.__cmcOpeningComplete) window.requestAnimationFrame(play);
    else window.addEventListener('cmc:opening-complete', play, { once: true });
    window.setTimeout(() => {
      if (!title.classList.contains('is-drawn') || (wipe && wipe.getAttribute('width') === '0')) play();
    }, 7200);
  };

  const CMC_WALL_EXTRA = ["wall-69.png","wall-70.png","wall-71.jpg","wall-72.jpg","wall-73.jpg","wall-74.jpg","wall-75.jpg","wall-76.jpg","wall-77.jpg","wall-78.jpg","wall-79.jpg","wall-80.jpg","wall-81.jpg","wall-82.jpg","wall-83.jpg","wall-84.png","wall-85.png","wall-86.png","wall-87.jpg","wall-88.png","wall-89.jpg"];
  const CMC_WALL_ITEMS = [
    ...Array.from({ length: 68 }, (_, index) => ({
      image: `/wall/wall-${String(index + 1).padStart(2, '0')}.jpg`,
      title: `影像档案 ${index + 1}`
    })),
    ...CMC_WALL_EXTRA.map((name, index) => ({
      image: `/wall/${name}`,
      title: `影像档案 ${69 + index}`
    }))
  ];
  const prefetchImages = (urls, concurrency = 2) => {
    const queue = [...new Set((urls || []).filter(Boolean))];
    let active = 0;
    const next = () => {
      while (active < concurrency && queue.length) {
        const url = queue.shift();
        active += 1;
        const image = new Image();
        image.decoding = 'async';
        const done = () => {
          active -= 1;
          next();
        };
        image.onload = done;
        image.onerror = done;
        image.src = url;
      }
    };
    next();
  };
  const scheduleHomePrefetch = () => {
    const urls = [
      '/assets/activity-01.webp', '/assets/activity-02.webp', '/assets/activity-03.webp', '/assets/activity-04.webp',
      '/assets/youth-01.webp', '/assets/youth-02.webp', '/assets/youth-03.webp', '/assets/youth-04.webp',
      ...CMC_WALL_ITEMS.slice(0, 16).map((item) => item.image)
    ];
    const run = () => prefetchImages(urls, 2);
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1600 });
    else window.setTimeout(run, 600);
  };
  if (window.__cmcOpeningComplete) scheduleHomePrefetch();
  else window.addEventListener('cmc:opening-complete', scheduleHomePrefetch, { once: true });

  const wallColumnFactor = (index, variance) => {
    const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
    return 1 + variance * pseudo;
  };

  const getFilmWallLayout = () => {
    const portrait = window.innerHeight >= window.innerWidth || window.innerWidth < 760;
    if (portrait) {
      const tileWidth = Math.max(128, Math.min(168, Math.floor(window.innerWidth * 0.4)));
      return {
        columns: 2,
        tileWidth,
        tileHeight: Math.round(tileWidth * 1.38),
        gap: 12,
        radius: 14,
        tilt: 7,
        turn: -7,
        roll: 0,
        perspective: 980,
        depth: 72,
        speed: 22,
        direction: 'up',
        variance: 0.28,
        parallax: 0.12,
        lift: 28,
        fade: 0.5,
        dim: 1,
        overlayColor: '#071018'
      };
    }
    return {
      columns: 3,
      tileWidth: 196,
      tileHeight: 262,
      gap: 16,
      radius: 14,
      tilt: 11,
      turn: -9,
      roll: 0,
      perspective: 1100,
      depth: 92,
      speed: 24,
      direction: 'up',
      variance: 0.32,
      parallax: 0.18,
      lift: 42,
      fade: 0.56,
      dim: 1,
      overlayColor: '#071018'
    };
  };

  const mountDriftWall = (container, items, options, hooks = {}) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const columnItems = Array.from({ length: options.columns }, () => []);
    items.forEach((item, index) => columnItems[index % options.columns].push(item));
    columnItems.forEach((column, index) => {
      if (!column.length) columnItems[index] = items.slice(0, 1);
    });
    const unit = options.tileHeight + options.gap;
    const containerHeight = container.clientHeight || window.innerHeight;
    const columnMeta = columnItems.map((column) => {
      const copyHeight = Math.max(unit, column.length * unit);
      const copies = Math.max(2, Math.min(2, Math.ceil((containerHeight * 1.2) / copyHeight) + 1));
      return { copyHeight, copies };
    });
    const offsets = columnMeta.map((meta, index) => meta.copyHeight * ((index * 0.37) % 1));
    const velocities = columnItems.map(() => 0);
    const dirSign = options.direction === 'up' ? 1 : -1;
    const baseVelocities = columnItems.map((_, index) => (
      options.speed * wallColumnFactor(index, options.variance) * dirSign * (index % 2 === 0 ? 1 : -1)
    ));

    container.style.setProperty('--dw-tile-w', `${options.tileWidth}px`);
    container.style.setProperty('--dw-tile-h', `${options.tileHeight}px`);
    container.style.setProperty('--dw-gap', `${options.gap}px`);
    container.style.setProperty('--dw-radius', `${options.radius}px`);
    container.style.setProperty('--dw-perspective', `${options.perspective}px`);
    container.style.setProperty('--dw-lift', `${options.lift}px`);
    container.style.setProperty('--dw-dim', '1');
    container.style.setProperty('--dw-gray', '0');
    container.style.setProperty('--dw-overlay', options.overlayColor);
    container.style.setProperty('--dw-edge', `${Math.max(0, (1 - options.fade) * 100)}%`);
    container.className = `drift-wall${reduced ? ' drift-wall--reduced' : ''}`;
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', '影像作品墙');

    const plane = document.createElement('div');
    plane.className = 'drift-wall__plane';
    const tracks = [];
    columnItems.forEach((column, columnIndex) => {
      const col = document.createElement('div');
      col.className = 'drift-wall__col';
      const track = document.createElement('div');
      track.className = 'drift-wall__track';
      const copies = columnMeta[columnIndex].copies;
      for (let copyIndex = 0; copyIndex < copies; copyIndex += 1) {
        column.forEach((item, itemIndex) => {
          const tile = document.createElement('div');
          tile.className = 'drift-wall__tile';
          tile.tabIndex = 0;
          tile.setAttribute('role', 'button');
          tile.setAttribute('aria-label', item.title);
          tile.dataset.tileId = `${columnIndex}-${copyIndex}-${itemIndex}`;
          tile.dataset.col = String(columnIndex);
          tile.dataset.src = item.image;
          tile.dataset.title = item.title;
          tile.innerHTML = `<span class="drift-wall__inner"><img data-src="${item.image}" alt="${item.title}" decoding="async" draggable="false" /><span class="drift-wall__overlay" aria-hidden="true"></span></span>`;
          track.appendChild(tile);
        });
      }
      col.appendChild(track);
      plane.appendChild(col);
      tracks.push(track);
    });
    container.appendChild(plane);
    const overlay = container.closest('.cmc-drift-overlay');
    const tileImages = container.querySelectorAll('.drift-wall__tile img');
    const revealTiles = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const image = entry.target;
        if (image.dataset.src && !image.getAttribute('src')) image.src = image.dataset.src;
        revealTiles.unobserve(image);
      });
    }, { root: overlay || null, rootMargin: '420px 0px' });
    tileImages.forEach((image) => revealTiles.observe(image));

    let hoveredCol = -1;
    let activeId = null;
    let pointer = { x: 0, y: 0 };
    let pointerDamped = { x: 0, y: 0 };
    let lastTs = null;
    let raf = null;
    let manual = false;
    let autoUntil = performance.now() + 2200;
    let gesturePointer = null;
    let gestureStart = { x: 0, y: 0 };
    let gestureLastY = 0;
    let gestureMoved = false;
    let gestureTile = null;
    let dragging = false;
    let flickVelocity = 0;
    let pending = 0;
    let lastMoveTs = 0;
    const viewerOpen = () => Boolean(overlay && overlay.querySelector('.cmc-drift-viewer.is-open'));
    const wallEntering = () => Boolean(overlay && (overlay.classList.contains('is-portaling') || overlay.classList.contains('is-revealing') || overlay.classList.contains('is-exiting')));
    const wrapOffset = (value, copyHeight) => ((value % copyHeight) + copyHeight) % copyHeight;
    const applyOffsets = () => {
      tracks.forEach((track, index) => {
        const meta = columnMeta[index];
        offsets[index] = wrapOffset(offsets[index] || 0, meta.copyHeight);
        track.style.transform = `translate3d(0, ${-offsets[index]}px, 0)`;
      });
    };
    const lockManual = () => {
      if (manual) return;
      manual = true;
      autoUntil = 0;
      velocities.fill(0);
    };
    const shiftAll = (delta) => {
      if (!delta) return;
      tracks.forEach((_, index) => {
        offsets[index] = (offsets[index] || 0) + delta;
      });
    };
    const queueShift = (delta) => {
      if (!delta) return;
      pending += delta;
    };

    const applyPlaneTransform = (px, py) => {
      plane.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${options.tilt + py}deg) rotateY(${options.turn + px}deg) rotateZ(${options.roll}deg) ` +
        `translateZ(${-options.depth}px)`;
    };
    applyPlaneTransform(0, 0);
    applyOffsets();

    const setActive = (id, columnIndex) => {
      if (activeId === id) return;
      if (activeId) container.querySelector(`[data-tile-id="${activeId}"]`)?.classList.remove('is-active');
      activeId = id;
      hoveredCol = columnIndex;
      if (id) container.querySelector(`[data-tile-id="${id}"]`)?.classList.add('is-active');
    };

    const animate = (ts) => {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(0.032, Math.max(0.001, (ts - lastTs) / 1000));
      lastTs = ts;
      if (!reduced) {
        const autoLive = !manual && ts < autoUntil;
        if (autoLive) {
          pending = 0;
          flickVelocity = 0;
          tracks.forEach((_, index) => {
            const target = baseVelocities[index];
            const ease = 1 - Math.exp(-dt / 0.28);
            velocities[index] += (target - velocities[index]) * ease;
            offsets[index] = (offsets[index] || 0) + velocities[index] * dt;
          });
        } else {
          if (!dragging) {
            pending += flickVelocity * dt;
            flickVelocity *= Math.exp(-dt / 0.64);
            if (Math.abs(flickVelocity) < 4) flickVelocity = 0;
          }
          const tau = dragging ? 0.05 : 0.16;
          const ease = 1 - Math.exp(-dt / tau);
          const step = pending * ease;
          pending -= step;
          shiftAll(step);
        }
      } else if (pending) {
        shiftAll(pending);
        pending = 0;
      }
      applyOffsets();
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onPointerMove = () => {};
    const onPointerLeave = () => {
      pointer = { x: 0, y: 0 };
      setActive(null, -1);
    };
    const onFocus = (event) => {
      const tile = event.target.closest ? event.target.closest('[data-tile-id]') : null;
      if (tile) setActive(tile.dataset.tileId, Number(tile.dataset.col));
    };
    const onBlur = () => setActive(null, -1);
    const openTile = (tile) => {
      if (!tile || typeof hooks.onSelect !== 'function') return;
      hooks.onSelect(tile.dataset.src, tile.dataset.title);
    };
    const onPointerDown = (event) => {
      if (viewerOpen() || wallEntering()) return;
      if (event.button != null && event.button !== 0) return;
      gesturePointer = event.pointerId;
      gestureStart = { x: event.clientX, y: event.clientY };
      gestureLastY = event.clientY;
      gestureMoved = false;
      dragging = false;
      flickVelocity = 0;
      pending = 0;
      lastMoveTs = performance.now();
      gestureTile = event.target.closest ? event.target.closest('[data-tile-id]') : null;
      container.setPointerCapture?.(event.pointerId);
    };
    const onGestureMove = (event) => {
      if (viewerOpen() || wallEntering()) return;
      if (gesturePointer == null || event.pointerId !== gesturePointer) return;
      const dx = event.clientX - gestureStart.x;
      const dy = event.clientY - gestureStart.y;
      if (!gestureMoved) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        gestureMoved = true;
        gestureLastY = event.clientY;
        dragging = true;
        lockManual();
        return;
      }
      if (event.pointerType === 'mouse' && !event.buttons) return;
      const now = performance.now();
      const step = gestureLastY - event.clientY;
      const moveDt = Math.max(10, now - lastMoveTs) / 1000;
      const instant = step / moveDt;
      flickVelocity = (flickVelocity * 0.78) + (instant * 0.22);
      lastMoveTs = now;
      dragging = true;
      lockManual();
      queueShift(step);
      gestureLastY = event.clientY;
    };
    const onPointerUp = (event) => {
      if (gesturePointer == null || event.pointerId !== gesturePointer) return;
      const tile = gestureTile && container.contains(gestureTile)
        ? gestureTile
        : (event.target.closest ? event.target.closest('[data-tile-id]') : null);
      const shouldOpen = !gestureMoved && tile && container.contains(tile);
      if (dragging) {
        const now = performance.now();
        if (now - lastMoveTs > 80) flickVelocity *= 0.28;
        flickVelocity = Math.max(-360, Math.min(360, flickVelocity));
      }
      dragging = false;
      gesturePointer = null;
      gestureTile = null;
      if (shouldOpen) openTile(tile);
    };
    const onKeyActivate = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const tile = event.target.closest ? event.target.closest('[data-tile-id]') : null;
      if (!tile || !container.contains(tile)) return;
      event.preventDefault();
      openTile(tile);
    };
    const onWheel = (event) => {
      event.preventDefault();
      if (viewerOpen() || wallEntering()) return;
      lockManual();
      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      if (event.deltaMode === 2) delta *= container.clientHeight || window.innerHeight;
      queueShift(delta * 0.82);
      flickVelocity = Math.max(-280, Math.min(280, flickVelocity * 0.48 + delta * 0.9));
    };
    const onTouchMove = (event) => {
      if (!event.touches || event.touches.length !== 1) return;
      event.preventDefault();
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('focusin', onFocus);
    container.addEventListener('focusout', onBlur);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onGestureMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('keydown', onKeyActivate);
    const wheelTarget = overlay || container;
    wheelTarget.addEventListener('wheel', onWheel, { passive: false });
    wheelTarget.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      revealTiles.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('focusin', onFocus);
      container.removeEventListener('focusout', onBlur);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onGestureMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('keydown', onKeyActivate);
      wheelTarget.removeEventListener('wheel', onWheel);
      wheelTarget.removeEventListener('touchmove', onTouchMove);
      container.replaceChildren();
    };
  };

  const closeFilmWall = (immediate = false) => {
    const overlay = document.querySelector('.cmc-drift-overlay');
    if (!overlay || overlay.classList.contains('is-exiting')) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    overlay.classList.remove('is-portaling', 'is-revealing');
    overlay.setAttribute('aria-hidden', 'true');
    const finish = () => {
      document.documentElement.classList.remove('cmc-wall-open');
      window.dispatchEvent(new Event('cmc:plasma-pause'));
      if (typeof window.__cmcFilmWallDestroy === 'function') window.__cmcFilmWallDestroy();
      window.__cmcFilmWallDestroy = null;
      overlay.remove();
      window.__cmcFilmWallClose = null;
    };
    if (immediate || reduceMotion || !overlay.classList.contains('is-open')) {
      overlay.classList.remove('is-open', 'is-exiting');
      finish();
      return;
    }
    overlay.classList.add('is-exiting');
    window.setTimeout(() => {
      overlay.classList.remove('is-open', 'is-exiting');
      finish();
    }, 1380);
  };

  const openFilmWall = () => {
    const leftover = document.querySelector('.cmc-drift-overlay');
    if (leftover) {
      const hasWall = leftover.querySelector('.drift-wall');
      if (hasWall && leftover.classList.contains('is-open')) return;
      leftover.remove();
      window.__cmcFilmWallDestroy?.();
      window.__cmcFilmWallClose = null;
      document.documentElement.classList.remove('cmc-wall-open');
    }
    const overlay = document.createElement('div');
    overlay.className = 'cmc-drift-overlay';
    overlay.setAttribute('aria-hidden', 'false');
    overlay.innerHTML = `
      <div class="cmc-drift-portal" aria-hidden="true"></div>
      <div class="cmc-drift-overlay__bar">
        <div class="cmc-drift-overlay__copy">
          <span>VISUAL ARCHIVE</span>
          <strong>作品墙</strong>
        </div>
        <button class="cmc-drift-overlay__close" type="button" aria-label="关闭作品墙">&times;</button>
      </div>
      <div class="cmc-drift-overlay__stage"></div>
      <div class="cmc-drift-viewer" aria-hidden="true">
        <button class="cmc-drift-viewer__close" type="button" aria-label="关闭预览">&times;</button>
        <img alt="影像作品预览" />
      </div>
    `;
    document.body.appendChild(overlay);
    const stage = overlay.querySelector('.cmc-drift-overlay__stage');
    const closeButton = overlay.querySelector('.cmc-drift-overlay__close');
    const viewer = overlay.querySelector('.cmc-drift-viewer');
    const viewerImage = overlay.querySelector('.cmc-drift-viewer img');
    const viewerClose = overlay.querySelector('.cmc-drift-viewer__close');
    const closeViewer = () => {
      viewer.classList.remove('is-open');
      viewer.setAttribute('aria-hidden', 'true');
      viewerImage.removeAttribute('src');
    };
    const openViewer = (src, title) => {
      if (!src) return;
      viewerImage.src = src;
      viewerImage.alt = title || '影像作品预览';
      viewer.classList.add('is-open');
      viewer.setAttribute('aria-hidden', 'false');
    };
    window.__cmcFilmWallDestroy = mountDriftWall(stage, CMC_WALL_ITEMS, getFilmWallLayout(), { onSelect: openViewer });
    const onKeydown = (event) => {
      if (event.key !== 'Escape') return;
      if (viewer.classList.contains('is-open')) {
        closeViewer();
        return;
      }
      close();
    };
    const close = () => {
      document.removeEventListener('keydown', onKeydown);
      closeViewer();
      closeFilmWall();
    };
    closeButton.addEventListener('click', close);
    viewerClose.addEventListener('click', (event) => {
      event.stopPropagation();
      closeViewer();
    });
    viewer.addEventListener('click', (event) => {
      if (event.target === viewer) closeViewer();
    });
    document.addEventListener('keydown', onKeydown);
    window.__cmcFilmWallClose = close;
    document.documentElement.classList.add('cmc-wall-open');
    prefetchImages(CMC_WALL_ITEMS.map((item) => item.image), 3);
    window.dispatchEvent(new Event('cmc:plasma-pause'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      if (reduceMotion) return;
      overlay.classList.add('is-portaling');
      window.setTimeout(() => {
        overlay.classList.remove('is-portaling');
        overlay.classList.add('is-revealing');
      }, 1450);
      window.setTimeout(() => overlay.classList.remove('is-revealing'), 3000);
    });
  };

  const syncFilmHomeArchive = (about) => {
    if (document.querySelector('#film-details')) return;
    const section = document.createElement('section');
    section.id = 'film-details';
    section.className = 'cmc-film-home-details cmc-film-home-details--cards-only';
    section.innerHTML = `
      <div class="cmc-film-home-details__inner">
        <div class="cmc-film-home-detail-stage">
          <div class="cmc-film-home-details__subheading"><span>WHAT WE DO</span><h3>部门详情</h3></div>
          <div class="cmc-film-home-detail-grid" data-film-detail-swap aria-label="部门详情卡片，悬停暂停，点击卡片切换">
          <article><div class="cmc-film-home-detail-icon">01</div><h3>主要职能</h3><small>FUNCTIONS</small><p class="cmc-film-home-detail-lead">面向全系开放，<br>只要你抱有对影像的热爱，<br>尽情展现你的能力</p><ul><li>活动纪实 | 校园各类大小活动记录</li><li>深度叙事 | 微电影、纪录片策划与编导</li><li>视觉包装 | 校园宣传片与形象创意企划</li><li>幕后重塑 | 剪辑、调色与视觉特效</li></ul></article>
          <article><div class="cmc-film-home-detail-icon">02</div><h3>社团课程</h3><small>COURSES</small><p class="cmc-film-home-detail-lead">如果担心自己没有出色能力，<br>在这里，指导你创作出<br>独属于自己的青春记忆大片</p><ul><li>交流学习：作品分享与点评</li><li>相机应用：器材使用与基础操作</li><li>拍摄技巧：构图、光影与叙事</li><li>后期制作：剪辑、调色与特效</li></ul></article>
          <article><div class="cmc-film-home-detail-icon">03</div><h3>团队构成</h3><small>TEAM</small><ul><li>文编部：文案策划与内容撰写</li><li>摄制部：拍摄执行与影像创作</li><li>技术部：后期制作与技术支持</li></ul></article>
          </div>
        </div>
        <div class="cmc-film-home-archive">
          <div class="cmc-film-home-details__subheading"><span>VISUAL ARCHIVE</span><h3>影像档案</h3></div>
          <p>拖动最上方照片翻阅镜头，<br>点击任意一张进入作品墙。</p>
          <div class="cmc-film-image-stack cmc-film-home-image-stack" data-film-home-archive>
            <div class="cmc-film-image-stack__stage" aria-label="影视系影像作品集"></div>
            <div class="cmc-film-image-stack__count"><strong>20</strong><span>FRAME STUDIES</span></div>
          </div>
        </div>
      </div>`;
    const strengths = about.querySelector('#strengths');
    const aboutInner = about.querySelector('.relative.z-10') || about;
    if (strengths) strengths.insertAdjacentElement('afterend', section);
    else aboutInner.appendChild(section);
    about.classList.add('cmc-about-with-details');
    const archiveBlock = section.querySelector('.cmc-film-home-archive');
    if (archiveBlock) {
      const archiveSection = document.createElement('section');
      archiveSection.id = 'film-archive';
      archiveSection.className = 'cmc-film-home-details cmc-film-home-details--cards-only';
      const archiveInner = document.createElement('div');
      archiveInner.className = 'cmc-film-home-details__inner';
      archiveBlock.remove();
      archiveInner.appendChild(archiveBlock);
      archiveSection.appendChild(archiveInner);
      about.insertAdjacentElement('afterend', archiveSection);
    }

    const detailSwap = section.querySelector('[data-film-detail-swap]');
    const detailCards = detailSwap ? [...detailSwap.querySelectorAll('article')] : [];
    let detailOrder = detailCards.map((_, index) => index);
    let detailSwapFrame = null;
    let detailSwapBusy = false;
    const detailSwapReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const detailCardDistance = 35;
    const detailVerticalDistance = 75;
    const detailSkew = 6;
    const detailDropDistance = 140;
    const makeDetailSlot = (depth) => ({
      x: depth * detailCardDistance,
      y: depth * -detailVerticalDistance,
      z: depth * -detailCardDistance * 1.5,
      zIndex: detailCards.length - depth
    });
    const setDetailPose = (card, slot, extraY = 0) => {
      card.style.setProperty('--swap-x', `${slot.x}px`);
      card.style.setProperty('--swap-y', `${slot.y + extraY}px`);
      card.style.setProperty('--swap-z', `${slot.z}px`);
      card.style.transform = `translate3d(calc(-50% + ${slot.x}px), calc(-50% + ${slot.y + extraY}px), ${slot.z}px) skewY(${detailSkew}deg)`;
      card.style.zIndex = String(slot.zIndex);
    };
    const detailMaxStep = Math.max(0, detailCards.length - 1);
    let detailStep = 0;
    const detailAnimationEase = (value) => 1 - Math.pow(1 - Math.max(0, Math.min(1, value)), 2);
    const renderDetailStep = (step) => {
      const total = detailCards.length;
      detailStep = Math.max(0, Math.min(detailMaxStep, step));
      detailOrder = Array.from({ length: total }, (_, depth) => (detailStep + depth) % total);
      detailCards.forEach((card, index) => {
        const depth = detailOrder.indexOf(index);
        setDetailPose(card, makeDetailSlot(depth));
        card.setAttribute('aria-hidden', depth === 0 ? 'false' : 'true');
      });
    };
    const animateDetailStep = (direction, inputDelta = 100) => {
      if (detailSwapBusy || !detailCards.length) return false;
      const targetStep = detailStep + (direction > 0 ? 1 : -1);
      if (targetStep < 0 || targetStep > detailMaxStep) return false;
      if (detailSwapReducedMotion) {
        renderDetailStep(targetStep);
        return true;
      }
      const fromOrder = [...detailOrder];
      const toOrder = Array.from({ length: detailCards.length }, (_, depth) => (targetStep + depth) % detailCards.length);
      const startedAt = performance.now();
      const inputMagnitude = Math.min(420, Math.max(18, Math.abs(inputDelta)));
      const animationDuration = Math.round(520 - ((inputMagnitude - 18) / 402) * 280);
      const dropDistance = detailDropDistance;
      detailAnimatingFrom = detailStep;
      detailContinuousRelease = false;
      detailSwapBusy = true;
      const tick = (now) => {
        const raw = Math.min(1, (now - startedAt) / animationDuration);
        const progress = detailAnimationEase(raw);
        detailCards.forEach((card, index) => {
          const fromDepth = fromOrder.indexOf(index);
          const toDepth = toOrder.indexOf(index);
          const from = makeDetailSlot(fromDepth);
          const to = makeDetailSlot(toDepth);
          const slot = {
            x: from.x + (to.x - from.x) * progress,
            y: from.y + (to.y - from.y) * progress,
            z: from.z + (to.z - from.z) * progress,
            zIndex: direction > 0
              ? (fromDepth === 0 && raw < .48 ? detailCards.length : detailCards.length - toDepth)
              : (fromDepth === detailCards.length - 1 && raw < .52 ? 1 : detailCards.length - toDepth)
          };
          const extraY = direction > 0 && fromDepth === 0
            ? Math.sin(Math.PI * raw) * dropDistance
            : 0;
          setDetailPose(card, slot, extraY);
          const isFront = raw >= .55 ? toDepth === 0 : fromDepth === 0;
          card.setAttribute('aria-hidden', isFront ? 'false' : 'true');
        });
        if (raw < 1) {
          detailSwapFrame = window.requestAnimationFrame(tick);
          return;
        }
        detailSwapFrame = null;
        detailSwapBusy = false;
        renderDetailStep(targetStep);
        if (detailContinuousRelease && direction > 0) {
          const leftover = Math.max(48, detailQueuedMagnitude || 48);
          detailContinuousRelease = false;
          detailQueuedDirection = 0;
          detailQueuedMagnitude = 100;
          releaseDetailWithOverflow(leftover, true);
          return;
        }
        detailContinuousRelease = false;
        if (detailQueuedDirection && detailPinned) {
          const queuedDirection = detailQueuedDirection;
          const queuedMagnitude = detailQueuedMagnitude;
          detailQueuedDirection = 0;
          detailQueuedMagnitude = 100;
          window.requestAnimationFrame(() => queueDetailStep(
            queuedDirection,
            queuedDirection > 0 ? queuedMagnitude : -queuedMagnitude,
            queuedMagnitude
          ));
        }
      };
      detailSwapFrame = window.requestAnimationFrame(tick);
      return true;
    };
    const cancelDetailAnimation = () => {
      if (detailSwapFrame !== null) window.cancelAnimationFrame(detailSwapFrame);
      detailSwapFrame = null;
      detailSwapBusy = false;
      detailContinuousRelease = false;
      renderDetailStep(detailStep);
    };
    const onDetailCardClick = (event) => {
      if (event.currentTarget.getAttribute('aria-hidden') === 'true' || detailSwapBusy) return;
      animateDetailStep(1);
    };
    detailCards.forEach((card) => card.addEventListener('click', onDetailCardClick));
    renderDetailStep(0);

    let detailPinned = false;
    let detailCycleComplete = false;
    let detailPointerLastY = null;
    let detailPointerLastTime = null;
    let detailTouchConsumed = false;
    let detailWheelGestureLocked = false;
    let detailWheelUnlockTimer = null;
    let detailSettleFrame = null;
    let detailPendingDirection = 0;
    let detailPendingMagnitude = 100;
    let detailQueuedDirection = 0;
    let detailQueuedMagnitude = 100;
    let detailPinSettling = false;
    let detailAnimatingFrom = 0;
    let detailContinuousRelease = false;
    let detailIgnorePinUntil = 0;
    const lockDetailWheelGesture = () => {
      detailWheelGestureLocked = true;
      if (detailWheelUnlockTimer !== null) return;
      // Trackpads emit a burst of wheel events for one gesture. Use one
      // bounded gate for the burst so continuous hardware events cannot
      // leave the state machine permanently locked.
      detailWheelUnlockTimer = window.setTimeout(() => {
        detailWheelGestureLocked = false;
        detailWheelUnlockTimer = null;
      }, 260);
    };
    const detailStage = section.querySelector('.cmc-film-home-detail-stage');
    const getDetailPinTop = () => {
      if (!detailStage) return 0;
      const viewportOffset = Math.min(120, Math.max(96, window.innerHeight * .115));
      const desired = Math.max(0, Math.round(detailStage.getBoundingClientRect().top + window.scrollY - viewportOffset));
      const pageMax = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(desired, pageMax);
    };
    const pinDetailStage = () => {
      if (!detailStage || !window.__cmcOpeningComplete) return;
      if (performance.now() < detailIgnorePinUntil) return;
      const pinTop = getDetailPinTop();
      if (detailPinned) return;
      detailPinned = true;
      document.documentElement.classList.add('cmc-detail-pinned');
      window.__cmcResetPageScroll?.(pinTop);
      detailPinSettling = false;
    };
    const releaseDetailStage = () => {
      detailPinned = false;
      detailPinSettling = false;
      document.documentElement.classList.remove('cmc-detail-pinned');
      detailIgnorePinUntil = performance.now() + 420;
    };
    const resetDetailStage = () => {
      cancelDetailAnimation();
      detailStep = 0;
      detailCycleComplete = false;
      renderDetailStep(0);
    };
    const normalizeWheelDelta = (event) => event.deltaMode === 1
      ? event.deltaY * 16
      : event.deltaMode === 2
        ? event.deltaY * window.innerHeight
        : event.deltaY;
    const releaseDetailWithOverflow = (overflow, complete) => {
      const pinTop = getDetailPinTop();
      if (detailSettleFrame !== null) window.cancelAnimationFrame(detailSettleFrame);
      detailSettleFrame = null;
      detailPendingDirection = 0;
      detailPendingMagnitude = 100;
      detailQueuedDirection = 0;
      detailQueuedMagnitude = 100;
      cancelDetailAnimation();
      releaseDetailStage();
      detailTouchConsumed = false;
      detailCycleComplete = complete;
      const leaveDelta = complete
        ? Math.max(56, overflow || 0)
        : -Math.max(56, Math.abs(overflow || 0));
      (window.__cmcSmoothPageScrollTo || window.__cmcResetPageScroll)?.(Math.max(0, pinTop + leaveDelta));
    };
    const queueDetailStep = (direction, overflow, inputMagnitude = Math.abs(overflow)) => {
      if (detailSwapBusy) {
        if (direction > 0 && detailAnimatingFrom === 1) {
          detailContinuousRelease = true;
          detailQueuedDirection = 0;
          detailQueuedMagnitude = Math.max(48, inputMagnitude);
          return;
        }
        detailQueuedDirection = direction;
        detailQueuedMagnitude = inputMagnitude;
        return;
      }
      const targetStep = detailStep + (direction > 0 ? 1 : -1);
      if (targetStep < 0 || targetStep > detailMaxStep) {
        releaseDetailWithOverflow(overflow, direction > 0);
        return;
      }
      if (Math.abs(window.scrollY - getDetailPinTop()) <= 8) {
        animateDetailStep(direction, inputMagnitude);
        return;
      }
      detailPendingDirection = direction;
      detailPendingMagnitude = inputMagnitude;
      if (detailSettleFrame !== null) return;
      const settleStartedAt = performance.now();
      const waitForPin = () => {
        detailSettleFrame = null;
        if (!detailPinned || !detailPendingDirection) return;
        const pinTop = getDetailPinTop();
        if (Math.abs(window.scrollY - pinTop) > 2 && performance.now() - settleStartedAt < 1200) {
          detailSettleFrame = window.requestAnimationFrame(waitForPin);
          return;
        }
        if (Math.abs(window.scrollY - pinTop) > 2) window.__cmcResetPageScroll?.(pinTop);
        const pendingDirection = detailPendingDirection;
        const pendingMagnitude = detailPendingMagnitude;
        detailPendingDirection = 0;
        detailPendingMagnitude = 100;
        animateDetailStep(pendingDirection, pendingMagnitude);
      };
      detailSettleFrame = window.requestAnimationFrame(waitForPin);
    };
    const consumeDetailInput = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    const enforceDetailBoundary = () => {
      if (!detailStage) return;
      if (!window.__cmcOpeningComplete) {
        if (window.scrollY > 0) window.__cmcResetPageScroll?.(0);
        return;
      }
      if (performance.now() < detailIgnorePinUntil) return;
      const pinTop = getDetailPinTop();
      const scrollTop = window.scrollY;
      if (!detailPinned) {
        if (detailCycleComplete && scrollTop <= pinTop) {
          window.__cmcResetPageScroll?.(pinTop);
          detailStep = detailMaxStep;
          renderDetailStep(detailStep);
          detailCycleComplete = false;
          pinDetailStage();
        } else if (!detailCycleComplete && scrollTop >= pinTop) {
          window.__cmcResetPageScroll?.(pinTop);
          pinDetailStage();
        }
        return;
      }
      if (detailPinSettling) {
        if (Math.abs(scrollTop - pinTop) <= 2) detailPinSettling = false;
        return;
      }
      if (Math.abs(scrollTop - pinTop) > 1) window.__cmcResetPageScroll?.(pinTop);
    };
    const handleDetailWheel = (event) => {
      if (!detailStage || !window.__cmcOpeningComplete || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const delta = normalizeWheelDelta(event);
      if (!delta) return;
      const pinTop = getDetailPinTop();
      const scrollTop = window.scrollY;
      if (!detailPinned) {
        if (detailCycleComplete) {
          if (delta < 0 && Math.abs(scrollTop - pinTop) <= 8) {
            consumeDetailInput(event);
            detailStep = detailMaxStep;
            renderDetailStep(detailStep);
            detailCycleComplete = false;
            pinDetailStage();
          }
          return;
        }
        if (delta > 0 && Math.abs(scrollTop - pinTop) <= 8) {
          consumeDetailInput(event);
          pinDetailStage();
        }
        return;
      }
      if (detailWheelGestureLocked) {
        consumeDetailInput(event);
        return;
      }
      consumeDetailInput(event);
      lockDetailWheelGesture();
      if (delta > 0) {
        queueDetailStep(1, delta);
      } else if (delta < 0) {
        queueDetailStep(-1, delta);
      }
    };
    const handleDetailTouchStart = (event) => {
      if (!detailStage || !event.touches[0]) return;
      detailPointerLastY = event.touches[0].clientY;
      detailPointerLastTime = performance.now();
      detailTouchConsumed = false;
    };
    const handleDetailTouchMove = (event) => {
      if (!detailStage || !window.__cmcOpeningComplete || detailPointerLastY === null || !event.touches[0]) return;
      const currentY = event.touches[0].clientY;
      const delta = detailPointerLastY - currentY;
      const now = performance.now();
      const elapsed = Math.max(8, now - (detailPointerLastTime ?? now));
      const touchVelocity = Math.abs(delta) / elapsed;
      detailPointerLastY = currentY;
      detailPointerLastTime = now;
      if (Math.abs(delta) < 1) return;
      if (detailTouchConsumed) {
        if (delta > 0 && detailSwapBusy && detailAnimatingFrom === 1) {
          detailContinuousRelease = true;
          detailQueuedMagnitude = Math.max(48, Math.abs(delta) * 1.8);
          consumeDetailInput(event);
          return;
        }
        if (!detailPinned) return;
        consumeDetailInput(event);
        return;
      }
      const pinTop = getDetailPinTop();
      const scrollTop = window.scrollY;
      if (!detailPinned && detailCycleComplete) {
        if (delta < 0 && Math.abs(scrollTop - pinTop) <= 8) {
          consumeDetailInput(event);
          detailStep = detailMaxStep;
          renderDetailStep(detailStep);
          detailCycleComplete = false;
          pinDetailStage();
          detailTouchConsumed = true;
        }
        return;
      }
      if (!detailPinned && delta > 0 && scrollTop >= pinTop - 8) {
        consumeDetailInput(event);
        pinDetailStage();
        detailTouchConsumed = true;
        return;
      }
      if (!detailPinned) return;
      consumeDetailInput(event);
      detailTouchConsumed = true;
      const inputMagnitude = Math.max(Math.abs(delta) * 1.8, Math.min(420, touchVelocity * 320));
      if (delta > 0) {
        queueDetailStep(1, delta, inputMagnitude);
      } else if (delta < 0) {
        queueDetailStep(-1, delta, inputMagnitude);
      }
    };
    const handleDetailTouchEnd = () => {
      detailPointerLastY = null;
      detailPointerLastTime = null;
      detailTouchConsumed = false;
    };
    window.__cmcGetDetailPinTop = getDetailPinTop;
    window.__cmcPinDetailStage = pinDetailStage;
    window.__cmcReleaseDetailStage = () => {
      releaseDetailStage();
      resetDetailStage();
    };
    window.__cmcDetailCycleComplete = () => detailCycleComplete;
    window.addEventListener('wheel', handleDetailWheel, { capture: true, passive: false });
    window.addEventListener('scroll', enforceDetailBoundary, { passive: true });
    window.addEventListener('touchstart', handleDetailTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', handleDetailTouchMove, { capture: true, passive: false });
    window.addEventListener('touchend', handleDetailTouchEnd, { capture: true, passive: true });
    if (window.__cmcOpeningComplete) enforceDetailBoundary();
    else {
      window.scrollTo(0, 0);
      window.addEventListener('cmc:opening-complete', () => {
        window.__cmcReleaseDetailStage?.();
        window.__cmcResetPageScroll?.(0);
      }, { once: true });
    }
    window.__cmcFilmHomeDetailSwapCleanup = () => {
      cancelDetailAnimation();
      if (detailSwapFrame) window.cancelAnimationFrame(detailSwapFrame);
      if (detailSettleFrame) window.cancelAnimationFrame(detailSettleFrame);
      detailSettleFrame = null;
      detailPendingDirection = 0;
      detailPendingMagnitude = 100;
      detailQueuedDirection = 0;
      detailQueuedMagnitude = 100;
      detailAnimatingFrom = 0;
      detailContinuousRelease = false;
      detailCards.forEach((card) => card.removeEventListener('click', onDetailCardClick));
      window.removeEventListener('wheel', handleDetailWheel, true);
      window.removeEventListener('scroll', enforceDetailBoundary);
      window.removeEventListener('touchstart', handleDetailTouchStart, true);
      window.removeEventListener('touchmove', handleDetailTouchMove, true);
      window.removeEventListener('touchend', handleDetailTouchEnd, true);
      if (detailWheelUnlockTimer !== null) window.clearTimeout(detailWheelUnlockTimer);
      detailWheelUnlockTimer = null;
      detailWheelGestureLocked = false;
      document.documentElement.classList.remove('cmc-detail-pinned');
      window.__cmcGetDetailPinTop = null;
      window.__cmcPinDetailStage = null;
      window.__cmcReleaseDetailStage = null;
      window.__cmcDetailCycleComplete = null;
      window.__cmcFilmHomeDetailSwapCleanup = null;
    };

    const stage = document.querySelector('#film-archive .cmc-film-image-stack__stage') || section.querySelector('.cmc-film-image-stack__stage');
    if (!stage) return;
    const imageOrder = [12, 4, 18, 7, 1, 15, 5, 20, 9, 3, 14, 6, 19, 10, 2, 17, 8, 13, 16, 11];
    const cards = imageOrder.map((imageIndex, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'cmc-film-image-card';
      card.dataset.stackIndex = String(index);
      const source = `/assets/film-stack-v3/film-${String(imageIndex).padStart(2, '0')}.webp`;
      card.innerHTML = `<img ${index < 5 ? `src="${source}"` : `data-src="${source}"`} alt="影视系影像作品 ${index + 1}" loading="${index < 5 ? 'eager' : 'lazy'}" decoding="async" draggable="false" />`;
      stage.appendChild(card);
      return card;
    });
    const lightbox = document.createElement('div');
    lightbox.className = 'cmc-film-image-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = '<button class="cmc-film-image-lightbox__close" type="button" aria-label="关闭预览">&times;</button><img alt="影视系影像作品预览" />';
    document.body.appendChild(lightbox);
    const lightboxImage = lightbox.querySelector('img');
    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImage.removeAttribute('src');
    };
    const handleLightboxClick = (event) => {
      if (event.target === lightbox || event.target.closest('.cmc-film-image-lightbox__close')) closeLightbox();
    };
    const handleLightboxKeydown = (event) => { if (event.key === 'Escape') closeLightbox(); };
    lightbox.addEventListener('click', handleLightboxClick);
    document.addEventListener('keydown', handleLightboxKeydown);

    let order = cards.map((_, index) => index);
    let activeCard = null;
    let activePointer = null;
    let startX = 0;
    let startY = 0;
    let moved = false;
    const render = () => cards.forEach((card, index) => {
      const depth = order.indexOf(index);
      const visibleDepth = cards.length - 1 - depth;
      const isVisible = visibleDepth < 5;
      const image = card.querySelector('img');
      if (isVisible && image?.dataset.src && !image.getAttribute('src')) image.src = image.dataset.src;
      card.style.setProperty('--visible-depth', Math.min(visibleDepth, 4));
      card.classList.toggle('is-top', visibleDepth === 0);
      card.style.zIndex = isVisible ? String(10 - visibleDepth) : '1';
      card.style.opacity = isVisible ? '1' : '0';
      card.style.visibility = isVisible ? 'visible' : 'hidden';
      card.style.pointerEvents = visibleDepth === 0 ? 'auto' : 'none';
    });
    const resetDrag = () => {
      if (!activeCard) return;
      activeCard.classList.remove('is-dragging');
      activeCard.style.removeProperty('--drag-x');
      activeCard.style.removeProperty('--drag-y');
      activeCard.style.removeProperty('--drag-rotate');
    };
    const onPointerDown = (event) => {
      const card = event.currentTarget;
      if (order[order.length - 1] !== Number(card.dataset.stackIndex)) return;
      activeCard = card;
      activePointer = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      moved = false;
      card.setPointerCapture?.(event.pointerId);
      card.classList.add('is-dragging');
    };
    const onPointerMove = (event) => {
      if (!activeCard || event.pointerId !== activePointer) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      moved ||= Math.abs(dx) > 4 || Math.abs(dy) > 4;
      activeCard.style.setProperty('--drag-x', `${dx}px`);
      activeCard.style.setProperty('--drag-y', `${dy}px`);
      activeCard.style.setProperty('--drag-rotate', `${Math.max(-12, Math.min(12, dx / 18))}deg`);
    };
    const onPointerUp = (event) => {
      if (!activeCard || event.pointerId !== activePointer) return;
      const card = activeCard;
      const dx = event.clientX - startX;
      resetDrag();
      if (moved && Math.abs(dx) > 72) {
        order.unshift(order.pop());
        render();
      } else if (!moved) {
        openFilmWall();
      }
      activeCard = null;
      activePointer = null;
    };
    cards.forEach((card) => {
      card.addEventListener('pointerdown', onPointerDown);
      card.addEventListener('pointermove', onPointerMove);
      card.addEventListener('pointerup', onPointerUp);
      card.addEventListener('pointercancel', onPointerUp);
    });
    render();
    window.__cmcFilmHomeArchiveCleanup = () => {
      window.__cmcFilmWallClose?.();
      window.__cmcFilmHomeDetailSwapCleanup?.();
      cards.forEach((card) => {
        card.removeEventListener('pointerdown', onPointerDown);
        card.removeEventListener('pointermove', onPointerMove);
        card.removeEventListener('pointerup', onPointerUp);
        card.removeEventListener('pointercancel', onPointerUp);
      });
      lightbox.removeEventListener('click', handleLightboxClick);
      document.removeEventListener('keydown', handleLightboxKeydown);
      lightbox.remove();
      document.getElementById('film-archive')?.remove();
      section.remove();
      window.__cmcFilmHomeArchiveCleanup = null;
    };
  };

  const syncFilmHomeContent = () => {
    const root = document.getElementById('root');
    if (window.location.pathname !== '/') {
      window.__cmcFilmHomeArchiveCleanup?.();
      if (root) delete root.dataset.cmcFilmHomeSynced;
      return;
    }
    const hero = document.querySelector('#hero');
    const about = document.querySelector('#about');
    if (!root || !hero || !about || root.dataset.cmcFilmHomeSynced === 'true') return;

    root.dataset.cmcFilmHomeSynced = 'true';

    document.title = '影视系 | 校园影像创作平台';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', '影视系校园影像创作平台，记录校园时光，涵盖策划、拍摄、剪辑与视觉叙事实践。');

    const heroEyebrow = hero.querySelector('.inline-flex span.text-sm');
    if (heroEyebrow) heroEyebrow.textContent = '影视系 · FILM & VIDEO';
    const heroTitle = hero.querySelector('.animate-fade-up.font-display .flex.flex-col');
    if (heroTitle) {
      const titleUid = `cmc-film-title-${Date.now().toString(36)}`;
      heroTitle.innerHTML = `<div class="cmc-film-home-title" role="img" aria-label="\u5f71\u89c6\u7cfb"><svg viewBox="0 0 1200 330" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="cmc-film-title-gradient" x1="0" x2="1"><stop stop-color="#38bdf8" offset="0"/><stop stop-color="#55d8fa" offset=".56"/><stop stop-color="#67e8f9" offset="1"/></linearGradient><linearGradient id="${titleUid}-gradient" x1="0" x2="1"><stop stop-color="#38bdf8" offset="0"/><stop stop-color="#55d8fa" offset=".56"/><stop stop-color="#67e8f9" offset="1"/></linearGradient><clipPath id="cmc-film-title-wipe" clipPathUnits="userSpaceOnUse"><rect class="cmc-film-title-wipe" x="0" y="0" width="0" height="330"/></clipPath><clipPath id="${titleUid}-wipe" clipPathUnits="userSpaceOnUse"><rect class="cmc-film-title-wipe" x="0" y="0" width="0" height="330"/></clipPath></defs><g class="cmc-film-title-strokes"><text x="150" y="246">\u5f71</text><text x="445" y="246">\u89c6</text><text x="740" y="246">\u7cfb</text></g><g class="cmc-film-title-fill" clip-path="url(#cmc-film-title-wipe)"><text x="150" y="246" fill="url(#cmc-film-title-gradient)">\u5f71</text><text x="445" y="246" fill="url(#cmc-film-title-gradient)">\u89c6</text><text x="740" y="246" fill="url(#cmc-film-title-gradient)">\u7cfb</text></g></svg></div>`;
      startFilmHeroTitleMotion(heroTitle.querySelector('.cmc-film-home-title'));
    }
    const heroCopy = hero.querySelector('p');
    if (heroCopy) heroCopy.innerHTML = '以镜头为笔，书写校园故事。<br class="sm:hidden">记录校园时光，完成从策划到成片的完整创作。';
    hero.querySelectorAll('.bg-mega-text').forEach((node, index) => {
      node.textContent = index === 0 ? 'FILM' : 'VIDEO';
    });

    const aboutEyebrow = about.querySelector('.inline-flex span.text-xs, .inline-flex span.text-sm');
    if (aboutEyebrow) aboutEyebrow.textContent = 'FILM DEPARTMENT';
    const aboutDepth = [...about.querySelectorAll('.depth-text')];
    if (aboutDepth[0]) updateDepthText(aboutDepth[0], '影视');
    if (aboutDepth[1]) updateDepthText(aboutDepth[1], '系');
    const aboutLead = about.querySelector('p.text-xl, p.text-2xl');
    if (aboutLead) aboutLead.innerHTML = '以热爱入局，成就不被定义的校园影像<br><span class="text-gradient">每一次记录，都是一次创作。</span>';
    const aboutBody = aboutLead?.parentElement?.querySelector('p.text-sm, p.text-base');
    if (aboutBody) aboutBody.innerHTML = '影像不止于器材<br>如果你手握相机，这里是你的绝对主场，期待你用极致热爱记录校园；<br>如果你没有设备，只要怀揣一丝好奇，这里亦有你的专属机位<br>从策划、出镜到后期，多元剧组岗位全面开放<br>零基础，高包容，把故事交给时间，把创造交给你';
    aboutLead?.parentElement?.querySelector('div.flex.flex-wrap')?.remove();

    const statValues = [
      ['60+', '年均作品', 'WORKS / YEAR'],
      ['120+', '成员规模', 'MEMBERS'],
      ['12', '设备套数', 'KITS']
    ];
    [...about.querySelectorAll('#strengths > div')].forEach((card, index) => {
      const data = statValues[index];
      if (!data) return;
      const leaves = [...card.querySelectorAll('*')].filter((node) => node.children.length === 0);
      const value = leaves.find((node) => /^(200\+|50\+|80\+)$/.test(node.textContent.trim()));
      const label = leaves.find((node) => /^(成员人数|历史荣誉|年均活动)$/.test(node.textContent.trim()));
      const en = leaves.find((node) => /^(MEMBERS|AWARDS|EVENTS)$/.test(node.textContent.trim()));
      if (value) value.textContent = data[0];
      if (label) label.textContent = data[1];
      if (en) en.textContent = data[2];
    });

    const featureCards = [...about.querySelectorAll('.border-glow-card')].filter((card) =>
      ['影视创作', '声音传播', '舞台表达', '从0到1的剧本课', '实战上手，不怕拍烂', '调色剪辑，质感拉满'].includes(card.querySelector('h3')?.textContent.trim())
    );
    if (featureCards.length && !about.querySelector('.cmc-activity-gallery')) {
      const featureGrid = featureCards[0].closest('.mt-16, .mt-20, .grid') || featureCards[0].parentElement;
      const gallery = document.createElement('section');
      gallery.className = 'cmc-activity-gallery';
      gallery.setAttribute('aria-label', '校园活动记录');
      gallery.innerHTML = `
        <div class="cmc-activity-gallery__intro">
          <span>CAMPUS RECORDS</span>
          <h3>活动纪实</h3>
          <p>我们负责校园的活动记录，把仪式、舞台与赛场里的瞬间留下来。</p>
        </div>
        <figure class="cmc-activity-gallery__hero">
          <img src="/assets/activity-01.webp" alt="成人宣誓仪式" loading="lazy" decoding="async">
          <figcaption>成人宣誓</figcaption>
        </figure>
        <div class="cmc-activity-gallery__pair">
          <figure>
            <img src="/assets/activity-02.webp" alt="红五月合唱节" loading="lazy" decoding="async">
            <figcaption>合唱节</figcaption>
          </figure>
          <figure>
            <img src="/assets/activity-03.webp" alt="军训敬礼" loading="lazy" decoding="async">
            <figcaption>军训</figcaption>
          </figure>
        </div>
        <figure class="cmc-activity-gallery__wide">
          <img src="/assets/activity-04.webp" alt="田径接力" loading="lazy" decoding="async">
          <figcaption>田径接力</figcaption>
        </figure>`;
      if (featureGrid && featureGrid.parentElement) featureGrid.replaceWith(gallery);
      else if (featureCards[0].parentElement) featureCards[0].parentElement.insertAdjacentElement('beforebegin', gallery);
      featureCards.forEach((card) => {
        const wrap = card.closest('.h-full');
        (wrap || card).remove();
      });
    }

    const courseCopy = [
      ['你将创造什么', '从校园微电影到个人专属Vlog，带你记录每一个高光时刻！', ['活动跟拍', '人物专访']],
      ['零基础指南', '保姆级教学！从手机随手拍到单反大片，带你掌握光影和讲故事的能力', ['手机/单反实操', '构图光影']],
      ['后期魔法工坊', '一键调出电影感！学剪辑，后期与调色，创造出属于你自己的艺术', []],
      ['社团氛围', '脑洞大开，氛围超好，与同学们共同交流学习，提升个人能力', []]
    ];
    const courseCards = [...about.querySelectorAll('.border-glow-card')].filter((card) =>
      ['摄影技巧教学', '交流与分享', '影视制作课程', '主持与表达', '你将创造什么', '零基础指南', '后期魔法工坊', '社团氛围'].includes(card.querySelector('h3')?.textContent.trim())
    );
    courseCards.forEach((card, index) => {
      const data = courseCopy[index];
      if (!data) return;
      const heading = card.querySelector('h3');
      const description = card.querySelector('p');
      if (heading) heading.textContent = data[0];
      if (description) description.textContent = data[1];
      const tagWrap = card.querySelector('.flex.flex-wrap') || card.querySelector('.mt-6.flex');
      const tags = [...(tagWrap ? tagWrap.querySelectorAll('span') : card.querySelectorAll('span.py-1.font-semibold'))];
      tags.forEach((tag, tagIndex) => {
        if (data[2][tagIndex]) tag.textContent = data[2][tagIndex];
        else tag.remove();
      });
      if (!data[2].length && tagWrap && !tagWrap.querySelector('span')) tagWrap.remove();
    });

    if (!about.querySelector('.cmc-youth-gallery')) {
      const gallery = document.createElement('section');
      gallery.className = 'cmc-activity-gallery cmc-youth-gallery';
      gallery.setAttribute('aria-label', '青春印记');
      gallery.innerHTML = `
        <div class="cmc-activity-gallery__intro">
          <span>YOUTH IMPRINTS</span>
          <h3>青春印记</h3>
          <p>我们记录青春的印记，把舞台、赛场与日常里那些刚刚好的瞬间留下来。</p>
        </div>
        <figure class="cmc-activity-gallery__hero">
          <img src="/assets/youth-01.webp" alt="舞台现场" loading="lazy" decoding="async">
          <figcaption>舞台现场</figcaption>
        </figure>
        <div class="cmc-activity-gallery__pair">
          <figure>
            <img src="/assets/youth-02.webp" alt="十大歌手" loading="lazy" decoding="async">
            <figcaption>十大歌手</figcaption>
          </figure>
          <figure>
            <img src="/assets/youth-04.webp" alt="操场广播" loading="lazy" decoding="async">
            <figcaption>操场广播</figcaption>
          </figure>
        </div>
        <figure class="cmc-activity-gallery__wide">
          <img src="/assets/youth-03.webp" alt="微光时刻" loading="lazy" decoding="async">
          <figcaption>微光时刻</figcaption>
        </figure>`;
      const courseWrap = courseCards[0] && (courseCards[0].closest('.mt-20') || courseCards[0].closest('.grid') && courseCards[0].closest('.grid').parentElement);
      if (courseWrap && courseWrap.parentElement) courseWrap.insertAdjacentElement('afterend', gallery);
      else {
        const aboutInner = about.querySelector('.relative.z-10') || about;
        aboutInner.appendChild(gallery);
      }
    }

        const contact = document.querySelector('#contact');
    const contactHeading = contact?.querySelector('h2');
    if (contactHeading) contactHeading.innerHTML = '加入<span class="text-gradient">影视系</span><br>一起创作。';
    const contactCopy = contact?.querySelector('h2')?.parentElement?.querySelector('p');
    if (contactCopy) contactCopy.textContent = '无论你是否拥有相机、掌握相应技术，只要热爱记录，欢迎加入影视系。';

    syncFilmHomeArchive(about);

    document.querySelectorAll('footer *').forEach((node) => {
      if (node.children.length === 0 && node.textContent.includes('融媒体中心')) {
        node.textContent = node.textContent.replaceAll('融媒体中心', '影视系');
      }
    });

    document.querySelectorAll('#root *').forEach((node) => {
      if (node.children.length !== 0 || !node.textContent.includes('融媒体')) return;
      node.textContent = node.textContent.replaceAll('融媒体中心', '影视系').replaceAll('融媒体', '影视系');
    });
  };

  const remove = () => {
    syncFilmHomeContent();
    document.querySelector('#departments')?.remove();
    document.querySelectorAll('a[href="#departments"], a[href^="/department/"]').forEach((link) => link.remove());
    document.querySelectorAll('footer div').forEach((block) => {
      const text = block.textContent?.replace(/\s+/g, ' ').trim() || '';
      if (/DEPARTMENTS/i.test(text) && /影视系|广播系|戏剧/.test(text)) block.remove();
    });
  };
  remove();
  const root = document.getElementById('root');
  if (root) new MutationObserver(remove).observe(root, { childList: true, subtree: true });
})();
