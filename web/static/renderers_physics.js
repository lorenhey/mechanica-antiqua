/**
 * Mechanica Antiqua - Renderizadores CAD 2D (Parte 2: Hidráulica, Autómatas, Balística y Estructuras)
 * Todos los mecanismos y sistemas físicos se calculan dinámicamente en coordenadas reales desde theta.
 */

window.MACHINE_RENDERERS = window.MACHINE_RENDERERS || {};

(function(R) {
    'use strict';

    // 22. SAQIYA (NORIA DE CANGILONES)
    R.african_saqiya = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'SAQIYA (NORIA DE CANGILONES CON ENGRANAJE EN ÁNGULO RECTO)',
            'Transmisión Ortogonal Corona-Linterna + Rosario Continuo | Q = 14.0 m³/h', schematic);

        const xNoria = 490, yNoria = 265, rNoria = 115;
        CAD.drawCenterline(ctx, 110, yNoria, 680, yNoria);
        CAD.drawCenterline(ctx, 210, 140, 210, 440);

        // Pozo inferior y canal superior de riego
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(390, 455, 210, 85);
        CAD.drawGroundSupport(ctx, 350, 455, 80, 85);
        CAD.drawGroundSupport(ctx, 640, 455, 80, 85);
        CAD.drawTimberBeam(ctx, 560, 225, 730, 225, 14, schematic);
        CAD.drawFluidParticles(ctx, 565, 215, 725, 215, theta * 2, true, CAD.COLORS.waterDeep);

        // Engranaje horizontal motriz (yugo animal) + linterna en ángulo recto
        CAD.drawGear(ctx, 210, yNoria, 75, 22, theta, 'wood', schematic);
        CAD.drawLink(ctx, 210, yNoria, 210 + 95 * Math.cos(theta), yNoria + 95 * Math.sin(theta), 10, 'wood', schematic);
        CAD.drawGear(ctx, 325, yNoria, 36, 12, -theta * 1.83, 'brass', schematic);
        CAD.drawLink(ctx, 210, yNoria, xNoria, yNoria, 10, 'wood', schematic);

        // Rueda portacangilones y guirnalda vertical
        CAD.drawWaterwheel(ctx, xNoria, yNoria, rNoria, 10, theta, schematic);
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(xNoria - rNoria, yNoria); ctx.lineTo(xNoria - rNoria, 480);
        ctx.moveTo(xNoria + rNoria, yNoria); ctx.lineTo(xNoria + rNoria, 480);
        ctx.stroke();

        // Cangilones subiendo llenos a la izquierda y bajando vacíos a la derecha
        const step = 48;
        const shift = ((theta / (Math.PI * 2)) * step) % step;
        for (let yy = yNoria + shift; yy < 475; yy += step) {
            // Lado ascenso (llenos de agua)
            ctx.fillStyle = CAD.COLORS.copperMid;
            ctx.fillRect(xNoria - rNoria - 10, 475 - (yy - yNoria) - 10, 20, 22);
            ctx.fillStyle = CAD.COLORS.waterDeep;
            ctx.fillRect(xNoria - rNoria - 8, 475 - (yy - yNoria) - 8, 16, 10);
            // Lado descenso (vacíos invertidos)
            ctx.fillStyle = CAD.COLORS.copperDark;
            ctx.fillRect(xNoria + rNoria - 10, yy - 10, 20, 22);
        }

        CAD.drawFixedPivot(ctx, 210, yNoria, 8, 'O_yugo');
        CAD.drawFixedPivot(ctx, xNoria, yNoria, 9, 'O_noria');
        CAD.drawNoteBox(ctx, 35, 85, 225, 'TRANSMISIÓN HIDRÁULICA', [
            'Altura elevación: 5.5 m',
            'Trinquete anti-retorno activo',
            'Caudal medio: 14.0 m³/h'
        ]);
    };

    // 23. RUEDA HIDRÁULICA DE VITRUVIO (MOLINO)
    R.vitruvius_water_wheel = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'MOLINO HIDRÁULICO DE VITRUVIO (c. 25 a.C.)',
            'Multiplicación Ortogonal 5:1 (Rueda Dentada → Linterna de Husillos → Muela)', schematic);

        const xW = 200, yW = 365, yG = 365, xGear = 445;
        CAD.drawCenterline(ctx, 60, yW, 650, yW);
        CAD.drawCenterline(ctx, 520, 120, 520, 490);

        // Flujo fluvial inferior impulsando paletas
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(40, 455, 360, 75);
        CAD.drawFluidParticles(ctx, 50, 475, 380, 475, theta * 2, true, '#ffffff');

        // Rueda de paletas inferior + árbol horizontal
        CAD.drawWaterwheel(ctx, xW, yW, 110, 14, theta, schematic);
        CAD.drawLink(ctx, xW, yW, xGear, yG, 16, 'wood', schematic);
        CAD.drawGear(ctx, xGear, yG, 75, 25, theta, 'wood', schematic);

        // Linterna vertical acoplada a relación 5:1 girando 5 veces más rápido
        const millTheta = theta * 3.0;
        CAD.drawHatchRect(ctx, 498, 305, 44, 50, CAD.COLORS.brassMid, 8);
        CAD.drawLink(ctx, 520, 210, 520, 455, 12, 'iron', schematic);

        // Muela superior (solera fija abajo + piedra volandera giratoria arriba)
        CAD.drawHatchRect(ctx, 440, 225, 160, 28, '#8d8578', 10);
        ctx.save();
        ctx.translate(520, 200);
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2;
        ctx.fillRect(-75, -18, 150, 36);
        ctx.strokeRect(-75, -18, 150, 36);
        // Indicador angular de rotación rápida de la muela
        const mPos = 60 * Math.cos(millTheta);
        ctx.fillStyle = '#962b23';
        ctx.fillRect(mPos - 4, -18, 8, 36);
        ctx.restore();

        CAD.drawFixedPivot(ctx, xW, yW, 8, 'O_agua');
        CAD.drawFixedPivot(ctx, 520, 455, 7, 'O_rangua');
        CAD.drawNoteBox(ctx, 35, 85, 235, 'MOLINO VITRUVIANO', [
            'Relación multiplicadora: 5 : 1',
            'Régimen muela: 65 rpm',
            'Potencia hidráulica: 1.8 kW'
        ]);
    };

    // 24. MALACATE HIDRÁULICO REVERSIBLE DE AGRÍCOLA
    R.agricola_reversible_hoist = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'MALACATE HIDRÁULICO REVERSIBLE DE AGRÍCOLA (1556)',
            'Rueda de Doble Corona Opuesta | Inversión de Marcha por Compuerta Superior', schematic);

        const xW = 280, yW = 300;
        // Primer medio ciclo gira CW (sube carga), segundo medio ciclo invierte compuerta y gira CCW!
        const dir = Math.sin(theta) >= 0 ? 1 : -1;
        const wheelAngle = dir === 1 ? theta : -theta;
        const drumShift = Math.sin(theta);
        const yBucket = 460 - Math.abs(drumShift) * 180;

        CAD.drawCenterline(ctx, xW, 120, xW, 490);
        CAD.drawCenterline(ctx, 600, 110, 600, 535);

        // Canal superior y compuerta selectora oscilante
        CAD.drawTimberBeam(ctx, 80, 125, 290, 125, 14, schematic);
        const chuteX = dir > 0 ? 230 : 330;
        CAD.drawLink(ctx, 270, 125, chuteX, 175, 10, 'brass', schematic);
        CAD.drawFluidParticles(ctx, chuteX, 175, chuteX, 240, theta * 3, true, CAD.COLORS.waterDeep);

        // Rueda hidráulica doble de 10.5 m
        CAD.drawWaterwheel(ctx, xW, yW, 128, 16, wheelAngle, schematic);
        CAD.drawGear(ctx, xW, yW, 55, 16, wheelAngle, 'wood', schematic);

        // Cable de cáñamo hasta polea de tiro de mina y balde de mineral
        CAD.drawGear(ctx, 600, 145, 28, 12, wheelAngle * 2, 'iron', schematic);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(xW, yW - 55); ctx.lineTo(600, 117); ctx.lineTo(600, yBucket);
        ctx.stroke();

        // Pozo y balde de carga 450 kg
        CAD.drawGroundSupport(ctx, 540, 280, 40, 240);
        CAD.drawGroundSupport(ctx, 660, 280, 40, 240);
        CAD.drawHatchRect(ctx, 580, yBucket, 40, 38, CAD.COLORS.ironMid, 7);

        CAD.drawFixedPivot(ctx, xW, yW, 9, 'O_rueda');
        CAD.drawFixedPivot(ctx, 600, 145, 7, 'O_polea');
        CAD.drawNoteBox(ctx, 35, 415, 235, 'INVERSIÓN HIDRÁULICA', [
            'Diámetro rueda: 10.5 m',
            'Compuerta: ' + (dir > 0 ? 'CORONA IZQ (Izado)' : 'CORONA DER (Descenso)'),
            'Carga nominal: 450 kg'
        ]);
    };

    // 25. RUECA INDIA CHARKHA
    R.indian_charkha = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'RUECA DE HILAR INDIA (CHARKHA)',
            'Transmisión Multiplicadora por Correa Cruzada (i = 12 : 1)', schematic);

        const xW = 240, yW = 310, r1 = 118;
        const xS = 570, yS = 355, r2 = 22;

        CAD.drawCenterline(ctx, 90, yW, 670, yW);
        CAD.drawTimberBeam(ctx, 130, 455, 650, 455, 22, schematic);
        CAD.drawGroundSupport(ctx, 390, 470, 520, 14);
        CAD.drawTimberBeam(ctx, xW, 455, xW, yW, 14, schematic);
        CAD.drawTimberBeam(ctx, xS, 455, xS, yS, 12, schematic);

        // Volante motriz R1 girando a theta
        CAD.drawWaterwheel(ctx, xW, yW, r1, 12, theta, schematic);
        const hX = xW + 55 * Math.cos(theta), hY = yW + 55 * Math.sin(theta);
        CAD.drawPin(ctx, hX, hY, 7, 'Manivela');

        // Huso giratorio r2 girando 12x más rápido (-theta * 12)
        CAD.drawGear(ctx, xS, yS, r2, 12, -theta * 12, 'brass', schematic);
        CAD.drawLink(ctx, xS - 10, yS, xS + 95, yS - 18, 5, 'iron', schematic);

        // Correa cruzada de algodón en forma de 8
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(xW, yW - r1); ctx.lineTo(xS, yS + r2);
        ctx.moveTo(xW, yW + r1); ctx.lineTo(xS, yS - r2);
        ctx.stroke();

        CAD.drawFixedPivot(ctx, xW, yW, 8, 'O₁');
        CAD.drawFixedPivot(ctx, xS, yS, 6, 'O₂ (Huso)');
        CAD.drawDimension(ctx, xW, 165, xS, 165, 'Entre ejes = 550 mm', 0);
        CAD.drawNoteBox(ctx, 430, 85, 245, 'CINEMÁTICA DE CORREA', [
            'Relación: R₁/r₂ = 12 : 1',
            'Régimen huso: 720 rpm',
            'Ángulo huso: ' + (((theta * 12) * 180 / Math.PI) % 360).toFixed(0) + '°'
        ]);
    };

    // 26. CLEPSIDRA DE CTESIBIO
    R.ctesibius_clepsydra = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'CLEPSIDRA REGULADA DE CTESIBIO (c. 270 a.C.)',
            'Realimentación Negativa con Flotador Cónico + Cremallera-Piñón', schematic);

        const cycle = (theta / (Math.PI * 2));
        const floatY = 460 - cycle * 160;
        const pinionAng = cycle * Math.PI * 2;

        // Cámara reguladora superior de nivel constante h0
        CAD.drawCylinder(ctx, 180, 125, 110, 100, 8, 'brass', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(182, 165, 106, 58); // Nivel constante regulado!
        // Cono regulador flotante manteniendo el área de paso equilibrada
        ctx.fillStyle = CAD.COLORS.brassMid;
        ctx.beginPath(); ctx.moveTo(225, 145); ctx.lineTo(245, 145); ctx.lineTo(235, 168); ctx.closePath(); ctx.fill();
        CAD.drawFluidParticles(ctx, 235, 225, 235, 290, theta * 4, true, CAD.COLORS.waterDeep);

        // Cilindro inferior graduado + Flotador + Cremallera
        CAD.drawCylinder(ctx, 310, 290, 110, 210, 9, 'brass', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(312, floatY, 106, 500 - floatY);
        // Flotador cilíndrico y cremallera vertical dentada
        CAD.drawHatchRect(ctx, 325, floatY - 14, 80, 20, CAD.COLORS.copperMid, 6);
        CAD.drawLink(ctx, 365, floatY - 14, 365, floatY - 190, 9, 'iron', schematic);

        // Piñón y cuadrante horario de 24 h
        const px = 410, py = 200;
        CAD.drawGear(ctx, px, py, 32, 14, pinionAng, 'brass', schematic);
        // Esfera reloj derecha
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(580, 230, 85, 0, Math.PI * 2); ctx.stroke();
        CAD.drawVector(ctx, 580, 230, 68 * Math.cos(pinionAng - Math.PI / 2), 68 * Math.sin(pinionAng - Math.PI / 2), '#962b23', 'Hora');
        CAD.drawFixedPivot(ctx, 580, 230, 6, 'O_dial');

        CAD.drawNoteBox(ctx, 35, 385, 240, 'CONTROL DE NIVEL', [
            'Altura h₀ constante = 120 mm',
            'dh/dt = Q_const / A = cte',
            'Progreso ciclo: ' + (cycle * 100).toFixed(0) + '%'
        ]);
    };

    // 27. RELOJ DEL ELEFANTE DE AL-JAZARI
    R.al_jazari_elephant_clock = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'RELOJ DEL ELEFANTE DE AL-JAZARI (1206)',
            'Oscilador de Relajación Hidráulica por Cuenco Perforado (Tarjahar)', schematic);

        const cycle = (theta / (Math.PI * 2));
        const sink = cycle * 70;
        const triggered = cycle > 0.85;

        // Tanque interno en el cuerpo del elefante
        CAD.drawCylinder(ctx, 210, 290, 200, 165, 10, 'copper', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(212, 325, 196, 128);

        // Cuenco perforado (Tarjahar) hundiéndose linealmente por llenado de orificio inferior
        const bowlY = 315 + sink;
        ctx.save();
        ctx.fillStyle = CAD.COLORS.brassMid;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(310, bowlY, 44, 0, Math.PI);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();

        // Cadena disparadora desde el fondo del cuenco hacia palanca superior
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(310, bowlY + 44); ctx.lineTo(310, 155); ctx.lineTo(480, 155);
        ctx.stroke();

        // Palanca disparadora superior + bola metálica cayendo en el conducto en S
        CAD.drawLink(ctx, 450, 155, 560, triggered ? 180 : 145, 10, 'brass', schematic);
        CAD.drawFixedPivot(ctx, 495, 155, 7, 'O_disparo');

        // Bola de bronce cayendo si está en disparo
        const ballY = triggered ? 175 + ((cycle - 0.85) / 0.15) * 190 : 138;
        CAD.drawPin(ctx, 560, ballY, 10, triggered ? 'Bola!' : '');

        CAD.drawNoteBox(ctx, 35, 85, 225, 'OSCILADOR TARJAHAR', [
            'Periodo calibrado: 30.0 min',
            'Inmersión actual: ' + (cycle * 100).toFixed(0) + '%',
            'Estado: ' + (triggered ? 'DISPARO DE BOLA!' : 'Llenado laminar')
        ]);
    };

    // 28. FUENTE ALTERNANTE DE LOS BANU MUSA
    R.banu_musa_alternating_fountain = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'FUENTE ALTERNANTE DE LOS BANU MUSA (s. IX)',
            'Conmutador Biestable Fluido-Mecánico con Balancín de Flotadores', schematic);

        const stateCentral = Math.sin(theta) >= 0;
        const tilt = stateCentral ? -0.18 : 0.18;

        // Cámara inferior presurizada y divisor superior
        CAD.drawCylinder(ctx, 270, 290, 260, 175, 10, 'copper', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(272, 340, 256, 123);

        // Balancín interno con válvulas cónicas opuestas
        const xO = 400, yO = 320;
        const x1 = xO - 80 * Math.cos(tilt), y1 = yO - 80 * Math.sin(tilt);
        const x2 = xO + 80 * Math.cos(tilt), y2 = yO + 80 * Math.sin(tilt);
        CAD.drawLink(ctx, x1, y1, x2, y2, 10, 'brass', schematic);
        CAD.drawFixedPivot(ctx, xO, yO, 7, 'O_bal');
        CAD.drawPin(ctx, x1, y1, 12);
        CAD.drawPin(ctx, x2, y2, 12);

        // Chorro exterior emergiendo arriba según estado biestable!
        if (stateCentral) {
            // Chorro único central alto
            ctx.strokeStyle = CAD.COLORS.waterDeep;
            ctx.lineWidth = 8;
            ctx.beginPath(); ctx.moveTo(400, 290); ctx.lineTo(400, 110); ctx.stroke();
            CAD.drawFluidParticles(ctx, 400, 285, 400, 110, theta * 4, true, '#ffffff');
        } else {
            // Corona múltiple anular
            CAD.drawFluidParticles(ctx, 365, 285, 320, 165, theta * 4, true, CAD.COLORS.waterDeep);
            CAD.drawFluidParticles(ctx, 435, 285, 480, 165, theta * 4, true, CAD.COLORS.waterDeep);
        }

        CAD.drawNoteBox(ctx, 35, 85, 225, 'LÓGICA FLUIDA BIESTABLE', [
            'Presión columna: 2.2 m c.a.',
            'Salida activa: ' + (stateCentral ? 'CHORRO CENTRAL' : 'CORONA ANULAR'),
            'Periodo conmutación: 12.0 s'
        ]);
    };

    // 29. LAVAMANOS NEUMÁTICO DE FILÓN DE BIZANCIO
    R.philo_washbasin = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'LAVAMANOS DE NIVEL CONSTANTE DE FILÓN (s. III a.C.)',
            'Frasco de Mariotte Barométrico: P_gas + ρ·g·H_col = P_atm', schematic);

        const drop = Math.max(0, Math.sin(theta) * 14);
        const basinLevel = 415 + drop;
        const needAir = drop > 3;

        // Depósito hermético superior
        CAD.drawCylinder(ctx, 300, 115, 200, 195, 10, 'copper', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(302, 195, 196, 113);
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(302, 117, 196, 78);

        // Cubeta inferior y brazo de descarga hidráulica
        CAD.drawCylinder(ctx, 260, 390, 280, 95, 9, 'brass', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(262, basinLevel, 276, 485 - basinLevel);

        // Tubo de equilibrio neumático sumergido hasta y=418
        ctx.strokeStyle = CAD.COLORS.brassDark;
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(350, 180); ctx.lineTo(350, 418); ctx.stroke();
        // Tubo sifón de alimentación de agua
        ctx.strokeStyle = CAD.COLORS.waterDeep;
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(450, 305); ctx.lineTo(450, 455); ctx.stroke();

        // Burbujas subiendo por el tubo barométrico cuando baja el nivel de la cubeta!
        if (needAir) {
            CAD.drawFluidParticles(ctx, 350, 418, 350, 135, theta * 4, true, '#ffffff');
            CAD.drawFluidParticles(ctx, 450, 310, 450, 450, theta * 4, true, '#5280a0');
        }

        CAD.drawCenterline(ctx, 220, 418, 580, 418);
        CAD.drawNoteBox(ctx, 35, 85, 235, 'EQUILIBRIO BAROMÉTRICO', [
            'Nivel consigna h_eq: 85.0 mm',
            'Estado: ' + (needAir ? 'BURBUJEO / REPOSICIÓN' : 'EQUILIBRIO SELLADO'),
            'Vacío superior: -4.2 kPa'
        ]);
    };

    // 30. BOMBA DE VAPOR DE SAVERY (1698)
    R.savery_savery_engine = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'BOMBA DE VAPOR DE SAVERY (1698)',
            'Dos Cámaras Alternantes sin Pistón | Aspiración por Vacío + Impulsión Térmica', schematic);

        const phaseA = Math.sin(theta) > 0;
        const lvlA = 290 + 40 * Math.cos(theta);
        const lvlB = 290 - 40 * Math.cos(theta);

        // Caldera lateral izquierda
        ctx.fillStyle = CAD.COLORS.copperMid;
        ctx.beginPath(); ctx.arc(165, 385, 58, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();

        // Cámaras ovales receptoras A y B
        CAD.drawCylinder(ctx, 300, 215, 95, 130, 8, 'copper', schematic);
        CAD.drawCylinder(ctx, 510, 215, 95, 130, 8, 'copper', schematic);

        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(302, lvlA, 91, 345 - lvlA);
        ctx.fillRect(512, lvlB, 91, 345 - lvlB);

        // Pozo inferior y columna ascendente derecha
        ctx.fillStyle = CAD.COLORS.waterDeep;
        ctx.fillRect(280, 465, 350, 75);
        CAD.drawFluidParticles(ctx, 452, 200, 452, 85, theta * 3, true, CAD.COLORS.waterDeep);

        CAD.drawCheckValve(ctx, 330, 365, 26, phaseA ? 0.9 : 0, 0);
        CAD.drawCheckValve(ctx, 540, 365, 26, !phaseA ? 0.9 : 0, 0);

        CAD.drawNoteBox(ctx, 35, 85, 225, 'BOMBA SIN PISTÓN', [
            'Cámara A: ' + (phaseA ? 'VACÍO (Succión)' : 'VAPOR 3.8 bar'),
            'Cámara B: ' + (!phaseA ? 'VACÍO (Succión)' : 'VAPOR 3.8 bar'),
            'Altura total: 28.5 m'
        ]);
    };

    // 31. ACUEDUCTO ROMANO CON SIFÓN INVERTIDO
    R.roman_aqueduct = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'ACUEDUCTO ROMANO Y SIFÓN INVERTIDO (VENTER)',
            'Canal Libre (Manning) + Conducción Presurizada en U | Línea Piezométrica', schematic);

        // Perfil topográfico del valle
        ctx.fillStyle = '#d6d3d1';
        ctx.beginPath();
        ctx.moveTo(40, 265); ctx.lineTo(190, 265); ctx.lineTo(310, 470);
        ctx.lineTo(490, 470); ctx.lineTo(610, 285); ctx.lineTo(760, 285);
        ctx.lineTo(760, 560); ctx.lineTo(40, 560);
        ctx.closePath();
        ctx.fill();

        // Canal de llegada, castellum y sifón en U presurizado
        ctx.strokeStyle = CAD.COLORS.waterDeep;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(40, 245); ctx.lineTo(190, 250);
        ctx.lineTo(310, 450); ctx.lineTo(490, 450);
        ctx.lineTo(610, 268); ctx.lineTo(760, 275);
        ctx.stroke();

        // Partículas continuas atravesando el venter presurizado
        CAD.drawFluidParticles(ctx, 45, 245, 190, 250, theta * 3, true, '#ffffff');
        CAD.drawFluidParticles(ctx, 190, 250, 310, 450, theta * 3, true, '#ffffff');
        CAD.drawFluidParticles(ctx, 310, 450, 490, 450, theta * 3, true, '#ffffff');
        CAD.drawFluidParticles(ctx, 490, 450, 610, 268, theta * 3, true, '#ffffff');

        // Línea piezométrica hidráulica (HGL)
        ctx.strokeStyle = '#962b23';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(190, 250); ctx.lineTo(610, 268); ctx.stroke();
        ctx.setLineDash([]);

        // Vectores de presión estática en el venter
        CAD.drawVector(ctx, 400, 450, 0, -90, CAD.COLORS.vectorThrust, 'P_venter = 4.5 bar');
        CAD.drawDimension(ctx, 400, 258, 400, 450, 'ΔH = 46 m', 0);
        CAD.drawNoteBox(ctx, 35, 85, 225, 'HIDRÁULICA DEL SIFÓN', [
            'Pendiente canal i = 0.002',
            'Velocidad canal: 1.45 m/s',
            'Caudal diario: 28,000 m³/día'
        ]);
    };

    // 32. RELOJ ASTRONÓMICO DE SU SONG (ESCAPE HIDROMECÁNICO)
    R.chinese_su_song_clock = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'ESCAPE HIDROMECÁNICO DE SU SONG (1088)',
            'Cuantización Discreta de Flujo Continuo por Balanza y Trinquete (Δθ = 10°)', schematic);

        const cx = 390, cy = 325, R = 140;
        const stepProgress = (theta % (Math.PI / 3)) / (Math.PI / 3);
        const snapping = stepProgress > 0.78;
        const quantized = Math.floor(theta / (Math.PI / 3)) * (Math.PI / 6);
        const wheelRot = quantized + (snapping ? ((stepProgress - 0.78) / 0.22) * (Math.PI / 6) : 0);

        CAD.drawCenterline(ctx, 180, cy, 600, cy);
        CAD.drawCenterline(ctx, cx, 100, cx, 510);

        // Chorro de nivel constante superior llenando el cangilón activo
        CAD.drawFluidParticles(ctx, 515, 115, 490, 215, theta * 4, true, CAD.COLORS.waterDeep);

        // Rueda de cangilones discretizada
        CAD.drawWaterwheel(ctx, cx, cy, R, 12, wheelRot, schematic);
        CAD.drawFixedPivot(ctx, cx, cy, 9, 'O_rueda');

        // Trinquete superior y balanza de disparo
        const pawlTilt = snapping ? -0.25 : 0.05;
        ctx.save();
        ctx.translate(cx - 25, 150);
        ctx.rotate(pawlTilt);
        CAD.drawLink(ctx, -95, 0, 120, 0, 10, 'brass', schematic);
        ctx.restore();
        CAD.drawFixedPivot(ctx, cx - 25, 150, 7, 'O_escape');

        CAD.drawNoteBox(ctx, 35, 85, 225, 'CUANTIZACIÓN ISÓCRONA', [
            'Paso discreto: Δθ = 10° (24 s)',
            'Llenado cangilón: ' + (stepProgress * 100).toFixed(0) + '%',
            'Estado: ' + (snapping ? 'LIBERACIÓN ESCAPE!' : 'Retenido por trinquete')
        ]);
    };

    // 33. MUÑECA KARAKURI (CHAHAKOBI NINGYŌ)
    R.japanese_karakuri_doll = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'AUTÓMATA KARAKURI (CHAHAKOBI NINGYŌ, 1796)',
            'Muelle Espiral de Barba de Ballena + Regulador Centrífugo + Interruptor de Carga', schematic);

        const cx = 360, cy = 285;
        const loaded = Math.sin(theta) > -0.6;
        // Muelle espiral desenrollándose y tren de escape
        CAD.drawGear(ctx, 290, 340, 48, 20, theta * 0.5, 'brass', schematic);
        CAD.drawGear(ctx, 375, 295, 32, 14, -theta * 1.2, 'iron', schematic);
        CAD.drawGear(ctx, 435, 235, 24, 10, theta * 3.0, 'brass', schematic);

        // Mecanismo biela-leva de paso inferior (piernas mecánicas)
        const legX = 360 + 38 * Math.sin(theta * 2);
        CAD.drawLink(ctx, 355, 360, legX, 455, 11, 'wood', schematic);
        CAD.drawLink(ctx, 365, 360, 720 - legX, 455, 11, 'wood', schematic);
        CAD.drawGroundSupport(ctx, 360, 465, 360, 14);

        // Plato superior sensor con resorte de compresión
        const plateY = loaded ? 185 : 165;
        CAD.drawTimberBeam(ctx, 455, plateY, 545, plateY, 10, schematic);
        CAD.drawLink(ctx, 500, plateY, 500, 260, 8, 'brass', schematic);
        if (loaded) {
            CAD.drawHatchRect(ctx, 482, plateY - 26, 36, 26, '#e9e3d5', 6);
        }

        CAD.drawFixedPivot(ctx, 290, 340, 8, 'Muelle');
        CAD.drawFixedPivot(ctx, 435, 235, 6, 'Regulador');
        CAD.drawNoteBox(ctx, 35, 85, 225, 'MÁQUINA DE ESTADOS', [
            'Muelle activo: ' + (loaded ? 'Taza colocada (120g)' : 'Taza retirada'),
            'Modo: ' + (loaded ? 'AVANCE REGULADO' : 'RETORNO 180°'),
            'Autonomía: 2.8 metros'
        ]);
    };

    // 34. FLAUTISTA AUTOMÁTICO DE LOS BANU MUSA
    R.banu_musa_automatic_flute = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'FLAUTISTA PROGRAMABLE DE LOS BANU MUSA (s. IX)',
            'Tambor Cilíndrico Codificado con Púas (ROM Mecánica) + Válvulas Neumáticas', schematic);

        const xDrum = 320, yDrum = 315, R = 95;
        CAD.drawCenterline(ctx, 180, yDrum, 450, yDrum);
        CAD.drawCenterline(ctx, xDrum, 180, xDrum, 460);

        // Tambor programador rotativo con pines salientes
        CAD.drawGear(ctx, xDrum, yDrum, R, 16, theta, 'wood', schematic);
        CAD.drawFixedPivot(ctx, xDrum, yDrum, 9, 'O_tambor');

        // 5 Palancas seguidoras que activan orificios de la flauta vertical a la derecha
        for (let i = 0; i < 5; i++) {
            const camHit = Math.sin(theta + i * 1.2) > 0.35;
            const fy = 175 + i * 55;
            const tipLift = camHit ? -10 : 0;
            CAD.drawLink(ctx, 405, fy + tipLift, 540, fy - tipLift * 0.5, 8, camHit ? 'brass' : 'iron', schematic);
            CAD.drawFixedPivot(ctx, 475, fy, 5);
        }

        // Flauta vertical + chorros de aire modulados
        CAD.drawCylinder(ctx, 560, 140, 34, 300, 7, 'brass', schematic);
        CAD.drawFluidParticles(ctx, 577, 440, 577, 130, theta * 4, true, '#5280a0');

        CAD.drawNoteBox(ctx, 35, 85, 225, 'MEMORIA MECÁNICA', [
            '8 canales de notas programables',
            'Presión fuelle: 650 Pa',
            'Ciclo partitura: ' + ((theta * 180 / Math.PI)).toFixed(0) + '°'
        ]);
    };

    // 35. ÁTLATL MESOAMERICANO (RECONSTRUCCIÓN BIOMECÁNICA Y BALÍSTICA SIN MUÑECOS)
    R.mesoamerican_atlatl = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'ÁTLATL — CADENA BIOMECÁNICA Y BALÍSTICA ELÁSTICA',
            'Palanca de 3er Género en Serie + Pandeo Euler-Bernoulli + Tiro Parabólico Real', schematic);

        const xO = 160, yO = 365;
        const cycle = (theta / (Math.PI * 2));
        const releaseCycle = 0.48;

        // Cinemática angular de la cadena Hombro(O1) -> Codo(E) -> Muñeca(W) -> Gancho Átlatl(H)
        let q1, q2, q3;
        if (cycle < releaseCycle) {
            const p = cycle / releaseCycle;
            const ease = p * p * (3 - 2 * p);
            q1 = -2.2 + ease * 1.75; // Hombro
            q2 = q1 + 0.9 - ease * 0.85; // Codo se extiende
            q3 = q2 + 0.8 - ease * 1.1; // Látigo de muñeca + átlatl!
        } else {
            // Post-suelta: desaceleración suave del brazo
            const p = (cycle - releaseCycle) / (1 - releaseCycle);
            q1 = -0.45 + 0.2 * Math.sin(p * Math.PI);
            q2 = -0.40 + 0.25 * Math.sin(p * Math.PI);
            q3 = -0.70 + 0.1 * Math.sin(p * Math.PI);
        }

        const L1 = 78, L2 = 72, L3 = 105;
        const xE = xO + L1 * Math.cos(q1), yE = yO + L1 * Math.sin(q1);
        const xW = xE + L2 * Math.cos(q2), yW = yE + L2 * Math.sin(q2);
        const xH = xW + L3 * Math.cos(q3), yH = yW + L3 * Math.sin(q3);

        // Arco de barrido de la espuela + línea de suelo
        CAD.drawCenterline(ctx, 60, 480, 740, 480);
        CAD.drawGroundSupport(ctx, xO, 480, 80, 14, 'Base');

        // Cadena cinemática articulada de precisión
        CAD.drawLink(ctx, xO, yO, xE, yE, 14, 'iron', schematic);
        CAD.drawLink(ctx, xE, yE, xW, yW, 11, 'iron', schematic);
        CAD.drawLink(ctx, xW, yW, xH, yH, 8, 'wood', schematic); // Propulsor Átlatl

        // Contrapeso lítico tallado (bannerstone) en mitad del átlatl
        CAD.drawPin(ctx, (xW + xH) / 2, (yW + yH) / 2, 7);

        // Trayectoria balística teórica punteada
        const v0 = 320; // px/s escalados
        const launchAngle = -0.48; // ~27.5° arriba
        const g = 210;
        const xRel = 235, yRel = 245;

        ctx.save();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (let t = 0; t <= 1.8; t += 0.05) {
            const px = xRel + v0 * Math.cos(launchAngle) * t;
            const py = yRel + v0 * Math.sin(launchAngle) * t + 0.5 * g * t * t;
            if (px > 760 || py > 480) break;
            if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // DARDO ELÁSTICO: durante aceleración se comprime (pandeo); tras suelta sigue cinemática parabólica real!
        if (cycle < releaseCycle) {
            const flex = Math.sin((cycle / releaseCycle) * Math.PI) * 20;
            const dAng = q3 + 0.35;
            const tipX = xH + 175 * Math.cos(dAng);
            const tipY = yH + 175 * Math.sin(dAng);
            CAD.drawElasticBeam(ctx, xH, yH, tipX, tipY, flex, 4.5, '#1e293b');
            CAD.drawVector(ctx, xH, yH, -Math.sin(q3) * 65, Math.cos(q3) * 65, CAD.COLORS.vectorVel, 'v_espuela');
        } else {
            const tFlight = ((cycle - releaseCycle) / (1 - releaseCycle)) * 1.45;
            const vx = v0 * Math.cos(launchAngle);
            const vy = v0 * Math.sin(launchAngle) + g * tFlight;
            const px = xRel + vx * tFlight;
            const py = yRel + v0 * Math.sin(launchAngle) * tFlight + 0.5 * g * tFlight * tFlight;
            const pitch = Math.atan2(vy, vx);
            if (px < 750 && py < 480) {
                const tx = px + 115 * Math.cos(pitch), ty = py + 115 * Math.sin(pitch);
                CAD.drawElasticBeam(ctx, px - 45 * Math.cos(pitch), py - 45 * Math.sin(pitch), tx, ty, Math.sin(tFlight * 18) * 3, 4.5, '#1e293b');
                CAD.drawVector(ctx, tx, ty, vx * 0.22, vy * 0.22, CAD.COLORS.vectorVel, 'v(t)');
            }
        }

        CAD.drawFixedPivot(ctx, xO, yO, 8, 'O₁ (Hombro)');
        CAD.drawPin(ctx, xE, yE, 6, 'E (Codo)');
        CAD.drawPin(ctx, xW, yW, 6, 'W (Muñeca)');
        CAD.drawPin(ctx, xH, yH, 5, 'H (Gancho)');

        CAD.drawNoteBox(ctx, 480, 85, 275, 'BALÍSTICA Y FLEXIÓN ELÁSTICA', [
            'Extensión palanca: L₃ = 580 mm',
            'Velocidad salida: v₀ = 38.5 m/s',
            'Amplificación energía: 4.0× mano',
            'Estado: ' + (cycle < releaseCycle ? 'CARGA Y PANDEO ELÁSTICO' : 'VUELO BALÍSTICO')
        ]);
    };

    // 36. BALLESTA DE REPETICIÓN ZHUGE NU
    R.chinese_repeating_crossbow = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'BALLESTA DE REPETICIÓN ZHUGE NU (c. 200 d.C.)',
            'Mecanismo 4-Barras Palanca-Corredera + Cargador Gravitatorio de 10 Virotes', schematic);

        const cycle = (theta / (Math.PI * 2));
        const cocking = cycle < 0.65;
        const pull = cocking ? (cycle / 0.65) : 0;
        const stringX = 390 - pull * 130;

        CAD.drawCenterline(ctx, 110, 290, 720, 290);
        // Cureña fija
        CAD.drawTimberBeam(ctx, 150, 315, 480, 315, 20, schematic);
        CAD.drawGroundSupport(ctx, 210, 440, 90, 14);

        // Arco compuesto flexible flexionándose proporcionalmente a pull!
        const bowBend = pull * 34;
        CAD.drawElasticBeam(ctx, 465, 165, 465, 415, bowBend, 10, CAD.COLORS.woodDark);
        // Cuerda desde extremos del arco hasta la nuez corrediza
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(465 - bowBend * 0.4, 165); ctx.lineTo(stringX, 290); ctx.lineTo(465 - bowBend * 0.4, 415);
        ctx.stroke();

        // Cargador superior deslizante + palanca trasera articulada
        CAD.drawHatchRect(ctx, stringX - 25, 215, 130, 62, CAD.COLORS.woodMid, 12);
        CAD.drawLink(ctx, 185, 315, stringX + 45, 240, 11, 'brass', schematic);
        CAD.drawFixedPivot(ctx, 185, 315, 7, 'O₁');

        // Virote disparado tras liberación
        if (!cocking) {
            const fT = (cycle - 0.65) / 0.35;
            const bx = 460 + fT * 270;
            CAD.drawLink(ctx, bx - 55, 290, bx, 290, 5, 'iron', schematic);
            CAD.drawVector(ctx, bx, 290, 55, 0, CAD.COLORS.vectorVel, '42 m/s');
        }

        CAD.drawNoteBox(ctx, 35, 85, 235, 'CICLO SEMIAUTOMÁTICO', [
            'Capacidad cargador: 10 virotes',
            'Carrera cuerda: ' + (pull * 210).toFixed(0) + ' mm',
            'Fase: ' + (cocking ? 'ARMADO Y CARGA' : 'DISPARO!')
        ]);
    };

    // 37. EOLÍPILA DE HERÓN
    R.heron_aeolipile = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'EOLÍPILA DE HERÓN DE ALEJANDRÍA (s. I d.C.)',
            'Turbina de Reacción Pura | Conservación Momento Angular τ = 2·R·ṁ·v_e', schematic);

        const cx = 400, cy = 240, r = 68;
        CAD.drawCenterline(ctx, 210, cy, 590, cy);
        CAD.drawCenterline(ctx, cx, 110, cx, 495);

        // Caldera inferior y fuego
        ctx.fillStyle = '#a53a1a';
        ctx.fillRect(310, 465, 180, 32);
        CAD.drawCylinder(ctx, 285, 375, 230, 88, 10, 'copper', schematic);
        ctx.fillStyle = CAD.COLORS.water;
        ctx.fillRect(287, 420, 226, 41);

        // Soportes huecos conductores de vapor hasta cojinetes O1, O2
        CAD.drawLink(ctx, 300, 375, 300, cy, 10, 'copper', schematic);
        CAD.drawLink(ctx, 500, 375, 500, cy, 10, 'copper', schematic);
        CAD.drawLink(ctx, 300, cy, 500, cy, 9, 'brass', schematic);

        // Esfera girando rápidamente
        const spin = theta * 3.0;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(spin);
        const g = ctx.createRadialGradient(-20, -20, 6, 0, 0, r);
        g.addColorStop(0, '#fef3c7'); g.addColorStop(0.6, CAD.COLORS.brassMid); g.addColorStop(1, CAD.COLORS.brassDark);
        ctx.fillStyle = schematic ? '#fff' : g;
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Dos toberas acodadas opuestas + chorros de vapor reactivos tangenciales!
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(0, -r - 18); ctx.lineTo(24, -r - 18);
        ctx.moveTo(0, r); ctx.lineTo(0, r + 18); ctx.lineTo(-24, r + 18);
        ctx.stroke();

        CAD.drawVector(ctx, 24, -r - 18, 45, 0, '#8d8578', 'Chorro');
        CAD.drawVector(ctx, -24, r + 18, -45, 0, '#8d8578', 'Chorro');
        ctx.restore();

        CAD.drawFixedPivot(ctx, 300, cy, 7, 'O₁');
        CAD.drawFixedPivot(ctx, 500, cy, 7, 'O₂');
        CAD.drawNoteBox(ctx, 35, 85, 225, 'TURBINA DE REACCIÓN', [
            'Velocidad chorro: 140 m/s',
            'Par de reacción: 0.18 N·m',
            'Régimen nominal: ~950 rpm'
        ]);
    };

    // 38. VENTILADOR CENTRÍFUGO MINERO DE AGRÍCOLA
    R.agricola_ventilation_fan = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'VENTILADOR CENTRÍFUGO DE AGRÍCOLA (1556)',
            'Carcasa en Voluta Espiral | Aceleración Radial Centrífuga ΔP = ½ρ(u₂² - u₁²)', schematic);

        const cx = 370, cy = 325, R = 128;
        CAD.drawCenterline(ctx, 180, cy, 560, cy);
        CAD.drawCenterline(ctx, cx, 130, cx, 500);

        // Carcasa en voluta + ducto de descarga tangencial superior
        ctx.save();
        ctx.fillStyle = schematic ? '#fff' : '#f1f5f9';
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillRect(cx + 50, 95, 65, 200);
        ctx.strokeRect(cx + 50, 95, 65, 200);
        ctx.restore();

        // Rodete centrífugo de 6 álabes curvos
        const rotorAng = theta * 2.5;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotorAng);
        ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.lineWidth = 6;
        for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI * 2) / 6;
            ctx.beginPath();
            ctx.moveTo(20 * Math.cos(a), 20 * Math.sin(a));
            ctx.quadraticCurveTo(75 * Math.cos(a + 0.35), 75 * Math.sin(a + 0.35), R * Math.cos(a + 0.15), R * Math.sin(a + 0.15));
            ctx.stroke();
        }
        ctx.restore();

        // Partículas de aire acelerando radialmente hacia la voluta y subiendo por el ducto
        for (let i = 0; i < 6; i++) {
            const p = ((theta / (Math.PI * 2)) + i / 6) % 1;
            const rr = 22 + p * (R - 25);
            const ang = rotorAng + i * 1.05;
            ctx.fillStyle = '#1d4968';
            ctx.beginPath(); ctx.arc(cx + rr * Math.cos(ang), cy + rr * Math.sin(ang), 3.5, 0, Math.PI * 2); ctx.fill();
        }
        CAD.drawFluidParticles(ctx, cx + 82, 290, cx + 82, 95, theta * 4, true, '#1d4968');

        CAD.drawFixedPivot(ctx, cx, cy, 10, 'O_rodete');
        CAD.drawNoteBox(ctx, 35, 85, 220, 'TURBOMÁQUINA RADIAL', [
            'Ø Rodete: 720 mm (6 álabes)',
            'Velocidad periférica: 14.5 m/s',
            'Caudal aire: 950 m³/h'
        ]);
    };

    // 39. HORNO EÓLICO HUAYRA INCA
    R.inca_huayra_furnace = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'HORNO METALÚRGICO EÓLICO HUAYRA (ANDES)',
            'Tiro por Efecto Venturi en Toberas Troncocónicas | T_lecho ≈ 960 °C', schematic);

        CAD.drawCenterline(ctx, 400, 90, 400, 520);
        CAD.drawGroundSupport(ctx, 400, 490, 320, 16);

        // Estructura troncocónica de barro refractario en corte con toberas laterales
        CAD.drawHatchRect(ctx, 270, 175, 24, 315, '#c2410c', 10);
        CAD.drawHatchRect(ctx, 506, 175, 24, 315, '#c2410c', 10);

        // Lecho incandescente de carbón y galena argentífera
        const pulse = 0.7 + 0.3 * Math.sin(theta * 2);
        ctx.fillStyle = `rgba(234, 88, 12, ${pulse})`;
        ctx.fillRect(295, 360, 210, 125);

        // Líneas de viento andino entrando por las toberas laterales por Venturi
        CAD.drawFluidParticles(ctx, 110, 260, 385, 390, theta * 3, true, '#1d4968');
        CAD.drawFluidParticles(ctx, 110, 350, 385, 420, theta * 3, true, '#1d4968');
        // Convección ascendente de gases calientes
        CAD.drawFluidParticles(ctx, 360, 355, 360, 105, theta * 3, true, '#a53a1a');
        CAD.drawFluidParticles(ctx, 440, 355, 440, 105, theta * 3, true, '#a53a1a');

        CAD.drawVector(ctx, 90, 260, 75, 0, '#1d4968', 'Viento 8 m/s');
        CAD.drawNoteBox(ctx, 520, 85, 240, 'TERMODINÁMICA EÓLICA', [
            '12 toberas perimetrales Venturi',
            'Temperatura pico: ~960 °C',
            'Viento de ladera: 8.0 m/s'
        ]);
    };

    // 40. ESTÁTICA DE LA CATEDRAL GÓTICA (ARBOTANTE Y PINÁCULO)
    R.gothic_cathedral = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'ESTÁTICA DE LA BÓVEDA GÓTICA (ARCO OJIVAL Y ARBOTANTE)',
            'Línea de Empujes de Hooke | Estabilidad dentro del Tercio Medio (σ ≤ 4.5 MPa)', schematic);

        // Variación paramétrica con theta del peso del pináculo / carga de viento
        const wPin = 0.6 + 0.4 * (0.5 + 0.5 * Math.cos(theta)); // factor peso pináculo
        // Nave derecha (bóveda ojival) y estribo izquierdo
        CAD.drawGroundSupport(ctx, 195, 495, 110, 16, 'Estribo');
        CAD.drawGroundSupport(ctx, 640, 495, 90, 16);

        // Pilar del estribo + Pináculo superior
        CAD.drawHatchRect(ctx, 155, 210, 80, 285, '#cbd5e1', 12);
        ctx.fillStyle = '#8d8578';
        ctx.beginPath(); ctx.moveTo(160, 210); ctx.lineTo(195, 120 - wPin * 25); ctx.lineTo(230, 210); ctx.closePath(); ctx.fill(); ctx.stroke();

        // Bóveda ojival derecha
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(395, 245); ctx.quadraticCurveTo(445, 130, 520, 115); ctx.quadraticCurveTo(595, 130, 645, 245); ctx.stroke();
        // Arbotante inclinado transmitiendo empuje horizontal H hacia el estribo
        CAD.drawTimberBeam(ctx, 395, 245, 235, 290, 18, true);
        CAD.drawHatchRect(ctx, 375, 240, 40, 255, '#cbd5e1', 10);

        // Polígono de fuerzas y LÍNEA DE EMPUJES en rojo dentro del pilar!
        const horizShift = (1 - wPin) * 32; // Con menor pináculo el empuje se acerca al borde!
        ctx.save();
        ctx.strokeStyle = '#962b23';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(520, 115);
        ctx.quadraticCurveTo(445, 170, 395, 245);
        ctx.lineTo(235, 290);
        ctx.lineTo(195 + horizShift, 495);
        ctx.stroke();
        ctx.restore();

        CAD.drawVector(ctx, 235, 290, -45, 15, CAD.COLORS.vectorForce, 'H (Bóveda)');
        CAD.drawVector(ctx, 195, 210, 0, 50 + wPin * 45, CAD.COLORS.vectorThrust, 'W_pináculo');
        CAD.drawNoteBox(ctx, 480, 385, 270, 'CRITERIO DEL TERCIO MEDIO', [
            'Peso pináculo: ' + (120 + wPin * 85).toFixed(0) + ' kN',
            'Excentricidad en base: ' + horizShift.toFixed(1) + ' mm',
            'Estado: ' + (horizShift < 26 ? 'ESTABLE EN COMPRESIÓN' : 'CERCANO A VUELCO!')
        ]);
    };

    // 41. PUENTE COLGANTE INCA Q'ESWACHAKA
    R.inca_suspension_bridge = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'PUENTE COLGANTE INCA Q\'ESWACHAKA (ICHU TRENZADO)',
            'Catenaria Elástica Bajo Carga Móvil | Tracción Pura T₀ = cte', schematic);

        const xA = 110, xB = 690, yAnch = 195;
        const loadPos = (theta / (Math.PI * 2)); // Caravana cruzando [0..1]
        const xLoad = xA + loadPos * (xB - xA);

        // Estribos de roca andina
        CAD.drawHatchRect(ctx, 40, 195, 85, 315, '#8d8578', 12);
        CAD.drawHatchRect(ctx, 675, 195, 85, 315, '#8d8578', 12);
        CAD.drawGroundSupport(ctx, 400, 510, 720, 14);

        // Función catenaria + deflexión elástica localizada bajo carga P(x)
        function yCable(x) {
            const u = (x - xA) / (xB - xA); // [0..1]
            const baseSag = 75 * 4 * u * (1 - u);
            const dist = Math.abs(x - xLoad);
            const liveSag = 26 * Math.exp(-(dist * dist) / (75 * 75));
            return yAnch + baseSag + liveSag;
        }

        // Cables principales y péndolas verticales
        ctx.strokeStyle = CAD.COLORS.woodDark;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        for (let x = xA; x <= xB; x += 6) {
            if (x === xA) ctx.moveTo(x, yCable(x));
            else ctx.lineTo(x, yCable(x));
        }
        ctx.stroke();

        // Tablero inferior articulado + carga puntual móvil
        ctx.strokeStyle = CAD.COLORS.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = xA; x <= xB; x += 15) {
            const yy = yCable(x) + 32;
            if (x === xA) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
        }
        ctx.stroke();

        for (let x = xA + 30; x < xB; x += 35) {
            ctx.strokeStyle = '#8d8578';
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(x, yCable(x)); ctx.lineTo(x, yCable(x) + 32); ctx.stroke();
        }

        // Vector carga móvil P(x)
        const yL = yCable(xLoad) + 32;
        CAD.drawHatchRect(ctx, xLoad - 14, yL - 22, 28, 22, CAD.COLORS.brassMid, 5);
        CAD.drawVector(ctx, xLoad, yL, 0, 55, '#962b23', 'Carga P(x)');

        CAD.drawFixedPivot(ctx, xA, yAnch, 7, 'Anclaje 1');
        CAD.drawFixedPivot(ctx, xB, yAnch, 7, 'Anclaje 2');
        CAD.drawNoteBox(ctx, 275, 420, 260, 'MECÁNICA FUNICULAR', [
            'Luz libre L = 28.0 m',
            'Posición carga: ' + (loadPos * 28).toFixed(1) + ' m',
            'Flecha máx bajo carga: ' + ((yCable(xLoad) - yAnch) * 0.032).toFixed(2) + ' m'
        ]);
    };

    // 42. MATRIZ MNEMOTÉCNICA DECIMAL DE QUIPU
    R.inca_quipu_memory = function(ctx, w, h, theta, k, schematic) {
        CAD.clearAndGrid(ctx, w, h,
            'MATRIZ MNEMOTÉCNICA DECIMAL DE QUIPU (TAHUANTINSUYO)',
            'Codificación Posicional Base-10 | Verificación por Cuerda Sumatoria (Checksum)', schematic);

        // Variar dinámicamente una de las cuerdas con el deslizador theta para demostrar codificación numérica!
        const val1 = 243;
        const val2 = 135;
        const val3 = Math.round(112 + 120 * (0.5 + 0.5 * Math.cos(theta)));
        const val4 = 308;
        const vals = [val1, val2, val3, val4];
        const sumTotal = vals.reduce((a, b) => a + b, 0);

        // Cuerda principal horizontal
        CAD.drawTimberBeam(ctx, 100, 155, 700, 155, 11, schematic);
        CAD.drawPin(ctx, 100, 155, 6, 'Cuerda Principal');

        // 4 Cuerdas colgantes posicionales (Centenas, Decenas, Unidades)
        vals.forEach((v, idx) => {
            const cx = 195 + idx * 120;
            const c = Math.floor(v / 100);
            const d = Math.floor((v % 100) / 10);
            const u = v % 10;

            ctx.strokeStyle = idx === 2 ? '#b45309' : CAD.COLORS.woodDark;
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.moveTo(cx, 155); ctx.lineTo(cx, 465); ctx.stroke();

            // Nudos de Centenas (y=220), Decenas (y=310), Unidades (y=400)
            for (let i = 0; i < c; i++) CAD.drawPin(ctx, cx, 210 + i * 11, 5);
            for (let i = 0; i < d; i++) CAD.drawPin(ctx, cx, 300 + i * 10, 4.5);
            // Nudo largo de unidades (tamaño proporcional a u)
            if (u > 0) {
                CAD.drawHatchRect(ctx, cx - 7, 395, 14, 10 + u * 4, CAD.COLORS.brassMid, 4);
            }

            ctx.fillStyle = CAD.COLORS.ink;
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(String(v).padStart(3, '0'), cx, 488);
        });

        // Cuerda subsidiaria superior sumatoria (Suma exacta de registros)
        ctx.strokeStyle = '#962b23';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(670, 155); ctx.lineTo(670, 385); ctx.stroke();
        ctx.fillStyle = '#962b23';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Σ = ' + sumTotal, 670, 410);

        CAD.drawNoteBox(ctx, 35, 505, 730, 'REGISTRO CONTABLE EN BASE 10', [
            `Cuerda C1=${val1} | Cuerda C2=${val2} | Cuerda C3 (Variable)=${val3} | Cuerda C4=${val4}  ⇒  Cuerda Totalizadora (Checksum) = ${sumTotal}`
        ]);
    };

})(window.MACHINE_RENDERERS);
