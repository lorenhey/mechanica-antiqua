/**
 * Mechanica Antiqua - Primitivas de Dibujo Técnico CAD 2D (HTML5 Canvas HiDPI)
 * Biblioteca modular para renderizado mecánico, hidráulico, térmico y estructural.
 */

window.CAD = (function() {
    'use strict';

    const COLORS = {
        bg: '#faf8f3',
        bgSchematic: '#eef2f6',
        gridMinor: 'rgba(195, 187, 171, 0.30)',
        gridMajor: 'rgba(155, 146, 130, 0.40)',
        gridBlueprint: 'rgba(29, 73, 104, 0.14)',
        ink: '#1a1917',
        inkSoft: '#57524a',
        centerline: '#962b23',
        vectorVel: '#2c6e49',
        vectorForce: '#8c6222',
        vectorThrust: '#1d4968',
        woodDark: '#5b3920',
        woodMid: '#8a5b32',
        woodLight: '#b98956',
        ironDark: '#2f3235',
        ironMid: '#686b6e',
        ironLight: '#c4c7c9',
        brassDark: '#754e16',
        brassMid: '#a7762a',
        brassLight: '#dab364',
        copperDark: '#6b2c1a',
        copperMid: '#a54a29',
        copperLight: '#d47c54',
        water: 'rgba(29, 73, 104, 0.34)',
        waterDeep: 'rgba(29, 73, 104, 0.72)',
        steam: 'rgba(218, 222, 224, 0.72)',
        fire: '#a53a1a',
        stone: '#c9c2b4',
        stoneDark: '#6e675d'
    };

    function clearAndGrid(ctx, w, h, title, subtitle, schematic) {
        ctx.save();
        ctx.fillStyle = schematic ? COLORS.bgSchematic : COLORS.bg;
        ctx.fillRect(0, 0, w, h);

        // Grilla menor (20 px)
        ctx.strokeStyle = schematic ? COLORS.gridBlueprint : COLORS.gridMinor;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        for (let x = 20; x < w; x += 20) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = 20; y < h; y += 20) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();

        // Grilla mayor (100 px)
        ctx.strokeStyle = schematic ? 'rgba(29, 73, 104, 0.24)' : COLORS.gridMajor;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        for (let x = 100; x < w; x += 100) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = 100; y < h; y += 100) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();

        // Marco fino de plancha técnica
        ctx.strokeStyle = '#b4ab9a';
        ctx.lineWidth = 1.0;
        ctx.strokeRect(12, 12, w - 24, h - 24);

        // Marcas de registro en esquinas interiores
        ctx.strokeStyle = COLORS.inkSoft;
        ctx.lineWidth = 1.0;
        const m = 18;
        [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(([rx, ry, sx, sy]) => {
            ctx.beginPath();
            ctx.moveTo(rx, ry); ctx.lineTo(rx + sx * 8, ry);
            ctx.moveTo(rx, ry); ctx.lineTo(rx, ry + sy * 8);
            ctx.stroke();
        });

        // Leyenda técnica discreta en cabecera superior (sin duplicar H1 con Cinzel)
        ctx.fillStyle = COLORS.inkSoft;
        ctx.font = '600 10.5px "IBM Plex Mono", Consolas, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(subtitle.toUpperCase(), 30, 32);

        ctx.textAlign = 'right';
        ctx.fillStyle = schematic ? COLORS.prussian || '#1d4968' : COLORS.centerline;
        ctx.fillText(schematic ? 'MODO: ESQUEMA Y VECTORES' : 'LÁMINA CINEMÁTICA · SI', w - 30, 32);

        ctx.strokeStyle = '#ccc3b1';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(28, 42);
        ctx.lineTo(w - 28, 42);
        ctx.stroke();
        ctx.restore();
    }

    function drawCenterline(ctx, x1, y1, x2, y2) {
        ctx.save();
        ctx.strokeStyle = COLORS.centerline;
        ctx.lineWidth = 0.95;
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
        ctx.strokeStyle = 'rgba(26, 25, 23, 0.28)';
        ctx.lineWidth = 1.0;
        const s = step || 8;
        ctx.beginPath();
        for (let d = -h; d < w + h; d += s) {
            ctx.moveTo(x + d, y);
            ctx.lineTo(x + d - h, y + h);
        }
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.3;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }

    function drawGroundSupport(ctx, x, y, w, h, label) {
        drawHatchRect(ctx, x - w / 2, y, w, h || 14, '#e5dfd2', 7);
        if (label) {
            ctx.save();
            ctx.fillStyle = COLORS.inkSoft;
            ctx.font = '600 10.5px "IBM Plex Mono", monospace';
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
        ctx.fillStyle = '#e5dfd2';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - baseW / 2, baseY);
        ctx.lineTo(x + baseW / 2, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Línea de tierra con achurado
        drawHatchRect(ctx, x - baseW * 0.7, baseY, baseW * 1.4, 9, '#ebe6da', 6);
        drawPin(ctx, x, y, r, label);
        ctx.restore();
    }

    function drawPin(ctx, x, y, r, label) {
        ctx.save();
        const rad = r || 6;
        const grad = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 1, x, y, rad);
        grad.addColorStop(0, '#f7e9c6');
        grad.addColorStop(0.6, COLORS.brassMid);
        grad.addColorStop(1, COLORS.brassDark);
        ctx.fillStyle = grad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.5;
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
            ctx.fillStyle = '#962b23';
            ctx.font = 'bold 11.5px "IBM Plex Mono", monospace';
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
            ctx.strokeStyle = '#1d4968';
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
            grad.addColorStop(0, '#e9e3d5');
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

        const wallFill = material === 'copper' ? '#fb923c' : (material === 'brass' ? '#fbbf24' : '#8d8578');
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
            ctx.strokeStyle = '#8d8578';
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
        const h = 26 + lines.length * 16;
        ctx.fillStyle = 'rgba(243, 239, 230, 0.90)';
        ctx.strokeStyle = '#9e9585';
        ctx.lineWidth = 1.0;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        ctx.strokeStyle = '#1a1917';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 21);
        ctx.lineTo(x + w - 8, y + 21);
        ctx.stroke();

        ctx.fillStyle = COLORS.ink;
        ctx.font = '600 10px "IBM Plex Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(title, x + 9, y + 15);

        ctx.fillStyle = COLORS.inkSoft;
        ctx.font = '10.5px "IBM Plex Mono", Consolas, monospace';
        lines.forEach((line, idx) => {
            ctx.fillText(line, x + 9, y + 36 + idx * 16);
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
