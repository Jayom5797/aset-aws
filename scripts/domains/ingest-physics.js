const { ingestArxivOAI } = require('../lib/arxiv-oai-ingestor');

ingestArxivOAI({
  domainName: 'Physics',
  sets: ['physics:quant-ph', 'physics:nucl-ex', 'physics:nucl-th', 'physics:cond-mat:supr-con', 'physics:cond-mat:str-el'],
  targetTotal: 50000,
  topicPatterns: {
    'Quantum Physics': 'quantum|entanglement|superposition|wave function|qubit|decoherence|uncertainty|bell',
    'Condensed Matter Physics': 'condensed matter|superconductor|phase transition|crystal|lattice|ferromagnet|topological|band',
    'Nuclear Physics': 'nuclear|fission|fusion|radioactive|decay|neutron|proton|nucleus|isotope|cross section',
    'Atomic and Molecular Physics': 'atomic|atom|molecule|laser|spectroscopy|ionization|bose-einstein|cold atom|trap',
    'Optics and Photonics': 'optics|photon|laser|interference|diffraction|waveguide|nonlinear|fiber|cavity',
    'Fluid Dynamics': 'fluid|turbulence|flow|viscosity|navier-stokes|reynolds|vortex|aerodynamic|convection',
    'Thermodynamics and Statistical Mechanics': 'thermodynamic|entropy|statistical mechanics|partition function|boltzmann|phase space',
    'Particle Physics': 'particle|standard model|higgs|quark|lepton|collider|lhc|boson|fermion|neutrino',
    'Plasma Physics': 'plasma|fusion|tokamak|magnetohydrodynamic|ionized|discharge|confinement',
    'Solid State Physics': 'solid state|semiconductor|band gap|transistor|diode|doping|carrier|hall effect'
  },
  subtopicPatterns: {
    'Quantum Physics': {
      'Quantum Computing': 'quantum computing|qubit|quantum gate|quantum circuit|quantum algorithm|error correction',
      'Quantum Entanglement': 'entanglement|bell|epr|nonlocal|teleportation|correlation',
      'Quantum Field Theory': 'quantum field|qft|renormalization|feynman|path integral',
      'Quantum Optics': 'quantum optics|photon|cavity|squeezed|coherent state',
      'Other': '.'
    },
    'Condensed Matter Physics': {
      'Superconductivity': 'superconductor|cooper pair|bcs|meissner|critical temperature|pairing',
      'Phase Transitions': 'phase transition|order parameter|critical point|symmetry breaking|universality',
      'Topological Materials': 'topological|dirac|weyl|surface state|berry phase|insulator',
      'Strongly Correlated': 'strongly correlated|mott|hubbard|kondo|heavy fermion',
      'Other': '.'
    },
    'Nuclear Physics': {
      'Nuclear Reactions': 'reaction|cross section|fission|fusion|decay|yield',
      'Nuclear Structure': 'nuclear structure|shell model|deformation|spin|magic number',
      'Nuclear Astrophysics': 'nucleosynthesis|r-process|s-process|stellar|neutron star',
      'Other': '.'
    },
    'Atomic and Molecular Physics': {
      'Laser Cooling': 'laser cooling|bose-einstein|cold atom|trap|magneto-optical|ultracold',
      'Spectroscopy': 'spectroscopy|transition|energy level|absorption|emission|precision',
      'Molecular Physics': 'molecular|vibration|rotation|potential energy|dissociation',
      'Other': '.'
    },
    'Optics and Photonics': {
      'Nonlinear Optics': 'nonlinear|harmonic generation|soliton|kerr|parametric',
      'Quantum Optics': 'quantum optics|photon|cavity|squeezed|entangled photon',
      'Fiber Optics': 'fiber|waveguide|propagation|dispersion|amplifier',
      'Other': '.'
    },
    'Fluid Dynamics': {
      'Turbulence': 'turbulence|turbulent|reynolds|kolmogorov|cascade',
      'Aerodynamics': 'aerodynamic|airfoil|drag|lift|boundary layer|wake',
      'Magnetohydrodynamics': 'mhd|magnetohydrodynamic|alfven|magnetic reconnection',
      'Other': '.'
    },
    'Thermodynamics and Statistical Mechanics': {
      'Statistical Mechanics': 'statistical mechanics|partition function|ensemble|monte carlo|ising',
      'Non-equilibrium': 'non-equilibrium|irreversible|fluctuation|dissipation|entropy production',
      'Other': '.'
    },
    'Particle Physics': {
      'Standard Model': 'standard model|higgs|electroweak|qcd|w boson|z boson',
      'Beyond Standard Model': 'supersymmetry|dark matter|extra dimension|bsm|susy',
      'Neutrino Physics': 'neutrino|oscillation|mass|mixing|sterile',
      'Other': '.'
    },
    'Plasma Physics': {
      'Fusion Energy': 'fusion|tokamak|iter|confinement|plasma heating|ignition',
      'Plasma Instabilities': 'instability|mhd|alfven|kink mode|disruption',
      'Other': '.'
    },
    'Solid State Physics': {
      'Semiconductors': 'semiconductor|band gap|doping|carrier|transistor|heterostructure',
      'Magnetic Materials': 'magnetic|ferromagnet|spin|magnetization|anisotropy',
      'Other': '.'
    }
  },
  defaultTopic: 'Quantum Physics'
}).catch(console.error);
