const { ingestArxivOAI } = require('../lib/arxiv-oai-ingestor');

ingestArxivOAI({
  domainName: 'Computer Science',
  sets: ['cs:cs:AI', 'cs:cs:LG', 'cs:cs:CV', 'cs:cs:CR'],
  targetTotal: 50000,
  topicPatterns: {
    'Artificial Intelligence': 'artificial intelligence|machine learning|deep learning|neural network|reinforcement learning|generative|llm|transformer|foundation model',
    'Computer Vision': 'computer vision|image|object detection|segmentation|recognition|convolutional|visual|video',
    'Natural Language Processing': 'natural language|nlp|text|language model|sentiment|translation|bert|gpt|transformer|llm',
    'Software Engineering': 'software engineering|testing|debugging|refactoring|architecture|design pattern|agile|devops|code',
    'Computer Networks': 'network|protocol|routing|bandwidth|latency|tcp|udp|wireless|5g|distributed|edge',
    'Cybersecurity': 'security|cryptography|vulnerability|attack|malware|intrusion|privacy|encryption|authentication|adversarial',
    'Databases': 'database|query|sql|nosql|index|transaction|storage|data warehouse|olap|graph database',
    'Algorithms and Theory': 'algorithm|complexity|np-hard|graph|sorting|optimization|approximation|data structure|computational',
    'Computer Architecture': 'processor|cpu|gpu|cache|memory|instruction|pipeline|hardware|fpga|chip|accelerator',
    'Human-Computer Interaction': 'user interface|usability|accessibility|interaction|ux|ui|visualization|augmented reality|vr'
  },
  subtopicPatterns: {
    'Artificial Intelligence': {
      'Large Language Models': 'language model|llm|gpt|bert|transformer|fine-tuning|prompt|instruction',
      'Reinforcement Learning': 'reinforcement learning|reward|policy|agent|q-learning|ppo|actor-critic',
      'Generative AI': 'generative|gan|diffusion|vae|image generation|text generation|stable diffusion',
      'Graph Neural Networks': 'graph neural|gnn|graph convolutional|message passing|node classification',
      'Other': '.'
    },
    'Computer Vision': {
      'Object Detection': 'object detection|yolo|faster rcnn|bounding box|anchor',
      'Image Segmentation': 'segmentation|semantic|instance|mask|panoptic',
      'Image Generation': 'image generation|synthesis|style transfer|diffusion|inpainting',
      'Video Understanding': 'video|temporal|action recognition|optical flow|tracking',
      'Other': '.'
    },
    'Natural Language Processing': {
      'Text Classification': 'classification|sentiment|topic|categorization|intent',
      'Machine Translation': 'translation|multilingual|cross-lingual|seq2seq|nmt',
      'Question Answering': 'question answering|reading comprehension|knowledge base|retrieval',
      'Text Generation': 'generation|summarization|dialogue|story|creative writing',
      'Other': '.'
    },
    'Software Engineering': {
      'Testing': 'testing|test case|bug|fault|coverage|fuzzing',
      'Software Architecture': 'architecture|microservice|design pattern|component|coupling',
      'DevOps': 'devops|ci/cd|deployment|container|kubernetes|docker',
      'Code Analysis': 'static analysis|code smell|refactoring|technical debt|clone',
      'Other': '.'
    },
    'Computer Networks': {
      'Wireless Networks': 'wireless|wifi|5g|cellular|mobile|mmwave',
      'Distributed Systems': 'distributed|consensus|fault tolerance|replication|consistency',
      'Network Security': 'network security|firewall|intrusion|ddos|botnet',
      'Other': '.'
    },
    'Cybersecurity': {
      'Cryptography': 'cryptography|encryption|hash|public key|cipher|post-quantum',
      'Vulnerability Analysis': 'vulnerability|exploit|cve|penetration|fuzzing|binary',
      'Privacy': 'privacy|differential privacy|anonymization|gdpr|federated',
      'Adversarial ML': 'adversarial|attack|defense|robustness|perturbation|backdoor',
      'Other': '.'
    },
    'Databases': {
      'Query Optimization': 'query|optimization|execution plan|index|cardinality',
      'NoSQL': 'nosql|key-value|document|graph database|mongodb|cassandra',
      'Streaming': 'streaming|real-time|event|kafka|flink|spark',
      'Other': '.'
    },
    'Algorithms and Theory': {
      'Graph Algorithms': 'graph|shortest path|spanning tree|network flow|matching',
      'Optimization': 'optimization|linear programming|integer programming|heuristic|metaheuristic',
      'Approximation': 'approximation|randomized|online|competitive|hardness',
      'Other': '.'
    },
    'Computer Architecture': {
      'GPU Computing': 'gpu|cuda|parallel|graphics processor|tensor core',
      'Memory Systems': 'cache|memory hierarchy|dram|prefetch|coherence',
      'Neural Accelerators': 'accelerator|npu|systolic|inference|edge ai',
      'Other': '.'
    },
    'Human-Computer Interaction': {
      'User Experience': 'user experience|usability|interface|interaction design|evaluation',
      'Accessibility': 'accessibility|assistive|disability|screen reader|wcag',
      'Other': '.'
    }
  },
  defaultTopic: 'Artificial Intelligence'
}).catch(console.error);
