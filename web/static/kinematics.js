/**
 * Mechanica Antiqua - Motor Cinemático Interactivo (Canvas 2D HiDPI)
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

            this.theta = 0;
            this.omega = 1.65;
            this.isPlaying = true;
            this.speedFactor = 1.0;
            this.viewMode = 'assembly';
            this.showPlot = false;
            this.lastTimestamp = null;

            this.logicalW = 800;
            this.logicalH = 540;

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

            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            this.canvas.width = Math.round(this.logicalW * dpr);
            this.canvas.height = Math.round(this.logicalH * dpr);
            this.ctx = this.canvas.getContext('2d');
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            this.svgContainer.appendChild(this.canvas);
        }

        createControls() {
            const bar = document.createElement('div');
            bar.className = 'sim-controls';
            bar.innerHTML = `
                <div class="sim-controls-main">
                    <button id="kc-play-pause" class="sim-btn sim-btn-active" type="button">Pausar</button>
                    <button id="kc-step-prev" class="sim-btn" type="button" title="Retroceder 15°">-15°</button>
                    <button id="kc-step-next" class="sim-btn" type="button" title="Avanzar 15°">+15°</button>
                    <input type="range" id="kc-angle-slider" min="0" max="360" value="0" step="1" class="sim-slider" aria-label="Fase o ángulo del mecanismo">
                    <span id="kc-readout" class="sim-readout">0°</span>
                </div>
                <div class="sim-controls-extra">
                    <div class="sim-speeds">
                        <button class="sim-speed" data-speed="0.5" type="button">0.5×</button>
                        <button class="sim-speed active" data-speed="1.0" type="button">1×</button>
                        <button class="sim-speed" data-speed="2.0" type="button">2×</button>
                    </div>
                    <button id="kc-toggle-view" class="sim-btn" type="button">Esquema</button>
                    <button id="kc-toggle-plot" class="sim-btn" type="button">Curvas</button>
                </div>
            `;

            this.svgContainer.parentNode.insertBefore(bar, this.svgContainer.nextSibling);

            this.btnPlayPause = bar.querySelector('#kc-play-pause');
            this.sliderAngle = bar.querySelector('#kc-angle-slider');
            this.txtReadout = bar.querySelector('#kc-readout');
            this.btnToggleView = bar.querySelector('#kc-toggle-view');
            this.btnTogglePlot = bar.querySelector('#kc-toggle-plot');

            const pause = () => {
                this.isPlaying = false;
                this.btnPlayPause.textContent = 'Reproducir';
                this.btnPlayPause.classList.remove('sim-btn-active');
            };

            this.btnPlayPause.addEventListener('click', () => {
                this.isPlaying = !this.isPlaying;
                this.btnPlayPause.textContent = this.isPlaying ? 'Pausar' : 'Reproducir';
                this.btnPlayPause.classList.toggle('sim-btn-active', this.isPlaying);
            });

            this.sliderAngle.addEventListener('input', (e) => {
                pause();
                this.setAngle(parseFloat(e.target.value) * (Math.PI / 180));
            });

            bar.querySelector('#kc-step-prev').addEventListener('click', () => {
                pause();
                this.stepAngle(-15 * (Math.PI / 180));
            });

            bar.querySelector('#kc-step-next').addEventListener('click', () => {
                pause();
                this.stepAngle(15 * (Math.PI / 180));
            });

            bar.querySelectorAll('.sim-speed').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    bar.querySelectorAll('.sim-speed').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.speedFactor = parseFloat(e.target.dataset.speed);
                });
            });

            this.btnToggleView.addEventListener('click', () => {
                this.viewMode = this.viewMode === 'assembly' ? 'schematic' : 'assembly';
                this.btnToggleView.classList.toggle('sim-btn-active', this.viewMode === 'schematic');
                this.update();
            });

            this.btnTogglePlot.addEventListener('click', () => {
                this.showPlot = !this.showPlot;
                this.btnTogglePlot.classList.toggle('sim-btn-active', this.showPlot);
                if (this.plotWrapper) {
                    this.plotWrapper.classList.toggle('is-hidden', !this.showPlot);
                }
            });
        }

        createPlot() {
            const plotWrapper = document.createElement('div');
            plotWrapper.className = 'sim-plot-wrap is-hidden';
            plotWrapper.innerHTML = `
                <div class="sim-plot-legend">
                    <span><i style="background:#0b4f8c"></i> Posición</span>
                    <span><i style="background:#15803d"></i> Velocidad</span>
                    <span><i style="background:#c02626"></i> Aceleración</span>
                </div>
                <svg id="kc-cycle-plot" viewBox="0 0 720 150" preserveAspectRatio="none" class="sim-plot-svg">
                    <line x1="50" y1="75" x2="690" y2="75" stroke="#d4d4d4" stroke-width="1"/>
                    <line x1="50" y1="15" x2="50" y2="135" stroke="#d4d4d4" stroke-width="1"/>
                    <text x="50" y="147" font-family="monospace" font-size="10" fill="#777" text-anchor="middle">0°</text>
                    <text x="210" y="147" font-family="monospace" font-size="10" fill="#777" text-anchor="middle">90°</text>
                    <text x="370" y="147" font-family="monospace" font-size="10" fill="#777" text-anchor="middle">180°</text>
                    <text x="530" y="147" font-family="monospace" font-size="10" fill="#777" text-anchor="middle">270°</text>
                    <text x="690" y="147" font-family="monospace" font-size="10" fill="#777" text-anchor="middle">360°</text>
                    <path id="plot-path-disp" fill="none" stroke="#0b4f8c" stroke-width="2"/>
                    <path id="plot-path-vel" fill="none" stroke="#15803d" stroke-width="1.6" stroke-dasharray="4 3"/>
                    <path id="plot-path-acc" fill="none" stroke="#c02626" stroke-width="1.6" stroke-dasharray="2 2"/>
                    <line id="kc-plot-cursor" x1="50" y1="12" x2="50" y2="135" stroke="#111" stroke-width="1.5"/>
                    <circle id="kc-plot-cursor-point" cx="50" cy="75" r="3" fill="#0b4f8c"/>
                </svg>
            `;

            this.container.appendChild(plotWrapper);
            this.plotWrapper = plotWrapper;
            this.plotCursor = plotWrapper.querySelector('#kc-plot-cursor');
            this.plotPoint = plotWrapper.querySelector('#kc-plot-cursor-point');
            this.generatePlotCurves(plotWrapper);
        }

        generatePlotCurves(plotWrapper) {
            const pathDisp = plotWrapper.querySelector('#plot-path-disp');
            const pathVel = plotWrapper.querySelector('#plot-path-vel');
            const pathAcc = plotWrapper.querySelector('#plot-path-acc');

            let dDisp = '', dVel = '', dAcc = '';
            const N = 120, x0 = 50, x1 = 690, yMid = 75, scaleY = 54;

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
                return {
                    normDisp: s - 1,
                    normVel: v / 1.15,
                    normAcc: a / (1 + lambda),
                    sMm: (s / 2) * this.strokeMm,
                    vMs: v * 1.45,
                    phiDeg: phi * 180 / Math.PI
                };
            } else if (this.modelType === 'scotch_yoke') {
                return {
                    normDisp: cosT,
                    normVel: -sinT,
                    normAcc: -cosT,
                    sMm: ((1 - cosT) / 2) * this.strokeMm,
                    vMs: -sinT * 1.25,
                    phiDeg: 0
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
                    phiDeg: 0
                };
            } else if (this.modelType === 'beam_engine') {
                return {
                    normDisp: -cosT,
                    normVel: sinT,
                    normAcc: cosT,
                    sMm: 450 * (1 - cosT),
                    vMs: sinT * 1.15,
                    phiDeg: 11.0 * sinT
                };
            } else if (this.modelType === 'lead_screw') {
                const c = th / (Math.PI * 2);
                return {
                    normDisp: c * 2 - 1,
                    normVel: 0.6,
                    normAcc: 0,
                    sMm: c * 350,
                    vMs: 0.025,
                    phiDeg: 0
                };
            } else if (this.modelType === 'ballistic_lever') {
                const c = th / (Math.PI * 2);
                const pre = c < 0.48;
                return {
                    normDisp: pre ? (c / 0.48) * 2 - 1 : 1 - ((c - 0.48) / 0.52) * 2,
                    normVel: pre ? Math.sin((c / 0.48) * Math.PI) : 0.85,
                    normAcc: pre ? Math.cos((c / 0.48) * Math.PI) : -0.35,
                    sMm: pre ? (c / 0.48) * 580 : 580,
                    vMs: (pre ? Math.sin((c / 0.48) * Math.PI) : 0.85) * 38.5,
                    phiDeg: 0
                };
            } else if (this.modelType === 'structural_static') {
                return {
                    normDisp: cosT,
                    normVel: -sinT * 0.5,
                    normAcc: -cosT * 0.2,
                    sMm: 35 + 25 * (0.5 + 0.5 * cosT),
                    vMs: 0,
                    phiDeg: 0
                };
            } else {
                return {
                    normDisp: cosT,
                    normVel: -sinT,
                    normAcc: -cosT,
                    sMm: 160 * (1 - cosT),
                    vMs: -sinT * 1.35,
                    phiDeg: 0
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
            if (this.txtReadout) {
                if (this.modelType === 'structural_static') {
                    this.txtReadout.textContent = `${Math.round((deg / 360) * 100)}%`;
                } else {
                    this.txtReadout.textContent = `${deg.toFixed(0)}° · ${Math.abs(k.vMs).toFixed(2)} m/s`;
                }
            }

            if (this.plotCursor) {
                const x0 = 50, x1 = 690;
                const curX = x0 + (this.theta / (2 * Math.PI)) * (x1 - x0);
                this.plotCursor.setAttribute('x1', curX);
                this.plotCursor.setAttribute('x2', curX);
                if (this.plotPoint) {
                    const yMid = 75, scaleY = 54;
                    const clampedY = yMid - Math.max(-1.05, Math.min(1.05, k.normDisp)) * scaleY;
                    this.plotPoint.setAttribute('cx', curX);
                    this.plotPoint.setAttribute('cy', clampedY.toFixed(1));
                }
            }

            this.renderFrame(k);
        }

        renderFrame(k) {
            if (!this.ctx) return;
            const schematic = (this.viewMode === 'schematic');
            const renderer = window.MACHINE_RENDERERS && window.MACHINE_RENDERERS[this.machineId];
            if (typeof renderer === 'function') {
                renderer(this.ctx, this.logicalW, this.logicalH, this.theta, k, schematic);
            } else {
                CAD.clearAndGrid(this.ctx, this.logicalW, this.logicalH, '', '', schematic);
                CAD.drawWaterwheel(this.ctx, 400, 270, 120, 12, this.theta, schematic);
                CAD.drawFixedPivot(this.ctx, 400, 270, 7, 'O');
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
