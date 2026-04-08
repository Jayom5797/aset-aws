const { ingestArxivOAI } = require('../lib/arxiv-oai-ingestor');

// arXiv OAI sets: https://arxiv.org/help/oa/index
// physics.chem-ph = Chemical Physics
// cond-mat.mtrl-sci = Materials Science
ingestArxivOAI({
  domainName: 'Chemistry',
  sets: ['physics:cond-mat:mtrl-sci', 'physics:physics'],
  targetTotal: 50000,
  topicPatterns: {
    'Organic Chemistry': 'organic|synthesis|reaction mechanism|functional group|aromatic|alkyl|polymer|heterocyclic',
    'Physical Chemistry': 'thermodynamic|kinetic|quantum chemistry|spectroscop|molecular orbital|density functional|dft',
    'Inorganic Chemistry': 'inorganic|coordination|metal complex|ligand|transition metal|crystal structure|oxide',
    'Analytical Chemistry': 'analytical|chromatograph|spectroscop|sensor|detection|concentration|titration|mass spectrometry',
    'Electrochemistry': 'electrochemistry|electrode|battery|fuel cell|electrolysis|redox|voltammetry|capacitor',
    'Computational Chemistry': 'computational|simulation|molecular dynamics|dft|ab initio|force field|monte carlo|md',
    'Materials Chemistry': 'material|nanoparticle|nanomaterial|composite|thin film|surface|coating|graphene',
    'Biochemistry': 'biochemistry|enzyme|protein|amino acid|metabol|biosynthesis|cofactor|substrate'
  },
  subtopicPatterns: {
    'Organic Chemistry': {
      'Synthesis': 'synthesis|synthetic route|total synthesis|retrosynthesis',
      'Reaction Mechanisms': 'mechanism|intermediate|transition state|nucleophilic|electrophilic',
      'Polymers': 'polymer|polymerization|monomer|copolymer|elastomer',
      'Other': '.'
    },
    'Physical Chemistry': {
      'Quantum Chemistry': 'quantum|orbital|wavefunction|schrodinger|hartree-fock',
      'Thermodynamics': 'thermodynamic|entropy|enthalpy|gibbs|equilibrium|free energy',
      'Spectroscopy': 'spectroscop|nmr|infrared|raman|uv-vis|esr',
      'Other': '.'
    },
    'Inorganic Chemistry': {
      'Coordination Chemistry': 'coordination|ligand|complex|chelate|metal-organic',
      'Crystal Structure': 'crystal|lattice|x-ray diffraction|unit cell|space group',
      'Catalysis': 'catalysis|catalyst|heterogeneous|homogeneous|turnover',
      'Other': '.'
    },
    'Analytical Chemistry': {
      'Chromatography': 'chromatograph|hplc|gc-ms|separation|column',
      'Sensors': 'sensor|biosensor|detection|selectivity|sensitivity',
      'Mass Spectrometry': 'mass spectrometry|ms|maldi|esi|fragmentation',
      'Other': '.'
    },
    'Electrochemistry': {
      'Batteries': 'battery|lithium|cathode|anode|electrolyte|capacity',
      'Fuel Cells': 'fuel cell|hydrogen|oxygen reduction|proton exchange|membrane',
      'Supercapacitors': 'supercapacitor|capacitance|double layer|pseudocapacitance',
      'Other': '.'
    },
    'Computational Chemistry': {
      'DFT': 'density functional|dft|kohn-sham|exchange-correlation',
      'Molecular Dynamics': 'molecular dynamics|md simulation|force field|trajectory',
      'Machine Learning Chemistry': 'machine learning|neural network|potential|interatomic',
      'Other': '.'
    },
    'Materials Chemistry': {
      'Nanomaterials': 'nanoparticle|quantum dot|nanotube|graphene|2d material',
      'Thin Films': 'thin film|coating|deposition|surface|pvd|cvd',
      'Porous Materials': 'mof|zeolite|porous|adsorption|framework',
      'Other': '.'
    },
    'Biochemistry': {
      'Enzymes': 'enzyme|catalysis|substrate|active site|inhibitor',
      'Proteins': 'protein|amino acid|folding|structure|conformation',
      'Metabolomics': 'metabolomics|metabolite|pathway|flux|metabolism',
      'Other': '.'
    }
  },
  defaultTopic: 'Physical Chemistry'
}).catch(console.error);
