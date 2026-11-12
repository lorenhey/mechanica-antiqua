/**
 * Mechanica Antiqua - Ilustraciones Cutaway 2D: Hidráulica, Clepsidras y Elevación de Agua (11 máquinas)
 */

window.MACHINE_RENDERERS = window.MACHINE_RENDERERS || {};

(function(R) {
    'use strict';

    // 1. LAVAMANOS NEUMÁTICO DE FILÓN DE BIZANCIO (Frasco de Mariotte)
    R.philo_washbasin = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = (theta / (Math.PI * 2));
        // Fases reales:
        // 0.00 - 0.30: Grifo/cazo extrae agua de la cubeta; nivel baja y destapa el extremo del tubo de aire.
        // 0.30 - 0.72: Entra aire (burbujas suben al depósito cerrado), igualando presión y dejando caer agua por el conducto de descarga.
        // 0.72 - 1.00: El nivel vuelve a sellar la boca del tubo de aire; se restablece el vacío parcial superior y cesa el flujo.
        let basinDrop = 0;
        let draining = false, bubbling = false, refilling = false;
        let stepTitle = '', stepDesc = '';

        if (cyc < 0.30) {
            const p = cyc / 0.30;
            basinDrop = p * 18;
            draining = true;
            stepTitle = '1. Extracción';
            stepDesc = 'Se retira agua de la cubeta; la superficie desciende hasta destapar la boca del tubo de aire.';
        } else if (cyc < 0.75) {
            const p = (cyc - 0.30) / 0.45;
            basinDrop = 18 * (1 - p);
            bubbling = true;
            refilling = true;
            stepTitle = '2. Reposición barométrica';
            stepDesc = 'El aire entra y burbujea hacia la cámara superior, permitiendo que baje agua hasta resellar el tubo.';
        } else {
            basinDrop = 0;
            stepTitle = '3. Equilibrio sellado';
            stepDesc = 'El agua sella el tubo de aire; la depresión superior (P < P_atm) sostiene la columna sin válvulas.';
        }

        const tankX = 290, tankY = 75, tankW = 220, tankH = 175;
        const basinX = 225, basinY = 345, basinW = 350, basinH = 115;
        const eqLevel = 398;
        const curLevel = eqLevel + basinDrop;
        const upperWaterY = 148 + (cyc * 14); // Ligero descenso visual del depósito superior

        // Pedestal y columnas soporte de bronce (ancladas bajo las esquinas del depósito)
        CAD.drawGroundSupport(ctx, 400, basinY + basinH, 420, 12);
        CAD.drawLink(ctx, 298, tankY + tankH + 4, 298, basinY, 10, 'brass', schematic);
        CAD.drawLink(ctx, 502, tankY + tankH + 4, 502, basinY, 10, 'brass', schematic);

        // Depósito hermético superior (tapa cónica sellada con tapón)
        CAD.drawCylinder(ctx, tankX, tankY, tankW, tankH, 9, 'copper', schematic);
        ctx.fillStyle = schematic ? '#fff' : '#f4f4f5';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2;
        ctx.fillRect(tankX - 10, tankY - 12, tankW + 20, 12);
        ctx.strokeRect(tankX - 10, tankY - 12, tankW + 20, 12);
        // Tapón superior hermético
        CAD.drawHatchRect(ctx, 378, tankY - 26, 44, 14, CAD.COLORS.brassMid, 5);

        // Espacio de aire con vacío parcial (P_gas < P_atm) + agua superior
        ctx.fillStyle = bubbling ? 'rgba(228, 228, 231, 0.35)' : 'rgba(219, 234, 254, 0.25)';
        ctx.fillRect(tankX + 1, tankY, tankW - 2, upperWaterY - tankY);
        CAD.drawWaterSurface(ctx, tankX + 1, upperWaterY, tankW - 2, tankY + tankH - upperWaterY, theta, 1.2);

        // Cubeta inferior
        CAD.drawCylinder(ctx, basinX, basinY, basinW, basinH, 9, 'brass', schematic);
        ctx.fillStyle = CAD.COLORS.ink;
        ctx.fillRect(basinX - 9, basinY + basinH, basinW + 18, 6);
        CAD.drawWaterSurface(ctx, basinX + 1, curLevel, basinW - 2, basinY + basinH - curLevel, theta, (draining || refilling) ? 2.2 : 0.6);

        // Línea de consigna barométrica h_eq
        CAD.drawCenterline(ctx, basinX - 20, eqLevel, basinX + basinW + 25, eqLevel);

        // Tubo 1 (Izq): Tubo de admisión de aire sumergido hasta eqLevel + 2
        CAD.drawPipe(ctx, [[350, 108], [350, eqLevel + 2]], 15, '#ffffff', theta * 3, bubbling, true);
        // Burbujas emergiendo arriba en cámara de aire
        if (bubbling) {
            for (let b = 0; b < 3; b++) {
                const bx = 346 + b * 5;
                const by = 104 + Math.sin(theta * 5 + b) * 4;
                ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0b5fa5'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
        }

        // Tubo 2 (Der): Conducto de agua desde fondo depósito hasta cubeta sumergida
        CAD.drawPipe(ctx, [[450, tankY + tankH - 2], [450, 442]], 15, CAD.COLORS.waterDeep, theta * 3, refilling, false);

        // Grifo lateral derecho de extracción que justifica el descenso de nivel
        CAD.drawPipe(ctx, [[basinX + basinW + 6, 430], [615, 430], [615, 448]], 12, CAD.COLORS.waterDeep, theta * 3, draining, false);
        if (draining) {
            CAD.drawFluidParticles(ctx, 615, 448, 615, 488, theta * 4, true, CAD.COLORS.waterDeep);
        }

        // Vectores P_atm empujando la superficie libre de la cubeta
        CAD.drawVector(ctx, 270, 355, 0, 32, CAD.COLORS.vectorThrust, 'P_atm');
        CAD.drawVector(ctx, 515, 355, 0, 32, CAD.COLORS.vectorThrust, '');

        // Etiquetas claras señalando cada parte física
        CAD.drawCallout(ctx, 400, tankY - 19, 175, 58, 'Tapón hermético superior', 'right');
        CAD.drawCallout(ctx, 425, 115, 565, 110, bubbling ? 'Aire entra (P ≈ P_atm)' : 'Aire en vacío parcial (P < P_atm)', 'left');
        CAD.drawCallout(ctx, 350, 290, 175, 290, 'Tubo barométrico de aire', 'right');
        CAD.drawCallout(ctx, 450, 290, 565, 290, 'Conducto de descarga', 'left');
        CAD.drawCallout(ctx, 250, eqLevel, 175, 398, 'Nivel de equilibrio', 'right');
        CAD.drawCallout(ctx, 615, 430, 635, 395, 'Uso / extracción', 'left');

        CAD.drawPhaseCaption(ctx, w, h, stepTitle, stepDesc);
    };

    // 2. CLEPSIDRA DE FLUJO CONSTANTE DE CTESIBIO
    R.ctesibius_clepsydra = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = theta / (Math.PI * 2);
        const floatY = 425 - cyc * 155;
        const pinionAng = cyc * Math.PI * 2;

        // Soporte completo al suelo
        CAD.drawGroundSupport(ctx, 400, 470, 560, 12);
        CAD.drawMasonry(ctx, 115, 250, 140, 220);

        // Vaso regulador superior de nivel constante (válvula cónica de flotador)
        CAD.drawCylinder(ctx, 130, 115, 110, 125, 8, 'brass', schematic);
        CAD.drawWaterSurface(ctx, 132, 165, 106, 73, theta, 1.0);
        // Suministro irregular arriba + aguja cónica flotante
        CAD.drawPipe(ctx, [[185, 55], [185, 125]], 14, CAD.COLORS.waterDeep, theta * 4, true, false);
        ctx.fillStyle = CAD.COLORS.brassMid; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(175, 145); ctx.lineTo(195, 145); ctx.lineTo(185, 122); ctx.closePath(); ctx.fill(); ctx.stroke();
        CAD.drawHatchRect(ctx, 172, 150, 26, 16, CAD.COLORS.copperLight, 5);

        // Caño de goteo calibrado a carga h0 constante hacia el cilindro horario
        CAD.drawPipe(ctx, [[242, 212], [295, 212], [295, 245]], 11, CAD.COLORS.waterDeep, theta * 4, true, false);
        CAD.drawFluidParticles(ctx, 295, 248, 295, floatY - 12, theta * 5, true, CAD.COLORS.waterDeep);

        // Cilindro horario inferior + flotador + cremallera vertical
        CAD.drawCylinder(ctx, 275, 240, 120, 230, 9, 'brass', schematic);
        CAD.drawWaterSurface(ctx, 277, floatY, 116, 470 - floatY, theta, 0.8);
        CAD.drawHatchRect(ctx, 295, floatY - 12, 80, 18, CAD.COLORS.copperMid, 5);

        // Cremallera dentada vertical
        const rackTop = floatY - 190;
        CAD.drawLink(ctx, 335, floatY - 12, 335, rackTop, 10, 'iron', schematic);
        for (let ry = rackTop + 8; ry < floatY - 22; ry += 12) {
            ctx.fillStyle = CAD.COLORS.ink;
            ctx.fillRect(340, ry, 7, 5);
        }

        // Piñón engranado y cuadrante horario de columna derecha
        CAD.drawGear(ctx, 376, 175, 32, 16, pinionAng, 'brass', schematic);
        CAD.drawLink(ctx, 376, 175, 575, 175, 8, 'iron', schematic);

        // Columna soporte del cuadrante de 24 h
        CAD.drawMasonry(ctx, 545, 255, 60, 215);
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(575, 175, 82, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        for (let hTick = 0; hTick < 12; hTick++) {
            const a = (hTick / 12) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(575 + 68 * Math.cos(a), 175 + 68 * Math.sin(a));
            ctx.lineTo(575 + 77 * Math.cos(a), 175 + 77 * Math.sin(a));
            ctx.stroke();
        }
        CAD.drawVector(ctx, 575, 175, 62 * Math.cos(pinionAng - Math.PI / 2), 62 * Math.sin(pinionAng - Math.PI / 2), '#dc2626', '');
        CAD.drawFixedPivot(ctx, 376, 175, 5);
        CAD.drawPin(ctx, 575, 175, 5);

        CAD.drawDimension(ctx, 110, 165, 110, 212, 'h₀ = cte', 0);
        CAD.drawCallout(ctx, 185, 134, 85, 92, 'Válvula cónica reguladora', 'right');
        CAD.drawCallout(ctx, 295, 222, 345, 90, 'Caudal constante por nivel fijo', 'left');
        CAD.drawCallout(ctx, 335, floatY - 70, 445, 295, 'Cremallera sobre flotador', 'left');
        CAD.drawCallout(ctx, 575, 175, 650, 95, 'Aguja horaria lineal', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Flujo laminar constante',
            'El flotador cónico mantiene la carga h₀ constante en el vaso superior; así el nivel horario sube a velocidad uniforme.');
    };

    // 3. RELOJ DEL ELEFANTE DE AL-JAZARI
    R.al_jazari_elephant_clock = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = theta / (Math.PI * 2);
        const sinking = cyc < 0.80;
        const sinkProg = sinking ? (cyc / 0.80) : (1 - (cyc - 0.80) / 0.20);
        const bowlY = 290 + sinkProg * 72;

        CAD.drawGroundSupport(ctx, 400, 470, 560, 12);
        // Cuerpo interno del depósito dentro del elefante
        CAD.drawCylinder(ctx, 155, 245, 250, 225, 10, 'copper', schematic);
        CAD.drawWaterSurface(ctx, 157, 295, 246, 173, theta, sinking ? 0.6 : 3.0);

        // Cuenco tarjahar perforado en el fondo
        ctx.save();
        ctx.fillStyle = CAD.COLORS.brassMid; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(280, bowlY, 46, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
        // Agua entrando por el orificio calibrado inferior del tarjahar
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.beginPath(); ctx.arc(280, bowlY + 2, 42 * Math.sqrt(sinkProg), 0, Math.PI); ctx.fill();
        ctx.restore();

        // Cadena tensada que tira del disparador superior al hundirse
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(280, bowlY + 46); ctx.lineTo(280, 130); ctx.lineTo(445, 130); ctx.stroke();

        // Torreta superior de bolas de bronce + balancín disparador
        CAD.drawHatchRect(ctx, 455, 65, 120, 44, CAD.COLORS.brassLight, 8);
        const tilt = sinking ? 0.05 : -0.32;
        ctx.save();
        ctx.translate(455, 130);
        ctx.rotate(tilt);
        CAD.drawLink(ctx, -40, 0, 55, 0, 9, 'brass', schematic);
        ctx.restore();
        CAD.drawFixedPivot(ctx, 455, 130, 6);

        // Canaleta en S de descarga de bola + golpe en platillo/pájaro
        CAD.drawPipe(ctx, [[515, 135], [615, 195], [515, 275], [600, 355]], 18, '#f4f4f5', 0, false, false);
        if (!sinking) {
            const p = (cyc - 0.80) / 0.20;
            const bx = 515 + Math.sin(p * Math.PI * 2) * 50;
            const by = 135 + p * 215;
            CAD.drawPin(ctx, bx, by, 7.5);
        } else {
            CAD.drawPin(ctx, 495, 86, 7.5);
            CAD.drawPin(ctx, 515, 86, 7.5);
        }

        // Campana/gong inferior
        ctx.fillStyle = CAD.COLORS.brassMid; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(600, 375, 22, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();

        CAD.drawCallout(ctx, 280, bowlY + 18, 85, 330, 'Cuenco perforado (Tarjahar)', 'right');
        CAD.drawCallout(ctx, 280, 175, 145, 165, 'Cadena disparadora', 'right');
        CAD.drawCallout(ctx, 515, 86, 635, 86, 'Depósito de bolas (30 min)', 'left');
        CAD.drawCallout(ctx, 600, 375, 635, 375, 'Percusión sonora + reinicio', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            sinking ? '1. Temporización hidráulica' : '2. Disparo y reinicio',
            sinking ? 'El agua penetra por el orificio calibrado y hunde gradualmente el cuenco tarjahar.'
                    : 'El cuenco colapsa, tensa la cadena y libera una esfera que marca la media hora y vacía el cuenco.');
    };

    // 4. FUENTE ALTERNANTE DE LOS BANU MUSA
    R.banu_musa_alternating_fountain = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const centralActive = Math.sin(theta) >= 0;
        const tilt = centralActive ? -0.22 : 0.22;

        CAD.drawGroundSupport(ctx, 400, 468, 460, 12);
        // Pedestal y cámara presurizada inferior dividida
        CAD.drawCylinder(ctx, 240, 260, 320, 208, 10, 'copper', schematic);
        // Tabique horizontal interno con cámara superior recolectora
        ctx.fillStyle = CAD.COLORS.brassDark;
        ctx.fillRect(241, 332, 318, 6);

        CAD.drawWaterSurface(ctx, 242, 372, 316, 94, theta, 1.5);

        // Balancín basculante con cazoletas laterales que invierten válvulas cónicas
        const ox = 400, oy = 298;
        const xL = ox - 95 * Math.cos(tilt), yL = oy - 95 * Math.sin(tilt);
        const xR = ox + 95 * Math.cos(tilt), yR = oy + 95 * Math.sin(tilt);
        CAD.drawLink(ctx, xL, yL, xR, yR, 9, 'brass', schematic);
        CAD.drawFixedPivot(ctx, ox, oy, 6);

        // Válvulas cónicas abriendo alternativamente paso al tubo central vs tubo anular
        CAD.drawPin(ctx, xL, yL + 10, 7);
        CAD.drawPin(ctx, xR, yR + 10, 7);

        // Tubería de alimentación desde tanque elevado (izq)
        CAD.drawPipe(ctx, [[125, 115], [125, 420], [238, 420]], 14, CAD.COLORS.waterDeep, theta * 4, true, false);

        // Dos toberas concéntricas arriba de la fuente
        CAD.drawPipe(ctx, [[400, 260], [400, 185]], 14, centralActive ? CAD.COLORS.waterDeep : '#ffffff', theta * 5, centralActive, false);
        CAD.drawPipe(ctx, [[360, 260], [360, 200]], 10, !centralActive ? CAD.COLORS.waterDeep : '#ffffff', theta * 5, !centralActive, false);
        CAD.drawPipe(ctx, [[440, 260], [440, 200]], 10, !centralActive ? CAD.COLORS.waterDeep : '#ffffff', theta * 5, !centralActive, false);

        // Chorros parabólicos visibles arriba
        if (centralActive) {
            CAD.drawFluidParticles(ctx, 400, 182, 400, 75, theta * 6, true, CAD.COLORS.waterDeep);
        } else {
            CAD.drawFluidParticles(ctx, 360, 196, 305, 105, theta * 6, true, CAD.COLORS.waterDeep);
            CAD.drawFluidParticles(ctx, 440, 196, 495, 105, theta * 6, true, CAD.COLORS.waterDeep);
        }

        CAD.drawCallout(ctx, 125, 180, 148, 125, 'Presión hidrostática (2.2 m)', 'left');
        CAD.drawCallout(ctx, ox, oy, 180, 298, 'Balancín conmutador', 'right');
        CAD.drawCallout(ctx, 400, 185, 550, 150, 'Tobera central', 'left');
        CAD.drawCallout(ctx, 440, 205, 585, 215, 'Corona anular lateral', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            centralActive ? 'Estado A: Chorro central único' : 'Estado B: Corona anular múltiple',
            'El vaciado alterno del depósito basculante invierte las válvulas cónicas sin intervención humana.');
    };

    // 5. ACUEDUCTO ROMANO Y SIFÓN INVERTIDO (VENTER)
    R.roman_aqueduct = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);

        // Relieve del valle + estribos y puente venter de sillería
        ctx.fillStyle = '#e7e5e4';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(40, 225); ctx.lineTo(195, 225); ctx.lineTo(315, 425);
        ctx.lineTo(485, 425); ctx.lineTo(605, 250); ctx.lineTo(760, 250);
        ctx.lineTo(760, 488); ctx.lineTo(40, 488); ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Arcadas y puente venter de mampostería sosteniendo tuberías
        CAD.drawMasonry(ctx, 165, 180, 45, 70); // Castellum de cabecera
        CAD.drawMasonry(ctx, 590, 200, 45, 70); // Castellum receptor
        CAD.drawMasonry(ctx, 315, 420, 170, 35); // Puente venter en el fondo del valle

        // Conducción libre + sifón presurizado en U (hollow double-wall pipe!)
        CAD.drawPipe(ctx, [
            [40, 205], [185, 208], [315, 408], [485, 408], [612, 226], [760, 232]
        ], 18, CAD.COLORS.waterDeep, theta * 4, true, false);

        // Línea piezométrica hidráulica (HGL) ligeramente inclinada por pérdidas de carga
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([7, 4]);
        ctx.beginPath(); ctx.moveTo(185, 208); ctx.lineTo(612, 226); ctx.stroke();
        ctx.setLineDash([]);

        CAD.drawDimension(ctx, 400, 217, 400, 408, 'ΔH = 46 m (4.5 bar)', 0);
        CAD.drawVector(ctx, 360, 408, 0, -48, CAD.COLORS.vectorThrust, 'P_venter');

        CAD.drawCallout(ctx, 110, 205, 95, 115, 'Canal por gravedad (i = 2 ‰)', 'left');
        CAD.drawCallout(ctx, 185, 185, 260, 115, 'Castellum de entrada', 'left');
        CAD.drawCallout(ctx, 490, 220, 520, 145, 'Línea piezométrica (HGL)', 'left');
        CAD.drawCallout(ctx, 400, 435, 540, 455, 'Puente sifón (Venter) presurizado', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Principio de vasos comunicantes con pérdidas por fricción',
            'El conducto cerrado desciende 46 m bajo el valle soportando 4.5 bar para recuperar cota sin construir arcadas gigantes.');
    };

    // 6. TORNILLO DE ARQUÍMEDES (COCHLEA VITRUVIANA)
    R.vitruvius_archimedes_screw = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO1 = 150, yO1 = 440;
        const beta = 36.87 * Math.PI / 180;
        const len = 450;
        const xO2 = xO1 + len * Math.cos(beta), yO2 = yO1 - len * Math.sin(beta);

        // Estanque inferior + canaleta de entrega superior + caballete
        CAD.drawGroundSupport(ctx, 400, 488, 700, 12);
        CAD.drawWaterSurface(ctx, 50, 408, 220, 80, theta, 1.5);
        CAD.drawTimberBeam(ctx, xO2, 488, xO2, yO2 + 12, 16, schematic);
        CAD.drawPipe(ctx, [[xO2, yO2 + 24], [735, yO2 + 24], [735, yO2 + 95]], 18, CAD.COLORS.waterDeep, theta * 4, true, false);

        // Cuerpo inclinado a 36.87° (3:4:5)
        ctx.save();
        ctx.translate(xO1, yO1);
        ctx.rotate(-beta);

        CAD.drawCenterline(ctx, -20, 0, len + 45, 0);
        CAD.drawTimberBeam(ctx, 0, 0, len, 0, 20, schematic);

        const R = 48, pitch = 72;
        const phase = (theta / (Math.PI * 2)) * pitch;

        // Bolsas de agua atrapadas por gravedad en cada seno inferior de la espira
        ctx.fillStyle = CAD.COLORS.waterDeep;
        for (let x = 40 + phase; x < len - 30; x += pitch) {
            ctx.beginPath(); ctx.ellipse(x, R * 0.56, 19, 13, 0, 0, Math.PI * 2); ctx.fill();
        }

        // Espira helicoidal sólida
        ctx.strokeStyle = CAD.COLORS.brassMid;
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let x = 20; x <= len - 20; x += 4) {
            const yy = R * Math.sin(((x - phase) / pitch) * Math.PI * 2);
            if (x === 20) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();

        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.strokeRect(18, -R - 3, len - 36, (R + 3) * 2);

        // Manivela motriz superior
        CAD.drawLink(ctx, len, 0, len + 28, 0, 8, 'iron', schematic);
        CAD.drawLink(ctx, len + 28, 0, len + 28, 38 * Math.cos(theta), 6, 'iron', schematic);
        ctx.restore();

        // Triángulo pitagórico 3:4:5 visible
        ctx.strokeStyle = '#0b4f8c'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(310, 440); ctx.lineTo(470, 440); ctx.lineTo(470, 320); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#0b4f8c'; ctx.font = '600 11px monospace';
        ctx.fillText('3 : 4 : 5 (β = 36.9°)', 345, 456);

        CAD.drawFixedPivot(ctx, xO1, yO1, 6, 'O₁');
        CAD.drawFixedPivot(ctx, xO2, yO2, 6, 'O₂');
        CAD.drawCallout(ctx, 290, 345, 165, 225, 'Bolsas fluidas atrapadas por gravedad', 'right');
        CAD.drawCallout(ctx, 415, 245, 275, 145, 'Hélice interior (α > β)', 'right');
        CAD.drawCallout(ctx, xO2 + 30, yO2 + 24, 610, 100, 'Descarga continua', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Transporte por cavidades helicoidales',
            'Al inclinarse menos que el ángulo de la hélice (β < α), cada espira confina agua en su fondo y la eleva al girar.');
    };

    // 7. MOLINO HIDRÁULICO DE VITRUVIO
    R.vitruvius_water_wheel = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xW = 195, yW = 345, xG = 425, xSp = 540;
        const millTheta = theta * 3.0;

        CAD.drawGroundSupport(ctx, 400, 488, 700, 12);
        // Canal fluvial inferior moviendo las paletas inferiores
        CAD.drawWaterSurface(ctx, 40, 430, 310, 58, theta, 2.2);
        CAD.drawFluidParticles(ctx, 50, 452, 330, 452, theta * 3, true, '#ffffff');

        // Bastidor del molino y eje principal
        CAD.drawMasonry(ctx, 355, 250, 290, 238);
        CAD.drawCenterline(ctx, 80, yW, 470, yW);
        CAD.drawCenterline(ctx, xSp, 80, xSp, 455);

        CAD.drawWaterwheel(ctx, xW, yW, 108, 14, theta, schematic);
        CAD.drawLink(ctx, xW, yW, xG, yW, 16, 'wood', schematic);
        CAD.drawGear(ctx, xG, yW, 68, 24, theta, 'wood', schematic);

        // Linterna vertical de husillos engranada 5:1 + eje vertical + muela giratoria
        CAD.drawGear(ctx, xSp - 45, yW, 24, 10, -millTheta, 'brass', schematic);
        CAD.drawLink(ctx, xSp - 45, 185, xSp - 45, 440, 11, 'iron', schematic);

        // Piedra solera fija y piedra volandera giratoria con tolva de grano arriba
        CAD.drawHatchRect(ctx, xSp - 125, 195, 160, 26, '#d4d4d8', 9);
        ctx.save();
        ctx.translate(xSp - 45, 174);
        ctx.fillStyle = '#e4e4e7'; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.8;
        ctx.fillRect(-75, -16, 150, 32); ctx.strokeRect(-75, -16, 150, 32);
        // Marca de giro multiplicado (5x)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(58 * Math.cos(millTheta) - 4, -16, 8, 32);
        ctx.restore();

        // Tolva cónica de grano encima
        ctx.fillStyle = CAD.COLORS.woodLight; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(xSp - 85, 80); ctx.lineTo(xSp - 5, 80); ctx.lineTo(xSp - 35, 150); ctx.lineTo(xSp - 55, 150); ctx.closePath(); ctx.fill(); ctx.stroke();

        CAD.drawFixedPivot(ctx, xW, yW, 7, 'O₁');
        CAD.drawFixedPivot(ctx, xSp - 45, 440, 6, 'Rangua');

        CAD.drawCallout(ctx, xW, yW - 108, 120, 120, 'Rueda hidráulica inferior', 'right');
        CAD.drawCallout(ctx, xG, yW - 68, 330, 120, 'Engranaje corona-linterna (5:1)', 'right');
        CAD.drawCallout(ctx, xSp - 10, 174, 645, 145, 'Muela volandera (65 rpm)', 'left');
        CAD.drawCallout(ctx, xSp - 45, 105, 645, 95, 'Tolva de grano', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Multiplicación en ángulo recto (5:1)',
            'Vitruvio invierte el par lento de la rueda fluvial mediante linterna vertical para llevar la piedra a ~65 rpm.');
    };

    // 8. SAQIYA (NORIA DE CANGILONES)
    R.african_saqiya = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xYugo = 195, yAx = 250, xNoria = 490;
        const rNoria = 110;

        CAD.drawGroundSupport(ctx, 400, 488, 700, 12);
        CAD.drawMasonry(ctx, 355, 345, 70, 143);
        CAD.drawWaterSurface(ctx, 425, 425, 155, 63, theta, 1.5);
        CAD.drawMasonry(ctx, 580, 345, 100, 143);

        // Canaleta receptora superior
        CAD.drawPipe(ctx, [[xNoria - 30, 145], [730, 185]], 18, CAD.COLORS.waterDeep, theta * 4, true, false);

        // Corona horizontal animal -> Linterna ortogonal -> Eje a rueda noria
        CAD.drawCenterline(ctx, 90, yAx, 560, yAx);
        CAD.drawGear(ctx, xYugo, yAx, 72, 22, theta, 'wood', schematic);
        CAD.drawLink(ctx, xYugo, yAx, xYugo + 95 * Math.cos(theta), yAx + 95 * Math.sin(theta), 10, 'wood', schematic);
        CAD.drawGear(ctx, 305, yAx, 32, 12, -theta * 1.83, 'brass', schematic);
        CAD.drawLink(ctx, 305, yAx, xNoria, yAx, 11, 'wood', schematic);

        // Noria y guirnalda continua de cangilones de barro
        CAD.drawWaterwheel(ctx, xNoria, yAx, rNoria, 10, theta, schematic);
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(xNoria - rNoria, yAx); ctx.lineTo(xNoria - rNoria, 455);
        ctx.moveTo(xNoria + rNoria, yAx); ctx.lineTo(xNoria + rNoria, 455);
        ctx.stroke();

        const step = 46;
        const shift = ((theta / (Math.PI * 2)) * step) % step;
        for (let yy = yAx + shift; yy < 450; yy += step) {
            const upY = 450 - (yy - yAx);
            ctx.fillStyle = CAD.COLORS.copperMid; ctx.strokeStyle = CAD.COLORS.ink;
            ctx.fillRect(xNoria - rNoria - 10, upY - 10, 20, 20); ctx.strokeRect(xNoria - rNoria - 10, upY - 10, 20, 20);
            ctx.fillStyle = CAD.COLORS.waterDeep;
            ctx.fillRect(xNoria - rNoria - 8, upY - 8, 16, 10);

            ctx.fillStyle = CAD.COLORS.copperDark;
            ctx.fillRect(xNoria + rNoria - 10, yy - 10, 20, 20); ctx.strokeRect(xNoria + rNoria - 10, yy - 10, 20, 20);
        }

        CAD.drawFixedPivot(ctx, xYugo, yAx, 7, 'Yugo');
        CAD.drawFixedPivot(ctx, xNoria, yAx, 8, 'O_noria');
        CAD.drawCallout(ctx, xYugo, yAx - 72, 115, 95, 'Corona de tracción animal', 'right');
        CAD.drawCallout(ctx, xNoria - rNoria, 345, 290, 395, 'Vasijas llenas en ascenso', 'right');
        CAD.drawCallout(ctx, 640, 175, 650, 115, 'Vertido al canal de riego', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Elevación continua por rosario de vasijas',
            'El engranaje en ángulo recto transmite el giro animal a la noria; un trinquete impide que el peso del agua retroceda.');
    };

    // 9. SHADUF (CIGOÑAL EGIPCIO)
    R.african_shaduf = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO = 310, yO = 245, L1 = 115, L2 = 250;
        const psi = 0.28 * Math.sin(theta);
        const xW = xO - L1 * Math.cos(psi), yW = yO - L1 * Math.sin(psi);
        const xB = xO + L2 * Math.cos(psi), yB = yO + L2 * Math.sin(psi);
        const ropeLen = 135;
        const bucketY = yB + ropeLen;
        const lifting = Math.cos(theta) < 0;

        CAD.drawGroundSupport(ctx, 250, 465, 380, 16);
        CAD.drawMasonry(ctx, 130, 330, 140, 135);
        CAD.drawPipe(ctx, [[130, 322], [250, 322]], 14, CAD.COLORS.waterDeep, theta * 4, !lifting, false);
        CAD.drawWaterSurface(ctx, 440, 420, 310, 62, theta, 1.5);

        // Horquilla fija y viga asimétrica
        CAD.drawTimberBeam(ctx, xO, 465, xO, yO, 16, schematic);
        CAD.drawTimberBeam(ctx, xW, yW, xB, yB, 12, schematic);

        // Contrapeso de piedra/barro en el brazo corto
        ctx.fillStyle = CAD.COLORS.stoneDark; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(xW, yW + 18, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Cuerda vertical + cubo articulado
        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(xB, yB); ctx.lineTo(xB, bucketY); ctx.stroke();
        ctx.fillStyle = CAD.COLORS.woodMid; ctx.strokeStyle = CAD.COLORS.ink;
        ctx.fillRect(xB - 18, bucketY, 36, 30); ctx.strokeRect(xB - 18, bucketY, 36, 30);
        if (psi < 0.16) {
            ctx.fillStyle = CAD.COLORS.waterDeep;
            ctx.fillRect(xB - 16, bucketY + 6, 32, 22);
        }

        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O');
        CAD.drawPin(ctx, xW, yW, 5);
        CAD.drawPin(ctx, xB, yB, 5);
        CAD.drawVector(ctx, xW, yW + 42, 0, 36, CAD.COLORS.vectorForce, '42 kg');

        CAD.drawCallout(ctx, xW, yW + 18, 125, 115, 'Contrapeso (asiste el izado)', 'right');
        CAD.drawCallout(ctx, xO, yO, 240, 160, 'Fulcro en horquilla fija', 'right');
        CAD.drawCallout(ctx, xB, bucketY + 15, 650, 290, 'Cubo basculante (15 L)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            lifting ? 'Elevación asistida por contrapeso' : 'Descenso al cauce',
            'La relación asimétrica de brazos equilibra el cubo lleno, permitiendo elevar agua hasta 2.4 m con mínimo esfuerzo.');
    };

    // 10. BOMBA DE CADENA Y ROSARIO DE AGRÍCOLA (PATERNOSTER)
    R.agricola_chain_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xUp = 360, xDown = 490, yTop = 140, yBot = 450;

        CAD.drawGroundSupport(ctx, 210, 250, 120, 238);
        CAD.drawGroundSupport(ctx, 600, 250, 140, 238);
        CAD.drawWaterSurface(ctx, 270, 415, 260, 73, theta, 1.5);

        // Tubería vertical de madera y descarga superior
        CAD.drawCylinder(ctx, xUp - 22, 165, 44, 265, 8, 'wood', schematic);
        ctx.fillStyle = CAD.COLORS.water; ctx.fillRect(xUp - 21, 170, 42, 260);
        CAD.drawPipe(ctx, [[xUp - 25, 185], [140, 185], [140, 245]], 18, CAD.COLORS.waterDeep, theta * 4, true, false);

        // Catalinas y bucle sinfín de esferas de cuero
        CAD.drawGear(ctx, 425, yTop, 65, 16, theta, 'iron', schematic);
        CAD.drawGear(ctx, 425, yBot, 65, 16, theta, 'wood', schematic);
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(xUp, yTop); ctx.lineTo(xUp, yBot); ctx.moveTo(xDown, yTop); ctx.lineTo(xDown, yBot); ctx.stroke();

        const step = 44;
        const shift = ((theta / (Math.PI * 2)) * step) % step;
        for (let yy = yTop + shift; yy <= yBot; yy += step) {
            const upY = yBot - (yy - yTop);
            ctx.fillStyle = CAD.COLORS.woodDark; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.arc(xUp, upY, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(xDown, yy, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }

        CAD.drawFixedPivot(ctx, 425, yTop, 7, 'Catalina motriz');
        CAD.drawCallout(ctx, xUp, 285, 210, 315, 'Esferas estancas arrastrando agua', 'right');
        CAD.drawCallout(ctx, xDown, 310, 565, 290, 'Retorno libre en vacío', 'left');
        CAD.drawCallout(ctx, 180, 185, 140, 110, 'Canal de descarga (180 L/min)', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Arrastre mecánico sin válvulas',
            'Cada disco de cuero actúa como un pistón móvil continuo dentro del tubo, evacuando aguas mineras con lodo sin atascos.');
    };

    // 11. MALACATE HIDRÁULICO REVERSIBLE DE AGRÍCOLA
    R.agricola_reversible_hoist = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xW = 265, yW = 290;
        const dir = Math.sin(theta) >= 0 ? 1 : -1;
        const wheelAngle = dir === 1 ? theta : -theta;
        const yBucket = 415 - Math.abs(Math.sin(theta)) * 185;

        CAD.drawGroundSupport(ctx, 265, 488, 340, 12);
        CAD.drawMasonry(ctx, 515, 240, 45, 248);
        CAD.drawMasonry(ctx, 645, 240, 45, 248);

        // Canal de alimentación superior con compuerta orientable
        CAD.drawPipe(ctx, [[45, 95], [265, 95]], 18, CAD.COLORS.waterDeep, theta * 4, true, false);
        const targetX = dir > 0 ? 215 : 315;
        CAD.drawPipe(ctx, [[265, 95], [targetX, 165]], 14, CAD.COLORS.waterDeep, theta * 5, true, false);
        CAD.drawFluidParticles(ctx, targetX, 168, targetX, 225, theta * 5, true, CAD.COLORS.waterDeep);

        // Rueda doble de álabes invertidos + tambor de arrollamiento + cable al tiro
        CAD.drawWaterwheel(ctx, xW, yW, 122, 16, wheelAngle, schematic);
        CAD.drawGear(ctx, xW, yW, 48, 14, wheelAngle, 'wood', schematic);
        CAD.drawGear(ctx, 602, 130, 26, 12, wheelAngle * 2, 'iron', schematic);

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(xW, yW - 48); ctx.lineTo(602, 104); ctx.lineTo(602, yBucket); ctx.stroke();
        CAD.drawHatchRect(ctx, 582, yBucket, 40, 36, CAD.COLORS.ironMid, 6);

        CAD.drawFixedPivot(ctx, xW, yW, 8, 'O_rueda');
        CAD.drawFixedPivot(ctx, 602, 130, 6, 'Polea');
        CAD.drawCallout(ctx, targetX, 125, 365, 95, dir > 0 ? 'Compuerta: Corona Izq (Izar)' : 'Compuerta: Corona Der (Bajar)', 'left');
        CAD.drawCallout(ctx, 602, yBucket + 18, 695, yBucket + 18, 'Balde de mineral (450 kg)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            dir > 0 ? 'Sentido horario: Izado de carga' : 'Sentido antihorario: Descenso controlado',
            'Al desviar el chorro entre dos coronas de álabes opuestas, la rueda de 10.5 m invierte marcha sin embragues.');
    };

})(window.MACHINE_RENDERERS);
