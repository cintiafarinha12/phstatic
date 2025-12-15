
import React, { useEffect, useRef } from 'react';
import { useMobile } from '../hooks/useMobile';

// --- CLASSES DEFINIDAS FORA DO COMPONENTE PARA PERFORMANCE ---

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 0.5;
    this.alpha = 0;
    this.targetAlpha = Math.random() * 0.6 + 0.2;
  }

  update(w: number, h: number, mouse: { x: number, y: number }) {
    if (this.alpha < this.targetAlpha) this.alpha += 0.01;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) { this.x = 0; this.vx *= -1; }
    if (this.x > w) { this.x = w; this.vx *= -1; }
    if (this.y < 0) { this.y = 0; this.vy *= -1; }
    if (this.y > h) { this.y = h; this.vy *= -1; }

    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distSq = dx * dx + dy * dy;
    const mouseDistSq = 22500; // 150 * 150

    if (distSq < mouseDistSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (150 - dist) / 150;
        const forceX = (dx / dist) * force * 1.5;
        const forceY = (dy / dist) * force * 1.5;
        this.x -= forceX;
        this.y -= forceY;
    }
  }

  draw(ctx: CanvasRenderingContext2D, theme: 'light' | 'dark') {
    ctx.globalAlpha = this.alpha;
    // Se o tema for dark, partículas brancas/roxas claras para contraste. Se light, roxas.
    ctx.fillStyle = theme === 'dark' ? '#a78bfa' : '#7c3aed';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Aurora {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  gradient: CanvasGradient | null = null;

  constructor(w: number, h: number, color: string) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.radius = Math.random() * 300 + 200;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.2;
  }

  update(w: number, h: number) {
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.x < -200 || this.x > w + 200) this.vx *= -1;
    if (this.y < -200 || this.y > h + 200) this.vy *= -1;
    
    // Invalidar gradiente para recriar na próxima renderização
    this.gradient = null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!isFinite(this.x) || !isFinite(this.y)) return;

    try {
        if (!this.gradient) {
            this.gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            this.gradient.addColorStop(0, this.color);
            this.gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        
        ctx.fillStyle = this.gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    } catch (e) {
        // Fallback silencioso
    }
  }
}

// Spatial Hash Grid para otimização de colisões
class SpatialGrid {
  cellSize: number;
  grid: Map<string, Particle[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  insert(particle: Particle) {
    const cellX = Math.floor(particle.x / this.cellSize);
    const cellY = Math.floor(particle.y / this.cellSize);
    const key = `${cellX},${cellY}`;
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(particle);
  }

  getNearby(particle: Particle): Particle[] {
    const cellX = Math.floor(particle.x / this.cellSize);
    const cellY = Math.floor(particle.y / this.cellSize);
    const nearby: Particle[] = [];

    // Checar célula atual e vizinhas
    for (let x = cellX - 1; x <= cellX + 1; x++) {
      for (let y = cellY - 1; y <= cellY + 1; y++) {
        const key = `${x},${y}`;
        const cell = this.grid.get(key);
        if (cell) {
          nearby.push(...cell);
        }
      }
    }

    return nearby;
  }
}

interface InteractiveBackgroundProps {
    theme?: 'light' | 'dark';
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ theme = 'light' }) => {
  const isMobile = useMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const particlesRef = useRef<Particle[]>([]);
  const aurorasRef = useRef<Aurora[]>([]);
  const spatialGridRef = useRef<SpatialGrid>(new SpatialGrid(150));
  
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    // === OTIMIZAÇÃO CRÍTICA ===
    // Se for mobile, NÃO inicia o loop do canvas. Retorna cedo.
    // Isso libera a thread principal (JS) e a GPU.
    if (isMobile) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Permitir alpha para transparência no modo dark
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastMouseUpdate = 0;
    let lastFrameTime = 0;

    const CONNECTION_DIST_SQ = 22500;
    const MOUSE_THROTTLE = 16;

    const drawGrid = (w: number, h: number) => {
      const gridSize = 40;
      // Ajuste de cor da grade baseada no tema
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(124, 58, 237, 0.03)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = 0; x <= w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    };

    const initObjects = (w: number, h: number) => {
        if (particlesRef.current.length > 0) return;

        // Limita partículas em telas menores (laptops) para garantir performance
        const maxParticles = w < 1280 ? 40 : 60;
        const particleCount = Math.min(Math.floor((w * h) / 12000), maxParticles);
        
        for (let i = 0; i < particleCount; i++) {
            particlesRef.current.push(new Particle(w, h));
        }
        
        if (theme === 'light') {
            aurorasRef.current.push(new Aurora(w, h, 'rgba(124, 58, 237, 0.15)'));
            aurorasRef.current.push(new Aurora(w, h, 'rgba(59, 130, 246, 0.10)'));
            aurorasRef.current.push(new Aurora(w, h, 'rgba(16, 185, 129, 0.05)'));
        } else {
             // Auroras mais sutis para o dark mode
            aurorasRef.current.push(new Aurora(w, h, 'rgba(124, 58, 237, 0.08)'));
            aurorasRef.current.push(new Aurora(w, h, 'rgba(59, 130, 246, 0.05)'));
        }
    };

    const render = (currentTime: number = 0) => {
        const deltaTime = currentTime - lastFrameTime;
        
        if (deltaTime < 12) {
            animationFrameId = requestAnimationFrame(render);
            return;
        }
        
        lastFrameTime = currentTime;
        const { w, h } = sizeRef.current;
        
        if (w <= 0 || h <= 0) {
             animationFrameId = requestAnimationFrame(render);
             return;
        }

        if (theme === 'light') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
        } else {
            // No dark mode, limpamos o canvas para deixar transparente e mostrar o bg do pai
            ctx.clearRect(0, 0, w, h);
        }
        
        drawGrid(w, h);

        ctx.save();

        const auroras = aurorasRef.current;
        for (let i = 0; i < auroras.length; i++) {
            auroras[i].update(w, h);
            auroras[i].draw(ctx);
        }

        const particles = particlesRef.current;
        const mouse = mouseRef.current;
        const spatialGrid = spatialGridRef.current;
        
        spatialGrid.clear();
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(w, h, mouse);
            spatialGrid.insert(particles[i]);
        }

        for (let i = 0; i < particles.length; i++) {
            particles[i].draw(ctx, theme);
        }
        
        ctx.strokeStyle = theme === 'dark' ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.15)';
        ctx.lineWidth = 1;

        const processed = new Set<string>();
        
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            const nearby = spatialGrid.getNearby(p1);
            
            for (let j = 0; j < nearby.length; j++) {
                const p2 = nearby[j];
                if (p1 === p2) continue;
                
                const key1 = `${i}-${particles.indexOf(p2)}`;
                const key2 = `${particles.indexOf(p2)}-${i}`;
                if (processed.has(key1) || processed.has(key2)) continue;
                processed.add(key1);
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < CONNECTION_DIST_SQ) {
                    const dist = Math.sqrt(distSq);
                    ctx.beginPath();
                    ctx.globalAlpha = (1 - dist / 150) * 0.4;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
        animationFrameId = requestAnimationFrame(render);
    };

    const updateSize = () => {
        if (!container || !canvas) return;
        
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        if (Math.abs(rect.width - sizeRef.current.w) < 20 && Math.abs(rect.height - sizeRef.current.h) < 20) {
            return;
        }
        
        sizeRef.current = { w: rect.width, h: rect.height };
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        initObjects(rect.width, rect.height);
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);

    const handleMouseMove = (e: MouseEvent) => {
        const now = performance.now();
        if (now - lastMouseUpdate < MOUSE_THROTTLE) return;
        lastMouseUpdate = now;
        
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    updateSize();
    render();

    return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, theme]); // Adicionado theme como dependência

  // === RENDERIZAÇÃO CONDICIONAL ===
  // Mobile: Gradiente CSS estático
  if (isMobile) {
      return (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
               {/* Fundo Base */}
               <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-transparent' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}></div>
               
               {/* Auroras Estáticas (CSS Blurs) */}
               <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[80px] ${theme === 'dark' ? 'bg-primary-500/10' : 'bg-primary-200/20'}`}></div>
               <div className={`absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full blur-[80px] ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-200/20'}`}></div>
               
               {/* Pattern Sutil de Grid */}
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: theme === 'dark' ? 'radial-gradient(#ffffff 1px, transparent 1px)' : 'radial-gradient(#7c3aed 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          </div>
      );
  }

  // Desktop: Canvas Interativo Completo
  return (
    <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" 
        style={{ zIndex: 0 }}
    >
        <canvas 
            ref={canvasRef} 
            className="block w-full h-full"
            style={{ width: '100%', height: '100%' }}
        />
    </div>
  );
};
