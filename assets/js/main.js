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
        initPortfolio();
        initForm();
        initToTop();
        document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
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

    /* ---------- portfolio filter + modal ---------- */
    function initPortfolio(){
        var filters = document.querySelector('.filters');
        var cards = document.querySelectorAll('.wgrid .wcard[data-cat]');
        if(filters){
            filters.addEventListener('click', function(e){
                var b = e.target.closest('button'); if(!b) return;
                filters.querySelectorAll('button').forEach(function(x){ x.classList.toggle('is-active', x === b); });
                var f = b.getAttribute('data-filter');
                cards.forEach(function(c){
                    var show = f === 'all' || c.getAttribute('data-cat').split(' ').indexOf(f) > -1;
                    if(show){
                        c.classList.remove('is-gone');
                        requestAnimationFrame(function(){ c.classList.remove('is-out'); });
                    } else {
                        c.classList.add('is-out');
                        setTimeout(function(){ if(c.classList.contains('is-out')) c.classList.add('is-gone'); }, 450);
                    }
                });
            });
        }

        var modal = document.querySelector('.modal');
        if(!modal) return;
        var q = function(s){ return modal.querySelector(s); };
        document.querySelectorAll('[data-project]').forEach(function(card){
            card.addEventListener('click', function(){
                var d = card.dataset;
                q('[data-m-img]').src = d.img;
                q('[data-m-img]').alt = d.title;
                q('[data-m-label]').textContent = d.label;
                q('[data-m-title]').textContent = d.title;
                q('[data-m-loc]').textContent = d.loc;
                q('[data-m-type]').textContent = d.type;
                q('[data-m-services]').textContent = d.services;
                q('[data-m-story]').textContent = d.story;
                modal.classList.add('is-open');
                document.body.classList.add('is-locked');
            });
            card.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); card.click(); } });
        });
        function close(){ modal.classList.remove('is-open'); document.body.classList.remove('is-locked'); }
        q('.modal__close').addEventListener('click', close);
        modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
        document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
    }

    /* ---------- enquiry form (FormSubmit, no backend needed) ---------- */
    function initForm(){
        var form = document.getElementById('enquiryForm');
        if(!form) return;
        var status = document.getElementById('formStatus');
        var btn = form.querySelector('button[type="submit"]');
        form.querySelectorAll('select').forEach(function(s){
            s.addEventListener('change', function(){ s.classList.toggle('has-value', !!s.value); });
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
                    status.textContent = 'Thank you! Your enquiry has reached us — we’ll be in touch within 24 hours.';
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

    /* ---------- back to top ---------- */
    function initToTop(){
        var b = document.querySelector('.to-top');
        if(!b) return;
        window.addEventListener('scroll', function(){ b.classList.toggle('is-visible', window.scrollY > 900); }, { passive: true });
        b.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
})();
