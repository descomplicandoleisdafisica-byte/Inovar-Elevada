const WHATSAPP_BASE='https://wa.me/555432324898?text=';

// Usa arquivos binários normais no GitHub Pages. Esses formatos são mais estáveis que os SVGs com imagem embutida.
document.querySelectorAll('img[src*="logo-inovar"]').forEach(image=>{
  image.onerror=()=>{
    image.onerror=null;
    image.src='./assets/brand/logo-inovar.svg?v=20260818-logo-fallback';
  };
  image.src='./assets/brand/logo-inovar.jpg?v=20260818-logo-direta';
});

document.querySelectorAll('.hero-photo-card img').forEach(image=>{
  image.onerror=()=>{
    image.onerror=null;
    image.src='./assets/store/fachada-inovar.png?v=20260818-fachada-fallback';
  };
  image.src='./assets/store/loja-google-01.png?v=20260818-fachada-direta';
  image.loading='eager';
  image.decoding='async';
});

// Mantém uma única pergunta de horário no FAQ.
const faqList=document.querySelector('.faq-list');
if(faqList){
  const hourItems=[...faqList.querySelectorAll('.faq-item')].filter(item=>/horário/i.test(item.textContent));
  let hourItem=hourItems.shift();
  hourItems.forEach(item=>item.remove());
  if(!hourItem){
    hourItem=document.createElement('article');
    hourItem.className='faq-item';
    hourItem.innerHTML=`<button type="button" class="faq-question" aria-expanded="false">Qual é o horário de atendimento?<span>+</span></button><div class="faq-answer"><p>Segunda a sexta-feira, das 8h às 18h30. Sábado, das 8h às 18h.</p></div>`;
    faqList.appendChild(hourItem);
  }else{
    const button=hourItem.querySelector('.faq-question');
    const answer=hourItem.querySelector('.faq-answer p');
    if(button){button.innerHTML='Qual é o horário de atendimento?<span>+</span>';button.setAttribute('aria-expanded','false');}
    if(answer) answer.textContent='Segunda a sexta-feira, das 8h às 18h30. Sábado, das 8h às 18h.';
    hourItem.classList.remove('open');
  }
}

function openWhatsApp(message){
  window.open(WHATSAPP_BASE+encodeURIComponent(message),'_blank','noopener');
}
function productMessage(product){
  return product?`Olá, vim pelo site da Inovar Elevada. Gostaria de consultar: ${product}`:'Olá, vim pelo site da Inovar Elevada e gostaria de consultar um produto.';
}

document.querySelectorAll('form[data-search]').forEach(form=>{
  form.addEventListener('submit',event=>{
    event.preventDefault();
    openWhatsApp(productMessage(form.querySelector('input')?.value.trim()||''));
  });
});
document.querySelectorAll('[data-product]').forEach(el=>{
  el.addEventListener('click',event=>{event.preventDefault();openWhatsApp(productMessage(el.dataset.product||''));});
});

const menuButton=document.getElementById('menuButton');
const mainNav=document.getElementById('mainNav');
function closeMenu(){mainNav?.classList.remove('open');document.body.classList.remove('menu-open');menuButton?.setAttribute('aria-expanded','false');}
menuButton?.addEventListener('click',()=>{const open=!mainNav?.classList.contains('open');mainNav?.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);menuButton?.setAttribute('aria-expanded',String(open));});
mainNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('resize',()=>{if(innerWidth>760) closeMenu();});

document.querySelectorAll('.faq-question').forEach(button=>{
  button.addEventListener('click',()=>{
    const item=button.closest('.faq-item');
    const willOpen=!item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(other=>{other.classList.remove('open');other.querySelector('.faq-question')?.setAttribute('aria-expanded','false');});
    if(willOpen){item.classList.add('open');button.setAttribute('aria-expanded','true');}
  });
});

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window&&!reducedMotion){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.1});
  revealItems.forEach(item=>observer.observe(item));
}else revealItems.forEach(item=>item.classList.add('visible'));

async function loadStories(){
  const area=document.getElementById('storyArea');
  if(!area) return;
  try{
    const response=await fetch(`./data/stories.json?ts=${Date.now()}`,{cache:'no-store'});
    if(!response.ok) return;
    const data=await response.json();
    const items=Array.isArray(data.items)?data.items:[];
    if(!items.length) return;
    const rail=document.createElement('div');rail.className='story-rail';
    items.forEach(item=>{
      const src=item.src||item.localUrl||item.url;if(!src) return;
      const card=document.createElement('div');card.className='story-card';
      const type=String(item.media_type||item.type||'').toUpperCase();
      if(type==='VIDEO'||/\.mp4(\?|$)/i.test(src)){const video=document.createElement('video');video.src=src;video.controls=true;video.playsInline=true;video.preload='metadata';card.appendChild(video);}
      else{const image=document.createElement('img');image.src=src;image.alt='Story da Inovar Elevada';image.loading='lazy';card.appendChild(image);}
      rail.appendChild(card);
    });
    if(rail.children.length){area.innerHTML='';area.appendChild(rail);}
  }catch(error){console.warn('Stories indisponíveis no momento.');}
}
loadStories();
setInterval(loadStories,300000);
