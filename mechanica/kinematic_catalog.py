"""
Catálogo cinemático analítico para Mechanica Antiqua.
Define la síntesis de mecanismos, grados de libertad (Grübler-Kutzbach),
ecuaciones de cierre vectorial y parámetros dimensionales nominales para cada máquina.
"""

from typing import Dict, Any

KINEMATIC_REGISTRY: Dict[str, Dict[str, Any]] = {
    "martini_hydraulic_sawmill": {
        "model_type": "crank_slider",
        "mechanism_name": "Mecanismo Biela-Manivela-Corredera Vertical",
        "topology": "Cadena cinemática plana cerrada de 4 eslabones (1R-1P)",
        "links": "4 eslabones: 1) Bancada fija y guías de madera, 2) Cigüeñal / rueda motriz, 3) Biela de conexión, 4) Marco porta-hoja de sierra (cursor)",
        "joints": "j₁ = 4 (3 pares de revolución R: eje del cigüeñal O₂, muñón de manivela A, pie de biela B; 1 par prismático P: guías del bastidor). j₂ = 0",
        "dof": 1,
        "dof_calc": "F = 3(4 - 1) - 2(4) - 0 = 1",
        "loop_equation": "r · e^(iθ) + L · e^(iφ) = x_slide + i · y_slider",
        "position_eq": "y(θ) = y_O + r · sin(θ) + √(L² - (x_slide - (x_O + r · cos(θ)))²)",
        "velocity_eq": "v(θ) ≈ r · ω · (cos(θ) + (r / 2L) · sin(2θ))",
        "acceleration_eq": "a(θ) ≈ -r · ω² · (sin(θ) + (r / L) · cos(2θ))",
        "nominal_params": {
            "r_crank_mm": 150,
            "L_rod_mm": 750,
            "lambda_ratio": 0.20,
            "stroke_mm": 300,
            "rpm_nominal": 45,
            "cutting_speed_max_ms": 1.41
        },
        "notes": "Francesco di Giorgio Martini implementó la conversión cinemática continua con sincronismo por trinquete para el avance del tronco en la carrera ascendente (en vacío)."
    },

    "agricola_suction_pump": {
        "model_type": "crank_slider",
        "mechanism_name": "Mecanismo Biela-Manivela-Pistón Alternativo en Pozo",
        "topology": "Mecanismo cuadrilátero biela-corredera en línea (In-line Slider-Crank)",
        "links": "4 eslabones: 1) Entibación y cuerpo de bomba, 2) Manivela / cigüeñal de hierro, 3) Biela motriz, 4) Émbolo con cuero y vástago guía",
        "joints": "j₁ = 4 (3 pares R, 1 par P en camisa del cilindro). j₂ = 0",
        "dof": 1,
        "dof_calc": "F = 3(4 - 1) - 2(4) - 0 = 1",
        "loop_equation": "r · e^(iθ) + L · e^(iφ) - s(θ) · j = 0",
        "position_eq": "s(θ) = r · cos(θ) + √(L² - r² · sin²(θ))",
        "velocity_eq": "v(θ) = -r · ω · (sin(θ) + (r · sin(2θ)) / (2√(L² - r² · sin²(θ))))",
        "acceleration_eq": "a(θ) ≈ -r · ω² · (cos(θ) + (r / L) · cos(2θ))",
        "nominal_params": {
            "r_crank_mm": 175,
            "L_rod_mm": 800,
            "lambda_ratio": 0.219,
            "stroke_mm": 350,
            "cylinder_bore_mm": 180,
            "rpm_nominal": 25,
            "flow_rate_lmin": 222.6
        },
        "notes": "Agricola documenta bombas de madera perforada accionadas por malacate o rueda hidráulica para el achique minero en los montes metálicos de Sajonia."
    },

    "al_jazari_suction_pump": {
        "model_type": "scotch_yoke",
        "mechanism_name": "Mecanismo de Corredera Ranurada (Yugo Escocés Doble)",
        "topology": "Mecanismo armónico de corredera ranurada de 4 eslabones con pistones opuestos en oposición de fase (180°)",
        "links": "4 eslabones: 1) Bancada fija, 2) Rueda dentada con espiga excéntrica (cigüeñal), 3) Bloque deslizante (dado), 4) Bastidor ranurado horizontal solidario a ambos pistones",
        "joints": "j₁ = 4 (2 pares R, 2 pares P: ranura vertical y cilindros horizontales). j₂ = 0",
        "dof": 1,
        "dof_calc": "F = 3(4 - 1) - 2(4) - 0 = 1",
        "loop_equation": "x_piston(θ) = R_crank · cos(θ),  y_pin(θ) = R_crank · sin(θ)",
        "position_eq": "x(θ) = R · cos(θ)",
        "velocity_eq": "v(θ) = -R · ω · sin(θ)",
        "acceleration_eq": "a(θ) = -R · ω² · cos(θ)",
        "nominal_params": {
            "R_crank_mm": 160,
            "stroke_mm": 320,
            "bore_mm": 150,
            "rpm_nominal": 20,
            "displacement_per_rev_L": 11.3,
            "motion_law": "Movimiento Armónico Simple Puro (sin armónicos secundarios)"
        },
        "notes": "Al-Jazari (1206) eliminó la oblicuidad de la biela empleando la ranura recta, logrando una ley cinemática sinusoidal pura y duplicando el caudal con cilindros opuestos."
    },

    "agricola_stamp_mill": {
        "model_type": "cam_follower",
        "mechanism_name": "Árbol de Levas con Mazos Pisones de Caída Gravitatoria",
        "topology": "Conjunto de mecanismos de leva abierta con seguidor de traslación y desenganche brusco",
        "links": "3 eslabones por pisón: 1) Bastidor y guías de madera, 2) Árbol de levas motriz, 3) Pisón de madera con zapata de fundición (alza y maza)",
        "joints": "j₁ = 2 (1 par R en árbol, 1 par P en guías). j₂ = 1 (contacto leva-alza de orden superior con pérdida de contacto)",
        "dof": 1,
        "dof_calc": "F = 3(3 - 1) - 2(2) - 1(1) = 1 (durante la carrera de ascenso)",
        "loop_equation": "y_lift(θ) = r_cam(θ) · tan(α),  y_fall(t) = h_max - (1/2) · g · t²",
        "position_eq": "Ascenso: y(θ) = h_max · (θ / θ_lift); Caída: y(t) = h_max - 0.5 · g · t²",
        "velocity_eq": "v_impact = √(2 · g · h_max)",
        "acceleration_eq": "Ascenso: a = 0; Caída libre: a = -g = -9.81 m/s²",
        "nominal_params": {
            "lift_height_mm": 250,
            "stamper_mass_kg": 120,
            "cam_angular_speed_rpm": 30,
            "num_stampers": 3,
            "impact_velocity_ms": 2.21,
            "impact_energy_J": 294.3
        },
        "notes": "Bocarte minero clásico: las levas escalonadas a 120° equilibran el par motor en la rueda hidráulica y aseguran impacto cíclico en el mortero."
    },

    "ramelli_book_wheel": {
        "model_type": "epicyclic",
        "mechanism_name": "Rueda de Lectura con Tren de Engranajes Epicicloidal",
        "topology": "Tren epicicloidal planetario invertido con sol estacionario y satélites con inversión de marcha",
        "links": "Eslabones: 1) Bastidor de la cabina, 2) Tambor portaplanetarios principal, 3..10) Ruedas satélite y atriles basculantes, 11..18) Ruedas intermedias parásitas",
        "joints": "Pares de revolución en cada eje y contactos de engranaje (j₁ y j₂)",
        "dof": 1,
        "dof_calc": "F = 1 (accionamiento manual por el lector mediante manivela)",
        "loop_equation": "ω_atril = ω_tambor + (ω_sol - ω_tambor) · (Z_sol / Z_satelite) = 0",
        "position_eq": "θ_atril(t) = θ_tambor(t) - θ_tambor(t) = 0° (Constante horizontal)",
        "velocity_eq": "ω_atril = 0 rad/s (en el marco inercial de la habitación)",
        "acceleration_eq": "a_angular = 0 rad/s²",
        "nominal_params": {
            "R_drum_mm": 850,
            "num_desks": 8,
            "gear_ratio_sun_planet": 1.0,
            "transmission_type": "Epicicloidal con engranajes parásitos de inversión",
            "condition": "Nivelación absoluta de los libros para evitar su caída por gravedad"
        },
        "notes": "Agostino Ramelli (1588) diseñó este ingenio para permitir el estudio simultáneo de múltiples tratados sin mover al lector ni desordenar los libros."
    },

    "besson_screw_lathe": {
        "model_type": "lead_screw",
        "mechanism_name": "Torno de Roscar con Husillo Patrón y Sincronismo Cinemático",
        "topology": "Transmisión cinemática helicoidal rígida por cadena de poleas cruzadas y husillo maestro",
        "links": "Bancada, husillo patrón maestro, árbol portapieza, carro portaherramientas transversal/longitudinal",
        "joints": "Pares de revolución, par helicoidal H (husillo) y par prismático (guías del carro)",
        "dof": 1,
        "dof_calc": "F = 1 (sincronismo forzado entre rotación de la pieza y avance de la cuchilla)",
        "loop_equation": "z_carro(θ) = p_maestro · (θ / 2π) · i_poleas",
        "position_eq": "z(θ) = p_efectivo · (θ / 2π)",
        "velocity_eq": "v_avance = (p_efectivo / 2π) · ω",
        "acceleration_eq": "a_avance = (p_efectivo / 2π) · α",
        "nominal_params": {
            "lead_screw_pitch_mm": 6.0,
            "spindle_ratio_i": 1.0,
            "cutting_advance_per_rev_mm": 6.0,
            "workpiece_diameter_mm": 60,
            "sync_mechanism": "Poleas y cables tensados por contrapesos de plomo"
        },
        "notes": "Jacques Besson (1578) inventó la máquina herramienta de roscado donde el paso no depende de la habilidad manual del tornero sino de la geometría del husillo patrón."
    },

    "leonardo_cage_bearing": {
        "model_type": "ball_bearing",
        "mechanism_name": "Cojinete Axial de Bolas con Jaula Distanciadora",
        "topology": "Par cinemático de rodadura pura confinada con distribución orbital de elementos rodantes",
        "links": "Pista fija inferior, pista móvil superior (plato de carga), jaula de retención de bronce, 8 bolas de acero/bronce",
        "joints": "Pares de contacto rodante superior j₂ con condición de no deslizamiento",
        "dof": 1,
        "dof_calc": "F = 1 (rotación axial bajo carga de compresión vertical)",
        "loop_equation": "v_contacto_int = ω_eje · R_int,  v_contacto_ext = 0,  v_centro_bola = v_contacto_int / 2",
        "position_eq": "θ_jaula(t) = 0.5 · θ_eje(t)",
        "velocity_eq": "ω_jaula = 0.5 · ω_eje;  ω_spin_bola = ω_eje · (R_pista / 2r_bola)",
        "acceleration_eq": "a_centripeta = ω_jaula² · R_pista",
        "nominal_params": {
            "R_pitch_mm": 130,
            "ball_diameter_mm": 56,
            "num_balls": 8,
            "friction_coeff_rolling": 0.002,
            "friction_coeff_sliding_without_cage": 0.25,
            "friction_reduction_factor": 125
        },
        "notes": "Leonardo da Vinci descubrió que sin la jaula separadora, las bolas contiguas giran en sentidos opuestos en su punto de contacto mutuo, multiplicando la fricción y trabando el mecanismo."
    },

    "newcomen_newcomen_engine": {
        "model_type": "beam_engine",
        "mechanism_name": "Máquina de Vapor Atmosférica con Balancín Oscilante",
        "topology": "Mecanismo oscilante de balancín con transmisión flexible por cadenas sobre cabezas de arco",
        "links": "1) Muro de mampostería y pivote central, 2) Balancín de madera oscilante, 3) Pistón de vapor, 4) Vástago de la bomba del pozo",
        "joints": "j₁ = 3 (1 par R en fulcro, 2 pares P en cilindros conectados por arcos de circunferencia)",
        "dof": 1,
        "dof_calc": "F = 3(3 - 1) - 2(2) = 1",
        "loop_equation": "y_vapor(t) = L_arco · sin(ψ(t)),  y_bomba(t) = -L_arco · sin(ψ(t))",
        "position_eq": "ψ(θ) = ψ_max · sin(θ);  s_piston = 2 · L_arco · sin(ψ_max)",
        "velocity_eq": "v_piston = L_arco · ψ_max · ω · cos(θ)",
        "acceleration_eq": "a_piston = -L_arco · ψ_max · ω² · sin(θ)",
        "nominal_params": {
            "beam_half_length_mm": 3500,
            "cylinder_bore_mm": 530,
            "stroke_mm": 1800,
            "cycles_per_minute": 12,
            "net_steam_force_kN": 18.5,
            "working_vacuum_bar": 0.85
        },
        "notes": "Thomas Newcomen (1712) utilizó las cabezas de arco (arch-heads) con cadenas para garantizar que las fuerzas axiales sobre el émbolo permanecieran estrictamente colineales al cilindro."
    },

    "chinese_south_pointing_chariot": {
        "model_type": "gear_differential",
        "mechanism_name": "Carro Apuntador hacia el Sur con Tren Diferencial Mecánico",
        "topology": "Mecanismo diferencial de engranajes epicicloidales para integración angular de rumbo",
        "links": "Chasis, rueda izquierda, rueda derecha, satélites diferenciales, portaplanetario solidario a la figura indicadora",
        "joints": "Pares R y contactos de engranaje",
        "dof": 2,
        "dof_calc": "F = 2 (cinemática de rodadura bidimensional del vehículo sobre el terreno)",
        "loop_equation": "Δθ_rumbo = (s_derecha - s_izquierda) / trocha;  θ_figura = θ_inicial - Δθ_rumbo",
        "position_eq": "θ_puntero = const. (invariante absoluto en coordenadas geográficas)",
        "velocity_eq": "ω_portaplanetario = 0.5 · (ω_izq - ω_der) · (R_rueda / B_trocha)",
        "acceleration_eq": "α_portaplanetario = 0.5 · (α_izq - α_der)",
        "nominal_params": {
            "wheel_diameter_mm": 1200,
            "track_width_mm": 1800,
            "differential_ratio": 1.0,
            "compass_type": "Mecánico puro (sin magnetismo)",
            "principio": "Odometría diferencial cinemática de compensación exacta de giro"
        },
        "notes": "Ma Jun y Yan Su desarrollaron el primer mecanismo diferencial conocido de la historia, permitiendo que la figura de madera apunte siempre al sur independientemente de los giros del carro."
    },

    "vitruvius_archimedes_screw": {
        "model_type": "archimedes_screw",
        "mechanism_name": "Tornillo Hidráulico Helicoidal (Cochlea)",
        "topology": "Par helicoidal volumétrico continuo con retención gravitacional por inclinación",
        "links": "Cuerpo helicoidal de madera calafateada con eje central y apoyos de bronce en los extremos",
        "joints": "Pares R en extremos superior e inferior",
        "dof": 1,
        "dof_calc": "F = 1 (accionamiento manual con peldaños de pisada / molino humano)",
        "loop_equation": "z_bolsa(t) = (p / 2π) · ω · t · sin(β)",
        "position_eq": "Desplazamiento axial de la bolsa: z(t) = v_axial · t",
        "velocity_eq": "Q_volumetrico = η_llenado · V_espira · (ω / 2π)",
        "acceleration_eq": "Flujo continuo libre de aceleraciones alternativas",
        "nominal_params": {
            "outer_diameter_mm": 400,
            "core_diameter_mm": 160,
            "pitch_mm": 400,
            "inclination_deg": 37.0,
            "length_mm": 3000,
            "rpm_nominal": 40,
            "flow_rate_m3h": 18.5
        },
        "notes": "Vitruvio en De Architectura establece la regla del triángulo pitagórico 3-4-5 para la inclinación óptima (37°) que maximiza el volumen de la cavidad helicoidal antes del rebose."
    }
}

def get_kinematic_data(machine_id: str) -> Dict[str, Any]:
    """Retorna los datos cinemáticos analíticos de la máquina o un modelo genérico parametrizado."""
    if machine_id in KINEMATIC_REGISTRY:
        return KINEMATIC_REGISTRY[machine_id]
    
    # Modelo genérico analítico según el tipo de máquina
    return {
        "model_type": "generic_rotary",
        "mechanism_name": "Mecanismo Rotativo / Transmisión Histórica",
        "topology": "Cadena cinemática de transmisión de potencia",
        "links": "Bancada fija, eje motriz impulsor, elemento receptor de trabajo",
        "joints": "Pares cinemáticos de revolución y contacto mecánico",
        "dof": 1,
        "dof_calc": "F = 1",
        "loop_equation": "θ_out(t) = i · θ_in(t)",
        "position_eq": "θ(t) = ω · t",
        "velocity_eq": "ω_out = i · ω_in",
        "acceleration_eq": "α_out = i · α_in",
        "nominal_params": {
            "rpm_nominal": 30,
            "efficiency": 0.75
        },
        "notes": "Mecanismo histórico reconstruido analíticamente según los principios de la mecánica clásica."
    }
