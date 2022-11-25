/**
 * Mechanica Antiqua - Biblioteca Gráfica de Ingeniería Mecánica y Cutaway 2D (Canvas HiDPI)
 * Motor volumétrico con gradientes metálicos, dinámicas de fluidos, cortes reglamentarios (ISO 128)
 * y telemetría analítica en tiempo real para las 42 máquinas históricas.
 */

window.CAD = (function() {
    'use strict';

    // Paleta cromática técnica calibrada para dibujo mecánico clásico y legible
    const COLORS = {
        bg: '#ffffff',
        bgSchematic: '#f8fafc',
        gridBlueprint: 'rgba(15, 76, 129, 0.06)',
        ink: '#0f172a',
        inkDark: '#020617',
        inkSoft: '#475569',
        inkFaint: '#94a3b8',
        centerline: '#dc2626',
        vectorVel: '#16a34a',
        vectorForce: '#ea580c',
        vectorThrust: '#0284c7',
        
        // Tonos base para metales y maderas
        woodDark: '#452c16',
        woodMid: '#85552b',
        woodLight: '#c29668',
        woodGrain: '#38220d',
        
        ironDark: '#1e293b',
        ironMid: '#475569',
        ironLight: '#cbd5e1',
        ironHighlight: '#f1f5f9',
        
        brassDark: '#523d0a',
        brassMid: '#a1781c',
        brassLight: '#eab308',
        brassHighlight: '#fef08a',
        
        copperDark: '#581c0c',
        copperMid: '#9a3412',
        copperLight: '#ea580c',
        copperHighlight: '#fed7aa',

        bronzeDark: '#452b0c',
        bronzeMid: '#8c591a',
        bronzeLight: '#ca8a04',
        bronzeHighlight: '#fef08a',

        steelDark: '#0f172a',
        steelMid: '#334155',
        steelLight: '#94a3b8',
        steelHighlight: '#ffffff',
        
        waterSurface: '#38bdf8',
        waterShallow: 'rgba(56, 189, 248, 0.45)',
        waterMid: 'rgba(2, 132, 199, 0.65)',
        waterDeep: 'rgba(3, 105, 161, 0.85)',
        waterEdge: '#0284c7',
        
        steam: 'rgba(226, 232, 240, 0.55)',
        fireCore: '#fef08a',
        fireMid: '#f97316',
        fireOuter: '#dc2626',
        
        stone: '#e2e8f0',
        stoneDark: '#64748b',
        hatchLine: 'rgba(15, 23, 42, 0.35)'
    };

    /**
     * Crea un gradiente lineal metálico cilíndrico que otorga volumen 3D inmediato a piezas axiales.
     */
    function createMaterialGradient(ctx, x1, y1, x2, y2, material) {
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        switch (material) {
            case 'brass':
                grad.addColorStop(0.00, '#4a3608');
                grad.addColorStop(0.20, '#a3791a');
                grad.addColorStop(0.38, '#fef08a');
                grad.addColorStop(0.55, '#c99a24');
                grad.addColorStop(0.85, '#78560f');
                grad.addColorStop(1.00, '#382705');
                break;
            case 'copper':
                grad.addColorStop(0.00, '#431407');
                grad.addColorStop(0.18, '#9a3412');
                grad.addColorStop(0.35, '#fdba74');
                grad.addColorStop(0.55, '#c2410c');
                grad.addColorStop(0.85, '#7c2d12');
                grad.addColorStop(1.00, '#2d0c04');
                break;
            case 'bronze':
                grad.addColorStop(0.00, '#382209');
                grad.addColorStop(0.20, '#784d15');
                grad.addColorStop(0.38, '#eab308');
                grad.addColorStop(0.55, '#a16207');
                grad.addColorStop(0.85, '#54340d');
                grad.addColorStop(1.00, '#261604');
                break;
            case 'iron':
            case 'cast_iron':
                grad.addColorStop(0.00, '#0f172a');
                grad.addColorStop(0.22, '#334155');
                grad.addColorStop(0.40, '#94a3b8');
                grad.addColorStop(0.58, '#475569');
                grad.addColorStop(0.88, '#1e293b');
                grad.addColorStop(1.00, '#020617');
                break;
            case 'steel':
                grad.addColorStop(0.00, '#1e293b');
                grad.addColorStop(0.25, '#64748b');
                grad.addColorStop(0.45, '#ffffff');
                grad.addColorStop(0.65, '#94a3b8');
                grad.addColorStop(0.88, '#334155');
                grad.addColorStop(1.00, '#0f172a');
                break;
            case 'wood':
                grad.addColorStop(0.00, '#3c2410');
                grad.addColorStop(0.20, '#6d4520');
                grad.addColorStop(0.40, '#a57342');
                grad.addColorStop(0.60, '#85552b');
                grad.addColorStop(0.85, '#543415');
                grad.addColorStop(1.00, '#2a1809');
                break;
            case 'glass':
                grad.addColorStop(0.00, 'rgba(255, 255, 255, 0.45)');
                grad.addColorStop(0.25, 'rgba(186, 230, 253, 0.25)');
                grad.addColorStop(0.50, 'rgba(255, 255, 255, 0.65)');
                grad.addColorStop(0.75, 'rgba(125, 211, 252, 0.20)');
                grad.addColorStop(1.00, 'rgba(255, 255, 255, 0.40)');
                break;
            default:
                grad.addColorStop(0.00, '#334155');
                grad.addColorStop(0.40, '#e2e8f0');
                grad.addColorStop(1.00, '#1e293b');
                break;
        }
        return grad;
    }

    /**
     * Limpieza de lienzo y grilla técnica milimetrada sutil.
     */
    function clearAndGrid(ctx, w, h, title, subtitle, schematic) {
        ctx.save();
        ctx.fillStyle = schematic ? COLORS.bgSchematic : COLORS.bg;
        ctx.fillRect(0, 0, w, h);

        // Cuadrícula isométrica/técnica fina (cada 30px y mayor cada 90px)
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = COLORS.gridBlueprint;
        ctx.beginPath();
        for (let x = 30; x < w; x += 30) {
            ctx.moveTo(x, 0); ctx.lineTo(x, h);
        }
        for (let y = 30; y < h; y += 30) {
            ctx.moveTo(0, y); ctx.lineTo(w, y);
        }
        ctx.stroke();

        ctx.lineWidth = 0.9;
        ctx.strokeStyle = 'rgba(15, 76, 129, 0.11)';
        ctx.beginPath();
        for (let x = 90; x < w; x += 90) {
            ctx.moveTo(x, 0); ctx.lineTo(x, h);
        }
        for (let y = 90; y < h; y += 90) {
            ctx.moveTo(0, y); ctx.lineTo(w, y);
        }
        ctx.stroke();

        // Marco técnico perimetral (formato de plano reglamentario)
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        ctx.restore();
    }

    /**
     * Barra inferior con explicación clara de la fase cinemática actual y su física subyacente.
     */
    function drawPhaseCaption(ctx, w, h, stepTitle, stepDesc) {
        ctx.save();
        const barH = 42;
        const barY = h - barH;

        // Fondo degradado sutil con borde superior definido
        const bgGrad = ctx.createLinearGradient(0, barY, 0, h);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, barY, w, barH);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, barY);
        ctx.lineTo(w, barY);
        ctx.stroke();

        ctx.textBaseline = 'middle';
        const cy = barY + barH / 2;

        // Indicador luminoso de estado activo
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(22, cy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(22, cy, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Título de fase en azul técnico destacado
        ctx.font = '700 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0369a1';
        ctx.textAlign = 'left';
        ctx.fillText(stepTitle, 36, cy);

        const titleW = ctx.measureText(stepTitle).width;

        // Separador técnico
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12px sans-serif';
        ctx.fillText(' | ', 40 + titleW, cy);

        // Descripción analítica del fenómeno físico
        ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(stepDesc, 55 + titleW, cy);

        ctx.restore();
    }

    /**
     * Panel HUD de Telemetría analítica en tiempo real (ángulo de manivela, RPM, presión, velocidad).
     */
    function drawTelemetryHUD(ctx, x, y, labels) {
        if (!labels || labels.length === 0) return;
        ctx.save();
        ctx.font = '600 10.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
        
        let totalW = 0;
        const parsed = labels.map(l => {
            const tw = ctx.measureText(l).width;
            totalW += tw + 18;
            return { text: l, width: tw };
        });

        const padX = 10, padY = 5, boxH = 24;
        const boxW = totalW + padX;

        // Caja técnica tipo visor digital translúcido
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        let curX = x + padX;
        parsed.forEach((item, idx) => {
            ctx.fillStyle = idx === 0 ? '#38bdf8' : (idx === 1 ? '#4ade80' : '#f8fafc');
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.text, curX, y + boxH / 2);
            curX += item.width + 16;
            if (idx < parsed.length - 1) {
                ctx.fillStyle = '#475569';
                ctx.fillText('·', curX - 10, y + boxH / 2);
            }
        });

        ctx.restore();
    }

    /**
     * Llamadas técnicas reglamentarias con punto de flecha y línea directriz en codo.
     */
    function drawCallout(ctx, tx, ty, lx, ly, text, align) {
        ctx.save();
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        const a = align || (lx >= tx ? 'left' : 'right');
        const tw = ctx.measureText(text).width;
        let clx = lx;
        if (a === 'left') {
            clx = Math.min(clx, 784 - tw - 6);
        } else {
            clx = Math.max(clx, 16 + tw + 6);
        }
        const cly = Math.max(22, Math.min(480, ly));
        const elbowX = clx + (a === 'left' ? -12 : 12);

        // Línea directriz fina y precisa
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(elbowX, cly);
        ctx.lineTo(clx, cly);
        ctx.stroke();

        // Punto de anclaje oscuro con halo concéntrico
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(tx, ty, 5.5, 0, Math.PI * 2);
        ctx.stroke();

        // Pequeño recuadro fondo de texto para máxima legibilidad
        const textX = clx + (a === 'left' ? 6 : -6);
        const boxX = a === 'left' ? textX - 2 : textX - tw - 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.fillRect(boxX, cly - 8, tw + 4, 16);

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = a;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, textX, cly);
        ctx.restore();
    }

    /**
     * Eje de simetría técnico (línea de trazo largo y punto rojo reglamentaria).
     */
    function drawCenterline(ctx, x1, y1, x2, y2) {
        ctx.save();
        ctx.strokeStyle = COLORS.centerline;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([16, 5, 3, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Rayado reglamentario de corte transversal (ISO 128 a 45° con líneas nítidas).
     */
    function drawHatchRect(ctx, x, y, w, h, fill, step) {
        ctx.save();
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, w, h);
        }
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.strokeStyle = COLORS.hatchLine;
        ctx.lineWidth = 1.0;
        const s = step || 8;
        ctx.beginPath();
        for (let d = -h - 20; d < w + h + 20; d += s) {
            ctx.moveTo(x + d, y);
            ctx.lineTo(x + d - h, y + h);
        }
        ctx.stroke();
        ctx.restore();

        // Contorno de pieza en corte grueso
        ctx.save();
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }

    /**
     * Mampostería de sillería de piedra con sombreado volumétrico.
     */
    function drawMasonry(ctx, x, y, w, h) {
        ctx.save();
        const stoneGrad = ctx.createLinearGradient(x, y, x + w, y);
        stoneGrad.addColorStop(0, '#cbd5e1');
        stoneGrad.addColorStop(0.5, '#e2e8f0');
        stoneGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = stoneGrad;
        ctx.fillRect(x, y, w, h);

        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        const rowH = 18;
        const colW = 36;
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
        ctx.lineWidth = 1.8;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }

    /**
     * Apoyo a tierra o bancada rígida con rayado técnico inferior.
     */
    function drawGroundSupport(ctx, x, y, w, h, label) {
        drawHatchRect(ctx, x - w / 2, y, w, h || 14, '#e2e8f0', 7);
        if (label) {
            ctx.save();
            ctx.fillStyle = COLORS.inkSoft;
            ctx.font = '600 11px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + (h || 14) + 14);
            ctx.restore();
        }
    }

    /**
     * Articulación fija a tierra (pivote empotrado con buje de bronce y pasador).
     */
    function drawFixedPivot(ctx, x, y, r, label) {
        ctx.save();
        const rad = r || 6;
        const baseW = rad * 3.0;
        const baseY = y + rad * 2.2;

        // Triángulo de soporte con sombreado de acero
        const triGrad = ctx.createLinearGradient(x - baseW / 2, y, x + baseW / 2, baseY);
        triGrad.addColorStop(0, '#94a3b8');
        triGrad.addColorStop(0.5, '#cbd5e1');
        triGrad.addColorStop(1, '#475569');
        ctx.fillStyle = triGrad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - baseW / 2, baseY);
        ctx.lineTo(x + baseW / 2, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Rayado de anclaje inferior
        drawHatchRect(ctx, x - baseW * 0.8, baseY, baseW * 1.6, 8, '#e2e8f0', 5);

        // Buje exterior de bronce y pasador central
        drawPin(ctx, x, y, rad, label);
        ctx.restore();
    }

    /**
     * Pasador cilíndrico / bulón rectificado con chaveta o arandela.
     */
    function drawPin(ctx, x, y, r, label) {
        ctx.save();
        const rad = r || 6;

        // Buje exterior con gradiente de bronce/latón
        const bujeGrad = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 1, x, y, rad);
        bujeGrad.addColorStop(0, '#fef08a');
        bujeGrad.addColorStop(0.5, '#eab308');
        bujeGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = bujeGrad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Orificio / cabeza de bulón central
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2.2, rad * 0.4), 0, Math.PI * 2);
        ctx.fill();

        // Brillo especular
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(x - rad * 0.35, y - rad * 0.35, Math.max(1.2, rad * 0.22), 0, Math.PI * 2);
        ctx.fill();

        if (label) {
            ctx.fillStyle = COLORS.ink;
            ctx.font = '700 11px ui-monospace, SFMono-Regular, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(label, x + rad + 6, y - rad + 3);
        }
        ctx.restore();
    }

    /**
     * Tubería volumétrica en corte longitudinal con paredes metálicas rayadas,
     * canal interno con fluido translúcido, bridas apernadas y flechas chevron de caudal.
     */
    function drawPipe(ctx, points, outerW, fluidFill, phase, flowActive, showBubbles, options) {
        if (!points || points.length < 2) return;
        const w = outerW || 18;
        const innerW = Math.max(6, w - 6);
        const material = (options && options.material) || 'copper';

        ctx.save();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'butt';

        // 1. Pared exterior metálica gruesa con contorno
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = w;
        ctx.beginPath();
        points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        // 2. Rayado o gradiente en el espesor del tubo
        ctx.strokeStyle = material === 'bronze' ? '#a16207' : (material === 'brass' ? '#ca8a04' : '#c2410c');
        ctx.lineWidth = w - 2;
        ctx.beginPath();
        points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        // 3. Canal interior del fluido
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = innerW + 1.5;
        ctx.beginPath();
        points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        const fluidCol = fluidFill || 'rgba(14, 116, 144, 0.75)';
        ctx.strokeStyle = fluidCol;
        ctx.lineWidth = innerW;
        ctx.beginPath();
        points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        // Brillo interior superior para efecto cilíndrico en el líquido
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = innerW * 0.28;
        ctx.beginPath();
        points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        // 4. Dinámica de flujo activa: flechas chevron o burbujas esféricas 3D
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

            if (showBubbles) {
                // Burbujas esféricas con brillo especular ascendiendo
                const nBubbles = Math.max(3, Math.floor(totalLen / 36));
                const prog = ((phase % (Math.PI * 2)) / (Math.PI * 2));
                for (let b = 0; b < nBubbles; b++) {
                    const dist = (((b / nBubbles) + prog) % 1) * totalLen;
                    const seg = segs.find(s => dist >= s.start && dist <= s.start + s.l) || segs[0];
                    const lt = seg.l > 0 ? (dist - seg.start) / seg.l : 0;
                    const wobble = Math.sin(phase * 4 + b * 2) * (innerW * 0.18);
                    const px = seg.x0 + seg.dx * lt + (-seg.dy / (seg.l || 1)) * wobble;
                    const py = seg.y0 + seg.dy * lt + (seg.dx / (seg.l || 1)) * wobble;
                    const rad = innerW * 0.32;

                    const bGrad = ctx.createRadialGradient(px - rad * 0.3, py - rad * 0.3, 0.5, px, py, rad);
                    bGrad.addColorStop(0, '#ffffff');
                    bGrad.addColorStop(0.4, 'rgba(224, 242, 254, 0.85)');
                    bGrad.addColorStop(1, 'rgba(3, 105, 161, 0.95)');
                    ctx.fillStyle = bGrad;
                    ctx.strokeStyle = '#0284c7';
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.arc(px, py, rad, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            } else {
                // Flechas de flujo chevron dinámicas de alta visibilidad
                const nArrows = Math.max(3, Math.floor(totalLen / 42));
                const prog = ((phase % (Math.PI * 2)) / (Math.PI * 2));
                for (let a = 0; a < nArrows; a++) {
                    const dist = (((a / nArrows) + prog) % 1) * totalLen;
                    const seg = segs.find(s => dist >= s.start && dist <= s.start + s.l) || segs[0];
                    const lt = seg.l > 0 ? (dist - seg.start) / seg.l : 0;
                    const px = seg.x0 + seg.dx * lt;
                    const py = seg.y0 + seg.dy * lt;
                    const ang = Math.atan2(seg.dy, seg.dx);

                    ctx.save();
                    ctx.translate(px, py);
                    ctx.rotate(ang);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(-4, -innerW * 0.28);
                    ctx.lineTo(3, 0);
                    ctx.lineTo(-4, innerW * 0.28);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        ctx.restore();
    }

    /**
     * Masa de agua realista con gradiente de profundidad, meniscos cóncavos en bordes
     * de pared y oleaje superficial compuesto.
     */
    function drawWaterSurface(ctx, x, y, w, h, phase, rippleAmp) {
        ctx.save();
        if (h <= 0 || w <= 0) { ctx.restore(); return; }

        // Gradiente vertical de profundidad acuática
        const waterGrad = ctx.createLinearGradient(x, y, x, y + h);
        waterGrad.addColorStop(0.00, 'rgba(56, 189, 248, 0.55)');
        waterGrad.addColorStop(0.25, 'rgba(14, 165, 233, 0.70)');
        waterGrad.addColorStop(0.70, 'rgba(2, 132, 199, 0.85)');
        waterGrad.addColorStop(1.00, 'rgba(3, 105, 161, 0.95)');
        ctx.fillStyle = waterGrad;

        const amp = rippleAmp || 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y);

        // Menisco cóncavo izquierdo por tensión superficial
        ctx.quadraticCurveTo(x + 4, y - 2, x + 8, y);

        const steps = Math.max(10, Math.floor(w / 8));
        const dx = (w - 16) / steps;
        for (let i = 0; i <= steps; i++) {
            const curX = x + 8 + i * dx;
            const wave = Math.sin(i * 0.35 + phase * 4) * amp + Math.sin(i * 0.15 - phase * 2) * (amp * 0.4);
            ctx.lineTo(curX, y + wave);
        }

        // Menisco cóncavo derecho
        ctx.quadraticCurveTo(x + w - 4, y - 2, x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();

        // Línea de superficie luminosa nítida
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 4, y - 2, x + 8, y);
        for (let i = 0; i <= steps; i++) {
            const curX = x + 8 + i * dx;
            const wave = Math.sin(i * 0.35 + phase * 4) * amp + Math.sin(i * 0.15 - phase * 2) * (amp * 0.4);
            ctx.lineTo(curX, y + wave);
        }
        ctx.quadraticCurveTo(x + w - 4, y - 2, x + w, y);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Chorro de agua fluido con aceleración gravitatoria y corona de salpicadura en impacto.
     */
    function drawWaterJet(ctx, x0, y0, targetY, flowRate, phase) {
        if (!flowRate || flowRate <= 0) return;
        ctx.save();
        const jetW = Math.min(12, Math.max(3, flowRate * 8));

        // Gradiente del chorro con transparencia
        const jetGrad = ctx.createLinearGradient(x0 - jetW / 2, y0, x0 + jetW / 2, y0);
        jetGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        jetGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.85)');
        jetGrad.addColorStop(1, 'rgba(2, 132, 199, 0.6)');

        ctx.fillStyle = jetGrad;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.0;

        ctx.beginPath();
        ctx.moveTo(x0 - jetW / 2, y0);
        // El chorro se adelgaza a medida que cae por conservación de masa
        ctx.quadraticCurveTo(x0 - jetW * 0.35, (y0 + targetY) / 2, x0 - jetW * 0.25, targetY);
        ctx.lineTo(x0 + jetW * 0.25, targetY);
        ctx.quadraticCurveTo(x0 + jetW * 0.35, (y0 + targetY) / 2, x0 + jetW / 2, y0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Corona de salpicadura con gotas dispersas en la base receptora
        const nDrops = 5;
        for (let d = 0; d < nDrops; d++) {
            const ang = (d / (nDrops - 1)) * Math.PI + Math.PI;
            const dR = 8 + Math.sin(phase * 6 + d * 1.5) * 6;
            const dx = Math.cos(ang) * dR * 1.3;
            const dy = Math.sin(ang) * (dR * 0.6);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.beginPath();
            ctx.arc(x0 + dx, targetY + dy, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Eslabón o biela volumétrica con nervio central, extremos mecanizados y pernos.
     */
    function drawLink(ctx, x1, y1, x2, y2, thickness, material, schematic) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len < 1) return;
        const ang = Math.atan2(dy, dx);
        const w = thickness || 14;

        ctx.save();
        ctx.translate(x1, y1);
        ctx.rotate(ang);

        if (schematic) {
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 2.8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(len, 0);
            ctx.stroke();
            ctx.restore();
            return;
        }

        // Sombra arrojada suave
        ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
        ctx.beginPath();
        const rEnd = w * 0.65;
        ctx.arc(2, 3, rEnd, Math.PI * 0.5, Math.PI * 1.5);
        ctx.lineTo(len + 2, -w / 2 + 3);
        ctx.arc(len + 2, 3, rEnd, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineTo(2, w / 2 + 3);
        ctx.closePath();
        ctx.fill();

        // Cuerpo principal con gradiente metálico volumétrico
        const mat = material || 'iron';
        const grad = createMaterialGradient(ctx, 0, -w / 2, 0, w / 2, mat);
        ctx.fillStyle = grad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.arc(0, 0, rEnd, Math.PI * 0.5, Math.PI * 1.5);
        ctx.lineTo(len, -w / 2);
        ctx.arc(len, 0, rEnd, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineTo(0, w / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Nervio de forja o ranura de aligeramiento en vigas largas
        if (len > 45 && mat !== 'wood') {
            const grooveW = w * 0.36;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
            ctx.beginPath();
            ctx.roundRect(rEnd + 4, -grooveW / 2, len - rEnd * 2 - 8, grooveW, grooveW / 2);
            ctx.fill();

            // Reflejo blanco en el borde inferior del nervio
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rEnd + 6, grooveW / 2);
            ctx.lineTo(len - rEnd - 6, grooveW / 2);
            ctx.stroke();
        }

        // Buje interior en ambos extremos
        drawPin(ctx, 0, 0, rEnd * 0.5);
        drawPin(ctx, len, 0, rEnd * 0.5);

        ctx.restore();
    }

    /**
     * Viga de madera escuadrada con vetas y ensambles.
     */
    function drawTimberBeam(ctx, x1, y1, x2, y2, width, schematic) {
        drawLink(ctx, x1, y1, x2, y2, width, 'wood', schematic);
    }

    /**
     * Engranaje con perfil de dientes maquinados, rebaje biselado, radios y chavetero de cubo.
     */
    function drawGear(ctx, cx, cy, rPitch, teeth, angle, material, schematic) {
        const z = Math.max(8, teeth || 16);
        const mod = (2 * rPitch) / z;
        const rAdd = rPitch + mod * 0.95;
        const rDed = Math.max(8, rPitch - mod * 1.15);

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
            ctx.lineWidth = 2.0;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(rPitch, 0); ctx.stroke();
            ctx.restore();
            return;
        }

        // Sombra arrojada de la rueda
        ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
        ctx.beginPath();
        ctx.arc(3, 4, rAdd, 0, Math.PI * 2);
        ctx.fill();

        // Perfil tallado de los z dientes
        ctx.beginPath();
        const step = (Math.PI * 2) / z;
        for (let i = 0; i < z; i++) {
            const a0 = i * step;
            const a1 = a0 + step * 0.18;
            const a2 = a0 + step * 0.32;
            const a3 = a0 + step * 0.58;
            const a4 = a0 + step * 0.72;
            if (i === 0) ctx.moveTo(Math.cos(a0) * rDed, Math.sin(a0) * rDed);
            else ctx.lineTo(Math.cos(a0) * rDed, Math.sin(a0) * rDed);
            ctx.lineTo(Math.cos(a1) * rDed, Math.sin(a1) * rDed);
            ctx.lineTo(Math.cos(a2) * rAdd, Math.sin(a2) * rAdd);
            ctx.lineTo(Math.cos(a3) * rAdd, Math.sin(a3) * rAdd);
            ctx.lineTo(Math.cos(a4) * rDed, Math.sin(a4) * rDed);
        }
        ctx.closePath();

        const mat = material || 'brass';
        const grad = createMaterialGradient(ctx, -rAdd, -rAdd, rAdd, rAdd, mat);
        ctx.fillStyle = grad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.fill();
        ctx.stroke();

        // Radios / aligeramiento interior
        if (rDed > 28) {
            const numSpokes = z >= 22 ? 6 : 4;
            ctx.fillStyle = COLORS.bg;
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 1.3;
            const rInner = Math.max(14, rDed * 0.34);
            const rOuter = rDed * 0.78;
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

        // Cubo central con chaveta
        const rHub = Math.max(10, rDed * 0.30);
        const hubGrad = createMaterialGradient(ctx, -rHub, -rHub, rHub, rHub, mat);
        ctx.fillStyle = hubGrad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, rHub, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eje central con chavetero
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, rHub * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-2, -rHub * 0.6, 4, rHub * 0.35);

        ctx.restore();
    }

    /**
     * Rueda hidráulica pesada con herrajes de forja, llanta concéntrica y aspas/cangilones.
     */
    function drawWaterwheel(ctx, cx, cy, rOuter, numPaddles, angle, schematic) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        if (schematic) {
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 2.0;
            ctx.beginPath(); ctx.arc(0, 0, rOuter, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-rOuter, 0); ctx.lineTo(rOuter, 0); ctx.moveTo(0, -rOuter); ctx.lineTo(0, rOuter); ctx.stroke();
            ctx.restore();
            return;
        }

        const n = numPaddles || 12;
        const rInner = rOuter * 0.78;

        // Aspas de madera con herrajes
        for (let i = 0; i < n; i++) {
            const a = (i * Math.PI * 2) / n;
            ctx.save();
            ctx.rotate(a);
            ctx.fillStyle = COLORS.woodMid;
            ctx.strokeStyle = COLORS.woodDark;
            ctx.lineWidth = 1.4;
            ctx.fillRect(rInner - 5, -4, (rOuter - rInner) + 16, 8);
            ctx.strokeRect(rInner - 5, -4, (rOuter - rInner) + 16, 8);

            // Refuerzo de hierro en el borde exterior
            ctx.fillStyle = COLORS.ironDark;
            ctx.fillRect(rOuter + 8, -4.5, 4, 9);
            ctx.restore();
        }

        // Rayos de madera dobles
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 4;
            ctx.save();
            ctx.rotate(a);
            const woodGrad = createMaterialGradient(ctx, 0, -6, 0, 6, 'wood');
            ctx.fillStyle = woodGrad;
            ctx.strokeStyle = COLORS.woodDark;
            ctx.lineWidth = 1.4;
            ctx.fillRect(-rInner, -5, rInner * 2, 10);
            ctx.strokeRect(-rInner, -5, rInner * 2, 10);
            ctx.restore();
        }

        // Corona concéntrica de madera
        ctx.strokeStyle = COLORS.woodDark;
        ctx.lineWidth = (rOuter - rInner) * 0.35;
        ctx.beginPath();
        ctx.arc(0, 0, (rOuter + rInner) / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
        ctx.arc(0, 0, rInner, 0, Math.PI * 2);
        ctx.stroke();

        // Eje central con sombrerete de hierro
        drawPin(ctx, 0, 0, 14, 'Eje');

        ctx.restore();
    }

    /**
     * Cilindro volumétrico en corte longitudinal con espesor rayado según norma,
     * bridas apernadas superior e inferior, y sombra de cavidad interior.
     */
    function drawCylinder(ctx, x, y, w, h, wallThick, material, schematic) {
        const t = wallThick || 10;
        ctx.save();
        if (schematic) {
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 1.8;
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
            return;
        }

        const mat = material || 'copper';
        const wallFill = mat === 'copper' ? '#ea580c' : (mat === 'brass' ? '#eab308' : (mat === 'wood' ? '#85552b' : '#64748b'));

        // Sombra de cavidad cilíndrica interior
        const cavGrad = ctx.createLinearGradient(x, y, x + w, y);
        cavGrad.addColorStop(0.00, 'rgba(15, 23, 42, 0.12)');
        cavGrad.addColorStop(0.15, 'rgba(255, 255, 255, 0.05)');
        cavGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.05)');
        cavGrad.addColorStop(1.00, 'rgba(15, 23, 42, 0.12)');
        ctx.fillStyle = cavGrad;
        ctx.fillRect(x, y, w, h);

        // Paredes seccionadas en corte con rayado a 45°
        drawHatchRect(ctx, x - t, y, t, h, wallFill, 6);
        drawHatchRect(ctx, x + w, y, t, h, wallFill, 6);

        // Bridas superior e inferior apernadas
        const flangeH = 8;
        const flangeOver = 8;
        const bGrad = createMaterialGradient(ctx, x - t - flangeOver, y - flangeH, x + w + t + flangeOver, y, 'steel');
        ctx.fillStyle = bGrad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;

        // Brida superior
        ctx.fillRect(x - t - flangeOver, y - flangeH, t + flangeOver + 4, flangeH);
        ctx.strokeRect(x - t - flangeOver, y - flangeH, t + flangeOver + 4, flangeH);
        ctx.fillRect(x + w - 4, y - flangeH, t + flangeOver + 4, flangeH);
        ctx.strokeRect(x + w - 4, y - flangeH, t + flangeOver + 4, flangeH);

        // Brida inferior
        ctx.fillRect(x - t - flangeOver, y + h, t + flangeOver + 4, flangeH);
        ctx.strokeRect(x - t - flangeOver, y + h, t + flangeOver + 4, flangeH);
        ctx.fillRect(x + w - 4, y + h, t + flangeOver + 4, flangeH);
        ctx.strokeRect(x + w - 4, y + h, t + flangeOver + 4, flangeH);

        // Pernos hexagonales en bridas
        drawPin(ctx, x - t - flangeOver / 2, y - flangeH / 2, 2.8);
        drawPin(ctx, x + w + t + flangeOver / 2 - 2, y - flangeH / 2, 2.8);
        drawPin(ctx, x - t - flangeOver / 2, y + h + flangeH / 2, 2.8);
        drawPin(ctx, x + w + t + flangeOver / 2 - 2, y + h + flangeH / 2, 2.8);

        ctx.restore();
    }

    /**
     * Émbolo (pistón) volumétrico con aros de compresión/sellos de cuero,
     * pasador de muñón de biela y vástago rectificado.
     */
    function drawPiston(ctx, cx, cy, w, h, schematic) {
        ctx.save();
        if (schematic) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 1.8;
            ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
            ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
            ctx.restore();
            return;
        }

        // Sombra proyectada del émbolo en el cilindro
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.fillRect(cx - w / 2, cy + h / 2, w, 4);

        // Cuerpo del pistón con gradiente de hierro/acero rectificado
        const grad = createMaterialGradient(ctx, cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, 'iron');
        ctx.fillStyle = grad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

        // Aros de compresión / empaquetaduras de bronce maquinadas
        const ringH = 3.5;
        const ringGrad = createMaterialGradient(ctx, cx - w / 2 - 1, 0, cx + w / 2 + 1, 0, 'brass');
        ctx.fillStyle = ringGrad;
        ctx.fillRect(cx - w / 2 - 1, cy - h * 0.28, w + 2, ringH);
        ctx.strokeRect(cx - w / 2 - 1, cy - h * 0.28, w + 2, ringH);

        ctx.fillRect(cx - w / 2 - 1, cy + h * 0.14, w + 2, ringH);
        ctx.strokeRect(cx - w / 2 - 1, cy + h * 0.14, w + 2, ringH);

        // Muñón central con pasador de bulón
        drawPin(ctx, cx, cy, Math.min(6, h * 0.22));

        ctx.restore();
    }

    /**
     * Válvula de clapeta o retención física con asiento maquinado,
     * obturador articulado y flechas de paso de fluido si está abierta.
     */
    function drawCheckValve(ctx, hingeX, hingeY, length, openRatio, baseAngleDeg) {
        ctx.save();
        // Asiento de válvula maquinado con bisel
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(hingeX - 5, hingeY);
        ctx.lineTo(hingeX + length + 6, hingeY);
        ctx.stroke();

        ctx.translate(hingeX, hingeY);
        const baseRad = (baseAngleDeg || 0) * Math.PI / 180;
        const open = Math.max(0, Math.min(1, openRatio));
        const flapAng = baseRad - open * (Math.PI / 3.4);
        ctx.rotate(flapAng);

        // Clapeta de bronce/cuero con cuerpo volumétrico
        const flapGrad = createMaterialGradient(ctx, 0, -3, length, 3, 'bronze');
        ctx.fillStyle = flapGrad;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.4;
        ctx.fillRect(0, -3, length, 6);
        ctx.strokeRect(0, -3, length, 6);

        ctx.restore();

        // Bisagra de la válvula
        drawPin(ctx, hingeX, hingeY, 4.0);

        // Flecha dinámica de paso si está abierta
        if (open > 0.25) {
            ctx.save();
            ctx.strokeStyle = '#38bdf8';
            ctx.fillStyle = '#38bdf8';
            ctx.lineWidth = 2.0;
            const midX = hingeX + length * 0.5;
            const midY = hingeY - 14 * open;
            ctx.beginPath();
            ctx.moveTo(midX, hingeY + 8);
            ctx.lineTo(midX, midY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX - 3, midY + 5);
            ctx.lineTo(midX + 3, midY + 5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    /**
     * Combustión / hogar de caldera multicapa con cama de brasas incandescentes,
     * llamas fluidas con gradiente radial y chispas ascendentes.
     */
    function drawFire(ctx, cx, baseY, width, phase) {
        ctx.save();
        // 1. Cama de brasas incandescentes inferiores
        const grateGrad = ctx.createLinearGradient(cx - width / 2, baseY, cx + width / 2, baseY);
        grateGrad.addColorStop(0, '#450a0a');
        grateGrad.addColorStop(0.5, '#dc2626');
        grateGrad.addColorStop(1, '#450a0a');
        ctx.fillStyle = grateGrad;
        ctx.fillRect(cx - width / 2, baseY, width, 5);

        // 2. Llamas vivas multicapa
        const flames = 7;
        const step = width / flames;
        for (let i = 0; i < flames; i++) {
            const fx = cx - width / 2 + (i + 0.5) * step;
            const fh = 18 + Math.sin(phase * 4 + i * 1.6) * 8 + Math.cos(phase * 2 - i * 0.8) * 4;

            // Capa exterior roja
            ctx.fillStyle = 'rgba(220, 38, 38, 0.82)';
            ctx.beginPath();
            ctx.moveTo(fx - step * 0.55, baseY);
            ctx.quadraticCurveTo(fx + Math.sin(phase * 3 + i) * 5, baseY - fh * 1.3, fx + step * 0.55, baseY);
            ctx.closePath();
            ctx.fill();

            // Capa media anaranjada
            ctx.fillStyle = 'rgba(249, 115, 22, 0.88)';
            ctx.beginPath();
            ctx.moveTo(fx - step * 0.38, baseY);
            ctx.quadraticCurveTo(fx + Math.sin(phase * 3 + i) * 3, baseY - fh * 0.95, fx + step * 0.38, baseY);
            ctx.closePath();
            ctx.fill();

            // Núcleo incandescente amarillo
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.moveTo(fx - step * 0.20, baseY);
            ctx.quadraticCurveTo(fx, baseY - fh * 0.55, fx + step * 0.20, baseY);
            ctx.closePath();
            ctx.fill();
        }

        // 3. Pavesas y chispas flotando en el aire caliente
        for (let s = 0; s < 5; s++) {
            const sx = cx + Math.sin(phase * 5 + s * 2.3) * (width * 0.4);
            const sy = baseY - 20 - ((phase * 20 + s * 12) % 35);
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Viga flexible elástica con pandeo / flexión real por cargas mecánicas (curva de Timoshenko).
     */
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
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();

        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Vector analítico de fuerza o velocidad con punta aerodinámica reglamentaria y rotulado.
     */
    function drawVector(ctx, x, y, vx, vy, color, label) {
        const mag = Math.hypot(vx, vy);
        if (mag < 2) return;
        const ang = Math.atan2(vy, vx);
        ctx.save();
        ctx.strokeStyle = color || COLORS.vectorVel;
        ctx.fillStyle = color || COLORS.vectorVel;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx, y + vy);
        ctx.stroke();

        const head = 8.5;
        ctx.beginPath();
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(x + vx - head * Math.cos(ang - 0.35), y + vy - head * Math.sin(ang - 0.35));
        ctx.lineTo(x + vx - head * Math.cos(ang + 0.35), y + vy - head * Math.sin(ang + 0.35));
        ctx.closePath();
        ctx.fill();

        if (label) {
            ctx.font = '700 11.5px -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(label, x + vx + 6, y + vy - 4);
        }
        ctx.restore();
    }

    /**
     * Acotación reglamentaria con flechas de cota y valor numérico acotado.
     */
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
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x1, y1); ctx.lineTo(px1 + nx * Math.sign(off) * 5, py1 + ny * Math.sign(off) * 5);
            ctx.moveTo(x2, y2); ctx.lineTo(px2 + nx * Math.sign(off) * 5, py2 + ny * Math.sign(off) * 5);
            ctx.stroke();
        }

        ctx.strokeStyle = COLORS.inkSoft;
        ctx.fillStyle = COLORS.inkSoft;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();

        const ah = 6.0;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px1 + ah * Math.cos(ang - 0.32), py1 + ah * Math.sin(ang - 0.32));
        ctx.lineTo(px1 + ah * Math.cos(ang + 0.32), py1 + ah * Math.sin(ang + 0.32));
        ctx.closePath(); ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(px2 - ah * Math.cos(ang - 0.32), py2 - ah * Math.sin(ang - 0.32));
        ctx.lineTo(px2 - ah * Math.cos(ang + 0.32), py2 - ah * Math.sin(ang + 0.32));
        ctx.closePath(); ctx.fill();

        if (label) {
            const mx = (px1 + px2) / 2, my = (py1 + py2) / 2;
            ctx.font = '600 11px ui-monospace, monospace';
            const tw = ctx.measureText(label).width + 8;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(mx - tw / 2, my - 8, tw, 16);
            ctx.fillStyle = COLORS.ink;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, mx, my);
        }
        ctx.restore();
    }

    /**
     * Partículas dinámicas de fluido viajando por un tramo libre.
     */
    function drawFluidParticles(ctx, x1, y1, x2, y2, phase, active, color) {
        if (!active) return;
        ctx.save();
        ctx.fillStyle = color || COLORS.waterDeep;
        const count = 7;
        for (let i = 0; i < count; i++) {
            const t = ((i / count) + (phase / (Math.PI * 2))) % 1;
            const px = x1 + (x2 - x1) * t;
            const py = y1 + (y2 - y1) * t;
            ctx.beginPath();
            ctx.arc(px, py, 3.0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * Nubes de vapor volumétrico para motores térmicos (Newcomen, Papin, Savery, Herón).
     */
    function drawSteam(ctx, cx, cy, radius, phase, density) {
        ctx.save();
        const r = radius || 25;
        const count = Math.min(8, Math.max(3, Math.floor(density || 5)));
        for (let i = 0; i < count; i++) {
            const ang = (i * Math.PI * 2) / count + phase * 0.8;
            const dist = (r * 0.45) * Math.sin(phase + i);
            const px = cx + Math.cos(ang) * dist;
            const py = cy + Math.sin(ang) * dist - (i * 2.5);
            const pr = r * (0.4 + 0.3 * Math.sin(phase * 2 + i));

            const sGrad = ctx.createRadialGradient(px, py, 1, px, py, pr);
            sGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
            sGrad.addColorStop(0.5, 'rgba(226, 232, 240, 0.45)');
            sGrad.addColorStop(1, 'rgba(203, 213, 225, 0.0)');
            ctx.fillStyle = sGrad;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    return {
        COLORS,
        createMaterialGradient,
        clearAndGrid,
        drawPhaseCaption,
        drawTelemetryHUD,
        drawCallout,
        drawCenterline,
        drawHatchRect,
        drawMasonry,
        drawGroundSupport,
        drawFixedPivot,
        drawPin,
        drawPipe,
        drawWaterSurface,
        drawWaterJet,
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
        drawSteam
    };
})();

if (typeof globalThis !== 'undefined') {
    globalThis.CAD = window.CAD;
}
if (typeof global !== 'undefined') {
    global.CAD = window.CAD;
}

