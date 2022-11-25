/**
 * Mechanica Antiqua - Ilustraciones Técnicas y Cutaways 2D Volumétricos
 * Módulo 1: Hidráulica, Clepsidras y Elevación de Agua (11 máquinas)
 * Con gradientes metálicos, física de fluidos viva, meniscos y telemetría en tiempo real.
 */

window.MACHINE_RENDERERS = window.MACHINE_RENDERERS || {};

(function(R) {
    'use strict';

    // 1. LAVAMANOS NEUMÁTICO DE FILÓN DE BIZANCIO (Frasco de Mariotte)
    R.philo_washbasin = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = (theta / (Math.PI * 2));
        let basinDrop = 0;
        let draining = false, bubbling = false, refilling = false;
        let stepTitle = '', stepDesc = '';

        if (cyc < 0.28) {
            const p = cyc / 0.28;
            basinDrop = p * 20;
            draining = true;
            stepTitle = '1. Extracción de agua';
            stepDesc = 'Se abre el grifo inferior; la superficie libre desciende y destapa el tubo de aire.';
        } else if (cyc < 0.74) {
            const p = (cyc - 0.28) / 0.46;
            basinDrop = 20 * (1 - p);
            bubbling = true;
            refilling = true;
            stepTitle = '2. Reposición barométrica';
            stepDesc = 'El aire entra y burbujea a la cámara superior; el agua desciende por gravedad hasta resellar.';
        } else {
            basinDrop = 0;
            stepTitle = '3. Equilibrio sellado';
            stepDesc = 'El menisco sella el tubo; la depresión superior (P < P_atm) sostiene la columna sin válvulas.';
        }

        const tankX = 280, tankY = 70, tankW = 240, tankH = 175;
        const basinX = 220, basinY = 340, basinW = 360, basinH = 120;
        const eqLevel = 395;
        const curLevel = eqLevel + basinDrop;
        const upperWaterY = 142 + (cyc * 12);

        // Panel HUD de Telemetría analítica
        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `ESTADO: ${stepTitle.toUpperCase()}`,
            `P_SUP: ${bubbling ? '0.98 bar (AIRE ENTRA)' : '0.84 bar (VACÍO PARCIAL)'}`,
            `NIVEL h: ${Math.round(curLevel - eqLevel)} mm`,
            `FLUJO: ${refilling ? 'REPOSICIÓN Q > 0' : 'SELLADO ESTÁTICO'}`
        ]);

        // Bancada y columnas de soporte de bronce
        CAD.drawGroundSupport(ctx, 400, basinY + basinH, 440, 14);
        CAD.drawLink(ctx, 290, tankY + tankH + 4, 290, basinY, 12, 'brass', schematic);
        CAD.drawLink(ctx, 510, tankY + tankH + 4, 510, basinY, 12, 'brass', schematic);

        // Depósito superior hermético en corte transversal
        CAD.drawCylinder(ctx, tankX, tankY, tankW, tankH, 12, 'copper', schematic);

        // Cuello y tapón roscado superior hermético
        ctx.fillStyle = CAD.COLORS.brassMid;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.8;
        ctx.fillRect(tankX + tankW / 2 - 35, tankY - 18, 70, 18);
        ctx.strokeRect(tankX + tankW / 2 - 35, tankY - 18, 70, 18);
        CAD.drawPin(ctx, tankX + tankW / 2, tankY - 9, 5);

        // Cámara de aire superior en depresión
        ctx.fillStyle = bubbling ? 'rgba(241, 245, 249, 0.45)' : 'rgba(224, 242, 254, 0.35)';
        ctx.fillRect(tankX + 2, tankY + 2, tankW - 4, upperWaterY - tankY - 2);

        // Agua superior en el depósito
        CAD.drawWaterSurface(ctx, tankX + 2, upperWaterY, tankW - 4, tankY + tankH - upperWaterY - 2, theta, 1.2);

        // Cubeta inferior receptora en corte
        CAD.drawCylinder(ctx, basinX, basinY, basinW, basinH, 12, 'brass', schematic);
        CAD.drawWaterSurface(ctx, basinX + 2, curLevel, basinW - 4, basinY + basinH - curLevel - 2, theta, (draining || refilling) ? 2.5 : 0.6);

        // Línea de consigna barométrica h_eq
        CAD.drawCenterline(ctx, basinX - 25, eqLevel, basinX + basinW + 30, eqLevel);

        // Conducto 1 (Izquierda): Tubo barométrico de aire sumergido hasta eqLevel
        CAD.drawPipe(ctx, [[345, 102], [345, eqLevel + 2]], 16, '#ffffff', theta * 3, bubbling, true, { material: 'brass' });

        // Burbujas ascendentes por la columna de agua del depósito superior
        if (bubbling) {
            for (let b = 0; b < 6; b++) {
                const prog = ((theta * 4 + b * 1.3) % (Math.PI * 2)) / (Math.PI * 2);
                const by = (tankY + tankH - 10) - prog * (tankY + tankH - upperWaterY);
                const bx = 345 + Math.sin(prog * 8 + b) * 10;
                if (by > upperWaterY - 5) {
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#0284c7';
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }

        // Conducto 2 (Derecha): Tubo de descarga de agua al fondo de la cubeta
        CAD.drawPipe(ctx, [[455, tankY + tankH - 4], [455, 435]], 16, CAD.COLORS.waterDeep, theta * 4, refilling, false, { material: 'copper' });

        // Grifo lateral de abluciones y chorro de lavado
        CAD.drawPipe(ctx, [[basinX + basinW + 4, 425], [625, 425], [625, 442]], 14, CAD.COLORS.waterDeep, theta * 4, draining, false, { material: 'brass' });
        if (draining) {
            CAD.drawWaterJet(ctx, 625, 442, 475, 0.85, theta);
        }

        // Vectores de presión atmosférica actuando sobre la cubeta
        CAD.drawVector(ctx, 265, 350, 0, 34, CAD.COLORS.vectorThrust, 'P_atm');
        CAD.drawVector(ctx, 535, 350, 0, 34, CAD.COLORS.vectorThrust, 'P_atm');

        // Llamadas técnicas explicativas
        CAD.drawCallout(ctx, tankX + tankW / 2, tankY - 14, 170, 50, 'Cierre hermético superior', 'right');
        CAD.drawCallout(ctx, 430, 115, 575, 105, bubbling ? 'Aire entra (P ≈ P_atm)' : 'Vacío parcial de equilibrio (P < P_atm)', 'left');
        CAD.drawCallout(ctx, 345, 290, 170, 290, 'Tubo barométrico de aire', 'right');
        CAD.drawCallout(ctx, 455, 290, 575, 290, 'Conducto de descarga por gravedad', 'left');
        CAD.drawCallout(ctx, 240, eqLevel, 170, 395, 'Nivel crítico de corte', 'right');
        CAD.drawCallout(ctx, 625, 425, 650, 395, 'Canilla de abluciones', 'left');

        CAD.drawPhaseCaption(ctx, w, h, stepTitle, stepDesc);
    };

    // 2. CLEPSIDRA DE FLUJO CONSTANTE DE CTESIBIO
    R.ctesibius_clepsydra = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = theta / (Math.PI * 2);
        const floatY = 420 - cyc * 155;
        const pinionAng = cyc * Math.PI * 2;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `CARGA h₀: CONSTANTE (45 mm)`,
            `CAUDAL Q: UNIFORME LAMINAR`,
            `NIVEL HORARIO: ${Math.round(cyc * 100)} %`,
            `HORA: ${(cyc * 12).toFixed(1)} h`
        ]);

        CAD.drawGroundSupport(ctx, 400, 470, 580, 14);
        CAD.drawMasonry(ctx, 110, 240, 140, 230);

        // Vaso regulador superior con aguja cónica de flotador
        CAD.drawCylinder(ctx, 125, 105, 115, 130, 9, 'brass', schematic);
        CAD.drawWaterSurface(ctx, 127, 155, 111, 78, theta, 1.0);

        // Conducto irregular de alimentación superior
        CAD.drawPipe(ctx, [[182, 45], [182, 115]], 15, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'copper' });

        // Aguja cónica de bronce reguladora y flotador
        ctx.fillStyle = CAD.COLORS.brassMid;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(172, 135); ctx.lineTo(192, 135); ctx.lineTo(182, 112); ctx.closePath();
        ctx.fill(); ctx.stroke();
        CAD.drawHatchRect(ctx, 168, 140, 28, 18, CAD.COLORS.copperLight, 5);

        // Vertedero lateral de rebose para caudal sobrante
        CAD.drawPipe(ctx, [[240, 155], [260, 155], [260, 210]], 11, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'brass' });

        // Tubo de descarga calibrada a carga fija hacia el cilindro horario
        CAD.drawPipe(ctx, [[240, 205], [295, 205], [295, 235]], 12, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'brass' });
        CAD.drawWaterJet(ctx, 295, 235, floatY - 14, 0.7, theta);

        // Cilindro horario inferior con flotador y cremallera
        CAD.drawCylinder(ctx, 275, 235, 125, 235, 10, 'brass', schematic);
        CAD.drawWaterSurface(ctx, 277, floatY, 121, 470 - floatY, theta, 0.7);

        // Flotador de corcho/cobre
        CAD.drawHatchRect(ctx, 292, floatY - 14, 88, 20, CAD.COLORS.copperMid, 6);

        // Cremallera vertical dentada
        const rackTop = floatY - 195;
        CAD.drawLink(ctx, 335, floatY - 14, 335, rackTop, 11, 'iron', schematic);
        for (let ry = rackTop + 10; ry < floatY - 24; ry += 12) {
            ctx.fillStyle = CAD.COLORS.ink;
            ctx.fillRect(341, ry, 7, 5);
        }

        // Piñón engranado con la cremallera
        CAD.drawGear(ctx, 378, 175, 34, 16, pinionAng, 'brass', schematic);
        CAD.drawLink(ctx, 378, 175, 575, 175, 10, 'iron', schematic);

        // Cuadrante circular de 12 horas
        CAD.drawMasonry(ctx, 545, 255, 60, 215);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(575, 175, 84, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        for (let hTick = 0; hTick < 12; hTick++) {
            const a = (hTick / 12) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(575 + 70 * Math.cos(a), 175 + 70 * Math.sin(a));
            ctx.lineTo(575 + 80 * Math.cos(a), 175 + 80 * Math.sin(a));
            ctx.stroke();
        }

        // Aguja indicadora
        CAD.drawVector(ctx, 575, 175, 64 * Math.cos(pinionAng - Math.PI / 2), 64 * Math.sin(pinionAng - Math.PI / 2), '#dc2626', '');
        CAD.drawFixedPivot(ctx, 378, 175, 6);
        CAD.drawPin(ctx, 575, 175, 6);

        CAD.drawDimension(ctx, 105, 155, 105, 205, 'h₀ = cte', 0);
        CAD.drawCallout(ctx, 182, 125, 80, 85, 'Válvula cónica de flotador', 'right');
        CAD.drawCallout(ctx, 295, 215, 350, 85, 'Chorro calibrado a carga fija', 'left');
        CAD.drawCallout(ctx, 335, floatY - 80, 450, 300, 'Cremallera de paso uniforme', 'left');
        CAD.drawCallout(ctx, 575, 175, 655, 95, 'Aguja horaria continua', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Flujo laminar uniforme',
            'La válvula cónica mantiene la carga h₀ invariable en el vaso superior; así el nivel horario asciende con velocidad constante.');
    };

    // 3. RELOJ DEL ELEFANTE DE AL-JAZARI
    R.al_jazari_elephant_clock = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const cyc = theta / (Math.PI * 2);
        const sinking = cyc < 0.78;
        const sinkProg = sinking ? (cyc / 0.78) : (1 - (cyc - 0.78) / 0.22);
        const bowlY = 285 + sinkProg * 75;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `ESTADO: ${sinking ? 'HUNDIMIENTO TEMPORIZADO' : 'DISPARO Y DRENAJE'}`,
            `TIEMPO: ${Math.round(sinkProg * 30)} min / 30 min`,
            `ORIFICIO: CALIBRADO (SUBMERGED TARJAHAR)`,
            `CICLO: 0.5 H`
        ]);

        CAD.drawGroundSupport(ctx, 400, 470, 580, 14);

        // Tanque de agua interior (vientre del elefante)
        CAD.drawCylinder(ctx, 150, 240, 260, 230, 12, 'copper', schematic);
        CAD.drawWaterSurface(ctx, 152, 290, 256, 178, theta, sinking ? 0.6 : 3.2);

        // Cuenco tarjahar perforado en el fondo
        ctx.save();
        const bowlGrad = CAD.createMaterialGradient(ctx, 280 - 48, bowlY, 280 + 48, bowlY + 48, 'brass');
        ctx.fillStyle = bowlGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(280, bowlY, 48, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Agua entrando por el orificio de fondo del cuenco
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.beginPath();
        ctx.arc(280, bowlY + 2, 44 * Math.sqrt(sinkProg), 0, Math.PI);
        ctx.fill();
        ctx.restore();

        // Cadena de tracción fijada al cuenco
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(280, bowlY + 48);
        ctx.lineTo(280, 125);
        ctx.lineTo(450, 125);
        ctx.stroke();

        // Torreta superior con depósito de esferas y disparador
        CAD.drawHatchRect(ctx, 460, 60, 125, 46, CAD.COLORS.brassLight, 8);
        const tilt = sinking ? 0.04 : -0.34;
        ctx.save();
        ctx.translate(460, 125);
        ctx.rotate(tilt);
        CAD.drawLink(ctx, -42, 0, 58, 0, 10, 'brass', schematic);
        ctx.restore();
        CAD.drawFixedPivot(ctx, 460, 125, 6);

        // Conducto serpentina de bolas hacia el címbalo
        CAD.drawPipe(ctx, [[520, 130], [620, 190], [520, 270], [605, 350]], 20, '#f8fafc', 0, false, false, { material: 'bronze' });

        if (!sinking) {
            const p = (cyc - 0.78) / 0.22;
            const bx = 520 + Math.sin(p * Math.PI * 2) * 52;
            const by = 130 + p * 220;
            CAD.drawPin(ctx, bx, by, 8.5);
        } else {
            CAD.drawPin(ctx, 498, 82, 8.0);
            CAD.drawPin(ctx, 520, 82, 8.0);
        }

        // Címbalo / gong inferior de bronce
        ctx.fillStyle = CAD.COLORS.brassMid;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(605, 372, 24, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        CAD.drawCallout(ctx, 280, bowlY + 18, 85, 330, 'Cuenco perforado (Tarjahar)', 'right');
        CAD.drawCallout(ctx, 280, 170, 140, 160, 'Cadena de tracción al disparador', 'right');
        CAD.drawCallout(ctx, 520, 82, 640, 82, 'Cargador de 30 esferas de bronce', 'left');
        CAD.drawCallout(ctx, 605, 372, 640, 372, 'Percusión sonora en el címbalo', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            sinking ? '1. Temporización por inmersión' : '2. Disparo de bola y reinicio',
            sinking ? 'El agua penetra por el orificio calibrado y hunde lentamente el cuenco tarjahar.'
                    : 'Al colapsar, la cadena bascula la torreta, suelta una esfera sonora y el sifón vacía el cuenco.');
    };

    // 4. FUENTE ALTERNANTE DE LOS BANU MUSA
    R.banu_musa_alternating_fountain = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const centralActive = Math.sin(theta) >= 0;
        const tilt = centralActive ? -0.24 : 0.24;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `MODO: ${centralActive ? 'CHORRO CENTRAL ÚNICO' : 'CORONA ANULAR COMPUESTA'}`,
            `PRESIÓN: 2.4 mca (0.24 bar)`,
            `VÁLVULAS: CONMUTACIÓN HIDRÁULICA`,
            `BASCULANTE: AUTOMÁTICO`
        ]);

        CAD.drawGroundSupport(ctx, 400, 468, 480, 14);
        CAD.drawCylinder(ctx, 240, 255, 320, 212, 11, 'copper', schematic);

        // Tabique horizontal y balancín basculante
        ctx.fillStyle = CAD.COLORS.brassDark;
        ctx.fillRect(242, 330, 316, 7);
        CAD.drawWaterSurface(ctx, 243, 370, 314, 95, theta, 1.8);

        const ox = 400, oy = 295;
        const xL = ox - 98 * Math.cos(tilt), yL = oy - 98 * Math.sin(tilt);
        const xR = ox + 98 * Math.cos(tilt), yR = oy + 98 * Math.sin(tilt);
        CAD.drawLink(ctx, xL, yL, xR, yR, 10, 'brass', schematic);
        CAD.drawFixedPivot(ctx, ox, oy, 7);

        CAD.drawPin(ctx, xL, yL + 10, 7.5);
        CAD.drawPin(ctx, xR, yR + 10, 7.5);

        // Tubería de alimentación elevada
        CAD.drawPipe(ctx, [[120, 110], [120, 420], [238, 420]], 15, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'copper' });

        // Toberas concéntricas de expulsión
        CAD.drawPipe(ctx, [[400, 255], [400, 180]], 15, centralActive ? CAD.COLORS.waterDeep : '#ffffff', theta * 5, centralActive, false, { material: 'brass' });
        CAD.drawPipe(ctx, [[358, 255], [358, 195]], 11, !centralActive ? CAD.COLORS.waterDeep : '#ffffff', theta * 5, !centralActive, false, { material: 'brass' });
        CAD.drawPipe(ctx, [[442, 255], [442, 195]], 11, !centralActive ? CAD.COLORS.waterDeep : '#ffffff', theta * 5, !centralActive, false, { material: 'brass' });

        // Chorros parabólicos superiores de la fuente
        if (centralActive) {
            CAD.drawWaterJet(ctx, 400, 180, 65, 1.2, theta);
        } else {
            CAD.drawWaterJet(ctx, 358, 195, 95, 0.8, theta);
            CAD.drawWaterJet(ctx, 442, 195, 95, 0.8, theta + 1);
        }

        CAD.drawCallout(ctx, 120, 180, 145, 125, 'Carga hidrostática elevada', 'left');
        CAD.drawCallout(ctx, ox, oy, 175, 295, 'Balancín basculante alternante', 'right');
        CAD.drawCallout(ctx, 400, 180, 560, 150, 'Tobera central concentrada', 'left');
        CAD.drawCallout(ctx, 442, 205, 590, 215, 'Corona perimetral dispersa', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            centralActive ? 'Fase A: Geiser central vertical' : 'Fase B: Corona anular múltiple',
            'El llenado cíclico de las cazoletas basculantes invierte las válvulas cónicas sin ningún mecanismo de relojería.');
    };

    // 5. ACUEDUCTO ROMANO Y SIFÓN INVERTIDO (VENTER)
    R.roman_aqueduct = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `CAUDAL: 125 L/s`,
            `PRESIÓN VENTER: 4.6 bar`,
            `DESNIVEL: ΔH = 46 m`,
            `RÉGIMEN: VASOS COMUNICANTES`
        ]);

        // Perfil topográfico del valle y puente sifón
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(35, 220); ctx.lineTo(190, 220); ctx.lineTo(310, 425);
        ctx.lineTo(490, 425); ctx.lineTo(610, 245); ctx.lineTo(765, 245);
        ctx.lineTo(765, 488); ctx.lineTo(35, 488); ctx.closePath();
        ctx.fill(); ctx.stroke();

        CAD.drawMasonry(ctx, 160, 175, 50, 75);
        CAD.drawMasonry(ctx, 595, 195, 50, 75);
        CAD.drawMasonry(ctx, 310, 420, 180, 40);

        // Tubería sifónica de plomo en corte transversal
        CAD.drawPipe(ctx, [
            [35, 200], [185, 204], [310, 405], [490, 405], [615, 222], [765, 228]
        ], 20, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'iron' });

        // Línea piezométrica hidráulica inclinada
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(185, 204); ctx.lineTo(615, 222); ctx.stroke();
        ctx.setLineDash([]);

        CAD.drawDimension(ctx, 400, 213, 400, 405, 'ΔH = 46 m (4.6 bar)', 0);
        CAD.drawVector(ctx, 360, 405, 0, -52, CAD.COLORS.vectorThrust, 'P_venter');

        CAD.drawCallout(ctx, 110, 200, 95, 115, 'Canal abierto (pendiente 2 ‰)', 'left');
        CAD.drawCallout(ctx, 185, 180, 260, 115, 'Castellum de cabecera', 'left');
        CAD.drawCallout(ctx, 490, 215, 530, 140, 'Línea piezométrica real', 'left');
        CAD.drawCallout(ctx, 400, 435, 545, 455, 'Puente sifón presurizado', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Principio de vasos comunicantes con pérdida de carga',
            'La tubería desciende al valle y recupera cota soportando 4.6 bar mediante tubos de plomo reforzados sin necesidad de arcadas de 50 m.');
    };

    // 6. TORNILLO DE ARQUÍMEDES (COCHLEA VITRUVIANA)
    R.vitruvius_archimedes_screw = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xO1 = 145, yO1 = 440;
        const beta = 36.87 * Math.PI / 180;
        const len = 460;
        const xO2 = xO1 + len * Math.cos(beta), yO2 = yO1 - len * Math.sin(beta);

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `INCLINACIÓN: β = 36.9° (3:4:5)`,
            `PASO HÉLICE: p = 72 mm`,
            `CAUDAL: Q = 22 m³/h`,
            `RÉGIMEN: CONFINAMIENTO AXIAL`
        ]);

        CAD.drawGroundSupport(ctx, 400, 488, 720, 14);
        CAD.drawWaterSurface(ctx, 45, 405, 230, 83, theta, 1.8);
        CAD.drawTimberBeam(ctx, xO2, 488, xO2, yO2 + 10, 18, schematic);
        CAD.drawPipe(ctx, [[xO2, yO2 + 22], [740, yO2 + 22], [740, yO2 + 95]], 18, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'wood' });
        CAD.drawWaterJet(ctx, 740, yO2 + 95, 470, 0.9, theta);

        // Cuerpo inclinado a 3:4:5
        ctx.save();
        ctx.translate(xO1, yO1);
        ctx.rotate(-beta);

        CAD.drawCenterline(ctx, -20, 0, len + 50, 0);
        CAD.drawTimberBeam(ctx, 0, 0, len, 0, 22, schematic);

        const R_screw = 50, pitch = 72;
        const phase = (theta / (Math.PI * 2)) * pitch;

        // Bolsas de agua confinadas en el fondo de cada espira
        ctx.fillStyle = CAD.COLORS.waterDeep;
        for (let x = 35 + phase; x < len - 25; x += pitch) {
            ctx.beginPath();
            ctx.ellipse(x, R_screw * 0.58, 21, 14, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Espira helicoidal de madera/bronce
        ctx.strokeStyle = CAD.COLORS.brassMid;
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        for (let x = 18; x <= len - 18; x += 4) {
            const yy = R_screw * Math.sin(((x - phase) / pitch) * Math.PI * 2);
            if (x === 18) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();

        // Envolvente exterior
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.4;
        ctx.strokeRect(16, -R_screw - 3, len - 32, (R_screw + 3) * 2);

        // Manivela superior de accionamiento
        CAD.drawLink(ctx, len, 0, len + 30, 0, 10, 'iron', schematic);
        CAD.drawLink(ctx, len + 30, 0, len + 30, 42 * Math.cos(theta), 7, 'iron', schematic);
        ctx.restore();

        // Triángulo característico 3:4:5
        ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(300, 440); ctx.lineTo(460, 440); ctx.lineTo(460, 320); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#0284c7'; ctx.font = '700 11px monospace';
        ctx.fillText('3 : 4 : 5 (β = 36.9°)', 335, 456);

        CAD.drawFixedPivot(ctx, xO1, yO1, 7, 'O₁');
        CAD.drawFixedPivot(ctx, xO2, yO2, 7, 'O₂');
        CAD.drawCallout(ctx, 280, 345, 160, 220, 'Bolsas de agua confinadas por gravedad', 'right');
        CAD.drawCallout(ctx, 410, 245, 270, 140, 'Hélice helicoidal continua', 'right');
        CAD.drawCallout(ctx, xO2 + 30, yO2 + 22, 610, 95, 'Descarga superior continua', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Transporte por cavidades helicoidales móviles',
            'Al inclinarse menos que el ángulo de espira (β < α), cada vuelta retiene agua en su seno inferior y la empuja hacia arriba al girar.');
    };

    // 7. MOLINO HIDRÁULICO DE VITRUVIO
    R.vitruvius_water_wheel = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xW = 190, yW = 345, xG = 420, xSp = 535;
        const millTheta = theta * 3.0;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `VEL. RUEDA: 13 RPM`,
            `RELACIÓN: 5 : 1 (CORONA-LINTERNA)`,
            `VEL. MUELA: 65 RPM`,
            `POTENCIA: 2.2 kW`
        ]);

        CAD.drawGroundSupport(ctx, 400, 488, 720, 14);
        CAD.drawWaterSurface(ctx, 35, 428, 320, 60, theta, 2.5);
        CAD.drawFluidParticles(ctx, 45, 452, 340, 452, theta * 4, true, '#ffffff');

        CAD.drawMasonry(ctx, 350, 245, 300, 243);
        CAD.drawCenterline(ctx, 75, yW, 465, yW);
        CAD.drawCenterline(ctx, xSp, 75, xSp, 455);

        CAD.drawWaterwheel(ctx, xW, yW, 110, 14, theta, schematic);
        CAD.drawLink(ctx, xW, yW, xG, yW, 18, 'wood', schematic);
        CAD.drawGear(ctx, xG, yW, 70, 24, theta, 'wood', schematic);

        CAD.drawGear(ctx, xSp - 45, yW, 25, 10, -millTheta, 'brass', schematic);
        CAD.drawLink(ctx, xSp - 45, 180, xSp - 45, 440, 12, 'iron', schematic);

        // Muela solera y volandera
        CAD.drawHatchRect(ctx, xSp - 125, 195, 160, 26, '#cbd5e1', 9);
        ctx.save();
        ctx.translate(xSp - 45, 172);
        const stoneGrad = CAD.createMaterialGradient(ctx, -75, -16, 75, 16, 'steel');
        ctx.fillStyle = stoneGrad;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.8;
        ctx.fillRect(-75, -16, 150, 32);
        ctx.strokeRect(-75, -16, 150, 32);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(58 * Math.cos(millTheta) - 4, -16, 8, 32);
        ctx.restore();

        // Tolva cónica de grano
        ctx.fillStyle = CAD.COLORS.woodLight;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(xSp - 85, 75); ctx.lineTo(xSp - 5, 75); ctx.lineTo(xSp - 35, 148); ctx.lineTo(xSp - 55, 148); ctx.closePath();
        ctx.fill(); ctx.stroke();

        CAD.drawFixedPivot(ctx, xW, yW, 8, 'O₁');
        CAD.drawFixedPivot(ctx, xSp - 45, 440, 7, 'Rangua');

        CAD.drawCallout(ctx, xW, yW - 110, 115, 115, 'Rueda hidráulica sumergida', 'right');
        CAD.drawCallout(ctx, xG, yW - 70, 325, 115, 'Engranaje de husillos (5:1)', 'right');
        CAD.drawCallout(ctx, xSp - 10, 172, 645, 140, 'Muela volandera giratoria (65 RPM)', 'left');
        CAD.drawCallout(ctx, xSp - 45, 100, 645, 90, 'Tolva de alimentación de cereal', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Multiplicación cinemática en ángulo recto (5:1)',
            'Vitruvio convierte el giro lento del eje fluvial en alta velocidad angular sobre la muela superior mediante engranajes ortogonales.');
    };

    // 8. SAQIYA (NORIA DE CANGILONES)
    R.african_saqiya = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xYugo = 190, yAx = 245, xNoria = 490, rNoria = 112;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `TRACCIÓN: ANIMAL CONTINUA`,
            `ELEVACIÓN: Δz = 8.5 m`,
            `DESCARGA: 140 L/min`,
            `CANGILONES: ROSARIO DE BARRO`
        ]);

        CAD.drawGroundSupport(ctx, 400, 488, 720, 14);
        CAD.drawMasonry(ctx, 350, 340, 75, 148);
        CAD.drawWaterSurface(ctx, 420, 420, 160, 68, theta, 1.6);
        CAD.drawMasonry(ctx, 580, 340, 100, 148);

        CAD.drawPipe(ctx, [[xNoria - 30, 140], [735, 180]], 18, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'wood' });
        CAD.drawWaterJet(ctx, 735, 180, 470, 0.85, theta);

        CAD.drawCenterline(ctx, 85, yAx, 560, yAx);
        CAD.drawGear(ctx, xYugo, yAx, 74, 22, theta, 'wood', schematic);
        CAD.drawLink(ctx, xYugo, yAx, xYugo + 98 * Math.cos(theta), yAx + 98 * Math.sin(theta), 11, 'wood', schematic);
        CAD.drawGear(ctx, 305, yAx, 34, 12, -theta * 1.83, 'brass', schematic);
        CAD.drawLink(ctx, 305, yAx, xNoria, yAx, 12, 'wood', schematic);

        CAD.drawWaterwheel(ctx, xNoria, yAx, rNoria, 10, theta, schematic);
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.4;
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

        CAD.drawFixedPivot(ctx, xYugo, yAx, 8, 'Yugo');
        CAD.drawFixedPivot(ctx, xNoria, yAx, 8, 'O_noria');
        CAD.drawCallout(ctx, xYugo, yAx - 74, 110, 95, 'Corona horizontal de tracción', 'right');
        CAD.drawCallout(ctx, xNoria - rNoria, 340, 285, 395, 'Vasijas llenas en ascenso', 'right');
        CAD.drawCallout(ctx, 640, 170, 655, 115, 'Descarga al canal de regadío', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Elevación continua por rosario de vasijas',
            'La corona dentada en ángulo recto transmite la marcha del animal hacia la rueda de elevación sin interrupción.');
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

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `BRAZOS: 1 : 2.2 (PALANCA CLASE 1)`,
            `CONTRAPESO: 42 kg (BARRO Y PIEDRA)`,
            `ESTADO: ${lifting ? 'IZADO ASISTIDO' : 'DESCENSO AL CAUCE'}`,
            `VOLUMEN: 15 L`
        ]);

        CAD.drawGroundSupport(ctx, 250, 465, 380, 16);
        CAD.drawMasonry(ctx, 130, 330, 140, 135);
        CAD.drawPipe(ctx, [[130, 320], [250, 320]], 15, CAD.COLORS.waterDeep, theta * 4, !lifting, false, { material: 'wood' });
        CAD.drawWaterSurface(ctx, 440, 420, 310, 62, theta, 1.6);

        CAD.drawTimberBeam(ctx, xO, 465, xO, yO, 18, schematic);
        CAD.drawTimberBeam(ctx, xW, yW, xB, yB, 14, schematic);

        ctx.fillStyle = CAD.COLORS.stoneDark; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(xW, yW + 18, 25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(xB, yB); ctx.lineTo(xB, bucketY); ctx.stroke();
        ctx.fillStyle = CAD.COLORS.woodMid; ctx.strokeStyle = CAD.COLORS.ink;
        ctx.fillRect(xB - 18, bucketY, 36, 32); ctx.strokeRect(xB - 18, bucketY, 36, 32);
        if (psi < 0.16) {
            ctx.fillStyle = CAD.COLORS.waterDeep;
            ctx.fillRect(xB - 16, bucketY + 6, 32, 24);
        }

        CAD.drawFixedPivot(ctx, xO, yO, 8, 'Fulcro O');
        CAD.drawPin(ctx, xW, yW, 5.5);
        CAD.drawPin(ctx, xB, yB, 5.5);
        CAD.drawVector(ctx, xW, yW + 44, 0, 38, CAD.COLORS.vectorForce, '42 kg');

        CAD.drawCallout(ctx, xW, yW + 18, 120, 115, 'Contrapeso equilibrador', 'right');
        CAD.drawCallout(ctx, xO, yO, 235, 160, 'Fulcro en horquilla de madera', 'right');
        CAD.drawCallout(ctx, xB, bucketY + 15, 650, 290, 'Cubo de piel de buey (15 L)', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            lifting ? 'Izado asistido por contrapeso' : 'Descenso de inmersión al cauce',
            'La palanca de brazos asimétricos equilibra exactamente el cubo colmado, reduciendo el trabajo humano a sólo guiar el movimiento.');
    };

    // 10. BOMBA DE CADENA Y ROSARIO DE AGRÍCOLA (PATERNOSTER)
    R.agricola_chain_pump = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xUp = 360, xDown = 490, yTop = 135, yBot = 450;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `PROFUNDIDAD: 60 m POZO`,
            `PISTONES: ESFERAS DE CUERO ESTANCAS`,
            `DESCARGA: 180 L/min`,
            `RÉGIMEN: ARRASTRE SIN VÁLVULAS`
        ]);

        CAD.drawGroundSupport(ctx, 205, 245, 125, 243);
        CAD.drawGroundSupport(ctx, 605, 245, 145, 243);
        CAD.drawWaterSurface(ctx, 265, 415, 270, 73, theta, 1.6);

        CAD.drawCylinder(ctx, xUp - 22, 160, 44, 270, 9, 'wood', schematic);
        ctx.fillStyle = CAD.COLORS.waterShallow; ctx.fillRect(xUp - 21, 165, 42, 265);
        CAD.drawPipe(ctx, [[xUp - 25, 180], [135, 180], [135, 240]], 18, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'wood' });
        CAD.drawWaterJet(ctx, 135, 240, 470, 0.9, theta);

        CAD.drawGear(ctx, 425, yTop, 66, 16, theta, 'iron', schematic);
        CAD.drawGear(ctx, 425, yBot, 66, 16, theta, 'wood', schematic);
        ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(xUp, yTop); ctx.lineTo(xUp, yBot); ctx.moveTo(xDown, yTop); ctx.lineTo(xDown, yBot); ctx.stroke();

        const step = 44;
        const shift = ((theta / (Math.PI * 2)) * step) % step;
        for (let yy = yTop + shift; yy <= yBot; yy += step) {
            const upY = yBot - (yy - yTop);
            ctx.fillStyle = CAD.COLORS.woodDark; ctx.strokeStyle = CAD.COLORS.ink; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(xUp, upY, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(xDown, yy, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }

        CAD.drawFixedPivot(ctx, 425, yTop, 8, 'Catalina');
        CAD.drawCallout(ctx, xUp, 280, 205, 310, 'Esferas de cuero arrastrando columna', 'right');
        CAD.drawCallout(ctx, xDown, 305, 570, 285, 'Retorno libre descendente', 'left');
        CAD.drawCallout(ctx, 175, 180, 135, 105, 'Canal de desagüe minero', 'left');

        CAD.drawPhaseCaption(ctx, w, h, 'Evacuación continua por pistones en serie',
            'Cada disco de cuero actúa como un émbolo móvil continuo dentro de la columna de madera, achicando aguas de mina con lodos sin atascar válvulas.');
    };

    // 11. MALACATE HIDRÁULICO REVERSIBLE DE AGRÍCOLA
    R.agricola_reversible_hoist = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h, '', '', schematic);
        const xW = 265, yW = 290;
        const dir = Math.sin(theta) >= 0 ? 1 : -1;
        const wheelAngle = dir === 1 ? theta : -theta;
        const yBucket = 415 - Math.abs(Math.sin(theta)) * 185;

        CAD.drawTelemetryHUD(ctx, 22, 22, [
            `SENTIDO: ${dir > 0 ? 'HORARIO (IZADO)' : 'ANTIHORARIO (DESCENSO)'}`,
            `RUEDA: 10.5 m Ø (ÁLABES OPUESTOS)`,
            `TIRO DE MINA: 450 kg`,
            `INVERSIÓN: POR COMPUERTA DE FLUJO`
        ]);

        CAD.drawGroundSupport(ctx, 265, 488, 350, 14);
        CAD.drawMasonry(ctx, 510, 235, 45, 253);
        CAD.drawMasonry(ctx, 650, 235, 45, 253);

        CAD.drawPipe(ctx, [[40, 95], [265, 95]], 18, CAD.COLORS.waterDeep, theta * 4, true, false, { material: 'wood' });
        const targetX = dir > 0 ? 210 : 320;
        CAD.drawPipe(ctx, [[265, 95], [targetX, 160]], 15, CAD.COLORS.waterDeep, theta * 5, true, false, { material: 'wood' });
        CAD.drawWaterJet(ctx, targetX, 160, 235, 1.1, theta);

        CAD.drawWaterwheel(ctx, xW, yW, 125, 16, wheelAngle, schematic);
        CAD.drawGear(ctx, xW, yW, 50, 14, wheelAngle, 'wood', schematic);
        CAD.drawGear(ctx, 605, 125, 28, 12, wheelAngle * 2, 'iron', schematic);

        ctx.strokeStyle = CAD.COLORS.woodDark; ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.moveTo(xW, yW - 50); ctx.lineTo(605, 100); ctx.lineTo(605, yBucket); ctx.stroke();
        CAD.drawHatchRect(ctx, 585, yBucket, 40, 38, CAD.COLORS.ironMid, 6);

        CAD.drawFixedPivot(ctx, xW, yW, 8, 'Eje rueda');
        CAD.drawFixedPivot(ctx, 605, 125, 6, 'Polea superior');
        CAD.drawCallout(ctx, targetX, 125, 370, 90, dir > 0 ? 'Corona izquierda: Izado directo' : 'Corona derecha: Marcha inversa', 'left');
        CAD.drawCallout(ctx, 605, yBucket + 18, 700, yBucket + 18, 'Balde minero de mineral', 'left');

        CAD.drawPhaseCaption(ctx, w, h,
            dir > 0 ? 'Corona 1 activa: Ascenso de carga' : 'Corona 2 activa: Descenso controlado',
            'Al desviar el chorro de agua hacia la segunda corona de álabes invertidos, la gigantesca rueda invierte la marcha sin desacoplar el cable.');
    };

})(window.MACHINE_RENDERERS);
