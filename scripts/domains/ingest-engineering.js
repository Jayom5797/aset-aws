const { ingestArxivOAI } = require('../lib/arxiv-oai-ingestor');

ingestArxivOAI({
  domainName: 'Engineering',
  sets: ['eess:eess:SP', 'eess:eess:SY', 'cs:cs:RO'],
  targetTotal: 50000,
  topicPatterns: {
    'Electrical Engineering': 'electrical|circuit|power electronics|voltage|current|transformer|motor|generator|inverter|grid',
    'Mechanical Engineering': 'mechanical|stress|strain|fatigue|fracture|vibration|heat transfer|manufacturing|finite element',
    'Civil Engineering': 'civil|structural|concrete|steel|foundation|bridge|earthquake|geotechnical|construction|pavement',
    'Control Systems': 'control|feedback|stability|pid|transfer function|state space|robust|adaptive|optimal control',
    'Signal Processing': 'signal processing|filter|fourier|wavelet|sampling|noise|compression|modulation|beamforming',
    'Robotics': 'robot|autonomous|navigation|manipulation|kinematics|path planning|slam|drone|uav|grasping',
    'Aerospace Engineering': 'aerospace|aerodynamic|propulsion|aircraft|turbine|rocket|satellite|flight|hypersonic|reentry',
    'Chemical Engineering': 'chemical engineering|reactor|distillation|heat exchanger|mass transfer|process|separation|catalyst',
    'Biomedical Engineering': 'biomedical|implant|prosthetic|biomechanics|tissue engineering|medical device|biosensor|rehabilitation',
    'Environmental Engineering': 'environmental|water treatment|pollution|waste|remediation|sustainability|emission|carbon|renewable'
  },
  subtopicPatterns: {
    'Electrical Engineering': {
      'Power Systems': 'power system|grid|renewable|solar|wind|energy storage|microgrid',
      'Electronics': 'semiconductor|transistor|integrated circuit|vlsi|pcb|analog',
      'Electromagnetics': 'electromagnetic|antenna|microwave|rf|radar|propagation',
      'Other': '.'
    },
    'Mechanical Engineering': {
      'Structural Mechanics': 'stress|strain|fracture|fatigue|finite element|fem',
      'Thermal Engineering': 'heat transfer|thermal|conduction|convection|radiation|cooling',
      'Manufacturing': 'manufacturing|machining|additive|3d printing|welding|casting',
      'Vibration': 'vibration|modal|frequency|damping|resonance|acoustic',
      'Other': '.'
    },
    'Civil Engineering': {
      'Structural Engineering': 'structural|beam|column|frame|load|deflection|reinforced',
      'Geotechnical': 'geotechnical|soil|foundation|slope|excavation|liquefaction',
      'Transportation': 'transportation|traffic|pavement|highway|bridge|rail',
      'Other': '.'
    },
    'Control Systems': {
      'Robust Control': 'robust|h-infinity|uncertainty|disturbance rejection|lmi',
      'Adaptive Control': 'adaptive|self-tuning|model reference|learning|online',
      'Model Predictive Control': 'mpc|model predictive|receding horizon|constraint|optimization',
      'Other': '.'
    },
    'Signal Processing': {
      'Audio Processing': 'audio|speech|acoustic|noise cancellation|beamforming|asr',
      'Image Processing': 'image|video|compression|enhancement|restoration|denoising',
      'Communications': 'communication|modulation|channel|mimo|ofdm|5g|coding',
      'Other': '.'
    },
    'Robotics': {
      'Autonomous Vehicles': 'autonomous vehicle|self-driving|lidar|perception|planning',
      'Manipulation': 'manipulation|grasping|arm|end effector|dexterous|pick and place',
      'Drones': 'drone|uav|quadrotor|aerial|flight control|swarm',
      'SLAM': 'slam|localization|mapping|odometry|loop closure',
      'Other': '.'
    },
    'Aerospace Engineering': {
      'Aerodynamics': 'aerodynamic|lift|drag|boundary layer|cfd|turbulence',
      'Propulsion': 'propulsion|turbine|jet engine|rocket|thrust|combustion',
      'Spacecraft': 'spacecraft|satellite|orbit|attitude|reentry|guidance',
      'Other': '.'
    },
    'Chemical Engineering': {
      'Reaction Engineering': 'reactor|reaction|kinetics|catalyst|conversion|selectivity',
      'Separation Processes': 'distillation|absorption|extraction|membrane|adsorption',
      'Process Control': 'process control|optimization|monitoring|fault detection',
      'Other': '.'
    },
    'Biomedical Engineering': {
      'Medical Devices': 'medical device|implant|stent|pacemaker|catheter|wearable',
      'Tissue Engineering': 'tissue|scaffold|biomaterial|regeneration|cell culture|hydrogel',
      'Biomechanics': 'biomechanics|gait|prosthetic|orthopedic|joint|spine',
      'Other': '.'
    },
    'Environmental Engineering': {
      'Water Treatment': 'water treatment|filtration|disinfection|wastewater|membrane',
      'Air Quality': 'air quality|emission|particulate|pollutant|atmosphere|pm2.5',
      'Renewable Energy': 'renewable|solar|wind|energy|sustainability|carbon neutral',
      'Other': '.'
    }
  },
  defaultTopic: 'Electrical Engineering'
}).catch(console.error);
