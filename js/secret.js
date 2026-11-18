/* Page rahasia: kode rahasia, tirai transisi, galeri foto/video. Ganti kodenya di SECRET_CODE. */
(function(){
  var SECRET_CODE='memory'; /* ganti kode rahasia di sini, tulis huruf kecil */
  var doc=document.documentElement, g=window.gsap;
  var $=function(s,r){return (r||document).querySelector(s)};
  var vault=$('#vault'), grid=$('#vGrid'), file=$('#vFile'), note=$('#vNote'), curtain=$('#curtain');
  var box=$('#codebox'), form=$('#codeForm'), input=$('#codeIn'), msg=$('#codeMsg');
  var db=null, items=[], urls=[], isOpen=false, busy=false;

  /* penyimpanan di browser (IndexedDB), aman kalau tidak tersedia */
  function st(mode){return db.transaction('m',mode).objectStore('m');}
  function dbOpen(done){
    try{
      var rq=indexedDB.open('io-kenangan',1);
      rq.onupgradeneeded=function(){rq.result.createObjectStore('m',{keyPath:'id',autoIncrement:true});};
      rq.onsuccess=function(){db=rq.result;done();};
      rq.onerror=function(){done();};
      rq.onblocked=function(){done();};
    }catch(e){done();}
  }
  function loadAll(done){
    if(!db){done();return;}
    try{var rq=st('readonly').getAll(); rq.onsuccess=function(){items=rq.result||[];done();}; rq.onerror=function(){done();};}catch(e){done();}
  }
  function save(it){
    function fallback(){if(!it.id) it.id=Date.now()+Math.random();}
    if(!db){fallback();return;}
    try{var rq=st('readwrite').put(it); rq.onsuccess=function(){it.id=rq.result;}; rq.onerror=fallback;}catch(e){fallback();}
  }
  function remove(it){ if(!db||typeof it.id!=='number') return; try{st('readwrite').delete(it.id);}catch(e){} }

  function render(){
    urls.forEach(function(u){URL.revokeObjectURL(u);}); urls=[]; grid.textContent='';
    if(!items.length){
      ['Foto pertamamu di sini','Video masa kecil','Kenangan favorit'].forEach(function(t,i){
        var ph=document.createElement('label'); ph.className='pola ph'; ph.htmlFor='vFile'; ph.style.setProperty('--r',((i%3)-1)*2+'deg');
        var fr=document.createElement('div'); fr.className='frame'; fr.textContent=t+' (klik untuk menambah)'; ph.appendChild(fr); grid.appendChild(ph);
      });
    }
    items.forEach(function(it,i){
      var fig=document.createElement('figure'); fig.className='pola'; fig.style.setProperty('--r',(((i%5)-2)*1.4)+'deg');
      var fr=document.createElement('div'), m; fr.className='frame';
      if(it.type&&it.type.indexOf('video')===0){m=document.createElement('video'); m.controls=true; m.preload='metadata'; m.playsInline=true;}
      else{m=document.createElement('img'); m.alt=it.caption||'Foto kenangan'; m.loading='lazy';}
      var u=URL.createObjectURL(it.blob); urls.push(u); m.src=u; fr.appendChild(m);
      var cap=document.createElement('input'); cap.className='cap'; cap.type='text'; cap.maxLength=60; cap.placeholder='Tulis keterangan...'; cap.value=it.caption||''; cap.setAttribute('aria-label','Keterangan');
      cap.addEventListener('change',function(){it.caption=cap.value; save(it);});
      var del=document.createElement('button'); del.type='button'; del.className='del'; del.textContent='×'; del.setAttribute('aria-label','Hapus'); var armed=false, tm;
      del.addEventListener('click',function(){
        if(!armed){armed=true; del.textContent='Hapus?'; tm=setTimeout(function(){armed=false; del.textContent='×';},2200); return;}
        clearTimeout(tm); items.splice(items.indexOf(it),1); remove(it); render();
      });
      fig.appendChild(fr); fig.appendChild(cap); fig.appendChild(del); grid.appendChild(fig);
    });
    note.textContent=db?'Foto dan video tersimpan di browser ini.':'Penyimpanan browser tidak tersedia, isi hilang saat halaman ditutup.';
  }
  file.addEventListener('change',function(){
    var list=Array.prototype.slice.call(file.files), n=0; file.value='';
    list.forEach(function(f){
      if(!/^(image|video)\//.test(f.type)) return;
      var it={blob:f,type:f.type,name:f.name,caption:'',t:Date.now()}; items.push(it); n++; save(it);
    });
    render();
    if(n&&g){var ps=grid.querySelectorAll('.pola'); g.from(Array.prototype.slice.call(ps,-n),{y:60,opacity:0,duration:.7,stagger:.08,ease:'back.out(1.4)'});}
  });

  /* tirai transisi antar halaman */
  function wipe(mid,end){
    if(!g){mid(); if(end) end(); return;}
    busy=true; curtain.hidden=false;
    g.fromTo(curtain,{yPercent:100},{yPercent:0,duration:.7,ease:'power4.inOut',onComplete:function(){
      mid();
      g.to(curtain,{yPercent:-100,duration:.7,delay:.15,ease:'power4.inOut',onComplete:function(){curtain.hidden=true; busy=false; if(end) end();}});
    }});
  }
  function openVault(){
    if(isOpen||busy) return; closeCode();
    wipe(function(){
      isOpen=true; vault.hidden=false; doc.classList.add('vopen'); vault.scrollTop=0; render();
    },function(){
      $('#vClose').focus({preventScroll:true});
      if(g){
        g.from(['.v-title','.v-lead','.v-bar'],{y:50,opacity:0,stagger:.1,duration:.8,ease:'power3.out'});
        g.from('.v-grid .pola',{y:80,opacity:0,stagger:.07,duration:.8,ease:'back.out(1.3)'});
      }
    });
  }
  function closeVault(){
    if(!isOpen||busy) return;
    wipe(function(){
      isOpen=false; vault.hidden=true; doc.classList.remove('vopen');
      Array.prototype.forEach.call(vault.querySelectorAll('video'),function(v){v.pause();});
    });
  }
  function openCode(){
    if(isOpen||busy) return;
    box.hidden=false; msg.textContent=''; input.value='';
    setTimeout(function(){input.focus();},30);
  }
  function closeCode(){ box.hidden=true; }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(input.value.trim().toLowerCase()===SECRET_CODE){ openVault(); }
    else{
      msg.textContent='Kode salah, coba lagi.';
      box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); input.select();
    }
  });
  $('#codeX').addEventListener('click',closeCode);
  box.addEventListener('click',function(e){if(e.target===box) closeCode();});
  $('#vClose').addEventListener('click',closeVault);

  /* ketik kode di mana saja */
  var buf='';
  document.addEventListener('keydown',function(e){
    var t=e.target;
    if(e.key==='Escape'){ if(isOpen) closeVault(); else closeCode(); return; }
    if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
    if(e.ctrlKey||e.metaKey||e.altKey||!e.key||e.key.length!==1) return;
    buf=(buf+e.key.toLowerCase()).slice(-SECRET_CODE.length);
    if(buf===SECRET_CODE){buf=''; openVault();}
  });
  /* alternatif untuk HP: klik logo IO tiga kali */
  var logo=$('.logo'), clicks=0, ct;
  logo.addEventListener('click',function(){
    clicks++; clearTimeout(ct); ct=setTimeout(function(){clicks=0;},650);
    if(clicks>=3){clicks=0; openCode();}
  });

  dbOpen(function(){loadAll(render);});
})();
