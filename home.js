document.addEventListener('DOMContentLoaded', function(){
    const track = document.querySelector('.cf-track');
    if(!track) return;
    const slides = Array.from(track.children);
    const prevBtn = document.querySelector('.cf-prev');
    const nextBtn = document.querySelector('.cf-next');
    let index = 0; // start at first slide for simple behavior
    const stage = document.querySelector('.cf-stage');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
    const lbClose = lightbox ? lightbox.querySelector('.close') : null;
    const imgs = slides.map(s=> s.querySelector('img')).filter(Boolean);

    function update(){
        const slideRect = slides[0].getBoundingClientRect();
        const slideWidth = slideRect.width;
        const gap = parseFloat(getComputedStyle(track).gap) || 16;
        const step = slideWidth + gap;
        const stageWidth = stage.getBoundingClientRect().width;
        const offset = (stageWidth - slideWidth) / 2;
        const transformX = -index * step + offset;
        track.style.transform = `translateX(${transformX}px)`;
        slides.forEach((s,i)=> s.classList.toggle('active', i===index));
        // no dots (removed)
    }

    // ensure correct sizing after images load
    imgs.forEach(img => img.addEventListener('load', () => {
        // small debounce
        clearTimeout(img._updateTimer);
        img._updateTimer = setTimeout(()=> update(), 80);
    }));
    // also recompute on window load (covers cached images)
    window.addEventListener('load', update);

    function goto(i){
        index = (i + slides.length) % slides.length;
        update();
    }

    if(nextBtn) nextBtn.addEventListener('click', ()=> goto(index + 1));
    if(prevBtn) prevBtn.addEventListener('click', ()=> goto(index - 1));

    // dots removed — navigation via prev/next and swipe

    document.addEventListener('keydown', (e)=>{ if(e.key==='ArrowRight') nextBtn.click(); if(e.key==='ArrowLeft') prevBtn.click(); });

    // autoplay
    let autoplay = setInterval(()=> goto(index + 1), 3500);
    function stopAutoplay(){ clearInterval(autoplay); }
    function startAutoplay(){ clearInterval(autoplay); autoplay = setInterval(()=> goto(index + 1), 3500); }

    // pause on hover for stage and buttons
    [prevBtn,nextBtn,stage,track].forEach(node=>{
        if(!node) return;
        node.addEventListener('mouseenter', stopAutoplay);
        node.addEventListener('mouseleave', startAutoplay);
    });

    // touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAutoplay(); });
    track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if(dx < -40) goto(index + 1);
        else if(dx > 40) goto(index - 1);
        startAutoplay();
    });

    // click-to-open lightbox
    if(lightboxImg){
        slides.forEach(s=>{
            const img = s.querySelector('img');
            if(!img) return;
            img.addEventListener('click', ()=>{
                lightboxImg.src = img.src;
                lightbox.classList.add('open');
                stopAutoplay();
            });
        });
        function closeLB(){ lightbox.classList.remove('open'); lightboxImg.src = ''; startAutoplay(); }
        if(lbClose) lbClose.addEventListener('click', closeLB);
        lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) closeLB(); });
        document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && lightbox.classList.contains('open')) closeLB(); });
    }

    window.addEventListener('resize', update);

    // initial layout, build and go
    update();
});
