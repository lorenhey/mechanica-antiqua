/**
 * Mechanica Antiqua - Ilustraciones Cutaway 2D: Mecanismos, Molinos, Autómatas, Balística y Estructuras (19 máquinas)
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

        CAD.drawGroundSupport(ctx, 400, 480, 700, 12);
        CAD.drawWaterSurface(ctx, 40, 440, 290, 40, theta, 2.0);
        CAD.drawCenterline(ctx, 75, yO, 325, yO);
        CAD.drawCenterline(ctx, xB, 75, xB, 475);

        // Columnas guía fijas de roble
        CAD.drawTimberBeam(ctx, 420, 95, 420, 480, 16, schematic);
        CAD.drawTimberBeam(ctx, 520, 95, 520, 480, 16, schematic);
        CAD.drawTimberBeam(ctx, 410, 95, 530, 95, 16, schematic);

        CAD.drawWaterwheel(ctx, xO, yO, 102, 12, theta, schematic);
        CAD.drawLink(ctx, xO, yO, kin.xA, kin.yA, 14, 'iron', schematic);

        // Bastidor móvil porta-sierra y hoja dentada
        const frameTop = kin.yB - 175;
        CAD.drawTimberBeam(ctx, 434, frameTop, 506, frameTop, 10, schematic);
        CAD.drawTimberBeam(ctx, 434, kin.yB, 506, kin.yB, 11, schematic);
        CAD.drawTimberBeam(ctx, 434, frameTop, 434, kin.yB, 8, schematic);
        CAD.drawTimberBeam(ctx, 506, frameTop, 506, kin.yB, 8, schematic);
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(xB, frameTop + 5); ctx.lineTo(xB, kin.yB - 5); ctx.stroke();

        // Carro del tronco avanzando con trinquete
        const logX = 486 - (theta / (Math.PI * 2)) * 24;
        ctx.fillStyle = CAD.COLORS.woodLight; ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 1.8;
        ctx.fillRect(logX, 225, 225, 42); ctx.strokeRect(logX, 225, 225, 42);
        CAD.drawTimberBeam(ctx, 480, 276, 735, 276, 10, schematic);

        // Biela AB articulada exactamente en A y B
        CAD.drawLink(ctx, kin.xA, kin.yA, kin.xB, kin.yB, 11, 'brass', schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 7, 'O₂');
        CAD.drawPin(ctx, kin.xA, kin.yA, 6, 'A');
        CAD.drawPin(ctx, kin.xB, kin.yB, 6, 'B');
        CAD.drawVector(ctx, xB + 28, kin.yB - 80, 0, k.vMs * 30, CAD.COLORS.vectorVel, 'v_sierra');

        CAD.drawCallout(ctx, xB, 175, 595, 135, 'Bastidor guiado en par prismático P', 'left');
        CAD.drawCallout(ctx, (kin.xA + kin.xB) / 2, (kin.yA + kin.yB) / 2, 290, 215, 'Biela articulada (L = 750 mm)', 'right');
        CAD.drawCallout(ctx, 645, 245, 650, 190, 'Avance escalonado del tronco', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            cuttingDown ? 'Carrera de corte descendente' : 'Carrera ascendente + avance de trinquete',
            'La biela transforma el giro de la rueda en vaivén vertical manteniendo unidas las articulaciones A y B.');
    };

    // 25. ASERRADERO CON PÉRTIGA ELÁSTICA DE VILLARD
    R.villard_sawmill = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xCam = 355, yCam = 400;
        const phase = (theta * 2) % (Math.PI * 2);
        const depress = phase < Math.PI * 1.3 ? phase / (Math.PI * 1.3) : Math.max(0, 1 - Math.pow((phase - Math.PI * 1.3) / 0.8, 2));
        const stroke = depress * 62;
        const tipX = 485, tipY = 120 + stroke;

        CAD.drawGroundSupport(ctx, 400, 480, 680, 12);
        CAD.drawMasonry(ctx, 110, 115, 70, 365);

        // Pértiga elástica empotrada arriba doblándose por flexión
        CAD.drawElasticBeam(ctx, 180, 125, tipX, tipY, stroke * 0.45, 11, CAD.COLORS.woodMid);
        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX, tipY + 45); ctx.stroke();

        // Hoja de sierra + tronco en corte
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(tipX, tipY + 45); ctx.lineTo(tipX, tipY + 210); ctx.stroke();
        ctx.fillStyle = CAD.COLORS.woodLight; ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.fillRect(505, 245, 195, 42); ctx.strokeRect(505, 245, 195, 42);

        // Rueda motriz con 4 levas empujando abajo
        CAD.drawWaterwheel(ctx, xCam, yCam, 78, 8, theta, schematic);
        ctx.save(); ctx.translate(xCam, yCam); ctx.rotate(theta);
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = CAD.COLORS.brassMid; ctx.strokeStyle = CAD.COLORS.ink;
            ctx.fillRect(58, -7, 42, 14); ctx.strokeRect(58, -7, 42, 14);
        }
        ctx.restore();
        CAD.drawFixedPivot(ctx, xCam, yCam, 7, 'O');
        CAD.drawPin(ctx, tipX, tipY, 5);

        CAD.drawCallout(ctx, 320, 130, 290, 75, 'Pértiga de fresno (resorte elástico)', 'left');
        CAD.drawCallout(ctx, 445, 365, 595, 365, 'Árbol de 4 levas (empuja hacia abajo)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            phase < Math.PI * 1.3 ? '1. Carrera de corte (leva tensa pértiga)' : '2. Retorno elástico automático',
            'Al escapar la leva, la energía de flexión almacenada en la viga superior devuelve instantáneamente la hoja hacia arriba.');
    };

    // 26–28. MOLINOS DE LEVAS (Agricola Stamp Mill, Zonca Paper Mill, Zonca Stamping Mill)
    function renderCamBattery(ctx, w, h, theta, isTilt, capTitle, capDesc, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xCam = 245, yCam = 325;
        CAD.drawGroundSupport(ctx, 400, 480, 680, 12);
        CAD.drawCenterline(ctx, 100, yCam, 660, yCam);

        CAD.drawWaterwheel(ctx, 130, yCam, 92, 12, theta, schematic);
        CAD.drawGear(ctx, 130, yCam, 52, 18, theta, 'wood', schematic);
        CAD.drawGear(ctx, xCam, yCam, 34, 12, -theta * 1.5, 'brass', schematic);

        CAD.drawMasonry(ctx, 365, 420, 265, 60);
        ctx.fillStyle = isTilt ? CAD.COLORS.water : '#d4d4d8';
        ctx.fillRect(380, 420, 235, 22);

        for (let i = 0; i < 3; i++) {
            const phase = (theta + (i * Math.PI * 2) / 3) % (Math.PI * 2);
            const liftNorm = phase < Math.PI * 1.4 ? phase / (Math.PI * 1.4) : Math.max(0, 1 - Math.pow((phase - Math.PI * 1.4) / 0.6, 2));
            const sx = 415 + i * 74;

            ctx.save(); ctx.translate(sx, yCam); ctx.rotate(phase);
            ctx.fillStyle = CAD.COLORS.brassMid; ctx.strokeStyle = CAD.COLORS.ink;
            ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(36, -7); ctx.arc(0, 0, 36, -0.2, 0.25); ctx.lineTo(0, 13); ctx.closePath();
            ctx.fill(); ctx.stroke(); ctx.restore();

            if (isTilt) {
                const fx = 665, fy = 365;
                const tipY = 415 - liftNorm * 62;
                CAD.drawTimberBeam(ctx, fx, fy, sx - 8, tipY - 22, 12, schematic);
                CAD.drawHatchRect(ctx, sx - 24, tipY - 32, 30, 38, CAD.COLORS.woodMid, 6);
                CAD.drawFixedPivot(ctx, fx, fy, 6);
            } else {
                const baseY = 418 - liftNorm * 66;
                CAD.drawTimberBeam(ctx, sx, baseY - 210, sx, baseY - 22, 13, schematic);
                CAD.drawHatchRect(ctx, sx - 15, baseY - 32, 30, 32, CAD.COLORS.ironMid, 5);
                ctx.fillStyle = CAD.COLORS.brassMid; ctx.fillRect(sx - 32, baseY - 105, 20, 13); ctx.strokeRect(sx - 32, baseY - 105, 20, 13);
            }
        }
        CAD.drawLink(ctx, xCam - 10, yCam, 600, yCam, 12, 'wood', schematic);
        CAD.drawFixedPivot(ctx, xCam, yCam, 7, 'O');
        CAD.drawCallout(ctx, 415, yCam - 22, 435, 115, 'Levas desfasadas a 120°', 'left');
        CAD.drawCallout(ctx, 490, 425, 645, 445, isTilt ? 'Tina de pulpa de trapo' : 'Mortero de impacto', 'left');

        CAD.drawPhaseCaption(ctx, w, h, capTitle, capDesc);
    }

    R.agricola_stamp_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta, false, 'Elevación progresiva y caída libre',
            'Las levas a 120° escalonan el impacto de los 3 pilones de hierro para mantener uniforme el par sobre la rueda.', schematic);
    };
    R.zonca_stamping_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta, false, 'Batanado textil por golpe rítmico',
            'Tres mazos verticales alternan impactos continuos para compactar paños de lana en baño caliente.', schematic);
    };
    R.zonca_paper_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta, true, 'Desfibrado hidráulico en tina papelera',
            'Cada leva deprime la cola del mazo basculante y lo libera para golpear trapos de lino dentro de la tina.', schematic);
    };

    // 29. RUEDA DE LECTURA DE RAMELLI (EPICICLOIDAL)
    R.ramelli_book_wheel = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 400, cy = 275, rDrum = 148;
        CAD.drawGroundSupport(ctx, cx, 475, 310, 12);
        CAD.drawTimberBeam(ctx, cx - 115, 475, cx, cy, 16, schematic);
        CAD.drawTimberBeam(ctx, cx + 115, 475, cx, cy, 16, schematic);

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = schematic ? 2 : 11;
        ctx.beginPath(); ctx.arc(cx, cy, rDrum, 0, Math.PI * 2); ctx.stroke();

        CAD.drawGear(ctx, cx, cy, 32, 18, 0, 'brass', schematic); // Sol fijo al bastidor

        for (let i = 0; i < 8; i++) {
            const ang = theta + (i * Math.PI * 2) / 8;
            const ix = cx + 65 * Math.cos(ang), iy = cy + 65 * Math.sin(ang);
            CAD.drawGear(ctx, ix, iy, 21, 12, -ang * 1.5, 'iron', schematic);

            const px = cx + rDrum * Math.cos(ang), py = cy + rDrum * Math.sin(ang);
            CAD.drawLink(ctx, cx, cy, px, py, 7, 'wood', schematic);
            CAD.drawGear(ctx, px, py, 23, 14, 0, 'brass', schematic);

            ctx.save(); ctx.translate(px, py);
            ctx.fillStyle = CAD.COLORS.woodMid; ctx.strokeStyle = CAD.COLORS.ink;
            ctx.fillRect(-23, 7, 46, 7); ctx.strokeRect(-23, 7, 46, 7);
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#dc2626';
            ctx.fillRect(-19, -7, 18, 14); ctx.strokeRect(-19, -7, 18, 14);
            ctx.fillRect(1, -7, 18, 14); ctx.strokeRect(1, -7, 18, 14);
            ctx.restore();
            CAD.drawPin(ctx, px, py, 4);
        }
        CAD.drawFixedPivot(ctx, cx, cy, 7, 'Sol fijo');
        CAD.drawCallout(ctx, cx, cy, 130, 120, 'Engranaje central fijo al soporte', 'right');
        CAD.drawCallout(ctx, cx + 65, cy, 600, 185, 'Engranaje inversor intermedio', 'left');
        CAD.drawCallout(ctx, cx + rDrum, cy, 600, 320, 'Atriles siempre horizontales (0°)', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Compensación epicicloidal perfecta',
            'El tren planetario Z₁ → Z₂ → Z₃ compensa la rotación del tambor para que ningún libro se incline al girar.');
    };

    // 30. TORNO DE ROSCAR DE JACQUES BESSON (1578)
    R.besson_screw_lathe = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = theta / (Math.PI * 2);
        const carX = 240 + cyc * 265;

        CAD.drawGroundSupport(ctx, 170, 475, 90, 12);
        CAD.drawGroundSupport(ctx, 630, 475, 90, 12);
        CAD.drawTimberBeam(ctx, 135, 375, 665, 375, 22, schematic);
        CAD.drawTimberBeam(ctx, 170, 145, 170, 475, 20, schematic);
        CAD.drawTimberBeam(ctx, 630, 145, 630, 475, 20, schematic);

        CAD.drawCenterline(ctx, 110, 200, 680, 200);
        CAD.drawCenterline(ctx, 110, 295, 680, 295);

        CAD.drawGear(ctx, 135, 200, 28, 16, theta, 'brass', schematic);
        CAD.drawGear(ctx, 135, 295, 28, 16, theta, 'brass', schematic);
        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(112, 200); ctx.lineTo(112, 295); ctx.moveTo(158, 200); ctx.lineTo(158, 295); ctx.stroke();

        // Pieza a mecanizar + husillo patrón inferior
        ctx.fillStyle = '#e4e4e7'; ctx.strokeStyle = CAD.COLORS.ink;
        ctx.fillRect(205, 182, 395, 36); ctx.strokeRect(205, 182, 395, 36);
        for (let tx = 220; tx < carX; tx += 12) {
            ctx.beginPath(); ctx.moveTo(tx, 182); ctx.lineTo(tx + 6, 218); ctx.stroke();
        }
        ctx.fillStyle = '#d4d4d8';
        ctx.fillRect(190, 285, 420, 20); ctx.strokeRect(190, 285, 420, 20);
        for (let hx = 200; hx < 605; hx += 12) {
            ctx.beginPath(); ctx.moveTo(hx, 285); ctx.lineTo(hx + 6, 305); ctx.stroke();
        }

        // Carro longitudinal móvil con buril cortante y semituerca abajo
        CAD.drawHatchRect(ctx, carX - 28, 255, 56, 108, '#ffffff', 10);
        CAD.drawHatchRect(ctx, carX - 16, 280, 32, 30, CAD.COLORS.brassMid, 5);
        ctx.fillStyle = CAD.COLORS.ink;
        ctx.beginPath(); ctx.moveTo(carX, 218); ctx.lineTo(carX - 7, 255); ctx.lineTo(carX + 7, 255); ctx.closePath(); ctx.fill();

        CAD.drawPin(ctx, carX, 295, 5);
        CAD.drawPin(ctx, carX, 218, 4);
        CAD.drawCallout(ctx, 135, 248, 85, 95, 'Transmisión rígida 1:1', 'left');
        CAD.drawCallout(ctx, carX, 295, 455, 435, 'Semituerca en husillo patrón (p = 8 mm)', 'left');
        CAD.drawCallout(ctx, carX, 218, 495, 105, 'Buril tallando filete helicoidal', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Avance sincronizado por husillo maestro',
            'La misma cuerda gira simultáneamente la pieza y el husillo patrón, asegurando un paso constante a lo largo del eje.');
    };

    // 31. COJINETE AXIAL DE BOLAS CON JAULA DE LEONARDO
    R.leonardo_cage_bearing = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 400, cy = 275, rIn = 78, rPitch = 110, rBall = 30, rOut = 142;

        CAD.drawCenterline(ctx, 175, cy, 625, cy);
        CAD.drawCenterline(ctx, cx, 75, cx, 470);

        CAD.drawHatchRect(ctx, cx - 175, cy - 175, 350, 350, '#f4f4f5', 11);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(cx, cy, rOut, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        CAD.drawGear(ctx, cx, cy, rIn, 24, theta, 'iron', schematic);

        const cageAng = theta * 0.5;
        ctx.strokeStyle = CAD.COLORS.brassMid; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(cx, cy, rPitch + 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, rPitch - 12, 0, Math.PI * 2); ctx.stroke();

        const spinRatio = (rPitch / (2 * rBall)) * (1 - (rBall * rBall) / (rPitch * rPitch));
        for (let i = 0; i < 8; i++) {
            const ang = cageAng + (i * Math.PI * 2) / 8;
            const bx = cx + rPitch * Math.cos(ang), by = cy + rPitch * Math.sin(ang);
            ctx.save(); ctx.translate(bx, by); ctx.rotate(-theta * spinRatio);
            ctx.fillStyle = '#e4e4e7'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(0, 0, rBall, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-rBall + 4, 0); ctx.lineTo(rBall - 4, 0); ctx.stroke();
            ctx.restore();
        }

        CAD.drawFixedPivot(ctx, cx, cy, 8, 'Eje (ω)');
        CAD.drawCallout(ctx, cx + rPitch, cy - 28, 600, 120, 'Jaula separadora (ω / 2)', 'left');
        CAD.drawCallout(ctx, cx + rOut + 15, cy + 55, 600, 375, 'Pista exterior fija', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Rodadura pura sin roce mutuo entre bolas',
            'La jaula separa las esferas evitando que choquen girando en sentido opuesto; orbita exactamente a la mitad de velocidad del eje.');
    };

    // 32. ENGRANAJE GLOBOIDAL DE LEONARDO
    R.leonardo_globoidal_gear = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 420, cy = 315, rWheel = 128, wormY = 165;

        CAD.drawGroundSupport(ctx, 420, 470, 440, 12);
        CAD.drawCenterline(ctx, 130, wormY, 670, wormY);
        CAD.drawCenterline(ctx, cx, 75, cx, 470);

        CAD.drawGear(ctx, cx, cy, rWheel, 28, theta / 8.0, 'brass', schematic);
        CAD.drawFixedPivot(ctx, cx, cy, 9, 'O_rueda');

        ctx.fillStyle = '#e4e4e7'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(270, wormY - 36); ctx.quadraticCurveTo(cx, wormY - 10, 570, wormY - 36);
        ctx.lineTo(570, wormY + 36); ctx.quadraticCurveTo(cx, wormY + 10, 270, wormY + 36);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        const shift = ((theta / (Math.PI * 2)) % 1) * 26;
        ctx.strokeStyle = CAD.COLORS.brassDark; ctx.lineWidth = 3.5;
        for (let x = 285 + shift; x < 555; x += 26) {
            const dx = (x - cx) / 140;
            const waist = 12 + 22 * dx * dx;
            ctx.beginPath(); ctx.moveTo(x - 6, wormY - waist); ctx.lineTo(x + 6, wormY + waist); ctx.stroke();
        }
        CAD.drawFixedPivot(ctx, 250, wormY, 7);
        CAD.drawFixedPivot(ctx, 590, wormY, 7);
        CAD.drawCallout(ctx, cx, wormY - 12, 165, 85, 'Tornillo cóncavo envolvente', 'right');
        CAD.drawCallout(ctx, cx, wormY + 26, 595, 240, '4 dientes engranan a la vez (30:1)', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Reparto de carga multi-diente',
            'A diferencia de un tornillo cilíndrico recto, el perfil cóncavo abraza el radio de la rueda multiplicando el área de contacto.');
    };

    // 33. CARRO QUE APUNTA AL SUR (ZHǏ NÁN CHĒ)
    R.chinese_south_pointing_chariot = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const heading = 0.62 * Math.sin(theta);
        const wheelL = theta * 1.4 - heading * 2.0, wheelR = theta * 1.4 + heading * 2.0;

        // Izquierda: Tren diferencial cónico
        const cx = 250, cy = 285;
        CAD.drawCenterline(ctx, 75, cy, 425, cy);
        CAD.drawTimberBeam(ctx, 115, cy, 385, cy, 16, schematic);
        CAD.drawWaterwheel(ctx, 115, cy, 78, 8, wheelL, schematic);
        CAD.drawWaterwheel(ctx, 385, cy, 78, 8, wheelR, schematic);
        CAD.drawGear(ctx, cx, cy, 38, 16, heading, 'brass', schematic);
        CAD.drawFixedPivot(ctx, 115, cy, 6, 'R_L');
        CAD.drawFixedPivot(ctx, 385, cy, 6, 'R_R');
        CAD.drawFixedPivot(ctx, cx, cy, 6, 'Dif');

        // Derecha: Vista superior del carro girando en S con puntero clavado al Sur
        const mapX = 605, mapY = 275;
        ctx.strokeStyle = '#d4d4d8'; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(mapX, mapY, 100, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);

        ctx.save(); ctx.translate(mapX, mapY); ctx.rotate(heading);
        CAD.drawHatchRect(ctx, -40, -55, 80, 110, CAD.COLORS.woodLight, 10);
        ctx.fillStyle = CAD.COLORS.ink;
        ctx.fillRect(-52, -26, 12, 52); ctx.fillRect(40, -26, 12, 52);
        ctx.restore();

        CAD.drawVector(ctx, mapX, mapY, 0, 90, '#dc2626', 'SUR FIJO');
        CAD.drawPin(ctx, mapX, mapY, 7);

        CAD.drawCallout(ctx, cx, cy - 38, 155, 95, 'Diferencial resta (θ_R - θ_L)', 'left');
        CAD.drawCallout(ctx, mapX + 45, mapY - 35, 565, 95, 'El carro gira según el terreno', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Odometría diferencial mecánica',
            'Cuando una rueda gira más que la otra en curva, el diferencial compensa exactamente el ángulo para que la figura siga apuntando al Sur.');
    };

    // 34. RELOJ HIDRÁULICO DE SU SONG (1088)
    R.chinese_su_song_clock = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 390, cy = 295, R = 132;
        const stepProg = (theta % (Math.PI / 3)) / (Math.PI / 3);
        const snapping = stepProg > 0.78;
        const quantized = Math.floor(theta / (Math.PI / 3)) * (Math.PI / 6);
        const wheelRot = quantized + (snapping ? ((stepProg - 0.78) / 0.22) * (Math.PI / 6) : 0);

        CAD.drawGroundSupport(ctx, cx, 475, 360, 12);
        CAD.drawPipe(ctx, [[545, 70], [495, 70], [495, 115]], 14, CAD.COLORS.waterDeep, theta * 4, true, false);
        CAD.drawFluidParticles(ctx, 495, 118, 480, 185, theta * 5, true, CAD.COLORS.waterDeep);

        CAD.drawWaterwheel(ctx, cx, cy, R, 12, wheelRot, schematic);
        CAD.drawFixedPivot(ctx, cx, cy, 8, 'O_rueda');

        ctx.save(); ctx.translate(cx - 25, 130); ctx.rotate(snapping ? -0.25 : 0.05);
        CAD.drawLink(ctx, -90, 0, 115, 0, 9, 'brass', schematic);
        ctx.restore();
        CAD.drawFixedPivot(ctx, cx - 25, 130, 6);

        CAD.drawCallout(ctx, 495, 90, 560, 90, 'Chorro calibrado constante', 'left');
        CAD.drawCallout(ctx, cx - 75, 130, 180, 130, snapping ? 'Escape: SUELTA 1 paso' : 'Escape: RETENIDO', 'right');

        CAD.drawPhaseCaption(ctx, w, h,
            snapping ? 'Liberación cuántica del escape' : 'Llenado isócrono del cangilón',
            'El agua llena el cangilón activo hasta vencer el contrapeso de la balanza superior, permitiendo un avance exacto de 10°.');
    };

    // 35. AUTÓMATA KARAKURI (CHAHAKOBI NINGYŌ)
    R.japanese_karakuri_doll = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const loaded = Math.sin(theta) > -0.6;
        const legX = 360 + 36 * Math.sin(theta * 2);

        CAD.drawGroundSupport(ctx, 380, 470, 440, 12);
        CAD.drawGear(ctx, 290, 325, 46, 20, theta * 0.5, 'brass', schematic);
        CAD.drawGear(ctx, 375, 280, 30, 14, -theta * 1.2, 'iron', schematic);
        CAD.drawGear(ctx, 435, 220, 22, 10, theta * 3.0, 'brass', schematic);

        CAD.drawLink(ctx, 355, 345, legX, 455, 10, 'wood', schematic);
        CAD.drawLink(ctx, 365, 345, 720 - legX, 455, 10, 'wood', schematic);

        const plateY = loaded ? 165 : 145;
        CAD.drawTimberBeam(ctx, 455, plateY, 545, plateY, 9, schematic);
        CAD.drawLink(ctx, 500, plateY, 500, 245, 7, 'brass', schematic);
        if (loaded) CAD.drawHatchRect(ctx, 482, plateY - 24, 36, 24, '#e4e4e7', 6);

        CAD.drawFixedPivot(ctx, 290, 325, 7);
        CAD.drawFixedPivot(ctx, 435, 220, 5);
        CAD.drawCallout(ctx, 290, 325, 130, 260, 'Muelle espiral (barba ballena)', 'right');
        CAD.drawCallout(ctx, 435, 220, 585, 240, 'Regulador centrífugo de velocidad', 'left');
        CAD.drawCallout(ctx, 500, plateY, 585, 150, loaded ? 'Taza activa marcha' : 'Sin taza: freno / giro 180°', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            loaded ? 'Avance con taza colocada' : 'Retiro de carga y retorno',
            'El peso de la taza comprime un muelle interruptor que libera el tren de engranajes de marcha hacia adelante.');
    };

    // 36. FLAUTISTA PROGRAMABLE DE LOS BANU MUSA
    R.banu_musa_automatic_flute = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xD = 310, yD = 290;
        CAD.drawGroundSupport(ctx, 420, 470, 520, 12);
        CAD.drawGear(ctx, xD, yD, 88, 16, theta, 'wood', schematic);
        CAD.drawFixedPivot(ctx, xD, yD, 8, 'Tambor ROM');

        for (let i = 0; i < 5; i++) {
            const hit = Math.sin(theta + i * 1.2) > 0.3;
            const fy = 155 + i * 52;
            const lift = hit ? -9 : 0;
            CAD.drawLink(ctx, 395, fy + lift, 535, fy - lift * 0.5, 8, hit ? 'brass' : 'iron', schematic);
            CAD.drawFixedPivot(ctx, 470, fy, 4.5);
        }

        CAD.drawCylinder(ctx, 555, 120, 34, 295, 7, 'brass', schematic);
        CAD.drawFluidParticles(ctx, 572, 415, 572, 110, theta * 4, true, CAD.COLORS.waterDeep);
        CAD.drawCallout(ctx, xD, yD - 88, 135, 115, 'Cilindro codificado con púas', 'right');
        CAD.drawCallout(ctx, 572, 230, 625, 230, 'Flauta neumática alimentada por aire', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Lectura secuencial de levas programadas',
            'Los pines dispuestos sobre la superficie del tambor levantan selectivamente cada palanca para modular las notas.');
    };

    // 37. RUECA DE HILAR INDIA (CHARKHA)
    R.indian_charkha = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xW = 240, yW = 285, r1 = 112, xS = 570, yS = 330, r2 = 20;
        CAD.drawGroundSupport(ctx, 395, 465, 560, 12);
        CAD.drawTimberBeam(ctx, 130, 445, 650, 445, 20, schematic);
        CAD.drawTimberBeam(ctx, xW, 445, xW, yW, 14, schematic);
        CAD.drawTimberBeam(ctx, xS, 445, xS, yS, 12, schematic);

        CAD.drawWaterwheel(ctx, xW, yW, r1, 12, theta, schematic);
        CAD.drawGear(ctx, xS, yS, r2, 12, -theta * 12, 'brass', schematic);
        CAD.drawLink(ctx, xS - 10, yS, xS + 90, yS - 15, 5, 'iron', schematic);

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(xW, yW - r1); ctx.lineTo(xS, yS + r2); ctx.moveTo(xW, yW + r1); ctx.lineTo(xS, yS - r2); ctx.stroke();

        CAD.drawFixedPivot(ctx, xW, yW, 7, 'Volante');
        CAD.drawFixedPivot(ctx, xS, yS, 5, 'Huso');
        CAD.drawCallout(ctx, 415, 260, 435, 130, 'Correa cruzada multiplicadora (12:1)', 'left');
        CAD.drawCallout(ctx, xS + 65, yS - 12, 625, 240, 'Huso a 720 rpm', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Multiplicación por relación de radios',
            'Una sola vuelta lenta del volante manual imparte doce giros rápidos al huso para retorcer e hilar fibras de algodón.');
    };

    // 38. ÁTLATL MESOAMERICANO (BIOMECÁNICA Y BALÍSTICA REAL)
    R.mesoamerican_atlatl = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 155, yO = 345, cyc = theta / (Math.PI * 2), rel = 0.48;
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
        const xH = xW + 102 * Math.cos(q3), yH = yW + 102 * Math.sin(q3);

        CAD.drawGroundSupport(ctx, xO, 470, 120, 12);
        CAD.drawTimberBeam(ctx, xO, 470, xO, yO, 12, schematic);
        CAD.drawLink(ctx, xO, yO, xE, yE, 13, 'iron', schematic);
        CAD.drawLink(ctx, xE, yE, xW, yW, 10, 'iron', schematic);
        CAD.drawLink(ctx, xW, yW, xH, yH, 8, 'wood', schematic);
        CAD.drawPin(ctx, (xW + xH) / 2, (yW + yH) / 2, 6);

        const v0 = 320, la = -0.48, g = 210, xR = 235, yR = 225;
        ctx.strokeStyle = 'rgba(11, 79, 140, 0.35)'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
        ctx.beginPath();
        for (let t = 0; t <= 1.8; t += 0.05) {
            const px = xR + v0 * Math.cos(la) * t, py = yR + v0 * Math.sin(la) * t + 0.5 * g * t * t;
            if (px > 760 || py > 470) break;
            if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.setLineDash([]);

        if (cyc < rel) {
            const flex = Math.sin((cyc / rel) * Math.PI) * 18;
            const dAng = q3 + 0.35;
            CAD.drawElasticBeam(ctx, xH, yH, xH + 170 * Math.cos(dAng), yH + 170 * Math.sin(dAng), flex, 4.5, '#18181b');
            CAD.drawVector(ctx, xH, yH, -Math.sin(q3) * 60, Math.cos(q3) * 60, CAD.COLORS.vectorVel, 'v_espuela');
        } else {
            const tF = ((cyc - rel) / (1 - rel)) * 1.45;
            const vx = v0 * Math.cos(la), vy = v0 * Math.sin(la) + g * tF;
            const px = xR + vx * tF, py = yR + v0 * Math.sin(la) * tF + 0.5 * g * tF * tF;
            const pitch = Math.atan2(vy, vx);
            if (px < 750 && py < 470) {
                const tx = px + 110 * Math.cos(pitch), ty = py + 110 * Math.sin(pitch);
                CAD.drawElasticBeam(ctx, px - 42 * Math.cos(pitch), py - 42 * Math.sin(pitch), tx, ty, Math.sin(tF * 18) * 3, 4.5, '#18181b');
                CAD.drawVector(ctx, tx, ty, vx * 0.2, vy * 0.2, CAD.COLORS.vectorVel, 'v(t)');
            }
        }

        CAD.drawFixedPivot(ctx, xO, yO, 7, 'Hombro');
        CAD.drawPin(ctx, xE, yE, 5, 'Codo');
        CAD.drawPin(ctx, xW, yW, 5, 'Muñeca');
        CAD.drawPin(ctx, xH, yH, 5, 'Espuela');
        CAD.drawCallout(ctx, (xW + xH) / 2, (yW + yH) / 2, 110, 125, 'Propulsor átlatl (+58 cm)', 'right');
        CAD.drawCallout(ctx, 510, 155, 510, 90, 'Trayectoria balística real (v₀ ≈ 38 m/s)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            cyc < rel ? '1. Aceleración y pandeo elástico del dardo' : '2. Liberación y vuelo balístico',
            cyc < rel ? 'El propulsor extiende el brazo humano; el dardo flecta almacenando energía elástica antes de desprenderse.'
                      : 'La restitución elástica empuja el dardo fuera de la espuela cuadruplicando su energía cinética.');
    };

    // 39. BALLESTA DE REPETICIÓN ZHUGE NU
    R.chinese_repeating_crossbow = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = theta / (Math.PI * 2);
        const cocking = cyc < 0.65, pull = cocking ? cyc / 0.65 : 0;
        const stringX = 390 - pull * 125;

        CAD.drawGroundSupport(ctx, 210, 440, 150, 12);
        CAD.drawTimberBeam(ctx, 145, 285, 480, 285, 20, schematic);
        const bend = pull * 32;
        CAD.drawElasticBeam(ctx, 465, 145, 465, 395, bend, 10, CAD.COLORS.woodDark);

        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(465 - bend * 0.4, 145); ctx.lineTo(stringX, 265); ctx.lineTo(465 - bend * 0.4, 395); ctx.stroke();

        CAD.drawHatchRect(ctx, stringX - 24, 195, 125, 56, CAD.COLORS.woodMid, 10);
        CAD.drawLink(ctx, 185, 285, stringX + 42, 220, 10, 'brass', schematic);
        CAD.drawFixedPivot(ctx, 185, 285, 6);

        if (!cocking) {
            const bx = 460 + ((cyc - 0.65) / 0.35) * 265;
            CAD.drawLink(ctx, bx - 52, 265, bx, 265, 5, 'iron', schematic);
            CAD.drawVector(ctx, bx, 265, 50, 0, CAD.COLORS.vectorVel, '42 m/s');
        }

        CAD.drawCallout(ctx, stringX + 38, 195, 265, 95, 'Cargador por gravedad (10 virotes)', 'right');
        CAD.drawCallout(ctx, 465, 145, 550, 105, 'Arco compuesto bajo flexión', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            cocking ? '1. Retroceso de palanca: carga virote y tensa arco' : '2. Tope delantero: disparo automático',
            'Un único movimiento alternativo realiza el ciclo completo de enganchar, alimentar y liberar el proyectil.');
    };

    // 40. ESTÁTICA DE LA CATEDRAL GÓTICA
    R.gothic_cathedral = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const wPin = 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(theta));
        const shift = (1 - wPin) * 34;

        CAD.drawGroundSupport(ctx, 400, 480, 660, 12);
        CAD.drawMasonry(ctx, 155, 200, 80, 280); // Estribo exterior
        CAD.drawMasonry(ctx, 375, 230, 42, 250); // Pilar interior de la nave

        // Pináculo de lastre vertical arriba del estribo
        ctx.fillStyle = '#d4d4d8'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(160, 200); ctx.lineTo(195, 110 - wPin * 30); ctx.lineTo(230, 200); ctx.closePath(); ctx.fill(); ctx.stroke();

        // Bóveda ojival + arbotante inclinado
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 13;
        ctx.beginPath(); ctx.moveTo(396, 235); ctx.quadraticCurveTo(450, 120, 520, 105); ctx.quadraticCurveTo(590, 120, 644, 235); ctx.stroke();
        CAD.drawMasonry(ctx, 624, 235, 40, 245);
        CAD.drawTimberBeam(ctx, 396, 235, 235, 282, 16, true);

        // Línea de empujes resultante (en rojo) dentro del tercio medio del estribo
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(520, 105); ctx.quadraticCurveTo(450, 160, 396, 235);
        ctx.lineTo(235, 282); ctx.lineTo(195 + shift, 480); ctx.stroke();

        CAD.drawVector(ctx, 235, 282, -45, 15, CAD.COLORS.vectorForce, 'Empuje H');
        CAD.drawVector(ctx, 195, 200, 0, 48 + wPin * 45, CAD.COLORS.vectorThrust, 'Peso pináculo');
        CAD.drawCallout(ctx, 195, 130, 275, 95, 'Pináculo (desvía el empuje hacia abajo)', 'left');
        CAD.drawCallout(ctx, 315, 258, 300, 180, 'Arbotante transmite H al exterior', 'right');

        CAD.drawPhaseCaption(ctx, w, h,
            shift < 25 ? 'Estabilidad estructural: línea dentro del tercio medio' : 'Pináculo liviano: empuje se acerca al borde',
            'El peso vertical del pináculo gira hacia el suelo el vector de empuje horizontal proveniente de la bóveda.');
    };

    // 41. PUENTE COLGANTE Q'ESWACHAKA
    R.inca_suspension_bridge = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xA = 115, xB = 685, yAnch = 175, loadPos = theta / (Math.PI * 2);
        const xLoad = xA + loadPos * (xB - xA);

        CAD.drawGroundSupport(ctx, 400, 480, 680, 12);
        CAD.drawMasonry(ctx, 40, 175, 85, 305);
        CAD.drawMasonry(ctx, 675, 175, 85, 305);

        function yCable(x) {
            const u = (x - xA) / (xB - xA);
            const dist = Math.abs(x - xLoad);
            return yAnch + 74 * 4 * u * (1 - u) + 26 * Math.exp(-(dist * dist) / (75 * 75));
        }

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = xA; x <= xB; x += 6) {
            if (x === xA) ctx.moveTo(x, yCable(x)); else ctx.lineTo(x, yCable(x));
        }
        ctx.stroke();

        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let x = xA; x <= xB; x += 15) {
            const yy = yCable(x) + 30;
            if (x === xA) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();

        for (let x = xA + 30; x < xB; x += 35) {
            ctx.strokeStyle = '#a1a1aa'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(x, yCable(x)); ctx.lineTo(x, yCable(x) + 30); ctx.stroke();
        }

        const yL = yCable(xLoad) + 30;
        CAD.drawHatchRect(ctx, xLoad - 14, yL - 20, 28, 20, CAD.COLORS.brassMid, 5);
        CAD.drawVector(ctx, xLoad, yL, 0, 52, '#dc2626', 'Carga P');
        CAD.drawFixedPivot(ctx, xA, yAnch, 6, 'Estribo 1');
        CAD.drawFixedPivot(ctx, xB, yAnch, 6, 'Estribo 2');

        CAD.drawPhaseCaption(ctx, w, h, 'Equilibrio funicular por tracción pura',
            'Los cables trenzados de ichu adaptan su catenaria al paso de la carga trabajando únicamente a tracción axial.');
    };

    // 42. MATRIZ MNEMOTÉCNICA DECIMAL DE QUIPU
    R.inca_quipu_memory = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const vals = [243, 135, Math.round(112 + 120 * (0.5 + 0.5 * Math.cos(theta))), 308];
        const sumTotal = vals.reduce((a, b) => a + b, 0);

        CAD.drawTimberBeam(ctx, 110, 125, 690, 125, 10, schematic);
        CAD.drawPin(ctx, 110, 125, 5, 'Cuerda principal');

        vals.forEach((v, idx) => {
            const cx = 195 + idx * 115;
            const c = Math.floor(v / 100), d = Math.floor((v % 100) / 10), u = v % 10;
            ctx.strokeStyle = idx === 2 ? '#0b4f8c' : CAD.COLORS.woodDark; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx, 125); ctx.lineTo(cx, 425); ctx.stroke();

            for (let i = 0; i < c; i++) CAD.drawPin(ctx, cx, 185 + i * 11, 4.5);
            for (let i = 0; i < d; i++) CAD.drawPin(ctx, cx, 275 + i * 10, 4.2);
            if (u > 0) CAD.drawHatchRect(ctx, cx - 7, 365, 14, 10 + u * 3.5, CAD.COLORS.brassMid, 4);

            ctx.fillStyle = CAD.COLORS.ink; ctx.font = '600 12px monospace'; ctx.textAlign = 'center';
            ctx.fillText(String(v).padStart(3, '0'), cx, 450);
        });

        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(655, 125); ctx.lineTo(655, 365); ctx.stroke();
        ctx.fillStyle = '#dc2626'; ctx.font = '600 13px monospace'; ctx.textAlign = 'center';
        ctx.fillText('Σ = ' + sumTotal, 655, 392);

        ctx.fillStyle = CAD.COLORS.inkSoft; ctx.font = '11px monospace'; ctx.textAlign = 'left';
        ctx.fillText('100×', 75, 195); ctx.fillText('10×', 75, 285); ctx.fillText('1×', 75, 378);
        CAD.drawCallout(ctx, 655, 230, 560, 82, 'Cuerda totalizadora (Checksum)', 'right');

        CAD.drawPhaseCaption(ctx, w, h, 'Codificación decimal posicional por nudos',
            'Los grupos verticales representan centenas, decenas y unidades; la cuerda derecha verifica la suma total (' + sumTotal + ').');
    };

})(window.MACHINE_RENDERERS);
