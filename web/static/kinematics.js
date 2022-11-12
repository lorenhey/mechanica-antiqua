/**
 * Mechanica Antiqua - Motor Cinemático Interactivo y Renderizador CAD HiDPI
 * Simulación paramétrica en tiempo real (60 fps) y telemetría analítica para las 42 máquinas.
 */

(function() {
    'use strict';

    class KinematicsWorkbench {
        constructor() {
            this.container = document.getElementById('kinematic-workbench');
            if (!this.container) return;

            this.machineId = this.container.dataset.machineId || '';
            this.modelType = this.container.dataset.modelType || 'crank_slider';
            this.svgContainer = document.getElementById('machine-svg-wrapper');
            if (!this.svgContainer) return;

            // Parámetros y estado de la simulación
            this.theta = 0; // Ángulo/fase actual en [0, 2π)
            this.omega = 1.65; // rad/s nominal
            this.isPlaying = true;
            this.speedFactor = 1.0;
            this.viewMode = 'assembly'; // 'assembly' | 'schematic'
            this.lastTimestamp = null;

            this.logicalW = 800;
            this.logicalH = 560;

            this.setupGeometry();
            this.mountCanvas();
            this.createControls();
            this.createPlot();

            this.update();
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        setupGeometry() {
            this.r = 60;
            this.L = 240;
            this.lambda = 0.25;
            this.strokeMm = 300;
            if (this.modelType === 'scotch_yoke') {
                this.r = 55;
                this.strokeMm = 320;
            } else if (this.modelType === 'beam_engine') {
                this.psiMax = 0.19;
            }
        }

        mountCanvas() {
            // Reemplazar la lámina SVG estática por el viewport CAD HiDPI interactivo
            const fallbackSvg = this.svgContainer.querySelector('svg');
            if (fallbackSvg) {
                fallbackSvg.style.display = 'none';
            }

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'kinematic-canvas';
            this.canvas.style.width = '100%';
            this.canvas.style.maxWidth = '800px';
            this.canvas.style.height = 'auto';
            this.canvas.style.aspectRatio = `${this.logicalW} / ${this.logicalH}`;
            this.canvas.style.display = 'block';
            this.canvas.style.margin = '0 auto';
            this.canvas.style.borderRadius = '4px';

            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            this.canvas.width = Math.round(this.logicalW * dpr);
            this.canvas.height = Math.round(this.logicalH * dpr);
            this.ctx = this.canvas.getContext('2d');
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            this.svgContainer.appendChild(this.canvas);
        }

        getMetricLabels() {
            switch (this.modelType) {
                case 'ballistic_lever':
                    return {
                        angleLabel: 'Fase del Ciclo de Disparo (θ):',
                        pms: 'Carga (0°)', pmi: 'Suelta (180°)',
                        l1: 'Extensión / Arco', l2: 'Velocidad Punta', l3: 'Aceleración', l4: 'Ángulo Brazo/Arco', l5: 'Factor Energía'
                    };
                case 'structural_static':
                    return {
                        angleLabel: 'Parámetro de Carga / Estado (θ):',
                        pms: 'Estado Base (0°)', pmi: 'Carga Máx (180°)',
                        l1: 'Flecha / Excentr.', l2: 'Variación Tasa', l3: 'Gradiente', l4: 'Ángulo Empuje', l5: 'Coef. Seguridad'
                    };
                case 'hydraulic_control':
                    return {
                        angleLabel: 'Fase Hidráulica / Térmica (θ):',
                        pms: 'Inicio Ciclo (0°)', pmi: 'Mitad Ciclo (180°)',
                        l1: 'Nivel Columna h', l2: 'Velocidad Fluido', l3: 'Aceleración', l4: 'Estado Válvula', l5: 'Presión Relativa'
                    };
                default:
                    return {
                        angleLabel: 'Ángulo / Fase Motriz (θ):',
                        pms: 'PMS (0°)', pmi: 'PMI (180°)',
                        l1: 'Desplazamiento s(θ)', l2: 'Velocidad v(θ)', l3: 'Aceleración a(θ)', l4: 'Ángulo φ(θ)', l5: 'Ventaja Mec. (MA)'
                    };
            }
        }

        createControls() {
            const labels = this.getMetricLabels();
            const controlsCard = document.createElement('div');
            controlsCard.className = 'kinematic-controls-card';
            controlsCard.innerHTML = `
                <div class="kc-toolbar">
                    <button id="kc-play-pause" class="kc-btn kc-btn-primary">⏸ Pausar</button>
                    <button id="kc-step-prev" class="kc-btn">◀ -15°</button>
                    <button id="kc-step-next" class="kc-btn">+15° ▶</button>
                    <button id="kc-pos-pms" class="kc-btn kc-btn-secondary">${labels.pms}</button>
                    <button id="kc-pos-pmi" class="kc-btn kc-btn-secondary">${labels.pmi}</button>
                    
                    <div class="kc-speed-group">
                        <span class="kc-label">Velocidad:</span>
                        <button class="kc-btn-speed" data-speed="0.5">0.5×</button>
                        <button class="kc-btn-speed active" data-speed="1.0">1×</button>
                        <button class="kc-btn-speed" data-speed="2.0">2×</button>
                    </div>

                    <button id="kc-toggle-view" class="kc-btn kc-btn-toggle">Modo: Ensamblaje CAD</button>
                </div>

                <div class="kc-scrub-row">
                    <label for="kc-angle-slider" class="kc-label">${labels.angleLabel}</label>
                    <input type="range" id="kc-angle-slider" min="0" max="360" value="0" step="1" class="kc-slider">
                    <span id="kc-angle-readout" class="kc-numeric-readout">0.0° (0.00 rad)</span>
                </div>

                <div class="kc-telemetry-grid">
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">${labels.l1}</span>
                        <span id="kc-val-disp" class="kc-metric-val">0.0 mm</span>
                    </div>
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">${labels.l2}</span>
                        <span id="kc-val-vel" class="kc-metric-val">0.00 m/s</span>
                    </div>
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">${labels.l3}</span>
                        <span id="kc-val-acc" class="kc-metric-val">0.00 m/s²</span>
                    </div>
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">${labels.l4}</span>
                        <span id="kc-val-phi" class="kc-metric-val">0.0°</span>
                    </div>
                    <div class="kc-telemetry-item">
                        <span class="kc-metric-label">${labels.l5}</span>
                        <span id="kc-val-ma" class="kc-metric-val">1.00</span>
                    </div>
                </div>
            `;

            this.svgContainer.parentNode.insertBefore(controlsCard, this.svgContainer);

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
                this.btnPlayPause.classList.remove('kc-btn-primary');
                this.stepAngle(-15 * (Math.PI / 180));
            });

            controlsCard.querySelector('#kc-step-next').addEventListener('click', () => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = '▶ Reproducir';
                this.btnPlayPause.classList.remove('kc-btn-primary');
                this.stepAngle(15 * (Math.PI / 180));
            });

            controlsCard.querySelector('#kc-pos-pms').addEventListener('click', () => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = '▶ Reproducir';
                this.btnPlayPause.classList.remove('kc-btn-primary');
                this.setAngle(0);
            });

            controlsCard.querySelector('#kc-pos-pmi').addEventListener('click', () => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = '▶ Reproducir';
                this.btnPlayPause.classList.remove('kc-btn-primary');
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
                this.btnToggleView.textContent = this.viewMode === 'assembly'
                    ? 'Modo: Ensamblaje CAD'
                    : 'Modo: Esquema y Vectores';
                this.update();
            });
        }

        createPlot() {
            const plotWrapper = document.createElement('div');
            plotWrapper.className = 'kinematic-plot-card';
            plotWrapper.innerHTML = `
                <div class="kc-plot-header">
                    <h4>Curvas Analíticas del Ciclo Completo (0° a 360°)</h4>
                    <div class="kc-plot-legend">
                        <span class="legend-item"><span class="legend-dot dot-disp"></span> s(θ) Posición / Nivel</span>
                        <span class="legend-item"><span class="legend-dot dot-vel"></span> v(θ) Velocidad / Tasa</span>
                        <span class="legend-item"><span class="legend-dot dot-acc"></span> a(θ) Aceleración</span>
                    </div>
                </div>
                <div class="kc-plot-svg-box">
                    <svg id="kc-cycle-plot" viewBox="0 0 720 180" preserveAspectRatio="none">
                        <line x1="60" y1="90" x2="680" y2="90" stroke="#cbd5e1" stroke-width="1.5"/>
                        <line x1="60" y1="20" x2="60" y2="160" stroke="#cbd5e1" stroke-width="1.5"/>
                        
                        <text x="60" y="105" font-size="11" fill="#64748b" text-anchor="middle">0°</text>
                        <text x="215" y="105" font-size="11" fill="#64748b" text-anchor="middle">90°</text>
                        <text x="370" y="105" font-size="11" fill="#64748b" text-anchor="middle">180°</text>
                        <text x="525" y="105" font-size="11" fill="#64748b" text-anchor="middle">270°</text>
                        <text x="680" y="105" font-size="11" fill="#64748b" text-anchor="middle">360°</text>

                        <path id="plot-path-disp" fill="none" stroke="#2563eb" stroke-width="2.5"/>
                        <path id="plot-path-vel" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="4 2"/>
                        <path id="plot-path-acc" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="2 2"/>

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

            let dDisp = '', dVel = '', dAcc = '';
            const N = 120, x0 = 60, x1 = 680, yMid = 90, scaleY = 65;

            for (let i = 0; i <= N; i++) {
                const th = (i / N) * 2 * Math.PI;
                const px = x0 + (i / N) * (x1 - x0);
                const k = this.calculateKinematics(th);
                const pyDisp = yMid - Math.max(-1.05, Math.min(1.05, k.normDisp)) * scaleY;
                const pyVel = yMid - Math.max(-1.05, Math.min(1.05, k.normVel)) * scaleY;
                const pyAcc = yMid - Math.max(-1.05, Math.min(1.05, k.normAcc)) * scaleY;

                dDisp += (i === 0 ? 'M ' : ' L ') + `${px.toFixed(1)} ${pyDisp.toFixed(1)}`;
                dVel += (i === 0 ? 'M ' : ' L ') + `${px.toFixed(1)} ${pyVel.toFixed(1)}`;
                dAcc += (i === 0 ? 'M ' : ' L ') + `${px.toFixed(1)} ${pyAcc.toFixed(1)}`;
            }

            pathDisp.setAttribute('d', dDisp);
            pathVel.setAttribute('d', dVel);
            pathAcc.setAttribute('d', dAcc);
        }

        calculateKinematics(th) {
            const sinT = Math.sin(th);
            const cosT = Math.cos(th);

            if (this.modelType === 'crank_slider') {
                const lambda = this.lambda || 0.22;
                const s = 1 - cosT + (lambda / 2) * (sinT * sinT);
                const v = sinT + (lambda / 2) * Math.sin(2 * th);
                const a = cosT + lambda * Math.cos(2 * th);
                const phi = Math.asin(lambda * sinT);
                const ma = Math.abs(sinT) < 0.08 ? 10.0 : Math.min(10.0, 1.0 / Math.abs(sinT));
                return {
                    normDisp: s - 1,
                    normVel: v / 1.15,
                    normAcc: a / (1 + lambda),
                    sMm: (s / 2) * this.strokeMm,
                    vMs: v * 1.45,
                    aMs2: a * 14.5,
                    phiDeg: phi * 180 / Math.PI,
                    ma: ma
                };
            } else if (this.modelType === 'scotch_yoke') {
                return {
                    normDisp: cosT,
                    normVel: -sinT,
                    normAcc: -cosT,
                    sMm: ((1 - cosT) / 2) * this.strokeMm,
                    vMs: -sinT * 1.25,
                    aMs2: -cosT * 12.0,
                    phiDeg: 0,
                    ma: Math.min(10.0, 1.0 / Math.max(0.1, Math.abs(sinT)))
                };
            } else if (this.modelType === 'cam_follower') {
                const liftAngle = (2 * Math.PI) / 3;
                const rem = th % liftAngle;
                let sNorm, vNorm, aNorm;
                if (rem < liftAngle * 0.7) {
                    sNorm = rem / (liftAngle * 0.7);
                    vNorm = 0.7;
                    aNorm = 0;
                } else {
                    const t = (rem - liftAngle * 0.7) / (liftAngle * 0.3);
                    sNorm = Math.max(0, 1 - t * t);
                    vNorm = -2 * t;
                    aNorm = -1.0;
                }
                return {
                    normDisp: sNorm * 2 - 1,
                    normVel: vNorm * 0.5,
                    normAcc: aNorm,
                    sMm: sNorm * 280,
                    vMs: vNorm * 1.8,
                    aMs2: aNorm * 9.81,
                    phiDeg: 0,
                    ma: 1.5
                };
            } else if (this.modelType === 'beam_engine') {
                const psi = 11.0 * sinT;
                return {
                    normDisp: -cosT,
                    normVel: sinT,
                    normAcc: cosT,
                    sMm: 450 * (1 - cosT),
                    vMs: sinT * 1.15,
                    aMs2: cosT * 2.4,
                    phiDeg: psi,
                    ma: 1.0
                };
            } else if (this.modelType === 'lead_screw') {
                const c = (th / (Math.PI * 2));
                return {
                    normDisp: c * 2 - 1,
                    normVel: 0.6,
                    normAcc: 0,
                    sMm: c * 350,
                    vMs: 0.025,
                    aMs2: 0,
                    phiDeg: 0,
                    ma: 117.8
                };
            } else if (this.modelType === 'ball_bearing') {
                return {
                    normDisp: Math.cos(th * 0.5),
                    normVel: -Math.sin(th * 0.5),
                    normAcc: -Math.cos(th * 0.5),
                    sMm: 127.5 * (1 - Math.cos(th * 0.5)),
                    vMs: -0.65 * Math.sin(th * 0.5),
                    aMs2: -0.33 * Math.cos(th * 0.5),
                    phiDeg: ((th * 180 / Math.PI) * 0.5) % 360,
                    ma: 2.0
                };
            } else if (this.modelType === 'ballistic_lever') {
                const c = th / (Math.PI * 2);
                const preRelease = c < 0.48;
                const sN = preRelease ? (c / 0.48) * 2 - 1 : 1 - ((c - 0.48) / 0.52) * 2;
                const vN = preRelease ? Math.sin((c / 0.48) * Math.PI) : 0.85;
                const aN = preRelease ? Math.cos((c / 0.48) * Math.PI) : -0.35;
                return {
                    normDisp: sN,
                    normVel: vN,
                    normAcc: aN,
                    sMm: preRelease ? (c / 0.48) * 580 : 580,
                    vMs: vN * 38.5,
                    aMs2: aN * 140.0,
                    phiDeg: -50 + c * 90,
                    ma: 4.0
                };
            } else if (this.modelType === 'structural_static') {
                return {
                    normDisp: cosT,
                    normVel: -sinT * 0.5,
                    normAcc: -cosT * 0.2,
                    sMm: 35 + 25 * (0.5 + 0.5 * cosT),
                    vMs: -sinT * 0.2,
                    aMs2: 0,
                    phiDeg: 18 + 12 * sinT,
                    ma: 1.65
                };
            } else if (this.modelType === 'hydraulic_control' || this.modelType === 'escapement') {
                const c = th / (Math.PI * 2);
                return {
                    normDisp: c * 2 - 1,
                    normVel: 0.75 + 0.15 * cosT,
                    normAcc: -0.15 * sinT,
                    sMm: c * 220,
                    vMs: 1.45,
                    aMs2: 0,
                    phiDeg: (th * 180 / Math.PI) % 360,
                    ma: 1.0
                };
            } else {
                // archimedes_screw, epicyclic, differential, fluid_thermal
                return {
                    normDisp: cosT,
                    normVel: -sinT,
                    normAcc: -cosT,
                    sMm: 160 * (1 - cosT),
                    vMs: -sinT * 1.35,
                    aMs2: -cosT * 3.2,
                    phiDeg: this.modelType === 'epicyclic' ? 0.0 : (sinT * 18),
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

            if (this.sliderAngle) this.sliderAngle.value = Math.round(deg);
            if (this.txtAngle) this.txtAngle.textContent = `${deg.toFixed(1)}° (${this.theta.toFixed(2)} rad)`;

            if (this.valDisp) this.valDisp.textContent = `${k.sMm.toFixed(1)} mm`;
            if (this.valVel) this.valVel.textContent = `${k.vMs.toFixed(2)} m/s`;
            if (this.valAcc) this.valAcc.textContent = `${k.aMs2.toFixed(2)} m/s²`;
            if (this.valPhi) this.valPhi.textContent = `${k.phiDeg.toFixed(1)}°`;
            if (this.valMa) this.valMa.textContent = `${k.ma.toFixed(2)}`;

            if (this.plotCursor) {
                const x0 = 60, x1 = 680;
                const curX = x0 + (this.theta / (2 * Math.PI)) * (x1 - x0);
                this.plotCursor.setAttribute('x1', curX);
                this.plotCursor.setAttribute('x2', curX);
                if (this.plotPoint) {
                    const yMid = 90, scaleY = 65;
                    const clampedY = yMid - Math.max(-1.05, Math.min(1.05, k.normDisp)) * scaleY;
                    this.plotPoint.setAttribute('cx', curX);
                    this.plotPoint.setAttribute('cy', clampedY.toFixed(1));
                }
            }

            // Renderizar cuadro CAD 2D HiDPI del mecanismo específico
            this.renderFrame(k);
        }

        renderFrame(k) {
            if (!this.ctx) return;
            const schematic = (this.viewMode === 'schematic');
            const renderer = window.MACHINE_RENDERERS && window.MACHINE_RENDERERS[this.machineId];
            if (typeof renderer === 'function') {
                renderer(this.ctx, this.logicalW, this.logicalH, this.theta, k, schematic);
            } else {
                CAD.clearAndGrid(this.ctx, this.logicalW, this.logicalH, this.machineId, 'Modelo analítico genérico', schematic);
                CAD.drawWaterwheel(this.ctx, 400, 300, 120, 12, this.theta, schematic);
                CAD.drawFixedPivot(this.ctx, 400, 300, 8, 'O₂');
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new KinematicsWorkbench());
    } else {
        new KinematicsWorkbench();
    }
})();
