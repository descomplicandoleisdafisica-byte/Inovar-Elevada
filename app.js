const WHATSAPP_BASE='https://wa.me/555432324898?text=';

function openWhatsApp(message){
  window.open(WHATSAPP_BASE+encodeURIComponent(message),'_blank','noopener');
}

function productMessage(product){
  return product
    ? `Olá, vim pelo site da Inovar Elevada. Gostaria de consultar: ${product}`
    : 'Olá, vim pelo site da Inovar Elevada e gostaria de consultar um produto.';
}

document.querySelectorAll('form[data-search]').forEach(form=>{
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const input=form.querySelector('input');
    openWhatsApp(productMessage(input?.value.trim()||''));
  });
});

document.querySelectorAll('[data-product]').forEach(el=>{
  el.addEventListener('click',event=>{
    event.preventDefault();
    openWhatsApp(productMessage(el.dataset.product||''));
  });
});

const menuButton=document.getElementById('menuButton');
const mainNav=document.getElementById('mainNav');

function closeMenu(){
  mainNav?.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded','false');
}

menuButton?.addEventListener('click',()=>{
  const open=!mainNav?.classList.contains('open');
  mainNav?.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
  menuButton?.setAttribute('aria-expanded',String(open));
});

mainNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('resize',()=>{if(innerWidth>760) closeMenu();});

document.querySelectorAll('.faq-question').forEach(button=>{
  button.addEventListener('click',()=>{
    const item=button.closest('.faq-item');
    const willOpen=!item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(other=>{
      other.classList.remove('open');
      other.querySelector('.faq-question')?.setAttribute('aria-expanded','false');
    });
    if(willOpen){
      item.classList.add('open');
      button.setAttribute('aria-expanded','true');
    }
  });
});

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && !reducedMotion){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.1});
  revealItems.forEach(item=>observer.observe(item));
}else{
  revealItems.forEach(item=>item.classList.add('visible'));
}

async function loadStories(){
  const area=document.getElementById('storyArea');
  if(!area) return;
  try{
    const response=await fetch(`./data/stories.json?ts=${Date.now()}`,{cache:'no-store'});
    if(!response.ok) return;
    const data=await response.json();
    const items=Array.isArray(data.items)?data.items:[];
    if(!items.length) return;

    const rail=document.createElement('div');
    rail.className='story-rail';
    items.forEach(item=>{
      const src=item.src||item.localUrl||item.url;
      if(!src) return;
      const card=document.createElement('div');
      card.className='story-card';
      const type=String(item.media_type||item.type||'').toUpperCase();
      if(type==='VIDEO'||/\.mp4(\?|$)/i.test(src)){
        const video=document.createElement('video');
        video.src=src;
        video.controls=true;
        video.playsInline=true;
        video.preload='metadata';
        card.appendChild(video);
      }else{
        const image=document.createElement('img');
        image.src=src;
        image.alt='Story da Inovar Elevada';
        image.loading='lazy';
        card.appendChild(image);
      }
      rail.appendChild(card);
    });

    if(rail.children.length){
      area.innerHTML='';
      area.appendChild(rail);
    }
  }catch(error){
    console.warn('Stories indisponíveis no momento.');
  }
}

loadStories();
setInterval(loadStories,300000);
