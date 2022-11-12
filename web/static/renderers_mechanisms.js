/**
 * Mechanica Antiqua - Renderizadores CAD 2D (Parte 1: Mecanismos Clásicos, Bombas y Vapor)
 * Todos los mecanismos se resuelven paramétricamente desde theta en coordenadas exactas.
 */

window.MACHINE_RENDERERS = window.MACHINE_RENDERERS || {};

(function(R) {
    'use strict';

    // Utilidad para biela-manivela vertical u horizontal acoplado exactamente
    function solveSliderY(xO, yO, r, theta, L, xSlide, above) {
        const xA = xO + r * Math.cos(theta);
        const yA = yO + r * Math.sin(theta);
        const dx = xSlide - xA;
        const dy = Math.sqrt(Math.max(100, L * L - dx * dx));
        const yB = above ? (yA - dy) : (yA + dy);
        return { xA, yA, xB: xSlide, yB };
    }

    // 1. ASERRADERO DE MARTINI
    R.martini_hydraulic_sawmill = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'ASERRADERO HIDRÁULICO DE MARTINI (c. 1480)',
            'Biela-Manivela-Corredera Vertical | F = 1 | λ = r/L = 0.20', schematic);

        const xO = 210, yO = 400, r = 52, L = 250, xB = 475;
        const kin = solveSliderY(xO, yO, r, theta, L, xB, true);

        // Ejes de simetría ISO
        CAD.drawCenterline(ctx, 60, yO, 360, yO);
        CAD.drawCenterline(ctx, xO, 250, xO, 510);
        CAD.drawCenterline(ctx, xB, 85, xB, 510);

        // Canal fluvial y bancada fija
        if (!schematic) {
            ctx.fillStyle = CAD.COLORS.water;
            ctx.fillRect(35, 485, 310, 45);
            CAD.drawFluidParticles(ctx, 45, 505, 330, 505, theta, true);
        }
        CAD.drawGroundSupport(ctx, xO, 485, 70, 14);
        CAD.drawGroundSupport(ctx, xB, 495, 130, 14, 'Bastidor fijo');

        // Columnas guía del bastidor de sierra (Par prismático P)
        CAD.drawTimberBeam(ctx, 425, 115, 425, 495, 16, schematic);
        CAD.drawTimberBeam(ctx, 525, 115, 525, 495, 16, schematic);
        CAD.drawTimberBeam(ctx, 415, 112, 535, 112, 16, schematic);

        // Rueda hidráulica + brazo manivela
        CAD.drawWaterwheel(ctx, xO, yO, 108, 12, theta, schematic);
        CAD.drawLink(ctx, xO, yO, kin.xA, kin.yA, 15, 'iron', schematic);

        // Marco deslizante de la sierra (Eslabón 4)
        const frameTop = kin.yB - 185;
        CAD.drawTimberBeam(ctx, 438, frameTop, 512, frameTop, 10, schematic);
        CAD.drawTimberBeam(ctx, 438, kin.yB, 512, kin.yB, 12, schematic);
        CAD.drawTimberBeam(ctx, 438, frameTop, 438, kin.yB, 9, schematic);
        CAD.drawTimberBeam(ctx, 512, frameTop, 512, kin.yB, 9, schematic);

        // Hoja de sierra dentada centrada en xB
        ctx.save();
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(xB, frameTop + 5);
        ctx.lineTo(xB, kin.yB - 5);
        ctx.stroke();
        ctx.strokeStyle = '#962b23';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let yy = frameTop + 18; yy < kin.yB - 16; yy += 14) {
            ctx.moveTo(xB + 2, yy); ctx.lineTo(xB + 8, yy + 5); ctx.lineTo(xB + 2, yy + 10);
        }
        ctx.stroke();
        ctx.restore();

        // Carro porta-tronco con avance sincronizado
        const feedShift = (theta / (Math.PI * 2)) * 24;
        const logX = 490 - feedShift;
        if (!schematic) {
            ctx.fillStyle = '#d4a373';
            ctx.strokeStyle = CAD.COLORS.woodDark;
            ctx.lineWidth = 2;
            ctx.fillRect(logX, 240, 230, 42);
            ctx.strokeRect(logX, 240, 230, 42);
            // Corte longitudinal
            ctx.strokeStyle = CAD.COLORS.ink;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(logX, 261); ctx.lineTo(xB, 261); ctx.stroke();
        }
        CAD.drawTimberBeam(ctx, 480, 290, 740, 290, 10, schematic);

        // Biela acopladora AB exactamente unida a A y B
        CAD.drawLink(ctx, kin.xA, kin.yA, kin.xB, kin.yB, 11, 'brass', schematic);

        // Pares de revolución O2, A, B
        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');
        CAD.drawPin(ctx, kin.xA, kin.yA, 7, 'A');
        CAD.drawPin(ctx, kin.xB, kin.yB, 7, 'B');

        // Vectores dinámicos (Velocidad de corte v_B)
        const vY = k.vMs * 35;
        CAD.drawVector(ctx, xB + 24, kin.yB - 90, 0, vY, CAD.COLORS.vectorVel, 'v_sierra');

        // Cotas técnicas
        CAD.drawDimension(ctx, xO, yO, kin.xA, kin.yA, 'r = 150', -16);
        CAD.drawDimension(ctx, 565, 185, 565, 290, 'S = 300 mm', 0);
        CAD.drawNoteBox(ctx, 35, 80, 235, 'DATOS DE SÍNTESIS', [
            'L_biela = 750 mm (λ = 0.20)',
            'Régimen nominal: 45 rpm',
            'Ángulo φ = ' + k.phiDeg.toFixed(1) + '°'
        ]);
    };

    // 2. BOMBA DE SUCCIÓN DE AGRÍCOLA
    R.agricola_suction_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'BOMBA DE SUCCIÓN MINERA DE AGRÍCOLA (1556)',
            'Biela-Manivela en Línea Vertical | Carrera S = 350 mm | Ø 180 mm', schematic);

        const xO = 400, yO = 155, r = 46, L = 140;
        const kin = solveSliderY(xO, yO, r, theta, L, xO, false);
        const yPiston = kin.yB + 110;
        const vDown = Math.cos(theta) * 0 + Math.sin(theta); // Derivada vertical: yB crece con sin(theta) aprox -> v_down ~ cos(theta)
        const suctionStroke = Math.cos(theta) < 0; // Pistón sube => aspiración

        CAD.drawCenterline(ctx, 280, yO, 520, yO);
        CAD.drawCenterline(ctx, xO, 85, xO, 540);

        // Pozo inferior y nivel freático
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(280, 480, 240, 70);
        CAD.drawGroundSupport(ctx, 250, 480, 60, 70);
        CAD.drawGroundSupport(ctx, 550, 480, 60, 70);

        // Camisa de cilindro de madera / hierro en corte
        CAD.drawCylinder(ctx, 355, 270, 90, 200, 14, 'wood', schematic);
        // Agua dentro del cilindro bajo y sobre el émbolo
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(356, yPiston + 10, 88, 470 - (yPiston + 10));
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(356, 285, 88, Math.max(0, yPiston - 285));

        // Tubo de descarga lateral
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(445, 285, 115, 18);
        CAD.drawFluidParticles(ctx, 448, 294, 560, 294, theta * 2, suctionStroke, '#ffffff');

        // Válvula de retención inferior (Pie de bomba) y válvula en el émbolo
        CAD.drawCheckValve(ctx, 375, 470, 42, suctionStroke ? 0.9 : 0.0, 0);
        CAD.drawFluidParticles(ctx, xO, 520, xO, 430, theta * 2, suctionStroke);

        // Émbolo y vástago rígido vertical
        CAD.drawLink(ctx, xO, kin.yB, xO, yPiston, 10, 'iron', schematic);
        CAD.drawPiston(ctx, xO, yPiston, 84, 24, schematic);
        CAD.drawCheckValve(ctx, xO - 14, yPiston - 12, 28, !suctionStroke ? 0.85 : 0.0, 0);

        // Manivela, contrapeso y biela AB acoplada
        CAD.drawGear(ctx, xO, yO, 68, 20, theta, 'wood', schematic);
        CAD.drawLink(ctx, xO, yO, kin.xA, kin.yA, 14, 'iron', schematic);
        CAD.drawLink(ctx, kin.xA, kin.yA, kin.xB, kin.yB, 11, 'brass', schematic);

        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');
        CAD.drawPin(ctx, kin.xA, kin.yA, 7, 'A');
        CAD.drawPin(ctx, kin.xB, kin.yB, 7, 'B');

        CAD.drawDimension(ctx, 355, 250, 445, 250, 'Ø 180 mm', 0);
        CAD.drawDimension(ctx, 480, 320, 480, 412, 'S = 350 mm', 0);
        CAD.drawNoteBox(ctx, 35, 85, 225, 'HIDRÁULICA DE POZO', [
            'Límite aspiración ≤ 7.5 m',
            'Estado: ' + (suctionStroke ? 'ASPIRACIÓN (V_pie abierta)' : 'DESCARGA (V_émbolo abierta)'),
            'Caudal nominal: 222.6 L/min'
        ]);
    };

    // 3. BOMBA DE PISTÓN CON BALANCÍN DE MARTINI
    R.martini_piston_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'BOMBA DÚPLEX DE BALANCÍN DE MARTINI (c. 1480)',
            'Cadena de 6 Eslabones: Manivela-Balancín + Doble Émbolo Opuesto', schematic);

        const xO2 = 175, yO2 = 340, r = 42;
        const xA = xO2 + r * Math.cos(theta);
        const yA = yO2 + r * Math.sin(theta);

        // Balancín oscilante centrado en O4(470, 175)
        const xO4 = 470, yO4 = 175;
        const psi = 0.24 * Math.sin(theta); // Ángulo oscilación balancín
        const armL = 140;
        const xLeft = xO4 - armL * Math.cos(psi);
        const yLeft = yO4 - armL * Math.sin(psi);
        const xRight = xO4 + armL * Math.cos(psi);
        const yRight = yO4 + armL * Math.sin(psi);

        CAD.drawCenterline(ctx, 80, yO2, 260, yO2);
        CAD.drawCenterline(ctx, xO4, 90, xO4, 490);
        CAD.drawCenterline(ctx, xO4 - armL, 120, xO4 - armL, 480);
        CAD.drawCenterline(ctx, xO4 + armL, 120, xO4 + armL, 480);

        // Cilindros gemelos derecho e izquierdo
        const yP1 = yLeft + 150;
        const yP2 = yRight + 150;
        CAD.drawCylinder(ctx, xO4 - armL - 36, 290, 72, 160, 10, 'brass', schematic);
        CAD.drawCylinder(ctx, xO4 + armL - 36, 290, 72, 160, 10, 'brass', schematic);

        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(xO4 - armL - 35, yP1, 70, 450 - yP1);
        ctx.fillRect(xO4 + armL - 35, yP2, 70, 450 - yP2);

        const leftUp = Math.cos(theta) < 0;
        CAD.drawCheckValve(ctx, xO4 - armL - 15, 450, 30, leftUp ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, xO4 + armL - 15, 450, 30, !leftUp ? 0.9 : 0, 0);

        // Bielas y pistones
        CAD.drawLink(ctx, xLeft, yLeft, xO4 - armL, yP1, 8, 'iron', schematic);
        CAD.drawLink(ctx, xRight, yRight, xO4 + armL, yP2, 8, 'iron', schematic);
        CAD.drawPiston(ctx, xO4 - armL, yP1, 68, 20, schematic);
        CAD.drawPiston(ctx, xO4 + armL, yP2, 68, 20, schematic);

        // Transmisión manivela -> biela -> balancín
        CAD.drawWaterwheel(ctx, xO2, yO2, 75, 10, theta, schematic);
        CAD.drawLink(ctx, xO2, yO2, xA, yA, 12, 'iron', schematic);
        CAD.drawLink(ctx, xA, yA, xLeft, yLeft, 10, 'brass', schematic);
        CAD.drawTimberBeam(ctx, xLeft - 15, yLeft - 3, xRight + 15, yRight + 3, 16, schematic);

        CAD.drawFixedPivot(ctx, xO2, yO2, 7, 'O₂');
        CAD.drawFixedPivot(ctx, xO4, yO4, 9, 'O₄');
        CAD.drawPin(ctx, xA, yA, 6, 'A');
        CAD.drawPin(ctx, xLeft, yLeft, 6, 'B₁');
        CAD.drawPin(ctx, xRight, yRight, 6, 'B₂');

        CAD.drawNoteBox(ctx, 35, 80, 235, 'BALANCÍN SIMÉTRICO', [
            'Desfase cilindros: 180°',
            'Inclinación ψ: ' + (psi * 180 / Math.PI).toFixed(1) + '°',
            'Caudal nominal: 192 L/min'
        ]);
    };

    // 4. BOMBA BICILÍNDRICA DE AL-JAZARI (SCOTCH YOKE)
    R.al_jazari_suction_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'BOMBA BICILÍNDRICA DE AL-JAZARI (1206)',
            'Yugo Escocés (Scotch Yoke) | x(θ) = R·cos(θ) [Armónico Puro] | F = 1', schematic);

        const xO = 400, yO = 365, r = 52;
        const xA = xO + r * Math.cos(theta);
        const yA = yO + r * Math.sin(theta);
        const xYoke = xA; // El marco vertical sigue exactamente la coordenada X del muñón A!
        const movingRight = Math.sin(theta) < 0; // dx/dtheta = -r sin(theta)

        CAD.drawCenterline(ctx, 70, 210, 730, 210);
        CAD.drawCenterline(ctx, xO, 70, xO, 510);

        // Colector superior y tubo de descarga al aljibe
        ctx.strokeStyle = CAD.COLORS.copperDark;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(150, 170); ctx.lineTo(150, 115); ctx.lineTo(650, 115); ctx.lineTo(650, 170);
        ctx.moveTo(400, 115); ctx.lineTo(400, 72);
        ctx.stroke();

        // Fluido subiendo al aljibe
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(396, 72, 8, 45);
        CAD.drawFluidParticles(ctx, 400, 115, 400, 72, theta * 2, true, '#ffffff');

        // Cilindros opuestos horizontales en corte
        // Cilindro izquierdo (x: 110..270, y: 170..250)
        CAD.drawCylinder(ctx, 110, 170, 160, 80, 10, 'copper', schematic);
        // Cilindro derecho (x: 530..690, y: 170..250)
        CAD.drawCylinder(ctx, 530, 170, 160, 80, 10, 'copper', schematic);

        const xPistL = xYoke - 190;
        const xPistR = xYoke + 190;
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(111, 172, Math.max(0, xPistL - 111), 76);
        ctx.fillRect(xPistR + 12, 172, Math.max(0, 689 - (xPistR + 12)), 76);

        // Válvulas de aspiración/impulsión sincronizadas
        CAD.drawCheckValve(ctx, 138, 170, 24, !movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 138, 250, 24, movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 640, 170, 24, movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 640, 250, 24, !movingRight ? 0.9 : 0, 0);

        // Rueda motriz hidráulica + engrane linterna inferior
        CAD.drawWaterwheel(ctx, xO, yO, 98, 12, theta, schematic);
        CAD.drawGear(ctx, xO, yO, 68, 20, theta, 'brass', schematic);

        // Marco vertical del Yugo Escocés (contiene SIEMPRE al muñón A entre y=300 y y=430)
        ctx.save();
        ctx.fillStyle = '#faf8f3';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3;
        ctx.fillRect(xYoke - 15, 298, 30, 134);
        ctx.strokeRect(xYoke - 15, 298, 30, 134);
        ctx.fillStyle = '#e9e3d5';
        ctx.fillRect(xYoke - 8, 305, 16, 120);
        ctx.restore();

        // Vástago horizontal unificado
        CAD.drawLink(ctx, xPistL, 210, xPistR, 210, 12, 'iron', schematic);
        CAD.drawLink(ctx, xYoke, 210, xYoke, 300, 12, 'iron', schematic);

        // Pistones opuestos
        CAD.drawPiston(ctx, xPistL, 210, 24, 72, schematic);
        CAD.drawPiston(ctx, xPistR, 210, 24, 72, schematic);

        // Brazo excéntrico + muñón deslizante A dentro de la ranura
        CAD.drawLink(ctx, xO, yO, xA, yA, 12, 'brass', schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');
        CAD.drawPin(ctx, xA, yA, 7, 'A');

        CAD.drawDimension(ctx, xO - r, 455, xO + r, 455, 'S = 2R = 320 mm', 0);
        CAD.drawNoteBox(ctx, 35, 440, 255, 'CINEMÁTICA YUGO ESCOCÉS', [
            'x(θ) = R · cos(θ) [Armónico exacto]',
            'Cámara Izq: ' + (movingRight ? 'ASPIRA' : 'IMPULSA'),
            'Cámara Der: ' + (movingRight ? 'IMPULSA' : 'ASPIRA')
        ]);
    };

    // 5-7. MOLINOS DE LEVAS GRAVITATORIOS (Agricola Stamp Mill, Zonca Stamping Mill, Zonca Paper Mill)
    function renderCamBattery(ctx, w, h, theta, title, subtitle, isTiltHammer, schematic) {
        CAD.clearAndGrid(ctx, w, h, title, subtitle, schematic);

        const xCam = 250, yCam = 350;
        CAD.drawCenterline(ctx, 110, yCam, 680, yCam);
        CAD.drawCenterline(ctx, xCam, 200, xCam, 480);

        // Rueda hidráulica y engrane motriz
        CAD.drawWaterwheel(ctx, 130, yCam, 95, 12, theta, schematic);
        CAD.drawGear(ctx, 130, yCam, 55, 18, theta, 'wood', schematic);
        CAD.drawGear(ctx, xCam, yCam, 36, 12, -theta * 1.5, 'brass', schematic);

        // Artesa / mortero inferior
        CAD.drawGroundSupport(ctx, 510, 490, 260, 16);
        ctx.fillStyle = isTiltHammer ? 'rgba(203, 213, 225, 0.8)' : '#a8a29e';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2;
        ctx.fillRect(380, 435, 250, 55);
        ctx.strokeRect(380, 435, 250, 55);

        const numUnits = 3;
        for (let i = 0; i < numUnits; i++) {
            const phase = (theta + (i * 2 * Math.PI) / 3) % (Math.PI * 2);
            const liftNorm = (phase < Math.PI * 1.4) ? (phase / (Math.PI * 1.4)) : Math.max(0, 1 - Math.pow((phase - Math.PI * 1.4) / 0.6, 2));
            const sx = 420 + i * 75;

            // Leva rotativa en el árbol común
            ctx.save();
            ctx.translate(sx, yCam);
            ctx.rotate(phase);
            ctx.fillStyle = CAD.COLORS.brassMid;
            ctx.strokeStyle = CAD.COLORS.ink;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(0, -14);
            ctx.lineTo(38, -8);
            ctx.arc(0, 0, 38, -0.2, 0.25);
            ctx.lineTo(0, 14);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            if (isTiltHammer) {
                // Mazos basculantes pivotando en fulcro posterior (x=660, y=380)
                const fulcrumX = 665, fulcrumY = 390;
                const ang = 0.22 * liftNorm;
                const tipX = sx - 10;
                const tipY = 430 - liftNorm * 65;
                CAD.drawTimberBeam(ctx, fulcrumX, fulcrumY, tipX, tipY - 25, 14, schematic);
                // Cabeza del mazo batidor
                CAD.drawHatchRect(ctx, tipX - 16, tipY - 35, 32, 42, CAD.COLORS.woodMid, 8);
                CAD.drawFixedPivot(ctx, fulcrumX, fulcrumY, 6);
            } else {
                // Pilón guiado vertical
                const baseY = 434 - liftNorm * 68;
                CAD.drawTimberBeam(ctx, sx, baseY - 230, sx, baseY - 25, 14, schematic);
                // Zapato de hierro
                CAD.drawHatchRect(ctx, sx - 16, baseY - 35, 32, 35, CAD.COLORS.ironMid, 6);
                // Lengüeta taqué donde apoya la leva
                ctx.fillStyle = CAD.COLORS.brassMid;
                ctx.fillRect(sx - 34, baseY - 115, 22, 14);
                ctx.strokeRect(sx - 34, baseY - 115, 22, 14);
            }
        }
        // Eje horizontal del árbol de levas
        CAD.drawLink(ctx, xCam - 10, yCam, 610, yCam, 14, 'wood', schematic);
        CAD.drawFixedPivot(ctx, xCam, yCam, 7, 'O₂');
        CAD.drawDimension(ctx, 645, 366, 645, 434, 'h = 320 mm', 0);
    }

    R.agricola_stamp_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta,
            'BOCARTE DE LEVAS DE AGRÍCOLA (1556)',
            '3 Pilones Desfasados 120° | Caída Libre Gravitatoria (v_imp = 2.51 m/s)', false, schematic);
    };
    R.zonca_stamping_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta,
            'MOLINO DE BATANADO TEXTIL DE ZONCA (1607)',
            'Batería de Mazos Verticales por Levas Escalonadas | Energía = 153 J/golpe', false, schematic);
    };
    R.zonca_paper_mill = function(ctx, w, h, theta, k, schematic) {
        renderCamBattery(ctx, w, h, theta,
            'MOLINO PAPELERO DE ZONCA (1607)',
            'Mazos Basculantes en Tina de Pulpa | 55 golpes/min', true, schematic);
    };

    // 8. ASERRADERO CON PÉRTIGA ELÁSTICA DE VILLARD DE HONNECOURT
    R.villard_sawmill = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'ASERRADERO CON RETORNO ELÁSTICO DE VILLARD (c. 1230)',
            'Leva de 4 Lóbulos + Viga en Voladizo Euler-Bernoulli (F_resorte = 3EI/L³ · δ)', schematic);

        const xCam = 350, yCam = 430;
        const phase = (theta * 2) % (Math.PI * 2); // 4 golpes por revolución
        const depress = (phase < Math.PI * 1.3) ? (phase / (Math.PI * 1.3)) : Math.max(0, 1 - Math.pow((phase - Math.PI * 1.3) / 0.8, 2));
        const stroke = depress * 65;

        CAD.drawCenterline(ctx, 180, yCam, 480, yCam);
        CAD.drawCenterline(ctx, 480, 100, 480, 520);

        // Bastidor fijo y empotramiento de la pértiga de fresno en x=140, y=135
        CAD.drawGroundSupport(ctx, 140, 165, 60, 20, 'Empotramiento');
        CAD.drawHatchRect(ctx, 110, 120, 60, 45, CAD.COLORS.woodDark, 8);

        // Pértiga flexible superior (Euler-Bernoulli deflection!)
        const tipX = 480;
        const tipY = 135 + stroke;
        CAD.drawElasticBeam(ctx, 170, 140, tipX, tipY, stroke * 0.45, 11, CAD.COLORS.woodMid);

        // Cuerda vertical tensada + Hoja de sierra guiada
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX, tipY + 50); ctx.stroke();

        // Hoja de sierra bajando contra la leva
        const sawTop = tipY + 50;
        const sawBot = sawTop + 170;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(tipX, sawTop); ctx.lineTo(tipX, sawBot); ctx.stroke();

        // Tronco horizontal bajo corte
        ctx.fillStyle = '#d4a373';
        ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.fillRect(500, 260, 200, 45);
        ctx.strokeRect(500, 260, 200, 45);

        // Rueda hidráulica + eje de 4 levas
        CAD.drawWaterwheel(ctx, xCam, yCam, 82, 8, theta, schematic);
        ctx.save();
        ctx.translate(xCam, yCam);
        ctx.rotate(theta);
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = CAD.COLORS.brassMid;
            ctx.fillRect(60, -7, 45, 14);
            ctx.strokeRect(60, -7, 45, 14);
        }
        ctx.restore();
        CAD.drawFixedPivot(ctx, xCam, yCam, 8, 'O₂');
        CAD.drawPin(ctx, tipX, tipY, 5, 'Punta δ');

        CAD.drawDimension(ctx, 540, 135, 540, 200, 'δ_max = 220 mm', 0);
        CAD.drawNoteBox(ctx, 35, 220, 215, 'RESTITUCIÓN ELÁSTICA', [
            'Viga fresno L = 2.8 m',
            'Deflexión δ = ' + (depress * 220).toFixed(0) + ' mm',
            'F_elástica = ' + (depress * 680).toFixed(0) + ' N'
        ]);
    };

    // 9. RUEDA DE LECTURA DE RAMELLI (TREN EPICICLOIDAL)
    R.ramelli_book_wheel = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'RUEDA DE LECTURA DE RAMELLI (1588)',
            'Tren Epicicloidal Planetario Invariante (i = 0 ⇒ θ_atril ≡ 0°)', schematic);

        const cx = 400, cy = 310, rDrum = 155;
        CAD.drawCenterline(ctx, 180, cy, 620, cy);
        CAD.drawCenterline(ctx, cx, 100, cx, 535);

        // Bastidor de soporte inferior
        CAD.drawTimberBeam(ctx, cx - 120, 515, cx, cy, 18, schematic);
        CAD.drawTimberBeam(ctx, cx + 120, 515, cx, cy, 18, schematic);
        CAD.drawGroundSupport(ctx, cx, 515, 290, 14);

        // Tambor portador giratorio
        ctx.save();
        ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.lineWidth = schematic ? 2 : 12;
        ctx.beginPath(); ctx.arc(cx, cy, rDrum, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        // Sol central FIJO (Z1 = 24)
        CAD.drawGear(ctx, cx, cy, 34, 18, 0, 'brass', schematic);

        const numDesks = 8;
        for (let i = 0; i < numDesks; i++) {
            const ang = theta + (i * Math.PI * 2) / numDesks;
            // Engranaje intermedio inversor a r = 68
            const ix = cx + 68 * Math.cos(ang);
            const iy = cy + 68 * Math.sin(ang);
            CAD.drawGear(ctx, ix, iy, 22, 12, -ang * 1.5, 'iron', schematic);

            // Brazo radial del portador
            CAD.drawLink(ctx, cx, cy, cx + rDrum * Math.cos(ang), cy + rDrum * Math.sin(ang), 8, 'wood', schematic);

            // Planeta en atril a r = 112 y atril en rDrum (155)
            const px = cx + rDrum * Math.cos(ang);
            const py = cy + rDrum * Math.sin(ang);
            CAD.drawGear(ctx, px, py, 24, 14, 0, 'brass', schematic);

            // ATRIL SIEMPRE HORIZONTAL (rotación neta = 0 rad)
            ctx.save();
            ctx.translate(px, py);
            // Atril inclinado fijo para lectura + códice abierto
            ctx.fillStyle = CAD.COLORS.woodMid;
            ctx.strokeStyle = CAD.COLORS.ink;
            ctx.lineWidth = 1.6;
            ctx.fillRect(-24, 8, 48, 8);
            ctx.strokeRect(-24, 8, 48, 8);
            // Libro abierto nivelado
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#991b1b';
            ctx.fillRect(-20, -8, 19, 16);
            ctx.strokeRect(-20, -8, 19, 16);
            ctx.fillRect(1, -8, 19, 16);
            ctx.strokeRect(1, -8, 19, 16);
            ctx.restore();

            CAD.drawPin(ctx, px, py, 4);
        }
        CAD.drawFixedPivot(ctx, cx, cy, 8, 'O₂ (Sol Fijo)');
        CAD.drawNoteBox(ctx, 35, 85, 225, 'LEY EPICICLOIDAL', [
            'Z_sol = Z_atril = 24',
            'Ángulo absoluto atril: 0.0°',
            'N° de volúmenes: 8 códices'
        ]);
    };

    // 10. BOMBA ROTATIVA DE PALETAS DE RAMELLI
    R.ramelli_rotary_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'BOMBA ROTATIVA DE PALETAS DE RAMELLI (1588)',
            'Rotor Excéntrico (e = 35 mm) con 4 Paletas Deslizantes Contínuas', schematic);

        const cx = 400, cy = 300, Rst = 140, e = 36;
        const rRotY = cy + e;
        const rRotor = Rst - e - 4;

        CAD.drawCenterline(ctx, 180, cy, 620, cy);
        CAD.drawCenterline(ctx, cx, 110, cx, 510);

        // Estator cilíndrico con puertos de aspiración e impulsión
        CAD.drawGroundSupport(ctx, cx, 490, 260, 14);
        ctx.fillStyle = schematic ? '#fff' : '#e9e3d5';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, Rst + 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Cámara interior de fluido
        ctx.fillStyle = CAD.COLORS.water;
        ctx.beginPath(); ctx.arc(cx, cy, Rst, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Puertos de entrada (Izq) y descarga (Der)
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(135, 270, 130, 32);
        ctx.fillRect(535, 270, 130, 32);
        CAD.drawFluidParticles(ctx, 145, 286, 260, 286, theta * 2, true, '#ffffff');
        CAD.drawFluidParticles(ctx, 540, 286, 655, 286, theta * 2, true, '#ffffff');

        // Rotor excéntrico
        ctx.save();
        ctx.fillStyle = CAD.COLORS.ironMid;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, rRotY, rRotor, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();

        // 4 Paletas deslizantes cuya punta sigue exactamente la pared del estator!
        for (let i = 0; i < 4; i++) {
            const ang = theta + (i * Math.PI) / 2;
            const ux = Math.cos(ang), uy = Math.sin(ang);
            // Intersección del rayo desde (cx, cy + e) en dirección u con círculo (cx, cy, Rst):
            // |t*u + (0, e)|^2 = Rst^2 => t^2 + 2*e*uy*t + e^2 - Rst^2 = 0
            const b = e * uy;
            const tWall = -b + Math.sqrt(b * b + (Rst * Rst - e * e));
            const tipX = cx + tWall * ux;
            const tipY = rRotY + tWall * uy;
            const baseX = cx + (rRotor * 0.35) * ux;
            const baseY = rRotY + (rRotor * 0.35) * uy;

            CAD.drawLink(ctx, baseX, baseY, tipX, tipY, 10, 'brass', schematic);
            CAD.drawPin(ctx, tipX, tipY, 4);
        }

        CAD.drawPin(ctx, cx, cy, 5, 'O_est');
        CAD.drawFixedPivot(ctx, cx, rRotY, 8, 'O_rot');
        CAD.drawDimension(ctx, cx - 25, cy, cx - 25, rRotY, 'e = 35 mm', -45);
        CAD.drawNoteBox(ctx, 35, 85, 220, 'VOLUMETRÍA EXCÉNTRICA', [
            'Excentricidad e = 35 mm',
            '4 cámaras rotativas estancas',
            'Caudal nominal: 145 L/min'
        ]);
    };

    // 11. ENGRANAJE GLOBOIDAL DE LEONARDO
    R.leonardo_globoidal_gear = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'ENGRANAJE SIN FÍN GLOBOIDAL DE LEONARDO (1493)',
            'Tornillo Hiperboloide Envolvente | Contacto Multi-Diente Simultáneo | i = 30:1', schematic);

        const cx = 420, cy = 340, rWheel = 135;
        CAD.drawCenterline(ctx, 130, 185, 680, 185);
        CAD.drawCenterline(ctx, cx, 110, cx, 500);

        // Rueda dentada inferior girando lentamente (1/30 de theta)
        const wheelAng = theta / 8.0; // Amplificado visualmente para claridad manteniendo coherencia de fase
        CAD.drawGear(ctx, cx, cy, rWheel, 28, wheelAng, 'brass', schematic);
        CAD.drawFixedPivot(ctx, cx, cy, 10, 'O_rueda');

        // Tornillo sin fin globoidal superior (perfil cóncavo que abraza el radio rWheel!)
        const wormY = 185;
        ctx.save();
        ctx.fillStyle = CAD.COLORS.ironLight;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(270, wormY - 38);
        ctx.quadraticCurveTo(cx, wormY - 12, 570, wormY - 38);
        ctx.lineTo(570, wormY + 38);
        ctx.quadraticCurveTo(cx, wormY + 12, 270, wormY + 38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Filetes helicoidales avanzando axialmente según fase del engrane
        const shift = ((theta / (Math.PI * 2)) % 1) * 28;
        ctx.strokeStyle = CAD.COLORS.brassDark;
        ctx.lineWidth = 4;
        for (let x = 285 + shift; x < 555; x += 28) {
            const dx = (x - cx) / 140;
            const waist = 14 + 22 * dx * dx;
            ctx.beginPath();
            ctx.moveTo(x - 6, wormY - waist);
            ctx.lineTo(x + 6, wormY + waist);
            ctx.stroke();
        }
        ctx.restore();

        // Cojinetes extremos del tornillo
        CAD.drawFixedPivot(ctx, 250, wormY, 7, 'O₁');
        CAD.drawFixedPivot(ctx, 590, wormY, 7, 'O₂');
        CAD.drawVector(ctx, cx - 80, wormY - 50, 75, 0, CAD.COLORS.vectorForce, 'F_axial');
        CAD.drawNoteBox(ctx, 35, 380, 225, 'CONTACTO ENVOLVENTE', [
            'Reducción nominal: 30 : 1',
            '4 dientes simultáneos en carga',
            'Eficiencia estimada η ≈ 0.68'
        ]);
    };

    // 12. MÁQUINA ATMOSFÉRICA DE NEWCOMEN
    R.newcomen_newcomen_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'MÁQUINA ATMOSFÉRICA DE NEWCOMEN (1712)',
            'Balancín con Cabezas de Arco | Carrera Motriz por Vacío de Condensación | S = 1800 mm', schematic);

        const xO = 400, yO = 155, arm = 215;
        const psi = 0.19 * Math.sin(theta); // Oscilación del balancín
        const yArcCenter = yO;
        const dyChain = arm * psi; // Desplazamiento vertical exacto por arco de radio constante!
        const yPiston = 355 + dyChain;
        const yPumpRod = 465 - dyChain;
        const condensing = Math.cos(theta) > 0 && Math.sin(theta) > -0.2;

        CAD.drawCenterline(ctx, 185, 80, 185, 530);
        CAD.drawCenterline(ctx, 615, 80, 615, 540);
        CAD.drawCenterline(ctx, 110, yO, 690, yO);

        // Muro central de mampostería
        CAD.drawHatchRect(ctx, 372, 155, 56, 350, '#e9e3d5', 10);
        CAD.drawGroundSupport(ctx, xO, 505, 110, 14);

        // Lado izquierdo: Caldera Haystack y cilindro atmosférico
        ctx.fillStyle = CAD.COLORS.copperMid;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(185, 515, 52, Math.PI, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        CAD.drawCylinder(ctx, 145, 290, 80, 155, 10, 'iron', schematic);
        // Vapor / vacío interior
        ctx.fillStyle = condensing ? 'rgba(56, 189, 248, 0.25)' : 'rgba(226, 232, 240, 0.75)';
        ctx.fillRect(146, yPiston + 10, 78, 445 - (yPiston + 10));

        // Chorro frío de agua condensadora
        if (condensing) {
            CAD.drawFluidParticles(ctx, 110, 405, 185, 395, theta * 4, true, '#1d4968');
        }

        // Pistón de vapor + sello hidráulico superior
        CAD.drawPiston(ctx, 185, yPiston, 76, 22, schematic);
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(147, yPiston - 16, 76, 5);

        // Lado derecho: Pozo de mina y bomba
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(580, 355, 70, 175);
        CAD.drawCylinder(ctx, 580, 355, 70, 175, 8, 'wood', schematic);
        CAD.drawPiston(ctx, 615, yPumpRod, 64, 20, schematic);

        // Balancín oscilante con cabezas de arco exactas
        ctx.save();
        ctx.translate(xO, yO);
        ctx.rotate(psi);
        CAD.drawTimberBeam(ctx, -arm, 0, arm, 0, 18, schematic);
        // Cabezas de arco circulares radio = arm (215)
        ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(0, 0, arm, Math.PI - 0.32, Math.PI + 0.32); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, arm, -0.32, 0.32); ctx.stroke();
        ctx.restore();

        // Cadenas verticales tangentes siempre en x=185 y x=615!
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3.5;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(185, yO - 30); ctx.lineTo(185, yPiston - 10);
        ctx.moveTo(615, yO - 30); ctx.lineTo(615, yPumpRod - 10);
        ctx.stroke();
        ctx.setLineDash([]);

        CAD.drawFixedPivot(ctx, xO, yO, 9, 'O₂');
        CAD.drawPin(ctx, 185, yPiston, 5, 'C');
        CAD.drawPin(ctx, 615, yPumpRod, 5, 'D');
        CAD.drawDimension(ctx, 105, 315, 105, 395, 'S = 1800 mm', 0);
        CAD.drawNoteBox(ctx, 35, 85, 225, 'CICLO ATMOSFÉRICO', [
            'Cilindro Ø 533 mm (21")',
            'Carrera: ' + (condensing ? 'CONDENSACIÓN (Descenso)' : 'ADMISIÓN VAPOR'),
            'F_atm neta ≈ 18.2 kN'
        ]);
    };

    // 13. BOMBA DE CTESIBIO
    R.ctesibius_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'BOMBA ASPIRANTE-IMPELENTE DE CTESIBIO (s. III a.C.)',
            'Doble Cilindro en Contrafase + Cámara Neumática de Flujo Continuo', schematic);

        const xO = 400, yO = 145;
        const psi = 0.22 * Math.sin(theta);
        const arm = 120;
        const xL = xO - arm * Math.cos(psi), yL = yO - arm * Math.sin(psi);
        const xR = xO + arm * Math.cos(psi), yR = yO + arm * Math.sin(psi);
        const yPL = 340 - 30 * Math.sin(theta);
        const yPR = 340 + 30 * Math.sin(theta);
        const leftUp = Math.cos(theta) > 0;

        CAD.drawCenterline(ctx, xO, 70, xO, 510);
        // Depósito inferior sumergido
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(180, 440, 440, 90);

        // Cilindros izquierdo y derecho de bronce
        CAD.drawCylinder(ctx, xO - arm - 35, 290, 70, 150, 9, 'brass', schematic);
        CAD.drawCylinder(ctx, xO + arm - 35, 290, 70, 150, 9, 'brass', schematic);
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(xO - arm - 34, yPL, 68, 440 - yPL);
        ctx.fillRect(xO + arm - 34, yPR, 68, 440 - yPR);

        // Cámara central de aire comprimido (plenum)
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.strokeStyle = CAD.COLORS.brassDark;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(355, 240, 90, 160, 14) : ctx.rect(355, 240, 90, 160); ctx.fill(); ctx.stroke();
        // Nivel comprimido de agua + colchón aire
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(357, 320, 86, 78);
        // Tobera superior de chorro continuo
        ctx.strokeStyle = CAD.COLORS.waterDeep;
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(400, 240); ctx.lineTo(400, 185); ctx.stroke();
        CAD.drawFluidParticles(ctx, 400, 240, 400, 175, theta * 3, true, '#5280a0');

        // 4 Válvulas check
        CAD.drawCheckValve(ctx, xO - arm - 12, 440, 24, leftUp ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, xO + arm - 12, 440, 24, !leftUp ? 0.9 : 0, 0);

        // Pistones + bielas articuladas al balancín
        CAD.drawLink(ctx, xL, yL, xO - arm, yPL, 8, 'iron', schematic);
        CAD.drawLink(ctx, xR, yR, xO + arm, yPR, 8, 'iron', schematic);
        CAD.drawPiston(ctx, xO - arm, yPL, 64, 22, schematic);
        CAD.drawPiston(ctx, xO + arm, yPR, 64, 22, schematic);

        // Palanca motriz oscilante superior
        CAD.drawTimberBeam(ctx, xL - 70 * Math.cos(psi), yL - 70 * Math.sin(psi), xR + 70 * Math.cos(psi), yR + 70 * Math.sin(psi), 14, schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');
        CAD.drawPin(ctx, xL, yL, 6, 'A₁');
        CAD.drawPin(ctx, xR, yR, 6, 'A₂');
        CAD.drawNoteBox(ctx, 35, 85, 210, 'PLENUM NEUMÁTICO', [
            'Presión media: 1.8 bar',
            'Ley Boyle: P·V_aire = cte',
            'Flujo continuo de descarga'
        ]);
    };

    // 14. SHADUF (CIGOÑAL)
    R.african_shaduf = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'SHADUF O CIGOÑAL (ANTIGUO EGIPTO, c. 1500 a.C.)',
            'Palanca Contrapesada Asimétrica | Equilibrio Estático ΣM_O ≈ 0', schematic);

        const xO = 320, yO = 260;
        const psi = 0.28 * Math.sin(theta); // Oscilación desde agua hacia canal elevado
        const L1 = 120, L2 = 270;
        const xW = xO - L1 * Math.cos(psi), yW = yO - L1 * Math.sin(psi);
        const xB = xO + L2 * Math.cos(psi), yB = yO + L2 * Math.sin(psi);

        CAD.drawCenterline(ctx, xO, 120, xO, 480);

        // Río inferior y canal de riego elevado
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(460, 445, 280, 90);
        CAD.drawGroundSupport(ctx, 320, 445, 160, 16);
        CAD.drawHatchRect(ctx, 320, 320, 90, 125, '#e9e3d5', 9); // Canal intermedio

        // Horquilla vertical soporte fijo O2
        CAD.drawTimberBeam(ctx, xO, 445, xO, yO, 16, schematic);

        // Pértiga oscilante asimétrica
        CAD.drawTimberBeam(ctx, xW, yW, xB, yB, 13, schematic);

        // Contrapeso de piedra/barro en lado corto
        ctx.fillStyle = CAD.COLORS.stoneDark;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.beginPath(); ctx.arc(xW, yW + 18, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Tirante vertical pendular y cubo articulado (siempre vertical por gravedad!)
        const ropeLen = 140;
        const bucketY = yB + ropeLen;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(xB, yB); ctx.lineTo(xB, bucketY); ctx.stroke();

        // Cubo con agua variable según altura
        ctx.fillStyle = CAD.COLORS.woodMid;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.fillRect(xB - 18, bucketY, 36, 30);
        ctx.strokeRect(xB - 18, bucketY, 36, 30);
        if (psi < 0.15) {
            ctx.fillStyle = CAD.COLORS.waterDeep;
            ctx.fillRect(xB - 16, bucketY + 6, 32, 22);
        }

        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');
        CAD.drawPin(ctx, xW, yW, 5, 'M_c');
        CAD.drawPin(ctx, xB, yB, 6, 'A');
        CAD.drawDimension(ctx, xO, yO - 40, xB, yB - 40, 'L₂ = 2600 mm', -25);
        CAD.drawNoteBox(ctx, 35, 85, 225, 'EQUILIBRIO DE MOMENTOS', [
            'Relación brazos: L₂/L₁ = 2.83',
            'Contrapeso: 42 kg',
            'Elevación neta: 2.40 m'
        ]);
    };

    // 15. MOTOR DE VAPOR DE PAPIN (1690)
    R.papin_papin_steam_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'CILINDRO ATMOSFÉRICO DE DENIS PAPIN (1690)',
            'Expansión Térmica y Colapso por Condensación | Trabajo Neto W = ∫ΔP·A dy', schematic);

        const xC = 280;
        const cycle = (theta / (Math.PI * 2));
        // 0..0.45 sube lento vapor, 0.45..0.55 traba, 0.55..0.85 desciende rápido vacío
        let lift = 0;
        if (cycle < 0.45) lift = cycle / 0.45;
        else if (cycle < 0.6) lift = 1.0;
        else lift = Math.max(0, 1 - (cycle - 0.6) / 0.25);

        const yPist = 370 - lift * 125;
        const yWeight = 230 + lift * 125;

        CAD.drawCenterline(ctx, xC, 80, xC, 500);
        CAD.drawGroundSupport(ctx, xC, 495, 180, 14);

        // Brasero inferior y cilindro de latón
        ctx.fillStyle = '#a53a1a';
        ctx.fillRect(xC - 45, 455, 90, 38);
        CAD.drawCylinder(ctx, xC - 40, 210, 80, 240, 10, 'brass', schematic);
        ctx.fillStyle = cycle < 0.6 ? 'rgba(226, 232, 240, 0.85)' : 'rgba(56, 189, 248, 0.3)';
        ctx.fillRect(xC - 39, yPist + 10, 78, 450 - (yPist + 10));

        // Polea superior de izado y masa contrapeso
        CAD.drawGear(ctx, 410, 120, 32, 16, (1 - lift) * Math.PI * 2, 'iron', schematic);
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xC, yPist); ctx.lineTo(xC, 120);
        ctx.lineTo(410, 88); ctx.lineTo(540, 120); ctx.lineTo(540, yWeight);
        ctx.stroke();

        // Peso elevado
        CAD.drawHatchRect(ctx, 515, yWeight, 50, 42, CAD.COLORS.ironMid, 7);
        CAD.drawPiston(ctx, xC, yPist, 76, 22, schematic);
        CAD.drawFixedPivot(ctx, 410, 120, 6, 'P₁');
        CAD.drawNoteBox(ctx, 35, 85, 200, 'CICLO DE PAPIN', [
            'Ø Cilindro: 120 mm',
            'Carrera útil: 450 mm',
            'Fase: ' + (cycle < 0.6 ? 'VAPOR / TRABA' : 'VACÍO MOTRIZ')
        ]);
    };

    // 16. BOMBA DE ALTA PRESIÓN DE LEUPOLD (1725)
    R.leupold_leupold_steam_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'MÁQUINA DE ALTA PRESIÓN DE LEUPOLD (1725)',
            'Sin Condensación | Llave Distribuidora de 4 Vías | P_caldera = 4.5 bar', schematic);

        const valveAng = theta;
        const p1Up = Math.sin(theta) > 0;
        const s1 = 35 * Math.sin(theta), s2 = -s1;

        CAD.drawCenterline(ctx, 400, 80, 400, 520);
        // Caldera de alta presión inferior
        ctx.fillStyle = CAD.COLORS.copperMid;
        ctx.beginPath(); ctx.arc(400, 480, 60, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();

        // Llave distribuidora rotativa de 4 vías central
        CAD.drawGear(ctx, 400, 365, 24, 12, valveAng, 'brass', schematic);
        CAD.drawFixedPivot(ctx, 400, 365, 6, 'V_4v');

        // Tuberías hacia cilindros de vapor izquierdo y derecho
        CAD.drawCylinder(ctx, 250, 240, 56, 110, 8, 'iron', schematic);
        CAD.drawCylinder(ctx, 494, 240, 56, 110, 8, 'iron', schematic);
        CAD.drawPiston(ctx, 278, 295 - s1, 52, 18, schematic);
        CAD.drawPiston(ctx, 522, 295 - s2, 52, 18, schematic);

        // Balancines gemelos superiores accionando bombas laterales
        const psi1 = s1 / 120, psi2 = s2 / 120;
        CAD.drawTimberBeam(ctx, 130, 145 - s1, 278, 145 + s1, 12, schematic);
        CAD.drawTimberBeam(ctx, 522, 145 + s2, 670, 145 - s2, 12, schematic);
        CAD.drawFixedPivot(ctx, 204, 145, 7, 'O₁');
        CAD.drawFixedPivot(ctx, 596, 145, 7, 'O₂');

        CAD.drawLink(ctx, 278, 145 + s1, 278, 295 - s1, 7, 'iron', schematic);
        CAD.drawLink(ctx, 522, 145 + s2, 522, 295 - s2, 7, 'iron', schematic);

        CAD.drawNoteBox(ctx, 35, 385, 225, 'DISTRIBUCIÓN 4 VÍAS', [
            'Ciclo 1: ' + (p1Up ? 'ADMISIÓN 4.5 bar' : 'ESCAPE ATM.'),
            'Ciclo 2: ' + (!p1Up ? 'ADMISIÓN 4.5 bar' : 'ESCAPE ATM.'),
            'Altura bombeo: 32.0 m'
        ]);
    };

    // 17. TORNO DE ROSCAR DE JACQUES BESSON (1578)
    R.besson_screw_lathe = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'TORNO DE ROSCAR CON HUSILLO PATRÓN DE BESSON (1578)',
            'Sincronización Rígida Pieza-Husillo | Avance Lineal dx/dθ = p/(2π)', schematic);

        const cycle = (theta / (Math.PI * 2));
        const carX = 240 + cycle * 270;

        CAD.drawCenterline(ctx, 110, 220, 690, 220);
        CAD.drawCenterline(ctx, 110, 315, 690, 315);

        // Bancada y cabezales fijos
        CAD.drawTimberBeam(ctx, 130, 395, 670, 395, 26, schematic);
        CAD.drawGroundSupport(ctx, 175, 490, 60, 14);
        CAD.drawGroundSupport(ctx, 625, 490, 60, 14);
        CAD.drawTimberBeam(ctx, 175, 165, 175, 490, 22, schematic);
        CAD.drawTimberBeam(ctx, 625, 165, 625, 490, 22, schematic);

        // Poleas 1:1 sincronizadas con correa cruzada
        CAD.drawGear(ctx, 140, 220, 30, 16, theta, 'brass', schematic);
        CAD.drawGear(ctx, 140, 315, 30, 16, theta, 'brass', schematic);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(115, 220); ctx.lineTo(115, 315); ctx.moveTo(165, 220); ctx.lineTo(165, 315); ctx.stroke();

        // Pieza superior mecanizada (rosca tallándose detrás de la cuchilla)
        ctx.fillStyle = '#e9e3d5';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.fillRect(210, 202, 390, 36);
        ctx.strokeRect(210, 202, 390, 36);
        ctx.strokeStyle = CAD.COLORS.ironDark;
        ctx.lineWidth = 1.8;
        for (let tx = 225; tx < carX; tx += 12) {
            ctx.beginPath(); ctx.moveTo(tx, 202); ctx.lineTo(tx + 6, 238); ctx.stroke();
        }

        // Husillo patrón inferior
        ctx.fillStyle = CAD.COLORS.ironLight;
        ctx.fillRect(190, 305, 430, 20);
        ctx.strokeRect(190, 305, 430, 20);
        for (let hx = 200; hx < 610; hx += 12) {
            ctx.beginPath(); ctx.moveTo(hx, 305); ctx.lineTo(hx + 6, 325); ctx.stroke();
        }

        // Carro móvil portaherramientas + semituerca + cuchilla
        CAD.drawHatchRect(ctx, carX - 30, 275, 60, 110, '#faf8f3', 12);
        CAD.drawHatchRect(ctx, carX - 18, 300, 36, 30, CAD.COLORS.brassMid, 6);
        // Cuchilla en contacto en x = carX
        ctx.fillStyle = CAD.COLORS.ink;
        ctx.beginPath(); ctx.moveTo(carX, 238); ctx.lineTo(carX - 8, 275); ctx.lineTo(carX + 8, 275); ctx.closePath(); ctx.fill();

        CAD.drawPin(ctx, carX, 315, 5, 'A (Tuerca)');
        CAD.drawPin(ctx, carX, 238, 4, 'B (Buril)');
        CAD.drawDimension(ctx, 240, 155, 510, 155, 'L_roscado = 350 mm', 0);
        CAD.drawNoteBox(ctx, 270, 425, 250, 'CINEMÁTICA HELICOIDAL', [
            'Paso patrón: p = 8.0 mm/rev',
            'Avance actual: ' + (cycle * 350).toFixed(1) + ' mm',
            'Ventaja mecánica MA ≈ 118'
        ]);
    };

    // 18. COJINETE DE JAULA DE LEONARDO
    R.leonardo_cage_bearing = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'COJINETE DE BOLAS CON JAULA DE LEONARDO (1493)',
            'Rodadura Pura Sin Deslizamiento | ω_jaula = 0.5 · ω_eje | D_m = 255 mm', schematic);

        const cx = 400, cy = 305, rIn = 82, rPitch = 114, rBall = 31, rOut = 146;
        CAD.drawCenterline(ctx, 180, cy, 620, cy);
        CAD.drawCenterline(ctx, cx, 100, cx, 520);

        // Pista exterior fija achurada
        CAD.drawHatchRect(ctx, cx - 185, cy - 185, 370, 370, null, 12);
        ctx.save();
        ctx.fillStyle = CAD.COLORS.bg;
        ctx.beginPath(); ctx.arc(cx, cy, rOut, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();

        // Pista interior girando a theta
        CAD.drawGear(ctx, cx, cy, rIn, 24, theta, 'iron', schematic);

        // Jaula separadora orbitando exactamente a theta / 2!
        const cageAng = theta * 0.5;
        ctx.save();
        ctx.strokeStyle = CAD.COLORS.brassMid;
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(cx, cy, rPitch + 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, rPitch - 12, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        const numBalls = 8;
        const spinRatio = (rPitch / (2 * rBall)) * (1 - (rBall * rBall) / (rPitch * rPitch));
        for (let i = 0; i < numBalls; i++) {
            const ang = cageAng + (i * Math.PI * 2) / numBalls;
            const bx = cx + rPitch * Math.cos(ang);
            const by = cy + rPitch * Math.sin(ang);
            const ballSpin = -theta * spinRatio;

            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(ballSpin);
            const g = ctx.createRadialGradient(-8, -8, 2, 0, 0, rBall);
            g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#cbd5e1'); g.addColorStop(1, '#475569');
            ctx.fillStyle = schematic ? '#fff' : g;
            ctx.strokeStyle = CAD.COLORS.ink;
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(0, 0, rBall, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            // Índice radial de giro propio sin deslizamiento
            ctx.strokeStyle = '#962b23';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-rBall + 4, 0); ctx.lineTo(rBall - 4, 0); ctx.stroke();
            ctx.restore();
        }
        CAD.drawFixedPivot(ctx, cx, cy, 9, 'O_eje');
        CAD.drawDimension(ctx, cx - rPitch, 100, cx + rPitch, 100, 'D_m = 255 mm', 0);
        CAD.drawNoteBox(ctx, 35, 385, 200, 'RODADURA PURA', [
            'Jaula: ' + ((cageAng * 180 / Math.PI) % 360).toFixed(1) + '°',
            'Relación: ω_c = 0.5 · ω_eje',
            'Fricción eq.: μ ≈ 0.002'
        ]);
    };

    // 19. CARRO QUE APUNTA AL SUR (ZHǏ NÁN CHĒ)
    R.chinese_south_pointing_chariot = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'CARRO QUE APUNTA AL SUR (ZHǏ NÁN CHĒ, c. 255 d.C.)',
            'Computador Diferencial Epicicloidal | Orientación Invariante θ_puntero = Sur Fijo', schematic);

        // Simular curva S del vehículo manteniendo brújula mecánica invariante
        const heading = 0.65 * Math.sin(theta); // Ángulo instantáneo del chasis en planta (vista superior derecha)
        const wheelL = theta * 1.4 - heading * 2.0;
        const wheelR = theta * 1.4 + heading * 2.0;

        // Vista izquierda: Esquema cinemático del tren diferencial central
        const cx = 270, cy = 310;
        CAD.drawCenterline(ctx, 90, cy, 450, cy);
        CAD.drawCenterline(ctx, cx, 130, cx, 490);

        CAD.drawTimberBeam(ctx, 130, cy, 410, cy, 18, schematic);
        // Rueda izquierda y derecha en corte
        CAD.drawWaterwheel(ctx, 130, cy, 85, 8, wheelL, schematic);
        CAD.drawWaterwheel(ctx, 410, cy, 85, 8, wheelR, schematic);
        CAD.drawFixedPivot(ctx, 130, cy, 7, 'R_L');
        CAD.drawFixedPivot(ctx, 410, cy, 7, 'R_R');

        // Jaula diferencial central rotando a (wheelR - wheelL)/2 = 2*heading!
        CAD.drawGear(ctx, cx, cy, 42, 16, heading, 'brass', schematic);
        CAD.drawFixedPivot(ctx, cx, cy, 7, 'O_dif');

        // Vista derecha: Trayectoria en planta + Estatua apuntando invariablemente al SUR (abajo)
        const mapX = 610, mapY = 310;
        ctx.save();
        ctx.strokeStyle = '#8d8578';
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(mapX, mapY, 105, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);

        // Chasis rotando según rumbo "heading"
        ctx.save();
        ctx.translate(mapX, mapY);
        ctx.rotate(heading);
        CAD.drawHatchRect(ctx, -45, -60, 90, 120, '#d4a373', 10);
        ctx.fillStyle = CAD.COLORS.ink;
        ctx.fillRect(-58, -30, 13, 60);
        ctx.fillRect(45, -30, 13, 60);
        ctx.restore();

        // Puntero SIEMPRE apunta al Sur (hacia abajo, 90° en pantalla = Sur fijo)!
        CAD.drawVector(ctx, mapX, mapY, 0, 95, '#962b23', 'SUR FIJO');
        CAD.drawPin(ctx, mapX, mapY, 8);
        ctx.restore();

        CAD.drawNoteBox(ctx, 480, 85, 270, 'ODOMETRÍA DIFERENCIAL', [
            'Rumbo chasis: ' + (heading * 180 / Math.PI).toFixed(1) + '°',
            'Compensación dif.: ' + (-heading * 180 / Math.PI).toFixed(1) + '°',
            'Error neto al Sur: 0.0° (Invariante)'
        ]);
    };

    // 20. TORNILLO DE ARQUÍMEDES
    R.vitruvius_archimedes_screw = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'TORNILLO DE ARQUÍMEDES (COCHLEA VITRUVIANA)',
            'Pendiente Pitagórica 3:4:5 (β = 36.87°) | Confinamiento Gravitatorio Helicoidal', schematic);

        const xO1 = 155, yO1 = 485;
        const beta = 36.87 * Math.PI / 180;
        const len = 460;
        const xO2 = xO1 + len * Math.cos(beta);
        const yO2 = yO1 - len * Math.sin(beta);

        // Estanque inferior y descarga superior
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(40, 445, 250, 95);
        CAD.drawTimberBeam(ctx, xO2 - 10, yO2 + 30, 690, yO2 + 30, 14, schematic);
        CAD.drawFluidParticles(ctx, xO2, yO2 + 15, 700, yO2 + 15, theta * 2, true, CAD.COLORS.waterDeep);

        // Cuerpo inclinado rotado exactamente a -beta
        ctx.save();
        ctx.translate(xO1, yO1);
        ctx.rotate(-beta);

        CAD.drawCenterline(ctx, -30, 0, len + 50, 0);
        // Árbol central
        CAD.drawTimberBeam(ctx, 0, 0, len, 0, 22, schematic);

        // Hélice sinusoidal continua proyectada en 2D y bolsas de agua!
        const R = 52;
        const pitch = 75;
        const phase = (theta / (Math.PI * 2)) * pitch;

        // Bolsas discretas de agua confinadas en cada seno inferior de la hélice
        ctx.fillStyle = CAD.COLORS.waterDeep;
        for (let x = 45 + phase; x < len - 35; x += pitch) {
            ctx.beginPath();
            ctx.ellipse(x, R * 0.56, 20, 14, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Espira continua helicoidal
        ctx.strokeStyle = CAD.COLORS.brassMid;
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let x = 25; x <= len - 25; x += 4) {
            const yy = R * Math.sin(((x - phase) / pitch) * Math.PI * 2);
            if (x === 25) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
        }
        ctx.stroke();

        // Camisa cilíndrica translúcida con flejes
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3;
        ctx.strokeRect(20, -R - 4, len - 40, (R + 4) * 2);
        ctx.restore();

        // Triángulo pitagórico 3:4:5 acotado
        ctx.save();
        ctx.strokeStyle = '#1d4968';
        ctx.setLineDash([5, 3]);
        ctx.beginPath(); ctx.moveTo(350, 485); ctx.lineTo(550, 485); ctx.lineTo(550, 335); ctx.stroke();
        ctx.fillStyle = '#1d4968';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Base = 4', 440, 502);
        ctx.fillText('H = 3', 560, 415);
        ctx.fillText('β = 36.87°', 375, 476);
        ctx.restore();

        CAD.drawFixedPivot(ctx, xO1, yO1, 7, 'O₁');
        CAD.drawFixedPivot(ctx, xO2, yO2, 7, 'O₂');
        CAD.drawNoteBox(ctx, 35, 85, 225, 'HIDRODINÁMICA HELICOIDAL', [
            'Ángulo de inclinación β: 36.87°',
            'Paso hélice: p = 450 mm',
            'Caudal teórico: 18.5 m³/h'
        ]);
    };

    // 21. BOMBA DE CADENA Y ROSARIO DE AGRÍCOLA
    R.agricola_chain_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'BOMBA DE CADENA Y ROSARIO DE AGRÍCOLA (1556)',
            'Transporte Continuo en Tubo Vertical | Sin Válvulas (Apta para Lodos)', schematic);

        const xUp = 360, xDown = 490, yTop = 165, yBot = 480;
        CAD.drawCenterline(ctx, xUp, 95, xUp, 535);

        // Pozo inferior
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(260, 440, 320, 95);

        // Tubería vertical ascendente de madera
        CAD.drawCylinder(ctx, xUp - 24, 195, 48, 270, 9, 'wood', schematic);
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(xUp - 22, 200, 44, 265);
        // Canaleta superior
        CAD.drawTimberBeam(ctx, xUp - 110, 200, xUp - 24, 200, 14, schematic);
        CAD.drawFluidParticles(ctx, xUp - 25, 195, xUp - 110, 195, theta * 2, true, CAD.COLORS.waterDeep);

        // Catalina superior motriz y tambor guía inferior
        CAD.drawGear(ctx, 425, yTop, 65, 16, theta, 'iron', schematic);
        CAD.drawGear(ctx, 425, yBot, 65, 16, theta, 'wood', schematic);

        // Bucle sinfín de cadena con bolas de cuero espaciadas
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xUp, yTop); ctx.lineTo(xUp, yBot);
        ctx.moveTo(xDown, yTop); ctx.lineTo(xDown, yBot);
        ctx.stroke();

        const loopDist = yBot - yTop;
        const step = 45;
        const shift = ((theta / (Math.PI * 2)) * step) % step;
        for (let yy = yTop + shift; yy <= yBot; yy += step) {
            // Ramal izquierdo subiendo dentro del tubo
            CAD.drawPin(ctx, xUp, yBot - (yy - yTop), 11);
            // Ramal derecho descendiendo en vacío
            CAD.drawPin(ctx, xDown, yy, 11);
        }

        CAD.drawFixedPivot(ctx, 425, yTop, 8, 'O₁ (Motriz)');
        CAD.drawFixedPivot(ctx, 425, yBot, 7, 'O₂');
        CAD.drawNoteBox(ctx, 35, 85, 220, 'BOMBA PATERNOSTER', [
            'Ø Tubería: 130 mm',
            'Velocidad ascenso: 1.2 m/s',
            'Caudal nominal: 180 L/min'
        ]);
    };

})(window.MACHINE_RENDERERS);
