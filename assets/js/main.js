/* Wedding Visharad — interactions & animation (vanilla JS) */
(function(){
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function(){
        splitHeadings();
        initHeader();
        initMobileMenu();
        initHeroSlider();
        initReveal();
        initCounters();
        initParallax();
        initTestimonials();
        initNavDrop();
        initGallery();
        initLightbox();
        initForm();
        initToTop();
        document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = Math.max(2027, new Date().getFullYear()); });
    });

    /* ---------- preloader ---------- */
    function hideLoader(){
        var l = document.querySelector('.loader');
        if(l && !l.classList.contains('is-done')){
            l.classList.add('is-done');
            document.body.classList.add('is-loaded');
        }
    }
    window.addEventListener('load', function(){ setTimeout(hideLoader, 900); });
    setTimeout(hideLoader, 3200);

    /* ---------- split headings into words ---------- */
    function splitHeadings(){
        document.querySelectorAll('[data-split]').forEach(function(el){
            var i = 0;
            (function walk(node){
                Array.prototype.slice.call(node.childNodes).forEach(function(child){
                    if(child.nodeType === 3){
                        var frag = document.createDocumentFragment();
                        child.textContent.split(/(\s+)/).forEach(function(part){
                            if(!part) return;
                            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
                            var w = document.createElement('span'); w.className = 'w';
                            var inner = document.createElement('span'); inner.textContent = part;
                            inner.style.setProperty('--wi', i++);
                            w.appendChild(inner); frag.appendChild(w);
                        });
                        node.replaceChild(frag, child);
                    } else if(child.nodeType === 1 && child.tagName !== 'BR'){
                        walk(child);
                    }
                });
            })(el);
        });
    }

    /* ---------- header ---------- */
    function initHeader(){
        var hdr = document.querySelector('.hdr');
        if(!hdr) return;
        var last = 0;
        var progress = hdr.querySelector('.hdr__progress');
        function onScroll(){
            var y = window.scrollY;
            if(progress){
                var max = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
            }
            hdr.classList.toggle('is-scrolled', y > 80);
            hdr.classList.toggle('is-hidden', y > 500 && y > last && !document.body.classList.contains('is-locked'));
            last = y;
        }
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- mobile menu ---------- */
    function initMobileMenu(){
        var btn = document.querySelector('.burger');
        var menu = document.querySelector('.mmenu');
        if(!btn || !menu) return;
        function set(open){
            btn.classList.toggle('is-open', open);
            menu.classList.toggle('is-open', open);
            document.body.classList.toggle('is-locked', open);
            document.body.classList.toggle('menu-open', open);
            btn.setAttribute('aria-expanded', open);
        }
        btn.addEventListener('click', function(){ set(!menu.classList.contains('is-open')); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ set(false); }); });
        document.addEventListener('keydown', function(e){ if(e.key === 'Escape') set(false); });
    }

    /* ---------- hero slider ---------- */
    function initHeroSlider(){
        var slides = document.querySelectorAll('.hero__slide');
        if(slides.length < 2) return;
        var i = 0;
        function go(n){
            slides[i].classList.remove('is-active');
            i = (n + slides.length) % slides.length;
            slides[i].classList.add('is-active');
        }
        setInterval(function(){ go(i + 1); }, 6000);
    }

    /* ---------- scroll reveal ---------- */
    function initReveal(){
        var els = document.querySelectorAll('.rv, .rv-left, .rv-right, .rv-fade, .rv-img, [data-split], .process');
        if(reduceMotion || !('IntersectionObserver' in window)){
            els.forEach(function(el){ el.classList.add('in'); });
            return;
        }
        document.querySelectorAll('[data-stagger]').forEach(function(group){
            var step = parseInt(group.getAttribute('data-stagger'), 10) || 120;
            Array.prototype.forEach.call(group.children, function(child, idx){
                child.style.transitionDelay = (idx * step) + 'ms';
            });
        });
        var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
                if(e.isIntersecting){
                    var el = e.target;
                    el.classList.add('in'); io.unobserve(el);
                    // drop the stagger delay once revealed so hover transitions respond instantly
                    if(el.style.transitionDelay){ setTimeout(function(){ el.style.transitionDelay = ''; }, parseInt(el.style.transitionDelay, 10) + 1300); }
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        els.forEach(function(el){
            if(el.closest('.hero, .phero')){ setTimeout(function(){ el.classList.add('in'); }, 1100); return; }
            io.observe(el);
        });

        // safety net: never leave content invisible if the observer misses an element
        function sweep(){
            els.forEach(function(el){
                if(el.classList.contains('in')) return;
                var r = el.getBoundingClientRect();
                if(r.top < window.innerHeight && r.bottom > 0){ el.classList.add('in'); io.unobserve(el); }
            });
        }
        window.addEventListener('load', sweep);
        window.addEventListener('scroll', sweep, { passive: true });
        setTimeout(sweep, 1500);
    }

    /* ---------- counters ---------- */
    function initCounters(){
        var nums = document.querySelectorAll('[data-count]');
        if(!nums.length) return;
        var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
                if(!e.isIntersecting) return;
                io.unobserve(e.target);
                var el = e.target, end = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 2200;
                if(reduceMotion){ el.textContent = end; return; }
                (function tick(t){
                    if(!t0) t0 = t;
                    var p = Math.min((t - t0) / dur, 1);
                    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
                    if(p < 1) requestAnimationFrame(tick);
                })(performance.now());
            });
        }, { threshold: 0.6 });
        nums.forEach(function(n){ io.observe(n); });
    }

    /* ---------- parallax ---------- */
    function initParallax(){
        var items = document.querySelectorAll('[data-parallax]');
        if(!items.length || reduceMotion) return;
        var ticking = false;
        function update(){
            var vh = window.innerHeight;
            items.forEach(function(el){
                var r = el.parentElement.getBoundingClientRect();
                if(r.bottom < 0 || r.top > vh) return;
                var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
                var offset = Math.max(-160, Math.min(160, (r.top + r.height / 2 - vh / 2) * -speed));
                el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
            });
            ticking = false;
        }
        window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(update); ticking = true; } }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    /* ---------- testimonials ---------- */
    function initTestimonials(){
        var root = document.querySelector('.tslider');
        if(!root) return;
        var slides = root.querySelectorAll('.tslide');
        var dotsWrap = root.querySelector('.tdots');
        var i = 0, timer;
        slides.forEach(function(_, n){
            var d = document.createElement('button');
            d.type = 'button'; d.setAttribute('aria-label', 'Testimonial ' + (n + 1));
            d.addEventListener('click', function(){ go(n); restart(); });
            dotsWrap.appendChild(d);
        });
        var dots = dotsWrap.children;
        function go(n){
            slides[i].classList.remove('is-active'); dots[i].classList.remove('is-active');
            i = (n + slides.length) % slides.length;
            slides[i].classList.add('is-active'); dots[i].classList.add('is-active');
        }
        function restart(){ clearInterval(timer); timer = setInterval(function(){ go(i + 1); }, 7000); }
        root.querySelector('[data-prev]').addEventListener('click', function(){ go(i - 1); restart(); });
        root.querySelector('[data-next]').addEventListener('click', function(){ go(i + 1); restart(); });
        slides[0].classList.add('is-active'); dots[0].classList.add('is-active');
        restart();
    }

    /* ---------- Portfolio dropdown (hover on desktop, tap on touch) ---------- */
    function initNavDrop(){
        document.querySelectorAll('.nav-drop').forEach(function(drop){
            var btn = drop.querySelector('.nav-drop__btn');
            function set(open){ drop.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
            btn.addEventListener('click', function(e){ e.stopPropagation(); set(!drop.classList.contains('is-open')); });
            document.addEventListener('click', function(e){ if(!drop.contains(e.target)) set(false); });
            drop.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ set(false); btn.focus(); } });
            drop.addEventListener('focusout', function(e){ if(!drop.contains(e.relatedTarget)) set(false); });
        });
    }

    /* ---------- Gallery: filters + load more ---------- */
    function initGallery(){
        var grid = document.querySelector('[data-gallery]');
        if(!grid) return;
        var items = Array.prototype.slice.call(grid.querySelectorAll('.gitem'));
        var page = +grid.getAttribute('data-page') || 24, shown = page, filter = 'all';
        var more = document.querySelector('.gal-more'), moreBtn = more && more.querySelector('[data-more]');
        function matches(it){ return filter === 'all' || (' ' + it.getAttribute('data-cat') + ' ').indexOf(' ' + filter + ' ') > -1; }
        function render(){
            var n = 0, total = 0;
            items.forEach(function(it){
                var ok = matches(it);
                if(ok) total++;
                var visible = ok && n < shown;
                if(visible) n++;
                it.hidden = !visible;
            });
            if(more){
                more.hidden = total === 0;
                moreBtn.hidden = n >= total;
            }
        }
        var filters = document.querySelector('.filters');
        if(filters) filters.addEventListener('click', function(e){
            var b = e.target.closest('button'); if(!b) return;
            filters.querySelectorAll('button').forEach(function(x){
                x.classList.toggle('is-active', x === b);
                x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
            });
            filter = b.getAttribute('data-filter');
            shown = page;
            render();
        });
        if(moreBtn) moreBtn.addEventListener('click', function(){ shown += page; render(); });
        render();
    }

    /* ---------- Lightbox: every [data-lb] link on the page, filtered gallery aware ---------- */
    function initLightbox(){
        var lb = document.querySelector('.lb');
        if(!lb || !document.querySelector('[data-lb]')) return;
        var img = lb.querySelector('.lb__img'), title = lb.querySelector('.lb__title'),
            link = lb.querySelector('.lb__link');
        var list = [], i = 0, lastFocus = null;
        function collect(){
            /* in the gallery, browse everything that matches the active filter (loaded or not) */
            return Array.prototype.slice.call(document.querySelectorAll('[data-lb]')).filter(function(a){
                var fig = a.closest('.gitem');
                if(!fig || !fig.closest('[data-gallery]')) return true;
                var active = document.querySelector('.filters .is-active');
                var f = active ? active.getAttribute('data-filter') : 'all';
                return f === 'all' || (' ' + fig.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
            });
        }
        function show(n){
            i = (n + list.length) % list.length;
            var a = list[i];
            img.classList.add('is-loading');
            img.onload = function(){ img.classList.remove('is-loading'); };
            img.src = a.getAttribute('href');
            var thumb = a.querySelector('img');
            img.alt = thumb ? thumb.alt : '';
            title.innerHTML = a.getAttribute('data-caption') || '';
            var c = a.getAttribute('data-case');
            link.hidden = !c;
            if(c) link.href = c;
            [1, -1].forEach(function(d){ var p = new Image(); p.src = list[(i + d + list.length) % list.length].getAttribute('href'); });
        }
        function open(a){
            list = collect();
            lastFocus = a;
            lb.hidden = false;
            requestAnimationFrame(function(){ lb.classList.add('is-open'); });
            document.body.classList.add('is-locked');
            show(list.indexOf(a));
            lb.querySelector('.lb__close').focus();
        }
        function close(){
            lb.classList.remove('is-open');
            document.body.classList.remove('is-locked');
            setTimeout(function(){ lb.hidden = true; img.src = ''; }, 350);
            if(lastFocus) lastFocus.focus();
        }
        document.addEventListener('click', function(e){
            var a = e.target.closest('[data-lb]');
            if(!a || e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            open(a);
        });
        lb.querySelector('.lb__close').addEventListener('click', close);
        lb.querySelector('.lb__prev').addEventListener('click', function(){ show(i - 1); });
        lb.querySelector('.lb__next').addEventListener('click', function(){ show(i + 1); });
        lb.addEventListener('click', function(e){ if(e.target === lb || e.target.classList.contains('lb__stage')) close(); });
        document.addEventListener('keydown', function(e){
            if(lb.hidden) return;
            if(e.key === 'Escape') close();
            else if(e.key === 'ArrowLeft') show(i - 1);
            else if(e.key === 'ArrowRight') show(i + 1);
        });
        /* swipe */
        var x0 = null;
        lb.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', function(e){
            if(x0 === null) return;
            var dx = e.changedTouches[0].clientX - x0; x0 = null;
            if(Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
        });
    }

    /* ---------- enquiry form (FormSubmit, no backend needed) ---------- */
    function initForm(){
        var form = document.getElementById('enquiryForm');
        if(!form) return;
        var status = document.getElementById('formStatus');
        var btn = form.querySelector('button[type="submit"]');
        form.querySelectorAll('select').forEach(function(s){
            s.addEventListener('change', function(){ s.classList.toggle('has-value', !!s.value); });
            customSelect(s);
        });
        form.addEventListener('submit', function(e){
            e.preventDefault();
            if(form._honey && form._honey.value) return;
            status.className = 'fstatus';
            var label = btn.innerHTML;
            btn.disabled = true; btn.innerHTML = 'Sending&hellip;';
            fetch(form.action, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
                .then(function(r){
                    if(!r.ok) throw new Error();
                    status.className = 'fstatus ok';
                    status.textContent = 'Thank you! Your enquiry has reached us. We’ll be in touch within 24 hours.';
                    form.reset();
                    form.querySelectorAll('select').forEach(function(s){ s.classList.remove('has-value'); });
                })
                .catch(function(){
                    status.className = 'fstatus err';
                    status.textContent = 'Something went wrong. Please call or WhatsApp us on +91 91127 74665.';
                })
                .finally(function(){ btn.disabled = false; btn.innerHTML = label; });
        });
    }

    /* ---------- on-brand dropdown that drives the real <select> (which still submits) ---------- */
    function customSelect(sel){
        var field = sel.closest('.field');
        var label = field.querySelector('label');
        var opts = Array.prototype.filter.call(sel.options, function(o){ return o.value !== '' || o.text.trim() !== ''; });
        var id = sel.id + '-list';
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'csel__btn';
        btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
        if(label){ label.removeAttribute('for'); label.id = sel.id + '-label'; btn.setAttribute('aria-labelledby', label.id + ' ' + sel.id + '-val'); }
        btn.innerHTML = '<span class="csel__val" id="' + sel.id + '-val"></span><span class="csel__chev" aria-hidden="true"></span>';
        var list = document.createElement('ul');
        list.className = 'csel__list'; list.id = id; list.setAttribute('role', 'listbox'); list.tabIndex = -1; list.hidden = true;
        opts.forEach(function(o, i){
            var li = document.createElement('li');
            li.setAttribute('role', 'option'); li.id = id + '-' + i; li.textContent = o.text; li.dataset.value = o.value || o.text;
            list.appendChild(li);
        });
        sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
        field.classList.add('field--csel');
        field.appendChild(btn); field.appendChild(list);
        var items = Array.prototype.slice.call(list.children), active = -1;

        function sync(){
            var v = sel.value;
            btn.querySelector('.csel__val').textContent = v ? sel.options[sel.selectedIndex].text : '';
            sel.classList.toggle('has-value', !!v);
            items.forEach(function(li){ li.setAttribute('aria-selected', li.dataset.value === v ? 'true' : 'false'); });
        }
        function highlight(i){
            active = Math.max(0, Math.min(items.length - 1, i));
            items.forEach(function(li, k){ li.classList.toggle('is-active', k === active); });
            list.setAttribute('aria-activedescendant', items[active].id);
            items[active].scrollIntoView({ block: 'nearest' });
        }
        function open(){
            list.hidden = false; field.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
            var cur = items.findIndex(function(li){ return li.dataset.value === sel.value; });
            highlight(cur < 0 ? 0 : cur);
            list.focus({ preventScroll: true });
        }
        function close(focusBtn){
            list.hidden = true; field.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
            if(focusBtn) btn.focus();
        }
        function choose(i){
            sel.value = items[i].dataset.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            sync(); close(true);
        }
        btn.addEventListener('click', function(){ list.hidden ? open() : close(true); });
        btn.addEventListener('keydown', function(e){
            if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); open(); }
        });
        list.addEventListener('click', function(e){
            var li = e.target.closest('li'); if(li) choose(items.indexOf(li));
        });
        list.addEventListener('mousemove', function(e){
            var li = e.target.closest('li'); if(li && items.indexOf(li) !== active) highlight(items.indexOf(li));
        });
        list.addEventListener('keydown', function(e){
            if(e.key === 'ArrowDown'){ e.preventDefault(); highlight(active + 1); }
            else if(e.key === 'ArrowUp'){ e.preventDefault(); highlight(active - 1); }
            else if(e.key === 'Home'){ e.preventDefault(); highlight(0); }
            else if(e.key === 'End'){ e.preventDefault(); highlight(items.length - 1); }
            else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(active); }
            else if(e.key === 'Escape'){ e.preventDefault(); close(true); }
            else if(e.key === 'Tab'){ close(false); }
        });
        document.addEventListener('click', function(e){ if(!field.contains(e.target) && !list.hidden) close(false); });
        sel.addEventListener('change', sync);
        sel.form && sel.form.addEventListener('reset', function(){ setTimeout(sync, 0); });
        sync();
    }

    /* ---------- back to top ---------- */
    function initToTop(){
        var b = document.querySelector('.to-top');
        if(!b) return;
        window.addEventListener('scroll', function(){ b.classList.toggle('is-visible', window.scrollY > 900); }, { passive: true });
        b.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
})();
