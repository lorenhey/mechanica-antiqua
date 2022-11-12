/**
 * Mechanica Antiqua - Biblioteca de Ilustración Técnica y Cutaway 2D (Canvas HiDPI)
 */

window.CAD = (function() {
    'use strict';

    const COLORS = {
        bg: '#ffffff',
        bgSchematic: '#f6f8fb',
        gridBlueprint: 'rgba(11, 79, 140, 0.07)',
        ink: '#1c1917',
        inkSoft: '#57534e',
        inkFaint: '#a8a29e',
        centerline: '#dc2626',
        vectorVel: '#15803d',
        vectorForce: '#b45309',
        vectorThrust: '#0b4f8c',
        woodDark: '#5c4028',
        woodMid: '#a98258',
        woodLight: '#d8be98',
        ironDark: '#3f3f46',
        ironMid: '#8a8d93',
        ironLight: '#e4e4e7',
        brassDark: '#6b4f1b',
        brassMid: '#ba9242',
        brassLight: '#ead39c',
        copperDark: '#6e321e',
        copperMid: '#b55e3c',
        copperLight: '#e29e82',
        water: 'rgba(22, 114, 184, 0.28)',
        waterDeep: 'rgba(15, 92, 160, 0.72)',
        waterEdge: '#0b5fa5',
        steam: 'rgba(212, 218, 224, 0.72)',
        fire: '#d9480f',
        stone: '#e2dfd7',
        stoneDark: '#8c857b'
    };

    function clearAndGrid(ctx, w, h, title, subtitle, schematic) {
        ctx.save();
        ctx.fillStyle = schematic ? COLORS.bgSchematic : COLORS.bg;
        ctx.fillRect(0, 0, w, h);
        if (schematic) {
            ctx.strokeStyle = COLORS.gridBlueprint;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let x = 40; x < w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
            for (let y = 40; y < h; y += 40) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawPhaseCaption(ctx, w, h, stepTitle, stepDesc) {
        ctx.save();
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, h - 38, w, 38);
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, h - 38); ctx.lineTo(w, h - 38); ctx.stroke();

        ctx.textBaseline = 'middle';
        const cy = h - 19;
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#0b4f8c';
        ctx.textAlign = 'left';
        ctx.fillText(stepTitle, 18, cy);

        const titleW = ctx.measureText(stepTitle).width;
        ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#444444';
        ctx.fillText(' — ' + stepDesc, 20 + titleW, cy);
        ctx.restore();
    }

    function drawCallout(ctx, tx, ty, lx, ly, text, align) {
        ctx.save();
        ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        const a = align || (lx >= tx ? 'left' : 'right');
        const tw = ctx.measureText(text).width;
        let clx = lx;
        if (a === 'left') {
            clx = Math.min(clx, 784 - tw - 5);
        } else {
            clx = Math.max(clx, 16 + tw + 5);
        }
        const cly = Math.max(18, Math.min(488, ly));
        const elbowX = clx + (a === 'left' ? -10 : 10);

        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(elbowX, cly);
        ctx.lineTo(clx, cly);
        ctx.stroke();

        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(tx, ty, 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#27272a';
        ctx.textAlign = a;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, clx + (a === 'left' ? 5 : -5), cly);
        ctx.restore();
    }

    function drawCenterline(ctx, x1, y1, x2, y2) {
        ctx.save();
        ctx.strokeStyle = COLORS.centerline;
        ctx.lineWidth = 0.9;
        ctx.setLineDash([12, 4, 3, 4]);
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
        ctx.strokeStyle = 'rgba(24, 24, 27, 0.22)';
        ctx.lineWidth = 0.9;
        const s = step || 7;
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

    function drawMasonry(ctx, x, y, w, h) {
        ctx.save();
        ctx.fillStyle = '#ebe8e1';
        ctx.fillRect(x, y, w, h);
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.strokeStyle = '#c4bfb4';
        ctx.lineWidth = 1.0;
        const rowH = 16;
        const colW = 32;
        for (let row = 0, yy = y; yy < y + h; row++, yy += rowH) {
            ctx.beginPath();
            ctx.moveTo(x, yy);
            ctx.lineTo(x + w, yy);
            ctx.stroke();
            const offset = (row % 2) * (colW / 2);
            for (let xx = x + offset; xx < x + w; xx += colW) {
                ctx.beginPath();
                ctx.moveTo(xx, yy);
                ctx.lineTo(xx, yy + rowH);
                ctx.stroke();
            }
        }
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }

    function drawGroundSupport(ctx, x, y, w, h, label) {
        drawHatchRect(ctx, x - w / 2, y, w, h || 12, '#f4f4f5', 7);
        if (label) {
            ctx.save();
            ctx.fillStyle = COLORS.inkSoft;
            ctx.font = '500 10.5px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + (h || 12) + 13);
            ctx.restore();
        }
    }

    function drawFixedPivot(ctx, x, y, r, label) {
        ctx.save();
        const baseW = r * 2.4;
        const baseY = y + r * 1.9;
        ctx.fillStyle = '#f4f4f5';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - baseW / 2, baseY);
        ctx.lineTo(x + baseW / 2, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        drawHatchRect(ctx, x - baseW * 0.72, baseY, baseW * 1.44, 7, '#f4f4f5', 5);
        drawPin(ctx, x, y, r, label);
        ctx.restore();
    }

    function drawPin(ctx, x, y, r, label) {
        ctx.save();
        const rad = r || 5.5;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = COLORS.ink;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.8, rad * 0.35), 0, Math.PI * 2);
        ctx.fill();

        if (label) {
            ctx.fillStyle = COLORS.ink;
            ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(label, x + rad + 5, y - rad + 2);
        }
        ctx.restore();
    }

    // Tubería hueca en corte real con paredes metálicas, fluido interior y flujo direccional
    function drawPipe(ctx, points, outerW, fluidFill, phase, flowActive, showBubbles) {
        if (!points || points.length < 2) return;
        const w = outerW || 16;
        const innerW = Math.max(4, w - 5);

        ctx.save();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'butt';

        // Pared exterior oscura
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = w;
        ctx.beginPath();
        points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        // Canal hueco interior
        ctx.strokeStyle = fluidFill || '#ffffff';
        ctx.lineWidth = innerW;
        ctx.beginPath();
        points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        // Partículas o burbujas viajando a lo largo de los tramos del tubo
        if (flowActive) {
            let totalLen = 0;
            const segs = [];
            for (let i = 0; i < points.length - 1; i++) {
                const dx = points[i + 1][0] - points[i][0];
                const dy = points[i + 1][1] - points[i][1];
                const l = Math.hypot(dx, dy);
                segs.push({ x0: points[i][0], y0: points[i][1], dx, dy, l, start: totalLen });
                totalLen += l;
            }
            const nDots = Math.max(3, Math.floor(totalLen / 34));
            const prog = ((phase % (Math.PI * 2)) / (Math.PI * 2));
            for (let d = 0; d < nDots; d++) {
                const dist = (((d / nDots) + prog) % 1) * totalLen;
                const seg = segs.find(s => dist >= s.start && dist <= s.start + s.l) || segs[0];
                const lt = seg.l > 0 ? (dist - seg.start) / seg.l : 0;
                const px = seg.x0 + seg.dx * lt;
                const py = seg.y0 + seg.dy * lt;
                if (showBubbles) {
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#0b5fa5';
                    ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.arc(px, py, innerW * 0.34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                } else {
                    const ang = Math.atan2(seg.dy, seg.dx);
                    ctx.save();
                    ctx.translate(px, py);
                    ctx.rotate(ang);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.moveTo(-3, -3); ctx.lineTo(2, 0); ctx.lineTo(-3, 3);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        ctx.restore();
    }

    function drawWaterSurface(ctx, x, y, w, h, phase, rippleAmp) {
        ctx.save();
        ctx.fillStyle = COLORS.water;
        const amp = rippleAmp || 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y);
        for (let xx = 0; xx <= w; xx += 10) {
            const wy = y + Math.sin(xx * 0.08 + phase * 3) * amp;
            ctx.lineTo(x + xx, wy);
        }
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();

        // Línea de menisco superficial nítida
        ctx.strokeStyle = COLORS.waterEdge;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let xx = 0; xx <= w; xx += 10) {
            const wy = y + Math.sin(xx * 0.08 + phase * 3) * amp;
            if (xx === 0) ctx.moveTo(x + xx, wy);
            else ctx.lineTo(x + xx, wy);
        }
        ctx.stroke();
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
            ctx.lineWidth = 2.6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(len, 0);
            ctx.stroke();
            ctx.restore();
            return;
        }

        let fill = COLORS.ironLight;
        let stroke = COLORS.ink;
        if (material === 'wood') { fill = COLORS.woodMid; stroke = COLORS.woodDark; }
        else if (material === 'brass') { fill = COLORS.brassMid; stroke = COLORS.brassDark; }
        else if (material === 'copper') { fill = COLORS.copperMid; stroke = COLORS.copperDark; }
        else if (material === 'iron') { fill = '#a1a1aa'; stroke = COLORS.ink; }

        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.5;

        const rEnd = w * 0.58;
        ctx.beginPath();
        ctx.arc(0, 0, rEnd, Math.PI * 0.5, Math.PI * 1.5);
        ctx.lineTo(len, -w / 2);
        ctx.arc(len, 0, rEnd, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineTo(0, w / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ranura de aligeramiento o nervio en bielas
        if (len > 45 && material !== 'wood') {
            ctx.strokeStyle = 'rgba(24, 24, 27, 0.25)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(rEnd + 5, 0);
            ctx.lineTo(len - rEnd - 5, 0);
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
            ctx.strokeStyle = COLORS.vectorThrust;
            ctx.lineWidth = 1.4;
            ctx.setLineDash([5, 4]);
            ctx.beginPath(); ctx.arc(0, 0, rPitch, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(rPitch, 0); ctx.stroke();
            ctx.restore();
            return;
        }

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

        ctx.fillStyle = material === 'brass' ? COLORS.brassLight : (material === 'wood' ? COLORS.woodLight : '#d4d4d8');
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.3;
        ctx.fill();
        ctx.stroke();

        if (rDed > 24) {
            const numSpokes = z >= 20 ? 6 : 4;
            ctx.fillStyle = '#ffffff';
            const rInner = Math.max(11, rDed * 0.32);
            const rOuter = rDed * 0.76;
            const spokeAng = (Math.PI * 2) / numSpokes;
            for (let s = 0; s < numSpokes; s++) {
                const sa0 = s * spokeAng + 0.24;
                const sa1 = (s + 1) * spokeAng - 0.24;
                ctx.beginPath();
                ctx.arc(0, 0, rOuter, sa0, sa1);
                ctx.arc(0, 0, rInner, sa1, sa0, true);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    function drawWaterwheel(ctx, cx, cy, rOuter, numPaddles, angle, schematic) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        if (schematic) {
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(0, 0, rOuter, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-rOuter, 0); ctx.lineTo(rOuter, 0); ctx.moveTo(0, -rOuter); ctx.lineTo(0, rOuter); ctx.stroke();
            ctx.restore();
            return;
        }

        const n = numPaddles || 12;
        const rInner = rOuter * 0.78;
        ctx.strokeStyle = COLORS.woodDark;
        ctx.lineWidth = 3.5;
        for (let i = 0; i < n; i++) {
            const a = (i * Math.PI * 2) / n;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * (rInner - 4), Math.sin(a) * (rInner - 4));
            ctx.lineTo(Math.cos(a) * (rOuter + 10), Math.sin(a) * (rOuter + 10));
            ctx.stroke();
        }
        ctx.strokeStyle = COLORS.woodMid;
        ctx.lineWidth = 6;
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(-Math.cos(a) * rInner, -Math.sin(a) * rInner);
            ctx.lineTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
            ctx.stroke();
        }
        ctx.strokeStyle = COLORS.woodMid;
        ctx.lineWidth = rOuter - rInner;
        ctx.beginPath(); ctx.arc(0, 0, (rOuter + rInner) / 2, 0, Math.PI * 2); ctx.stroke();

        ctx.strokeStyle = COLORS.woodDark;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(0, 0, rOuter, 0, Math.PI * 2); ctx.arc(0, 0, rInner, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }

    function drawCylinder(ctx, x, y, w, h, wallThick, material, schematic) {
        const t = wallThick || 9;
        ctx.save();
        if (schematic) {
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 1.6;
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
            return;
        }
        const wallFill = material === 'copper' ? COLORS.copperLight : (material === 'brass' ? COLORS.brassLight : (material === 'wood' ? COLORS.woodLight : '#d4d4d8'));
        drawHatchRect(ctx, x - t, y, t, h, wallFill, 6);
        drawHatchRect(ctx, x + w, y, t, h, wallFill, 6);

        // Bridas superior e inferior
        ctx.fillStyle = COLORS.ironDark;
        ctx.fillRect(x - t - 5, y - 5, t + 9, 5);
        ctx.fillRect(x + w - 4, y - 5, t + 9, 5);
        ctx.fillRect(x - t - 5, y + h, t + 9, 5);
        ctx.fillRect(x + w - 4, y + h, t + 9, 5);
        ctx.restore();
    }

    function drawPiston(ctx, cx, cy, w, h, schematic) {
        ctx.save();
        ctx.fillStyle = schematic ? '#ffffff' : '#d4d4d8';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
        if (!schematic) {
            ctx.fillStyle = COLORS.brassDark;
            ctx.fillRect(cx - w / 2 - 1, cy - h * 0.25, w + 2, 3.5);
            ctx.fillRect(cx - w / 2 - 1, cy + h * 0.15, w + 2, 3.5);
        }
        ctx.restore();
    }

    function drawCheckValve(ctx, hingeX, hingeY, length, openRatio, baseAngleDeg) {
        // Asiento de válvula con bisagra física
        ctx.save();
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hingeX - 4, hingeY);
        ctx.lineTo(hingeX + length + 4, hingeY);
        ctx.stroke();

        ctx.translate(hingeX, hingeY);
        const baseRad = (baseAngleDeg || 0) * Math.PI / 180;
        const flapAng = baseRad - Math.max(0, Math.min(1, openRatio)) * (Math.PI / 3.8);
        ctx.rotate(flapAng);

        ctx.strokeStyle = COLORS.brassDark;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(length, 0); ctx.stroke();
        ctx.restore();
        drawPin(ctx, hingeX, hingeY, 3.5);
    }

    function drawFire(ctx, cx, baseY, width, phase) {
        ctx.save();
        const flames = 5;
        const step = width / flames;
        for (let i = 0; i < flames; i++) {
            const fx = cx - width / 2 + (i + 0.5) * step;
            const fh = 16 + Math.sin(phase * 4 + i * 1.7) * 6;
            ctx.fillStyle = 'rgba(217, 72, 15, 0.8)';
            ctx.beginPath();
            ctx.moveTo(fx - step * 0.45, baseY);
            ctx.quadraticCurveTo(fx, baseY - fh * 1.2, fx + step * 0.45, baseY);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
            ctx.beginPath();
            ctx.moveTo(fx - step * 0.25, baseY);
            ctx.quadraticCurveTo(fx, baseY - fh * 0.7, fx + step * 0.25, baseY);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    function drawElasticBeam(ctx, x0, y0, x1, y1, midBend, thickness, color) {
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
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();

        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();
        ctx.restore();
    }

    function drawVector(ctx, x, y, vx, vy, color, label) {
        const mag = Math.hypot(vx, vy);
        if (mag < 2) return;
        const ang = Math.atan2(vy, vx);
        ctx.save();
        ctx.strokeStyle = color || COLORS.vectorVel;
        ctx.fillStyle = color || COLORS.vectorVel;
        ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + vx, y + vy); ctx.stroke();

        const head = 7.5;
        ctx.beginPath();
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(x + vx - head * Math.cos(ang - 0.38), y + vy - head * Math.sin(ang - 0.38));
        ctx.lineTo(x + vx - head * Math.cos(ang + 0.38), y + vy - head * Math.sin(ang + 0.38));
        ctx.closePath();
        ctx.fill();

        if (label) {
            ctx.font = '600 11px -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(label, x + vx + 5, y + vy - 3);
        }
        ctx.restore();
    }

    function drawDimension(ctx, x1, y1, x2, y2, label, extOffset) {
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len < 4) return;
        const ang = Math.atan2(dy, dx);
        const nx = -Math.sin(ang), ny = Math.cos(ang);
        const off = extOffset || 0;
        const px1 = x1 + nx * off, py1 = y1 + ny * off;
        const px2 = x2 + nx * off, py2 = y2 + ny * off;

        ctx.save();
        if (Math.abs(off) > 2) {
            ctx.strokeStyle = '#a1a1aa';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x1, y1); ctx.lineTo(px1 + nx * Math.sign(off) * 4, py1 + ny * Math.sign(off) * 4);
            ctx.moveTo(x2, y2); ctx.lineTo(px2 + nx * Math.sign(off) * 4, py2 + ny * Math.sign(off) * 4);
            ctx.stroke();
        }

        ctx.strokeStyle = COLORS.inkSoft;
        ctx.fillStyle = COLORS.inkSoft;
        ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke();

        const ah = 5.5;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px1 + ah * Math.cos(ang - 0.35), py1 + ah * Math.sin(ang - 0.35));
        ctx.lineTo(px1 + ah * Math.cos(ang + 0.35), py1 + ah * Math.sin(ang + 0.35));
        ctx.closePath(); ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(px2 - ah * Math.cos(ang - 0.35), py2 - ah * Math.sin(ang - 0.35));
        ctx.lineTo(px2 - ah * Math.cos(ang + 0.35), py2 - ah * Math.sin(ang + 0.35));
        ctx.closePath(); ctx.fill();

        if (label) {
            const mx = (px1 + px2) / 2, my = (py1 + py2) / 2;
            ctx.font = '500 10.5px ui-monospace, monospace';
            const tw = ctx.measureText(label).width + 6;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.fillRect(mx - tw / 2, my - 7, tw, 14);
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
            ctx.beginPath(); ctx.arc(px, py, 2.8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    function drawNoteBox() {}

    return {
        COLORS,
        clearAndGrid,
        drawPhaseCaption,
        drawCallout,
        drawCenterline,
        drawHatchRect,
        drawMasonry,
        drawGroundSupport,
        drawFixedPivot,
        drawPin,
        drawPipe,
        drawWaterSurface,
        drawLink,
        drawTimberBeam,
        drawGear,
        drawWaterwheel,
        drawCylinder,
        drawPiston,
        drawCheckValve,
        drawFire,
        drawElasticBeam,
        drawVector,
        drawDimension,
        drawFluidParticles,
        drawNoteBox
    };
})();
