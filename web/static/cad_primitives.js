/**
 * Mechanica Antiqua - Primitivas de Dibujo Técnico CAD 2D (HTML5 Canvas HiDPI)
 * Biblioteca modular para renderizado mecánico, hidráulico, térmico y estructural.
 */

window.CAD = (function() {
    'use strict';

    const COLORS = {
        bg: '#fcfbf7',
        bgSchematic: '#f4f7fb',
        gridMinor: 'rgba(203, 213, 225, 0.35)',
        gridMajor: 'rgba(148, 163, 184, 0.42)',
        gridBlueprint: 'rgba(59, 130, 246, 0.16)',
        ink: '#1e293b',
        inkSoft: '#475569',
        centerline: '#dc2626',
        vectorVel: '#059669',
        vectorForce: '#d97706',
        vectorThrust: '#2563eb',
        woodDark: '#6b4226',
        woodMid: '#9a6538',
        woodLight: '#c48f5a',
        ironDark: '#334155',
        ironMid: '#64748b',
        ironLight: '#cbd5e1',
        brassDark: '#92400e',
        brassMid: '#d97706',
        brassLight: '#fbbf24',
        copperDark: '#7c2d12',
        copperMid: '#c2410c',
        copperLight: '#fb923c',
        water: 'rgba(14, 165, 233, 0.55)',
        waterDeep: 'rgba(2, 132, 199, 0.78)',
        steam: 'rgba(226, 232, 240, 0.72)',
        fire: '#ea580c',
        stone: '#cbd5e1',
        stoneDark: '#64748b'
    };

    function clearAndGrid(ctx, w, h, title, subtitle, schematic) {
        ctx.save();
        ctx.fillStyle = schematic ? COLORS.bgSchematic : COLORS.bg;
        ctx.fillRect(0, 0, w, h);

        // Grilla menor (20 px)
        ctx.strokeStyle = schematic ? COLORS.gridBlueprint : COLORS.gridMinor;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let x = 20; x < w; x += 20) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = 20; y < h; y += 20) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();

        // Grilla mayor (100 px)
        ctx.strokeStyle = schematic ? 'rgba(37, 99, 235, 0.25)' : COLORS.gridMajor;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        for (let x = 100; x < w; x += 100) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = 100; y < h; y += 100) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();

        // Marco normalizado ISO de lámina
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Encabezado técnico
        ctx.fillStyle = COLORS.ink;
        ctx.font = 'bold 17px "Cinzel", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, w / 2, 36);

        ctx.fillStyle = COLORS.inkSoft;
        ctx.font = '12px "Consolas", "Courier New", monospace';
        ctx.fillText(subtitle, w / 2, 54);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 62);
        ctx.lineTo(w - 60, 62);
        ctx.stroke();
        ctx.restore();
    }

    function drawCenterline(ctx, x1, y1, x2, y2) {
        ctx.save();
        ctx.strokeStyle = COLORS.centerline;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([14, 4, 3, 4]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    function drawHatchRect(ctx, x, y, w, h, fill, step) {
        ctx.save();
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, w, h);
        }
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
        ctx.lineWidth = 1.1;
        const s = step || 8;
        ctx.beginPath();
        for (let d = -h; d < w + h; d += s) {
            ctx.moveTo(x + d, y);
            ctx.lineTo(x + d - h, y + h);
        }
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }

    function drawGroundSupport(ctx, x, y, w, h, label) {
        drawHatchRect(ctx, x - w / 2, y, w, h || 14, '#e2e8f0', 7);
        if (label) {
            ctx.save();
            ctx.fillStyle = COLORS.inkSoft;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + (h || 14) + 14);
            ctx.restore();
        }
    }

    function drawFixedPivot(ctx, x, y, r, label) {
        ctx.save();
        // Triángulo de apoyo fijo
        const baseW = r * 2.2;
        const baseY = y + r * 1.9;
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - baseW / 2, baseY);
        ctx.lineTo(x + baseW / 2, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Línea de tierra con achurado
        drawHatchRect(ctx, x - baseW * 0.7, baseY, baseW * 1.4, 9, '#f1f5f9', 6);
        drawPin(ctx, x, y, r, label);
        ctx.restore();
    }

    function drawPin(ctx, x, y, r, label) {
        ctx.save();
        const rad = r || 6;
        const grad = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 1, x, y, rad);
        grad.addColorStop(0, '#fef3c7');
        grad.addColorStop(0.6, COLORS.brassMid);
        grad.addColorStop(1, COLORS.brassDark);
        ctx.fillStyle = grad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eje interno
        ctx.fillStyle = COLORS.ink;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, rad * 0.35), 0, Math.PI * 2);
        ctx.fill();

        if (label) {
            ctx.fillStyle = '#b91c1c';
            ctx.font = 'bold 12px "Consolas", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(label, x + rad + 5, y - rad + 2);
        }
        ctx.restore();
    }

    function drawLink(ctx, x1, y1, x2, y2, thickness, material, schematic) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len < 1) return;
        const ang = Math.atan2(dy, dx);
        const w = thickness || 12;

        ctx.save();
        ctx.translate(x1, y1);
        ctx.rotate(ang);

        if (schematic) {
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(len, 0);
            ctx.stroke();
            ctx.restore();
            return;
        }

        // Gradiente cilíndrico perpendicular al eslabón
        const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
        if (material === 'wood') {
            grad.addColorStop(0, COLORS.woodLight);
            grad.addColorStop(0.45, COLORS.woodMid);
            grad.addColorStop(1, COLORS.woodDark);
        } else if (material === 'brass') {
            grad.addColorStop(0, COLORS.brassLight);
            grad.addColorStop(0.5, COLORS.brassMid);
            grad.addColorStop(1, COLORS.brassDark);
        } else {
            grad.addColorStop(0, COLORS.ironLight);
            grad.addColorStop(0.4, COLORS.ironMid);
            grad.addColorStop(1, COLORS.ironDark);
        }

        ctx.fillStyle = grad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;

        const rEnd = w * 0.65;
        ctx.beginPath();
        ctx.arc(0, 0, rEnd, Math.PI * 0.5, Math.PI * 1.5);
        ctx.lineTo(len, -w / 2);
        ctx.arc(len, 0, rEnd, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineTo(0, w / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ranura o nervadura central de rigidez en bielas metálicas
        if (len > 45 && material !== 'wood') {
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rEnd + 4, 0);
            ctx.lineTo(len - rEnd - 4, 0);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawTimberBeam(ctx, x1, y1, x2, y2, width, schematic) {
        drawLink(ctx, x1, y1, x2, y2, width, 'wood', schematic);
    }

    function drawGear(ctx, cx, cy, rPitch, teeth, angle, material, schematic) {
        const z = Math.max(8, teeth || 16);
        const mod = (2 * rPitch) / z;
        const rAdd = rPitch + mod * 0.85;
        const rDed = Math.max(8, rPitch - mod * 1.05);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        if (schematic) {
            // Circunferencia primitiva normalizada en modo esquema
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, rPitch, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            // Indicador de ángulo de fase
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rPitch, 0);
            ctx.stroke();
            ctx.restore();
            return;
        }

        // Perfil dentado real diente por diente
        ctx.beginPath();
        const step = (Math.PI * 2) / z;
        for (let i = 0; i < z; i++) {
            const a0 = i * step;
            const a1 = a0 + step * 0.18;
            const a2 = a0 + step * 0.30;
            const a3 = a0 + step * 0.56;
            const a4 = a0 + step * 0.68;
            if (i === 0) ctx.moveTo(Math.cos(a0) * rDed, Math.sin(a0) * rDed);
            else ctx.lineTo(Math.cos(a0) * rDed, Math.sin(a0) * rDed);
            ctx.lineTo(Math.cos(a1) * rDed, Math.sin(a1) * rDed);
            ctx.lineTo(Math.cos(a2) * rAdd, Math.sin(a2) * rAdd);
            ctx.lineTo(Math.cos(a3) * rAdd, Math.sin(a3) * rAdd);
            ctx.lineTo(Math.cos(a4) * rDed, Math.sin(a4) * rDed);
        }
        ctx.closePath();

        const grad = ctx.createRadialGradient(-rPitch * 0.25, -rPitch * 0.25, rPitch * 0.1, 0, 0, rAdd);
        if (material === 'brass') {
            grad.addColorStop(0, '#fde68a');
            grad.addColorStop(0.6, COLORS.brassMid);
            grad.addColorStop(1, COLORS.brassDark);
        } else if (material === 'wood') {
            grad.addColorStop(0, COLORS.woodLight);
            grad.addColorStop(0.7, COLORS.woodMid);
            grad.addColorStop(1, COLORS.woodDark);
        } else {
            grad.addColorStop(0, '#e2e8f0');
            grad.addColorStop(0.6, COLORS.ironMid);
            grad.addColorStop(1, COLORS.ironDark);
        }
        ctx.fillStyle = grad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.4;
        ctx.fill();
        ctx.stroke();

        // Aligeramiento interno / rayos (si el radio es suficiente)
        if (rDed > 26) {
            const numSpokes = z >= 24 ? 6 : 4;
            ctx.fillStyle = COLORS.bg;
            const rInner = Math.max(12, rDed * 0.32);
            const rOuter = rDed * 0.76;
            const spokeAng = (Math.PI * 2) / numSpokes;
            for (let s = 0; s < numSpokes; s++) {
                const sa0 = s * spokeAng + 0.22;
                const sa1 = (s + 1) * spokeAng - 0.22;
                ctx.beginPath();
                ctx.arc(0, 0, rOuter, sa0, sa1);
                ctx.arc(0, 0, rInner, sa1, sa0, true);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        // Circunferencia primitiva sutil
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
        ctx.lineWidth = 0.9;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, rPitch, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
    }

    function drawWaterwheel(ctx, cx, cy, rOuter, numPaddles, angle, schematic) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        if (schematic) {
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-rOuter, 0); ctx.lineTo(rOuter, 0);
            ctx.moveTo(0, -rOuter); ctx.lineTo(0, rOuter);
            ctx.stroke();
            ctx.restore();
            return;
        }

        const n = numPaddles || 12;
        const rInner = rOuter * 0.78;
        // Paletas radiales
        ctx.strokeStyle = COLORS.woodDark;
        ctx.lineWidth = 4;
        for (let i = 0; i < n; i++) {
            const a = (i * Math.PI * 2) / n;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * (rInner - 6), Math.sin(a) * (rInner - 6));
            ctx.lineTo(Math.cos(a) * (rOuter + 10), Math.sin(a) * (rOuter + 10));
            ctx.stroke();
        }
        // Rayos estructurales (4 u 8)
        ctx.strokeStyle = COLORS.woodMid;
        ctx.lineWidth = 6;
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(-Math.cos(a) * rInner, -Math.sin(a) * rInner);
            ctx.lineTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
            ctx.stroke();
        }

        // Corona de madera con refuerzos
        ctx.strokeStyle = COLORS.woodMid;
        ctx.lineWidth = rOuter - rInner;
        ctx.beginPath();
        ctx.arc(0, 0, (rOuter + rInner) / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = COLORS.woodDark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
        ctx.arc(0, 0, rInner, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    function drawCylinder(ctx, x, y, w, h, wallThick, material, schematic) {
        const t = wallThick || 10;
        ctx.save();
        if (schematic) {
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
            return;
        }

        const wallFill = material === 'copper' ? '#fb923c' : (material === 'brass' ? '#fbbf24' : '#94a3b8');
        // Paredes en corte con achurado a 45° ISO
        drawHatchRect(ctx, x - t, y, t, h, wallFill, 6);
        drawHatchRect(ctx, x + w, y, t, h, wallFill, 6);

        // Bridas superiores e inferiores con pernos
        ctx.fillStyle = COLORS.ironDark;
        ctx.fillRect(x - t - 6, y - 6, t + 10, 6);
        ctx.fillRect(x + w - 4, y - 6, t + 10, 6);
        ctx.fillRect(x - t - 6, y + h, t + 10, 6);
        ctx.fillRect(x + w - 4, y + h, t + 10, 6);
        ctx.restore();
    }

    function drawPiston(ctx, cx, cy, w, h, schematic) {
        ctx.save();
        if (schematic) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 2;
            ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
            ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
            ctx.restore();
            return;
        }
        const grad = ctx.createLinearGradient(cx - w / 2, cy, cx + w / 2, cy);
        grad.addColorStop(0, COLORS.ironDark);
        grad.addColorStop(0.5, COLORS.ironLight);
        grad.addColorStop(1, COLORS.ironDark);
        ctx.fillStyle = grad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

        // Aros selladores de cuero / bronce
        ctx.fillStyle = COLORS.brassMid;
        ctx.fillRect(cx - w / 2 - 1, cy - h * 0.25, w + 2, 4);
        ctx.fillRect(cx - w / 2 - 1, cy + h * 0.15, w + 2, 4);
        ctx.restore();
    }

    function drawCheckValve(ctx, hingeX, hingeY, length, openRatio, baseAngleDeg) {
        // openRatio in [0, 1]: 0 = cerrada, 1 = abierta 45°
        ctx.save();
        ctx.translate(hingeX, hingeY);
        const baseRad = (baseAngleDeg || 0) * Math.PI / 180;
        const flapAng = baseRad - Math.max(0, Math.min(1, openRatio)) * (Math.PI / 4);
        ctx.rotate(flapAng);

        ctx.strokeStyle = COLORS.brassDark;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length, 0);
        ctx.stroke();

        // Disco de cuero de sello
        ctx.fillStyle = COLORS.brassLight;
        ctx.beginPath();
        ctx.arc(length * 0.5, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        drawPin(ctx, hingeX, hingeY, 4);
    }

    function drawElasticBeam(ctx, x0, y0, x1, y1, midBend, thickness, color) {
        // Viga flexible cúbica aproximada por curva cuadrática de Euler-Bernoulli
        ctx.save();
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        const dx = x1 - x0;
        const dy = y1 - y0;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const cx = mx + nx * midBend;
        const cy = my + ny * midBend;

        ctx.strokeStyle = color || COLORS.woodMid;
        ctx.lineWidth = thickness || 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();

        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();
        ctx.restore();
    }

    function drawVector(ctx, x, y, vx, vy, color, label) {
        const mag = Math.hypot(vx, vy);
        if (mag < 2) return;
        const ang = Math.atan2(vy, vx);
        ctx.save();
        ctx.strokeStyle = color || COLORS.vectorVel;
        ctx.fillStyle = color || COLORS.vectorVel;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx, y + vy);
        ctx.stroke();

        // Punta de flecha
        const head = 8;
        ctx.beginPath();
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(x + vx - head * Math.cos(ang - 0.4), y + vy - head * Math.sin(ang - 0.4));
        ctx.lineTo(x + vx - head * Math.cos(ang + 0.4), y + vy - head * Math.sin(ang + 0.4));
        ctx.closePath();
        ctx.fill();

        if (label) {
            ctx.font = 'bold 11px "Consolas", monospace';
            ctx.fillText(label, x + vx + 6, y + vy - 4);
        }
        ctx.restore();
    }

    function drawDimension(ctx, x1, y1, x2, y2, label, extOffset) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len < 4) return;
        const ang = Math.atan2(dy, dx);
        const nx = -Math.sin(ang);
        const ny = Math.cos(ang);
        const off = extOffset || 0;

        const px1 = x1 + nx * off;
        const py1 = y1 + ny * off;
        const px2 = x2 + nx * off;
        const py2 = y2 + ny * off;

        ctx.save();
        // Líneas de extensión
        if (Math.abs(off) > 2) {
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(x1, y1); ctx.lineTo(px1 + nx * Math.sign(off) * 5, py1 + ny * Math.sign(off) * 5);
            ctx.moveTo(x2, y2); ctx.lineTo(px2 + nx * Math.sign(off) * 5, py2 + ny * Math.sign(off) * 5);
            ctx.stroke();
        }

        // Línea principal de cota con flechas
        ctx.strokeStyle = COLORS.inkSoft;
        ctx.fillStyle = COLORS.inkSoft;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();

        const ah = 6;
        // Flecha inicio
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px1 + ah * Math.cos(ang - 0.35), py1 + ah * Math.sin(ang - 0.35));
        ctx.lineTo(px1 + ah * Math.cos(ang + 0.35), py1 + ah * Math.sin(ang + 0.35));
        ctx.closePath();
        ctx.fill();

        // Flecha fin
        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(px2 - ah * Math.cos(ang - 0.35), py2 - ah * Math.sin(ang - 0.35));
        ctx.lineTo(px2 - ah * Math.cos(ang + 0.35), py2 - ah * Math.sin(ang + 0.35));
        ctx.closePath();
        ctx.fill();

        if (label) {
            const mx = (px1 + px2) / 2;
            const my = (py1 + py2) / 2;
            ctx.font = 'bold 11px "Consolas", monospace';
            const tw = ctx.measureText(label).width + 8;
            ctx.fillStyle = 'rgba(252, 251, 247, 0.92)';
            ctx.fillRect(mx - tw / 2, my - 8, tw, 16);
            ctx.fillStyle = COLORS.ink;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, mx, my);
        }
        ctx.restore();
    }

    function drawFluidParticles(ctx, x1, y1, x2, y2, phase, active, color) {
        if (!active) return;
        ctx.save();
        ctx.fillStyle = color || COLORS.waterDeep;
        const count = 6;
        for (let i = 0; i < count; i++) {
            const t = ((i / count) + (phase / (Math.PI * 2))) % 1;
            const px = x1 + (x2 - x1) * t;
            const py = y1 + (y2 - y1) * t;
            ctx.beginPath();
            ctx.arc(px, py, 3.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawNoteBox(ctx, x, y, w, title, lines) {
        ctx.save();
        const h = 28 + lines.length * 17;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, w, h, 4) : ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x + 1, y + 1, w - 2, 22);
        ctx.fillStyle = COLORS.ink;
        ctx.font = 'bold 11px "Cinzel", serif';
        ctx.textAlign = 'left';
        ctx.fillText(title, x + 10, y + 15);

        ctx.fillStyle = '#334155';
        ctx.font = '11px "Consolas", monospace';
        lines.forEach((line, idx) => {
            ctx.fillText(line, x + 10, y + 38 + idx * 17);
        });
        ctx.restore();
    }

    return {
        COLORS,
        clearAndGrid,
        drawCenterline,
        drawHatchRect,
        drawGroundSupport,
        drawFixedPivot,
        drawPin,
        drawLink,
        drawTimberBeam,
        drawGear,
        drawWaterwheel,
        drawCylinder,
        drawPiston,
        drawCheckValve,
        drawElasticBeam,
        drawVector,
        drawDimension,
        drawFluidParticles,
        drawNoteBox
    };
})();
