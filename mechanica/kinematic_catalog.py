"""
Catálogo cinemático analítico completo para las 42 máquinas de Mechanica Antiqua.
Define la síntesis de mecanismos, grados de libertad (Chebychev-Grübler-Kutzbach),
ecuaciones de cierre vectorial / leyes físicas y parámetros dimensionales nominales (SI).
"""

from typing import Dict, Any

KINEMATIC_REGISTRY: Dict[str, Dict[str, Any]] = {
    "martini_hydraulic_sawmill": {
        "model_type": "crank_slider",
        "mechanism_name": "Mecanismo Biela-Manivela-Corredera Vertical",
        "topology": "Cadena cinemática plana cerrada de 4 eslabones (3R-1P)",
        "links": "4 eslabones: 1) Bastidor fijo, 2) Rueda hidráulica / cigüeñal, 3) Biela acopladora, 4) Marco porta-sierra",
        "joints": "j₁ = 4 (3 pares R: O₂, muñón A, pasador B; 1 par P en guías). j₂ = 0",
        "dof": 1,
        "dof_calc": "F = 3(4 - 1) - 2(4) - 0 = 1",
        "loop_equation": "r · e^(iθ) + L · e^(iφ) = x_B + i · y_B(θ)",
        "position_eq": "s(θ) = r(1 - cos θ) + (r² / 2L) sin²θ",
        "velocity_eq": "v(θ) ≈ r ω (sin θ + (r / 2L) sin 2θ)",
        "acceleration_eq": "a(θ) ≈ r ω² (cos θ + (r / L) cos 2θ)",
        "nominal_params": {
            "r_manivela_mm": 150,
            "L_biela_mm": 750,
            "relacion_lambda": 0.20,
            "carrera_mm": 300,
            "regimen_rpm": 45,
            "v_corte_max_ms": 0.72
        },
        "notes": "La rotación hidráulica continua se transforma en corte vertical alternativo, sincronizada mediante trinquete para el avance escalonado del carro."
    },

    "agricola_suction_pump": {
        "model_type": "crank_slider",
        "mechanism_name": "Bomba Alternativa de Minería (Biela-Manivela en Línea)",
        "topology": "Cuadrilátero biela-corredera centrado (In-line Slider-Crank)",
        "links": "4 eslabones: 1) Entibación y cuerpo de cilindro, 2) Manivela, 3) Biela motriz, 4) Vástago y émbolo",
        "joints": "j₁ = 4 (3 pares R, 1 par P en camisa del cilindro). j₂ = 0",
        "dof": 1,
        "dof_calc": "F = 3(4 - 1) - 2(4) - 0 = 1",
        "loop_equation": "r · e^(iθ) + L · e^(iφ) - s(θ) · j = 0",
        "position_eq": "s(θ) = r cos θ + √(L² - r² sin²θ)",
        "velocity_eq": "v(θ) = -r ω (sin θ + (r sin 2θ) / (2√(L² - r² sin²θ)))",
        "acceleration_eq": "a(θ) ≈ -r ω² (cos θ + (r / L) cos 2θ)",
        "nominal_params": {
            "r_manivela_mm": 175,
            "L_biela_mm": 800,
            "relacion_lambda": 0.219,
            "carrera_mm": 350,
            "diametro_cilindro_mm": 180,
            "regimen_rpm": 25,
            "caudal_teorico_Lmin": 222.6
        },
        "notes": "Limitada físicamente a ~7.5 m de altura de aspiración por la presión atmosférica local y cavitación en la válvula de pie."
    },

    "martini_piston_pump": {
        "model_type": "crank_slider",
        "mechanism_name": "Bomba Dúplex Accionada por Balancín Oscilante",
        "topology": "Cadena de 6 eslabones (manivela-balancín acoplada a doble corredera)",
        "links": "6 eslabones: Bancada, manivela motriz, biela primaria, balancín central, y 2 émbolos opuestos",
        "joints": "j₁ = 7 (5 pares R, 2 pares P en cilindros). j₂ = 0",
        "dof": 1,
        "dof_calc": "F = 3(6 - 1) - 2(7) - 0 = 1",
        "loop_equation": "r e^(iθ) + b e^(iγ) = c e^(iψ)",
        "position_eq": "s₁,₂(θ) = ± L_arm · sin(ψ(θ))",
        "velocity_eq": "v₁,₂(θ) = ± L_arm · ψ̇ cos(ψ)",
        "acceleration_eq": "a₁,₂(θ) = ± L_arm (ψ̈ cos ψ - ψ̇² sin ψ)",
        "nominal_params": {
            "brazo_balancin_mm": 600,
            "carrera_mm": 260,
            "diametro_embolo_mm": 140,
            "desfase_cilindros_deg": 180,
            "caudal_Lmin": 192.0
        },
        "notes": "Martini desacopla el empuje lateral del vástago usando un balancín simétrico que reduce el desgaste de la empaquetadura de cuero."
    },

    "al_jazari_suction_pump": {
        "model_type": "scotch_yoke",
        "mechanism_name": "Bomba Bicilíndrica Oposicional con Yugo Escocés",
        "topology": "Mecanismo inversor sinusoidal exacto (Scotch Yoke)",
        "links": "4 eslabones: 1) Bancada, 2) Rueda y brazo excéntrico, 3) Dado/corredera en ranura, 4) Yugo rígido con émbolos opuestos",
        "joints": "j₁ = 4 (2 R: eje O₂ y muñón A; 2 P: corredera en ranura vertical y guías horizontales del yugo). j₂ = 0",
        "dof": 1,
        "dof_calc": "F = 3(4 - 1) - 2(4) - 0 = 1",
        "loop_equation": "R · cos(θ) = x_yugo(θ) ; R · sin(θ) = y_ranura",
        "position_eq": "x(θ) = R · cos(θ) [Armónico puro]",
        "velocity_eq": "v(θ) = -R · ω · sin(θ)",
        "acceleration_eq": "a(θ) = -R · ω² · cos(θ)",
        "nominal_params": {
            "radio_excentrica_mm": 160,
            "carrera_mm": 320,
            "diametro_cilindro_mm": 150,
            "relacion_engranaje": "1:1 (linterna)",
            "cilindrada_rev_L": 11.31
        },
        "notes": "Primer uso documentado (1206) de la conversión rotativa-alternativa continua por ranura deslizante con flujo bidireccional."
    },

    "agricola_stamp_mill": {
        "model_type": "cam_follower",
        "mechanism_name": "Bocarte de Levas Desfasadas y Pilones Gravitatorios",
        "topology": "Tren de 3 levas radiales sobre eje motriz y seguidores traslacionales de gravedad",
        "links": "5 eslabones: Bastidor, árbol de levas, 3 mazos pisones guiados verticalmente",
        "joints": "j₁ = 4 (1 R árbol, 3 P guías verticales), j₂ = 3 (leva-taqué)",
        "dof": 1,
        "dof_calc": "F_por_pilon = 3(3 - 1) - 2(2) - 1 = 1",
        "loop_equation": "y(θ) = h_max (θ/θ_asc) [Ascenso]; y(t) = h_max - ½ g t² [Caída libre]",
        "position_eq": "y(θ) = h_max · f_leva(θ mod 120°)",
        "velocity_eq": "v_impacto = √(2 · g · h_max)",
        "acceleration_eq": "a_caida = -g = -9.81 m/s²",
        "nominal_params": {
            "num_pilones": 3,
            "altura_elevacion_mm": 320,
            "masa_pilon_kg": 45.0,
            "velocidad_impacto_ms": 2.51,
            "energia_golpe_J": 141.3
        },
        "notes": "El desfase de 120° entre levas uniformiza el par resistente sobre la rueda hidráulica."
    },

    "zonca_paper_mill": {
        "model_type": "cam_follower",
        "mechanism_name": "Molino Papelero de Mazos Batidores Basculantes",
        "topology": "Árbol de levas accionando palancas pivotantes de primer género contra tina de pasta",
        "links": "Bastidor, rueda hidráulica, eje de levas con dientes radiales, mazos articulados en fulcro posterior",
        "joints": "Pares R en eje motriz y pivote de mazo; par superior j₂ en contacto de leva sobre cola del brazo",
        "dof": 1,
        "dof_calc": "F = 3(3 - 1) - 2(2) - 1 = 1",
        "loop_equation": "φ_mazo(θ) = φ_max (θ/θ_levante) hasta escape en el borde de la leva",
        "position_eq": "h_cabeza(θ) = L_brazo · sin(φ(θ))",
        "velocity_eq": "v_impacto = √(2 · g · h_max)",
        "acceleration_eq": "α_caida = -(m g L_cg) / I_pivote",
        "nominal_params": {
            "longitud_brazo_mm": 1600,
            "altura_levante_mm": 280,
            "masa_mazo_kg": 38.0,
            "cadencia_golpes_min": 55
        },
        "notes": "Vittorio Zonca (1607) detalla clavos ferrados de geometría diferenciada para deshilachar trapos de lino."
    },

    "zonca_stamping_mill": {
        "model_type": "cam_follower",
        "mechanism_name": "Molino de Batanado Textil por Levas Escalonadas",
        "topology": "Engranaje corona-linterna acoplado a árbol de levas múltiple con guías verticales",
        "links": "Bastidor de roble, rueda motriz, eje con levas helicoidales, mazos de madera dura",
        "joints": "Pares R en ejes, pares P en guías de mazo, j₂ en contacto leva-taqué",
        "dof": 1,
        "dof_calc": "F = 1 por cada estación de batanado",
        "loop_equation": "y(θ) = h_max (θ / θ_0) para 0 ≤ θ < θ_0",
        "position_eq": "y(θ) = h_max · ramp(θ mod 120°)",
        "velocity_eq": "v_impacto = √(2 · g · h_max)",
        "acceleration_eq": "a = -g durante la descarga en artesa",
        "nominal_params": {
            "num_mazos": 3,
            "alzada_mm": 300,
            "masa_mazo_kg": 52.0,
            "energia_impacto_J": 153.0
        },
        "notes": "Compactación y enfieltrado continuo de paños de lana mediante golpes rítmicos en baño caliente."
    },

    "villard_sawmill": {
        "model_type": "cam_follower",
        "mechanism_name": "Aserradero Hidráulico con Retorno Elástico por Pértiga",
        "topology": "Sistema leva-seguidor con resorte elástico de viga en voladizo (Villard de Honnecourt, c. 1230)",
        "links": "Bastidor, eje hidráulico con 4 levas, hoja de sierra vertical, pértiga de fresno empotrada",
        "joints": "j₁ = 2 (1 R, 1 P), j₂ = 1 (contacto leva), más restricción elástica EI",
        "dof": 1,
        "dof_calc": "F = 1 (carrera descendente por leva, ascendente por restitución elástica)",
        "loop_equation": "F_resorte = (3 E I / L³) · δ(θ)",
        "position_eq": "δ(θ) = δ_max · (θ mod 90°) / 72°",
        "velocity_eq": "v_retorno = √((3 E I / m L³) · (δ_max² - δ²))",
        "acceleration_eq": "a_retorno = -(3 E I / m L³) · δ",
        "nominal_params": {
            "num_levas": 4,
            "longitud_pertiga_mm": 2800,
            "deflexion_max_mm": 220,
            "rigidez_elastica_Nm": 1450
        },
        "notes": "Primera representación europea de una sierra mecánica automatizada previa al uso del cigüeñal."
    },

    "ramelli_book_wheel": {
        "model_type": "epicyclic",
        "mechanism_name": "Rueda de Lectura con Tren Epicicloidal Planetario",
        "topology": "Tren de engranajes planetarios con relación unitaria inversora (i = -1)",
        "links": "Bancada con sol central fijo (Z₁), portador (tambor giratorio), engranajes intermedios (Z₂) y 8 atriles (Z₃ = Z₁)",
        "joints": "j₁ = 17 (pares R), j₂ = 16 (engranes dentados). i = ω_atril / ω_tambor = 0",
        "dof": 1,
        "dof_calc": "F = 1 (relación epicicloidal Θ_atril = Θ_tambor - Θ_tambor = 0°)",
        "loop_equation": "ω_atril = ω_portador · (1 - Z_sol / Z_planeta) = 0",
        "position_eq": "θ_atril(t) = 0° [Invariante absoluta respecto a tierra]",
        "velocity_eq": "v_tangencial = R_tambor · ω_tambor",
        "acceleration_eq": "a_centripeta = R_tambor · ω_tambor²",
        "nominal_params": {
            "radio_tambor_mm": 680,
            "num_atriles": 8,
            "dientes_sol_Z1": 24,
            "dientes_planeta_Z3": 24,
            "inclinacion_atril_deg": 0.0
        },
        "notes": "Agostino Ramelli (1588) compensa exactamente la rotación del tambor mediante un tren epicicloidal para evitar que caigan los volúmenes."
    },

    "ramelli_rotary_pump": {
        "model_type": "epicyclic",
        "mechanism_name": "Bomba Rotativa Excéntrica de Paletas Deslizantes",
        "topology": "Mecanismo de rotor excéntrico con 4 paletas guiadas radialmente contra estator cilíndrico",
        "links": "Estator cilíndrico (tierra), rotor excéntrico (e), 4 paletas deslizantes con resorte",
        "joints": "j₁ = 5 (1 R del rotor, 4 P en ranuras radiales), j₂ = 4 (contacto paleta-estator)",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "r(θ) = √(R_st² - e² sin²θ) + e cos θ",
        "position_eq": "extensión_paleta(θ) = r(θ) - R_rotor",
        "velocity_eq": "v_radial(θ) = dr/dθ · ω",
        "acceleration_eq": "Q_teorico = 2 · e · b · (2 R_st - e) · ω",
        "nominal_params": {
            "radio_estator_mm": 160,
            "excentricidad_mm": 35,
            "num_paletas": 4,
            "caudal_Lmin": 145.0
        },
        "notes": "Precursora directa de las bombas de paletas industriales y compresores volumétricos rotativos modernos."
    },

    "leonardo_globoidal_gear": {
        "model_type": "epicyclic",
        "mechanism_name": "Engranaje Sin Fin Globoidal Envolvente (Códice Madrid I)",
        "topology": "Par espacial cruzado a 90° con geometría hiperboloide envolvente",
        "links": "Bancada, tornillo sinfín de garganta cóncava, rueda dentada tangencial de 30 dientes",
        "joints": "2 pares R ortogonales, 1 contacto helicoidal multi-diente simultáneo",
        "dof": 1,
        "dof_calc": "F = 1 (Relación de reducción i = Z_rueda / Z_entradas = 30:1)",
        "loop_equation": "θ_rueda = θ_tornillo / Z_rueda",
        "position_eq": "θ_out = θ_in / 30",
        "velocity_eq": "ω_out = ω_in / 30",
        "acceleration_eq": "T_out = η · 30 · T_in",
        "nominal_params": {
            "relacion_transmision": "30 : 1",
            "dientes_simultaneos_contacto": 4,
            "angulo_helice_deg": 6.5,
            "eficiencia_estimada": 0.68
        },
        "notes": "Al abrazar la curvatura de la rueda, Leonardo distribuye la presión de contacto entre múltiples filetes simultáneamente."
    },

    "newcomen_newcomen_engine": {
        "model_type": "beam_engine",
        "mechanism_name": "Máquina Atmosférica de Balancín con Cabezas de Arco",
        "topology": "Balancín oscilante acoplado por cadenas flexibles tangenciales a cilindros verticales",
        "links": "Muro portante (tierra), gran balancín con cabezas de arco, cadena motriz de pistón, cadena de bomba",
        "joints": "1 R (fulcro O₂), pares P en cilindro de vapor y camisa de bomba, uniones tangentes por cadena",
        "dof": 1,
        "dof_calc": "F = 1 (carrera útil por diferencial de presión atmosférica ΔP ≈ 0.85 bar)",
        "loop_equation": "y_piston(θ) = R_arco · ψ(θ) ; y_bomba(θ) = -R_arco · ψ(θ)",
        "position_eq": "s(θ) = (S / 2) · (1 - cos θ)",
        "velocity_eq": "v(θ) = (S / 2) · ω · sin θ",
        "acceleration_eq": "a(θ) = (S / 2) · ω² · cos θ",
        "nominal_params": {
            "diametro_cilindro_mm": 533,
            "carrera_mm": 1800,
            "longitud_balancin_mm": 4800,
            "fuerza_atmosferica_kN": 18.2,
            "ciclos_min": 12
        },
        "notes": "Las cabezas circulares mantienen la cadena tangente a la vertical del vástago, eliminando fuerzas laterales en el cilindro."
    },

    "ctesibius_pump": {
        "model_type": "beam_engine",
        "mechanism_name": "Bomba Aspirante-Impelente de Balancín y Cámara de Aire",
        "topology": "Palanca de primer género articulada a doble cilindro sumergido en contrafase",
        "links": "Bastidor, palanca central en O₂, 2 bielas cortas de acoplamiento, 2 émbolos de bronce",
        "joints": "j₁ = 5 (3 R, 2 P). j₂ = 0",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "y_L(θ) = -a sin ψ(θ) ; y_R(θ) = +a sin ψ(θ)",
        "position_eq": "s₁,₂(θ) = ± (S/2) · sin θ",
        "velocity_eq": "v₁,₂(θ) = ± (S/2) · ω · cos θ",
        "acceleration_eq": "P_camara · V_aire = cte [Ley de Boyle estabilizando el chorro]",
        "nominal_params": {
            "diametro_cilindros_mm": 100,
            "carrera_mm": 220,
            "presion_descarga_bar": 1.8,
            "caudal_continuo_Lmin": 95.0
        },
        "notes": "El colchón neumático en el plenum superior suaviza las pulsaciones convirtiendo el flujo alternativo en chorro continuo."
    },

    "african_shaduf": {
        "model_type": "beam_engine",
        "mechanism_name": "Cigoñal (Shaduf) — Palanca Contrapesada de Primer Género",
        "topology": "Viga asimétrica articulada en horquilla fija con contrapeso y tirante colgante",
        "links": "Horquilla fija, pértiga (L_carga / L_contrapeso ≈ 2.8), cuerda pendular, cubo de cuero/madera",
        "joints": "2 pares R (fulcro O₂ y amarre A)",
        "dof": 1,
        "dof_calc": "F = 1 (Equilibrio de momentos ΣM_O = M_contrapeso · g · L₁ - M_agua · g · L₂ ≈ 0)",
        "loop_equation": "y_cubo(θ) = y_O - L₂ · sin ψ(θ) - L_cuerda",
        "position_eq": "y(θ) = H_elevacion · (1 - cos θ) / 2",
        "velocity_eq": "v(θ) = (H / 2) · ω · sin θ",
        "acceleration_eq": "τ_neto ≈ ± 12 N·m (asistencia gravitatoria del contrapeso)",
        "nominal_params": {
            "brazo_carga_mm": 2600,
            "brazo_contrapeso_mm": 920,
            "masa_contrapeso_kg": 42.0,
            "capacidad_cubo_L": 15.0,
            "altura_elevacion_m": 2.4
        },
        "notes": "Permite al operador realizar trabajo positivo principalmente en vacío o guiando la carga equilibrada."
    },

    "papin_papin_steam_engine": {
        "model_type": "beam_engine",
        "mechanism_name": "Cilindro de Vapor y Pistón Atmosférico de Papin (1690)",
        "topology": "Actuador lineal vertical mono-cilíndrico de ciclo vapor-condensación",
        "links": "Cilindro de latón (base), pistón con traba mecánica superior, polea de izado y contrapeso",
        "joints": "1 par P (pistón en camisa), 1 par R (polea superior)",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "F_net(t) = (P_int(t) - P_atm) · A_piston - W_piston",
        "position_eq": "y(θ) = S · f_termodinamica(θ)",
        "velocity_eq": "v(θ) = dy/dt [Expansión lenta, carrera descendente rápida por vacío]",
        "acceleration_eq": "W_util = ∫ (P_atm - P_vac) A dy ≈ 420 J/ciclo",
        "nominal_params": {
            "diametro_cilindro_mm": 120,
            "carrera_mm": 450,
            "masa_elevada_kg": 27.0,
            "presion_vacio_bar": 0.25
        },
        "notes": "Demostración fundacional del uso de un pistón sólido separado de la caldera como motor de vacío térmico."
    },

    "leupold_leupold_steam_pump": {
        "model_type": "beam_engine",
        "mechanism_name": "Máquina de Vapor de Alta Presión con Válvula de 4 Vías (1725)",
        "topology": "Doble balancín independiente acoplado a válvula distribuidora rotativa de 4 puertos",
        "links": "Caldera alta presión, llave rotativa de 4 vías, 2 cilindros motores, 2 balancines y bombas",
        "joints": "Pares R en fulcros y llave de paso; 4 pares P en cilindros",
        "dof": 1,
        "dof_calc": "F = 1 (controlado por fase de válvula de 4 vías)",
        "loop_equation": "P₁(θ) = P_alta (0..π), P_atm (π..2π) ; P₂(θ) = P₁(θ + π)",
        "position_eq": "s₁,₂(θ) = ± (S/2) · cos θ",
        "velocity_eq": "v₁,₂(θ) = ∓ (S/2) · ω · sin θ",
        "acceleration_eq": "F_empuje = ΔP · A_piston = (3.5 bar) · A",
        "nominal_params": {
            "presion_caldera_bar": 4.5,
            "diametro_cilindro_mm": 200,
            "altura_bombeo_m": 32.0,
            "ciclos_min": 18
        },
        "notes": "Jacob Leupold diseñó la primera máquina de vapor sin condensación, descargando directamente a la atmósfera."
    },

    "besson_screw_lathe": {
        "model_type": "lead_screw",
        "mechanism_name": "Torno de Roscar Sincronizado con Husillo Patrón (1578)",
        "topology": "Cadena espacial R-H-P de sincronización rígida entre giro de pieza y traslación de carro",
        "links": "Bancada fija, husillo de pieza + husillo patrón (1:1), carro portaherramientas",
        "joints": "j₁ = 4 (2 R, 1 P guías, 1 par helicoidal H₁ de paso p)",
        "dof": 1,
        "dof_calc": "F = 3(4 - 1) - 2(4) = 1",
        "loop_equation": "x_carro(θ) = (p / 2π) · θ",
        "position_eq": "x(θ) = (p / 2π) · θ [Avance lineal constante]",
        "velocity_eq": "v_x = (p / 2π) · ω = cte",
        "acceleration_eq": "a_x = 0 [Régimen estacionario]",
        "nominal_params": {
            "paso_husillo_mm": 8.0,
            "longitud_util_mm": 350,
            "relacion_poleas": "1 : 1",
            "ventaja_mecanica_teorica": 117.8
        },
        "notes": "Primera mecanización automática de roscas cilíndricas y filetes ornamentales mediante guía maestra."
    },

    "leonardo_cage_bearing": {
        "model_type": "ball_bearing",
        "mechanism_name": "Cojinete Axial de Bolas con Jaula Separadora (1493)",
        "topology": "Mecanismo de rodadura pura sin deslizamiento con elemento intermedio retenedor",
        "links": "Pista exterior fija, eje interior motriz, jaula separadora de bronce, 8 bolas de acero",
        "joints": "Rodadura pura sin deslizamiento en pistas interior (P_in) y exterior (P_out)",
        "dof": 1,
        "dof_calc": "F = 1 (Velocidad de jaula determinada por condición de no deslizamiento)",
        "loop_equation": "ω_jaula = ½ ω_eje · (1 - (d / D_m) cos α)",
        "position_eq": "θ_jaula = 0.5 · θ_eje",
        "velocity_eq": "v_centro_bola = 0.5 · R_in · ω_eje",
        "acceleration_eq": "ω_bola = (D_m / 2d) ω_eje (1 - d²/D_m²)",
        "nominal_params": {
            "diametro_primitivo_Dm_mm": 255,
            "diametro_bolas_d_mm": 52.5,
            "num_bolas_Z": 8,
            "relacion_jaula_eje": 0.50,
            "coef_friccion_equivalente": 0.002
        },
        "notes": "La jaula de Leonardo evita el roce en sentido inverso de bolas adyacentes, reduciendo drásticamente el desgaste."
    },

    "chinese_south_pointing_chariot": {
        "model_type": "differential",
        "mechanism_name": "Carro Apuntador al Sur (Tren Diferencial Epicicloidal)",
        "topology": "Diferencial mecánico de 2 grados de libertad de entrada y 1 salida diferencial",
        "links": "Chasis, ruedas L y R, diferencial central con satélites, columna y estatua puntero",
        "joints": "Pares R y engranes cónicos planetarios con relación exactamente igualada a R_r / W",
        "dof": 2,
        "dof_calc": "F = 2 entradas (θ_L, θ_R) ⇒ Δθ_puntero = -(θ_R - θ_L) R_r / W",
        "loop_equation": "θ_estatua_mundo = θ_chasis + θ_estatua_rel = θ_0 = cte (Sur)",
        "position_eq": "θ_rel = -(R_rueda / W) · (θ_R - θ_L)",
        "velocity_eq": "ω_rel = -(R_rueda / W) · (ω_R - ω_L)",
        "acceleration_eq": "α_rel = -α_chasis",
        "nominal_params": {
            "diametro_rueda_mm": 1200,
            "trocha_W_mm": 1400,
            "radio_engrane_dif": "7 : 6",
            "deriva_calibracion_deg_km": 1.2
        },
        "notes": "Primer computador mecánico analógico realimentado por odometría diferencial sin magnetismo."
    },

    "vitruvius_archimedes_screw": {
        "model_type": "archimedes_screw",
        "mechanism_name": "Tornillo de Arquímedes (Cochlea Hidráulica Inclinada)",
        "topology": "Par helicoidal continuo inclinado confinador de bolsas fluidas gravitatorias",
        "links": "Soporte inclinado (β = 36.87°), camisa cilíndrica con hélice interior rotativa",
        "joints": "2 pares R en cojinetes extremos, transporte axial continuo de cavidades de agua",
        "dof": 1,
        "dof_calc": "F = 1 (Elevación neta positiva si ángulo de hélice α > β)",
        "loop_equation": "s_agua(θ) = (p / 2π) · θ",
        "position_eq": "Δz(θ) = s_agua(θ) · sin(β)",
        "velocity_eq": "v_axial = (p / 2π) · ω",
        "acceleration_eq": "Q_teorico = n_inicios · V_bolsa · (ω / 2π)",
        "nominal_params": {
            "inclinacion_deg": 36.87,
            "pendiente_pitagorica": "3 : 4 : 5",
            "diametro_tambor_mm": 600,
            "paso_helice_mm": 450,
            "longitud_mm": 3000,
            "caudal_nominal_m3h": 18.5
        },
        "notes": "Cada revolución desplaza un volumen discreto atrapado por la propia gravedad en el fondo de la espira."
    },

    "agricola_chain_pump": {
        "model_type": "archimedes_screw",
        "mechanism_name": "Bomba de Cadena y Rosario (Paternoster) en Pozo",
        "topology": "Transmisión flexible continua de cadena cerrada en tubería de elevación",
        "links": "Catalina motriz superior, cadena sinfín con esferas de cuero y tubo vertical",
        "joints": "Engranaje de cadena-rueda y par deslizante estanco dentro de tubo de madera",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "y_esfera(θ) = R_rueda · θ",
        "position_eq": "v_ascenso = R_rueda · ω",
        "velocity_eq": "Q = (π/4)(D_tubo² - d_cadena²) · v_ascenso · η_v",
        "acceleration_eq": "P_bomba = ρ g H · Q / η",
        "nominal_params": {
            "diametro_tubo_mm": 130,
            "paso_esferas_mm": 450,
            "profundidad_pozo_m": 18.0,
            "caudal_Lmin": 180.0
        },
        "notes": "Apta para aguas mineras cargadas de lodos y gravilla sin válvulas delicadas que se atasquen."
    },

    "african_saqiya": {
        "model_type": "archimedes_screw",
        "mechanism_name": "Saqiya (Noria de Cangilones con Engranaje en Ángulo Recto)",
        "topology": "Reducción ortogonal de corona horizontal y linterna vertical impulsando rosario de vasijas",
        "links": "Yugo animal horizontal, corona dentada, eje horizontal, rueda portacangilones",
        "joints": "2 pares R a 90°, engrane de husillos, cadenas flexibles de cangilones",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "ω_noria = (Z_corona / Z_linterna) · ω_animal",
        "position_eq": "s_vasija(θ) = R_noria · θ",
        "velocity_eq": "v_elevacion = R_noria · ω_noria",
        "acceleration_eq": "Q = N_vasijas · V_vasija · (ω_noria / 2π)",
        "nominal_params": {
            "altura_elevacion_m": 5.5,
            "num_cangilones": 20,
            "capacidad_vasija_L": 4.5,
            "caudal_m3h": 14.0
        },
        "notes": "Trinquete de retroceso en el eje superior impide que el peso del agua cargada haga girar la rueda hacia atrás."
    },

    "vitruvius_water_wheel": {
        "model_type": "archimedes_screw",
        "mechanism_name": "Molino Hidráulico Vitruviano con Engranaje Linterna",
        "topology": "Transmisión en ángulo recto de rueda de paletas inferior a muela vertical",
        "links": "Rueda hidráulica, eje horizontal con rueda dentada (Z₁), linterna de husillos (Z₂) y piedra volandera",
        "joints": "2 pares R ortogonales, engrane de jaula de husillos",
        "dof": 1,
        "dof_calc": "F = 1 (Multiplicación de velocidad ω_piedra = (Z₁/Z₂) ω_rueda)",
        "loop_equation": "θ_muela = (Z₁ / Z₂) · θ_rueda",
        "position_eq": "ω_muela = 5 · ω_rueda",
        "velocity_eq": "P_eje = ½ ρ A v_agua³ · C_p",
        "acceleration_eq": "τ_molienda = P_eje / ω_muela",
        "nominal_params": {
            "diametro_rueda_m": 2.4,
            "relacion_multiplicadora": "5 : 1",
            "regimen_muela_rpm": 65,
            "potencia_util_kW": 1.8
        },
        "notes": "Vitruvio invirtió la relación de la saqiya para multiplicar el par lento fluvial en altas RPM para molienda de cereal."
    },

    "agricola_reversible_hoist": {
        "model_type": "archimedes_screw",
        "mechanism_name": "Malacate Hidráulico Reversible de Doble Corona",
        "topology": "Rueda hidráulica bidireccional con compuerta selectora y freno de tambor de izado",
        "links": "Doble canal de alimentación, rueda doble de álabes opuestos, eje común y cable de mina",
        "joints": "1 par R principal + par de arrollamiento de cable de cáñamo",
        "dof": 1,
        "dof_calc": "F = 1 (signo de ω gobernado por compuerta hidráulica izquierda/derecha)",
        "loop_equation": "z_cubo(θ) = z₀ ± R_tambor · θ",
        "position_eq": "z(θ) = R_tambor · θ · sgn(compuerta)",
        "velocity_eq": "v_izado = ± R_tambor · ω",
        "acceleration_eq": "P_izado = m_carga · g · v_izado",
        "nominal_params": {
            "diametro_rueda_m": 10.5,
            "diametro_tambor_m": 1.2,
            "profundidad_tiro_m": 120,
            "carga_util_kg": 450
        },
        "notes": "La mayor máquina de la minería renacentista, capaz de invertir marcha en segundos sin embragues mecánicos."
    },

    "indian_charkha": {
        "model_type": "archimedes_screw",
        "mechanism_name": "Rueca de Hilar India (Charkha) de Transmisión Multiplicadora",
        "topology": "Transmisión por correa cruzada de alta relación de velocidades (i ≈ 12:1)",
        "links": "Bastidor de madera, volante motriz R₁, cordón tensado de algodón, huso giratorio r₂",
        "joints": "2 pares R paralelos acoplados por vínculo flexible sin deslizamiento",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "θ_huso = (R₁ / r₂) · θ_volante",
        "position_eq": "vueltas_torsion = 12 · vueltas_manivela",
        "velocity_eq": "ω_huso = 12 · ω_manivela",
        "acceleration_eq": "v_correa = R₁ · ω_volante",
        "nominal_params": {
            "diametro_volante_mm": 420,
            "diametro_polea_huso_mm": 35,
            "relacion_multiplicadora": "12 : 1",
            "rpm_huso": 720
        },
        "notes": "Permite impartir centenares de torsiones por minuto al hilo estirado a mano con mínima fatiga."
    },

    "ctesibius_clepsydra": {
        "model_type": "hydraulic_control",
        "mechanism_name": "Clepsidra de Flujo Constante y Regulador Cónico",
        "topology": "Sistema hidráulico de lazo cerrado (nivel h constante) + cremallera-piñón flotante",
        "links": "Válvula cónica flotante (regulador P), cilindro acumulador graduado, flotador-cremallera, piñón indicador",
        "joints": "Regulación proporcional de caudal + par cremallera-piñón",
        "dof": 1,
        "dof_calc": "F = 1 (dh₂/dt = Q_const / A_cilindro = cte)",
        "loop_equation": "Q = C_d · A_orificio · √(2 · g · h_const)",
        "position_eq": "h_flotador(t) = v_ascenso · t ; θ_aguja = h / R_pinon",
        "velocity_eq": "dh/dt = cte [Independiente de presión de suministro]",
        "acceleration_eq": "d²h/dt² = 0",
        "nominal_params": {
            "altura_carga_h0_mm": 120,
            "caudal_regulado_Lh": 1.85,
            "error_diario_min": 4.0,
            "carrera_flotador_mm": 600
        },
        "notes": "Primera implementación conocida de realimentación negativa mecánica (control proporcional de nivel)."
    },

    "al_jazari_elephant_clock": {
        "model_type": "hydraulic_control",
        "mechanism_name": "Reloj del Elefante con Flotador Perforado (Tarjahar)",
        "topology": "Oscilador de relajación hidráulica de periodo discreto (30 minutos)",
        "links": "Cuenco tarjahar perforado, cadena disparadora, depósito de bolas, autómata escriba y tambor",
        "joints": "Oscilación gravitatoria-flotante + mecanismo secuencial por gravedad",
        "dof": 1,
        "dof_calc": "F = 1 (ciclo de vaciado calibrado hasta inmersión límite)",
        "loop_equation": "m_agua(t) = ∫ ρ A_orif √(2 g Δh) dt ⇒ t_hundimiento = 1800 s",
        "position_eq": "h_cuenco(θ) = h_0 - h_max · (θ / 2π)",
        "velocity_eq": "Q_entrada = C_d A_o √(2 g Δh)",
        "acceleration_eq": "Disparo de bola metálica en θ = 2π (reinicio automático)",
        "nominal_params": {
            "periodo_ciclo_min": 30.0,
            "diametro_orificio_mm": 1.6,
            "masa_bola_bronce_g": 180,
            "num_esferas_carga": 30
        },
        "notes": "Al-Jazari diseñó el orificio del cuenco para compensar las horas estacionales desiguales mediante calibración empírica."
    },

    "banu_musa_alternating_fountain": {
        "model_type": "hydraulic_control",
        "mechanism_name": "Fuente Automática de Chorro Alternante (Banu Musa)",
        "topology": "Conmutador fluido-mecánico biestable mediante flotadores y sifones concéntricos",
        "links": "Vaso divisor superior, balancín con flotadores, 2 cámaras presurizadas y toberas concéntricas",
        "joints": "Válvulas cónicas en contrafase acopladas por balancín interno",
        "dof": 1,
        "dof_calc": "F = 1 (oscilación auto-sostenida de periodo hidráulico)",
        "loop_equation": "P_cámara(t) = ρ g H_agua ⇒ v_chorro = √(2 g H)",
        "position_eq": "Estado(θ) ∈ {Chorro Central, Corona Anular}",
        "velocity_eq": "v_salida_max = 4.4 m/s",
        "acceleration_eq": "Cambio de régimen automático al llenarse el flotador superior",
        "nominal_params": {
            "altura_deposito_m": 2.2,
            "periodo_conmutacion_s": 12.0,
            "caudal_total_Lmin": 24.0
        },
        "notes": "Demuestra compuertas lógicas puramente fluido-mecánicas siete siglos antes de la automática moderna."
    },

    "philo_washbasin": {
        "model_type": "hydraulic_control",
        "mechanism_name": "Lavamanos Neumático Autorregulado de Filón de Bizancio",
        "topology": "Controlador barométrico de nivel constante tipo frasco de Mariotte (s. III a.C.)",
        "links": "Depósito hermético superior, tubo barométrico sumergido, cubeta inferior",
        "joints": "Interfaz aire-líquido gobernada por equilibrio hidrostático ΔP",
        "dof": 1,
        "dof_calc": "F = 1 (Equilibrio P_gas + ρ g H_col = P_atm)",
        "loop_equation": "Si h_cubeta < h_tubo ⇒ burbujeo de aire ⇒ Q_descarga > 0 hasta sellar h_tubo",
        "position_eq": "h_nivel(θ) = h_eq [Auto-estabilizado tras perturbación]",
        "velocity_eq": "Q_reposicion = C_d A √(2 g Δh)",
        "acceleration_eq": "Amortiguamiento neumático sin piezas móviles",
        "nominal_params": {
            "volumen_deposito_L": 12.0,
            "nivel_regulado_mm": 85.0,
            "vacio_parcial_kPa": -4.2
        },
        "notes": "Primer regulador proporcional sin piezas móviles basado exclusivamente en la presión atmosférica y tensión superficial."
    },

    "savery_savery_engine": {
        "model_type": "hydraulic_control",
        "mechanism_name": "Bomba Térmica de Savery ('El Amigo del Minero', 1698)",
        "topology": "Bomba de desplazamiento sin pistón por ciclos térmicos alternados de vacío y presión",
        "links": "Caldera de cobre, 2 cámaras ovales receptoras, 4 válvulas de retención e inyección fría",
        "joints": "Flujo alternado mediante llaves manuales de vapor y válvulas de pie/descarga",
        "dof": 1,
        "dof_calc": "F = 1 (fase alterna: 0..π succión por vacío / π..2π impulsión por vapor)",
        "loop_equation": "h_succion ≤ P_atm/(ρ g) ; h_impulsion = P_vapor/(ρ g)",
        "position_eq": "Nivel(θ) en cámaras A y B en contrafase 180°",
        "velocity_eq": "Q_medio ≈ 220 L/min a 24 m de altura total",
        "acceleration_eq": "ΔP_ciclo = -0.8 bar (succión) / +3.5 bar (impulsión)",
        "nominal_params": {
            "presion_vapor_bar": 3.8,
            "altura_succion_m": 6.5,
            "altura_impulsion_m": 22.0,
            "ciclos_min": 6
        },
        "notes": "Ausencia de pistón móvil: el vapor actúa directamente sobre la superficie libre del agua, lo que ocasiona altas pérdidas térmicas."
    },

    "roman_aqueduct": {
        "model_type": "hydraulic_control",
        "mechanism_name": "Acueducto Romano con Sifón Invertido Presurizado",
        "topology": "Canal de flujo libre por gravedad (i = cte) conectado a tubería presurizada en U (venter)",
        "links": "Canal de fábrica, cámara de carga (castellum), conductos de plomo, puente sifón (venter)",
        "joints": "Continuidad hidráulica Q₁ = Q₂ y línea piezométrica continua",
        "dof": 1,
        "dof_calc": "F = 1 (Ecuación de Manning en canal libre + Darcy-Weisbach en sifón)",
        "loop_equation": "z₁ + P₁/(ρg) + v₁²/(2g) = z₂ + P₂/(ρg) + v₂²/(2g) + h_f",
        "position_eq": "H_piezo(x) = H_0 - S_f · x",
        "velocity_eq": "v_canal = (1/n) R_h^(2/3) S^(1/2) ≈ 1.45 m/s",
        "acceleration_eq": "P_fondo_venter = ρ g ΔH ≈ 4.5 bar",
        "nominal_params": {
            "pendiente_media": "0.002 (2 m/km)",
            "profundidad_venter_m": 46.0,
            "presion_max_sifon_bar": 4.5,
            "caudal_diario_m3": 28000
        },
        "notes": "Permitía cruzar valles profundos ahorrando el costo monumental de arcadas de tres pisos mediante conducción presurizada."
    },

    "chinese_su_song_clock": {
        "model_type": "escapement",
        "mechanism_name": "Escape Hidromecánico de Su Song (1088)",
        "topology": "Oscilador discreto de masa variable y balanza de contrapeso liberando rueda de cangilones",
        "links": "Chorro calibrado, rueda de 36 cangilones, trinquete superior de retención y palanca balanza",
        "joints": "Contacto intermitente balanza-paleta y rueda dentada en paso angular discreto Δθ = 10°",
        "dof": 1,
        "dof_calc": "F = 1 (Avance discretizado por llenado cuántico de cada cangilón)",
        "loop_equation": "m_cangilon(t) ≥ m_crit ⇒ disparo de palanca ⇒ avance de Δθ = 2π / 36",
        "position_eq": "θ_rueda(t) = Δθ · floor(t / T_paso)",
        "velocity_eq": "T_paso = 24.0 s exactamente",
        "acceleration_eq": "Regulación isócrona por nivel constante superior",
        "nominal_params": {
            "diametro_rueda_m": 3.35,
            "num_cangilones": 36,
            "periodo_escape_s": 24.0,
            "precision_diaria_s": 120
        },
        "notes": "El mecanismo de escape evita el giro continuo, discretizando el flujo continuo del agua en pulsos isócronos."
    },

    "japanese_karakuri_doll": {
        "model_type": "escapement",
        "mechanism_name": "Autómata Servidor de Té (Chahakobi Ningyō, 1796)",
        "topology": "Tren de engranajes con muelle espiral de barba de ballena, regulador centrífugo y leva de giro",
        "links": "Resorte espiral, corona motriz, regulador de escape, leva de piernas y plato interruptor",
        "joints": "Tren reductor/multiplicador de relojería + 2 bielas de locomoción + leva de dirección",
        "dof": 1,
        "dof_calc": "F = 1 (Activado por peso de taza Δm ≈ 120 g sobre muelle del plato)",
        "loop_equation": "τ_resorte(θ) = k · (θ_max - θ)",
        "position_eq": "x_avance(t) = paso · ciclos_leva ; α_giro = 180° al retirar taza",
        "velocity_eq": "v_marcha ≈ 0.14 m/s (estabilizada por regulador de aletas)",
        "acceleration_eq": "Frenado automático al retirar la taza del plato sensor",
        "nominal_params": {
            "autonomia_recorrido_m": 2.8,
            "peso_activacion_taza_g": 120,
            "relacion_escape": "18 : 1",
            "angulo_retorno_deg": 180
        },
        "notes": "Obra maestra de Hosokawa Hanzo (Karakuri Zui): integra un sensor mecánico de carga y máquina de estados en madera."
    },

    "banu_musa_automatic_flute": {
        "model_type": "cam_follower",
        "mechanism_name": "Flautista Autómata Programable de los Banu Musa (s. IX)",
        "topology": "Tambor programador con levas codificadas (memoria ROM mecánica) y válvulas de fuelle",
        "links": "Tambor cilíndrico giratorio, pines programados, 8 palancas seguidoras y flauta neumática",
        "joints": "8 pares R de palanca + par superior j₂ leva-púas + fuelle hidráulico de aire",
        "dof": 1,
        "dof_calc": "F = 1 (Secuencia musical binaria codificada en posición angular θ)",
        "loop_equation": "Estado_nota_k(θ) = 1 si θ ∈ [θ_ini_k, θ_fin_k], 0 en caso contrario",
        "position_eq": "Apertura_válvula_k(θ) = h_pin(θ)",
        "velocity_eq": "f_nota = c_sonido / (2 L_efectiva)",
        "acceleration_eq": "Presión de fuelle constante por depósito de aire comprimido hidráulico",
        "nominal_params": {
            "num_canales_notas": 8,
            "presion_fuelle_Pa": 650,
            "revoluciones_melodia_s": 24.0
        },
        "notes": "Considerado el primer instrumento programable de la historia: cambiando los pines del tambor se reprogramaba la partitura."
    },

    "mesoamerican_atlatl": {
        "model_type": "ballistic_lever",
        "mechanism_name": "Átlatl — Cadena Biomecánica Articulada y Dardo Elástico",
        "topology": "Palanca de tercer género en serie con cadena brazo-antebrazo-propulsor y viga flexible",
        "links": "Hombro fijo O₁, brazo (L₁), antebrazo (L₂), propulsor átlatl (L₃) con gancho distal y dardo flexible",
        "joints": "3 pares R activos (O₁, codo E, muñeca W) + contacto unidireccional en espuela H",
        "dof": 1,
        "dof_calc": "Cadena abierta controlada cinemáticamente hasta θ_suelta",
        "loop_equation": "r_punta = r_hombro + L₁ e^(iθ₁) + L₂ e^(iθ₂) + L₃ e^(iθ₃)",
        "position_eq": "x(t) = v₀ cos α · t ; y(t) = y₀ + v₀ sin α · t - ½ g t²",
        "velocity_eq": "v_punta = ω_eff · (L_brazo + L_atlatl) ≈ 38 m/s",
        "acceleration_eq": "Flexión Euler-Bernoulli del dardo acumula U = ½ k_flex δ²",
        "nominal_params": {
            "longitud_atlatl_mm": 580,
            "longitud_dardo_mm": 1800,
            "velocidad_salida_ms": 38.5,
            "amplificacion_energia": "4.0×",
            "alcance_max_m": 115
        },
        "notes": "Al extender el radio efectivo de giro y almacenar energía elástica en el pandeo del dardo, cuadruplica la energía cinética frente al lanzamiento manual."
    },

    "chinese_repeating_crossbow": {
        "model_type": "ballistic_lever",
        "mechanism_name": "Ballesta de Repetición Zhuge Nu (Ciclo Semiautomático)",
        "topology": "Mecanismo de 4 barras palanca-corredera sincronizado con cargador por gravedad",
        "links": "Cuerpo fijo, palanca de armado trasera, corredera/cargador móvil y arco compuesto",
        "joints": "3 pares R, 1 par P (corredera superior) + resorte elástico de arco",
        "dof": 1,
        "dof_calc": "F = 1 (Un movimiento vaivén arma, alimenta virote y suelta automáticamente)",
        "loop_equation": "F_arco(x) = k_arco · x ; U_elastica = ½ k_arco · Δx_carrera²",
        "position_eq": "x_cuerda(θ) = recorrido de armado hasta tope de disparo automático",
        "velocity_eq": "v_virote = √(2 · U_elastica / m_virote) ≈ 42 m/s",
        "acceleration_eq": "Cadencia ≈ 10 virotes / 15 s",
        "nominal_params": {
            "capacidad_cargador": 10,
            "fuerza_armado_N": 160,
            "carrera_cuerda_mm": 210,
            "cadencia_disparos_min": 40
        },
        "notes": "Integra todo el ciclo de combate (enganchar cuerda, tensar, alimentar virote por gravedad y liberar nuez) en un solo gesto alternativo."
    },

    "heron_aeolipile": {
        "model_type": "fluid_thermal",
        "mechanism_name": "Eolípila de Herón — Turbina Termodinámica de Reacción Pura",
        "topology": "Rotor esférico montado sobre cojinetes huecos con descarga tangencial de vapor",
        "links": "Caldera inferior, 2 conductos portantes huecos (O₁, O₂), esfera con 2 toberas acodadas a 90°",
        "joints": "1 par R de doble soporte (cojinetes estancos de vapor)",
        "dof": 1,
        "dof_calc": "F = 1 (Par motor τ = 2 · R · ṁ · v_escape)",
        "loop_equation": "I · ω̇ = 2 R ṁ (v_escape - R ω) - τ_friccion",
        "position_eq": "θ(t) = ½ α t² hasta velocidad límite ω_lim",
        "velocity_eq": "ω_estacionaria ≈ 1200 rpm (con rozamiento moderado)",
        "acceleration_eq": "τ_reaccion ≈ 0.18 N·m",
        "nominal_params": {
            "diametro_esfera_mm": 180,
            "diametro_tobera_mm": 4.0,
            "velocidad_chorro_ms": 140,
            "rpm_nominal": 950
        },
        "notes": "Primera máquina térmica de la historia; opera por conservación de la cantidad de movimiento angular del vapor expulsado."
    },

    "agricola_ventilation_fan": {
        "model_type": "fluid_thermal",
        "mechanism_name": "Ventilador Centrífugo Minero en Carcasa Espiral (Voluta)",
        "topology": "Turbomáquina radial rotativa con difusor en voluta (Agrícola, De Re Metallica)",
        "links": "Carcasa envolvente fija, rueda de 6 paletas curvas radiales, engranaje multiplicador",
        "joints": "Par R principal del rodete + transmisión multiplicadora manivela-eje",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "ΔP_estatica = ρ · (u₂² - u₁² + w₁² - w₂²) / 2 [Ecuación de Euler de turbomáquinas]",
        "position_eq": "r_particula(θ) crece exponencialmente hacia la voluta periférica",
        "velocity_eq": "u₂ = ω · R_rodete ≈ 14.5 m/s",
        "acceleration_eq": "a_centrifuga = ω² · r",
        "nominal_params": {
            "diametro_rodete_mm": 720,
            "num_alabes": 6,
            "rpm_rodete": 380,
            "caudal_aire_m3h": 950
        },
        "notes": "La carcasa excéntrica en espiral recoge gradualmente el caudal periférico transformando energía cinética en presión estática en el ducto."
    },

    "inca_huayra_furnace": {
        "model_type": "fluid_thermal",
        "mechanism_name": "Horno Metalúrgico Eólico Huayra (Tiro por Venturi)",
        "topology": "Reactor termodinámico fijo de convección natural asistida por viento de alta montaña",
        "links": "Torre troncocónica de barro refractario con 12 toberas acampanadas perimetrales",
        "joints": "Dinámica de fluidos continua (Ecuación de Bernoulli + tiro térmico por flotabilidad)",
        "dof": 1,
        "dof_calc": "Régimen estacionario T_lecho(v_viento)",
        "loop_equation": "P_viento + ½ ρ v_viento² = cte ⇒ ΔP_tobera acelera el flujo al interior",
        "position_eq": "T_lecho(x) alcanza pico de ~980 °C en la zona de reducción",
        "velocity_eq": "v_aire_tobera ≈ 6.5 m/s",
        "acceleration_eq": "ΔP_tiro = g H (ρ_ext - ρ_int)",
        "nominal_params": {
            "altura_horno_mm": 1100,
            "num_toberas": 12,
            "temp_reduccion_C": 960,
            "viento_operacion_ms": 8.0
        },
        "notes": "Al instalarse en laderas andinas con vientos vespertinos constantes, alcanzaba la fusión de galena argentífera sin fuelles."
    },

    "gothic_cathedral": {
        "model_type": "structural_static",
        "mechanism_name": "Arco Ojival, Arbotante y Pináculo — Estática de Empujes",
        "topology": "Estructura hiperestática en compresión pura gobernada por la línea de empujes de Hooke",
        "links": "Bóveda ojival (dovelas), arco arbotante inclinado, pináculo de lastre vertical y estribo",
        "joints": "Criterio de estabilidad: la línea de presiones debe mantenerse dentro del tercio medio",
        "dof": 0,
        "dof_calc": "Estructura estáticamente estable (F ≤ 0); equilibrio vectorial ΣF = 0, ΣM = 0",
        "loop_equation": "R_resultante = H_boveda (horizontal) + W_pinaculo (vertical) ⇒ α_desvio",
        "position_eq": "y_catenaria(x) = a · cosh(x / a) [Catenaria invertida de compresión]",
        "velocity_eq": "Empuje horizontal H = w L² / (8 f)",
        "acceleration_eq": "Tensión admisible de piedra caliza σ_c ≤ 4.5 MPa",
        "nominal_params": {
            "luz_nave_m": 14.0,
            "flecha_boveda_m": 9.8,
            "peso_pinaculo_kN": 185.0,
            "factor_seguridad_tercio": 1.65
        },
        "notes": "El peso vertical del pináculo gira hacia el suelo el vector resultante de empuje lateral del arbotante, evitando el vuelco del estribo."
    },

    "inca_suspension_bridge": {
        "model_type": "structural_static",
        "mechanism_name": "Puente Colgante Q'eswachaka — Catenaria Elástica bajo Carga",
        "topology": "Sistema cable-flexión en tracción pura anclado en estribos de mampostería",
        "links": "4 cables principales de ichu trenzado, péndolas y tablero flexible de paso",
        "joints": "Anclajes fijos en roca (O₁, O₂) + equilibrio funicular bajo carga móvil P(x)",
        "dof": 1,
        "dof_calc": "Configuración funicular parametrizada por posición x_carga de la caravana",
        "loop_equation": "T₀ · (d²y / dx²) = -w(x) - P · δ(x - x_carga)",
        "position_eq": "y(x) = y_catenaria(x) + Δy_elástica(x, x_carga)",
        "velocity_eq": "T(x) = T₀ · √(1 + (dy/dx)²)",
        "acceleration_eq": "Flecha máxima f_max = w L² / (8 T₀)",
        "nominal_params": {
            "luz_libre_m": 28.0,
            "flecha_reposo_m": 2.1,
            "diametro_cable_mm": 110,
            "tension_horizontal_T0_kN": 42.0
        },
        "notes": "Renovado anualmente de forma comunitaria; trabaja exclusivamente a tracción axial evitando esfuerzos de flexión en las fibras vegetales."
    },

    "inca_quipu_memory": {
        "model_type": "structural_static",
        "mechanism_name": "Matriz Mnemotécnica Decimal de Quipu (Registro Posicional)",
        "topology": "Codificación posicional base-10 en cuerdas colgantes con cuerda totalizadora superior",
        "links": "Cuerda principal horizontal, n cuerdas colgantes de datos y cuerda subsidiaria de suma",
        "joints": "Nudos simples (decenas/centenas), nudos compuestos/en ocho (unidades)",
        "dof": 1,
        "dof_calc": "Sistema lógico discreto de almacenamiento numérico de base 10",
        "loop_equation": "Valor_cuerda = 100·N_C + 10·N_D + 1·N_U ; Suma_total = Σ Valor_cuerda_i",
        "position_eq": "Estado discreto de registro contable (000 a 999)",
        "velocity_eq": "Verificación de paridad mediante cuerda sumatoria",
        "acceleration_eq": "Cero consumo energético; persistencia física en fibra de camélido",
        "nominal_params": {
            "base_numerica": 10,
            "cuerdas_muestra": 5,
            "rango_por_cuerda": "0 – 999",
            "redundancia": "Checksum en cuerda superior"
        },
        "notes": "Cada nudo codifica físicamente la magnitud posicional: nudos en ocho para el 1, largos de vueltas para 2–9 en unidades y simples en potencias de 10."
    }
}

def get_kinematic_data(machine_id: str) -> Dict[str, Any]:
    """Retorna los datos cinemáticos analíticos exactos de cada máquina del catálogo."""
    if machine_id in KINEMATIC_REGISTRY:
        return KINEMATIC_REGISTRY[machine_id]
    
    # Salvaguarda por si se añade una nueva carpeta en el futuro
    return {
        "model_type": "crank_slider",
        "mechanism_name": "Mecanismo Histórico Analítico",
        "topology": "Cadena cinemática plana",
        "links": "Bancada fija, eslabón motriz, seguidor",
        "joints": "Pares cinemáticos inferiores",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "θ_out = i · θ_in",
        "position_eq": "s(θ)",
        "velocity_eq": "v(θ)",
        "acceleration_eq": "a(θ)",
        "nominal_params": {"rpm_nominal": 30},
        "notes": "Reconstrucción cinemática parametrizada."
    }
