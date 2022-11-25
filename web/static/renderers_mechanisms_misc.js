/**
 * Mechanica Antiqua - Ilustraciones Técnicas y Cutaways 2D Volumétricos
 * Módulo 3: Mecanismos, Molinos, Autómatas, Balística y Estructuras (19 máquinas)
 * Con gradientes volumétricos, silueta biomecánica del átlatl, cinemática analítica y telemetría HUD.
 */

window.MACHINE_RENDERERS = window.MACHINE_RENDERERS || {};

(function(R) {
    'use strict';

    function solveSliderY(xO, yO, r, theta, L, xSlide, above) {
        const xA = xO + r * Math.cos(theta);
        const yA = yO + r * Math.sin(theta);
        const dx = xSlide - xA;
        const dy = Math.sqrt(Math.max(100, L * L - dx * dx));
        return { xA, yA, xB: xSlide, yB: above ? (yA - dy) : (yA + dy) };
    }

    // 24. ASERRADERO DE MARTINI
    R.martini_hydraulic_sawmill = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 205, yO = 365, r = 48, L = 240, xB = 470;
        const kin = solveSliderY(xO, yO, r, theta, L, xB, true);
        const cuttingDown = Math.cos(theta) > 0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `FASE: ${cuttingDown ? 'CORTE DESCENDENTE' : 'RETORNO Y AVANCE TRINQUETE'}`,
            `VELOCIDAD HOJA: ${Math.abs(k.vMs || 1.1).toFixed(2)} m/s`,
            `CARRERA: s = 300 mm`,
            `TRONCO: AVANCE 8 mm / CICLO`
        ]);

        CAD.drawGroundSupport(ctx, 400, 480, 720, 14);
        CAD.drawWaterSurface(ctx, 35, 435, 300, 45, theta, 2.2);
        CAD.drawCenterline(ctx, 75, yO, 325, yO);
        CAD.drawCenterline(ctx, xB, 75, xB, 475);

        // Columnas guía fijas de roble
        CAD.drawTimberBeam(ctx, 415, 90, 415, 480, 18, schematic);
        CAD.drawTimberBeam(ctx, 525, 90, 525, 480, 18, schematic);
        CAD.drawTimberBeam(ctx, 405, 90, 535, 90, 18, schematic);

        CAD.drawWaterwheel(ctx, xO, yO, 105, 12, theta, schematic);
        CAD.drawLink(ctx, xO, yO, kin.xA, kin.yA, 14, 'iron', schematic);

        // Bastidor móvil porta-sierra
        const frameTop = kin.yB - 175;
        CAD.drawTimberBeam(ctx, 432, frameTop, 508, frameTop, 12, schematic);
        CAD.drawTimberBeam(ctx, 432, kin.yB, 508, kin.yB, 12, schematic);
        CAD.drawTimberBeam(ctx, 432, frameTop, 432, kin.yB, 10, schematic);
        CAD.drawTimberBeam(ctx, 508, frameTop, 508, kin.yB, 10, schematic);

        // Hoja dentada de acero
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6.0;
        ctx.beginPath(); ctx.moveTo(xB, frameTop + 6); ctx.lineTo(xB, kin.yB - 6); ctx.stroke();

        // Tronco de madera avanzando
        const logX = 486 - (theta / (Math.PI * 2)) * 24;
        ctx.save();
        const logGrad = CAD.createMaterialGradient(ctx, logX, 225, logX, 267, 'wood');
        ctx.fillStyle = logGrad;
        ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.lineWidth = 2.0;
        ctx.fillRect(logX, 225, 230, 42);
        ctx.strokeRect(logX, 225, 230, 42);

        // Virutas de madera desprendidas durante el corte
        if (cuttingDown) {
            for (let v = 0; v < 4; v++) {
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(xB - 6 + Math.sin(theta * 8 + v) * 8, 245 + v * 5, 2.5, 2.5);
            }
        }
        ctx.restore();

        CAD.drawTimberBeam(ctx, 480, 276, 740, 276, 12, schematic);

        // Biela AB de hierro/bronce
        CAD.drawLink(ctx, kin.xA, kin.yA, kin.xB, kin.yB, 12, 'brass', schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');
        CAD.drawPin(ctx, kin.xA, kin.yA, 6.5, 'A');
        CAD.drawPin(ctx, kin.xB, kin.yB, 6.5, 'B');

        CAD.drawVector(ctx, xB + 28, kin.yB - 80, 0, (k.vMs || 1.1) * 28, CAD.COLORS.vectorVel, 'v_hoja');

        CAD.drawCallout(ctx, xB, 175, 600, 135, 'Bastidor móvil en par prismático P', 'left');
        CAD.drawCallout(ctx, (kin.xA + kin.xB) / 2, (kin.yA + kin.yB) / 2, 290, 215, 'Biela de biela-manivela (L = 750 mm)', 'right');
        CAD.drawCallout(ctx, 645, 245, 655, 190, 'Tronco con avance intermitente', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            cuttingDown ? 'Carrera de corte descendente activa' : 'Carrera ascendente en vacío + avance de trinquete',
            'La biela convierte el giro constante de la rueda hidráulica en corte vertical oscilante mientras el trinquete empuja el tronco.');
    };

    // 25. ASERRADERO CON PÉRTIGA ELÁSTICA DE VILLARD
    R.villard_sawmill = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xCam = 355, yCam = 400;
        const phase = (theta * 2) % (Math.PI * 2);
        const depress = phase < Math.PI * 1.3 ? phase / (Math.PI * 1.3) : Math.max(0, 1 - Math.pow((phase - Math.PI * 1.3) / 0.8, 2));
        const stroke = depress * 64;
        const tipX = 485, tipY = 120 + stroke;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `SISTEMA: RETORNO ELÁSTICO POR PÉRTIGA`,
            `ACCIONAMIENTO: 4 LEVAS RADIALES`,
            `FASE: ${phase < Math.PI * 1.3 ? 'CORTE (LEVA DEPRIME)' : 'RETORNO ELÁSTICO RESORTE'}`,
            `FLECHA: y = ${Math.round(stroke)} mm`
        ]);

        CAD.drawGroundSupport(ctx, 400, 480, 700, 14);
        CAD.drawMasonry(ctx, 110, 115, 75, 365);

        // Pértiga de fresno empotrada
        CAD.drawElasticBeam(ctx, 185, 125, tipX, tipY, stroke * 0.48, 12, CAD.COLORS.woodMid);

        // Tirante y hoja de sierra
        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 3.0;
        ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX, tipY + 45); ctx.stroke();

        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 6.5;
        ctx.beginPath(); ctx.moveTo(tipX, tipY + 45); ctx.lineTo(tipX, tipY + 215); ctx.stroke();

        // Tronco en corte
        ctx.fillStyle = CAD.COLORS.woodLight; ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 1.8;
        ctx.fillRect(505, 245, 195, 42); ctx.strokeRect(505, 245, 195, 42);

        // Rueda de levas inferior
        CAD.drawWaterwheel(ctx, xCam, yCam, 80, 8, theta, schematic);
        ctx.save(); ctx.translate(xCam, yCam); ctx.rotate(theta);
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = CAD.COLORS.brassMid; ctx.strokeStyle = CAD.COLORS.ink;
            ctx.fillRect(58, -7, 44, 14); ctx.strokeRect(58, -7, 44, 14);
        }
        ctx.restore();

        CAD.drawFixedPivot(ctx, xCam, yCam, 8, 'O');
        CAD.drawPin(ctx, tipX, tipY, 5.5);

        CAD.drawCallout(ctx, 320, 130, 290, 75, 'Pértiga elástica (acumula energía)', 'left');
        CAD.drawCallout(ctx, 445, 365, 600, 365, 'Árbol de levas impulsor', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            phase < Math.PI * 1.3 ? '1. Carrera de corte: la leva flexiona la pértiga' : '2. Carrera de retorno: restitución elástica instantánea',
            'Al escapar la leva, la energía de deformación acumulada en la viga de fresno devuelve inmediatamente la hoja a la posición superior.');
    };

    // 26–28. MOLINOS DE LEVAS (Agricola Stamp Mill, Zonca Paper Mill, Zonca Stamping Mill)
    function renderCamBattery(ctx, w, h, theta, isTilt, capTitle, capDesc, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xCam = 245, yCam = 325;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `TIPO: MOLINO DE LEVAS MÚLTIPLES`,
            `DESFASE: 120° (EQUILIBRIO DE PAR)`,
            `HERRAMIENTA: ${isTilt ? 'MAZOS BASCULANTES DE MADERA' : 'PILONES VERTICALES DE HIERRO'}`,
            `FRECUENCIA: 45 IMPACTOS/MIN`
        ]);

        CAD.drawGroundSupport(ctx, 400, 480, 700, 14);
        CAD.drawCenterline(ctx, 100, yCam, 660, yCam);

        CAD.drawWaterwheel(ctx, 130, yCam, 95, 12, theta, schematic);
        CAD.drawGear(ctx, 130, yCam, 54, 18, theta, 'wood', schematic);
        CAD.drawGear(ctx, xCam, yCam, 36, 12, -theta * 1.5, 'brass', schematic);

        CAD.drawMasonry(ctx, 365, 415, 270, 65);
        ctx.fillStyle = isTilt ? CAD.COLORS.waterShallow : '#cbd5e1';
        ctx.fillRect(380, 415, 240, 25);

        for (let i = 0; i < 3; i++) {
            const phase = (theta + (i * Math.PI * 2) / 3) % (Math.PI * 2);
            const liftNorm = phase < Math.PI * 1.4 ? phase / (Math.PI * 1.4) : Math.max(0, 1 - Math.pow((phase - Math.PI * 1.4) / 0.6, 2));
            const sx = 415 + i * 76;

            ctx.save(); ctx.translate(sx, yCam); ctx.rotate(phase);
            const camGrad = CAD.createMaterialGradient(ctx, 0, -15, 38, 15, 'brass');
            ctx.fillStyle = camGrad; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(38, -8); ctx.arc(0, 0, 38, -0.22, 0.28); ctx.lineTo(0, 14); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.restore();

            if (isTilt) {
                const fx = 665, fy = 365;
                const tipY = 415 - liftNorm * 65;
                CAD.drawTimberBeam(ctx, fx, fy, sx - 8, tipY - 24, 14, schematic);
                CAD.drawHatchRect(ctx, sx - 26, tipY - 34, 32, 40, CAD.COLORS.woodMid, 6);
                CAD.drawFixedPivot(ctx, fx, fy, 7);
            } else {
                const baseY = 418 - liftNorm * 68;
                CAD.drawTimberBeam(ctx, sx, baseY - 210, sx, baseY - 24, 15, schematic);
                CAD.drawHatchRect(ctx, sx - 16, baseY - 34, 32, 34, CAD.COLORS.ironMid, 6);
                ctx.fillStyle = CAD.COLORS.brassMid;
                ctx.fillRect(sx - 34, baseY - 105, 22, 14); ctx.strokeRect(sx - 34, baseY - 105, 22, 14);
            }
        }

        CAD.drawLink(ctx, xCam - 10, yCam, 605, yCam, 14, 'wood', schematic);
        CAD.drawFixedPivot(ctx, xCam, yCam, 8, 'O');
        CAD.drawCallout(ctx, 415, yCam - 24, 435, 115, 'Levas caladas a 120°', 'left');
        CAD.drawCallout(ctx, 490, 420, 650, 440, isTilt ? 'Tina de trituración de trapos' : 'Mortero de trituración mineral', 'left');

        CAD.drawPhaseCaption(ctx, w, h, capTitle, capDesc);
    }

    R.agricola_stamp_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta, false, 'Trituración minera por impacto de pilones',
            'Las levas a 120° escalonan el alzado de los pilones de hierro de 150 kg para triturar la mena con par motor homogéneo.', schematic);
    };
    R.zonca_stamping_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta, false, 'Batanado rítmico de paños de lana',
            'Los mazos verticales alternan impactos continuos sobre el tejido sumergido en agua caliente para compactar las fibras.', schematic);
    };
    R.zonca_paper_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta, true, 'Desfibrado de lino para fabricación de papel',
            'Cada leva deprime la cola del mazo de madera y lo suelta en caída libre dentro de la tina de maceración.', schematic);
    };

    // 29. RUEDA DE LECTURA DE RAMELLI (EPICICLOIDAL)
    R.ramelli_book_wheel = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 400, cy = 275, rDrum = 148;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `MECANISMO: TREN PLANETARIO 1 : 1`,
            `ATRILES: 8 VOLÚMENES SIMULTÁNEOS`,
            `INCLINACIÓN: 0° INVARIABLE (ANTI-VUELCO)`,
            `PROPÓSITO: CONSULTA ERUDITA RENAICENTISTA`
        ]);

        CAD.drawGroundSupport(ctx, cx, 475, 320, 14);
        CAD.drawTimberBeam(ctx, cx - 115, 475, cx, cy, 18, schematic);
        CAD.drawTimberBeam(ctx, cx + 115, 475, cx, cy, 18, schematic);

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = schematic ? 2 : 12;
        ctx.beginPath(); ctx.arc(cx, cy, rDrum, 0, Math.PI * 2); ctx.stroke();

        CAD.drawGear(ctx, cx, cy, 34, 18, 0, 'brass', schematic);

        for (let i = 0; i < 8; i++) {
            const ang = theta + (i * Math.PI * 2) / 8;
            const ix = cx + 66 * Math.cos(ang), iy = cy + 66 * Math.sin(ang);
            CAD.drawGear(ctx, ix, iy, 22, 12, -ang * 1.5, 'iron', schematic);

            const px = cx + rDrum * Math.cos(ang), py = cy + rDrum * Math.sin(ang);
            CAD.drawLink(ctx, cx, cy, px, py, 8, 'wood', schematic);
            CAD.drawGear(ctx, px, py, 24, 14, 0, 'brass', schematic);

            ctx.save(); ctx.translate(px, py);
            ctx.fillStyle = CAD.COLORS.woodMid; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.4;
            ctx.fillRect(-24, 7, 48, 8); ctx.strokeRect(-24, 7, 48, 8);

            // Páginas de los libros abiertos
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.2;
            ctx.fillRect(-20, -8, 19, 15); ctx.strokeRect(-20, -8, 19, 15);
            ctx.fillRect(1, -8, 19, 15); ctx.strokeRect(1, -8, 19, 15);
            ctx.restore();

            CAD.drawPin(ctx, px, py, 4.5);
        }

        CAD.drawFixedPivot(ctx, cx, cy, 8, 'Sol fijo');
        CAD.drawCallout(ctx, cx, cy, 130, 120, 'Engranaje solar fijo al bastidor', 'right');
        CAD.drawCallout(ctx, cx + 66, cy, 600, 185, 'Satélite inversor intermedio', 'left');
        CAD.drawCallout(ctx, cx + rDrum, cy, 600, 320, 'Atril perfectamente horizontal (0°)', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Compensación cinemática epicicloidal perfecta',
            'El tren de satélites Z₁ → Z₂ → Z₃ contrarresta la rotación del tambor para que ningún libro vuelque al girar la rueda.');
    };

    // 30. TORNO DE ROSCAR DE JACQUES BESSON (1578)
    R.besson_screw_lathe = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = theta / (Math.PI * 2);
        const carX = 240 + cyc * 265;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `MÁQUINA: TORNO COPIADOR DE ROSCAS`,
            `PASO PATRÓN: p = 8.0 mm`,
            `SINCRONIZACIÓN: 1 : 1 POR CORDEL`,
            `PIEZA: TALLADO HELICOIDAL DIRECTO`
        ]);

        CAD.drawGroundSupport(ctx, 170, 475, 100, 14);
        CAD.drawGroundSupport(ctx, 630, 475, 100, 14);
        CAD.drawTimberBeam(ctx, 135, 375, 665, 375, 24, schematic);
        CAD.drawTimberBeam(ctx, 170, 140, 170, 475, 22, schematic);
        CAD.drawTimberBeam(ctx, 630, 140, 630, 475, 22, schematic);

        CAD.drawCenterline(ctx, 110, 195, 680, 195);
        CAD.drawCenterline(ctx, 110, 295, 680, 295);

        CAD.drawGear(ctx, 135, 195, 30, 16, theta, 'brass', schematic);
        CAD.drawGear(ctx, 135, 295, 30, 16, theta, 'brass', schematic);
        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(110, 195); ctx.lineTo(110, 295); ctx.moveTo(160, 195); ctx.lineTo(160, 295); ctx.stroke();

        // Barra a roscar
        ctx.save();
        const rodGrad = CAD.createMaterialGradient(ctx, 205, 178, 205, 214, 'steel');
        ctx.fillStyle = rodGrad; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.6;
        ctx.fillRect(205, 178, 395, 36); ctx.strokeRect(205, 178, 395, 36);
        for (let tx = 220; tx < carX; tx += 12) {
            ctx.beginPath(); ctx.moveTo(tx, 178); ctx.lineTo(tx + 6, 214); ctx.stroke();
        }

        // Husillo maestro inferior con rosca maquinada
        const screwGrad = CAD.createMaterialGradient(ctx, 190, 285, 190, 305, 'brass');
        ctx.fillStyle = screwGrad;
        ctx.fillRect(190, 285, 420, 20); ctx.strokeRect(190, 285, 420, 20);
        for (let hx = 200; hx < 605; hx += 12) {
            ctx.beginPath(); ctx.moveTo(hx, 285); ctx.lineTo(hx + 6, 305); ctx.stroke();
        }
        ctx.restore();

        // Carro portaherramientas móvil
        CAD.drawHatchRect(ctx, carX - 28, 250, 56, 112, '#ffffff', 10);
        CAD.drawHatchRect(ctx, carX - 16, 280, 32, 30, CAD.COLORS.brassMid, 5);
        ctx.fillStyle = CAD.COLORS.ink;
        ctx.beginPath(); ctx.moveTo(carX, 214); ctx.lineTo(carX - 7, 250); ctx.lineTo(carX + 7, 250); ctx.closePath(); ctx.fill();

        CAD.drawPin(ctx, carX, 295, 5.5);
        CAD.drawPin(ctx, carX, 214, 4.5);
        CAD.drawCallout(ctx, 135, 245, 80, 95, 'Transmisión sincronizada 1:1', 'left');
        CAD.drawCallout(ctx, carX, 295, 460, 435, 'Semituerca guiada por husillo maestro', 'left');
        CAD.drawCallout(ctx, carX, 214, 500, 105, 'Buril cortando rosca helicoidal', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Copiado cinemático por husillo guía',
            'Al girar la manivela, el husillo patrón desplaza el carro a velocidad proporcional tallando un paso exacto e idéntico en la pieza.');
    };

    // 31. COJINETE AXIAL DE BOLAS CON JAULA DE LEONARDO
    R.leonardo_cage_bearing = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 400, cy = 275, rIn = 78, rPitch = 110, rBall = 30, rOut = 142;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `INVENCIÓN: COJINETE AXIAL DE LEONARDO (~1500)`,
            `VELOCIDAD JAULA: ω_jaula = ω_eje / 2`,
            `RODADURA: PURA SIN ROCE CONTRARIO`,
            `JAULA: SEPARADOR ANTIFRICCIÓN`
        ]);

        CAD.drawCenterline(ctx, 175, cy, 625, cy);
        CAD.drawCenterline(ctx, cx, 75, cx, 470);

        CAD.drawHatchRect(ctx, cx - 175, cy - 175, 350, 350, '#f8fafc', 11);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(cx, cy, rOut, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        CAD.drawGear(ctx, cx, cy, rIn, 24, theta, 'iron', schematic);

        const cageAng = theta * 0.5;
        ctx.strokeStyle = CAD.COLORS.brassMid; ctx.lineWidth = 5.5;
        ctx.beginPath(); ctx.arc(cx, cy, rPitch + 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, rPitch - 12, 0, Math.PI * 2); ctx.stroke();

        const spinRatio = (rPitch / (2 * rBall)) * (1 - (rBall * rBall) / (rPitch * rPitch));
        for (let i = 0; i < 8; i++) {
            const ang = cageAng + (i * Math.PI * 2) / 8;
            const bx = cx + rPitch * Math.cos(ang), by = cy + rPitch * Math.sin(ang);
            ctx.save(); ctx.translate(bx, by); ctx.rotate(-theta * spinRatio);

            const bGrad = ctx.createRadialGradient(-rBall * 0.3, -rBall * 0.3, 1, 0, 0, rBall);
            bGrad.addColorStop(0, '#ffffff');
            bGrad.addColorStop(0.4, '#cbd5e1');
            bGrad.addColorStop(1, '#334155');
            ctx.fillStyle = bGrad;
            ctx.strokeStyle = CAD.COLORS.ink;
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(0, 0, rBall, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.moveTo(-rBall + 4, 0); ctx.lineTo(rBall - 4, 0); ctx.stroke();
            ctx.restore();
        }

        CAD.drawFixedPivot(ctx, cx, cy, 9, 'Eje (ω)');
        CAD.drawCallout(ctx, cx + rPitch, cy - 28, 605, 120, 'Jaula separadora (gira a ω / 2)', 'left');
        CAD.drawCallout(ctx, cx + rOut + 15, cy + 55, 605, 375, 'Pista de rodadura exterior fija', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Rodadura pura eliminando fricción por choque',
            'Leonardo descubrió que las bolas adyacentes giran en sentido contrario al tocarse; la jaula las separa permitiendo rodadura pura.');
    };

    // 32. ENGRANAJE GLOBOIDAL DE LEONARDO
    R.leonardo_globoidal_gear = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 420, cy = 315, rWheel = 128, wormY = 165;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `PERFIL: SINFÍN GLOBOIDAL CÓNCAVO`,
            `CONTACTO: MULTI-DIENTE (4 ENGRANADOS)`,
            `REDUCCIÓN: 30 : 1 EN UN SOLO PASO`,
            `CAPACIDAD: 3× RESPECTO A RECTO`
        ]);

        CAD.drawGroundSupport(ctx, 420, 470, 450, 14);
        CAD.drawCenterline(ctx, 130, wormY, 670, wormY);
        CAD.drawCenterline(ctx, cx, 75, cx, 470);

        CAD.drawGear(ctx, cx, cy, rWheel, 28, theta / 8.0, 'brass', schematic);
        CAD.drawFixedPivot(ctx, cx, cy, 9, 'O_rueda');

        ctx.save();
        const wGrad = CAD.createMaterialGradient(ctx, 270, wormY - 36, 570, wormY + 36, 'steel');
        ctx.fillStyle = wGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(270, wormY - 36); ctx.quadraticCurveTo(cx, wormY - 10, 570, wormY - 36);
        ctx.lineTo(570, wormY + 36); ctx.quadraticCurveTo(cx, wormY + 10, 270, wormY + 36);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        const shift = ((theta / (Math.PI * 2)) % 1) * 26;
        ctx.strokeStyle = CAD.COLORS.brassDark; ctx.lineWidth = 4.0;
        for (let x = 285 + shift; x < 555; x += 26) {
            const dx = (x - cx) / 140;
            const waist = 12 + 22 * dx * dx;
            ctx.beginPath(); ctx.moveTo(x - 6, wormY - waist); ctx.lineTo(x + 6, wormY + waist); ctx.stroke();
        }
        ctx.restore();

        CAD.drawFixedPivot(ctx, 250, wormY, 7.5);
        CAD.drawFixedPivot(ctx, 590, wormY, 7.5);
        CAD.drawCallout(ctx, cx, wormY - 12, 160, 85, 'Tornillo cóncavo toroidal', 'right');
        CAD.drawCallout(ctx, cx, wormY + 26, 600, 240, 'Engranan 4 dientes a la vez', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Distribución de carga sobre arco envolvente',
            'Al abrazar la curvatura de la rueda, el sinfín globoidal reparte el esfuerzo entre múltiples dientes evitando el desgaste puntual.');
    };

    // 33. CARRO QUE APUNTA AL SUR (ZHǏ NÁN CHĒ)
    R.chinese_south_pointing_chariot = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const heading = 0.62 * Math.sin(theta);
        const wheelL = theta * 1.4 - heading * 2.0, wheelR = theta * 1.4 + heading * 2.0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `SISTEMA: ODOMETRÍA DIFERENCIAL PURA`,
            `BRÚJULA: MECÁNICA (SIN MAGNETISMO)`,
            `RUMBO POLE: SUR FIJO INVARIABLE`,
            `ERROR ANGULAR: Δθ = 0.00°`
        ]);

        const cx = 250, cy = 285;
        CAD.drawCenterline(ctx, 75, cy, 425, cy);
        CAD.drawTimberBeam(ctx, 115, cy, 385, cy, 18, schematic);
        CAD.drawWaterwheel(ctx, 115, cy, 80, 8, wheelL, schematic);
        CAD.drawWaterwheel(ctx, 385, cy, 80, 8, wheelR, schematic);
        CAD.drawGear(ctx, cx, cy, 40, 16, heading, 'brass', schematic);
        CAD.drawFixedPivot(ctx, 115, cy, 6.5, 'R_Izq');
        CAD.drawFixedPivot(ctx, 385, cy, 6.5, 'R_Der');
        CAD.drawFixedPivot(ctx, cx, cy, 6.5, 'Diferencial');

        // Carro en planta virando en S
        const mapX = 605, mapY = 275;
        ctx.strokeStyle = '#cbd5e1'; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(mapX, mapY, 100, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);

        ctx.save(); ctx.translate(mapX, mapY); ctx.rotate(heading);
        CAD.drawHatchRect(ctx, -40, -55, 80, 110, CAD.COLORS.woodLight, 10);
        ctx.fillStyle = CAD.COLORS.ink;
        ctx.fillRect(-52, -26, 12, 52); ctx.fillRect(40, -26, 12, 52);
        ctx.restore();

        CAD.drawVector(ctx, mapX, mapY, 0, 95, '#dc2626', 'SUR FIJO');
        CAD.drawPin(ctx, mapX, mapY, 7.5);

        CAD.drawCallout(ctx, cx, cy - 38, 150, 95, 'Tren diferencial resta giro de ruedas', 'left');
        CAD.drawCallout(ctx, mapX + 45, mapY - 35, 565, 95, 'Carro virando según el camino', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Compensación diferencial de rumbo sin brújula magnética',
            'Cuando una rueda recorre más arco que la otra en curva, el diferencial rota la figura en sentido opuesto exacto para mantenerla clavada al Sur.');
    };

    // 34. RELOJ HIDRÁULICO DE SU SONG (1088)
    R.chinese_su_song_clock = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 390, cy = 295, R_wheel = 132;
        const stepProg = (theta % (Math.PI / 3)) / (Math.PI / 3);
        const snapping = stepProg > 0.78;
        const quantized = Math.floor(theta / (Math.PI / 3)) * (Math.PI / 6);
        const wheelRot = quantized + (snapping ? ((stepProg - 0.78) / 0.22) * (Math.PI / 6) : 0);

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `ESCAPE: HIDRÁULICO BALANZÓN ISÓCRONO`,
            `ESTADO: ${snapping ? 'DISPARO Y AVANCE RÁPIDO' : 'LLENADO ISÓCRONO DEL CANGILÓN'}`,
            `PERÍODO: 24 s / PASO`,
            `AVANCE: 10° EXACTOS`
        ]);

        CAD.drawGroundSupport(ctx, cx, 475, 380, 14);
        CAD.drawPipe(ctx, [[545, 70], [495, 70], [495, 115]], 15, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'brass' });
        CAD.drawWaterJet(ctx, 495, 115, 185, 0.85, theta);

        CAD.drawWaterwheel(ctx, cx, cy, R_wheel, 12, wheelRot, schematic);
        CAD.drawFixedPivot(ctx, cx, cy, 8.5, 'O_rueda');

        ctx.save(); ctx.translate(cx - 25, 130); ctx.rotate(snapping ? -0.25 : 0.05);
        CAD.drawLink(ctx, -90, 0, 115, 0, 10, 'brass', schematic);
        ctx.restore();
        CAD.drawFixedPivot(ctx, cx - 25, 130, 6.5);

        CAD.drawCallout(ctx, 495, 90, 565, 90, 'Caudal regulado constante', 'left');
        CAD.drawCallout(ctx, cx - 75, 130, 175, 130, snapping ? 'Escape: DISPARA 1 paso' : 'Escape: TRABA MECÁNICA', 'right');

        CAD.drawPhaseCaption(ctx, w, h,
            snapping ? 'Disparo del balancín y avance angular' : 'Llenado regulado del cangilón activo',
            'El peso del agua llena el cangilón hasta vencer el contrapeso superior; la palanca bascula y permite girar exactamente un paso.');
    };

    // 35. AUTÓMATA KARAKURI (CHAHAKOBI NINGYŌ)
    R.japanese_karakuri_doll = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const loaded = Math.sin(theta) > -0.6;
        const legX = 360 + 36 * Math.sin(theta * 2);

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `AUTÓMATA: CHAHAKOBI NINGYŌ (EDO)`,
            `ENERGÍA: MUELLE DE BARBA DE BALLENA`,
            `SENSOR: BANDEJA BASCOLANTE DE TÉ`,
            `ESTADO: ${loaded ? 'MARCHA ADELANTE (TAZA PUESTA)' : 'DETENCIÓN / GIRO 180°'}`
        ]);

        CAD.drawGroundSupport(ctx, 380, 470, 450, 14);
        CAD.drawGear(ctx, 290, 325, 48, 20, theta * 0.5, 'brass', schematic);
        CAD.drawGear(ctx, 375, 280, 32, 14, -theta * 1.2, 'iron', schematic);
        CAD.drawGear(ctx, 435, 220, 24, 10, theta * 3.0, 'brass', schematic);

        CAD.drawLink(ctx, 355, 345, legX, 455, 11, 'wood', schematic);
        CAD.drawLink(ctx, 365, 345, 720 - legX, 455, 11, 'wood', schematic);

        const plateY = loaded ? 165 : 145;
        CAD.drawTimberBeam(ctx, 455, plateY, 545, plateY, 10, schematic);
        CAD.drawLink(ctx, 500, plateY, 500, 245, 8, 'brass', schematic);
        if (loaded) {
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(500, plateY - 14, 14, 0, Math.PI);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        }

        CAD.drawFixedPivot(ctx, 290, 325, 7.5);
        CAD.drawFixedPivot(ctx, 435, 220, 5.5);
        CAD.drawCallout(ctx, 290, 325, 130, 260, 'Muelle espiral de ballena', 'right');
        CAD.drawCallout(ctx, 435, 220, 590, 240, 'Regulador de escape volante', 'left');
        CAD.drawCallout(ctx, 500, plateY, 590, 150, loaded ? 'Taza de té activa la marcha' : 'Sin taza: freno trabado', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            loaded ? 'Avance ceremonial hacia el invitado' : 'Parada automática al retirar la taza',
            'El peso de la taza de té deprime un muelle sensor que libera el escape mecánico; al levantarla, el robot se detiene.');
    };

    // 36. FLAUTISTA PROGRAMABLE DE LOS BANU MUSA
    R.banu_musa_automatic_flute = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xD = 310, yD = 290;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `MEMORIA: CILINDRO DE CLAVIJAS (ROM MECÁNICA)`,
            `INSTRUMENTO: FLAUTA NEUMÁTICA PROGRAMABLE`,
            `POLIFONÍA: 5 REGISTROS DE VÁLVULA`,
            `AUTOR: HERMANOS BANU MUSA (850 d.C.)`
        ]);

        CAD.drawGroundSupport(ctx, 420, 470, 540, 14);
        CAD.drawGear(ctx, xD, yD, 90, 16, theta, 'wood', schematic);
        CAD.drawFixedPivot(ctx, xD, yD, 8.5, 'Cilindro ROM');

        for (let i = 0; i < 5; i++) {
            const hit = Math.sin(theta + i * 1.2) > 0.3;
            const fy = 155 + i * 52;
            const lift = hit ? -10 : 0;
            CAD.drawLink(ctx, 395, fy + lift, 535, fy - lift * 0.5, 9, hit ? 'brass' : 'iron', schematic);
            CAD.drawFixedPivot(ctx, 470, fy, 5);
        }

        CAD.drawCylinder(ctx, 555, 120, 36, 295, 8, 'brass', schematic);
        CAD.drawFluidParticles(ctx, 573, 415, 573, 110, theta * 4, true, CAD.COLORS.waterDeep);
        CAD.drawCallout(ctx, xD, yD - 90, 130, 115, 'Púas codificadas en el tambor', 'right');
        CAD.drawCallout(ctx, 573, 230, 630, 230, 'Columna acústica con orificios', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Lectura secuencial mecánica de código musical',
            'Las clavijas insertadas en el tambor rotativo actúan como levas que pulsan balancines abriendo y cerrando los agujeros tonales de la flauta.');
    };

    // 37. RUECA DE HILAR INDIA (CHARKHA)
    R.indian_charkha = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xW = 240, yW = 285, r1 = 114, xS = 570, yS = 330, r2 = 20;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `RELACIÓN: 12 : 1 (CORREA CRUZADA)`,
            `VELOCIDAD VOLANTE: 60 RPM`,
            `VELOCIDAD HUSO: 720 RPM`,
            `OPERACIÓN: TORSIÓN CONTINUA DE ALGODÓN`
        ]);

        CAD.drawGroundSupport(ctx, 395, 465, 580, 14);
        CAD.drawTimberBeam(ctx, 130, 445, 650, 445, 22, schematic);
        CAD.drawTimberBeam(ctx, xW, 445, xW, yW, 16, schematic);
        CAD.drawTimberBeam(ctx, xS, 445, xS, yS, 14, schematic);

        CAD.drawWaterwheel(ctx, xW, yW, r1, 12, theta, schematic);
        CAD.drawGear(ctx, xS, yS, r2, 12, -theta * 12, 'brass', schematic);
        CAD.drawLink(ctx, xS - 10, yS, xS + 95, yS - 15, 5.5, 'iron', schematic);

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(xW, yW - r1); ctx.lineTo(xS, yS + r2);
        ctx.moveTo(xW, yW + r1); ctx.lineTo(xS, yS - r2);
        ctx.stroke();

        CAD.drawFixedPivot(ctx, xW, yW, 7.5, 'Volante');
        CAD.drawFixedPivot(ctx, xS, yS, 5.5, 'Huso');
        CAD.drawCallout(ctx, 415, 260, 435, 130, 'Correa cruzada multiplicadora (12:1)', 'left');
        CAD.drawCallout(ctx, xS + 65, yS - 12, 630, 240, 'Huso girando a 720 RPM', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Multiplicación angular por transmisión de poleas',
            'El gran diámetro de la rueda transfiere alta velocidad periférica al huso mediante una correa cruzada de cáñamo tensada.');
    };

    // 38. ÁTLATL MESOAMERICANO (BIOMECÁNICA ANATÓMICA Y BALÍSTICA REAL)
    R.mesoamerican_atlatl = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 155, yO = 345, cyc = theta / (Math.PI * 2), rel = 0.48;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `MECANISMO: PALANCA DE 3ER GÉNERO (+60 cm)`,
            `ENERGÍA CINÉTICA: 4× LA DEL BRAZO LIBRE`,
            `VELOCIDAD SALIDA: 38 m/s (137 km/h)`,
            `FASE: ${cyc < rel ? 'ACELERACIÓN Y FLEXIÓN DEL DARDO' : 'RESTITUCIÓN ELÁSTICA Y VUELO'}`
        ]);

        let q1, q2, q3;
        if (cyc < rel) {
            const p = cyc / rel, ease = p * p * (3 - 2 * p);
            q1 = -2.2 + ease * 1.75; q2 = q1 + 0.9 - ease * 0.85; q3 = q2 + 0.8 - ease * 1.1;
        } else {
            const p = (cyc - rel) / (1 - rel);
            q1 = -0.45 + 0.2 * Math.sin(p * Math.PI); q2 = -0.4 + 0.25 * Math.sin(p * Math.PI); q3 = -0.7 + 0.1 * Math.sin(p * Math.PI);
        }

        const xE = xO + 76 * Math.cos(q1), yE = yO + 76 * Math.sin(q1);
        const xW = xE + 70 * Math.cos(q2), yW = yE + 70 * Math.sin(q2);
        const xH = xW + 104 * Math.cos(q3), yH = yW + 104 * Math.sin(q3);

        CAD.drawGroundSupport(ctx, xO, 470, 140, 14);

        // Silueta anatómica técnica del torso y hombro (biomecánica)
        ctx.save();
        const bodyGrad = ctx.createLinearGradient(xO - 45, yO - 60, xO + 20, 470);
        bodyGrad.addColorStop(0, '#78350f');
        bodyGrad.addColorStop(0.5, '#a16207');
        bodyGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.8;

        // Torso anatómico
        ctx.beginPath();
        ctx.moveTo(xO - 30, yO - 55);
        ctx.quadraticCurveTo(xO - 40, yO + 30, xO - 25, 470);
        ctx.lineTo(xO + 15, 470);
        ctx.quadraticCurveTo(xO + 5, yO + 30, xO + 10, yO - 50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cabeza estilizada técnica
        ctx.beginPath();
        ctx.arc(xO - 10, yO - 80, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Brazo biomecánico volumétrico (húmero, bíceps y antebrazo)
        CAD.drawLink(ctx, xO, yO, xE, yE, 16, 'wood', schematic); // Brazo superior muscular
        CAD.drawLink(ctx, xE, yE, xW, yW, 13, 'wood', schematic); // Antebrazo
        CAD.drawLink(ctx, xW, yW, xH, yH, 10, 'wood', schematic); // Átlatl tallado

        // Contrapeso de piedra bannerstone en el átlatl
        const midAtlatlX = (xW + xH) / 2, midAtlatlY = (yW + yH) / 2;
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(midAtlatlX, midAtlatlY, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Trayectoria balística parabólica trazada
        const v0 = 320, la = -0.48, g = 210, xR = 235, yR = 225;
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)'; ctx.lineWidth = 1.8; ctx.setLineDash([5, 4]);
        ctx.beginPath();
        for (let t = 0; t <= 1.8; t += 0.05) {
            const px = xR + v0 * Math.cos(la) * t, py = yR + v0 * Math.sin(la) * t + 0.5 * g * t * t;
            if (px > 760 || py > 470) break;
            if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.setLineDash([]);

        if (cyc < rel) {
            // Dardo sufriendo flexión elástica bajo la fuerza de la espuela
            const flex = Math.sin((cyc / rel) * Math.PI) * 20;
            const dAng = q3 + 0.35;
            CAD.drawElasticBeam(ctx, xH, yH, xH + 175 * Math.cos(dAng), yH + 175 * Math.sin(dAng), flex, 5.0, '#0f172a');
            CAD.drawVector(ctx, xH, yH, -Math.sin(q3) * 65, Math.cos(q3) * 65, CAD.COLORS.vectorVel, 'v_espuela');
        } else {
            // Dardo en vuelo libre tras desprendimiento
            const tF = ((cyc - rel) / (1 - rel)) * 1.45;
            const vx = v0 * Math.cos(la), vy = v0 * Math.sin(la) + g * tF;
            const px = xR + vx * tF, py = yR + v0 * Math.sin(la) * tF + 0.5 * g * tF * tF;
            const pitch = Math.atan2(vy, vx);
            if (px < 750 && py < 470) {
                const tx = px + 115 * Math.cos(pitch), ty = py + 115 * Math.sin(pitch);
                CAD.drawElasticBeam(ctx, px - 45 * Math.cos(pitch), py - 45 * Math.sin(pitch), tx, ty, Math.sin(tF * 18) * 3, 5.0, '#0f172a');
                CAD.drawVector(ctx, tx, ty, vx * 0.22, vy * 0.22, CAD.COLORS.vectorVel, 'v_vuelo (38 m/s)');
            }
        }

        CAD.drawFixedPivot(ctx, xO, yO, 8, 'Hombro');
        CAD.drawPin(ctx, xE, yE, 6, 'Codo');
        CAD.drawPin(ctx, xW, yW, 6, 'Muñeca');
        CAD.drawPin(ctx, xH, yH, 6, 'Espuela');

        CAD.drawCallout(ctx, midAtlatlX, midAtlatlY, 110, 125, 'Propulsor átlatl con contrapeso de piedra (+60 cm)', 'right');
        CAD.drawCallout(ctx, 510, 155, 510, 90, 'Trayectoria balística parabólica (v₀ ≈ 38 m/s)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            cyc < rel ? '1. Latigazo biomecánico y pandeo elástico del dardo' : '2. Liberación tangencial y vuelo balístico',
            cyc < rel ? 'El propulsor alarga el brazo humano como palanca de tercer género; el dardo flecta acumulando energía elástica de deformación.'
                      : 'La restitución elástica empuja el dardo multiplicando por 4 la energía cinética respecto al lanzamiento manual libre.');
    };

    // 39. BALLESTA DE REPETICIÓN ZHUGE NU
    R.chinese_repeating_crossbow = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = theta / (Math.PI * 2);
        const cocking = cyc < 0.65, pull = cocking ? cyc / 0.65 : 0;
        const stringX = 390 - pull * 125;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `CADENCIA: 1 VIROTE / 1.5 s`,
            `CARGADOR: 10 FLECHAS POR GRAVEDAD`,
            `VELOCIDAD FLECHA: 42 m/s`,
            `ESTADO: ${cocking ? 'TENSADO DE ARCO Y CARGA' : 'DISPARO Y EYECCIÓN'}`
        ]);

        CAD.drawGroundSupport(ctx, 210, 440, 160, 14);
        CAD.drawTimberBeam(ctx, 145, 285, 480, 285, 22, schematic);

        const bend = pull * 34;
        CAD.drawElasticBeam(ctx, 465, 145, 465, 395, bend, 12, CAD.COLORS.woodDark);

        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(465 - bend * 0.4, 145); ctx.lineTo(stringX, 265); ctx.lineTo(465 - bend * 0.4, 395);
        ctx.stroke();

        CAD.drawHatchRect(ctx, stringX - 24, 195, 125, 56, CAD.COLORS.woodMid, 10);
        CAD.drawLink(ctx, 185, 285, stringX + 42, 220, 12, 'brass', schematic);
        CAD.drawFixedPivot(ctx, 185, 285, 7);

        if (!cocking) {
            const bx = 460 + ((cyc - 0.65) / 0.35) * 265;
            CAD.drawLink(ctx, bx - 52, 265, bx, 265, 6, 'iron', schematic);
            CAD.drawVector(ctx, bx, 265, 52, 0, CAD.COLORS.vectorVel, '42 m/s');
        }

        CAD.drawCallout(ctx, stringX + 38, 195, 265, 95, 'Cargador vertical automático (10 virotes)', 'right');
        CAD.drawCallout(ctx, 465, 145, 550, 105, 'Arco compuesto sometido a flexión', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            cocking ? '1. Retroceso de palanca: tensa cuerda y cae virote por gravedad' : '2. Disparo instantáneo al liberar cuerda en tope frontal',
            'Un único movimiento continuo de vaivén de la palanca ejecuta el ciclo completo de enganchar la cuerda, alimentar el virote y disparar.');
    };

    // 40. ESTÁTICA DE LA CATEDRAL GÓTICA
    R.gothic_cathedral = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const wPin = 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(theta));
        const shift = (1 - wPin) * 34;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `CRITERIO: TERCIO MEDIO (IRAM / EUROCÓDIGO)`,
            `TENSIÓN TRACCIÓN: σ_t = 0 (COMPRESIÓN PURA)`,
            `PINÁCULO: LASTRE VERTICAL ESTABILIZADOR`,
            `EMPUJE BÓVEDA: H = 85 kN TRANSMITIDO`
        ]);

        CAD.drawGroundSupport(ctx, 400, 480, 680, 14);
        CAD.drawMasonry(ctx, 155, 195, 85, 285);
        CAD.drawMasonry(ctx, 375, 225, 44, 255);

        // Pináculo de mampostería con sombreado volumétrico
        ctx.save();
        const pinGrad = CAD.createMaterialGradient(ctx, 155, 110, 240, 195, 'stone');
        ctx.fillStyle = pinGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(160, 195);
        ctx.lineTo(197, 105 - wPin * 32);
        ctx.lineTo(235, 195);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();

        // Bóveda ojival y arbotante exterior
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(396, 235); ctx.quadraticCurveTo(450, 120, 520, 105); ctx.quadraticCurveTo(590, 120, 644, 235);
        ctx.stroke();

        CAD.drawMasonry(ctx, 624, 230, 42, 250);
        CAD.drawTimberBeam(ctx, 396, 235, 235, 282, 18, true);

        // Línea de empujes resultante dentro del tercio medio
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(520, 105); ctx.quadraticCurveTo(450, 160, 396, 235);
        ctx.lineTo(235, 282); ctx.lineTo(197 + shift, 480);
        ctx.stroke();

        CAD.drawVector(ctx, 235, 282, -48, 15, CAD.COLORS.vectorForce, 'Empuje bóveda H');
        CAD.drawVector(ctx, 197, 195, 0, 50 + wPin * 45, CAD.COLORS.vectorThrust, 'Peso pináculo P');
        CAD.drawCallout(ctx, 197, 130, 275, 95, 'Pináculo (desvía resultante hacia el suelo)', 'left');
        CAD.drawCallout(ctx, 315, 258, 305, 180, 'Arbotante transmite empuje al exterior', 'right');

        CAD.drawPhaseCaption(ctx, w, h,
            shift < 25 ? 'Línea de empujes dentro del tercio medio: mampostería en compresión pura' : 'Pináculo aligerado: la resultante se acerca al borde exterior con riesgo de tracción',
            'El gran peso vertical del pináculo rota hacia abajo el empuje horizontal de la bóveda, evitando que el estribo vuelque.');
    };

    // 41. PUENTE COLGANTE Q'ESWACHAKA
    R.inca_suspension_bridge = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xA = 115, xB = 685, yAnch = 175, loadPos = theta / (Math.PI * 2);
        const xLoad = xA + loadPos * (xB - xA);

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `MATERIAL: ICHU TRENZADO (Q'ESWA)`,
            `RÉGIMEN: TRACCIÓN PURA (FUNICULAR)`,
            `LUZ DEL PUENTE: L = 28 m`,
            `FLECHA CENTRAL: f = 3.2 m`
        ]);

        CAD.drawGroundSupport(ctx, 400, 480, 700, 14);
        CAD.drawMasonry(ctx, 35, 170, 90, 310);
        CAD.drawMasonry(ctx, 675, 170, 90, 310);

        function yCable(x) {
            const u = (x - xA) / (xB - xA);
            const dist = Math.abs(x - xLoad);
            return yAnch + 74 * 4 * u * (1 - u) + 28 * Math.exp(-(dist * dist) / (75 * 75));
        }

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 4.5;
        ctx.beginPath();
        for (let x = xA; x <= xB; x += 6) {
            if (x === xA) ctx.moveTo(x, yCable(x)); else ctx.lineTo(x, yCable(x));
        }
        ctx.stroke();

        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.8;
        ctx.beginPath();
        for (let x = xA; x <= xB; x += 15) {
            const yy = yCable(x) + 30;
            if (x === xA) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();

        for (let x = xA + 30; x < xB; x += 35) {
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(x, yCable(x)); ctx.lineTo(x, yCable(x) + 30); ctx.stroke();
        }

        const yL = yCable(xLoad) + 30;
        CAD.drawHatchRect(ctx, xLoad - 15, yL - 22, 30, 22, CAD.COLORS.brassMid, 5);
        CAD.drawVector(ctx, xLoad, yL, 0, 54, '#dc2626', 'Carga móvil P');
        CAD.drawFixedPivot(ctx, xA, yAnch, 7, 'Estribo 1');
        CAD.drawFixedPivot(ctx, xB, yAnch, 7, 'Estribo 2');

        CAD.drawPhaseCaption(ctx, w, h, 'Equilibrio funicular de catenaria deformada',
            'Las trenzas de fibra vegetal de ichu adaptan continuamente su curvatura al paso de la carga, trabajando únicamente a tracción axial.');
    };

    // 42. MATRIZ MNEMOTÉCNICA DECIMAL DE QUIPU
    R.inca_quipu_memory = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const vals = [243, 135, Math.round(112 + 120 * (0.5 + 0.5 * Math.cos(theta))), 308];
        const sumTotal = vals.reduce((a, b) => a + b, 0);

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `SISTEMA: BASE 10 POSICIONAL POR NUDOS`,
            `REGISTROS: 4 CUENTAS TRIBUTARIAS`,
            `CONTROL: CUERDA TOTALIZADORA (CHECKSUM)`,
            `SUMA: Σ = ${sumTotal}`
        ]);

        CAD.drawTimberBeam(ctx, 110, 125, 690, 125, 12, schematic);
        CAD.drawPin(ctx, 110, 125, 6, 'Cuerda principal');

        vals.forEach((v, idx) => {
            const cx = 195 + idx * 115;
            const c = Math.floor(v / 100), d = Math.floor((v % 100) / 10), u = v % 10;
            ctx.strokeStyle = idx === 2 ? '#0284c7' : CAD.COLORS.woodDark; ctx.lineWidth = 3.2;
            ctx.beginPath(); ctx.moveTo(cx, 125); ctx.lineTo(cx, 425); ctx.stroke();

            for (let i = 0; i < c; i++) CAD.drawPin(ctx, cx, 185 + i * 11, 4.8);
            for (let i = 0; i < d; i++) CAD.drawPin(ctx, cx, 275 + i * 10, 4.5);
            if (u > 0) CAD.drawHatchRect(ctx, cx - 8, 365, 16, 10 + u * 3.5, CAD.COLORS.brassMid, 4);

            ctx.fillStyle = CAD.COLORS.ink; ctx.font = '700 12.5px monospace'; ctx.textAlign = 'center';
            ctx.fillText(String(v).padStart(3, '0'), cx, 450);
        });

        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(655, 125); ctx.lineTo(655, 365); ctx.stroke();
        ctx.fillStyle = '#dc2626'; ctx.font = '700 13px monospace'; ctx.textAlign = 'center';
        ctx.fillText('Σ = ' + sumTotal, 655, 392);

        ctx.fillStyle = CAD.COLORS.inkSoft; ctx.font = '600 11.5px monospace'; ctx.textAlign = 'left';
        ctx.fillText('100× (Centenas)', 65, 195);
        ctx.fillText('10× (Decenas)', 65, 285);
        ctx.fillText('1× (Unidades)', 65, 378);
        CAD.drawCallout(ctx, 655, 230, 560, 82, 'Cuerda totalizadora (Checksum)', 'right');

        CAD.drawPhaseCaption(ctx, w, h, 'Codificación decimal posicional por nudos textiles',
            'Cada cuerda colgante agrupa órdenes de magnitud de arriba hacia abajo; la cuerda totalizadora lateral comprueba la integridad contable.');
    };

})(window.MACHINE_RENDERERS);
