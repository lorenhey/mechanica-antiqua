/**
 * Mechanica Antiqua - Ilustraciones Cutaway 2D: Bombas, Vapor, Termodinámica y Fluidos (12 máquinas)
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

        CAD.drawCenterline(ctx, 275, yO, 495, yO);
        CAD.drawCenterline(ctx, xO, 65, xO, 488);

        // Entibación del pozo y nivel freático
        CAD.drawMasonry(ctx, 220, 325, 110, 165);
        CAD.drawMasonry(ctx, 450, 325, 110, 165);
        CAD.drawWaterSurface(ctx, 330, 445, 120, 45, theta, 1.5);

        // Tubo de aspiración inferior y camisa del cilindro
        CAD.drawPipe(ctx, [[xO, 480], [xO, 425]], 26, CAD.COLORS.waterDeep, theta * 4, suctionStroke, false);
        CAD.drawCylinder(ctx, xO - 42, 260, 84, 165, 10, 'wood', schematic);

        // Columna de agua debajo y encima del émbolo
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(xO - 41, yPiston + 8, 82, 425 - (yPiston + 8));
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(xO - 41, 272, 82, Math.max(0, yPiston - 272));

        // Tubo de descarga lateral hacia artesa exterior
        CAD.drawPipe(ctx, [[xO + 45, 282], [615, 282], [615, 310]], 18, CAD.COLORS.waterDeep, theta * 5, suctionStroke, false);
        if (suctionStroke) CAD.drawFluidParticles(ctx, 615, 312, 615, 375, theta * 5, true, CAD.COLORS.waterDeep);

        // Válvula de pie inferior y válvula de clapeta dentro del émbolo
        CAD.drawCheckValve(ctx, xO - 20, 425, 38, suctionStroke ? 0.9 : 0.0, 0);
        CAD.drawLink(ctx, xO, kin.yB, xO, yPiston, 9, 'iron', schematic);
        CAD.drawPiston(ctx, xO, yPiston, 80, 22, schematic);
        CAD.drawCheckValve(ctx, xO - 14, yPiston - 11, 26, !suctionStroke ? 0.9 : 0.0, 0);

        // Manivela + Biela AB
        CAD.drawGear(ctx, xO, yO, 62, 18, theta, 'wood', schematic);
        CAD.drawLink(ctx, xO, yO, kin.xA, kin.yA, 13, 'iron', schematic);
        CAD.drawLink(ctx, kin.xA, kin.yA, kin.xB, kin.yB, 10, 'brass', schematic);

        CAD.drawFixedPivot(ctx, xO, yO, 7, 'O₂');
        CAD.drawPin(ctx, kin.xA, kin.yA, 6, 'A');
        CAD.drawPin(ctx, kin.xB, kin.yB, 6, 'B');

        CAD.drawCallout(ctx, xO + 20, 425, 165, 415, suctionStroke ? 'Válvula de pie: ABIERTA' : 'Válvula de pie: CERRADA', 'right');
        CAD.drawCallout(ctx, xO, yPiston, 165, 340, !suctionStroke ? 'Clapeta émbolo: ABIERTA' : 'Émbolo sube agua', 'right');
        CAD.drawCallout(ctx, 560, 282, 575, 210, 'Descarga a canaleta', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            suctionStroke ? 'Carrera ascendente (Aspiración + Descarga)' : 'Carrera descendente (Transvase)',
            suctionStroke ? 'El émbolo sube, abre la válvula de pie succionando agua del pozo y empuja el agua superior hacia afuera.'
                          : 'El émbolo desciende; la válvula de pie se cierra para no perder carga y el agua pasa sobre el émbolo.');
    };

    // 13. BOMBA BICILÍNDRICA DE AL-JAZARI (SCOTCH YOKE)
    R.al_jazari_suction_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 400, yO = 350, r = 48;
        const xA = xO + r * Math.cos(theta), yA = yO + r * Math.sin(theta);
        const xYoke = xA;
        const movingRight = Math.sin(theta) < 0;

        CAD.drawGroundSupport(ctx, 400, 470, 560, 12);
        CAD.drawCenterline(ctx, 75, 195, 725, 195);
        CAD.drawCenterline(ctx, xO, 55, xO, 475);

        // Depósito inferior de succión y tuberías de admisión/descarga con válvulas
        CAD.drawWaterSurface(ctx, 110, 405, 130, 65, theta, 1.4);
        CAD.drawWaterSurface(ctx, 560, 405, 130, 65, theta, 1.4);
        CAD.drawPipe(ctx, [[135, 425], [135, 235]], 14, CAD.COLORS.waterDeep, theta * 4, !movingRight, false);
        CAD.drawPipe(ctx, [[665, 425], [665, 235]], 14, CAD.COLORS.waterDeep, theta * 4, movingRight, false);

        // Colector superior unificado
        CAD.drawPipe(ctx, [[135, 155], [135, 100], [665, 100], [665, 155]], 14, CAD.COLORS.waterDeep, theta * 5, true, false);
        CAD.drawPipe(ctx, [[400, 100], [400, 48]], 16, CAD.COLORS.waterDeep, theta * 5, true, false);

        // Cilindros horizontales en corte
        CAD.drawCylinder(ctx, 115, 155, 155, 80, 9, 'copper', schematic);
        CAD.drawCylinder(ctx, 530, 155, 155, 80, 9, 'copper', schematic);
        const xPistL = xYoke - 190, xPistR = xYoke + 190;
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(116, 157, Math.max(0, xPistL - 116), 76);
        ctx.fillRect(xPistR + 10, 157, Math.max(0, 684 - (xPistR + 10)), 76);

        CAD.drawCheckValve(ctx, 124, 235, 22, !movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 124, 155, 22, movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 652, 235, 22, movingRight ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 652, 155, 22, !movingRight ? 0.9 : 0, 0);

        // Rueda hidráulica + Yugo escocés rígido alrededor de pin A
        CAD.drawWaterwheel(ctx, xO, yO, 92, 12, theta, schematic);
        CAD.drawGear(ctx, xO, yO, 62, 18, theta, 'brass', schematic);

        ctx.fillStyle = '#f4f4f5'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.5;
        ctx.fillRect(xYoke - 14, 286, 28, 128); ctx.strokeRect(xYoke - 14, 286, 28, 128);
        ctx.fillStyle = '#e4e4e7';
        ctx.fillRect(xYoke - 7, 294, 14, 112);

        CAD.drawLink(ctx, xPistL, 195, xPistR, 195, 10, 'iron', schematic);
        CAD.drawLink(ctx, xYoke, 195, xYoke, 286, 10, 'iron', schematic);
        CAD.drawPiston(ctx, xPistL, 195, 22, 72, schematic);
        CAD.drawPiston(ctx, xPistR, 195, 22, 72, schematic);

        CAD.drawLink(ctx, xO, yO, xA, yA, 11, 'brass', schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 7, 'O₂');
        CAD.drawPin(ctx, xA, yA, 6, 'A');

        CAD.drawCallout(ctx, xYoke + 14, 315, 535, 295, 'Yugo escocés (ranura deslizante)', 'left');
        CAD.drawCallout(ctx, 400, 72, 470, 62, 'Flujo continuo al aljibe', 'left');
        CAD.drawCallout(ctx, xPistL, 195, 210, 125, movingRight ? 'Izq: Impulsa' : 'Izq: Aspira', 'right');

        CAD.drawPhaseCaption(ctx, w, h,
            movingRight ? 'Desplazamiento a la derecha' : 'Desplazamiento a la izquierda',
            'El pasador excéntrico desliza en la ranura vertical moviendo ambos émbolos en contrafase sin interrumpir el caudal.');
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

        CAD.drawGroundSupport(ctx, 400, 475, 520, 12);
        CAD.drawWaterSurface(ctx, 180, 420, 440, 55, theta, 1.2);
        CAD.drawCenterline(ctx, xO, 55, xO, 475);

        // Cilindros sumergidos de bronce + tuberías hacia cámara de aire central
        CAD.drawCylinder(ctx, xO - arm - 34, 280, 68, 145, 9, 'brass', schematic);
        CAD.drawCylinder(ctx, xO + arm - 34, 280, 68, 145, 9, 'brass', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(xO - arm - 33, yPL, 66, 425 - yPL);
        ctx.fillRect(xO + arm - 33, yPR, 66, 425 - yPR);

        CAD.drawPipe(ctx, [[xO - arm + 35, 400], [360, 400]], 14, CAD.COLORS.waterDeep, theta * 4, !leftUp, false);
        CAD.drawPipe(ctx, [[xO + arm - 35, 400], [440, 400]], 14, CAD.COLORS.waterDeep, theta * 4, leftUp, false);

        // Cámara central de aire comprimido (Plenum) con tobera superior continua
        ctx.fillStyle = 'rgba(229, 205, 143, 0.25)'; ctx.strokeStyle = CAD.COLORS.brassDark; ctx.lineWidth = 2.5;
        ctx.fillRect(356, 240, 88, 170); ctx.strokeRect(356, 240, 88, 170);
        CAD.drawWaterSurface(ctx, 358, 322 + Math.sin(theta * 2) * 3, 84, 86, theta, 1.2);
        CAD.drawPipe(ctx, [[400, 240], [400, 185]], 12, CAD.COLORS.waterDeep, theta * 5, true, false);
        CAD.drawFluidParticles(ctx, 400, 182, 400, 75, theta * 6, true, CAD.COLORS.waterDeep);

        CAD.drawCheckValve(ctx, xO - arm - 14, 425, 28, leftUp ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, xO + arm - 14, 425, 28, !leftUp ? 0.9 : 0, 0);

        CAD.drawLink(ctx, xL, yL, xO - arm, yPL, 8, 'iron', schematic);
        CAD.drawLink(ctx, xR, yR, xO + arm, yPR, 8, 'iron', schematic);
        CAD.drawPiston(ctx, xO - arm, yPL, 64, 20, schematic);
        CAD.drawPiston(ctx, xO + arm, yPR, 64, 20, schematic);

        CAD.drawTimberBeam(ctx, xL - 70 * Math.cos(psi), yL - 70 * Math.sin(psi), xR + 70 * Math.cos(psi), yR + 70 * Math.sin(psi), 12, schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 7, 'O');
        CAD.drawPin(ctx, xL, yL, 5);
        CAD.drawPin(ctx, xR, yR, 5);

        CAD.drawCallout(ctx, 400, 278, 520, 225, 'Colchón de aire comprimido', 'left');
        CAD.drawCallout(ctx, 400, 115, 480, 95, 'Chorro continuo sin pulsos', 'left');
        CAD.drawCallout(ctx, xO - arm - 35, 350, 130, 310, leftUp ? 'Izq: Aspira' : 'Izq: Impulsa al plenum', 'right');

        CAD.drawPhaseCaption(ctx, w, h, 'Estabilización neumática del caudal',
            'Cada pistón impulsa agua por turnos hacia la cámara central; el aire comprimido superior amortigua los picos y mantiene un chorro continuo.');
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

        CAD.drawGroundSupport(ctx, 400, 470, 560, 12);
        CAD.drawMasonry(ctx, xO4 - 28, yO4, 56, 310);

        CAD.drawCylinder(ctx, xO4 - armL - 36, 285, 72, 165, 9, 'brass', schematic);
        CAD.drawCylinder(ctx, xO4 + armL - 36, 285, 72, 165, 9, 'brass', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(xO4 - armL - 35, yPL, 70, 450 - yPL);
        ctx.fillRect(xO4 + armL - 35, yPR, 70, 450 - yPR);

        CAD.drawPipe(ctx, [[xO4 - armL + 36, 420], [xO4, 420], [xO4 + armL - 36, 420]], 14, CAD.COLORS.waterDeep, theta * 4, true, false);
        CAD.drawPipe(ctx, [[xO4, 420], [xO4, 330]], 14, CAD.COLORS.waterDeep, theta * 4, true, false);

        CAD.drawCheckValve(ctx, xO4 - armL - 15, 450, 30, leftUp ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, xO4 + armL - 15, 450, 30, !leftUp ? 0.9 : 0, 0);

        CAD.drawLink(ctx, xL, yL, xO4 - armL, yPL, 8, 'iron', schematic);
        CAD.drawLink(ctx, xR, yR, xO4 + armL, yPR, 8, 'iron', schematic);
        CAD.drawPiston(ctx, xO4 - armL, yPL, 68, 20, schematic);
        CAD.drawPiston(ctx, xO4 + armL, yPR, 68, 20, schematic);

        CAD.drawWaterwheel(ctx, xO2, yO2, 75, 10, theta, schematic);
        CAD.drawLink(ctx, xO2, yO2, xA, yA, 12, 'iron', schematic);
        CAD.drawLink(ctx, xA, yA, xL, yL, 9, 'brass', schematic);
        CAD.drawTimberBeam(ctx, xL - 14, yL - 2, xR + 14, yR + 2, 15, schematic);

        CAD.drawFixedPivot(ctx, xO2, yO2, 7, 'O₂');
        CAD.drawFixedPivot(ctx, xO4, yO4, 8, 'O₄');
        CAD.drawPin(ctx, xA, yA, 6, 'A');
        CAD.drawPin(ctx, xL, yL, 5, 'B₁');
        CAD.drawPin(ctx, xR, yR, 5, 'B₂');

        CAD.drawCallout(ctx, xO4 + 45, yO4 + 8, 615, 95, 'Balancín simétrico reduce desgaste lateral', 'left');
        CAD.drawPhaseCaption(ctx, w, h, 'Accionamiento manivela-balancín',
            'La rueda motriz oscila el balancín superior para bombear en ambos cilindros de manera desfasada 180°.');
    };

    // 16. BOMBA ROTATIVA DE PALETAS DE RAMELLI
    R.ramelli_rotary_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 400, cy = 275, Rst = 132, e = 34;
        const rRotY = cy + e, rRotor = Rst - e - 3;

        CAD.drawGroundSupport(ctx, cx, 445, 290, 14);
        CAD.drawCenterline(ctx, 180, cy, 620, cy);
        CAD.drawCenterline(ctx, cx, 105, cx, 435);

        // Tuberías de entrada (izq) y salida presurizada (der)
        CAD.drawPipe(ctx, [[120, 260], [268, 260]], 28, CAD.COLORS.water, theta * 4, true, false);
        CAD.drawPipe(ctx, [[532, 260], [680, 260]], 28, CAD.COLORS.waterDeep, theta * 5, true, false);

        // Carcasa estator cilíndrica en corte
        ctx.fillStyle = schematic ? '#fff' : '#e4e4e7'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, Rst + 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = CAD.COLORS.water;
        ctx.beginPath(); ctx.arc(cx, cy, Rst, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Rotor excéntrico y 4 paletas deslizantes manteniendo contacto exacto con pared
        ctx.fillStyle = '#d4d4d8'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, rRotY, rRotor, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        for (let i = 0; i < 4; i++) {
            const ang = theta + (i * Math.PI) / 2;
            const ux = Math.cos(ang), uy = Math.sin(ang);
            const b = e * uy;
            const tWall = -b + Math.sqrt(b * b + (Rst * Rst - e * e));
            const tipX = cx + tWall * ux, tipY = rRotY + tWall * uy;
            const baseX = cx + (rRotor * 0.3) * ux, baseY = rRotY + (rRotor * 0.3) * uy;
            CAD.drawLink(ctx, baseX, baseY, tipX, tipY, 9, 'brass', schematic);
            CAD.drawPin(ctx, tipX, tipY, 3.5);
        }

        CAD.drawPin(ctx, cx, cy, 4.5, 'O_est');
        CAD.drawFixedPivot(ctx, cx, rRotY, 7, 'O_rot');
        CAD.drawDimension(ctx, cx - 22, cy, cx - 22, rRotY, 'e = 35 mm', -48);
        CAD.drawCallout(ctx, 175, 260, 140, 145, 'Admisión (cámara se expande)', 'left');
        CAD.drawCallout(ctx, 620, 260, 560, 145, 'Impulsión (cámara se comprime)', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Desplazamiento positivo por volumen creciente/decreciente',
            'Al estar el rotor descentrado, las paletas forman cámaras que se amplían en la admisión y comprimen el agua hacia la salida.');
    };

    // 17. MÁQUINA ATMOSFÉRICA DE NEWCOMEN (1712)
    R.newcomen_newcomen_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 400, yO = 135, arm = 210;
        const psi = 0.19 * Math.sin(theta);
        const dy = arm * psi;
        const yPiston = 315 + dy, yPump = 415 - dy;
        const condensing = Math.cos(theta) > 0;

        CAD.drawGroundSupport(ctx, 400, 488, 660, 12);
        CAD.drawMasonry(ctx, 372, 135, 56, 353); // Muro central de mampostería

        // Lado izquierdo: Hogar, caldera de cobre y cilindro atmosférico
        CAD.drawFire(ctx, 190, 486, 66, theta);
        ctx.fillStyle = CAD.COLORS.copperMid; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(190, 462, 54, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();

        CAD.drawCylinder(ctx, 150, 250, 80, 155, 10, 'iron', schematic);
        ctx.fillStyle = condensing ? 'rgba(22, 114, 184, 0.22)' : 'rgba(220, 226, 232, 0.78)';
        ctx.fillRect(151, yPiston + 10, 78, 405 - (yPiston + 10));

        // Inyección de agua fría en carrera descendente
        CAD.drawPipe(ctx, [[75, 365], [155, 365]], 12, CAD.COLORS.waterDeep, theta * 5, condensing, false);
        if (condensing) CAD.drawFluidParticles(ctx, 155, 365, 218, 350, theta * 6, true, '#0b5fa5');

        CAD.drawPiston(ctx, 190, yPiston, 76, 20, schematic);
        ctx.fillStyle = CAD.COLORS.waterDeep; ctx.fillRect(152, yPiston - 14, 76, 4);

        // Lado derecho: Pozo de mina y vástago de bomba
        CAD.drawMasonry(ctx, 560, 340, 20, 148);
        CAD.drawMasonry(ctx, 640, 340, 20, 148);
        CAD.drawWaterSurface(ctx, 580, 360, 60, 128, theta, 1.4);
        CAD.drawPiston(ctx, 610, yPump, 54, 18, schematic);

        // Balancín oscilante con cabezas de arco circulares y cadenas siempre verticales
        ctx.save();
        ctx.translate(xO, yO); ctx.rotate(psi);
        CAD.drawTimberBeam(ctx, -arm, 0, arm, 0, 16, schematic);
        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(0, 0, arm, Math.PI - 0.30, Math.PI + 0.30); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, arm, -0.30, 0.30); ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 3; ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(190, yO - 28); ctx.lineTo(190, yPiston - 10);
        ctx.moveTo(610, yO - 28); ctx.lineTo(610, yPump - 9);
        ctx.stroke(); ctx.setLineDash([]);

        if (condensing) CAD.drawVector(ctx, 190, 260, 0, 35, CAD.COLORS.vectorThrust, 'P_atm');
        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₂');

        CAD.drawCallout(ctx, 190, 255, 85, 225, 'Cilindro abierto al aire arriba', 'right');
        CAD.drawCallout(ctx, 115, 365, 85, 330, 'Chorro frío condensador', 'right');
        CAD.drawCallout(ctx, 575, 110, 615, 78, 'Cabeza de arco (tiro vertical)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            condensing ? 'Carrera motriz por vacío atmosférico' : 'Admisión de vapor a baja presión',
            condensing ? 'El chorro de agua fría condensa el vapor creando vacío; la presión atmosférica externa empuja el pistón hacia abajo.'
                       : 'El contrapeso de la bomba de mina vuelve a subir el pistón mientras entra vapor desde la caldera.');
    };

    // 18. MOTOR DE VAPOR DE DENIS PAPIN (1690)
    R.papin_papin_steam_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xC = 285, cyc = theta / (Math.PI * 2);
        let lift = cyc < 0.45 ? cyc / 0.45 : (cyc < 0.6 ? 1.0 : Math.max(0, 1 - (cyc - 0.6) / 0.25));
        const yPist = 355 - lift * 125;
        const yWeight = 225 + lift * 125;
        const vacPhase = cyc >= 0.6;

        CAD.drawGroundSupport(ctx, 400, 475, 520, 12);
        CAD.drawTimberBeam(ctx, 430, 475, 430, 95, 14, schematic);

        CAD.drawFire(ctx, xC, 473, 72, theta);
        CAD.drawCylinder(ctx, xC - 40, 195, 80, 240, 9, 'brass', schematic);
        ctx.fillStyle = vacPhase ? 'rgba(22, 114, 184, 0.2)' : 'rgba(220, 226, 232, 0.8)';
        ctx.fillRect(xC - 39, yPist + 10, 78, 425 - (yPist + 10));

        // Polea superior + cable + peso levantado por la presión atmosférica al condensar
        CAD.drawGear(ctx, 430, 105, 30, 16, (1 - lift) * Math.PI * 2, 'iron', schematic);
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(xC, yPist); ctx.lineTo(xC, 105); ctx.lineTo(430, 75); ctx.lineTo(545, 105); ctx.lineTo(545, yWeight); ctx.stroke();

        CAD.drawHatchRect(ctx, 520, yWeight, 50, 42, CAD.COLORS.ironMid, 6);
        CAD.drawPiston(ctx, xC, yPist, 76, 20, schematic);
        CAD.drawFixedPivot(ctx, 430, 105, 6);

        CAD.drawCallout(ctx, xC, yPist, 145, 265, 'Pistón atmosférico', 'right');
        CAD.drawCallout(ctx, 545, yWeight + 20, 595, 320, 'Carga útil (27 kg)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            cyc < 0.45 ? '1. Expansión por vapor' : (cyc < 0.6 ? '2. Retención en punto muerto superior' : '3. Carrera motriz por condensación'),
            vacPhase ? 'Al enfriarse el cilindro el vapor condensa; el vacío permite a la atmósfera bajar el pistón e izar el peso.'
                     : 'El agua hervida en el fondo empuja el pistón hacia arriba hasta trabarse en el tope.');
    };

    // 19. MÁQUINA DE ALTA PRESIÓN DE LEUPOLD (1725)
    R.leupold_leupold_steam_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const s1 = 35 * Math.sin(theta), s2 = -s1;
        const p1Up = Math.cos(theta) > 0;

        CAD.drawGroundSupport(ctx, 400, 480, 620, 12);
        CAD.drawFire(ctx, 400, 478, 90, theta);
        ctx.fillStyle = CAD.COLORS.copperMid; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(400, 450, 56, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();

        // Llave distribuidora rotativa de 4 vías alimentando alternativamente ambos cilindros
        CAD.drawPipe(ctx, [[400, 394], [400, 350]], 14, 'rgba(217, 72, 15, 0.35)', theta * 4, true, false);
        CAD.drawPipe(ctx, [[400, 336], [280, 336], [280, 310]], 12, p1Up ? 'rgba(217, 72, 15, 0.45)' : '#f4f4f5', theta * 4, true, false);
        CAD.drawPipe(ctx, [[400, 336], [520, 336], [520, 310]], 12, !p1Up ? 'rgba(217, 72, 15, 0.45)' : '#f4f4f5', theta * 4, true, false);

        CAD.drawGear(ctx, 400, 336, 22, 12, theta, 'brass', schematic);
        CAD.drawCylinder(ctx, 250, 200, 60, 115, 8, 'iron', schematic);
        CAD.drawCylinder(ctx, 490, 200, 60, 115, 8, 'iron', schematic);
        CAD.drawPiston(ctx, 280, 260 - s1, 56, 18, schematic);
        CAD.drawPiston(ctx, 520, 260 - s2, 56, 18, schematic);

        // Dos balancines independientes accionando bombas de alta columna a los lados
        CAD.drawMasonry(ctx, 185, 130, 30, 350);
        CAD.drawMasonry(ctx, 585, 130, 30, 350);
        CAD.drawTimberBeam(ctx, 120, 130 - s1, 280, 130 + s1, 12, schematic);
        CAD.drawTimberBeam(ctx, 520, 130 + s2, 680, 130 - s2, 12, schematic);
        CAD.drawLink(ctx, 280, 130 + s1, 280, 260 - s1, 7, 'iron', schematic);
        CAD.drawLink(ctx, 520, 130 + s2, 520, 260 - s2, 7, 'iron', schematic);

        CAD.drawFixedPivot(ctx, 200, 130, 7, 'O₁');
        CAD.drawFixedPivot(ctx, 600, 130, 7, 'O₂');
        CAD.drawPin(ctx, 400, 336, 5);
        CAD.drawCallout(ctx, 400, 336, 485, 380, 'Válvula de 4 vías (admisión/escape)', 'left');
        CAD.drawCallout(ctx, 280, 200, 125, 225, 'Expansión directa a 4.5 bar', 'right');

        CAD.drawPhaseCaption(ctx, w, h, 'Máquina de alta presión sin condensación',
            'La llave de 4 vías alterna vapor vivo a 4.5 bar bajo cada pistón mientras el opuesto escapa directamente al aire.');
    };

    // 20. BOMBA DE VAPOR DE SAVERY (1698)
    R.savery_savery_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const phaseA = Math.sin(theta) > 0;
        const lvlA = 285 + 42 * Math.cos(theta), lvlB = 285 - 42 * Math.cos(theta);

        CAD.drawGroundSupport(ctx, 400, 480, 620, 12);
        CAD.drawWaterSurface(ctx, 270, 435, 360, 45, theta, 1.4);

        // Caldera lateral izquierda con hogar encendido
        CAD.drawFire(ctx, 145, 478, 70, theta);
        ctx.fillStyle = CAD.COLORS.copperMid; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(145, 435, 58, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();

        // Conducción de vapor superior hacia ambas cámaras ovales receptoras A y B
        CAD.drawPipe(ctx, [[145, 377], [145, 165], [555, 165]], 12, 'rgba(217, 72, 15, 0.35)', theta * 4, true, false);
        CAD.drawCylinder(ctx, 290, 210, 95, 140, 8, 'copper', schematic);
        CAD.drawCylinder(ctx, 505, 210, 95, 140, 8, 'copper', schematic);

        CAD.drawWaterSurface(ctx, 292, lvlA, 91, 350 - lvlA, theta, 1.2);
        CAD.drawWaterSurface(ctx, 507, lvlB, 91, 350 - lvlB, theta, 1.2);

        // Succión desde pozo + columna vertical común de impulsión
        CAD.drawPipe(ctx, [[337, 455], [337, 352]], 13, CAD.COLORS.waterDeep, theta * 4, phaseA, false);
        CAD.drawPipe(ctx, [[552, 455], [552, 352]], 13, CAD.COLORS.waterDeep, theta * 4, !phaseA, false);
        CAD.drawPipe(ctx, [[337, 352], [445, 352], [445, 75]], 14, CAD.COLORS.waterDeep, theta * 5, true, false);
        CAD.drawPipe(ctx, [[552, 352], [445, 352]], 14, CAD.COLORS.waterDeep, theta * 5, !phaseA, false);

        CAD.drawCheckValve(ctx, 322, 352, 26, phaseA ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 537, 352, 26, !phaseA ? 0.9 : 0, 0);

        CAD.drawCallout(ctx, 337, 250, 225, 240, phaseA ? 'Cámara A: Succión por vacío' : 'Cámara A: Impulsa vapor 3.8 bar', 'right');
        CAD.drawCallout(ctx, 552, 250, 625, 240, !phaseA ? 'Cámara B: Succión por vacío' : 'Cámara B: Impulsa vapor 3.8 bar', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Bomba térmica de desplazamiento directo sin pistón',
            'El vapor desplaza agua a alta presión hacia arriba; luego, al condensar por agua fría exterior, aspira agua del pozo por vacío.');
    };

    // 21. EOLÍPILA DE HERÓN
    R.heron_aeolipile = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 400, cy = 225, r = 64, spin = theta * 3.0;

        CAD.drawGroundSupport(ctx, 400, 480, 420, 12);
        CAD.drawFire(ctx, cx, 478, 120, theta);
        CAD.drawCylinder(ctx, 290, 355, 220, 100, 9, 'copper', schematic);
        CAD.drawWaterSurface(ctx, 292, 402, 216, 51, theta, 1.5);

        // Soportes huecos conductores de vapor hasta cojinetes laterales
        CAD.drawPipe(ctx, [[305, 355], [305, cy], [338, cy]], 14, 'rgba(212, 218, 224, 0.85)', theta * 5, true, false);
        CAD.drawPipe(ctx, [[495, 355], [495, cy], [462, cy]], 14, 'rgba(212, 218, 224, 0.85)', theta * 5, true, false);

        // Esfera giratoria y dos toberas acodadas opuestas
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(spin);
        ctx.fillStyle = schematic ? '#fff' : CAD.COLORS.brassLight;
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(0, -r - 20); ctx.lineTo(26, -r - 20);
        ctx.moveTo(0, r); ctx.lineTo(0, r + 20); ctx.lineTo(-26, r + 20);
        ctx.stroke();

        CAD.drawVector(ctx, 26, -r - 20, 52, 0, '#94a3b8', 'Chorro');
        CAD.drawVector(ctx, -26, r + 20, -52, 0, '#94a3b8', 'Chorro');
        ctx.restore();

        CAD.drawFixedPivot(ctx, 305, cy, 6, 'Cojinete');
        CAD.drawFixedPivot(ctx, 495, cy, 6);
        CAD.drawCallout(ctx, 305, 290, 175, 290, 'Columnas huecas de vapor', 'right');
        CAD.drawCallout(ctx, cx, cy, 560, 145, 'Reacción tangencial (τ = 2R·ṁ·v)', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Turbina termodinámica de reacción pura',
            'El vapor asciende por los ejes huecos y escapa tangencialmente por dos toberas opuestas, generando par de reacción.');
    };

    // 22. VENTILADOR CENTRÍFUGO DE AGRÍCOLA
    R.agricola_ventilation_fan = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cx = 365, cy = 300, R = 122, rotorAng = theta * 2.5;

        CAD.drawGroundSupport(ctx, 365, 465, 360, 12);
        // Carcasa espiral voluta y chimenea de expulsión tangencial
        ctx.fillStyle = schematic ? '#fff' : '#f4f4f5'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillRect(cx + 52, 70, 66, 200); ctx.strokeRect(cx + 52, 70, 66, 200);

        // Rodete de 6 álabes curvos
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(rotorAng);
        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 6;
        for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI * 2) / 6;
            ctx.beginPath();
            ctx.moveTo(20 * Math.cos(a), 20 * Math.sin(a));
            ctx.quadraticCurveTo(70 * Math.cos(a + 0.35), 70 * Math.sin(a + 0.35), R * Math.cos(a + 0.15), R * Math.sin(a + 0.15));
            ctx.stroke();
        }
        ctx.restore();

        // Partículas de aire acelerando radialmente hacia afuera y saliendo arriba
        for (let i = 0; i < 6; i++) {
            const p = ((theta / (Math.PI * 2)) + i / 6) % 1;
            const rr = 22 + p * (R - 22);
            const ang = rotorAng + i * 1.05;
            ctx.fillStyle = '#0b5fa5';
            ctx.beginPath(); ctx.arc(cx + rr * Math.cos(ang), cy + rr * Math.sin(ang), 3.4, 0, Math.PI * 2); ctx.fill();
        }
        CAD.drawFluidParticles(ctx, cx + 85, 270, cx + 85, 70, theta * 5, true, '#0b5fa5');

        CAD.drawFixedPivot(ctx, cx, cy, 10, 'O');
        CAD.drawCallout(ctx, cx, cy, 150, 210, 'Ojo de aspiración axial', 'right');
        CAD.drawCallout(ctx, cx + 85, 130, 565, 130, 'Conducto de ventilación (950 m³/h)', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Aceleración centrífuga en carcasa voluta',
            'El aire ingresa axialmente por el centro del rodete, es impulsado hacia el perímetro y sale presurizado hacia la galería minera.');
    };

    // 23. HORNO METALÚRGICO EÓLICO HUAYRA
    R.inca_huayra_furnace = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);

        CAD.drawGroundSupport(ctx, 400, 475, 420, 14);
        // Paredes refractarias troncocónicas con toberas laterales acampanadas
        CAD.drawMasonry(ctx, 265, 145, 32, 330);
        CAD.drawMasonry(ctx, 503, 145, 32, 330);

        // Toberas abocardadas dejando pasar viento andino
        CAD.drawPipe(ctx, [[220, 240], [315, 265]], 18, 'rgba(11, 79, 140, 0.25)', theta * 5, true, false);
        CAD.drawPipe(ctx, [[220, 340], [315, 365]], 18, 'rgba(11, 79, 140, 0.25)', theta * 5, true, false);
        CAD.drawPipe(ctx, [[580, 240], [485, 265]], 18, 'rgba(11, 79, 140, 0.25)', theta * 5, true, false);

        // Lecho incandescente de carbón y mena de plata
        const pulse = 0.65 + 0.3 * Math.sin(theta * 2);
        ctx.fillStyle = `rgba(217, 72, 15, ${pulse})`;
        ctx.fillRect(298, 335, 204, 138);
        CAD.drawFire(ctx, 400, 335, 160, theta);

        // Penacho térmico ascendente de convección natural
        CAD.drawFluidParticles(ctx, 370, 320, 370, 75, theta * 4, true, '#d9480f');
        CAD.drawFluidParticles(ctx, 430, 320, 430, 75, theta * 4, true, '#d9480f');

        CAD.drawVector(ctx, 90, 240, 85, 0, CAD.COLORS.vectorThrust, 'Viento de ladera');
        CAD.drawCallout(ctx, 255, 250, 155, 165, 'Tobera troncocónica (Venturi)', 'right');
        CAD.drawCallout(ctx, 400, 405, 580, 415, 'Lecho reductor (~960 °C)', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Tiro forzado natural sin fuelles',
            'El viento de montaña se acelera al atravesar las bocas acampanadas y alimenta la combustión de galena argentífera.');
    };

})(window.MACHINE_RENDERERS);
