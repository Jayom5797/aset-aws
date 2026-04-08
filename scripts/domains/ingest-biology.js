const { ingestPubMed } = require('../lib/pubmed-ingestor');

ingestPubMed({
  domainName: 'Biology',
  queries: [
    'gene expression transcription regulation',
    'cell signaling pathway protein kinase',
    'evolutionary biology phylogenetics',
    'neuroscience synaptic plasticity memory',
    'ecology biodiversity population',
    'protein structure folding function',
    'microbiology bacteria pathogen infection',
    'stem cell differentiation development',
    'CRISPR genome editing',
    'systems biology gene network'
  ],
  targetPerQuery: 10000,
  topicPatterns: {
    'Genetics and Genomics': 'gene|genome|dna|rna|sequencing|mutation|chromosome|crispr|snp|epigenetic',
    'Cell Biology': 'cell|membrane|organelle|mitosis|apoptosis|receptor|signaling pathway|cytoskeleton',
    'Neuroscience': 'neuron|brain|neural|synapse|cortex|cognition|neurotransmitter|hippocampus|plasticity',
    'Evolutionary Biology': 'evolution|natural selection|phylogen|species|adaptation|fitness|population genetics',
    'Ecology': 'ecology|ecosystem|biodiversity|population|habitat|food web|species interaction|conservation',
    'Molecular Biology': 'protein|enzyme|folding|structure|binding|transcription|translation|ribosome',
    'Microbiology': 'bacteria|virus|pathogen|infection|antibiotic|microbiome|fungi|parasite|biofilm',
    'Developmental Biology': 'development|embryo|stem cell|differentiation|morphogen|organogenesis|fate',
    'Biophysics': 'biophysics|ion channel|membrane potential|force|mechanical|single molecule|optical trap',
    'Systems Biology': 'systems biology|network|regulatory|feedback|oscillation|modeling|circuit'
  },
  subtopicPatterns: {
    'Genetics and Genomics': {
      'Gene Expression': 'expression|transcription|rna-seq|mrna|promoter',
      'CRISPR and Editing': 'crispr|gene editing|cas9|knockout|base editing',
      'Genomics': 'genome|sequencing|whole genome|variant|gwas',
      'Epigenetics': 'epigenetic|methylation|histone|chromatin',
      'Other': '.'
    },
    'Cell Biology': {
      'Signaling': 'signaling|pathway|kinase|phosphorylation|cascade',
      'Cell Cycle': 'cell cycle|mitosis|division|checkpoint|cyclin',
      'Membrane Biology': 'membrane|lipid|vesicle|endocytosis|exocytosis',
      'Other': '.'
    },
    'Neuroscience': {
      'Neural Circuits': 'circuit|network|connectivity|synapse|wiring',
      'Cognition and Memory': 'cognition|memory|learning|behavior|plasticity',
      'Neurological Disorders': 'alzheimer|parkinson|epilepsy|disorder|neurodegeneration',
      'Other': '.'
    },
    'Evolutionary Biology': {
      'Natural Selection': 'selection|fitness|adaptation|drift|sweep',
      'Phylogenetics': 'phylogen|tree|ancestor|divergence|clade',
      'Population Genetics': 'population|allele|frequency|migration|bottleneck',
      'Other': '.'
    },
    'Ecology': {
      'Population Dynamics': 'population|dynamics|growth|competition|predator',
      'Biodiversity': 'biodiversity|species richness|conservation|extinction',
      'Climate and Ecology': 'climate|temperature|habitat|range|phenology',
      'Other': '.'
    },
    'Molecular Biology': {
      'Protein Structure': 'structure|folding|conformation|domain|cryo-em',
      'Enzymology': 'enzyme|catalysis|kinetics|active site|mechanism',
      'RNA Biology': 'rna|noncoding|microrna|splicing|riboswitch',
      'Other': '.'
    },
    'Microbiology': {
      'Infectious Disease': 'infection|pathogen|virulence|host|invasion',
      'Antibiotic Resistance': 'antibiotic|resistance|resistant|drug|efflux',
      'Microbiome': 'microbiome|gut|flora|commensal|dysbiosis',
      'Other': '.'
    },
    'Developmental Biology': {
      'Stem Cells': 'stem cell|pluripotent|differentiation|ips|reprogramming',
      'Embryogenesis': 'embryo|development|morphogen|patterning|gastrulation',
      'Other': '.'
    },
    'Biophysics': {
      'Ion Channels': 'ion channel|membrane|conductance|patch clamp|gating',
      'Single Molecule': 'single molecule|force|optical trap|afm|smfret',
      'Other': '.'
    },
    'Systems Biology': {
      'Gene Networks': 'gene network|regulatory|transcription factor|motif',
      'Modeling': 'model|simulation|differential equation|stochastic|ode',
      'Other': '.'
    }
  },
  defaultTopic: 'Molecular Biology',
}).catch(console.error);
