/**
 * Mechanica Antiqua - Ilustraciones Técnicas y Cutaways 2D Volumétricos
 * Módulo 2: Bombas, Vapor, Termodinámica y Fluidos (12 máquinas)
 * Con gradientes metálicos, dinámicas de vapor/combustión vivas, válvulas y telemetría analítica.
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

    // 12. BOMBA DE SUCCIÓN MINERA DE AGRÍCOLA
    R.agricola_suction_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 385, yO = 135, r = 42, L = 128;
        const kin = solveSliderY(xO, yO, r, theta, L, xO, false);
        const yPiston = kin.yB + 100;
        const suctionStroke = Math.cos(theta) < 0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `FASE: ${suctionStroke ? 'ASPIRACIÓN + DESCARGA' : 'RETORNO Y TRANSVASE'}`,
            `VÁLVULA PIE: ${suctionStroke ? 'ABIERTA (SUCCIÓN ACTIVA)' : 'CERRADA (RETENCIÓN)'}`,
            `CARRERA: s = 300 mm`,
            `VÉLOCIDAD: ${Math.abs(k.vMs || 1.2).toFixed(2)} m/s`
        ]);

        CAD.drawCenterline(ctx, 275, yO, 495, yO);
        CAD.drawCenterline(ctx, xO, 65, xO, 488);

        // Entibación del pozo y nivel freático
        CAD.drawMasonry(ctx, 215, 320, 115, 170);
        CAD.drawMasonry(ctx, 455, 320, 115, 170);
        CAD.drawWaterSurface(ctx, 330, 445, 125, 45, theta, 1.5);

        // Tubo de aspiración inferior sumergido
        CAD.drawPipe(ctx, [[xO, 480], [xO, 425]], 26, CAD.COLORS.waterDeep, theta * 4, suctionStroke, false, { material: 'wood' });
        CAD.drawCylinder(ctx, xO - 44, 255, 88, 170, 11, 'wood', schematic);

        // Columnas de agua inferior y superior en el cilindro
        ctx.fillStyle = CAD.COLORS.waterShallow;
        ctx.fillRect(xO - 43, yPiston + 10, 86, 425 - (yPiston + 10));
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(xO - 43, 270, 86, Math.max(0, yPiston - 270));

        // Descarga lateral a canaleta con vertido
        CAD.drawPipe(ctx, [[xO + 45, 280], [620, 280], [620, 310]], 18, CAD.COLORS.waterDeep, theta * 5, suctionStroke, false, { material: 'wood' });
        if (suctionStroke) {
            CAD.drawWaterJet(ctx, 620, 310, 470, 0.9, theta);
        }

        // Válvula de pie inferior
        CAD.drawCheckValve(ctx, xO - 22, 425, 42, suctionStroke ? 0.9 : 0.0, 0);

        // Vástago de émbolo y pistón de madera forrado en cuero
        CAD.drawLink(ctx, xO, kin.yB, xO, yPiston, 11, 'iron', schematic);
        CAD.drawPiston(ctx, xO, yPiston, 84, 24, schematic);

        // Válvula de clapeta en el émbolo
        CAD.drawCheckValve(ctx, xO - 16, yPiston - 12, 30, !suctionStroke ? 0.9 : 0.0, 0);

        // Manivela motriz y biela de transmisión
        CAD.drawGear(ctx, xO, yO, 64, 18, theta, 'wood', schematic);
        CAD.drawLink(ctx, xO, yO, kin.xA, kin.yA, 14, 'iron', schematic);
        CAD.drawLink(ctx, kin.xA, kin.yA, kin.xB, kin.yB, 11, 'brass', schematic);

        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');
        CAD.drawPin(ctx, kin.xA, kin.yA, 6.5, 'A');
        CAD.drawPin(ctx, kin.xB, kin.yB, 6.5, 'B');

        CAD.drawCallout(ctx, xO + 22, 425, 160, 415, suctionStroke ? 'Válvula de pie: ABIERTA' : 'Válvula de pie: CERRADA', 'right');
        CAD.drawCallout(ctx, xO, yPiston, 160, 340, !suctionStroke ? 'Clapeta de émbolo: ABIERTA' : 'Émbolo eleva agua útil', 'right');
        CAD.drawCallout(ctx, 560, 280, 580, 210, 'Canal de desagüe minero', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            suctionStroke ? 'Carrera ascendente: Aspiración del fondo y descarga exterior' : 'Carrera descendente: Transvase de agua a través del émbolo',
            suctionStroke ? 'El émbolo asciende creando depresión que abre la válvula de pie y derrama agua en la artesa.'
                          : 'Al bajar, la válvula de pie se cierra para no perder carga y el agua atraviesa la clapeta del pistón.');
    };

    // 13. BOMBA BICILÍNDRICA DE AL-JAZARI (SCOTCH YOKE)
    R.al_jazari_suction_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 400, yO = 350, r = 48;
        const xA = xO + r * Math.cos(theta), yA = yO + r * Math.sin(theta);
        const xYoke = xA;
        const movingRight = Math.sin(theta) < 0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `SENTIDO: ${movingRight ? 'DESPLAZAMIENTO DERECHO' : 'DESPLAZAMIENTO IZQUIERDO'}`,
            `MECANISMO: YUGO ESCOCÉS (SHM EXACTO)`,
            `CILINDROS: DOBLE EFECTO OPUESTO`,
            `CAUDAL: CONTINUO SIN PULSOS`
        ]);

        CAD.drawGroundSupport(ctx, 400, 470, 580, 14);
        CAD.drawCenterline(ctx, 75, 195, 725, 195);
        CAD.drawCenterline(ctx, xO, 55, xO, 475);

        // Pozas de succión laterales
        CAD.drawWaterSurface(ctx, 105, 405, 135, 65, theta, 1.5);
        CAD.drawWaterSurface(ctx, 560, 405, 135, 65, theta, 1.5);
        CAD.drawPipe(ctx, [[135, 425], [135, 235]], 15, CAD.COLORS.waterDeep, theta * 4, !movingRight, false, { material: 'copper' });
        CAD.drawPipe(ctx, [[665, 425], [665, 235]], 15, CAD.COLORS.waterDeep, theta * 4, movingRight, false, { material: 'copper' });

        // Colector unificado superior hacia aljibe
        CAD.drawPipe(ctx, [[135, 155], [135, 95], [665, 95], [665, 155]], 15, CAD.COLORS.waterDeep, theta * 5, true, false, { material: 'copper' });
        CAD.drawPipe(ctx, [[400, 95], [400, 45]], 18, CAD.COLORS.waterDeep, theta * 5, true, false, { material: 'copper' });
        CAD.drawWaterJet(ctx, 400, 45, 18, 1.2, theta);

        // Cilindros horizontales de cobre maquinados
        CAD.drawCylinder(ctx, 115, 155, 155, 80, 10, 'copper', schematic);
        CAD.drawCylinder(ctx, 530, 155, 155, 80, 10, 'copper', schematic);
        const xPistL = xYoke - 190, xPistR = xYoke + 190;

        ctx.fillStyle = CAD.COLORS.waterShallow;
        ctx.fillRect(117, 157, Math.max(0, xPistL - 117), 76);
        ctx.fillRect(xPistR + 10, 157, Math.max(0, 683 - (xPistR + 10)), 76);

        // Válvulas de retención
        CAD.drawCheckValve(ctx, 122, 235, 24, !movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 122, 155, 24, movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 650, 235, 24, movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 650, 155, 24, !movingRight ? 0.9 : 0, 0);

        // Rueda fluvial motriz y engranaje
        CAD.drawWaterwheel(ctx, xO, yO, 94, 12, theta, schematic);
        CAD.drawGear(ctx, xO, yO, 64, 18, theta, 'brass', schematic);

        // Marco del yugo escocés con ranura vertical maquinada
        ctx.save();
        const yokeGrad = CAD.createMaterialGradient(ctx, xYoke - 16, 285, xYoke + 16, 415, 'steel');
        ctx.fillStyle = yokeGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.4;
        ctx.fillRect(xYoke - 15, 285, 30, 130);
        ctx.strokeRect(xYoke - 15, 285, 30, 130);

        // Ranura deslizante interior rectificada
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(xYoke - 8, 292, 16, 116);
        ctx.restore();

        // Eje pasante entre ambos émbolos
        CAD.drawLink(ctx, xPistL, 195, xPistR, 195, 12, 'iron', schematic);
        CAD.drawLink(ctx, xYoke, 195, xYoke, 285, 12, 'iron', schematic);
        CAD.drawPiston(ctx, xPistL, 195, 24, 74, schematic);
        CAD.drawPiston(ctx, xPistR, 195, 24, 74, schematic);

        // Manivela y patín de deslizamiento en el yugo
        CAD.drawLink(ctx, xO, yO, xA, yA, 13, 'brass', schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');
        CAD.drawPin(ctx, xA, yA, 7.5, 'Patín A');

        CAD.drawCallout(ctx, xYoke + 15, 315, 545, 295, 'Yugo escocés (guía ranurada)', 'left');
        CAD.drawCallout(ctx, 400, 70, 475, 60, 'Descarga continua al aljibe', 'left');
        CAD.drawCallout(ctx, xPistL, 195, 210, 125, movingRight ? 'Cilindro izq: IMPULSIÓN' : 'Cilindro izq: SUCCIÓN', 'right');

        CAD.drawPhaseCaption(ctx, w, h,
            movingRight ? 'Carrera hacia la derecha: Cilindro izquierdo impulsa, derecho succiona' : 'Carrera hacia la izquierda: Cilindro derecho impulsa, izquierdo succiona',
            'La ranura vertical del yugo convierte el movimiento circular en armónico simple perfecto, bombeando agua continua en contrafase.');
    };

    // 14. BOMBA ASPIRANTE-IMPELENTE DE CTESIBIO
    R.ctesibius_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 400, yO = 130, arm = 120;
        const psi = 0.22 * Math.sin(theta);
        const xL = xO - arm * Math.cos(psi), yL = yO - arm * Math.sin(psi);
        const xR = xO + arm * Math.cos(psi), yR = yO + arm * Math.sin(psi);
        const yPL = 330 - 30 * Math.sin(theta), yPR = 330 + 30 * Math.sin(theta);
        const leftUp = Math.cos(theta) > 0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `COLCHÓN NEUMÁTICO: ACTIVO (PLENUM)`,
            `CHORRO: CONTINUO LIBRE DE PULSOS`,
            `CILINDROS: BRONCE PULIDO`,
            `CARRERA: DOBLE EFECTO ALTERNADO`
        ]);

        CAD.drawGroundSupport(ctx, 400, 475, 540, 14);
        CAD.drawWaterSurface(ctx, 175, 420, 450, 55, theta, 1.4);
        CAD.drawCenterline(ctx, xO, 55, xO, 475);

        CAD.drawCylinder(ctx, xO - arm - 36, 275, 72, 150, 10, 'brass', schematic);
        CAD.drawCylinder(ctx, xO + arm - 36, 275, 72, 150, 10, 'brass', schematic);

        ctx.fillStyle = CAD.COLORS.waterShallow;
        ctx.fillRect(xO - arm - 35, yPL, 70, 425 - yPL);
        ctx.fillRect(xO + arm - 35, yPR, 70, 425 - yPR);

        CAD.drawPipe(ctx, [[xO - arm + 36, 400], [355, 400]], 15, CAD.COLORS.waterDeep, theta * 4, !leftUp, false, { material: 'brass' });
        CAD.drawPipe(ctx, [[xO + arm - 36, 400], [445, 400]], 15, CAD.COLORS.waterDeep, theta * 4, leftUp, false, { material: 'brass' });

        // Cámara de compresión neumática (Plenum de Ctesibio)
        ctx.save();
        const plenumGrad = CAD.createMaterialGradient(ctx, 355, 235, 445, 410, 'bronze');
        ctx.fillStyle = plenumGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.4;
        ctx.fillRect(355, 235, 90, 175);
        ctx.strokeRect(355, 235, 90, 175);

        // Colchón de aire comprimido superior en el plenum
        ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
        ctx.fillRect(357, 237, 86, 85);
        CAD.drawWaterSurface(ctx, 357, 322 + Math.sin(theta * 2) * 3, 86, 88, theta, 1.2);
        ctx.restore();

        // Tobera superior de chorro continuo
        CAD.drawPipe(ctx, [[400, 235], [400, 180]], 14, CAD.COLORS.waterDeep, theta * 5, true, false, { material: 'brass' });
        CAD.drawWaterJet(ctx, 400, 180, 65, 1.3, theta);

        // Válvulas de clapeta sumergidas
        CAD.drawCheckValve(ctx, xO - arm - 16, 425, 30, leftUp ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, xO + arm - 16, 425, 30, !leftUp ? 0.9 : 0, 0);

        // Bielas y pistones
        CAD.drawLink(ctx, xL, yL, xO - arm, yPL, 9, 'iron', schematic);
        CAD.drawLink(ctx, xR, yR, xO + arm, yPR, 9, 'iron', schematic);
        CAD.drawPiston(ctx, xO - arm, yPL, 68, 22, schematic);
        CAD.drawPiston(ctx, xO + arm, yPR, 68, 22, schematic);

        // Balancín superior de madera con empuñaduras
        CAD.drawTimberBeam(ctx, xL - 75 * Math.cos(psi), yL - 75 * Math.sin(psi), xR + 75 * Math.cos(psi), yR + 75 * Math.sin(psi), 14, schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O');
        CAD.drawPin(ctx, xL, yL, 6);
        CAD.drawPin(ctx, xR, yR, 6);

        CAD.drawCallout(ctx, 400, 275, 525, 220, 'Cámara neumática (colchón de aire)', 'left');
        CAD.drawCallout(ctx, 400, 110, 485, 90, 'Lanza de impulsión continua', 'left');
        CAD.drawCallout(ctx, xO - arm - 36, 350, 130, 310, leftUp ? 'Cilindro izq: Aspira' : 'Cilindro izq: Impulsa', 'right');

        CAD.drawPhaseCaption(ctx, w, h, 'Estabilización hidroneumática del caudal',
            'Cada pistón empuja agua al calderín central; el aire comprimido superior absorbe los picos de presión y entrega un chorro ininterrumpido.');
    };

    // 15. BOMBA DÚPLEX DE BALANCÍN DE MARTINI
    R.martini_piston_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO2 = 175, yO2 = 335, r = 40;
        const xA = xO2 + r * Math.cos(theta), yA = yO2 + r * Math.sin(theta);
        const xO4 = 480, yO4 = 160, armL = 135;
        const psi = 0.23 * Math.sin(theta);
        const xL = xO4 - armL * Math.cos(psi), yL = yO4 - armL * Math.sin(psi);
        const xR = xO4 + armL * Math.cos(psi), yR = yO4 + armL * Math.sin(psi);
        const yPL = yL + 150, yPR = yR + 150;
        const leftUp = Math.cos(theta) < 0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `SISTEMA: MANIVELA-BALANCÍN DÚPLEX`,
            `DESFASE: 180° ENTRE PISTONES`,
            `EMPUJE LATERAL: CANCELADO POR BALANCÍN`,
            `CAUDAL: SUMA DE DOBLE CARRERA`
        ]);

        CAD.drawGroundSupport(ctx, 400, 470, 580, 14);
        CAD.drawMasonry(ctx, xO4 - 28, yO4, 56, 310);

        CAD.drawCylinder(ctx, xO4 - armL - 38, 280, 76, 170, 10, 'brass', schematic);
        CAD.drawCylinder(ctx, xO4 + armL - 38, 280, 76, 170, 10, 'brass', schematic);

        ctx.fillStyle = CAD.COLORS.waterShallow;
        ctx.fillRect(xO4 - armL - 37, yPL, 74, 450 - yPL);
        ctx.fillRect(xO4 + armL - 37, yPR, 74, 450 - yPR);

        CAD.drawPipe(ctx, [[xO4 - armL + 38, 420], [xO4, 420], [xO4 + armL - 38, 420]], 15, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'copper' });
        CAD.drawPipe(ctx, [[xO4, 420], [xO4, 325]], 15, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'copper' });
        CAD.drawWaterJet(ctx, xO4, 325, 465, 0.85, theta);

        CAD.drawCheckValve(ctx, xO4 - armL - 16, 450, 32, leftUp ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, xO4 + armL - 16, 450, 32, !leftUp ? 0.9 : 0, 0);

        CAD.drawLink(ctx, xL, yL, xO4 - armL, yPL, 9, 'iron', schematic);
        CAD.drawLink(ctx, xR, yR, xO4 + armL, yPR, 9, 'iron', schematic);
        CAD.drawPiston(ctx, xO4 - armL, yPL, 72, 22, schematic);
        CAD.drawPiston(ctx, xO4 + armL, yPR, 72, 22, schematic);

        CAD.drawWaterwheel(ctx, xO2, yO2, 78, 10, theta, schematic);
        CAD.drawLink(ctx, xO2, yO2, xA, yA, 13, 'iron', schematic);
        CAD.drawLink(ctx, xA, yA, xL, yL, 10, 'brass', schematic);
        CAD.drawTimberBeam(ctx, xL - 16, yL - 2, xR + 16, yR + 2, 16, schematic);

        CAD.drawFixedPivot(ctx, xO2, yO2, 8, 'O₂');
        CAD.drawFixedPivot(ctx, xO4, yO4, 9, 'O₄');
        CAD.drawPin(ctx, xA, yA, 6.5, 'A');
        CAD.drawPin(ctx, xL, yL, 5.5, 'B₁');
        CAD.drawPin(ctx, xR, yR, 5.5, 'B₂');

        CAD.drawCallout(ctx, xO4 + 45, yO4 + 8, 620, 95, 'Balancín equilibrador de empujes', 'left');
        CAD.drawPhaseCaption(ctx, w, h, 'Accionamiento manivela-balancín desfasado 180°',
            'La rueda fluvial oscila el balancín simétrico accionando ambos pistones alternados para garantizar bombeo balanceado.');
    };

    // 16. BOMBA ROTATIVA DE PALETAS DE RAMELLI
    R.ramelli_rotary_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 400, cy = 275, Rst = 135, e = 35;
        const rRotY = cy + e, rRotor = Rst - e - 4;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `TIPO: BOMBA ROTATIVA DE PALETAS`,
            `EXCENTRICIDAD: e = 35 mm`,
            `CÁMARA IZQ: EXPANSIÓN (SUCCIÓN)`,
            `CÁMARA DER: COMPRESIÓN (IMPULSIÓN)`
        ]);

        CAD.drawGroundSupport(ctx, cx, 445, 300, 14);
        CAD.drawCenterline(ctx, 175, cy, 625, cy);
        CAD.drawCenterline(ctx, cx, 100, cx, 435);

        // Tuberías de admisión e impulsión
        CAD.drawPipe(ctx, [[115, 260], [265, 260]], 30, CAD.COLORS.waterShallow, theta * 4, true, false, { material: 'bronze' });
        CAD.drawPipe(ctx, [[535, 260], [685, 260]], 30, CAD.COLORS.waterDeep, theta * 5, true, false, { material: 'bronze' });

        // Estator cilíndrico en corte con espesor rayado
        ctx.save();
        const statGrad = CAD.createMaterialGradient(ctx, cx - Rst - 16, cy, cx + Rst + 16, cy, 'bronze');
        ctx.fillStyle = statGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(cx, cy, Rst + 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cámara interior con gradiente de presión del agua
        const waterP = ctx.createLinearGradient(cx - Rst, cy, cx + Rst, cy);
        waterP.addColorStop(0.00, 'rgba(56, 189, 248, 0.45)');
        waterP.addColorStop(0.50, 'rgba(14, 165, 233, 0.70)');
        waterP.addColorStop(1.00, 'rgba(3, 105, 161, 0.95)');
        ctx.fillStyle = waterP;
        ctx.beginPath();
        ctx.arc(cx, cy, Rst, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Rotor excéntrico
        ctx.save();
        const rotGrad = CAD.createMaterialGradient(ctx, cx - rRotor, rRotY, cx + rRotor, rRotY, 'iron');
        ctx.fillStyle = rotGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, rRotY, rRotor, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 4 paletas deslizantes que sellan contra la pared del estator
        for (let i = 0; i < 4; i++) {
            const ang = theta + (i * Math.PI) / 2;
            const ux = Math.cos(ang), uy = Math.sin(ang);
            const b = e * uy;
            const tWall = -b + Math.sqrt(b * b + (Rst * Rst - e * e));
            const tipX = cx + tWall * ux, tipY = rRotY + tWall * uy;
            const baseX = cx + (rRotor * 0.28) * ux, baseY = rRotY + (rRotor * 0.28) * uy;
            CAD.drawLink(ctx, baseX, baseY, tipX, tipY, 10, 'brass', schematic);
            CAD.drawPin(ctx, tipX, tipY, 4.0);
        }
        ctx.restore();

        CAD.drawPin(ctx, cx, cy, 5.0, 'Eje estator');
        CAD.drawFixedPivot(ctx, cx, rRotY, 8, 'Eje rotor');
        CAD.drawDimension(ctx, cx - 25, cy, cx - 25, rRotY, 'e = 35 mm', -50);
        CAD.drawCallout(ctx, 175, 260, 135, 145, 'Aspiración por volumen creciente', 'left');
        CAD.drawCallout(ctx, 625, 260, 565, 145, 'Impulsión por volumen decreciente', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Desplazamiento positivo continuo por excentricidad',
            'Al girar el rotor descentrado, las 4 paletas generan cámaras que se dilatan absorbiendo agua y luego se comprimen forzándola a la salida.');
    };

    // 17. MÁQUINA ATMOSFÉRICA DE NEWCOMEN (1712)
    R.newcomen_newcomen_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 400, yO = 135, arm = 210;
        const psi = 0.19 * Math.sin(theta);
        const dy = arm * psi;
        const yPiston = 315 + dy, yPump = 415 - dy;
        const condensing = Math.cos(theta) > 0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `ESTADO: ${condensing ? 'CONDENSACIÓN Y TIRO ATMO' : 'ADMISIÓN DE VAPOR 0.1 bar'}`,
            `CILINDRO: 1.8 m Ø HIERRO FUNDIDO`,
            `VACÍO INTERIOR: P = 0.28 bar`,
            `FRECUENCIA: 14 GOLPES/MIN`
        ]);

        CAD.drawGroundSupport(ctx, 400, 488, 680, 14);
        CAD.drawMasonry(ctx, 370, 135, 60, 353);

        // Hogar y caldera haystack de cobre
        CAD.drawFire(ctx, 190, 486, 74, theta);
        ctx.save();
        const boilGrad = CAD.createMaterialGradient(ctx, 190 - 58, 460, 190 + 58, 460, 'copper');
        ctx.fillStyle = boilGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(190, 460, 58, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Cilindro atmosférico vertical de hierro
        CAD.drawCylinder(ctx, 148, 245, 84, 160, 12, 'iron', schematic);

        // Estado termodinámico interior: vapor o vacío con agua condensada
        if (!condensing) {
            CAD.drawSteam(ctx, 190, 370, 32, theta, 6);
        } else {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fillRect(150, yPiston + 10, 80, 405 - (yPiston + 10));
        }

        // Chorro de inyección de agua fría
        CAD.drawPipe(ctx, [[70, 365], [150, 365]], 14, CAD.COLORS.waterDeep, theta * 5, condensing, false, { material: 'copper' });
        if (condensing) {
            CAD.drawWaterJet(ctx, 150, 365, 395, 1.0, theta);
        }

        // Émbolo abierto a la atmósfera con sello de agua superior
        CAD.drawPiston(ctx, 190, yPiston, 80, 22, schematic);
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(150, yPiston - 15, 80, 5);

        // Pozo de mina derecho con pistón de bombeo
        CAD.drawMasonry(ctx, 555, 335, 22, 153);
        CAD.drawMasonry(ctx, 645, 335, 22, 153);
        CAD.drawWaterSurface(ctx, 577, 355, 68, 133, theta, 1.4);
        CAD.drawPiston(ctx, 610, yPump, 58, 20, schematic);

        // Balancín con cabezas de arco circulares y cadenas tensadas
        ctx.save();
        ctx.translate(xO, yO);
        ctx.rotate(psi);
        CAD.drawTimberBeam(ctx, -arm, 0, arm, 0, 18, schematic);
        ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(0, 0, arm, Math.PI - 0.32, Math.PI + 0.32);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, arm, -0.32, 0.32);
        ctx.stroke();
        ctx.restore();

        // Cadenas de tiro vertical
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3.2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(190, yO - 30); ctx.lineTo(190, yPiston - 10);
        ctx.moveTo(610, yO - 30); ctx.lineTo(610, yPump - 10);
        ctx.stroke();
        ctx.setLineDash([]);

        if (condensing) {
            CAD.drawVector(ctx, 190, 255, 0, 38, CAD.COLORS.vectorThrust, 'P_atm = 1.01 bar');
        }
        CAD.drawFixedPivot(ctx, xO, yO, 9, 'Eje balancín');

        CAD.drawCallout(ctx, 190, 250, 80, 220, 'Cilindro abierto al aire libre', 'right');
        CAD.drawCallout(ctx, 110, 365, 80, 330, 'Inyección de agua fría', 'right');
        CAD.drawCallout(ctx, 575, 110, 620, 75, 'Cabeza de arco de tiro vertical', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            condensing ? 'Carrera motriz por vacío de condensación' : 'Admisión de vapor a baja presión',
            condensing ? 'El chorro de agua fría colapsa el vapor creando vacío; la presión atmosférica empuja el pistón hacia abajo levantando la bomba minera.'
                       : 'El peso del varillaje de mina vuelve a tirar del pistón hacia arriba mientras entra vapor fresco desde la caldera.');
    };

    // 18. MOTOR DE VAPOR DE DENIS PAPIN (1690)
    R.papin_papin_steam_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xC = 285, cyc = theta / (Math.PI * 2);
        let lift = cyc < 0.45 ? cyc / 0.45 : (cyc < 0.6 ? 1.0 : Math.max(0, 1 - (cyc - 0.6) / 0.25));
        const yPist = 355 - lift * 130;
        const yWeight = 220 + lift * 130;
        const vacPhase = cyc >= 0.6;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `ESTADO: ${vacPhase ? 'CARRERA MOTRIZ (CONDENSACIÓN)' : 'CALENTAMIENTO Y EXPANSIÓN'}`,
            `TEMPERATURA: 104 °C`,
            `FUERZA MOTRIZ: PRESIÓN ATMOSFÉRICA`,
            `TRABAJO: IZADO DE 27 kg`
        ]);

        CAD.drawGroundSupport(ctx, 400, 475, 540, 14);
        CAD.drawTimberBeam(ctx, 435, 475, 435, 90, 16, schematic);

        CAD.drawFire(ctx, xC, 473, 76, theta);
        CAD.drawCylinder(ctx, xC - 42, 190, 84, 245, 10, 'brass', schematic);

        if (!vacPhase) {
            CAD.drawSteam(ctx, xC, 360, 28, theta, 5);
        } else {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fillRect(xC - 40, yPist + 10, 80, 430 - (yPist + 10));
        }

        // Polea superior de bronce y cable de carga
        CAD.drawGear(ctx, 435, 105, 32, 16, (1 - lift) * Math.PI * 2, 'iron', schematic);
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(xC, yPist); ctx.lineTo(xC, 105); ctx.lineTo(435, 75); ctx.lineTo(550, 105); ctx.lineTo(550, yWeight);
        ctx.stroke();

        CAD.drawHatchRect(ctx, 525, yWeight, 50, 44, CAD.COLORS.ironMid, 6);
        CAD.drawPiston(ctx, xC, yPist, 80, 22, schematic);
        CAD.drawFixedPivot(ctx, 435, 105, 7);

        CAD.drawCallout(ctx, xC, yPist, 140, 260, 'Pistón motriz sellado', 'right');
        CAD.drawCallout(ctx, 550, yWeight + 20, 600, 320, 'Carga izada (27 kg)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            cyc < 0.45 ? '1. Generación de vapor y elevación' : (cyc < 0.6 ? '2. Retención en tope superior' : '3. Carrera de potencia por condensación'),
            vacPhase ? 'Al retirar el fuego y enfriarse el cilindro, el vapor se condensa instantáneamente y la atmósfera iza la carga.'
                     : 'El vapor generado en el fondo empuja el pistón hacia arriba venciendo la fricción.');
    };

    // 19. MÁQUINA DE ALTA PRESIÓN DE LEUPOLD (1725)
    R.leupold_leupold_steam_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const s1 = 36 * Math.sin(theta), s2 = -s1;
        const p1Up = Math.cos(theta) > 0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `PRESIÓN: 4.5 bar (ALTA PRESIÓN DIRECTA)`,
            `VÁLVULA: 4 VÍAS ROTATIVA SIN CONDENSADOR`,
            `CILINDRO 1: ${p1Up ? 'EXPANSIÓN DE VAPOR' : 'ESCAPE LIBRE'}`,
            `CILINDRO 2: ${!p1Up ? 'EXPANSIÓN DE VAPOR' : 'ESCAPE LIBRE'}`
        ]);

        CAD.drawGroundSupport(ctx, 400, 480, 640, 14);
        CAD.drawFire(ctx, 400, 478, 96, theta);

        // Caldera de alta presión reforzada con zunchos de hierro
        ctx.save();
        const boilGrad = CAD.createMaterialGradient(ctx, 400 - 60, 445, 400 + 60, 445, 'copper');
        ctx.fillStyle = boilGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(400, 445, 60, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Llave rotativa de 4 vías
        CAD.drawPipe(ctx, [[400, 385], [400, 345]], 15, 'rgba(220, 38, 38, 0.75)', theta * 4, true, false, { material: 'copper' });
        CAD.drawPipe(ctx, [[400, 335], [280, 335], [280, 310]], 14, p1Up ? 'rgba(220, 38, 38, 0.75)' : '#f8fafc', theta * 4, true, false, { material: 'iron' });
        CAD.drawPipe(ctx, [[400, 335], [520, 335], [520, 310]], 14, !p1Up ? 'rgba(220, 38, 38, 0.75)' : '#f8fafc', theta * 4, true, false, { material: 'iron' });

        CAD.drawGear(ctx, 400, 335, 24, 12, theta, 'brass', schematic);
        CAD.drawCylinder(ctx, 250, 195, 60, 120, 9, 'iron', schematic);
        CAD.drawCylinder(ctx, 490, 195, 60, 120, 9, 'iron', schematic);
        CAD.drawPiston(ctx, 280, 260 - s1, 56, 18, schematic);
        CAD.drawPiston(ctx, 520, 260 - s2, 56, 18, schematic);

        // Escape de vapor visible al aire
        if (!p1Up) CAD.drawSteam(ctx, 280, 185, 20, theta, 4);
        if (p1Up) CAD.drawSteam(ctx, 520, 185, 20, theta, 4);

        // Balancines superiores
        CAD.drawMasonry(ctx, 185, 125, 32, 355);
        CAD.drawMasonry(ctx, 585, 125, 32, 355);
        CAD.drawTimberBeam(ctx, 120, 125 - s1, 280, 125 + s1, 14, schematic);
        CAD.drawTimberBeam(ctx, 520, 125 + s2, 680, 125 - s2, 14, schematic);
        CAD.drawLink(ctx, 280, 125 + s1, 280, 260 - s1, 8, 'iron', schematic);
        CAD.drawLink(ctx, 520, 125 + s2, 520, 260 - s2, 8, 'iron', schematic);

        CAD.drawFixedPivot(ctx, 200, 125, 7.5, 'O₁');
        CAD.drawFixedPivot(ctx, 600, 125, 7.5, 'O₂');
        CAD.drawPin(ctx, 400, 335, 6);

        CAD.drawCallout(ctx, 400, 335, 485, 380, 'Llave distribuidora rotativa de 4 vías', 'left');
        CAD.drawCallout(ctx, 280, 195, 125, 220, 'Vapor a 4.5 bar empuja directamente', 'right');

        CAD.drawPhaseCaption(ctx, w, h, 'Expansión de alta presión sin condensador',
            'Leupold introduce vapor a 4.5 bar bajo los pistones para empujarlos con fuerza elástica propia, escapando directamente al aire exterior.');
    };

    // 20. BOMBA DE VAPOR DE SAVERY (1698)
    R.savery_savery_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const phaseA = Math.sin(theta) > 0;
        const lvlA = 285 + 42 * Math.cos(theta), lvlB = 285 - 42 * Math.cos(theta);

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `PRESIÓN: 3.8 bar DIRECTA`,
            `ELEVACIÓN: ΔH = 24 m`,
            `CÁMARA A: ${phaseA ? 'SUCCIÓN POR VACÍO' : 'IMPULSIÓN POR VAPOR'}`,
            `CÁMARA B: ${!phaseA ? 'SUCCIÓN POR VACÍO' : 'IMPULSIÓN POR VAPOR'}`
        ]);

        CAD.drawGroundSupport(ctx, 400, 480, 640, 14);
        CAD.drawWaterSurface(ctx, 265, 435, 370, 45, theta, 1.5);

        // Caldera de cobre y hogar
        CAD.drawFire(ctx, 140, 478, 74, theta);
        ctx.save();
        const bGrad = CAD.createMaterialGradient(ctx, 140 - 60, 435, 140 + 60, 435, 'copper');
        ctx.fillStyle = bGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(140, 435, 60, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Conducción de vapor hacia ambas vasijas
        CAD.drawPipe(ctx, [[140, 375], [140, 160], [555, 160]], 14, 'rgba(220, 38, 38, 0.75)', theta * 4, true, false, { material: 'copper' });
        CAD.drawCylinder(ctx, 290, 205, 95, 145, 10, 'copper', schematic);
        CAD.drawCylinder(ctx, 505, 205, 95, 145, 10, 'copper', schematic);

        CAD.drawWaterSurface(ctx, 292, lvlA, 91, 350 - lvlA, theta, 1.3);
        CAD.drawWaterSurface(ctx, 507, lvlB, 91, 350 - lvlB, theta, 1.3);

        // Tuberías de succión e impulsión
        CAD.drawPipe(ctx, [[337, 455], [337, 350]], 15, CAD.COLORS.waterDeep, theta * 4, phaseA, false, { material: 'copper' });
        CAD.drawPipe(ctx, [[552, 455], [552, 350]], 15, CAD.COLORS.waterDeep, theta * 4, !phaseA, false, { material: 'copper' });
        CAD.drawPipe(ctx, [[337, 350], [445, 350], [445, 75]], 16, CAD.COLORS.waterDeep, theta * 5, true, false, { material: 'copper' });
        CAD.drawPipe(ctx, [[552, 350], [445, 350]], 16, CAD.COLORS.waterDeep, theta * 5, !phaseA, false, { material: 'copper' });
        CAD.drawWaterJet(ctx, 445, 75, 45, 1.1, theta);

        CAD.drawCheckValve(ctx, 322, 350, 28, phaseA ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 537, 350, 28, !phaseA ? 0.9 : 0, 0);

        CAD.drawCallout(ctx, 337, 250, 225, 240, phaseA ? 'Cámara A: Succión por vacío' : 'Cámara A: Impulsa vapor 3.8 bar', 'right');
        CAD.drawCallout(ctx, 552, 250, 625, 240, !phaseA ? 'Cámara B: Succión por vacío' : 'Cámara B: Impulsa vapor 3.8 bar', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Bomba térmica directa sin pistón mecánico',
            'El vapor desplaza agua a alta presión hacia arriba; luego, al enfriarse el exterior con agua fría, condensa y aspira agua del pozo por vacío.');
    };

    // 21. EOLÍPILA DE HERÓN
    R.heron_aeolipile = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 400, cy = 225, r = 66, spin = theta * 3.5;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `MÁQUINA: EOLÍPILA DE REACCIÓN PURA`,
            `VELOCIDAD: 1200 RPM`,
            `PAR DE REACCIÓN: τ = 2·R·ṁ·v`,
            `FLUIDO: VAPOR SATURADO EXPANDIDO`
        ]);

        CAD.drawGroundSupport(ctx, 400, 480, 440, 14);
        CAD.drawFire(ctx, cx, 478, 130, theta);
        CAD.drawCylinder(ctx, 285, 350, 230, 105, 10, 'copper', schematic);
        CAD.drawWaterSurface(ctx, 287, 395, 226, 60, theta, 1.8);

        // Columnas huecas de vapor
        CAD.drawPipe(ctx, [[305, 350], [305, cy], [334, cy]], 16, 'rgba(241, 245, 249, 0.75)', theta * 5, true, false, { material: 'copper' });
        CAD.drawPipe(ctx, [[495, 350], [495, cy], [466, cy]], 16, 'rgba(241, 245, 249, 0.75)', theta * 5, true, false, { material: 'copper' });

        // Esfera giratoria con gradiente esférico y toberas acodadas
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(spin);

        const sphereGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
        sphereGrad.addColorStop(0, '#fef08a');
        sphereGrad.addColorStop(0.35, '#eab308');
        sphereGrad.addColorStop(0.75, '#a16207');
        sphereGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = sphereGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Toberas tangenciales
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(0, -r - 22); ctx.lineTo(28, -r - 22);
        ctx.moveTo(0, r); ctx.lineTo(0, r + 22); ctx.lineTo(-28, r + 22);
        ctx.stroke();

        // Chorros de vapor de escape a alta velocidad
        CAD.drawSteam(ctx, 35, -r - 22, 18, theta * 4, 4);
        CAD.drawSteam(ctx, -35, r + 22, 18, theta * 4, 4);
        ctx.restore();

        CAD.drawFixedPivot(ctx, 305, cy, 7, 'Pivote');
        CAD.drawFixedPivot(ctx, 495, cy, 7);
        CAD.drawCallout(ctx, 305, 290, 175, 290, 'Columnas huecas de alimentación', 'right');
        CAD.drawCallout(ctx, cx, cy, 565, 145, 'Par de reacción tangencial puro', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Primera turbina de vapor de la historia',
            'El vapor ingresa por los muñones de apoyo y es eyectado a gran velocidad por dos toberas acodadas opuestas generando par de reacción.');
    };

    // 22. VENTILADOR CENTRÍFUGO DE AGRÍCOLA
    R.agricola_ventilation_fan = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 365, cy = 295, R_fan = 125, rotorAng = theta * 2.8;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `TIPO: VENTILADOR RADIAL EN ESPIRAL`,
            `CAUDAL: 950 m³/h AIRE LIMPIO`,
            `ASPIRACIÓN: AXIAL POR OJO CENTRAL`,
            `DESCARGA: TANGENCIAL PRESURIZADA`
        ]);

        CAD.drawGroundSupport(ctx, 365, 465, 380, 14);

        // Carcasa voluta espiral de madera
        ctx.save();
        const fanGrad = CAD.createMaterialGradient(ctx, cx - R_fan - 18, cy, cx + R_fan + 18, cy, 'wood');
        ctx.fillStyle = fanGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(cx, cy, R_fan + 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillRect(cx + 52, 65, 70, 205);
        ctx.strokeRect(cx + 52, 65, 70, 205);

        // Interior hueco de la voluta
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx, cy, R_fan, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // 6 álabes curvos centrífugos
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotorAng);
        ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.lineWidth = 6.5;
        for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI * 2) / 6;
            ctx.beginPath();
            ctx.moveTo(22 * Math.cos(a), 22 * Math.sin(a));
            ctx.quadraticCurveTo(72 * Math.cos(a + 0.35), 72 * Math.sin(a + 0.35), R_fan * Math.cos(a + 0.15), R_fan * Math.sin(a + 0.15));
            ctx.stroke();
        }
        ctx.restore();

        // Partículas de aire aceleradas hacia la periferia
        for (let i = 0; i < 6; i++) {
            const p = ((theta / (Math.PI * 2)) + i / 6) % 1;
            const rr = 24 + p * (R_fan - 24);
            const ang = rotorAng + i * 1.05;
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(cx + rr * Math.cos(ang), cy + rr * Math.sin(ang), 3.6, 0, Math.PI * 2);
            ctx.fill();
        }
        CAD.drawFluidParticles(ctx, cx + 87, 260, cx + 87, 65, theta * 6, true, '#0284c7');

        CAD.drawFixedPivot(ctx, cx, cy, 10, 'O');
        CAD.drawCallout(ctx, cx, cy, 145, 205, 'Admisión axial de aire', 'right');
        CAD.drawCallout(ctx, cx + 87, 125, 570, 125, 'Conducto de ventilación a galerías', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Impulsión forzada por aceleración centrífuga',
            'Los álabes curvos succionan aire viciado de la galería e impulsan una corriente continua hacia el fondo de la mina.');
    };

    // 23. HORNO METALÚRGICO EÓLICO HUAYRA
    R.inca_huayra_furnace = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `TECNOLOGÍA: HUAYRA ANDINA (TIRO NATURAL)`,
            `COMBUSTIÓN: ~960 °C (SIN FUELLES)`,
            `EFECTO: VENTURI EN TOBERAS ACAMPANADAS`,
            `MINERAL: GALENA ARGENTÍFERA`
        ]);

        CAD.drawGroundSupport(ctx, 400, 475, 440, 14);
        CAD.drawMasonry(ctx, 260, 140, 36, 335);
        CAD.drawMasonry(ctx, 504, 140, 36, 335);

        // Toberas abocardadas que concentran el viento de ladera
        CAD.drawPipe(ctx, [[215, 235], [315, 260]], 20, 'rgba(14, 165, 233, 0.35)', theta * 5, true, false, { material: 'stone' });
        CAD.drawPipe(ctx, [[215, 335], [315, 360]], 20, 'rgba(14, 165, 233, 0.35)', theta * 5, true, false, { material: 'stone' });
        CAD.drawPipe(ctx, [[585, 235], [485, 260]], 20, 'rgba(14, 165, 233, 0.35)', theta * 5, true, false, { material: 'stone' });

        // Lecho incandescente con gradiente de calor y llamas
        const pulse = 0.70 + 0.3 * Math.sin(theta * 2.5);
        ctx.fillStyle = `rgba(220, 38, 38, ${pulse})`;
        ctx.fillRect(296, 335, 208, 140);
        CAD.drawFire(ctx, 400, 335, 170, theta);

        // Gases ascendentes calientes
        CAD.drawFluidParticles(ctx, 370, 320, 370, 70, theta * 4, true, '#ea580c');
        CAD.drawFluidParticles(ctx, 430, 320, 430, 70, theta * 4, true, '#ea580c');

        CAD.drawVector(ctx, 85, 235, 90, 0, CAD.COLORS.vectorThrust, 'Viento andino');
        CAD.drawCallout(ctx, 255, 245, 150, 160, 'Tobera acampanada (Efecto Venturi)', 'right');
        CAD.drawCallout(ctx, 400, 405, 585, 415, 'Crisol reductor de fundición', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Tiro forzado termoeólico sin asistencia mecánica',
            'Las toberas perforadas en las laderas ventosas aceleran el aire andino garantizando combustión de alta temperatura sin operarios.');
    };

})(window.MACHINE_RENDERERS);
