import React, { useEffect, useRef } from 'react';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null, y: null, radius: 180 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const codeTokens = ['{ }', '&&', '=>', '[]', '< />', '()', 'socket.io', 'webRTC', 'v8', 'const', 'import'];
    const particles = [];
    const particleCount = 60;

    class Particle {
      constructor() {
        this.reset();
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        
        this.isToken = Math.random() < 0.25;
        this.token = codeTokens[Math.floor(Math.random() * codeTokens.length)];
        this.alpha = Math.random() * 0.4 + 0.15;
        this.colorIndex = Math.floor(Math.random() * 4);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
          this.reset();
          if (Math.random() < 0.5) {
            this.x = Math.random() < 0.5 ? -10 : width + 10;
          } else {
            this.y = Math.random() < 0.5 ? -10 : height + 10;
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x += (dx / distance) * force * 0.65;
            this.y += (dy / distance) * force * 0.65;
          }
        }
      }

      draw() {
        const themeColors = [
          `rgba(99, 102, 241, ${this.alpha})`,
          `rgba(139, 92, 246, ${this.alpha})`,
          `rgba(236, 72, 153, ${this.alpha})`,
          `rgba(45, 212, 191, ${this.alpha})`
        ];
        const color = themeColors[this.colorIndex];

        if (this.isToken) {
          ctx.font = '500 10px "Fira Code", monospace';
          ctx.fillStyle = color;
          ctx.fillText(this.token, this.x, this.y);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const gridSpacing = 80;
    const drawInteractiveGrid = () => {
      ctx.strokeStyle = 'rgba(31, 26, 58, 0.15)';
      ctx.lineWidth = 0.5;

      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (mouse.x !== null && mouse.y !== null) {
        const startX = Math.floor((mouse.x - mouse.radius) / gridSpacing) * gridSpacing;
        const endX = Math.ceil((mouse.x + mouse.radius) / gridSpacing) * gridSpacing;
        const startY = Math.floor((mouse.y - mouse.radius) / gridSpacing) * gridSpacing;
        const endY = Math.ceil((mouse.y + mouse.radius) / gridSpacing) * gridSpacing;

        for (let x = startX; x <= endX; x += gridSpacing) {
          for (let y = startY; y <= endY; y += gridSpacing) {
            const dx = mouse.x - x;
            const dy = mouse.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
              const alpha = (1 - distance / mouse.radius) * 0.25;
              ctx.beginPath();
              ctx.arc(x, y, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
              ctx.shadowBlur = 3;
              ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }
    };

    const drawConnections = () => {
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawInteractiveGrid();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-60" />;
};

export default InteractiveBackground;
