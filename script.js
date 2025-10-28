// Particle canvas adapted to red/white on black theme
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let DPR = window.devicePixelRatio || 1;

function resizeCanvas(){
  DPR = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = Math.max(180, canvas.clientHeight || 300);
  canvas.width = Math.floor(w * DPR);
  canvas.height = Math.floor(h * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = [];
const particleCount = 40;
const colors = ['rgba(255,43,43,0.95)','rgba(255,107,107,0.85)','rgba(255,255,255,0.85)'];
for(let i=0;i<particleCount;i++){
  particles.push({
    x: Math.random()*canvas.width/DPR,
    y: Math.random()*canvas.height/DPR,
    vx: (Math.random()-0.5)*0.6,
    vy: (Math.random()-0.5)*0.3,
    r: 1.5 + Math.random()*5,
    c: colors[i % colors.length],
    life: Math.random()*200 + 100
  });
}

const mouse = {x: null, y: null};
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left);
  mouse.y = (e.clientY - rect.top);
});
canvas.addEventListener('mouseleave', ()=>{mouse.x = null; mouse.y = null});

function step(){
  const w = canvas.width/DPR;
  const h = canvas.height/DPR;
  ctx.clearRect(0,0,w,h);

  // subtle dark gradient
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,'rgba(10,10,10,0.2)');
  grad.addColorStop(1,'rgba(0,0,0,0.1)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,h);

  // draw connecting lines (red / faint white)
  for(let i=0;i<particles.length;i++){
    const p = particles[i];
    for(let j=i+1;j<particles.length;j++){
      const q = particles[j];
      const dx = p.x-q.x, dy = p.y-q.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < 120){
        const alpha = 0.12 * (1 - dist/120);
        ctx.strokeStyle = `rgba(255,43,43,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x,p.y);
        ctx.lineTo(q.x,q.y);
        ctx.stroke();
      }
    }
  }

  // update and draw particles
  particles.forEach(p => {
    // mouse repulsion
    if(mouse.x !== null){
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      if(dist < 120){
        const force = (120 - dist) / 120;
        p.vx += (dx/dist) * 0.6 * force;
        p.vy += (dy/dist) * 0.6 * force;
      }
    }

    // motion and friction
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;

    // wrap edges
    if(p.x < -20) p.x = w + 20;
    if(p.x > w + 20) p.x = -20;
    if(p.y < -30) p.y = h + 30;
    if(p.y > h + 30) p.y = -30;

    // draw particle with radial gradient
    ctx.beginPath();
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
    g.addColorStop(0, p.c);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  });

  requestAnimationFrame(step);
}
requestAnimationFrame(step);

// small interactive motion on the link elements (micro-bounce)
document.querySelectorAll('.anim-link').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.animate([
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(1.08) translateY(-6px)', offset: 0.6 },
      { transform: 'scale(1.04) translateY(-3px)', offset: 1 }
    ], { duration: 320, easing: 'cubic-bezier(.2,.9,.25,1)' });
  });
});
