/**
 * Mechanica Antiqua - Motor Cinemático Interactivo
 * Simulación paramétrica en tiempo real y telemetría analítica en el cliente.
 */

(function() {
    'use strict';

    class KinematicsWorkbench {
        constructor() {
            this.container = document.getElementById('kinematic-workbench');
            if (!this.container) return;

            this.modelType = this.container.dataset.modelType || 'crank_slider';
            this.svgContainer = document.getElementById('machine-svg-wrapper');
            this.svg = this.svgContainer ? this.svgContainer.querySelector('svg') : null;
            if (!this.svg) return;

            // Parámetros y estado de la simulación
            this.theta = 0; // Ángulo actual en radianes
            this.omega = 2.0; // rad/s nominal
            this.isPlaying = true;
            this.speedFactor = 1.0;
            this.viewMode = 'assembly'; // 'assembly' | 'schematic'
            this.lastTimestamp = null;

            // Extraer o inferir geometría básica del modelo
            this.setupGeometry();
            this.createControls();
            this.createPlot();
            this.cacheDOMElements();

            // Iniciar bucle de animación
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        setupGeometry() {
            // Dimensiones nominales en píxeles de canvas y unidades de ingeniería
            switch(this.modelType) {
                case 'crank_slider':
                    this.r = 60; // Radio de manivela (px)
                    this.L = 240; // Longitud de biela (px)
                    this.lambda = this.r / this.L; // 0.25
                    this.strokeMm = 300;
                    break;
                case 'scotch_yoke':
                    this.r = 55;
                    this.strokeMm = 320;
                    break;
                case 'cam_follower':
                    this.hMax = 60;
                    this.numCams = 3;
                    break;
                case 'epicyclic':
                    this.R_drum = 170;
                    this.numDesks = 8;
                    break;
                case 'lead_screw':
                    this.pitch = 8;
                    this.maxTravel = 180;
                    break;
                case 'ball_bearing':
                    this.numBalls = 8;
                    this.R_pitch = 128;
                    break;
                case 'beam_engine':
                    this.L_beam = 200;
                    this.psiMax = 0.22; // rad (~12.6°)
                    break;
                default:
                    this.r = 50;
            }
        }

        cacheDOMElements() {
            // Cachear elementos SVG para manipulación directa de alto rendimiento
            this.elCrank = this.svg.querySelector('.crank-rot, .wheel-rotate, .crank-rotate, [id*="crank"]');
            this.elRod = this.svg.querySelector('[id*="rod"], line[stroke-width="7"], line[stroke-width="6"]');
            this.elSlider = this.svg.querySelector('.saw-reciprocate, .piston-group, .slot-shuttle, [id*="slider"]');
            
            // Elementos para balancines y máquinas atmosféricas
            this.elBeam = this.svg.querySelector('.beam-oscillate, #nc-beam-assembly');
            this.elSteamPiston = this.svg.querySelector('.steam-piston');
            this.elPumpRod = this.svg.querySelector('.pump-rod');
            this.elSpray = this.svg.querySelector('.cold-spray');

            // Elementos para tornos y husillos
            this.elSpindle = this.svg.querySelector('.spindle-spin');
            this.elCarriage = this.svg.querySelector('.carriage-slide, #lathe-carriage');

            // Elementos para cojinetes de bolas
            this.elCage = this.svg.querySelector('.cage-orbital, #cage-assembly');
            this.elShaft = this.svg.querySelector('.shaft-rotate, #inner-shaft');
            this.elBalls = this.svg.querySelectorAll('.ball-spin');

            // Elementos para el carro de Ma Jun
            this.elWheelL = this.svg.querySelector('.wheel-l, #wheel-left');
            this.elWheelR = this.svg.querySelector('.wheel-r, #wheel-right');
            this.elDiff = this.svg.querySelector('.diff-center, #diff-assembly');
            this.elPointer = this.svg.querySelector('#south-pointer');

            // Elementos para tornillo de Arquímedes
            this.elHelix = this.svg.querySelector('.helix-stream, .helix-move');

            // Desactivar animaciones CSS toscas en favor del motor cinemático analítico
            const animElements = [
                this.elCrank, this.elSlider, this.elBeam, this.elSteamPiston, 
                this.elPumpRod, this.elSpray, this.elSpindle, this.elCarriage,
                this.elCage, this.elShaft, this.elWheelL, this.elWheelR,
                this.elDiff, this.elHelix
            ];
            animElements.forEach(el => {
                if (el) el.style.animation = 'none';
            });
            this.svg.querySelectorAll('.ball-spin').forEach(el => el.style.animation = 'none');
        }

        createControls() {
            const controlsCard = document.createElement('div');
            controlsCard.className = 'kinematic-controls-card';
            controlsCard.innerHTML = `
                <div class="kc-toolbar">
                    <button id="kc-play-pause" class="kc-btn kc-btn-primary">⏸ Pausar</button>
                    <button id="kc-step-prev" class="kc-btn">◀ -15°</button>
                    <button id="kc-step-next" class="kc-btn">+15° ▶</button>
                    <button id="kc-pos-pms" class="kc-btn kc-btn-secondary">PMS (0°)</button>
                    <button id="kc-pos-pmi" class="kc-btn kc-btn-secondary">PMI (180°)</button>
                    
                    <div class="kc-speed-group">
                        <span class="kc-label">Velocidad:</span>
                        <button class="kc-btn-speed active" data-speed="1.0">1×</button>
                        <button class="kc-btn-speed" data-speed="0.5">0.5×</button>
                        <button class="kc-btn-speed" data-speed="2.0">2×</button>
                    </div>

                    <button id="kc-toggle-view" class="kc-btn kc-btn-toggle">Modo: Ensamblaje</button>
                </div>

                <div class="kc-scrub-row">
                    <label for="kc-angle-slider" class="kc-label">Ángulo de Manivela (θ):</label>
                    <input type="range" id="kc-angle-slider" min="0" max="360" value="0" step="1" class="kc-slider">
                    <span id="kc-angle-readout" class="kc-numeric-readout">0.0° (0.00 rad)</span>
                </div>

                <div class="kc-telemetry-grid">
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">Desplazamiento s(θ)</span>
                        <span id="kc-val-disp" class="kc-metric-val">0.0 mm</span>
                    </div>
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">Velocidad v(θ)</span>
                        <span id="kc-val-vel" class="kc-metric-val">0.00 m/s</span>
                    </div>
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">Aceleración a(θ)</span>
                        <span id="kc-val-acc" class="kc-metric-val">0.00 m/s²</span>
                    </div>
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">Ángulo de Biela φ(θ)</span>
                        <span id="kc-val-phi" class="kc-metric-val">0.0°</span>
                    </div>
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">Ventaja Mecánica (MA)</span>
                        <span id="kc-val-ma" class="kc-metric-val">1.00</span>
                    </div>
                </div>
            `;

            this.svgContainer.parentNode.insertBefore(controlsCard, this.svgContainer);

            // Bindeo de eventos
            this.btnPlayPause = controlsCard.querySelector('#kc-play-pause');
            this.sliderAngle = controlsCard.querySelector('#kc-angle-slider');
            this.txtAngle = controlsCard.querySelector('#kc-angle-readout');
            this.valDisp = controlsCard.querySelector('#kc-val-disp');
            this.valVel = controlsCard.querySelector('#kc-val-vel');
            this.valAcc = controlsCard.querySelector('#kc-val-acc');
            this.valPhi = controlsCard.querySelector('#kc-val-phi');
            this.valMa = controlsCard.querySelector('#kc-val-ma');
            this.btnToggleView = controlsCard.querySelector('#kc-toggle-view');

            this.btnPlayPause.addEventListener('click', () => {
                this.isPlaying = !this.isPlaying;
                this.btnPlayPause.textContent = this.isPlaying ? '⏸ Pausar' : '▶ Reproducir';
                this.btnPlayPause.classList.toggle('kc-btn-primary', this.isPlaying);
            });

            this.sliderAngle.addEventListener('input', (e) => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = '▶ Reproducir';
                this.btnPlayPause.classList.remove('kc-btn-primary');
                this.setAngle(parseFloat(e.target.value) * (Math.PI / 180));
            });

            controlsCard.querySelector('#kc-step-prev').addEventListener('click', () => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = '▶ Reproducir';
                this.stepAngle(-15 * (Math.PI / 180));
            });

            controlsCard.querySelector('#kc-step-next').addEventListener('click', () => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = '▶ Reproducir';
                this.stepAngle(15 * (Math.PI / 180));
            });

            controlsCard.querySelector('#kc-pos-pms').addEventListener('click', () => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = '▶ Reproducir';
                this.setAngle(0);
            });

            controlsCard.querySelector('#kc-pos-pmi').addEventListener('click', () => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = '▶ Reproducir';
                this.setAngle(Math.PI);
            });

            controlsCard.querySelectorAll('.kc-btn-speed').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    controlsCard.querySelectorAll('.kc-btn-speed').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.speedFactor = parseFloat(e.target.dataset.speed);
                });
            });

            this.btnToggleView.addEventListener('click', () => {
                this.viewMode = this.viewMode === 'assembly' ? 'schematic' : 'assembly';
                this.btnToggleView.textContent = this.viewMode === 'assembly' ? 'Modo: Ensamblaje' : 'Modo: Diagrama Cinemático';
                this.svg.classList.toggle('schematic-view', this.viewMode === 'schematic');
            });
        }

        createPlot() {
            // Crear el gráfico vectorial sincronizado de s(θ), v(θ), a(θ)
            const plotWrapper = document.createElement('div');
            plotWrapper.className = 'kinematic-plot-card';
            plotWrapper.innerHTML = `
                <div class="kc-plot-header">
                    <h4>Curvas Cinemáticas del Ciclo Completo (0° a 360°)</h4>
                    <div class="kc-plot-legend">
                        <span class="legend-item"><span class="legend-dot dot-disp"></span> s(θ) Desplazamiento</span>
                        <span class="legend-item"><span class="legend-dot dot-vel"></span> v(θ) Velocidad</span>
                        <span class="legend-item"><span class="legend-dot dot-acc"></span> a(θ) Aceleración</span>
                    </div>
                </div>
                <div class="kc-plot-svg-box">
                    <svg id="kc-cycle-plot" viewBox="0 0 720 180" preserveAspectRatio="none">
                        <line x1="60" y1="90" x2="680" y2="90" stroke="#cbd5e1" stroke-width="1.5"/>
                        <line x1="60" y1="20" x2="60" y2="160" stroke="#cbd5e1" stroke-width="1.5"/>
                        
                        <!-- Marcas angulares -->
                        <text x="60" y="105" font-size="11" fill="#64748b" text-anchor="middle">0°</text>
                        <text x="215" y="105" font-size="11" fill="#64748b" text-anchor="middle">90°</text>
                        <text x="370" y="105" font-size="11" fill="#64748b" text-anchor="middle">180°</text>
                        <text x="525" y="105" font-size="11" fill="#64748b" text-anchor="middle">270°</text>
                        <text x="680" y="105" font-size="11" fill="#64748b" text-anchor="middle">360°</text>

                        <!-- Curvas precalculadas -->
                        <path id="plot-path-disp" class="path-disp" fill="none" stroke="#2563eb" stroke-width="2.5"/>
                        <path id="plot-path-vel" class="path-vel" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="4 2"/>
                        <path id="plot-path-acc" class="path-acc" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="2 2"/>

                        <!-- Cursor vertical interactivo móvil -->
                        <line id="kc-plot-cursor" x1="60" y1="15" x2="60" y2="165" stroke="#3d2b1f" stroke-width="2.5" stroke-dasharray="3 3"/>
                        <circle id="kc-plot-cursor-point" cx="60" cy="90" r="4.5" fill="#3d2b1f"/>
                    </svg>
                </div>
            `;

            this.svgContainer.parentNode.insertBefore(plotWrapper, this.svgContainer.nextSibling);

            this.plotCursor = plotWrapper.querySelector('#kc-plot-cursor');
            this.plotPoint = plotWrapper.querySelector('#kc-plot-cursor-point');
            this.generatePlotCurves(plotWrapper);
        }

        generatePlotCurves(plotWrapper) {
            const pathDisp = plotWrapper.querySelector('#plot-path-disp');
            const pathVel = plotWrapper.querySelector('#plot-path-vel');
            const pathAcc = plotWrapper.querySelector('#plot-path-acc');

            let dDisp = '';
            let dVel = '';
            let dAcc = '';

            const N = 120;
            const x0 = 60, x1 = 680, yMid = 90, scaleY = 65;

            for (let i = 0; i <= N; i++) {
                const th = (i / N) * 2 * Math.PI;
                const px = x0 + (i / N) * (x1 - x0);

                const k = this.calculateKinematics(th);
                const pyDisp = yMid - k.normDisp * scaleY;
                const pyVel = yMid - k.normVel * scaleY;
                const pyAcc = yMid - k.normAcc * scaleY;

                dDisp += (i === 0 ? 'M ' : ' L ') + `${px.toFixed(1)} ${pyDisp.toFixed(1)}`;
                dVel += (i === 0 ? 'M ' : ' L ') + `${px.toFixed(1)} ${pyVel.toFixed(1)}`;
                dAcc += (i === 0 ? 'M ' : ' L ') + `${px.toFixed(1)} ${pyAcc.toFixed(1)}`;
            }

            pathDisp.setAttribute('d', dDisp);
            pathVel.setAttribute('d', dVel);
            pathAcc.setAttribute('d', dAcc);
        }

        calculateKinematics(th) {
            // Modelo analítico según el mecanismo
            const sinT = Math.sin(th);
            const cosT = Math.cos(th);

            if (this.modelType === 'crank_slider') {
                const lambda = this.lambda || 0.25;
                // Desplazamiento desde el PMS
                const s = 1 - cosT + (lambda / 2) * (sinT * sinT);
                const v = sinT + (lambda / 2) * Math.sin(2 * th);
                const a = cosT + lambda * Math.cos(2 * th);
                const phi = Math.asin(lambda * sinT);
                const ma = Math.abs(cosT) < 0.05 ? 10.0 : Math.min(10.0, 1.0 / Math.max(0.1, Math.abs(sinT)));

                return {
                    normDisp: (s / 2) * 2 - 1, // [-1, 1]
                    normVel: v / 1.25,
                    normAcc: a / (1 + lambda),
                    sMm: (s / 2) * this.strokeMm,
                    vMs: v * 1.5,
                    aMs2: a * 15.0,
                    phiDeg: (phi * 180 / Math.PI),
                    ma: ma
                };
            } else if (this.modelType === 'scotch_yoke') {
                // Movimiento armónico simple puro
                const s = cosT;
                const v = -sinT;
                const a = -cosT;
                return {
                    normDisp: s,
                    normVel: v,
                    normAcc: a,
                    sMm: ((1 - cosT) / 2) * this.strokeMm,
                    vMs: v * 1.2,
                    aMs2: a * 12.0,
                    phiDeg: 0,
                    ma: 1.0 / Math.max(0.1, Math.abs(sinT))
                };
            } else if (this.modelType === 'cam_follower') {
                const liftAngle = (2 * Math.PI) / 3; // 120°
                const rem = th % liftAngle;
                let sNorm, vNorm, aNorm;
                if (rem < liftAngle * 0.7) {
                    sNorm = rem / (liftAngle * 0.7);
                    vNorm = 0.8;
                    aNorm = 0;
                } else {
                    const t = (rem - liftAngle * 0.7) / (liftAngle * 0.3);
                    sNorm = Math.max(0, 1 - t * t);
                    vNorm = -2 * t;
                    aNorm = -1.0;
                }
                return {
                    normDisp: sNorm * 2 - 1,
                    normVel: vNorm,
                    normAcc: aNorm,
                    sMm: sNorm * 250,
                    vMs: vNorm * 2.2,
                    aMs2: aNorm * 9.81,
                    phiDeg: 0,
                    ma: 1.5
                };
            } else if (this.modelType === 'beam_engine') {
                const psiMax = 10.0 * (Math.PI / 180); // 10° oscilación
                const psi = psiMax * Math.sin(th);
                const s = 900 * (1 - Math.cos(th)); // Carrera total 1800 mm
                const v = 900 * (Math.PI / 2.25) * Math.sin(th) * 0.001;
                const a = 900 * Math.pow(Math.PI / 2.25, 2) * Math.cos(th) * 0.001;
                return {
                    normDisp: -Math.cos(th),
                    normVel: Math.sin(th),
                    normAcc: Math.cos(th),
                    sMm: s,
                    vMs: v,
                    aMs2: a,
                    phiDeg: (psi * 180 / Math.PI),
                    ma: 1.0
                };
            } else if (this.modelType === 'lead_screw') {
                const cycle = (th % (2 * Math.PI)) / (2 * Math.PI);
                return {
                    normDisp: cycle * 2 - 1,
                    normVel: 1.0,
                    normAcc: 0.0,
                    sMm: cycle * 350,
                    vMs: 0.025,
                    aMs2: 0.0,
                    phiDeg: 0,
                    ma: 118.0 // (2 * pi * r) / p
                };
            } else if (this.modelType === 'ball_bearing') {
                return {
                    normDisp: Math.cos(th * 0.5),
                    normVel: -Math.sin(th * 0.5),
                    normAcc: -Math.cos(th * 0.5),
                    sMm: 127.5 * (1 - Math.cos(th * 0.5)),
                    vMs: -0.65 * Math.sin(th * 0.5),
                    aMs2: -0.33 * Math.cos(th * 0.5),
                    phiDeg: ((th * 180 / Math.PI) * 2.43) % 360,
                    ma: 2.0
                };
            } else if (this.modelType === 'epicyclic') {
                return {
                    normDisp: Math.cos(th),
                    normVel: -Math.sin(th),
                    normAcc: -Math.cos(th),
                    sMm: 340 * (1 - Math.cos(th)),
                    vMs: -1.2 * Math.sin(th),
                    aMs2: -1.2 * Math.cos(th),
                    phiDeg: 0.0, // Nivel horizontal constante
                    ma: 1.0
                };
            } else {
                // Rotativo / Armónico estándar
                return {
                    normDisp: cosT,
                    normVel: -sinT,
                    normAcc: -cosT,
                    sMm: 50 * (1 - cosT),
                    vMs: -sinT * 1.0,
                    aMs2: -cosT * 9.8,
                    phiDeg: 0,
                    ma: 1.0
                };
            }
        }

        setAngle(th) {
            this.theta = ((th % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            this.update();
        }

        stepAngle(delta) {
            this.setAngle(this.theta + delta);
        }

        update() {
            const deg = (this.theta * 180 / Math.PI);
            const k = this.calculateKinematics(this.theta);

            // Actualizar controles UI
            if (this.sliderAngle) this.sliderAngle.value = Math.round(deg);
            if (this.txtAngle) this.txtAngle.textContent = `${deg.toFixed(1)}° (${this.theta.toFixed(2)} rad)`;

            // Actualizar telemetría
            if (this.valDisp) this.valDisp.textContent = `${k.sMm.toFixed(1)} mm`;
            if (this.valVel) this.valVel.textContent = `${k.vMs.toFixed(2)} m/s`;
            if (this.valAcc) this.valAcc.textContent = `${k.aMs2.toFixed(2)} m/s²`;
            if (this.valPhi) this.valPhi.textContent = `${k.phiDeg.toFixed(1)}°`;
            if (this.valMa) this.valMa.textContent = `${k.ma.toFixed(2)}`;

            // Actualizar cursor del gráfico de ciclo
            if (this.plotCursor) {
                const x0 = 60, x1 = 680;
                const curX = x0 + (this.theta / (2 * Math.PI)) * (x1 - x0);
                this.plotCursor.setAttribute('x1', curX);
                this.plotCursor.setAttribute('x2', curX);
                if (this.plotPoint) {
                    const yMid = 90, scaleY = 65;
                    this.plotPoint.setAttribute('cx', curX);
                    this.plotPoint.setAttribute('cy', (yMid - k.normDisp * scaleY).toFixed(1));
                }
            }

            // Actualizar geometría SVG paramétricamente
            this.updateSVG(this.theta, k);
        }

        updateSVG(th, k) {
            const deg = (th * 180 / Math.PI);

            // 1. Manivela / Rueda motriz genérica
            if (this.elCrank) {
                this.elCrank.style.transform = `rotate(${deg}deg)`;
            }

            // 2. Cursor / Pistón / Sierra genérico
            if (this.elSlider) {
                if (this.modelType === 'crank_slider') {
                    const travelPx = (k.sMm / this.strokeMm) * 80 - 40;
                    this.elSlider.style.transform = `translateY(${travelPx.toFixed(1)}px)`;
                } else if (this.modelType === 'scotch_yoke') {
                    const travelPx = Math.cos(th) * 45;
                    this.elSlider.style.transform = `translateX(${travelPx.toFixed(1)}px)`;
                } else if (this.modelType === 'cam_follower') {
                    const liftPx = -(k.sMm / 250) * 55;
                    this.elSlider.style.transform = `translateY(${liftPx.toFixed(1)}px)`;
                }
            }

            // 3. Articulación de Biela (Connecting Rod)
            if (this.elRod && this.modelType === 'crank_slider') {
                if (this.elRod.tagName.toLowerCase() === 'line') {
                    const xO = 220, yO = 420;
                    const r = 50;
                    const xA = xO + r * Math.cos(th);
                    const yA = yO + r * Math.sin(th);
                    const xB = 478;
                    const travelPx = (k.sMm / this.strokeMm) * 80 - 40;
                    const yB = 340 + travelPx;

                    this.elRod.setAttribute('x1', xA.toFixed(1));
                    this.elRod.setAttribute('y1', yA.toFixed(1));
                    this.elRod.setAttribute('x2', xB.toFixed(1));
                    this.elRod.setAttribute('y2', yB.toFixed(1));
                }
            }

            // 4. Balancín y cilindro Newcomen (Beam Engine)
            if (this.modelType === 'beam_engine') {
                const psiDeg = 10.0 * Math.sin(th);
                if (this.elBeam) {
                    this.elBeam.style.transformOrigin = '400px 140px';
                    this.elBeam.style.transform = `rotate(${psiDeg.toFixed(2)}deg)`;
                }
                const pistonDisp = -28 * Math.sin(th);
                const pumpDisp = 28 * Math.sin(th);
                if (this.elSteamPiston) {
                    this.elSteamPiston.style.transform = `translateY(${pistonDisp.toFixed(1)}px)`;
                }
                if (this.elPumpRod) {
                    this.elPumpRod.style.transform = `translateY(${pumpDisp.toFixed(1)}px)`;
                }
                if (this.elSpray) {
                    this.elSpray.style.opacity = (Math.sin(th) > 0.3) ? '1' : '0';
                }
            }

            // 5. Torno con husillo patrón (Lead Screw)
            if (this.modelType === 'lead_screw') {
                if (this.elSpindle) {
                    this.elSpindle.style.transformOrigin = '245px 240px';
                    this.elSpindle.style.transform = `rotate(${deg}deg)`;
                }
                if (this.elCarriage) {
                    const cycle = (th % (2 * Math.PI)) / (2 * Math.PI);
                    const travelX = cycle * 150;
                    this.elCarriage.style.transform = `translateX(${travelX.toFixed(1)}px)`;
                }
            }

            // 6. Cojinete de bolas con jaula (Ball Bearing)
            if (this.modelType === 'ball_bearing') {
                if (this.elCage) {
                    this.elCage.style.transformOrigin = '400px 300px';
                    this.elCage.style.transform = `rotate(${(deg * 0.5).toFixed(2)}deg)`;
                }
                if (this.elShaft) {
                    this.elShaft.style.transformOrigin = '400px 300px';
                    this.elShaft.style.transform = `rotate(${deg}deg)`;
                }
                if (this.elBalls && this.elBalls.length > 0) {
                    const spinAngle = -(deg * 2.43);
                    this.elBalls.forEach(ball => {
                        ball.style.transformOrigin = '0px 0px';
                        ball.style.transform = `rotate(${spinAngle.toFixed(1)}deg)`;
                    });
                }
            }

            // 7. Carro que apunta al sur (South-pointing chariot)
            if (this.modelType === 'differential' || this.elDiff) {
                if (this.elWheelL) {
                    this.elWheelL.style.transformOrigin = '220px 420px';
                    this.elWheelL.style.transform = `rotate(${deg}deg)`;
                }
                if (this.elWheelR) {
                    this.elWheelR.style.transformOrigin = '580px 420px';
                    this.elWheelR.style.transform = `rotate(${(deg * 0.5).toFixed(1)}deg)`;
                }
                if (this.elDiff) {
                    this.elDiff.style.transformOrigin = '400px 320px';
                    this.elDiff.style.transform = `rotate(${(deg * 0.25).toFixed(1)}deg)`;
                }
            }

            // 8. Tornillo de Arquímedes
            if (this.elHelix) {
                const shift = ((th % (2 * Math.PI)) / (2 * Math.PI)) * 40;
                const shiftY = -shift * 0.75;
                this.elHelix.style.transform = `translate(${shift.toFixed(1)}px, ${shiftY.toFixed(1)}px)`;
            }
        }

        animate(timestamp) {
            if (this.isPlaying) {
                if (!this.lastTimestamp) this.lastTimestamp = timestamp;
                const dt = (timestamp - this.lastTimestamp) / 1000.0;
                this.lastTimestamp = timestamp;

                const deltaTheta = this.omega * this.speedFactor * Math.min(dt, 0.1);
                this.theta = (this.theta + deltaTheta) % (2 * Math.PI);
                this.update();
            } else {
                this.lastTimestamp = timestamp;
            }
            requestAnimationFrame(this.animate);
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new KinematicsWorkbench());
    } else {
        new KinematicsWorkbench();
    }
})();
