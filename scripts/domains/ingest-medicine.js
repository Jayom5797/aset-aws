const { ingestPubMed } = require('../lib/pubmed-ingestor');

ingestPubMed({
  domainName: 'Medicine',
  queries: [
    'randomized controlled trial clinical outcome',
    'cancer tumor treatment chemotherapy immunotherapy',
    'cardiovascular disease heart failure myocardial',
    'drug pharmacology clinical trial efficacy',
    'medical imaging diagnosis radiology',
    'epidemiology cohort study mortality risk',
    'vaccine immunization immune response',
    'mental health depression anxiety psychiatric',
    'surgery operative outcome complication',
    'infectious disease antibiotic resistance pathogen'
  ],
  targetPerQuery: 10000,
  topicPatterns: {
    'Oncology': 'cancer|tumor|oncology|carcinoma|malignant|metastasis|chemotherapy|immunotherapy|neoplasm',
    'Cardiology': 'cardiovascular|heart|cardiac|coronary|arrhythmia|hypertension|stroke|myocardial|atherosclerosis',
    'Pharmacology': 'drug|pharmacology|pharmacokinetic|dose|therapeutic|clinical trial|efficacy|toxicity|adverse',
    'Medical Imaging': 'imaging|mri|ct scan|ultrasound|radiology|segmentation|detection|diagnosis|deep learning',
    'Epidemiology': 'epidemiology|prevalence|incidence|risk factor|cohort|mortality|public health|odds ratio',
    'Immunology': 'immune|immunology|antibody|vaccine|inflammation|cytokine|t cell|b cell|autoimmune',
    'Neurology': 'neurological|alzheimer|parkinson|multiple sclerosis|dementia|seizure|stroke|neuropathy',
    'Mental Health': 'mental health|depression|anxiety|schizophrenia|psychiatric|cognitive|therapy|bipolar',
    'Surgery': 'surgery|surgical|operative|intervention|procedure|complication|outcome|laparoscopic',
    'Infectious Disease': 'infection|infectious|bacterial|viral|antibiotic|sepsis|pandemic|pathogen|resistance'
  },
  subtopicPatterns: {
    'Oncology': {
      'Cancer Treatment': 'treatment|chemotherapy|immunotherapy|radiation|targeted therapy',
      'Tumor Biology': 'tumor|mutation|oncogene|suppressor|microenvironment',
      'Cancer Diagnosis': 'diagnosis|biomarker|screening|detection|biopsy',
      'Immunotherapy': 'immunotherapy|checkpoint|pd-1|car-t|adoptive',
      'Other': '.'
    },
    'Cardiology': {
      'Heart Failure': 'heart failure|cardiac function|ejection fraction|hfref',
      'Coronary Disease': 'coronary|atherosclerosis|myocardial infarction|stent|pci',
      'Arrhythmia': 'arrhythmia|atrial fibrillation|pacemaker|ablation',
      'Hypertension': 'hypertension|blood pressure|antihypertensive|renin',
      'Other': '.'
    },
    'Pharmacology': {
      'Drug Discovery': 'drug discovery|target|lead compound|screening|hit',
      'Clinical Trials': 'clinical trial|randomized|placebo|phase|efficacy',
      'Pharmacokinetics': 'pharmacokinetic|absorption|metabolism|clearance|bioavailability',
      'Drug Resistance': 'resistance|resistant|mechanism|overcome|bypass',
      'Other': '.'
    },
    'Medical Imaging': {
      'Deep Learning Diagnosis': 'deep learning|neural network|classification|segmentation|cnn',
      'MRI': 'mri|magnetic resonance|fmri|diffusion tensor',
      'CT and X-ray': 'ct scan|x-ray|computed tomography|chest',
      'Pathology Imaging': 'pathology|histology|slide|whole slide|digital pathology',
      'Other': '.'
    },
    'Epidemiology': {
      'Disease Burden': 'prevalence|incidence|mortality|burden|disability',
      'Risk Factors': 'risk factor|exposure|association|odds ratio|hazard',
      'Pandemic and Outbreak': 'pandemic|outbreak|epidemic|transmission|spread',
      'Other': '.'
    },
    'Immunology': {
      'Vaccines': 'vaccine|vaccination|immunization|adjuvant|efficacy',
      'Autoimmunity': 'autoimmune|autoimmunity|self-antigen|lupus|rheumatoid',
      'Inflammation': 'inflammation|cytokine|interleukin|nf-kb|inflammasome',
      'Other': '.'
    },
    'Neurology': {
      'Neurodegeneration': 'neurodegeneration|alzheimer|parkinson|amyloid|tau',
      'Stroke': 'stroke|ischemia|cerebrovascular|thrombolysis',
      'Multiple Sclerosis': 'multiple sclerosis|demyelination|lesion|relapse',
      'Other': '.'
    },
    'Mental Health': {
      'Depression': 'depression|antidepressant|mood|serotonin|ssri',
      'Anxiety': 'anxiety|stress|ptsd|panic|gad',
      'Psychosis': 'schizophrenia|psychosis|antipsychotic|hallucination',
      'Other': '.'
    },
    'Surgery': {
      'Outcomes Research': 'outcome|complication|mortality|morbidity|readmission',
      'Minimally Invasive': 'laparoscopic|robotic|minimally invasive|endoscopic',
      'Transplantation': 'transplant|graft|rejection|donor|recipient',
      'Other': '.'
    },
    'Infectious Disease': {
      'Viral Infections': 'virus|viral|antiviral|pandemic|covid|influenza',
      'Bacterial Infections': 'bacteria|antibiotic|sepsis|resistance|mrsa',
      'Parasitic Disease': 'malaria|parasite|tropical|helminth|protozoa',
      'Other': '.'
    }
  },
  defaultTopic: 'Pharmacology',
}).catch(console.error);
