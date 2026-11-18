/* Animasi utama: loader, hero, scroll, skills, projects, kursor. Perlu GSAP + ScrollTrigger (dimuat di index.html). */
(function(){
  var doc=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var pre=$('#pre');

  function splitChars(el){
    var t=el.textContent; el.textContent='';
    return t.split('').map(function(c){
      var s=document.createElement('span'); s.className='ch'; s.textContent=c; el.appendChild(s); return s;
    });
  }
  function splitWords(el,masked){
    var words=el.textContent.trim().split(/\s+/); el.textContent='';
    return words.map(function(w,i){
      var o=document.createElement('span'), n=o;
      if(masked){o.className='w'; n=document.createElement('span'); n.className='wi'; o.appendChild(n);} else {o.className='sw';}
      n.textContent=w; el.appendChild(o);
      if(i<words.length-1) el.appendChild(document.createTextNode(' '));
      return masked?n:o;
    });
  }
  function buildMarquees(){
    $$('.mq-track').forEach(function(tr){
      var words=tr.dataset.words.split(','), outline=tr.dataset.outline==='1';
      function half(){
        var h=document.createElement('div'); h.className='mq-half';
        for(var r=0;r<2;r++) words.forEach(function(w,i){
          var it=document.createElement('span'); it.className='mq-item'+(outline&&i%2===1?' o':'');
          it.textContent=w; it.appendChild(document.createElement('i')); h.appendChild(it);
        });
        return h;
      }
      tr.appendChild(half()); tr.appendChild(half());
    });
  }
  function buildSegments(){
    $$('.card').forEach(function(c){
      var v=+c.dataset.v, on=Math.round(v/10), box=$('.segs',c);
      for(var i=0;i<10;i++){var s=document.createElement('i'); if(i<on) s.className='on'; box.appendChild(s);}
    });
  }
  function wireCopy(btn){
    var addr=$('#mailAddr'), label=btn.textContent, timer;
    btn.addEventListener('click',function(){
      var done=function(){btn.textContent='Tersalin ✓'; clearTimeout(timer); timer=setTimeout(function(){btn.textContent=label;},1800);};
      var select=function(){var r=document.createRange(); r.selectNodeContents(addr); var s=getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent='Pilih lalu salin'; clearTimeout(timer); timer=setTimeout(function(){btn.textContent=label;},2200);};
      try{ navigator.clipboard.writeText(addr.textContent.trim()).then(done,select); }catch(err){ select(); }
    });
  }
  function finishLoad(){
    doc.classList.remove('lock');
    if(pre){pre.style.display='none';}
  }
  buildMarquees();
  buildSegments();

  /* jam Jakarta dan kata fokus yang bergantian */
  var clockEl=$('#clock');
  function tick(){try{clockEl.textContent=new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour12:false}).replace(/\./g,':');}catch(e){}}
  tick(); setInterval(tick,1000);
  var roles=['Front-end','UI / UX','Tailwind','JavaScript'], ri=0, rw=$('#roleWord');
  if(!reduce) setInterval(function(){rw.style.opacity=0;setTimeout(function(){ri=(ri+1)%roles.length;rw.textContent=roles[ri];rw.style.opacity=1;},300);},2400);

  /* fallback: no GSAP (blocked) or reduced motion */
  if(!window.gsap||!window.ScrollTrigger||reduce){
    doc.classList.add('no-motion');
    finishLoad();
    $$('[data-go]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var t=$('#'+a.dataset.go);if(t)t.scrollIntoView()})});
    wireCopy($('#copy'));
    return;
  }

  doc.classList.add('lock');
  gsap.registerPlugin(ScrollTrigger);

  /* split text */
  var heroChars=[]; $$('[data-chars]').forEach(function(l){heroChars=heroChars.concat(splitChars(l));});
  $$('.sec-title,.sk-giant').forEach(function(t){t.setAttribute('aria-label',t.textContent); splitWords(t,true).forEach(function(n){n.setAttribute('aria-hidden','true')});});
  var statement=$('#statement'); statement.setAttribute('aria-label',statement.textContent);
  var sw=splitWords(statement,false); sw.forEach(function(n){n.setAttribute('aria-hidden','true')});

  /* intro */
  gsap.set(heroChars,{yPercent:115});
  gsap.set('#hello',{opacity:0,y:30,rotation:-10});
  gsap.set('.hero-foot > *',{opacity:0,y:30});
  gsap.set('#nav',{yPercent:-190});
  gsap.set('#heroPic .tilt',{yPercent:14,scale:.9,rotation:5,opacity:0,transformOrigin:'50% 100%'});
  gsap.set('#heroPic .blob',{scale:0});
  gsap.set('#heroPic .disc',{scale:0});
  gsap.set('#heroPic .badge',{scale:0,rotation:-40});
  gsap.set('.stk',{scale:0,opacity:0});
  gsap.set('.hero-meta',{opacity:0,y:30});

  var cnt=$('#cnt'), c={v:0};
  var intro=gsap.timeline({defaults:{ease:'power3.out'}});
  intro.to(c,{v:100,duration:1.5,ease:'power2.inOut',onUpdate:function(){cnt.textContent=String(Math.round(c.v)).padStart(3,'0');}})
    .to(pre,{yPercent:-100,duration:1,ease:'power4.inOut',onComplete:finishLoad},'+=.15')
    .to('#hello',{opacity:1,y:0,rotation:-3,duration:.9},'-=.35')
    .to(heroChars,{yPercent:0,duration:1.1,stagger:.05,ease:'power4.out'},'-=.8')
    .to('#heroPic .blob',{scale:1,duration:1.1,ease:'back.out(1.4)',transformOrigin:'50% 60%'},'-=.9')
    .to('#heroPic .tilt',{yPercent:0,scale:1,rotation:0,opacity:1,duration:1.1,ease:'back.out(1.3)'},'-=.8')
    .to('#heroPic .disc',{scale:1,duration:.7,ease:'back.out(2)'},'-=.6')
    .to('#heroPic .badge',{scale:1,rotation:0,duration:.8,ease:'back.out(1.6)'},'-=.5')
    .to('.hero-foot > *',{opacity:1,y:0,duration:.9,stagger:.12},'-=.9')
    .to('.stk',{scale:1,opacity:1,duration:.8,stagger:.12,ease:'back.out(2)'},'-=.6')
    .to('.hero-meta',{opacity:1,y:0,duration:.9},'-=.6')
    .to('#nav',{yPercent:0,duration:.9,ease:'power4.out'},'-=1');
  setTimeout(function(){ if(pre&&pre.style.display!=='none'){ finishLoad(); intro.progress(1); } },8000);

  /* hero scroll: dua baris nama bergeser berlawanan, foto membesar dan miring, stiker melayang beda kecepatan */
  var hs=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.6}});
  hs.to('.name .l1',{x:'-4vw'},0)
    .to('.name .l2',{x:'16vw'},0)
    .to('#heroPic',{y:-70,scale:1.12,rotation:-4},0)
    .to('.stk-star',{y:-170,rotation:220},0)
    .to('.stk-pill',{y:-110},0)
    .to('.stk-clock',{y:-50},0);

  /* progres scroll di tepi kanan */
  var progBar=$('.prog i'), progN=$('#progN');
  ScrollTrigger.create({start:0,end:'max',onUpdate:function(s){
    progBar.style.transform='scaleY('+s.progress+')';
    progN.textContent=String(Math.round(s.progress*100)).padStart(2,'0');
  }});

  /* marquees follow the scroll */
  var mqs=$$('.mq-track').map(function(tr){
    var dir=+tr.dataset.dir;
    return gsap.fromTo(tr,{xPercent:dir>0?0:-50},{xPercent:dir>0?-50:0,duration:26,ease:'none',repeat:-1});
  });
  var back;
  ScrollTrigger.create({onUpdate:function(self){
    var d=self.direction, boost=1+Math.min(Math.abs(self.getVelocity())/180,7);
    if(back) back.kill();
    mqs.forEach(function(m){m.timeScale(d*boost);});
    back=gsap.to(mqs,{timeScale:function(){return self.direction;},duration:.9,ease:'power2.out',delay:.1});
  }});

  /* titles, statement, fades */
  $$('.sec-title').forEach(function(t){
    gsap.from($$('.wi',t),{yPercent:115,duration:1.1,ease:'power4.out',stagger:.08,scrollTrigger:{trigger:t,start:'top 88%',once:true}});
  });
  $$('.big-line').forEach(function(l,i){
    gsap.from(l,{yPercent:40,opacity:0,duration:1,delay:i*.08,ease:'power4.out',scrollTrigger:{trigger:'.contact h2',start:'top 85%',once:true}});
  });
  gsap.to(sw,{opacity:1,ease:'none',stagger:.12,scrollTrigger:{trigger:statement,start:'top 82%',end:'bottom 48%',scrub:true}});
  $$('.fade').forEach(function(el){
    gsap.from(el,{y:44,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
  });

  /* skills stage */
  var giant=$('.sk-giant');
  gsap.from($$('.wi',giant),{yPercent:110,duration:1.2,ease:'power4.out',stagger:.08,scrollTrigger:{trigger:giant,start:'top 85%',once:true}});
  gsap.fromTo(giant,{xPercent:5},{xPercent:-5,ease:'none',scrollTrigger:{trigger:'.skills',start:'top bottom',end:'bottom top',scrub:true}});
  var stageTrig={trigger:'.sk-stage',start:'top 78%',once:true};
  gsap.from('.sk-center .tilt',{scale:.7,y:70,rotation:-6,opacity:0,transformOrigin:'50% 100%',duration:1.2,ease:'back.out(1.4)',scrollTrigger:stageTrig});
  gsap.from('.star',{scale:.2,opacity:0,duration:1.2,ease:'back.out(1.2)',scrollTrigger:stageTrig});
  gsap.from('.note',{scale:0,duration:.7,delay:.7,ease:'back.out(2)',transformOrigin:'80% 100%',scrollTrigger:stageTrig});
  var tilts=[-2,1.5,-1,2,-1.5,1];
  $$('.card').forEach(function(card,i){
    var st={trigger:card,start:'top 92%',once:true}, num=$('.num',card), o={n:0}, v=+card.dataset.v, rot=tilts[i]||0;
    gsap.set(card,{rotation:rot});
    card.addEventListener('mouseenter',function(){gsap.to(card,{rotation:0,x:-4,y:-4,duration:.35,ease:'power3.out',overwrite:'auto'});});
    card.addEventListener('mouseleave',function(){gsap.to(card,{rotation:rot,x:0,y:0,duration:.5,ease:'power3.out',overwrite:'auto'});});
    gsap.from(card,{y:90,opacity:0,duration:1,delay:(i%3)*.08,ease:'back.out(1.3)',scrollTrigger:st});
    gsap.from($$('.segs i.on',card),{scaleY:0,transformOrigin:'50% 100%',duration:.4,stagger:.07,delay:.35,ease:'back.out(2)',scrollTrigger:st});
    gsap.to(o,{n:v,duration:1.4,delay:.2,ease:'power3.out',scrollTrigger:st,onStart:function(){num.textContent='0';},onUpdate:function(){num.textContent=Math.round(o.n);}});
  });

  /* mouse tilt for portraits */
  $$('[data-tilt]').forEach(function(box){
    var t=$('.tilt',box); gsap.set(t,{transformPerspective:900});
    var rx=gsap.quickTo(t,'rotationY',{duration:.6,ease:'power3'}), ry=gsap.quickTo(t,'rotationX',{duration:.6,ease:'power3'});
    box.addEventListener('mousemove',function(e){
      var r=box.getBoundingClientRect();
      rx(((e.clientX-r.left)/r.width-.5)*16); ry(-((e.clientY-r.top)/r.height-.5)*12);
    });
    box.addEventListener('mouseleave',function(){rx(0);ry(0);});
  });

  /* project preview that follows the cursor */
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var rows=$$('.row'), peek=$('#peek'), arts=$$('.art',peek);
  rows.forEach(function(r,i){var m=document.createElement('div'); m.className='art-m'; m.appendChild(arts[i].cloneNode(true)); r.appendChild(m);});
  if(fine){
    gsap.set(peek,{xPercent:-50,yPercent:-50,scale:.6,opacity:0});
    var px=gsap.quickTo(peek,'x',{duration:.55,ease:'power3'}), py=gsap.quickTo(peek,'y',{duration:.55,ease:'power3'});
    rows.forEach(function(r,i){
      r.addEventListener('mouseenter',function(){
        arts.forEach(function(a,j){a.classList.toggle('on',i===j);});
        gsap.to(peek,{opacity:1,scale:1,rotation:i%2?5:-5,duration:.45,ease:'power3.out',overwrite:'auto'});
      });
      r.addEventListener('mouseleave',function(){gsap.to(peek,{opacity:0,scale:.6,duration:.3,ease:'power3.in',overwrite:'auto'});});
      r.addEventListener('mousemove',function(e){px(e.clientX);py(e.clientY);});
    });
  }

  /* custom cursor + magnetic buttons */
  if(fine){
    var cur=$('#cur'); doc.classList.add('has-cur');
    gsap.set(cur,{xPercent:-50,yPercent:-50});
    var cx=gsap.quickTo(cur,'x',{duration:.3,ease:'power3'}), cy=gsap.quickTo(cur,'y',{duration:.3,ease:'power3'});
    window.addEventListener('mousemove',function(e){cx(e.clientX);cy(e.clientY);cur.classList.add('show');},{passive:true});
    document.addEventListener('mouseleave',function(){cur.classList.remove('show');});
    $$('a,button').forEach(function(el){
      var isRow=el.classList.contains('row');
      el.addEventListener('mouseenter',function(){cur.classList.add(isRow?'view':'big');});
      el.addEventListener('mouseleave',function(){cur.classList.remove('view','big');});
    });
    $$('.mag').forEach(function(el){
      el.addEventListener('mousemove',function(e){
        var r=el.getBoundingClientRect();
        gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.3,y:(e.clientY-r.top-r.height/2)*.4,duration:.4,ease:'power3.out'});
      });
      el.addEventListener('mouseleave',function(){gsap.to(el,{x:0,y:0,duration:.8,ease:'elastic.out(1,.4)'});});
    });
  }

  /* nav: smooth jumps, active link, hide while scrolling down */
  $$('[data-go]').forEach(function(a){
    a.addEventListener('click',function(e){e.preventDefault();var t=$('#'+a.dataset.go); if(t) t.scrollIntoView({behavior:'smooth'});});
  });
  var links=$$('.nav a.l');
  ['home','about','skills','projects','contact'].forEach(function(id){
    ScrollTrigger.create({trigger:'#'+id,start:'top 55%',end:'bottom 55%',onToggle:function(s){
      if(!s.isActive) return;
      var key=id==='skills'?'about':id;
      links.forEach(function(l){l.classList.toggle('on',l.dataset.go===key);});
    }});
  });
  var nav=$('#nav'), lastY=window.scrollY;
  window.addEventListener('scroll',function(){
    var y=window.scrollY;
    if(y>lastY+6&&y>240) gsap.to(nav,{yPercent:-190,duration:.5,ease:'power3.out',overwrite:'auto'});
    else if(y<lastY-6) gsap.to(nav,{yPercent:0,duration:.5,ease:'power3.out',overwrite:'auto'});
    lastY=y;
  },{passive:true});

  wireCopy($('#copy'));
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ScrollTrigger.refresh();});
})();
