/**
 * KiddyQuest Arcade Logic Engine
 * Powers Voice synthesis, Web Audio synthetics, drag & drop, card flips, racing, grid movements, and stories
 */

// Global Arcade Scores & Configurations
let scoreStars = 0;
let explorerLevel = 1;
let activeZone = 'lobby';
let audioCtx = null;
let currentLobbyCategory = 'learning';
let currentActiveGame = null;
let currentScienceConfig = null;
let exploredTriggers = new Set();

let currentLanguage = 'en';
let voiceMuted = false;

// Speech synthesis voice setting
let synthVoice = null;

// 100 Kids Interactive Games Database
const ARCADE_GAMES = [
  // LEARNING ZONE
  { id: 'alpha-trace', category: 'learning', subgroup: 'Alphabet & Writing', name: 'Alphabet Tracing Game', emoji: '✍️', desc: 'Trace lovely alphabet letters with glowing colors!', engine: 'paint', config: { template: 'letters' } },
  { id: 'abc-match', category: 'learning', subgroup: 'Alphabet & Writing', name: 'ABC Matching Game', emoji: '⚖️', desc: 'Match lowercase letter bubbles to capital clouds!', engine: 'alphabet', config: { mode: 'matching' } },
  { id: 'missing-letter', category: 'learning', subgroup: 'Alphabet & Writing', name: 'Missing Letter Challenge', emoji: '🧩', desc: 'Find the missing letter bubble to fill the gap!', engine: 'alphabet', config: { mode: 'sequence' } },
  { id: 'alpha-pop', category: 'learning', subgroup: 'Alphabet & Writing', name: 'Alphabet Balloon Pop', emoji: '🎈', desc: 'Pop letters as they float into the sky!', engine: 'counting', config: { mode: 'order', preset: 'letters' } },
  
  { id: 'number-counting', category: 'learning', subgroup: 'Counting & Numbers', name: 'Number Counting Game', emoji: '🧁', desc: 'Count delicious cupcakes, donuts, and cookies!', engine: 'counting', config: { mode: 'sweets' } },
  { id: 'number-trace', category: 'learning', subgroup: 'Counting & Numbers', name: 'Number Tracing Game', emoji: '✏️', desc: 'Draw and trace glowing numbers step-by-step!', engine: 'paint', config: { template: 'numbers' } },
  { id: 'missing-number', category: 'learning', subgroup: 'Counting & Numbers', name: 'Missing Number Puzzle', emoji: '❓', desc: 'Solve sequences by filling in the missing digits!', engine: 'counting', config: { mode: 'sweets', missing: true } },
  
  { id: 'addition-race', category: 'learning', subgroup: 'Math & Formulas', name: 'Addition Race', emoji: '🏎️', desc: 'Help Bunny win the racing track with addition sums!', engine: 'math', config: { mode: 'race', type: 'add' } },
  { id: 'subtraction-race', category: 'learning', subgroup: 'Math & Formulas', name: 'Subtraction Challenge', emoji: '➖', desc: 'Zoom down the track by solving subtraction equations!', engine: 'math', config: { mode: 'race', type: 'sub' } },
  { id: 'multiplication-race', category: 'learning', subgroup: 'Math & Formulas', name: 'Multiplication Battle', emoji: '⚔️', desc: 'Challenge Bunny with fun multiplication questions!', engine: 'math', config: { mode: 'quiz', type: 'mul' } },
  { id: 'division-race', category: 'learning', subgroup: 'Math & Formulas', name: 'Division Puzzle', emoji: '➗', desc: 'Find correct division quotients to win gold stars!', engine: 'math', config: { mode: 'quiz', type: 'div' } },
  { id: 'math-bingo', category: 'learning', subgroup: 'Math & Formulas', name: 'Math Bingo', emoji: '🎰', desc: 'Pop matched numbers on your bingo card!', engine: 'gk', config: { topic: 'bingo' } },
  { id: 'fraction-pizza', category: 'learning', subgroup: 'Math & Formulas', name: 'Fraction Pizza Game', emoji: '🍕', desc: 'Decorate fractions of a delicious pizza!', engine: 'maker', config: { base: '🍕', items: ['🍄','🍅','🧀','🍍','🫑'], instruction: 'Slice and decorate fractions of the pizza!' } },
  { id: 'decimal-match', category: 'learning', subgroup: 'Math & Formulas', name: 'Decimal Matching Game', emoji: '📊', desc: 'Match fractions to their equivalent decimals!', engine: 'gk', config: { topic: 'decimal' } },
  
  { id: 'shape-id', category: 'learning', subgroup: 'Shapes & Colors', name: 'Shape Identification Game', emoji: '🔶', desc: 'Match geometric outlines with stars and diamonds!', engine: 'shapes', config: {} },
  { id: 'color-recognize', category: 'learning', subgroup: 'Shapes & Colors', name: 'Color Recognition Game', emoji: '🌈', desc: 'Pop balloon colors in this beautiful sky arena!', engine: 'counting', config: { mode: 'order', preset: 'colors' } },
  { id: 'pattern-match', category: 'learning', subgroup: 'Shapes & Colors', name: 'Pattern Matching Game', emoji: '🧩', desc: 'Repeat the colorful patterns of emoji blocks!', engine: 'memory', config: { theme: 'shapes' } },
  { id: 'time-clock', category: 'learning', subgroup: 'Shapes & Colors', name: 'Time Learning Clock Game', emoji: '⏰', desc: 'Set the hands of our magic clock to the target time!', engine: 'gk', config: { topic: 'clock' } },
  { id: 'money-count', category: 'learning', subgroup: 'Shapes & Colors', name: 'Money Counting Game', emoji: '🪙', desc: 'Add shiny coins together to purchase yummy toys!', engine: 'counting', config: { mode: 'sweets', preset: 'coins' } },
  { id: 'measure-quiz', category: 'learning', subgroup: 'Shapes & Colors', name: 'Measurement Quiz Game', emoji: '📏', desc: 'Compare sizes and lengths of funny animals!', engine: 'gk', config: { topic: 'measure' } },

  // ENGLISH ZONE
  { id: 'word-search', category: 'english', subgroup: 'Vocabulary', name: 'Word Search Game', emoji: '🔍', desc: 'Find hidden letters to form cute animal names!', engine: 'spelling', config: { word: 'CAT' } },
  { id: 'spelling-bee', category: 'english', subgroup: 'Vocabulary', name: 'Spelling Bee Challenge', emoji: '🐝', desc: 'Pop letter balloons in order to spell the words!', engine: 'spelling', config: {} },
  { id: 'opposite-match', category: 'english', subgroup: 'Vocabulary', name: 'Opposite Words Match', emoji: '↔️', desc: 'Connect hot-cold, big-small opposite word cards!', engine: 'gk', config: { topic: 'opposites' } },
  { id: 'synonym-finder', category: 'english', subgroup: 'Vocabulary', name: 'Synonym Finder Game', emoji: '📖', desc: 'Link word pairs that mean the exact same thing!', engine: 'gk', config: { topic: 'synonyms' } },
  { id: 'vocab-flashcards', category: 'english', subgroup: 'Vocabulary', name: 'Vocabulary Flashcards', emoji: '🎴', desc: 'Flip cards to learn beautiful new words!', engine: 'memory', config: { theme: 'emojis' } },
  { id: 'sentence-builder', category: 'english', subgroup: 'Grammar', name: 'Sentence Builder', emoji: '🧱', desc: 'Arrange word blocks to form sweet expressions!', engine: 'spelling', config: { sentence: true } },
  { id: 'grammar-quiz', category: 'english', subgroup: 'Grammar', name: 'Grammar Quiz Game', emoji: '📝', desc: 'Select correct nouns and verbs in the sentence!', engine: 'gk', config: { topic: 'grammar' } },
  { id: 'noun-verb', category: 'english', subgroup: 'Grammar', name: 'Noun vs Verb Game', emoji: '🏷️', desc: 'Sort words into action verbs or naming nouns!', engine: 'gk', config: { topic: 'nouns' } },
  { id: 'rhyme-words', category: 'english', subgroup: 'Grammar', name: 'Rhyming Words Challenge', emoji: '🎵', desc: 'Match words that sound identical at the end!', engine: 'spelling', config: { rhyme: true } },
  { id: 'crosswords', category: 'english', subgroup: 'Grammar', name: 'Crossword Puzzle for Kids', emoji: '🧩', desc: 'Fill in empty blocks to complete the letters grid!', engine: 'spelling', config: { crossword: true } },

  // MEMORY ZONE
  { id: 'animal-memory', category: 'memory', subgroup: 'Card Matches', name: 'Animal Memory Cards', emoji: '🦁', desc: 'Flip pairs of lions, tigers, and cute monkeys!', engine: 'memory', config: { theme: 'animals' } },
  { id: 'fruit-memory', category: 'memory', subgroup: 'Card Matches', name: 'Fruit Matching Game', emoji: '🍌', desc: 'Match bananas, apples, cherries, and berries!', engine: 'memory', config: { theme: 'fruits' } },
  { id: 'emoji-memory', category: 'memory', subgroup: 'Card Matches', name: 'Emoji Memory Game', emoji: '❤️', desc: 'Find twin smiley faces, hearts, and stars!', engine: 'memory', config: { theme: 'emojis' } },
  { id: 'toy-memory', category: 'memory', subgroup: 'Card Matches', name: 'Toy Matching Game', emoji: '🧸', desc: 'Match teddy bears, toy rockets, and sailboats!', engine: 'memory', config: { theme: 'toys' } },
  { id: 'shape-memory', category: 'memory', subgroup: 'Card Matches', name: 'Shape Memory Challenge', emoji: '🔺', desc: 'Pair circles, triangles, and golden hexagons!', engine: 'memory', config: { theme: 'shapes' } },
  { id: 'fast-flip', category: 'memory', subgroup: 'Recall Gym', name: 'Fast Flip Card Game', emoji: '⚡', desc: 'Tap duplicate cards before they flip back over!', engine: 'memory', config: { theme: 'animals', fast: true } },
  { id: 'pattern-recall', category: 'memory', subgroup: 'Recall Gym', name: 'Pattern Recall Game', emoji: '🧠', desc: 'Watch Mommy light up blocks and mimic the order!', engine: 'memory', config: { theme: 'emojis', simon: true } },
  { id: 'seq-memory', category: 'memory', subgroup: 'Recall Gym', name: 'Sequence Memory Game', emoji: '🔢', desc: 'Remember and click numbers in ascending order!', engine: 'counting', config: { mode: 'order' } },
  { id: 'iq-puzzle', category: 'memory', subgroup: 'Recall Gym', name: 'IQ Puzzle Challenge', emoji: '🧩', desc: 'Select which shape block fits next in the logic row!', engine: 'shapes', config: {} },
  { id: 'brain-mini', category: 'memory', subgroup: 'Recall Gym', name: 'Brain Mini Games', emoji: '💡', desc: 'Complete rapid memory puzzles to test your mind!', engine: 'memory', config: { theme: 'fruits' } },

  // PUZZLE ZONE
  { id: 'jigsaw-puzzle', category: 'puzzle', subgroup: 'Logic Arena', name: 'Jigsaw Puzzles', emoji: '🧩', desc: 'Drag pieces to build happy animal scenes!', engine: 'shapes', config: { jigsaw: true } },
  { id: 'maze-runner', category: 'puzzle', subgroup: 'Logic Arena', name: 'Maze Runner', emoji: '🌀', desc: 'Guide the explorer through a twisty labyrinth!', engine: 'adventure', config: { maze: true } },
  { id: 'tangrams', category: 'puzzle', subgroup: 'Logic Arena', name: 'Tangrams', emoji: '📐', desc: 'Arrange geometric puzzles to build silhouette animals!', engine: 'shapes', config: {} },
  { id: 'pipe-connect', category: 'puzzle', subgroup: 'Logic Arena', name: 'Pipe Connector', emoji: '🚰', desc: 'Rotate and link pipes to water the dry flower!', engine: 'adventure', config: { pipes: true } },
  { id: 'block-fit', category: 'puzzle', subgroup: 'Logic Arena', name: 'Block Fitting', emoji: '🧱', desc: 'Fit colorful blocks into a wooden grid outline!', engine: 'shapes', config: {} },
  { id: 'hidden-objects', category: 'puzzle', subgroup: 'Visual Puzzles', name: 'Hidden Objects', emoji: '🔍', desc: 'Find sneaky items hidden inside a colorful jungle!', engine: 'gk', config: { topic: 'hidden' } },
  { id: 'spot-diff', category: 'puzzle', subgroup: 'Visual Puzzles', name: 'Spot the Difference', emoji: '🔎', desc: 'Compare two illustrations and tap the differences!', engine: 'gk', config: { topic: 'diff' } },
  { id: 'kids-sudoku', category: 'puzzle', subgroup: 'Visual Puzzles', name: 'Kids Sudoku', emoji: '🔢', desc: 'Fill rows with distinct fruit stickers!', engine: 'counting', config: { mode: 'sweets' } },
  { id: 'logic-grids', category: 'puzzle', subgroup: 'Visual Puzzles', name: 'Logic Grids', emoji: '📊', desc: 'Solve matching puzzles to reveal animal clues!', engine: 'gk', config: { topic: 'logic' } },
  { id: 'escape-adv', category: 'puzzle', subgroup: 'Visual Puzzles', name: 'Escape Adventures', emoji: '🗝️', desc: 'Find keys in the room to unlock the candy chest!', engine: 'adventure', config: { escape: true } },

  // ART ZONE
  { id: 'animal-coloring', category: 'art', subgroup: 'Painting', name: 'Animal Coloring', emoji: '🦁', desc: 'Color sweet lions, cute pandas, and big elephants!', engine: 'paint', config: { template: 'cat' } },
  { id: 'cartoon-book', category: 'art', subgroup: 'Painting', name: 'Cartoon Book', emoji: '📖', desc: 'Fill cartoon outlines with beautiful rainbow chalks!', engine: 'paint', config: { template: 'star' } },
  { id: 'color-by-number', category: 'art', subgroup: 'Painting', name: 'Color by Number', emoji: '🎨', desc: 'Color numbered grids to reveal secret illustrations!', engine: 'paint', config: { template: 'heart' } },
  { id: 'magic-drawing', category: 'art', subgroup: 'Painting', name: 'Magic Drawing Pad', emoji: '✏️', desc: 'Draw whatever you want on our chalkboard canvas!', engine: 'paint', config: {} },
  { id: 'finger-painting', category: 'art', subgroup: 'Painting', name: 'Finger Painting', emoji: '🖌️', desc: 'Create beautiful finger traces with sound chimes!', engine: 'paint', config: {} },
  { id: 'dot-to-dot', category: 'art', subgroup: 'Crafts', name: 'Dot-to-Dot', emoji: '📍', desc: 'Connect shiny dots to reveal a secret outline!', engine: 'paint', config: { template: 'cloud' } },
  { id: 'pixel-art', category: 'art', subgroup: 'Crafts', name: 'Pixel Art', emoji: '👾', desc: 'Color blocks in grid cells to draw retro pixel art!', engine: 'paint', config: {} },
  { id: 'sand-art', category: 'art', subgroup: 'Crafts', name: 'Sand Art Simulator', emoji: '⏳', desc: 'Pour colorful layers of sand into a bottle shape!', engine: 'maker', config: { base: '🍼', items: ['🔴','🟡','🟢','🔵','🟣'], instruction: 'Pour layered colored sand!' } },
  { id: 'sticker-creator', category: 'art', subgroup: 'Crafts', name: 'Sticker Creator', emoji: '✨', desc: 'Design stickers and place them on beautiful backdrops!', engine: 'maker', config: { base: '🏞️', items: ['🦄','🌈','🍄','🌸','🍀'], instruction: 'Decorate the landscape with fairy tale stickers!' } },
  { id: 'greeting-cards', category: 'art', subgroup: 'Crafts', name: 'Greeting Cards', emoji: '✉️', desc: 'Add happy messages and decorations to present cards!', engine: 'maker', config: { base: '✉️', items: ['🎀','🎈','🎉','🎁','🧸'], instruction: 'Create a lovely birthday greeting card!' } },

  // ANIMAL ZONE
  { id: 'guess-sound', category: 'animal', subgroup: 'Wildlife', name: 'Guess the Sound', emoji: '🔊', desc: 'Listen to birds and jungle beasts and name them!', engine: 'animal-sounds', config: { mode: 'quiz' } },
  { id: 'feed-animal', category: 'animal', subgroup: 'Wildlife', name: 'Feed the Animal', emoji: '🍎', desc: 'Drag tasty bananas to monkeys and bones to puppies!', engine: 'animal-sounds', config: { mode: 'habitat' } },
  { id: 'pet-care', category: 'animal', subgroup: 'Wildlife', name: 'Pet Care', emoji: '🐱', desc: 'Groom, scrub, and feed a fluffy kitty or playful puppy!', engine: 'maker', config: { base: '🐱', items: ['🐟','🥩','🥛','🧶','🧼'], instruction: 'Feed and groom your cute kitty!' } },
  { id: 'zoo-manager', category: 'animal', subgroup: 'Wildlife', name: 'Zoo Manager', emoji: '🦒', desc: 'Design habitats and sort tigers, giraffes, and monkeys!', engine: 'maker', config: { base: '🌳', items: ['🦁','🐯','🐘','🦒','🐵'], instruction: 'Sort animals into your wild park!' } },
  { id: 'jungle-safari', category: 'animal', subgroup: 'Habitats', name: 'Jungle Safari', emoji: '🌴', desc: 'Explore the dense forest and spot sleeping cheetahs!', engine: 'adventure', config: {} },
  { id: 'dino-explorer', category: 'animal', subgroup: 'Habitats', name: 'Dino Explorer', emoji: '🦖', desc: 'Excavate dinosaur fossils and match ancient skeletons!', engine: 'gk', config: { topic: 'dinos' } },
  { id: 'aquarium-sim', category: 'animal', subgroup: 'Habitats', name: 'Aquarium Simulator', emoji: '🐠', desc: 'Build an aquarium and decorate it with colorful fish!', engine: 'maker', config: { base: '🫙', items: ['🐠','🐡','🐙','🦀','🌿'], instruction: 'Add fish and seaweed to your aquarium!' } },
  { id: 'bird-flight', category: 'animal', subgroup: 'Habitats', name: 'Bird Flight', emoji: '🐦', desc: 'Flap and guide a little bird past tall trees!', engine: 'adventure', config: {} },
  { id: 'farm-match', category: 'animal', subgroup: 'Habitats', name: 'Farm Match', emoji: '🚜', desc: 'Sort barnyard animals to their correct enclosures!', engine: 'animal-sounds', config: { mode: 'habitat' } },
  { id: 'wildlife-rescue', category: 'animal', subgroup: 'Habitats', name: 'Wildlife Rescue', emoji: '🏥', desc: 'Help bandage forest animals and nurture them to health!', engine: 'maker', config: { base: '🦊', items: ['🩹','🍼','🥕','🍎','❤️'], instruction: 'Nurture and bandage the injured fox!' } },

  // SCIENCE ZONE
  { id: 'solar-system', category: 'science', subgroup: 'Space', name: 'Solar System', emoji: '🪐', desc: 'Arrange revolving planets in their correct orbits!', engine: 'science', config: { type: 'space', actor: '🪐', buttons: ['☀️ Sun', '🌍 Earth', '🪐 Saturn'] } },
  { id: 'space-mission', category: 'science', subgroup: 'Space', name: 'Space Mission', emoji: '🚀', desc: 'Guide our rover on Mars to collect red rock crystals!', engine: 'adventure', config: {} },
  { id: 'rocket-builder', category: 'science', subgroup: 'Space', name: 'Rocket Builder', emoji: '🛠️', desc: 'Assemble rocket fins, engines, and capsules!', engine: 'maker', config: { base: '🏗️', items: ['🚀','🔥','🛰️','🔧','⚙️'], instruction: 'Build a giant space rocket!' } },
  { id: 'human-body', category: 'science', subgroup: 'Lab Simulators', name: 'Human Body', emoji: '🦴', desc: 'Arrange skull, ribs, and limb bones onto a skeleton!', engine: 'shapes', config: {} },
  { id: 'plant-growing', category: 'science', subgroup: 'Lab Simulators', name: 'Plant Growing', emoji: '🌱', desc: 'Pour water and shine sunshine to watch a sprout flower!', engine: 'science', config: { type: 'plant', actor: '🌱', buttons: ['🌧️ Rain', '☀️ Sun', '🐝 Bee'] } },
  { id: 'water-cycle', category: 'science', subgroup: 'Lab Simulators', name: 'Water Cycle', emoji: '💧', desc: 'Boil water and create clouds to trigger rainfall!', engine: 'science', config: { type: 'water', actor: '☁️', buttons: ['🔥 Heat', '❄️ Cool', '💨 Wind'] } },
  { id: 'magnet-science', category: 'science', subgroup: 'Lab Simulators', name: 'Magnet Science', emoji: '🧲', desc: 'Test magnets and attract iron clips and bolts!', engine: 'science', config: { type: 'magnet', actor: '🧲', buttons: ['📎 Clip', '🪵 Wood', '🪙 Coin'] } },
  { id: 'fossil-dig', category: 'science', subgroup: 'Lab Simulators', name: 'Fossil Dig', emoji: '🦴', desc: 'Brush away sand to uncover ancient dinosaur bones!', engine: 'paint', config: {} },
  { id: 'weather-match', category: 'science', subgroup: 'Lab Simulators', name: 'Weather Match', emoji: '☀️', desc: 'Match sunny, snowy, and rainy days to correct outfits!', engine: 'animal-sounds', config: { mode: 'habitat' } },
  { id: 'science-quizzes', category: 'science', subgroup: 'Lab Simulators', name: 'Science Quizzes', emoji: '🧪', desc: 'Test flags, magnets, and basic physics quizzes!', engine: 'gk', config: { topic: 'science' } },

  // COOKING ZONE
  { id: 'pizza-maker', category: 'cooking', subgroup: 'Kitchen', name: 'Pizza Maker', emoji: '🍕', desc: 'Layer sauce, cheese, pepperonis, and bake!', engine: 'maker', config: { base: '🍕', items: ['🍄','🍅','🧀','🍍','🫑','🥩'], instruction: 'Design your custom double cheese pizza!' } },
  { id: 'cake-decorator', category: 'cooking', subgroup: 'Kitchen', name: 'Cake Decorator', emoji: '🎂', desc: 'Add frostings, sprinkles, chocolate flakes, and candles!', engine: 'maker', config: { base: '🎂', items: ['🍓','🍒','🕯️','✨','🍫','🍬'], instruction: 'Decorate a sweet birthday cake!' } },
  { id: 'ice-cream', category: 'cooking', subgroup: 'Kitchen', name: 'Ice Cream Maker', emoji: '🍦', desc: 'Scoop vanilla, strawberry, chocolate, and toppings!', engine: 'maker', config: { base: '🍦', items: ['🍒','🍫','🍪','🍌','🍍','🍯'], instruction: 'Build a giant ice cream sundae!' } },
  { id: 'burger-builder', category: 'cooking', subgroup: 'Kitchen', name: 'Burger Builder', emoji: '🍔', desc: 'Stack beef patties, cheese, lettuce, and tomatoes!', engine: 'maker', config: { base: '🍞', items: ['🥩','🧀','🥬','🍅','🧅','🥓'], instruction: 'Stack a super delicious hamburger!' } },
  { id: 'candy-factory', category: 'cooking', subgroup: 'Kitchen', name: 'Candy Factory', emoji: '🍬', desc: 'Melt caramel, shape sweet drops, and add rainbow drops!', engine: 'maker', config: { base: '🍭', items: ['✨','🍫','🍬','🍇','🍓','🍊'], instruction: 'Create sweet custom lollipops!' } },
  { id: 'bakery-shop', category: 'cooking', subgroup: 'Kitchen', name: 'Bakery Shop', emoji: '🥐', desc: 'Bake sweet croissants, donuts, and fluffy rolls!', engine: 'maker', config: { base: '🍩', items: ['🧁','🍪','🍞','🧁','🍩','🍩'], instruction: 'Bake and decorate donuts!' } },
  { id: 'princess-dress', category: 'cooking', subgroup: 'Fashion', name: 'Princess Dress-Up', emoji: '👑', desc: 'Choose tiaras, sparkly ball gowns, and crystal slippers!', engine: 'maker', config: { base: '🧜‍♀️', items: ['👑','👗','👠','💎','🪄','💍'], instruction: 'Dress up the beautiful sea princess!' } },
  { id: 'superhero-creator', category: 'cooking', subgroup: 'Fashion', name: 'Superhero Creator', emoji: '🦸', desc: 'Equip masks, capes, lightning logos, and jetpacks!', engine: 'maker', config: { base: '🦸', items: ['🎭','🦹','⚡','🌟','🔥','🚀'], instruction: 'Design your own awesome superhero!' } },
  { id: 'fashion-designer', category: 'cooking', subgroup: 'Fashion', name: 'Fashion Designer', emoji: '👗', desc: 'Mix outfits, bags, and shoes on our runway model!', engine: 'maker', config: { base: '🧍‍♀️', items: ['👚','👖','👜','🕶️','🧣','👢'], instruction: 'Style the runway fashion outfits!' } },
  { id: 'hair-salon', category: 'cooking', subgroup: 'Fashion', name: 'Hair Salon', emoji: '💈', desc: 'Add colorful hair clips, bows, and spray rainbow colors!', engine: 'maker', config: { base: '👩', items: ['🎀','🌸','🦋','👒','🕶️','💈'], instruction: 'Design a lovely haircut style!' } },

  // ADVENTURE ZONE
  { id: 'treasure-hunt', category: 'adventure', subgroup: 'Quests', name: 'Treasure Hunt', emoji: '🏴‍☠️', desc: 'Uncover treasure chests hidden across grid islands!', engine: 'adventure', config: {} },
  { id: 'pirate-island', category: 'adventure', subgroup: 'Quests', name: 'Pirate Island', emoji: '🏝️', desc: 'Navigate a pirate ship past rock clusters to find land!', engine: 'adventure', config: {} },
  { id: 'ninja-runner', category: 'adventure', subgroup: 'Quests', name: 'Ninja Runner', emoji: '🥷', desc: 'Guide a sneaky ninja over high walls and muddy ditches!', engine: 'adventure', config: {} },
  { id: 'robot-rescue', category: 'adventure', subgroup: 'Quests', name: 'Robot Rescue', emoji: '🤖', desc: 'Program arrow steps to return a lost robot to its base!', engine: 'adventure', config: {} },
  { id: 'dragon-adv', category: 'adventure', subgroup: 'Quests', name: 'Dragon Adventure', emoji: '🐉', desc: 'Help a friendly baby dragon fly past floating clouds!', engine: 'adventure', config: {} },
  { id: 'deep-dive', category: 'adventure', subgroup: 'Quests', name: 'Deep Dive', emoji: '🤿', desc: 'Navigate submarine propellers to locate lost pearl clams!', engine: 'adventure', config: {} },
  { id: 'jungle-escape', category: 'adventure', subgroup: 'Quests', name: 'Jungle Escape', emoji: '🐒', desc: 'Guide our active little monkey to golden bananas!', engine: 'adventure', config: {} },
  { id: 'magic-castle', category: 'adventure', subgroup: 'Fairy Tales', name: 'Magic Castle', emoji: '🏰', desc: 'Explore a magical castle to find golden crowns!', engine: 'story', config: {} },
  { id: 'time-travel', category: 'adventure', subgroup: 'Fairy Tales', name: 'Time Travel', emoji: '⏳', desc: 'Travel to dino ages or futuristic robot cities in this tale!', engine: 'story', config: {} },
  { id: 'alien-rescue', category: 'adventure', subgroup: 'Fairy Tales', name: 'Alien Rescue', emoji: '👽', desc: 'Help a friendly alien return home in a branched space tale!', engine: 'story', config: {} }
];

// Particle Engine setup
let starCanvas = null;
let starCtx = null;
let activeParticles = [];

document.addEventListener('DOMContentLoaded', () => {
    initParticlesEngine();
    initSpeechVoice();
    
    // Register routing actions to go back to lobby
    routeTo('lobby');
});

// Switch visual cabinet routes (Portal routing)
function routeTo(zone) {
    activeZone = zone;
    
    // Select all sections
    const zones = ['lobby', 'alphabet', 'counting', 'math', 'memory', 'shapes', 'paint', 'spelling', 'animal-sounds', 'gk', 'adventure', 'story', 'maker', 'science'];
    
    zones.forEach(z => {
        const node = document.getElementById(`zone-${z}`);
        if (node) node.classList.add('hidden');
    });
    
    // Reveal current
    const activeNode = document.getElementById(`zone-${zone}`);
    if (activeNode) activeNode.classList.remove('hidden');
    
    // Dynamically update cabinet title if inside a game
    if (zone !== 'lobby' && currentActiveGame) {
        const titleEl = document.querySelector(`#zone-${zone} .cabinet-title`);
        if (titleEl) {
            titleEl.innerText = `${currentActiveGame.emoji} ${getLocalizedGameValue(currentActiveGame.id, 'name')}`;
        }
    }
    
    const tDict = KIDDY_TRANSLATIONS[currentLanguage] || KIDDY_TRANSLATIONS['en'];
    
    // Dynamic mascot welcome speeches
    let mascotSpeechText = "";
    if (zone === 'lobby') {
        mascotSpeechText = tDict.lobby_welcome;
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        renderLobbyGames();
    } else if (zone === 'alphabet') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "वर्णमाला क्षेत्र सुंदर अक्षरों से भरा हुआ है, मेरे बच्चे! आइए फोनिक्स ध्वनियों को पॉप करें, अक्षरों को उनके बादलों से मिलाएं, या अनुक्रम पूरा करें!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "எழுத்து உலகம் அழகான எழுத்துக்களால் நிறைந்துள்ளது, செல்லமே! வாருங்கள் எழுத்துக்களை மேகங்களுடன் பொருத்துவோம் அல்லது வரிசைகளைத் தீர்ப்போம்!";
        } else {
            mascotSpeechText = "Alphabet Land is full of wonderful letters, sweetheart! Let's pop some phonics sounds, match lowercase letters to their big clouds, or complete sequences together! You can do it!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initAlphabetGame();
    } else if (zone === 'counting') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "संख्याओं को गिनना बहुत मजेदार है, मेरे प्यारे! आइए स्वादिष्ट कपकेक गिनें या उन सुंदर गुब्बारों को क्रम से फोड़ें!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "எண்களை எண்ணுவது மிகவும் மகிழ்ச்சியானது, செல்லமே! வாருங்கள் சுவையான கப்கேக்குகளை எண்ணலாம் அல்லது பலூன்களை வரிசையாகப் பாப் செய்யலாம்!";
        } else {
            mascotSpeechText = "Numbers are so fun to count, my darling! Let's count some delicious cupcakes or pop those pretty balloons in order!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initCountingGame();
    } else if (zone === 'math') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "ज़ूम! आइए जोड़-घटाव के सवालों को हल करके खरगोश की दौड़ जीतने में मदद करें, या हमारी गणित प्रश्नोत्तरी खेलें!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "வாருங்கள் முயல் குட்டிக்கு பந்தயத்தில் வெற்றிபெற கூட்டல் கழித்தல் கணக்குகளைத் தீர்ப்போம், அல்லது கணித வினாடி வினா விளையாடுவோம்!";
        } else {
            mascotSpeechText = "Vroom! Let's help Robbie the Rabbit race down the addition track, or try our exciting Math Quiz Battle! I'm cheering for you, honey!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initMathGame();
    } else if (zone === 'memory') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "आइए कार्डों का मिलान करें, मेरे प्यारे! जुड़वां जानवरों, फलों या इमोजी को खोजने के लिए कार्डों को पलटें!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "வாருங்கள் நினைவக அட்டைகளைப் பொருத்துவோம், செல்லமே! ஒரே மாதிரியான விலங்குகள் மற்றும் பழங்களின் இணைகளைக் கண்டறிய அட்டைகளைத் திருப்புங்கள்!";
        } else {
            mascotSpeechText = "Let's match some cute cards, sweetheart! Flip them over to find identical animals, fruits, or emojis! This is great for your bright mind!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initMemoryGame();
    } else if (zone === 'shapes') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "इन सुंदर आकृतियों को देखें, मेरे प्यारे बच्चे! चमकदार ब्लॉकों को उनके मिलान वाले स्लॉट में खींचें!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "இந்த அழகான வடிவங்களைப் பார், என் செல்லமே! வண்ண வடிவங்களை அவற்றின் சரியான எல்லைகளில் பொருத்துவோம்!";
        } else {
            mascotSpeechText = "Look at these lovely shapes, darling! Drag the glowing blocks into their matching outline containers. Let's see them fit together!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initShapesGame();
    } else if (zone === 'paint') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "एक सुंदर उत्कृष्ट कृति पेंट करने का समय आ गया है, मेरे छोटे कलाकार! आइए रंग चुनें और सुंदर चित्र बनाएं!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "அழகான ஓவியங்களை வரைய இதுவே நேரம், என் குட்டி ஓவியனே! வண்ணம் தீட்டி மந்திரத்தை உருவாக்குவோம்!";
        } else {
            mascotSpeechText = "Time to paint a beautiful masterpiece, my little artist! Pick bubble colors, use the cute caterpillar slider to change sizes, and let's save your gorgeous artwork!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initMagicCanvas();
    } else if (zone === 'spelling') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "बज़! आइए एक साथ सुंदर शब्दों की स्पेलिंग बनाएं, मेरे प्यारे! अक्षरों को सुलझाकर सही शब्द बनाएं!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "வாருங்கள் எழுத்துக்களை வரிசைப்படுத்தி சொற்களை உருவாக்குவோம், செல்லமே! நீ மிகவும் புத்திசாலி!";
        } else {
            mascotSpeechText = "Bzzz! Let's spell some fun words together, darling! Unscramble the letters to match the target emoji! You are so smart!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initSpellingGame();
    } else if (zone === 'animal-sounds') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "दहाड़! जंगली जानवर बहुत अद्भुत हैं, मेरे बच्चे! आइए उनकी आवाज़ सुनें और पहचानें, या उन्हें उनके घर पहुंचाएं!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "விலங்குகளின் குரல்களைக் கேட்டுப் பெயரிடுவோம், செல்லமே! அல்லது விலங்குகளை அவற்றின் இருப்பிடத்தில் வகைப்படுத்துவோம்!";
        } else {
            mascotSpeechText = "Roar! Wild animals are so amazing, sweetheart! Let's listen to their sounds and guess who is calling, or help sort them to their happy habitats!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initAnimalGame();
    } else if (zone === 'gk') {
        // Let's set a localized mascot greeting that matches the game topic
        const topic = (currentActiveGame && currentActiveGame.config && currentActiveGame.config.topic) ? currentActiveGame.config.topic : 'default';
        if (currentLanguage === 'hi') {
            if (topic === 'synonyms') {
                mascotSpeechText = "आइए पर्यायवाची शब्द खोजें, मेरे प्यारे बच्चे! वे शब्द जिनका अर्थ बिल्कुल एक समान होता है!";
            } else if (topic === 'opposites') {
                mascotSpeechText = "आइए विपरीत शब्द सीखें, प्यारे बच्चे! जैसे गर्म और ठंडा!";
            } else if (topic === 'decimal') {
                mascotSpeechText = "आइए भिन्न और दशमलव सीखें, मेरे बच्चे! संख्याएं कितनी जादुई हैं!";
            } else if (topic === 'clock') {
                mascotSpeechText = "आइए घड़ी देखना सीखें, मेरे प्यारे बच्चे! समय बहुत मूल्यवान है!";
            } else if (topic === 'measure') {
                mascotSpeechText = "आइए माप और आकार की तुलना करें, मेरे प्यारे बच्चे!";
            } else if (topic === 'grammar') {
                mascotSpeechText = "आइए व्याकरण सीखें, मेरे बच्चे! सही वाक्य बनाना बहुत आसान है!";
            } else if (topic === 'nouns') {
                mascotSpeechText = "आइए संज्ञा और क्रिया का खेल खेलें, प्यारे बच्चे!";
            } else if (topic === 'hidden') {
                mascotSpeechText = "छिपी हुई वस्तुएँ खोजें, मेरे प्यारे बच्चे! अपनी आँखें खुली रखें!";
            } else if (topic === 'diff') {
                mascotSpeechText = "आइए अलग इमोजी खोजें, मेरे प्यारे बच्चे! क्या आप अंतर देख सकते हैं?";
            } else if (topic === 'logic') {
                mascotSpeechText = "आइए तर्क और पैटर्न पहेली हल करें, मेरे प्यारे बच्चे!";
            } else if (topic === 'dinos') {
                mascotSpeechText = "आइए अद्भुत डायनासोरों के बारे में जानें, प्यारे बच्चे!";
            } else if (topic === 'science') {
                mascotSpeechText = "आइए विज्ञान के बारे में जानें, प्यारे बच्चे! हमारी दुनिया कितनी अद्भुत है!";
            } else {
                mascotSpeechText = "किडीक्वेस्ट सामान्य ज्ञान में आपका स्वागत है, मेरे बच्चे! आइए सवालों के जवाब दें!";
            }
        } else if (currentLanguage === 'ta') {
            if (topic === 'synonyms') {
                mascotSpeechText = "ஒரே பொருள் தரும் சொற்களைக் கண்டுபிடிப்போம், என் செல்லமே! சொற்களின் பொருள் எவ்வளவு சுவாரஸ்யமானது!";
            } else if (topic === 'opposites') {
                mascotSpeechText = "எதிர்ச்சொற்களைக் கற்றுக்கொள்வோம், செல்லமே! சூடு மற்றும் குளிர்ச்சி போல!";
            } else if (topic === 'decimal') {
                mascotSpeechText = "பின்னங்கள் மற்றும் தசமங்களை ஆராய்வோம், செல்லமே!";
            } else if (topic === 'clock') {
                mascotSpeechText = "நேரத்தை அறிய கடிகார முட்களை அமைப்போம், செல்லமே! நேரம் பொன் போன்றது!";
            } else if (topic === 'measure') {
                mascotSpeechText = "அளவீடுகள் மற்றும் அளவுகளை ஒப்பிட்டுப் பார்ப்போம், செல்லமே!";
            } else if (topic === 'grammar') {
                mascotSpeechText = "இலக்கணத்தைக் கற்றுக்கொள்வோம், செல்லமே! வாக்கியங்களைச் சரியாக அமைப்போம்!";
            } else if (topic === 'nouns') {
                mascotSpeechText = "பெயர்ச்சொற்கள் மற்றும் வினைச்சொற்களை வகைப்படுத்துவோம், செல்லமே!";
            } else if (topic === 'hidden') {
                mascotSpeechText = "மறைந்திருக்கும் பொருட்களைக் கண்டுபிடிப்போம், என் குட்டி ஆராய்ச்சியாளரே!";
            } else if (topic === 'diff') {
                mascotSpeechText = "வேறுபட்ட உருவத்தைக் கண்டுபிடிப்போம், செல்லமே! உன்னால் வேறுபாட்டை அறிய முடிகிறதா?";
            } else if (topic === 'logic') {
                mascotSpeechText = "தர்க்கப் புதிர்களைத் தீர்ப்போம், செல்லமே!";
            } else if (topic === 'dinos') {
                mascotSpeechText = "பண்டைய டைனோசர்களைப் பற்றி அறிவோம், செல்லமே!";
            } else if (topic === 'science') {
                mascotSpeechText = "அறிவியல் வினாக்களைத் தீர்ப்போம், செல்லமே! உலகம் மிகவும் ஆச்சரியமானது!";
            } else {
                mascotSpeechText = "கிடிகுவெஸ்ட் பொது அறிவு வினாடி வினாவிற்கு வரவேற்கிறோம், செல்லமே!";
            }
        } else {
            if (topic === 'synonyms') {
                mascotSpeechText = "Let's find the matching synonyms, sweetheart! Words that mean the exact same thing!";
            } else if (topic === 'opposites') {
                mascotSpeechText = "Let's learn opposite words, sweetheart! Like hot and cold, big and small!";
            } else if (topic === 'decimal') {
                mascotSpeechText = "Let's explore fractions and decimals, honey! Numbers are so magical!";
            } else if (topic === 'clock') {
                mascotSpeechText = "Let's learn how to tell time, my darling! Setting the clock is super fun!";
            } else if (topic === 'measure') {
                mascotSpeechText = "Let's compare sizes and measurements, sweetheart!";
            } else if (topic === 'grammar') {
                mascotSpeechText = "Let's learn grammar, honey! Choosing the right word makes perfect sentences!";
            } else if (topic === 'nouns') {
                mascotSpeechText = "Let's sort naming nouns and action verbs, darling!";
            } else if (topic === 'hidden') {
                mascotSpeechText = "Let's find the hidden objects, sweetheart! Keep your eyes wide open!";
            } else if (topic === 'diff') {
                mascotSpeechText = "Let's spot the odd one out, my darling! Can you find the difference?";
            } else if (topic === 'logic') {
                mascotSpeechText = "Let's solve logic grids and pattern sequences, sweetheart!";
            } else if (topic === 'dinos') {
                mascotSpeechText = "Let's excavate ancient dinosaurs, sweetheart! Roar!";
            } else if (topic === 'science') {
                mascotSpeechText = "Let's test our science knowledge, honey! The world is full of wonder!";
            } else {
                mascotSpeechText = "Welcome to our Space GK Quiz! Let's answer questions about planets, flags, and the human body!";
            }
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initGKGame();
    } else if (zone === 'adventure') {
        const gameId = currentActiveGame ? currentActiveGame.id : 'default';
        if (currentLanguage === 'hi') {
            if (gameId === 'space-mission') {
                mascotSpeechText = "आइए अंतरिक्ष मिशन पर चलें, प्यारे बच्चे! चट्टानों से बचकर सुंदर क्रिस्टल पत्थर एकत्र करें!";
            } else if (gameId === 'pirate-island') {
                mascotSpeechText = "आइए समुद्री डाकू द्वीप खोजें, मेरे बच्चे! लहरों से बचकर खजाना द्वीप तक पहुँचें!";
            } else if (gameId === 'ninja-runner') {
                mascotSpeechText = "आइए निंजो की तरह दौड़ें, प्यारे बच्चे! बाधाओं से बचकर स्वर्ण सिक्का प्राप्त करें!";
            } else if (gameId === 'robot-rescue') {
                mascotSpeechText = "रोबोट का मार्ग निर्देशन करें, मेरे प्यारे बच्चे! उसे बैटरी चार्जिंग बेस तक पहुंचाएं!";
            } else {
                mascotSpeechText = "साहसिक मार्ग पर आपका स्वागत है, प्यारे बच्चे! खरगोश को गाजर तक ले जाएं!";
            }
        } else if (currentLanguage === 'ta') {
            if (gameId === 'space-mission') {
                mascotSpeechText = "விண்வெளிப் பயணம் செய்வோம், செல்லமே! விண்கற்களைத் தவிர்த்து விண்வெளிப் படிகங்களைச் சேகரிப்போம்!";
            } else if (gameId === 'pirate-island') {
                mascotSpeechText = "கொள்ளையர் தீவைத் தேடுவோம், செல்லமே! பாறைகளைத் தவிர்த்துக் கப்பலைச் செலுத்துவோம்!";
            } else if (gameId === 'ninja-runner') {
                mascotSpeechText = "நிஞ்சா போல ஓடுவோம், செல்லமே! பள்ளங்களைத் தவிர்த்துத் தங்க நாணயத்தை வெல்வோம்!";
            } else if (gameId === 'robot-rescue') {
                mascotSpeechText = "ரோபோவை வழிநடத்துவோம், செல்லமே! அதைத் தனது தளத்திற்குக் கொண்டு சேர்ப்போம்!";
            } else {
                mascotSpeechText = "ாகசப் பாதையில் உங்களை வரவேற்கிறேன், செல்லமே! முயலை கேரட்டிற்கு வழிநடத்துவோம்!";
            }
        } else {
            if (gameId === 'space-mission') {
                mascotSpeechText = "Let's launch into our Mars Space Mission, sweetheart! Guide the rover to collect Martian crystals!";
            } else if (gameId === 'pirate-island') {
                mascotSpeechText = "Ahoy! Let's navigate past sea whirlpools to find the pirate treasure island, darling!";
            } else if (gameId === 'ninja-runner') {
                mascotSpeechText = "Hi-ya! Let's guide our little ninja over walls and pits to secure the golden coin, sweetheart!";
            } else if (gameId === 'robot-rescue') {
                mascotSpeechText = "Beep boop! Help program the arrow steps to rescue our lost little robot, darling!";
            } else {
                mascotSpeechText = "Hop along, sweetheart! Guide our cute bunny across the jungle grid using the arrows to find sweet golden carrots!";
            }
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initAdventureGame();
    } else if (zone === 'story') {
        if (currentLanguage === 'hi') {
            mascotSpeechText = "एक बार की बात है... 🔮 आइए एक साथ जादुई परी कथा पढ़ें, मेरे प्यारे! आप अपनी कहानी का रास्ता चुन सकते हैं!";
        } else if (currentLanguage === 'ta') {
            mascotSpeechText = "முன்னொரு காலத்தில்... 🔮 வா செல்லமே, ஒரு அழகான மந்திரக் கதையைப் படிப்போம்! நீயே கதையின் பாதையைத் தீர்மானிக்கலாம்!";
        } else {
            mascotSpeechText = "Once upon a time... 🔮 Let's read a magical fairytale together, sweetheart! You get to choose the path and decide the happy ending! Let's begin our story!";
        }
        setMascotState("🐻❤️", tDict.mascot_name, mascotSpeechText);
        initStoryGame();
    }
}

function setMascotState(emoji, name, speech) {
    const mascotNode = document.getElementById('mascot-node');
    const nameTag = document.getElementById('mascot-name-tag');
    const textNode = document.getElementById('mascot-speech-text');
    
    if (mascotNode) mascotNode.innerText = emoji;
    if (nameTag) nameTag.innerText = name;
    if (textNode) textNode.innerText = speech;
    speakSpeech(speech);
}

// Award Stars Scoring System
function awardStars(count) {
    scoreStars += count;
    document.getElementById('score-val').innerText = scoreStars;
    
    // Level Up triggers
    const newLvl = Math.floor(scoreStars / 10) + 1;
    if (newLvl > explorerLevel) {
        explorerLevel = newLvl;
        document.getElementById('level-val').innerText = explorerLevel;
        triggerLevelUpParticles();
    }
}

/* ============================================================
   AUDIO OSCILLATORS SYNTHESIZERS (Real-time Synthesis)
   ============================================================ */
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playBuzzerWrong() {
    initAudio();
    if (!audioCtx) return;
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.linearRampToValueAtTime(80, time + 0.35);
    
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.35);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.35);
}

function playCorrectChime() {
    initAudio();
    if (!audioCtx) return;
    const time = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggios
    
    notes.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, time + (i * 0.08));
        gain.gain.setValueAtTime(0.01, time + (i * 0.08));
        gain.gain.linearRampToValueAtTime(0.1, time + (i * 0.08) + 0.04);
        gain.gain.linearRampToValueAtTime(0.01, time + (i * 0.08) + 0.2);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time + (i * 0.08));
        osc.stop(time + (i * 0.08) + 0.2);
    });
}

function playPopSound() {
    initAudio();
    if (!audioCtx) return;
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(850, time + 0.04);
    osc.frequency.exponentialRampToValueAtTime(15, time + 0.12);
    
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.12);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.12);
}

function playRaceBoost() {
    initAudio();
    if (!audioCtx) return;
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, time);
    osc.frequency.exponentialRampToValueAtTime(600, time + 0.3);
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.3);
}

function playFlipSound() {
    initAudio();
    if (!audioCtx) return;
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, time);
    osc.frequency.exponentialRampToValueAtTime(500, time + 0.1);
    
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
}

function playSynthGrowl() {
    initAudio(); if (!audioCtx) return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.7);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.7);
}

function playSynthChirp() {
    initAudio(); if (!audioCtx) return;
    for(let i=0; i<3; i++) {
        const t = audioCtx.currentTime + (i * 0.15);
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(2400, t + 0.1);
        gain.gain.setValueAtTime(0.08, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.1);
    }
}

function playSynthCroak() {
    initAudio(); if (!audioCtx) return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(90, audioCtx.currentTime);
    const mod = audioCtx.createOscillator(); const modGain = audioCtx.createGain();
    mod.frequency.value = 16; modGain.gain.value = 20;
    mod.connect(modGain); modGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc.connect(gain); gain.connect(audioCtx.destination); mod.start(); osc.start(); mod.stop(audioCtx.currentTime + 0.25); osc.stop(audioCtx.currentTime + 0.25);
}

/* ============================================================
   1. ALPHABET LEARNING ZONE
   ============================================================ */
let activeAlphaSub = 'phonics';
let targetSpokenLetter = 'A';
const alphabetPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function switchAlphabetSubGame(gameMode) {
    activeAlphaSub = gameMode;
    const subGames = ['phonics', 'matching', 'sequence'];
    
    subGames.forEach(s => {
        const element = document.getElementById(`alpha-${s}-game`);
        const tabBtn = document.getElementById(`btn-tab-alpha-${s}`);
        
        if (element) element.classList.add('hidden');
        if (tabBtn) tabBtn.classList.remove('active');
    });
    
    const activeEl = document.getElementById(`alpha-${gameMode}-game`);
    const activeTab = document.getElementById(`btn-tab-alpha-${gameMode}`);
    if (activeEl) activeEl.classList.remove('hidden');
    if (activeTab) activeTab.classList.add('active');
    
    initAlphabetGame();
}

function initAlphabetGame() {
    if (activeAlphaSub === 'phonics') {
        generatePhonicsRound();
    } else if (activeAlphaSub === 'matching') {
        generateMatchingRound();
    } else if (activeAlphaSub === 'sequence') {
        generateSequenceRound();
    }
}

function generatePhonicsRound() {
    // Select a random letter
    targetSpokenLetter = alphabetPool[Math.floor(Math.random() * alphabetPool.length)];
    
    // Build letters options
    const options = [targetSpokenLetter];
    while (options.length < 5) {
        const rLetter = alphabetPool[Math.floor(Math.random() * alphabetPool.length)];
        if (!options.includes(rLetter)) options.push(rLetter);
    }
    options.sort(() => Math.random() - 0.5);
    
    // Speak letter out loud instantly
    setTimeout(() => { replaySpokenLetter(); }, 300);
    
    // Render bubbles
    const container = document.getElementById('alpha-bubble-choices');
    container.innerHTML = '';
    
    options.forEach(letter => {
        const bubble = document.createElement('div');
        bubble.className = 'choice-bubble';
        bubble.innerText = letter;
        bubble.onclick = () => validatePhonicsChoice(letter, bubble);
        container.appendChild(bubble);
    });
}

function replaySpokenLetter() {
    speakSpeech(`Where is the letter ${targetSpokenLetter}?`);
}

function validatePhonicsChoice(chosen, element) {
    if (chosen === targetSpokenLetter) {
        playPopSound();
        playCorrectChime();
        element.style.background = 'var(--green-light)';
        element.style.borderColor = 'var(--green-main)';
        spawnClickConfetti(element);
        awardStars(1);
        setMascotSpeechBubble("koala", `Hurray! You found the letter ${targetSpokenLetter}! ⭐`);
        setTimeout(() => { generatePhonicsRound(); }, 1400);
    } else {
        playBuzzerWrong();
        element.classList.add('shake-bubble');
        setTimeout(() => { element.classList.remove('shake-bubble'); }, 400);
        setMascotSpeechBubble("koala", `Oops! Almost. Listen again and find the letter ${targetSpokenLetter}!`);
    }
}

// SubGame 2: Case Matching drag/drop
let caseMatchingPairs = [];
function generateMatchingRound() {
    const cloudsContainer = document.getElementById('uppercase-clouds');
    const bubblesContainer = document.getElementById('lowercase-bubbles');
    
    cloudsContainer.innerHTML = '';
    bubblesContainer.innerHTML = '';
    
    // Select 3 random letters
    const selectLetters = [];
    while (selectLetters.length < 3) {
        const l = alphabetPool[Math.floor(Math.random() * alphabetPool.length)];
        if (!selectLetters.includes(l)) selectLetters.push(l);
    }
    
    // Build targets clouds (Uppercase)
    selectLetters.forEach(letter => {
        const cloud = document.createElement('div');
        cloud.className = 'case-cloud';
        cloud.id = `cloud-${letter}`;
        cloud.innerText = letter;
        cloud.ondragover = allowDrop;
        cloud.ondrop = (e) => dropCaseMatch(e, letter, cloud);
        
        // Tap alternative support for mobiles
        cloud.onclick = () => tapTargetCase(letter, cloud);
        
        cloudsContainer.appendChild(cloud);
    });
    
    // Build source bubbles (Lowercase)
    const lowerLetters = [...selectLetters].sort(() => Math.random() - 0.5);
    lowerLetters.forEach(letter => {
        const bubble = document.createElement('div');
        bubble.className = 'case-bubble';
        bubble.draggable = true;
        bubble.id = `bubble-${letter}`;
        bubble.innerText = letter.toLowerCase();
        bubble.ondragstart = (e) => {
            e.dataTransfer.setData('text', letter);
        };
        
        // Tap alternative
        bubble.onclick = () => tapSelectCase(letter, bubble);
        
        bubblesContainer.appendChild(bubble);
    });
}

let activeSelectedBubbleLetter = null;
let activeSelectedBubbleNode = null;

function tapSelectCase(letter, node) {
    // Reset former selection
    const allBubbles = document.querySelectorAll('.case-bubble');
    allBubbles.forEach(b => b.style.transform = 'none');
    
    activeSelectedBubbleLetter = letter;
    activeSelectedBubbleNode = node;
    node.style.transform = 'scale(1.2) translateY(-4px)';
    playFlipSound();
}

function tapTargetCase(letter, node) {
    if (activeSelectedBubbleLetter && activeSelectedBubbleLetter === letter) {
        // Correct snap!
        snapMatchedCase(letter, node, activeSelectedBubbleNode);
        activeSelectedBubbleLetter = null;
        activeSelectedBubbleNode = null;
    } else if (activeSelectedBubbleLetter) {
        // Wrong match
        playBuzzerWrong();
        node.classList.add('shake-bubble');
        setTimeout(() => { node.classList.remove('shake-bubble'); }, 400);
    }
}

function dropCaseMatch(e, letter, cloud) {
    e.preventDefault();
    const draggedLetter = e.dataTransfer.getData('text');
    const draggedNode = document.getElementById(`bubble-${draggedLetter}`);
    
    if (draggedLetter === letter) {
        snapMatchedCase(letter, cloud, draggedNode);
    } else {
        playBuzzerWrong();
        cloud.classList.add('shake-bubble');
        setTimeout(() => { cloud.classList.remove('shake-bubble'); }, 400);
    }
}

function snapMatchedCase(letter, cloud, bubbleNode) {
    playPopSound();
    playCorrectChime();
    cloud.style.background = 'var(--green-light)';
    cloud.style.borderColor = 'var(--green-main)';
    cloud.innerText = letter + letter.toLowerCase(); // Show both case
    
    if (bubbleNode && bubbleNode.parentNode) {
        bubbleNode.parentNode.removeChild(bubbleNode);
    }
    
    awardStars(1);
    spawnClickConfetti(cloud);
    
    const count = document.getElementById('lowercase-bubbles').childElementCount;
    if (count === 0) {
        setTimeout(() => {
            triggerGameOver(3);
        }, 1500);
    }
}

// SubGame 3: Sequence Puzzle
let targetSequenceLetter = 'C';
function generateSequenceRound() {
    const seqIdx = Math.floor(Math.random() * (alphabetPool.length - 4));
    
    const letter0 = alphabetPool[seqIdx];
    const letter1 = alphabetPool[seqIdx + 1];
    targetSequenceLetter = alphabetPool[seqIdx + 2];
    const letter3 = alphabetPool[seqIdx + 3];
    
    document.getElementById('seq-b0').innerText = letter0;
    document.getElementById('seq-b1').innerText = letter1;
    document.getElementById('seq-b3').innerText = letter3;
    
    // Reset slot
    const slot = document.getElementById('seq-slot');
    slot.innerText = '?';
    slot.style.background = 'var(--amber-light)';
    slot.style.borderColor = 'var(--amber-main)';
    
    // Generate choice tiles
    const choices = [targetSequenceLetter];
    while(choices.length < 4) {
        const choice = alphabetPool[Math.floor(Math.random() * alphabetPool.length)];
        if (!choices.includes(choice) && choice !== letter0 && choice !== letter1 && choice !== letter3) {
            choices.push(choice);
        }
    }
    choices.sort(() => Math.random() - 0.5);
    
    const choicesGrid = document.getElementById('seq-choices-grid');
    choicesGrid.innerHTML = '';
    
    choices.forEach(l => {
        const item = document.createElement('div');
        item.className = 'seq-drag-item';
        item.innerText = l;
        item.draggable = true;
        item.id = `seq-item-${l}`;
        item.ondragstart = (e) => {
            e.dataTransfer.setData('text', l);
        };
        
        // Tap alternative
        item.onclick = () => {
            if (l === targetSequenceLetter) {
                snapLetterSequence(item);
            } else {
                playBuzzerWrong();
                item.classList.add('shake-bubble');
                setTimeout(() => { item.classList.remove('shake-bubble'); }, 400);
            }
        };
        
        choicesGrid.appendChild(item);
    });
}

function dropLetterSequence(e) {
    e.preventDefault();
    const l = e.dataTransfer.getData('text');
    const draggedNode = document.getElementById(`seq-item-${l}`);
    
    if (l === targetSequenceLetter) {
        snapLetterSequence(draggedNode);
    } else {
        playBuzzerWrong();
        const slot = document.getElementById('seq-slot');
        slot.classList.add('shake-bubble');
        setTimeout(() => { slot.classList.remove('shake-bubble'); }, 400);
    }
}

function snapLetterSequence(draggedNode) {
    playPopSound();
    playCorrectChime();
    
    const slot = document.getElementById('seq-slot');
    slot.innerText = targetSequenceLetter;
    slot.style.background = 'var(--green-light)';
    slot.style.borderColor = 'var(--green-main)';
    
    if (draggedNode && draggedNode.parentNode) {
        draggedNode.parentNode.removeChild(draggedNode);
    }
    
    spawnClickConfetti(slot);
    setTimeout(() => {
        triggerGameOver(2);
    }, 1500);
}

/* ============================================================
   2. NUMBER & COUNTING ZONE
   ============================================================ */
let activeCountingSub = 'sweets';
let targetCountingSweetsNum = 5;

function switchCountingSubGame(mode) {
    activeCountingSub = mode;
    const subGames = ['sweets', 'order'];
    
    subGames.forEach(s => {
        const el = document.getElementById(`count-${s}-game`);
        const tab = document.getElementById(`btn-tab-count-${s}`);
        if (el) el.classList.add('hidden');
        if (tab) tab.classList.remove('active');
    });
    
    const activeEl = document.getElementById(`count-${mode}-game`);
    const activeTab = document.getElementById(`btn-tab-count-${mode}`);
    if (activeEl) activeEl.classList.remove('hidden');
    if (activeTab) activeTab.classList.add('active');
    
    initCountingGame();
}

let countingSweetsMode = 'normal'; // 'normal', 'missing', 'coins'
let countingBalloonPreset = 'numbers'; // 'numbers', 'letters', 'colors'
let countingExpectedBalloonColorName = '';

function initCountingGame() {
    const config = (currentActiveGame && currentActiveGame.config) ? currentActiveGame.config : {};
    
    // Wire subgame modes based on config variables
    if (activeCountingSub === 'sweets') {
        if (config.missing) countingSweetsMode = 'missing';
        else if (config.preset === 'coins') countingSweetsMode = 'coins';
        else countingSweetsMode = 'normal';
        generateCountingSweetsRound();
    } else if (activeCountingSub === 'order') {
        if (config.preset === 'letters') countingBalloonPreset = 'letters';
        else if (config.preset === 'colors') countingBalloonPreset = 'colors';
        else countingBalloonPreset = 'numbers';
        generateBalloonOrderRound();
    }
}

function generateCountingSweetsRound() {
    const displayGrid = document.getElementById('sweets-display-grid');
    const answersContainer = document.getElementById('sweets-answer-bubbles');
    const banner = document.querySelector('#zone-counting .instruction-banner');
    
    displayGrid.innerHTML = '';
    answersContainer.innerHTML = '';
    
    if (countingSweetsMode === 'missing') {
        if (banner) banner.innerText = "Complete the sequence! Choose the missing number bubble!";
        
        // Sequence generator
        const start = Math.floor(Math.random() * 5) + 1;
        const step = Math.random() < 0.5 ? 1 : 2;
        const seq = [start, start + step, start + 2 * step, start + 3 * step];
        const missingIdx = Math.floor(Math.random() * 4);
        
        targetCountingSweetsNum = seq[missingIdx];
        
        // Speak sequence
        const spokenSeq = seq.map((val, idx) => idx === missingIdx ? "question mark" : val).join(", ");
        speakSpeech(`What is the missing number in: ${spokenSeq}?`);
        
        for (let i = 0; i < 4; i++) {
            const span = document.createElement('span');
            span.style.padding = '12px 20px';
            span.style.border = '3px solid var(--grey-900)';
            span.style.borderRadius = '14px';
            span.style.fontFamily = 'var(--font-kids)';
            span.style.fontWeight = '700';
            span.style.fontSize = '24px';
            
            if (i === missingIdx) {
                span.innerText = '?';
                span.style.background = 'var(--amber-light)';
                span.style.borderColor = 'var(--amber-main)';
                span.style.color = 'var(--amber-dark)';
            } else {
                span.innerText = seq[i];
                span.style.background = 'var(--white)';
            }
            displayGrid.appendChild(span);
        }
        
        // Choices
        const options = [targetCountingSweetsNum];
        while(options.length < 4) {
            const distractingVal = Math.floor(Math.random() * 12) + 1;
            if (!options.includes(distractingVal)) options.push(distractingVal);
        }
        options.sort(() => Math.random() - 0.5);
        
        options.forEach(num => {
            const bubble = document.createElement('button');
            bubble.className = 'num-bubble-btn';
            bubble.innerText = num;
            bubble.onclick = () => validateSweetsCount(num, bubble);
            answersContainer.appendChild(bubble);
        });
    }
    else if (countingSweetsMode === 'coins') {
        targetCountingSweetsNum = Math.floor(Math.random() * 7) + 2; // 2 to 8 coins
        if (banner) banner.innerText = "Count the gold coins to buy a toy in Mommy Bear's shop! 🪙";
        
        speakSpeech("Count the shiny gold coins!");
        
        for (let i = 0; i < targetCountingSweetsNum; i++) {
            const item = document.createElement('span');
            item.className = 'bouncy-sweet';
            item.innerText = '🪙';
            displayGrid.appendChild(item);
        }
        
        const options = [targetCountingSweetsNum];
        while(options.length < 4) {
            const distractingVal = Math.floor(Math.random() * 9) + 1;
            if (!options.includes(distractingVal)) options.push(distractingVal);
        }
        options.sort(() => Math.random() - 0.5);
        
        options.forEach(num => {
            const bubble = document.createElement('button');
            bubble.className = 'num-bubble-btn';
            bubble.innerText = num;
            bubble.onclick = () => validateSweetsCount(num, bubble);
            answersContainer.appendChild(bubble);
        });
    }
    else {
        // Normal sweets count
        targetCountingSweetsNum = Math.floor(Math.random() * 8) + 1;
        const sweetsEmojis = ['🧁', '🍩', '🍪', '🍬', '🍭', '🍓'];
        const emojiSelected = sweetsEmojis[Math.floor(Math.random() * sweetsEmojis.length)];
        
        if (banner) banner.innerText = "Count the delicious sweets, then click the correct numbers!";
        
        speakSpeech("Count the yummy sweets!");
        
        for (let i = 0; i < targetCountingSweetsNum; i++) {
            const item = document.createElement('span');
            item.className = 'bouncy-sweet';
            item.innerText = emojiSelected;
            displayGrid.appendChild(item);
        }
        
        const options = [targetCountingSweetsNum];
        while(options.length < 4) {
            const distractingVal = Math.floor(Math.random() * 9) + 1;
            if (!options.includes(distractingVal)) options.push(distractingVal);
        }
        options.sort(() => Math.random() - 0.5);
        
        options.forEach(num => {
            const bubble = document.createElement('button');
            bubble.className = 'num-bubble-btn';
            bubble.innerText = num;
            bubble.onclick = () => validateSweetsCount(num, bubble);
            answersContainer.appendChild(bubble);
        });
    }
}

function validateSweetsCount(chosenNum, node) {
    if (chosenNum === targetCountingSweetsNum) {
        playPopSound();
        playCorrectChime();
        node.style.background = 'var(--green-light)';
        node.style.borderColor = 'var(--green-main)';
        spawnClickConfetti(node);
        awardStars(1);
        
        let successText = "";
        if (countingSweetsMode === 'missing') {
            successText = `Superb sequence completion! The missing number was ${targetCountingSweetsNum}! ⭐`;
        } else if (countingSweetsMode === 'coins') {
            successText = `Yippee! You counted ${targetCountingSweetsNum} shiny gold coins correctly! 🪙`;
        } else {
            successText = `Sweet! You correctly counted ${targetCountingSweetsNum} yummy sweets! 🧁`;
        }
        setMascotSpeechBubble("elephant", successText);
        setTimeout(() => { generateCountingSweetsRound(); }, 1600);
    } else {
        playBuzzerWrong();
        node.classList.add('shake-bubble');
        setTimeout(() => { node.classList.remove('shake-bubble'); }, 400);
    }
}

// SubGame 2: Balloon Orders (Pop in ascending order)
let countingBalloonExpectedOrder = 1;
let countingBalloonsPhysicsLoopId = null;
let countingBalloonsStates = [];

function generateBalloonOrderRound() {
    const arena = document.getElementById('counting-balloon-arena');
    arena.innerHTML = '';
    countingBalloonsStates = [];
    
    const banner = document.getElementById('target-count-order');
    
    let values = [];
    let balloonLabels = [];
    
    if (countingBalloonPreset === 'letters') {
        countingBalloonExpectedOrder = 1; // expected order 1 (A), 2 (B), etc.
        values = [1, 2, 3, 4];
        balloonLabels = ['A', 'B', 'C', 'D'];
        if (banner) banner.innerText = "A, B, C, D";
        speakSpeech("Pop the letters in alphabetical order: A, B, C, D!");
    }
    else if (countingBalloonPreset === 'colors') {
        countingBalloonExpectedOrder = 1;
        values = [1, 2, 3, 4];
        
        // Shuffled balloon colors to expect
        const colorSequence = ['Red', 'Blue', 'Green', 'Yellow'];
        colorSequence.sort(() => Math.random() - 0.5);
        
        countingExpectedBalloonColorName = colorSequence[0];
        
        if (banner) banner.innerText = `Pop the ${countingExpectedBalloonColorName} Balloon!`;
        
        let localizedColor = countingExpectedBalloonColorName;
        if (currentLanguage === 'hi') {
            if (countingExpectedBalloonColorName === 'Red') localizedColor = 'लाल (Red)';
            else if (countingExpectedBalloonColorName === 'Blue') localizedColor = 'नीला (Blue)';
            else if (countingExpectedBalloonColorName === 'Green') localizedColor = 'हरा (Green)';
            else if (countingExpectedBalloonColorName === 'Yellow') localizedColor = 'पीला (Yellow)';
        } else if (currentLanguage === 'ta') {
            if (countingExpectedBalloonColorName === 'Red') localizedColor = 'சிவப்பு (Red)';
            else if (countingExpectedBalloonColorName === 'Blue') localizedColor = 'நீலம் (Blue)';
            else if (countingExpectedBalloonColorName === 'Green') localizedColor = 'பச்சை (Green)';
            else if (countingExpectedBalloonColorName === 'Yellow') localizedColor = 'மஞ்சள் (Yellow)';
        }
        
        speakSpeech(`Find and pop the ${localizedColor} balloon, honey!`);
    }
    else {
        countingBalloonExpectedOrder = 1;
        values = [1, 2, 3, 4];
        balloonLabels = ['1', '2', '3', '4'];
        if (banner) banner.innerText = "1, 2, 3, 4";
        speakSpeech("Pop the balloons in ascending order: 1, 2, 3, 4!");
    }
    
    // Shuffle positions
    const sortedIndexes = [0, 1, 2, 3];
    sortedIndexes.sort(() => Math.random() - 0.5);
    
    const colors = ['#ef4444', '#38bdf8', '#10b981', '#f59e0b']; // Red, Blue, Green, Yellow
    const colorNames = ['Red', 'Blue', 'Green', 'Yellow'];
    const colWidth = arena.clientWidth / 4;
    
    values.forEach((val, i) => {
        const bNode = document.createElement('div');
        bNode.className = 'balloon';
        
        let bColor = colors[i % colors.length];
        let label = val;
        
        if (countingBalloonPreset === 'letters') {
            label = balloonLabels[val - 1];
        }
        else if (countingBalloonPreset === 'colors') {
            bColor = colors[i % colors.length];
            label = '🎈';
        }
        
        bNode.innerText = label;
        bNode.style.backgroundColor = bColor;
        bNode.style.borderColor = '#111827';
        
        // Spawn positions
        const colIdx = sortedIndexes[i];
        const left = 15 + (colIdx * colWidth) + (Math.random() * (colWidth - 80));
        bNode.style.left = left + 'px';
        
        const startTop = 230 + (Math.random() * 20);
        bNode.style.top = startTop + 'px';
        
        const speed = 0.35 + Math.random() * 0.3;
        const string = document.createElement('div');
        string.className = 'balloon-string';
        bNode.appendChild(string);
        
        arena.appendChild(bNode);
        
        const state = {
            element: bNode,
            val: val,
            colorName: colorNames[i % colorNames.length],
            top: startTop,
            left: left,
            speed: speed,
            angle: Math.random() * Math.PI,
            waveFreq: 0.02,
            waveMag: 15
        };
        
        countingBalloonsStates.push(state);
        
        bNode.onclick = () => popCountingBalloon(state);
    });
    
    animateCountingBalloons();
}

function animateCountingBalloons() {
    if (countingBalloonsPhysicsLoopId) cancelAnimationFrame(countingBalloonsPhysicsLoopId);
    
    function updateFrame() {
        let allOutOfBounds = true;
        
        countingBalloonsStates.forEach(b => {
            if (b.top > -90) {
                allOutOfBounds = false;
                b.top -= b.speed;
                
                b.angle += b.waveFreq;
                const waveShift = Math.sin(b.angle) * b.waveMag * 0.08;
                b.left += waveShift;
                
                const arena = document.getElementById('counting-balloon-arena');
                const maxLeft = arena.clientWidth - 70;
                b.left = Math.max(5, Math.min(maxLeft, b.left));
                
                b.element.style.top = b.top + 'px';
                b.element.style.left = b.left + 'px';
            }
        });
        
        if (allOutOfBounds) {
            generateBalloonOrderRound();
        } else {
            countingBalloonsPhysicsLoopId = requestAnimationFrame(updateFrame);
        }
    }
    
    countingBalloonsPhysicsLoopId = requestAnimationFrame(updateFrame);
}

function popCountingBalloon(state) {
    if (countingBalloonPreset === 'colors') {
        if (state.colorName === countingExpectedBalloonColorName) {
            playPopSound();
            state.element.classList.add('pop-out');
            
            const rect = state.element.getBoundingClientRect();
            spawnStarSplashParticles(rect.left + 30, rect.top + 36);
            cancelAnimationFrame(countingBalloonsPhysicsLoopId);
            setTimeout(() => { triggerGameOver(2); }, 1500);
        } else {
            playBuzzerWrong();
            state.element.classList.add('shake-wobble');
            setTimeout(() => { state.element.classList.remove('shake-wobble'); }, 450);
        }
    }
    else {
        // Numbers or Letters alphabetical matching
        if (state.val === countingBalloonExpectedOrder) {
            playPopSound();
            state.element.classList.add('pop-out');
            
            const rect = state.element.getBoundingClientRect();
            spawnStarSplashParticles(rect.left + 30, rect.top + 36);
            
            countingBalloonExpectedOrder += 1;
            
            if (countingBalloonExpectedOrder > 4) {
                cancelAnimationFrame(countingBalloonsPhysicsLoopId);
                setTimeout(() => { triggerGameOver(3); }, 1500);
            } else {
                let nextLabel = countingBalloonExpectedOrder;
                if (countingBalloonPreset === 'letters') {
                    nextLabel = ['A', 'B', 'C', 'D'][countingBalloonExpectedOrder - 1];
                }
                setMascotSpeechBubble("elephant", `Yes! Now pop balloon ${nextLabel}!`);
            }
        } else {
            playBuzzerWrong();
            state.element.classList.add('shake-wobble');
            setTimeout(() => { state.element.classList.remove('shake-wobble'); }, 450);
        }
    }
}

/* ============================================================
   3. MATH RACING ARENA
   ============================================================ */
let activeMathSub = 'race';
let mathRaceTargetAnswer = 5;
let mathRaceCurrentPos = 0; // percentage left

function switchMathSubGame(mode) {
    activeMathSub = mode;
    const subGames = ['race', 'quiz'];
    
    subGames.forEach(s => {
        const el = document.getElementById(`math-${s}-game`);
        const tab = document.getElementById(`btn-tab-math-${s}`);
        if (el) el.classList.add('hidden');
        if (tab) tab.classList.remove('active');
    });
    
    const activeEl = document.getElementById(`math-${mode}-game`);
    const activeTab = document.getElementById(`btn-tab-math-${mode}`);
    if (activeEl) activeEl.classList.remove('hidden');
    if (activeTab) activeTab.classList.add('active');
    
    if (mode === 'quiz') {
        // Reset quiz battle views
        clearInterval(quizTimerIntervalId);
        document.getElementById('start-math-quiz-btn').classList.remove('hidden');
    }
    
    initMathGame();
}

function initMathGame() {
    if (activeMathSub === 'race') {
        mathRaceCurrentPos = 0;
        document.getElementById('bunny-racer').style.left = '0%';
        generateMathRaceRound();
    }
}

function generateMathRaceRound() {
    const config = (currentActiveGame && currentActiveGame.config) ? currentActiveGame.config : {};
    const type = config.type || 'add';
    
    let val1 = 0, val2 = 0;
    let operatorStr = '+';
    
    if (type === 'sub') {
        val1 = Math.floor(Math.random() * 9) + 2; // 2 to 10
        val2 = Math.floor(Math.random() * (val1 - 1)) + 1; // 1 to val1-1 (ensures positive answer)
        mathRaceTargetAnswer = val1 - val2;
        operatorStr = '-';
    } else if (type === 'mul') {
        val1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        val2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        mathRaceTargetAnswer = val1 * val2;
        operatorStr = '×';
    } else if (type === 'div') {
        val2 = Math.floor(Math.random() * 4) + 1; // divisor: 1 to 4
        mathRaceTargetAnswer = Math.floor(Math.random() * 4) + 1; // quotient: 1 to 4
        val1 = val2 * mathRaceTargetAnswer; // dividend (always divisible)
        operatorStr = '÷';
    } else {
        // default 'add'
        val1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        val2 = Math.floor(Math.random() * 4) + 1; // 1 to 4
        mathRaceTargetAnswer = val1 + val2;
        operatorStr = '+';
    }
    
    document.getElementById('race-formula-text').innerText = `${val1} ${operatorStr} ${val2} = ?`;
    
    const options = [mathRaceTargetAnswer];
    while(options.length < 3) {
        let distVal;
        if (type === 'mul') {
            distVal = Math.floor(Math.random() * 25) + 1;
        } else if (type === 'div') {
            distVal = Math.floor(Math.random() * 8) + 1;
        } else {
            distVal = Math.floor(Math.random() * 12) + 1;
        }
        if (!options.includes(distVal)) options.push(distVal);
    }
    options.sort(() => Math.random() - 0.5);
    
    const answersRow = document.getElementById('race-answers-row');
    answersRow.innerHTML = '';
    
    options.forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'choice-bubble';
        btn.innerText = num;
        btn.onclick = () => validateMathRaceChoice(num, btn);
        answersRow.appendChild(btn);
    });
}

function validateMathRaceChoice(chosen, node) {
    if (chosen === mathRaceTargetAnswer) {
        playRaceBoost();
        spawnClickConfetti(node);
        node.style.background = 'var(--green-light)';
        
        // Premium High Speed Visual Scrolling Track & Rabbit sprint
        const track = document.querySelector('.race-track-wrapper');
        const bunny = document.getElementById('bunny-racer');
        if (track) track.classList.add('racing');
        if (bunny) bunny.classList.add('boosting');
        
        setTimeout(() => {
            if (bunny) bunny.classList.remove('boosting');
        }, 800);
        
        // Boost racer bunny
        mathRaceCurrentPos += 20;
        document.getElementById('bunny-racer').style.left = `${mathRaceCurrentPos}%`;
        
        if (mathRaceCurrentPos >= 100) {
            playCorrectChime();
            setMascotSpeechBubble("rabbit", "Hooray! Vroom! We hit the finish line and collected the golden carrot! 🥕");
            
            setTimeout(() => {
                mathRaceCurrentPos = 0;
                document.getElementById('bunny-racer').style.left = '0%';
                if (track) track.classList.remove('racing');
                triggerGameOver(3);
            }, 1600);
        } else {
            awardStars(1);
            setMascotSpeechBubble("rabbit", "Great boost! Another sum to accelerate faster!");
            setTimeout(() => { generateMathRaceRound(); }, 1200);
        }
    } else {
        playBuzzerWrong();
        node.classList.add('shake-wobble');
        setTimeout(() => { node.classList.remove('shake-wobble'); }, 450);
    }
}

// Math SubGame 2: Fast Quiz Timer Battle
let quizTimerIntervalId = null;
let quizSecondsRemaining = 30;
let quizCorrectTotal = 0;
let quizTargetAnswer = 0;

function startMathQuizGame() {
    document.getElementById('start-math-quiz-btn').classList.add('hidden');
    quizCorrectTotal = 0;
    quizSecondsRemaining = 30;
    document.getElementById('quiz-correct-val').innerText = '0';
    document.getElementById('quiz-seconds').innerText = '30';
    
    generateQuizSum();
    
    if (quizTimerIntervalId) clearInterval(quizTimerIntervalId);
    quizTimerIntervalId = setInterval(() => {
        quizSecondsRemaining--;
        document.getElementById('quiz-seconds').innerText = quizSecondsRemaining;
        
        if (quizSecondsRemaining <= 0) {
            clearInterval(quizTimerIntervalId);
            document.getElementById('start-math-quiz-btn').classList.remove('hidden');
            triggerGameOver(quizCorrectTotal);
        }
    }, 1000);
}

function generateQuizSum() {
    const config = (currentActiveGame && currentActiveGame.config) ? currentActiveGame.config : {};
    const type = config.type; // could be 'add', 'sub', 'mul', 'div', or undefined (mix)
    
    let v1 = 0, v2 = 0;
    let operatorStr = '+';
    
    let finalType = type;
    if (!finalType) {
        const rand = Math.random();
        if (rand < 0.35) finalType = 'add';
        else if (rand < 0.7) finalType = 'sub';
        else finalType = 'mul';
    }
    
    if (finalType === 'add') {
        v1 = Math.floor(Math.random() * 8) + 1;
        v2 = Math.floor(Math.random() * 7) + 1;
        quizTargetAnswer = v1 + v2;
        operatorStr = '+';
    } else if (finalType === 'sub') {
        v1 = Math.floor(Math.random() * 9) + 2; // 2 to 10
        v2 = Math.floor(Math.random() * (v1 - 1)) + 1; // ensure positive
        quizTargetAnswer = v1 - v2;
        operatorStr = '-';
    } else if (finalType === 'mul') {
        v1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        v2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        quizTargetAnswer = v1 * v2;
        operatorStr = '×';
    } else if (finalType === 'div') {
        v2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        quizTargetAnswer = Math.floor(Math.random() * 5) + 1; // 1 to 5
        v1 = v2 * quizTargetAnswer;
        operatorStr = '÷';
    }
    
    document.getElementById('quiz-formula-text').innerText = `${v1} ${operatorStr} ${v2} = ?`;
    
    const options = [quizTargetAnswer];
    while(options.length < 4) {
        let distractingVal;
        if (quizTargetAnswer <= 10) {
            distractingVal = Math.floor(Math.random() * 15);
        } else {
            distractingVal = Math.floor(Math.random() * (quizTargetAnswer + 10));
            distractingVal = Math.max(1, distractingVal);
        }
        if (!options.includes(distractingVal)) options.push(distractingVal);
    }
    options.sort(() => Math.random() - 0.5);
    
    const answerGrid = document.getElementById('quiz-answers-bubbles');
    answerGrid.innerHTML = '';
    
    options.forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'num-bubble-btn';
        btn.innerText = num;
        btn.onclick = () => validateQuizAnswer(num, btn);
        answerGrid.appendChild(btn);
    });
}

function validateQuizAnswer(num, node) {
    if (quizSecondsRemaining <= 0) return;
    
    if (num === quizTargetAnswer) {
        playPopSound();
        quizCorrectTotal++;
        document.getElementById('quiz-correct-val').innerText = quizCorrectTotal;
        spawnClickConfetti(node);
        generateQuizSum();
    } else {
        playBuzzerWrong();
        node.classList.add('shake-bubble');
        setTimeout(() => { node.classList.remove('shake-bubble'); }, 400);
    }
}

/* ============================================================
   4. MEMORY CARD ARENA
   ============================================================ */
let activeMemoryTheme = 'animals';
let memoryCardsValues = [];
let memoryFlippedCards = [];
let memoryLockBoard = false;

const memoryThemeSets = {
    animals: ['🦁', '🐯', '🦒', '🐘', '🐨', '🐵'],
    fruits: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒'],
    emojis: ['❤️', '😂', '🐱', '🕶️', '👑', '🌈']
};

function setMemoryTheme(theme) {
    activeMemoryTheme = theme;
    // Highlight correct tab selectors
    const tabs = document.querySelectorAll('#zone-memory .game-tab');
    tabs.forEach(t => {
        if (t.innerText.toLowerCase().includes(theme)) t.classList.add('active');
        else t.classList.remove('active');
    });
    initMemoryGame();
}

function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    memoryFlippedCards = [];
    memoryLockBoard = false;
    
    // Build double duplicate deck
    const items = [...memoryThemeSets[activeMemoryTheme], ...memoryThemeSets[activeMemoryTheme]];
    items.sort(() => Math.random() - 0.5); // Shuffle cards
    
    items.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.id = `card-${index}`;
        card.dataset.emoji = emoji;
        
        const inner = document.createElement('div');
        inner.className = 'card-inner';
        
        const front = document.createElement('div');
        front.className = 'card-front';
        front.innerText = '❓';
        
        const back = document.createElement('div');
        back.className = 'card-back';
        back.innerText = emoji;
        
        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);
        
        card.onclick = () => flipMemoryCard(card);
        grid.appendChild(card);
    });
}

function flipMemoryCard(card) {
    if (memoryLockBoard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    playFlipSound();
    card.classList.add('flipped');
    memoryFlippedCards.push(card);
    
    if (memoryFlippedCards.length === 2) {
        checkMemoryMatch();
    }
}

function checkMemoryMatch() {
    memoryLockBoard = true;
    const card1 = memoryFlippedCards[0];
    const card2 = memoryFlippedCards[1];
    
    const isMatch = card1.dataset.emoji === card2.dataset.emoji;
    
    if (isMatch) {
        setTimeout(() => {
            playPopSound();
            playCorrectChime();
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            spawnClickConfetti(card1);
            spawnClickConfetti(card2);
            awardStars(2);
            
            memoryFlippedCards = [];
            memoryLockBoard = false;
            
            const matchedCount = document.querySelectorAll('#memory-grid .matched').length;
            if (matchedCount === 12) {
                setTimeout(() => {
                    triggerGameOver(4);
                }, 1500);
            }
        }, 600);
    } else {
        setTimeout(() => {
            playBuzzerWrong();
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            
            memoryFlippedCards = [];
            memoryLockBoard = false;
        }, 1200);
    }
}

/* ============================================================
   5. SHAPE JIGSAW PUZZLE
   ============================================================ */
const shapesDef = [
    { name: 'star', path: 'M25,2 L32,18 L49,18 L36,29 L41,46 L25,35 L9,46 L14,29 L1,18 L18,18 Z' },
    { name: 'heart', path: 'M25,44 C-5,24 -5,-4 25,12 C55,-4 55,24 25,44 Z' },
    { name: 'cloud', path: 'M18,34 C12,34 8,30 8,24 C8,19 12,15 16,14 C17,9 22,5 28,5 C34,5 39,9 40,14 C44,14 48,18 48,23 C48,29 43,34 38,34 Z' },
    { name: 'circle', path: 'M25,5 A20,20 0 1,0 25,45 A20,20 0 1,0 25,5 Z' }
];

function initShapesGame() {
    const targetRow = document.getElementById('jigsaw-targets-row');
    const blocksRow = document.getElementById('jigsaw-blocks-row');
    
    targetRow.innerHTML = '';
    blocksRow.innerHTML = '';
    
    // Build Target Slots
    shapesDef.forEach(shape => {
        const slot = document.createElement('div');
        slot.className = 'shape-slot';
        slot.id = `slot-${shape.name}`;
        slot.ondragover = allowDrop;
        slot.ondragleave = (e) => slot.classList.remove('drag-over');
        slot.ondrop = (e) => dropShapePuzzle(e, shape.name, slot);
        
        // Mobile tap alternative support
        slot.onclick = () => tapTargetShape(shape.name, slot);
        
        // Add dotted outline svg shape
        slot.innerHTML = `<svg class="shape-svg" viewBox="0 0 50 50"><path d="${shape.path}" /></svg>`;
        
        targetRow.appendChild(slot);
    });
    
    // Build Draggable Blocks
    const shuffledShapes = [...shapesDef].sort(() => Math.random() - 0.5);
    shuffledShapes.forEach(shape => {
        const block = document.createElement('div');
        block.className = 'shape-block';
        block.id = `block-${shape.name}`;
        block.draggable = true;
        block.ondragstart = (e) => {
            e.dataTransfer.setData('text', shape.name);
        };
        
        // Tap alternative
        block.onclick = () => tapSelectShape(shape.name, block);
        
        block.innerHTML = `<svg viewBox="0 0 50 50"><path d="${shape.path}" /></svg>`;
        blocksRow.appendChild(block);
    });
}

let activeSelectedShape = null;
let activeSelectedShapeNode = null;

function tapSelectShape(shapeName, node) {
    const allBlocks = document.querySelectorAll('.shape-block');
    allBlocks.forEach(b => b.style.transform = 'none');
    
    activeSelectedShape = shapeName;
    activeSelectedShapeNode = node;
    node.style.transform = 'scale(1.25) translateY(-6px)';
    playFlipSound();
}

function tapTargetShape(shapeName, node) {
    if (activeSelectedShape && activeSelectedShape === shapeName) {
        snapShapePuzzle(shapeName, node, activeSelectedShapeNode);
        activeSelectedShape = null;
        activeSelectedShapeNode = null;
    } else if (activeSelectedShape) {
        playBuzzerWrong();
        node.classList.add('shake-bubble');
        setTimeout(() => { node.classList.remove('shake-bubble'); }, 400);
    }
}

function dropShapePuzzle(e, name, slot) {
    e.preventDefault();
    slot.classList.remove('drag-over');
    
    const draggedName = e.dataTransfer.getData('text');
    const draggedNode = document.getElementById(`block-${draggedName}`);
    
    if (draggedName === name) {
        snapShapePuzzle(name, slot, draggedNode);
    } else {
        playBuzzerWrong();
        slot.classList.add('shake-bubble');
        setTimeout(() => { slot.classList.remove('shake-bubble'); }, 400);
    }
}

function snapShapePuzzle(name, slot, draggedNode) {
    playPopSound();
    playCorrectChime();
    
    slot.classList.add('filled');
    if (draggedNode && draggedNode.parentNode) {
        draggedNode.parentNode.removeChild(draggedNode);
    }
    
    awardStars(2);
    spawnClickConfetti(slot);
    
    const count = document.getElementById('jigsaw-blocks-row').childElementCount;
    if (count === 0) {
        setTimeout(() => {
            triggerGameOver(3);
        }, 1500);
    }
}

/* ============================================================
   6. MAGIC COLORING CANVAS
   ============================================================ */
let sketchCanvas = null;
let sketchCtx = null;
let isDrawing = false;
let brushColor = '#ef4444';
let brushSize = 8;

// Advanced Painting Studio Variables (26 features)
let activePaintTool = 'pencil'; // pencil, brush, crayon, spray, rainbow, glow, fill, eraser, line, rect, circle, triangle, text, stamp, sticker
let activeStampEmoji = '⭐';
let activeStickerEmoji = '🦄';
let paintZoomLevel = 1.0;
let paintMirrorMode = false;
let paintUndoStack = [];
let paintRedoStack = [];
let paintStartCoords = { x: 0, y: 0 };
let paintTempImageData = null;
let lastRainbowHue = 0;
let canvasBgColor = '#ffffff';
let paintLastX = 0;
let paintLastY = 0;
let paintLastMirroredX = 0;

function initMagicCanvas() {
    sketchCanvas = document.getElementById('magic-drawing-board');
    sketchCtx = sketchCanvas.getContext('2d');
    
    resizeSketchCanvas();
    
    // Bind Mouse Events
    sketchCanvas.onmousedown = startDrawing;
    sketchCanvas.onmousemove = makeDrawing;
    sketchCanvas.onmouseup = stopDrawing;
    sketchCanvas.onmouseleave = stopDrawing;
    
    // Bind Touch Events (Mobile/Tablet Friendly)
    sketchCanvas.ontouchstart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startDrawing(touch);
    };
    sketchCanvas.ontouchmove = (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            makeDrawing(e.touches[0]);
        }
    };
    sketchCanvas.ontouchend = (e) => {
        e.preventDefault();
        stopDrawing();
    };
    
    // Reset Zoom visuals
    zoomCanvas(0, true);
    
    // Reset background color visually
    changeCanvasBg('#ffffff');
    const bgPicker = document.getElementById('canvas-bg-picker');
    if (bgPicker) bgPicker.value = '#ffffff';
    
    // Default tool
    setPaintTool('pencil', document.getElementById('tool-pencil'));
    
    // Clear stacks
    paintUndoStack = [];
    paintRedoStack = [];
}

function resizeSketchCanvas() {
    if (!sketchCanvas) return;
    const parent = sketchCanvas.parentNode;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    
    // Avoid resetting if size didn't change (prevents clearing drawing)
    if (sketchCanvas.width !== width || sketchCanvas.height !== height) {
        // Save current canvas contents
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sketchCanvas.width;
        tempCanvas.height = sketchCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(sketchCanvas, 0, 0);
        
        sketchCanvas.width = width;
        sketchCanvas.height = height;
        
        sketchCtx.lineCap = 'round';
        sketchCtx.lineJoin = 'round';
        
        // Restore contents
        sketchCtx.drawImage(tempCanvas, 0, 0);
    }
}

function saveUndoState() {
    if (paintUndoStack.length >= 20) {
        paintUndoStack.shift(); // Limit memory usage
    }
    paintUndoStack.push(sketchCtx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height));
}

function undoPaint() {
    if (paintUndoStack.length > 0) {
        const currentState = sketchCtx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
        paintRedoStack.push(currentState);
        
        const previousState = paintUndoStack.pop();
        sketchCtx.putImageData(previousState, 0, 0);
        playPopSound();
        setMascotSpeechBubble("painter", "Oops! Let's undo that stroke, sweetheart! 🎨");
    } else {
        setMascotSpeechBubble("painter", "Nothing left to undo, darling! 🐻");
    }
}

function redoPaint() {
    if (paintRedoStack.length > 0) {
        const currentState = sketchCtx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
        paintUndoStack.push(currentState);
        
        const nextState = paintRedoStack.pop();
        sketchCtx.putImageData(nextState, 0, 0);
        playPopSound();
        setMascotSpeechBubble("painter", "Brings that stroke right back! So pretty! 🎨");
    } else {
        setMascotSpeechBubble("painter", "Nothing left to redo, sweetheart! 🐻");
    }
}

function setPaintTool(tool, btn) {
    activePaintTool = tool;
    
    // Toggle active state visual buttons
    const btns = document.querySelectorAll('.paint-tool-btn');
    btns.forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    // Show/Hide Stamps & Stickers Drawers
    const stampsPalette = document.getElementById('stamps-palette');
    const stickersPalette = document.getElementById('stickers-palette');
    
    if (stampsPalette) {
        if (tool === 'stamp') stampsPalette.classList.remove('hidden');
        else stampsPalette.classList.add('hidden');
    }
    
    if (stickersPalette) {
        if (tool === 'sticker') stickersPalette.classList.remove('hidden');
        else stickersPalette.classList.add('hidden');
    }
    
    playPopSound();
    
    let bubbleText = `Yay! You selected the ${tool} tool! Let's draw something pretty! 🎨`;
    if (tool === 'eraser') bubbleText = "Squeaky clean! Let's erase mistakes with the cute eraser! 🧼";
    else if (tool === 'fill') bubbleText = "Magic Paint Bucket selected! Click enclosed areas to fill them with color! 🪣";
    else if (tool === 'stamp') bubbleText = "Emoji Stamp tool! Pick a stamp drawer bubble and click to place stamps! ⭐";
    else if (tool === 'sticker') bubbleText = "Fairy Tale Sticker tool! Pick a sticker and place it on your canvas! 🦄";
    
    setMascotSpeechBubble("painter", bubbleText);
}

function selectStamp(emoji) {
    activeStampEmoji = emoji;
    const items = document.querySelectorAll('.stamp-choice');
    items.forEach(i => i.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    playPopSound();
}

function selectSticker(emoji) {
    activeStickerEmoji = emoji;
    const items = document.querySelectorAll('.sticker-choice');
    items.forEach(i => i.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    playPopSound();
}

function changeCanvasBg(color) {
    canvasBgColor = color;
    if (sketchCanvas) {
        sketchCanvas.style.backgroundColor = color;
    }
    playPopSound();
}

function zoomCanvas(amount, reset = false) {
    if (reset) {
        paintZoomLevel = 1.0;
    } else {
        paintZoomLevel = Math.max(0.5, Math.min(3.0, paintZoomLevel + amount));
    }
    
    if (sketchCanvas) {
        sketchCanvas.style.transform = `scale(${paintZoomLevel})`;
    }
    playPopSound();
}

function toggleMirrorMode() {
    paintMirrorMode = !paintMirrorMode;
    const btn = document.getElementById('mirror-mode-btn');
    if (btn) {
        if (paintMirrorMode) {
            btn.classList.add('active');
            btn.innerHTML = `<i class="fa-solid fa-arrows-left-right"></i> Mirror On`;
        } else {
            btn.classList.remove('active');
            btn.innerHTML = `<i class="fa-solid fa-arrows-left-right"></i> Mirror Off`;
        }
    }
    playPopSound();
}

function startDrawing(e) {
    const rect = sketchCanvas.getBoundingClientRect();
    
    // Normalize coordinates taking zoom factor into account
    const x = (e.clientX - rect.left) / paintZoomLevel;
    const y = (e.clientY - rect.top) / paintZoomLevel;
    
    saveUndoState();
    paintRedoStack = [];
    
    paintStartCoords = { x, y };
    paintLastX = x;
    paintLastY = y;
    
    const cx = sketchCanvas.width / 2;
    const mirroredX = cx - (x - cx);
    paintLastMirroredX = mirroredX;
    
    paintTempImageData = sketchCtx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
    
    if (activePaintTool === 'fill') {
        floodFill(x, y, brushColor);
        saveUndoState();
        playPopSound();
        return;
    }
    
    if (activePaintTool === 'text') {
        const fontText = prompt("Enter text for your masterpiece drawing:", "KiddyQuest");
        if (fontText) {
            sketchCtx.font = `bold ${brushSize * 2.5}px Inter, sans-serif`;
            sketchCtx.fillStyle = brushColor;
            sketchCtx.textAlign = 'center';
            sketchCtx.textBaseline = 'middle';
            sketchCtx.fillText(fontText, x, y);
            
            if (paintMirrorMode) {
                sketchCtx.fillText(fontText, mirroredX, y);
            }
            saveUndoState();
            playPopSound();
        }
        return;
    }
    
    if (activePaintTool === 'stamp') {
        sketchCtx.font = `${brushSize * 3}px Inter, Arial`;
        sketchCtx.textAlign = 'center';
        sketchCtx.textBaseline = 'middle';
        sketchCtx.fillText(activeStampEmoji, x, y);
        
        if (paintMirrorMode) {
            sketchCtx.fillText(activeStampEmoji, mirroredX, y);
        }
        saveUndoState();
        playPopSound();
        return;
    }
    
    if (activePaintTool === 'sticker') {
        sketchCtx.font = '80px Inter, Arial';
        sketchCtx.textAlign = 'center';
        sketchCtx.textBaseline = 'middle';
        sketchCtx.fillText(activeStickerEmoji, x, y);
        
        if (paintMirrorMode) {
            sketchCtx.fillText(activeStickerEmoji, mirroredX, y);
        }
        saveUndoState();
        playPopSound();
        return;
    }
    
    isDrawing = true;
    sketchCtx.beginPath();
    sketchCtx.moveTo(x, y);
}

function makeDrawing(e) {
    if (!isDrawing) return;
    const rect = sketchCanvas.getBoundingClientRect();
    
    // Normalize coordinates taking zoom factor into account
    const x = (e.clientX - rect.left) / paintZoomLevel;
    const y = (e.clientY - rect.top) / paintZoomLevel;
    
    const cx = sketchCanvas.width / 2;
    const mirroredX = cx - (x - cx);
    const startMirroredX = cx - (paintStartCoords.x - cx);
    
    if (['line', 'rect', 'circle', 'triangle'].includes(activePaintTool)) {
        sketchCtx.putImageData(paintTempImageData, 0, 0);
        
        sketchCtx.strokeStyle = brushColor;
        sketchCtx.lineWidth = brushSize;
        sketchCtx.lineCap = 'round';
        sketchCtx.lineJoin = 'round';
        sketchCtx.shadowBlur = 0; // Shapes don't glow by default
        sketchCtx.globalAlpha = 1.0;
        
        sketchCtx.beginPath();
        
        if (activePaintTool === 'line') {
            sketchCtx.moveTo(paintStartCoords.x, paintStartCoords.y);
            sketchCtx.lineTo(x, y);
            if (paintMirrorMode) {
                sketchCtx.moveTo(startMirroredX, paintStartCoords.y);
                sketchCtx.lineTo(mirroredX, y);
            }
        } else if (activePaintTool === 'rect') {
            const w = x - paintStartCoords.x;
            const h = y - paintStartCoords.y;
            sketchCtx.strokeRect(paintStartCoords.x, paintStartCoords.y, w, h);
            if (paintMirrorMode) {
                sketchCtx.strokeRect(startMirroredX - w, paintStartCoords.y, w, h);
            }
        } else if (activePaintTool === 'circle') {
            const r = Math.sqrt(Math.pow(x - paintStartCoords.x, 2) + Math.pow(y - paintStartCoords.y, 2));
            sketchCtx.arc(paintStartCoords.x, paintStartCoords.y, r, 0, Math.PI * 2);
            if (paintMirrorMode) {
                sketchCtx.moveTo(startMirroredX + r, paintStartCoords.y);
                sketchCtx.arc(startMirroredX, paintStartCoords.y, r, 0, Math.PI * 2);
            }
        } else if (activePaintTool === 'triangle') {
            sketchCtx.moveTo(paintStartCoords.x, paintStartCoords.y);
            sketchCtx.lineTo(x, y);
            sketchCtx.lineTo(paintStartCoords.x - (x - paintStartCoords.x), y);
            sketchCtx.closePath();
            if (paintMirrorMode) {
                sketchCtx.moveTo(startMirroredX, paintStartCoords.y);
                sketchCtx.lineTo(mirroredX, y);
                sketchCtx.lineTo(startMirroredX - (mirroredX - startMirroredX), y);
                sketchCtx.closePath();
            }
        }
        sketchCtx.stroke();
    } else {
        // Drag brushes: pencil, brush, crayon, spray, rainbow, glow, eraser
        sketchCtx.lineCap = 'round';
        sketchCtx.lineJoin = 'round';
        sketchCtx.shadowBlur = 0;
        
        if (activePaintTool === 'pencil') {
            sketchCtx.strokeStyle = brushColor;
            sketchCtx.lineWidth = Math.min(brushSize, 3);
            sketchCtx.globalAlpha = 1.0;
        } else if (activePaintTool === 'brush') {
            sketchCtx.strokeStyle = brushColor;
            sketchCtx.lineWidth = brushSize;
            sketchCtx.globalAlpha = 1.0;
        } else if (activePaintTool === 'crayon') {
            sketchCtx.strokeStyle = brushColor;
            sketchCtx.lineWidth = brushSize;
            sketchCtx.globalAlpha = 0.25; // Soft crayon wax opacity layering
        } else if (activePaintTool === 'eraser') {
            sketchCtx.strokeStyle = canvasBgColor;
            sketchCtx.lineWidth = brushSize;
            sketchCtx.globalAlpha = 1.0;
        } else if (activePaintTool === 'rainbow') {
            lastRainbowHue = (lastRainbowHue + 6) % 360;
            sketchCtx.strokeStyle = `hsl(${lastRainbowHue}, 100%, 50%)`;
            sketchCtx.lineWidth = brushSize;
            sketchCtx.globalAlpha = 1.0;
        } else if (activePaintTool === 'glow') {
            sketchCtx.strokeStyle = brushColor;
            sketchCtx.lineWidth = brushSize;
            sketchCtx.shadowBlur = 15;
            sketchCtx.shadowColor = brushColor;
            sketchCtx.globalAlpha = 1.0;
        }
        
        if (activePaintTool === 'spray') {
            sketchCtx.fillStyle = brushColor;
            sketchCtx.globalAlpha = 1.0;
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * brushSize * 1.5;
                const sx = x + Math.cos(angle) * radius;
                const sy = y + Math.sin(angle) * radius;
                sketchCtx.fillRect(sx, sy, 2, 2);
                
                if (paintMirrorMode) {
                    const msx = mirroredX + Math.cos(angle) * radius;
                    sketchCtx.fillRect(msx, sy, 2, 2);
                }
            }
        } else {
            // Draw continuous line stroke
            sketchCtx.beginPath();
            sketchCtx.moveTo(paintLastX, paintLastY);
            sketchCtx.lineTo(x, y);
            sketchCtx.stroke();
            
            if (paintMirrorMode) {
                sketchCtx.beginPath();
                sketchCtx.moveTo(paintLastMirroredX, paintLastY);
                sketchCtx.lineTo(mirroredX, y);
                sketchCtx.stroke();
            }
        }
    }
    
    // Store drag values
    paintLastX = x;
    paintLastY = y;
    paintLastMirroredX = mirroredX;
}

function stopDrawing() {
    isDrawing = false;
    // Clear shadow overlay effects
    if (sketchCtx) {
        sketchCtx.shadowBlur = 0;
        sketchCtx.globalAlpha = 1.0;
    }
}

function changeBrushColor(color, node) {
    brushColor = color;
    const bubbles = document.querySelectorAll('.color-bubble');
    bubbles.forEach(b => b.classList.remove('active'));
    if (node) node.classList.add('active');
    
    const dot = document.getElementById('brush-size-preview').firstElementChild;
    if (dot) dot.style.background = color === '#ffffff' ? '#e5e7eb' : color;
}

function updateBrushSize(size) {
    brushSize = parseInt(size);
    const dot = document.getElementById('brush-size-preview').firstElementChild;
    if (dot) {
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
    }
}

function clearMagicCanvas() {
    if (sketchCtx && sketchCanvas) {
        sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
        playPopSound();
        setMascotSpeechBubble("painter", "Magic board is perfectly clean! Start painting again! 🧼");
    }
}

function saveDrawingImage() {
    playCorrectChime();
    
    // Make a temporary canvas to preserve solid background colors
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sketchCanvas.width;
    tempCanvas.height = sketchCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Background fill
    tempCtx.fillStyle = canvasBgColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Overlay sketches
    tempCtx.drawImage(sketchCanvas, 0, 0);
    
    const dataURL = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'KiddyQuest-Masterpiece.png';
    link.href = dataURL;
    link.click();
    
    awardStars(3);
    triggerGameOver(3);
}

function printDrawing() {
    playPopSound();
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sketchCanvas.width;
    tempCanvas.height = sketchCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = canvasBgColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(sketchCanvas, 0, 0);
    
    const dataUrl = tempCanvas.toDataURL();
    const windowContent = '<!DOCTYPE html><html><head><title>Print Your Masterpiece Drawing</title></head><body style="margin:0; display:flex; align-items:center; justify-content:center;"><img src="' + dataUrl + '" style="max-width:100%; max-height:100%; border:4px solid #111827; border-radius:16px; box-shadow:8px 8px 0px #111827;" onload="window.print(); window.close();" /></body></html>';
    
    const printWin = window.open('', '', 'width=800,height=600');
    if (printWin) {
        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();
    }
}

function toggleCanvasFullscreen() {
    playPopSound();
    const zonePaint = document.getElementById('zone-paint');
    if (!zonePaint) return;
    
    if (!document.fullscreenElement) {
        zonePaint.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Optimized DFS Stack Flood Fill ($O(1)$ stack allocation logic)
function floodFill(startX, startY, fillColor) {
    const width = sketchCanvas.width;
    const height = sketchCanvas.height;
    
    startX = Math.floor(startX);
    startY = Math.floor(startY);
    
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;
    
    const imgData = sketchCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    const startIdx = (startY * width + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx+1];
    const startB = data[startIdx+2];
    const startA = data[startIdx+3];
    
    const fillRgb = hexToRgb(fillColor);
    if (!fillRgb) return;
    
    // If fill color is identical to start pixel color, return
    if (colorMatch(startR, startG, startB, startA, fillRgb.r, fillRgb.g, fillRgb.b, 255)) {
        return;
    }
    
    const stack = [startX, startY];
    const visited = new Uint8Array(width * height);
    
    while (stack.length > 0) {
        const y = stack.pop();
        const x = stack.pop();
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const vIdx = y * width + x;
        if (visited[vIdx]) continue;
        visited[vIdx] = 1;
        
        const idx = vIdx * 4;
        if (colorMatch(data[idx], data[idx+1], data[idx+2], data[idx+3], startR, startG, startB, startA)) {
            data[idx] = fillRgb.r;
            data[idx+1] = fillRgb.g;
            data[idx+2] = fillRgb.b;
            data[idx+3] = 255;
            
            stack.push(x + 1, y);
            stack.push(x - 1, y);
            stack.push(x, y + 1);
            stack.push(x, y - 1);
        }
    }
    
    sketchCtx.putImageData(imgData, 0, 0);
}

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function colorMatch(r1, g1, b1, a1, r2, g2, b2, a2) {
    return Math.abs(r1 - r2) < 25 &&
           Math.abs(g1 - g2) < 25 &&
           Math.abs(b1 - b2) < 25 &&
           Math.abs(a1 - a2) < 25;
}

function loadCartoonTemplate(shape) {
    sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    const cx = sketchCanvas.width / 2;
    const cy = sketchCanvas.height / 2;
    
    sketchCtx.beginPath();
    sketchCtx.strokeStyle = '#374151';
    sketchCtx.lineWidth = 4;
    sketchCtx.setLineDash([8, 8]);
    
    if (shape === 'star') {
        const spikes = 5;
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
        
        sketchCtx.moveTo(cx, cy - 80);
        for(let i=0; i<spikes; i++) {
            x = cx + Math.cos(rot) * 80;
            y = cy + Math.sin(rot) * 80;
            sketchCtx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * 35;
            y = cy + Math.sin(rot) * 35;
            sketchCtx.lineTo(x, y);
            rot += step;
        }
        sketchCtx.lineTo(cx, cy - 80);
    } else if (shape === 'cloud') {
        sketchCtx.moveTo(cx - 70, cy + 20);
        sketchCtx.arc(cx - 70, cy, 30, Math.PI * 0.5, Math.PI * 1.5);
        sketchCtx.arc(cx - 30, cy - 30, 40, Math.PI * 1.0, Math.PI * 2.0);
        sketchCtx.arc(cx + 30, cy - 25, 35, Math.PI * 1.2, Math.PI * 2.2);
        sketchCtx.arc(cx + 70, cy, 30, Math.PI * 1.5, Math.PI * 0.5);
        sketchCtx.lineTo(cx - 70, cy + 20);
    } else if (shape === 'cat') {
        sketchCtx.arc(cx, cy, 55, 0, Math.PI * 2);
        sketchCtx.moveTo(cx - 48, cy - 28);
        sketchCtx.lineTo(cx - 55, cy - 70);
        sketchCtx.lineTo(cx - 15, cy - 53);
        sketchCtx.moveTo(cx + 48, cy - 28);
        sketchCtx.lineTo(cx + 55, cy - 70);
        sketchCtx.lineTo(cx + 15, cy - 53);
    } else if (shape === 'heart') {
        const d = 100;
        sketchCtx.moveTo(cx, cy);
        sketchCtx.bezierCurveTo(cx - d/2, cy - d/2, cx - d, cy - d/6, cx, cy + d/2 + 20);
        sketchCtx.bezierCurveTo(cx + d, cy - d/6, cx + d/2, cy - d/2, cx, cy);
    } else if (shape === 'car') {
        sketchCtx.moveTo(cx - 100, cy + 20);
        sketchCtx.lineTo(cx - 100, cy - 10);
        sketchCtx.quadraticCurveTo(cx - 100, cy - 20, cx - 80, cy - 20);
        sketchCtx.lineTo(cx - 50, cy - 20);
        sketchCtx.lineTo(cx - 30, cy - 50);
        sketchCtx.lineTo(cx + 40, cy - 50);
        sketchCtx.lineTo(cx + 60, cy - 20);
        sketchCtx.lineTo(cx + 90, cy - 20);
        sketchCtx.quadraticCurveTo(cx + 110, cy - 20, cx + 110, cy - 10);
        sketchCtx.lineTo(cx + 110, cy + 20);
        sketchCtx.lineTo(cx - 100, cy + 20);
        sketchCtx.moveTo(cx - 60, cy + 20);
        sketchCtx.arc(cx - 60, cy + 20, 18, 0, Math.PI * 2);
        sketchCtx.moveTo(cx + 60, cy + 20);
        sketchCtx.arc(cx + 60, cy + 20, 18, 0, Math.PI * 2);
    } else if (shape === 'fish') {
        sketchCtx.moveTo(cx - 80, cy);
        sketchCtx.quadraticCurveTo(cx - 20, cy - 60, cx + 50, cy);
        sketchCtx.quadraticCurveTo(cx - 20, cy + 60, cx - 80, cy);
        sketchCtx.lineTo(cx - 110, cy - 35);
        sketchCtx.lineTo(cx - 100, cy);
        sketchCtx.lineTo(cx - 110, cy + 35);
        sketchCtx.lineTo(cx - 80, cy);
        sketchCtx.moveTo(cx, cy - 30);
        sketchCtx.quadraticCurveTo(cx - 20, cy - 50, cx - 10, cy - 30);
        sketchCtx.moveTo(cx + 30, cy - 10);
        sketchCtx.arc(cx + 30, cy - 10, 5, 0, Math.PI * 2);
    } else if (shape === 'dino') {
        sketchCtx.moveTo(cx - 110, cy + 30);
        sketchCtx.quadraticCurveTo(cx - 50, cy + 30, cx - 30, cy + 20);
        sketchCtx.quadraticCurveTo(cx - 20, cy - 40, cx + 10, cy - 45);
        sketchCtx.quadraticCurveTo(cx + 35, cy - 45, cx + 45, cy - 30);
        sketchCtx.lineTo(cx + 55, cy - 25);
        sketchCtx.lineTo(cx + 45, cy - 15);
        sketchCtx.quadraticCurveTo(cx + 25, cy - 15, cx + 20, cy + 5);
        sketchCtx.lineTo(cx + 25, cy + 40);
        sketchCtx.lineTo(cx + 10, cy + 40);
        sketchCtx.lineTo(cx + 5, cy + 15);
        sketchCtx.lineTo(cx - 15, cy + 40);
        sketchCtx.lineTo(cx - 30, cy + 40);
        sketchCtx.lineTo(cx - 25, cy + 15);
        sketchCtx.quadraticCurveTo(cx - 60, cy + 25, cx - 110, cy + 30);
    } else if (shape === 'letters') {
        const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
        const randomChar = letters[Math.floor(Math.random() * letters.length)];
        sketchCtx.font = 'bold 200px Arial';
        sketchCtx.textAlign = 'center';
        sketchCtx.textBaseline = 'middle';
        sketchCtx.strokeText(randomChar, cx, cy);
    } else if (shape === 'numbers') {
        const numbers = '123456789';
        const randomChar = numbers[Math.floor(Math.random() * numbers.length)];
        sketchCtx.font = 'bold 200px Arial';
        sketchCtx.textAlign = 'center';
        sketchCtx.textBaseline = 'middle';
        sketchCtx.strokeText(randomChar, cx, cy);
    }
    
    sketchCtx.stroke();
    sketchCtx.setLineDash([]);
    playCorrectChime();
}

/* ============================================================
   7. SPELLING BEE CHALLENGE
   ============================================================ */
let spellingMode = 'normal'; // 'normal', 'sentence', 'rhyme', 'crossword'
let spellingTargetWord = 'CAT';
let spellingConstructedWord = '';
let spellingSentenceWords = [];
let spellingSentenceConstructed = [];
let spellingRhymeData = null;
let spellingCrosswordData = null;

const spellingDictionary = [
    { word: 'CAT', emoji: '🐱' },
    { word: 'DOG', emoji: '🐶' },
    { word: 'LION', emoji: '🦁' },
    { word: 'FROG', emoji: '🐸' },
    { word: 'STAR', emoji: '⭐' },
    { word: 'BIRD', emoji: '🐦' },
    { word: 'SUN', emoji: '☀️' },
    { word: 'FISH', emoji: '🐟' }
];

const sentenceBuilderSentences = [
    "I LOVE MY MOMMY",
    "THE SUN IS BRIGHT",
    "LEARNING IS SO FUN",
    "BUNNY LOVES SWEET CARROTS",
    "DOGS ARE CUTE PETS"
];

const rhymingWordsPairs = [
    { target: "CAT", rhyme: "HAT", choices: ["HAT", "DOG", "BOX", "PIN"] },
    { target: "DOG", rhyme: "FROG", choices: ["FROG", "CAT", "PIG", "NET"] },
    { target: "SUN", rhyme: "RUN", choices: ["RUN", "CAT", "BOX", "BAG"] },
    { target: "BEE", rhyme: "TREE", choices: ["TREE", "BUG", "CAP", "POT"] },
    { target: "CAR", rhyme: "STAR", choices: ["STAR", "TOY", "PEN", "BED"] }
];

const crosswordBlanks = [
    { target: "C_T", full: "CAT", blankIdx: 1, letter: "A", emoji: "🐱", choices: ["A", "E", "I", "O"] },
    { target: "D_G", full: "DOG", blankIdx: 1, letter: "O", emoji: "🐶", choices: ["O", "U", "E", "A"] },
    { target: "F_OG", full: "FROG", blankIdx: 1, letter: "R", emoji: "🐸", choices: ["R", "L", "T", "N"] },
    { target: "S_AR", full: "STAR", blankIdx: 1, letter: "T", emoji: "⭐", choices: ["T", "P", "S", "M"] },
    { target: "B_RD", full: "BIRD", blankIdx: 1, letter: "I", emoji: "🐦", choices: ["I", "E", "O", "A"] }
];

function initSpellingGame() {
    spellingConstructedWord = '';
    spellingSentenceConstructed = [];
    const config = (currentActiveGame && currentActiveGame.config) ? currentActiveGame.config : {};
    
    const banner = document.querySelector('#zone-spelling .instruction-banner');
    const targetEmoji = document.getElementById('spelling-target-emoji');
    const slotsRow = document.getElementById('spelling-word-slots');
    const bubbleContainer = document.getElementById('spelling-letter-bubbles');
    
    slotsRow.innerHTML = '';
    bubbleContainer.innerHTML = '';
    
    if (config.sentence) {
        spellingMode = 'sentence';
        const sentence = sentenceBuilderSentences[Math.floor(Math.random() * sentenceBuilderSentences.length)];
        spellingSentenceWords = sentence.split(' ');
        spellingTargetWord = sentence;
        
        targetEmoji.innerText = '🧱';
        if (banner) banner.innerText = "Arrange the scrambled word blocks in the correct order to form the sentence!";
        
        speakSpeech(`Build the sentence: ${sentence}`);
        
        // Render word slot boxes
        spellingSentenceWords.forEach((word, idx) => {
            const slot = document.createElement('span');
            slot.className = 'spell-slot';
            slot.style.width = 'auto';
            slot.style.padding = '4px 12px';
            slot.style.borderRadius = '8px';
            slot.id = `spell-slot-${idx}`;
            slot.innerText = '_____';
            slotsRow.appendChild(slot);
        });
        
        // Scramble word blocks
        const scrambledWords = [...spellingSentenceWords].sort(() => Math.random() - 0.5);
        scrambledWords.forEach(word => {
            const btn = document.createElement('button');
            btn.className = 'spell-letter-bubble';
            btn.style.width = 'auto';
            btn.style.padding = '8px 16px';
            btn.style.borderRadius = '16px';
            btn.innerText = word;
            btn.onclick = () => selectSentenceWord(word, btn);
            bubbleContainer.appendChild(btn);
        });
    }
    else if (config.rhyme) {
        spellingMode = 'rhyme';
        spellingRhymeData = rhymingWordsPairs[Math.floor(Math.random() * rhymingWordsPairs.length)];
        spellingTargetWord = spellingRhymeData.rhyme;
        
        targetEmoji.innerText = '🎵';
        if (banner) banner.innerText = `Find the word that rhymes with ${spellingRhymeData.target}!`;
        
        speakSpeech(`What rhymes with ${spellingRhymeData.target}?`);
        
        // Render single slot showing target
        const slot = document.createElement('span');
        slot.className = 'spell-slot';
        slot.style.width = 'auto';
        slot.style.padding = '4px 12px';
        slot.innerText = `${spellingRhymeData.target} + ?`;
        slotsRow.appendChild(slot);
        
        // Render rhyming word choices
        spellingRhymeData.choices.forEach(word => {
            const btn = document.createElement('button');
            btn.className = 'spell-letter-bubble';
            btn.style.width = 'auto';
            btn.style.padding = '8px 16px';
            btn.style.borderRadius = '16px';
            btn.innerText = word;
            btn.onclick = () => selectRhymeWord(word, btn);
            bubbleContainer.appendChild(btn);
        });
    }
    else if (config.crossword) {
        spellingMode = 'crossword';
        spellingCrosswordData = crosswordBlanks[Math.floor(Math.random() * crosswordBlanks.length)];
        spellingTargetWord = spellingCrosswordData.letter;
        
        targetEmoji.innerText = spellingCrosswordData.emoji;
        if (banner) banner.innerText = `Fill in the missing letter for the word: ${spellingCrosswordData.target}`;
        
        speakSpeech(`What is the missing letter in ${spellingCrosswordData.full}?`);
        
        // Render slot representing blank
        for (let i = 0; i < spellingCrosswordData.full.length; i++) {
            const slot = document.createElement('span');
            slot.className = 'spell-slot';
            slot.id = `spell-slot-${i}`;
            slot.innerText = i === spellingCrosswordData.blankIdx ? '_' : spellingCrosswordData.full[i];
            slotsRow.appendChild(slot);
        }
        
        // Render missing letter choices
        spellingCrosswordData.choices.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'spell-letter-bubble';
            btn.innerText = letter;
            btn.onclick = () => selectCrosswordLetter(letter, btn);
            bubbleContainer.appendChild(btn);
        });
    }
    else {
        // Normal Spelling Bee Mode
        spellingMode = 'normal';
        if (banner) banner.innerText = "Pop/click the scrambled letters in the correct order to spell the word!";
        
        let indexObj = spellingDictionary[Math.floor(Math.random() * spellingDictionary.length)];
        if (config.word) {
            const specificWord = config.word.toUpperCase();
            const matchingEmoji = spellingDictionary.find(d => d.word === specificWord);
            indexObj = { word: specificWord, emoji: matchingEmoji ? matchingEmoji.emoji : '✏️' };
        }
        spellingTargetWord = indexObj.word;
        targetEmoji.innerText = indexObj.emoji;
        
        speakSpeech(`Spell the word: ${spellingTargetWord}`);
        
        for (let i = 0; i < spellingTargetWord.length; i++) {
            const slot = document.createElement('span');
            slot.className = 'spell-slot';
            slot.id = `spell-slot-${i}`;
            slot.innerText = '_';
            slotsRow.appendChild(slot);
        }
        
        const letters = spellingTargetWord.split('').sort(() => Math.random() - 0.5);
        letters.forEach(letter => {
            const bubble = document.createElement('button');
            bubble.className = 'spell-letter-bubble';
            bubble.innerText = letter;
            bubble.onclick = () => typeSpellingLetter(letter, bubble);
            bubbleContainer.appendChild(bubble);
        });
    }
}

function selectSentenceWord(word, btnNode) {
    const expectedWord = spellingSentenceWords[spellingSentenceConstructed.length];
    
    if (word === expectedWord) {
        playPopSound();
        const slot = document.getElementById(`spell-slot-${spellingSentenceConstructed.length}`);
        if (slot) slot.innerText = word;
        
        spellingSentenceConstructed.push(word);
        btnNode.style.visibility = 'hidden';
        
        if (spellingSentenceConstructed.length === spellingSentenceWords.length) {
            playCorrectChime();
            speakSpeech(spellingTargetWord);
            
            spawnClickConfetti(slot);
            awardStars(3);
            setMascotSpeechBubble("bee", `Bzzz! You built the sentence perfectly, sweetheart! Mommy is so proud! 🐻❤️`);
            setTimeout(() => { initSpellingGame(); }, 2000);
        }
    } else {
        playBuzzerWrong();
        btnNode.classList.add('shake-bubble');
        setTimeout(() => { btnNode.classList.remove('shake-bubble'); }, 400);
    }
}

function selectRhymeWord(word, btnNode) {
    if (word === spellingRhymeData.rhyme) {
        playPopSound();
        playCorrectChime();
        btnNode.style.background = 'var(--green-light)';
        btnNode.style.borderColor = 'var(--green-main)';
        spawnClickConfetti(btnNode);
        awardStars(2);
        
        setMascotSpeechBubble("bee", `Spectacular! ${word} rhymes perfectly with ${spellingRhymeData.target}! 🐝`);
        setTimeout(() => { initSpellingGame(); }, 2000);
    } else {
        playBuzzerWrong();
        btnNode.classList.add('shake-bubble');
        setTimeout(() => { btnNode.classList.remove('shake-bubble'); }, 400);
    }
}

function selectCrosswordLetter(letter, btnNode) {
    if (letter === spellingCrosswordData.letter) {
        playPopSound();
        playCorrectChime();
        
        const slot = document.getElementById(`spell-slot-${spellingCrosswordData.blankIdx}`);
        if (slot) {
            slot.innerText = letter;
            slot.style.background = 'var(--green-light)';
            slot.style.borderColor = 'var(--green-main)';
        }
        
        btnNode.style.visibility = 'hidden';
        spawnClickConfetti(slot);
        awardStars(2);
        
        setMascotSpeechBubble("bee", `Wow! You found the missing letter! ${spellingCrosswordData.full} is correct! ⭐`);
        setTimeout(() => { initSpellingGame(); }, 2000);
    } else {
        playBuzzerWrong();
        btnNode.classList.add('shake-bubble');
        setTimeout(() => { btnNode.classList.remove('shake-bubble'); }, 400);
    }
}

function typeSpellingLetter(letter, bubbleNode) {
    const expectedLetter = spellingTargetWord[spellingConstructedWord.length];
    
    if (letter === expectedLetter) {
        playPopSound();
        const slot = document.getElementById(`spell-slot-${spellingConstructedWord.length}`);
        if (slot) slot.innerText = letter;
        
        spellingConstructedWord += letter;
        bubbleNode.style.visibility = 'hidden'; // Hide matched bubble
        
        if (spellingConstructedWord === spellingTargetWord) {
            playCorrectChime();
            speakSpeech(spellingTargetWord);
            
            spawnClickConfetti(slot);
            awardStars(2);
            setMascotSpeechBubble("bee", `Bzzz! Spectacular spelling! You spelled ${spellingTargetWord} correctly! 🐝`);
            setTimeout(() => { initSpellingGame(); }, 1800);
        }
    } else {
        playBuzzerWrong();
        bubbleNode.classList.add('shake-bubble');
        setTimeout(() => { bubbleNode.classList.remove('shake-bubble'); }, 400);
    }
}

/* ============================================================
   8. ANIMAL KINGDOM ZONE
   ============================================================ */
let activeAnimalSub = 'quiz';
let animalSoundQuizAnswer = 'lion';
const animalSoundPool = [
    { name: 'lion', emoji: '🦁', sound: 'growl' },
    { name: 'bird', emoji: '🐦', sound: 'chirp' },
    { name: 'frog', emoji: '🐸', sound: 'croak' }
];

function switchAnimalSubGame(mode) {
    activeAnimalSub = mode;
    const subGames = ['quiz', 'habitat'];
    
    subGames.forEach(s => {
        const el = document.getElementById(`animal-sounds-${s}`);
        const tab = document.getElementById(`btn-tab-sound-${s}`);
        if (el) el.classList.add('hidden');
        if (tab) tab.classList.remove('active');
    });
    
    const activeEl = document.getElementById(`animal-sounds-${mode}`);
    const activeTab = document.getElementById(`btn-tab-sound-${mode}`);
    if (activeEl) activeEl.classList.remove('hidden');
    if (activeTab) activeTab.classList.add('active');
    
    initAnimalGame();
}

function initAnimalGame() {
    if (activeAnimalSub === 'quiz') {
        generateAnimalQuizRound();
    } else if (activeAnimalSub === 'habitat') {
        generateAnimalHabitatRound();
    }
}

function generateAnimalQuizRound() {
    const selected = animalSoundPool[Math.floor(Math.random() * animalSoundPool.length)];
    animalSoundQuizAnswer = selected.name;
    
    // Play sound on load
    setTimeout(() => { replaySpokenAnimal(); }, 300);
    
    const cardGrid = document.getElementById('animal-soundboard-answers');
    cardGrid.innerHTML = '';
    
    animalSoundPool.forEach(animal => {
        const key = document.createElement('div');
        key.className = 'animal-key';
        key.style.flexDirection = 'column';
        key.innerHTML = `<div class="animal-avatar">${animal.emoji}</div><div class="animal-name">${animal.name}</div>`;
        key.onclick = () => validateAnimalSoundChoice(animal.name, key);
        
        // Add styling colors
        if (animal.name === 'lion') key.classList.add('lion');
        else if (animal.name === 'bird') key.classList.add('bird');
        else if (animal.name === 'frog') key.classList.add('frog');
        
        cardGrid.appendChild(key);
    });
}

function replaySpokenAnimal() {
    if (animalSoundQuizAnswer === 'lion') playSynthGrowl();
    else if (animalSoundQuizAnswer === 'bird') playSynthChirp();
    else if (animalSoundQuizAnswer === 'frog') playSynthCroak();
}

function validateAnimalSoundChoice(chosen, node) {
    if (chosen === animalSoundQuizAnswer) {
        playPopSound();
        playCorrectChime();
        spawnClickConfetti(node);
        awardStars(1);
        setMascotSpeechBubble("lion", `Awesome! You guessed correctly! It was the ${animalSoundQuizAnswer}!`);
        setTimeout(() => { generateAnimalQuizRound(); }, 1400);
    } else {
        playBuzzerWrong();
        node.classList.add('shake-bubble');
        setTimeout(() => { node.classList.remove('shake-bubble'); }, 400);
    }
}

// Animal SubGame 2: Habitat Matching Drag & Drop
const animalsHabitatsDef = [
    { name: 'Seagull', emoji: '🐦', habitat: 'sky' },
    { name: 'Dolphin', emoji: '🐬', habitat: 'ocean' },
    { name: 'Monkey', emoji: '🐒', habitat: 'jungle' }
];

function generateAnimalHabitatRound() {
    // Clear drop targets content
    document.getElementById('hab-sky-contents').innerHTML = '';
    document.getElementById('hab-ocean-contents').innerHTML = '';
    document.getElementById('hab-jungle-contents').innerHTML = '';
    
    const allHabitBoxes = document.querySelectorAll('.habitat-box');
    allHabitBoxes.forEach(box => {
        box.style.background = '';
    });
    
    const draggableContainer = document.getElementById('habitat-draggable-animals');
    draggableContainer.innerHTML = '';
    
    const list = [...animalsHabitatsDef].sort(() => Math.random() - 0.5);
    
    list.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'habitat-drag-card';
        card.id = `hab-card-${animal.name}`;
        card.draggable = true;
        card.innerText = animal.emoji + ' ' + animal.name;
        
        card.ondragstart = (e) => {
            e.dataTransfer.setData('text', JSON.stringify(animal));
        };
        
        // Tap alternative
        card.onclick = () => tapSelectHabitatAnimal(animal, card);
        
        draggableContainer.appendChild(card);
    });
}

let activeSelectedHabitatAnimal = null;
let activeSelectedHabitatAnimalNode = null;

function tapSelectHabitatAnimal(animalObj, node) {
    const allCards = document.querySelectorAll('.habitat-drag-card');
    allCards.forEach(c => c.style.transform = 'none');
    
    activeSelectedHabitatAnimal = animalObj;
    activeSelectedHabitatAnimalNode = node;
    node.style.transform = 'scale(1.2) translateY(-4px)';
    playFlipSound();
}

// Binds to target box clicks
document.getElementById('hab-sky').onclick = () => tapTargetHabitat('sky', document.getElementById('hab-sky'));
document.getElementById('hab-ocean').onclick = () => tapTargetHabitat('ocean', document.getElementById('hab-ocean'));
document.getElementById('hab-jungle').onclick = () => tapTargetHabitat('jungle', document.getElementById('hab-jungle'));

function tapTargetHabitat(habitatName, node) {
    if (activeSelectedHabitatAnimal && activeSelectedHabitatAnimal.habitat === habitatName) {
        snapHabitatAnimal(activeSelectedHabitatAnimal, node, activeSelectedHabitatAnimalNode);
        activeSelectedHabitatAnimal = null;
        activeSelectedHabitatAnimalNode = null;
    } else if (activeSelectedHabitatAnimal) {
        playBuzzerWrong();
        node.classList.add('shake-bubble');
        setTimeout(() => { node.classList.remove('shake-bubble'); }, 400);
    }
}

function dropAnimalHabitat(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text'));
    const targetId = e.currentTarget.id; // e.g. hab-sky
    
    const targetHabitat = targetId.split('-')[1]; // sky, ocean, jungle
    const draggedNode = document.getElementById(`hab-card-${data.name}`);
    
    if (data.habitat === targetHabitat) {
        snapHabitatAnimal(data, e.currentTarget, draggedNode);
    } else {
        playBuzzerWrong();
        e.currentTarget.classList.add('shake-bubble');
        setTimeout(() => { e.currentTarget.classList.remove('shake-bubble'); }, 400);
    }
}

function snapHabitatAnimal(data, targetBox, draggedNode) {
    playPopSound();
    playCorrectChime();
    
    targetBox.style.background = 'var(--green-light)';
    const dropzone = targetBox.querySelector('.hab-dropzone-contents');
    
    const card = document.createElement('div');
    card.className = 'habitat-drag-card';
    card.style.cursor = 'default';
    card.innerText = data.emoji + ' ' + data.name;
    dropzone.appendChild(card);
    
    if (draggedNode && draggedNode.parentNode) {
        draggedNode.parentNode.removeChild(draggedNode);
    }
    
    awardStars(2);
    spawnClickConfetti(targetBox);
    
    const remaining = document.getElementById('habitat-draggable-animals').childElementCount;
    if (remaining === 0) {
        setTimeout(() => {
            triggerGameOver(3);
        }, 1500);
    }
}

/* ============================================================
   9. GK SPACE KNOWLEDGE QUIZ
   ============================================================ */
let gkQuizActiveIndex = 0;
let gkQuizScore = 0;
let gkTriviaPool = [];

const GK_TRIVIA_LOCALIZED = {
    en: {
        opposites: [
            { question: 'What is the opposite of HOT?', choices: ['Cold', 'Warm', 'Big', 'Soft'], answer: 'Cold' },
            { question: 'What is the opposite of BIG?', choices: ['Small', 'Huge', 'Heavy', 'Tall'], answer: 'Small' },
            { question: 'What is the opposite of HAPPY?', choices: ['Sad', 'Glad', 'Funny', 'Sweet'], answer: 'Sad' },
            { question: 'What is the opposite of UP?', choices: ['Down', 'Left', 'Right', 'High'], answer: 'Down' },
            { question: 'What is the opposite of FAST?', choices: ['Slow', 'Quick', 'Rapid', 'Zoom'], answer: 'Slow' }
        ],
        synonyms: [
            { question: 'What is another word for LARGE?', choices: ['Huge', 'Tiny', 'Small', 'Narrow'], answer: 'Huge' },
            { question: 'What is another word for HAPPY?', choices: ['Glad', 'Sad', 'Angry', 'Scared'], answer: 'Glad' },
            { question: 'What is another word for QUICK?', choices: ['Fast', 'Slow', 'Quiet', 'Soft'], answer: 'Fast' },
            { question: 'What is another word for YUMMY?', choices: ['Delicious', 'Sour', 'Salty', 'Cold'], answer: 'Delicious' },
            { question: 'What is another word for SMART?', choices: ['Clever', 'Silly', 'Dull', 'Sleepy'], answer: 'Clever' }
        ],
        decimal: [
            { question: 'What is 1/2 as a decimal?', choices: ['0.5', '0.25', '0.75', '1.0'], answer: '0.5' },
            { question: 'What is 1/4 as a decimal?', choices: ['0.25', '0.5', '0.1', '0.75'], answer: '0.25' },
            { question: 'What is 0.75 as a fraction?', choices: ['3/4', '1/2', '1/4', '2/3'], answer: '3/4' },
            { question: 'What is 1/10 as a decimal?', choices: ['0.1', '0.01', '1.0', '0.5'], answer: '0.1' },
            { question: 'What is 1.0 as a percentage?', choices: ['100%', '10%', '50%', '1%'], answer: '100%' }
        ],
        clock: [
            { question: 'If the short hand is on 3 and the long hand is on 12, what time is it?', choices: ['3:00', '12:00', '6:00', '9:00'], answer: '3:00' },
            { question: 'If both hands point straight up at 12, what time is it?', choices: ['12:00', '6:00', '3:00', '1:00'], answer: '12:00' },
            { question: 'How many minutes are in one hour?', choices: ['60 minutes', '30 minutes', '12 minutes', '100 minutes'], answer: '60 minutes' },
            { question: 'If the time is 4:30, where is the long hand?', choices: ['At 6', 'At 12', 'At 4', 'At 3'], answer: 'At 6' },
            { question: 'What time is half past 8?', choices: ['8:30', '8:00', '9:00', '7:30'], answer: '8:30' }
        ],
        measure: [
            { question: 'Which animal is the tallest?', choices: ['🦒 Giraffe', '🐘 Elephant', '🦁 Lion', '🐒 Monkey'], answer: '🦒 Giraffe' },
            { question: 'Which fruit is typically the smallest?', choices: ['🍒 Cherry', '🍎 Apple', '🍉 Watermelon', '🍍 Pineapple'], answer: '🍒 Cherry' },
            { question: 'Which is heavier?', choices: ['🐳 Blue Whale', '🐟 Goldfish', '🐦 Seagull', '🐇 Bunny'], answer: '🐳 Blue Whale' },
            { question: 'Which of these is the longest tool?', choices: ['📏 Meter Ruler', '✏️ Pencil', '🖍️ Crayon', '🩹 Bandage'], answer: '📏 Meter Ruler' },
            { question: 'Which container holds the most water?', choices: ['🫙 Big Jug', '☕ Tea Cup', '🥄 Spoon', '🍼 Baby Bottle'], answer: '🫙 Big Jug' }
        ],
        grammar: [
            { question: 'Find the NOUN: "The happy kitty sleeps."', choices: ['kitty', 'happy', 'sleeps', 'The'], answer: 'kitty' },
            { question: 'Find the VERB: "Robbie the rabbit jumps high."', choices: ['jumps', 'rabbit', 'high', 'Robbie'], answer: 'jumps' },
            { question: 'Find the ADJECTIVE: "I saw a beautiful rainbow."', choices: ['beautiful', 'saw', 'rainbow', 'I'], answer: 'beautiful' },
            { question: 'Which word should be capitalized in: "we love mommy bear."', choices: ['We', 'love', 'mommy', 'bear'], answer: 'We' },
            { question: 'Choose correct word: "The birds ______ flying."', choices: ['are', 'is', 'am', 'was'], answer: 'are' }
        ],
        nouns: [
            { question: 'Is "RUN" a Noun or a Verb?', choices: ['Verb', 'Noun'], answer: 'Verb' },
            { question: 'Is "TEDDY BEAR" a Noun or a Verb?', choices: ['Noun', 'Verb'], answer: 'Noun' },
            { question: 'Is "EAT" a Noun or a Verb?', choices: ['Verb', 'Noun'], answer: 'Verb' },
            { question: 'Is "SCHOOL" a Noun or a Verb?', choices: ['Noun', 'Verb'], answer: 'Noun' },
            { question: 'Is "PLAY" a Noun or a Verb?', choices: ['Verb', 'Noun'], answer: 'Verb' }
        ],
        hidden: [
            { question: 'Find the hidden key: 🔑', choices: ['🔑', '🔒', '🚪', '🎁'], answer: '🔑' },
            { question: 'Find the hidden teddy bear: 🧸', choices: ['🧸', '🎈', '🚗', '🎨'], answer: '🧸' },
            { question: 'Find the hidden magic wand: 🪄', choices: ['🪄', '👑', '💎', '🎀'], answer: '🪄' },
            { question: 'Find the hidden froggy: 🐸', choices: ['🐸', '🐱', '🐶', '🐯'], answer: '🐸' },
            { question: 'Find the hidden golden star: ⭐', choices: ['⭐', '☁️', '☀️', '🌧️'], answer: '⭐' }
        ],
        diff: [
            { question: 'Spot the odd one out!', choices: ['🐱', '🐱', '🐶', '🐱'], answer: '🐶' },
            { question: 'Spot the different fruit!', choices: ['🍎', '🍎', '🍎', '🍌'], answer: '🍌' },
            { question: 'Spot the different emoji!', choices: ['❤️', '❤️', '💔', '❤️'], answer: '💔' },
            { question: 'Spot the different vehicle!', choices: ['🏎️', '🏎️', '🚀', '🏎️'], answer: '🚀' },
            { question: 'Spot the different letter!', choices: ['A', 'A', 'B', 'A'], answer: 'B' }
        ],
        logic: [
            { question: 'Complete the pattern: 🔴, 🔵, 🔴, 🔵, ?', choices: ['🔴', '🔵', '🟢', '🟡'], answer: '🔴' },
            { question: 'Which shape fits next: 🔺, ⬜, 🔺, ⬜, ?', choices: ['🔺', '⬜', '🟡', '⭐'], answer: '🔺' },
            { question: 'Complete the number sequence: 2, 4, 6, 8, ?', choices: ['10', '9', '11', '12'], answer: '10' },
            { question: 'Which animal makes honey?', choices: ['🐝 Honeybee', '🦋 Butterfly', '🐞 Ladybug', '🐜 Ant'], answer: '🐝 Honeybee' },
            { question: 'If today is Monday, what is tomorrow?', choices: ['Tuesday', 'Sunday', 'Wednesday', 'Saturday'], answer: 'Tuesday' }
        ],
        dinos: [
            { question: 'Which dinosaur had three sharp horns on its face?', choices: ['Triceratops', 'T-Rex', 'Stegosaurus', 'Brachiosaurus'], answer: 'Triceratops' },
            { question: 'Which meat-eater had tiny arms and sharp teeth?', choices: ['T-Rex', 'Velociraptor', 'Spinosaurus', 'Pterodactyl'], answer: 'T-Rex' },
            { question: 'Which dinosaur had bony plates and a spiked tail?', choices: ['Stegosaurus', 'Ankylosaurus', 'Diplodocus', 'T-Rex'], answer: 'Stegosaurus' },
            { question: 'Could dinosaur fossils be dug from the ground?', choices: ['Yes, we dig them up!', 'No, they dissolved!', 'Yes, they are in trees!', 'No, dinosaurs are in space!'], answer: 'Yes, we dig them up!' },
            { question: 'Which dinosaur could fly high in ancient skies?', choices: ['Pterodactyl', 'Velociraptor', 'Brachiosaurus', 'Triceratops'], answer: 'Pterodactyl' }
        ],
        science: [
            { question: 'What force pulls everything down to the ground?', choices: ['Gravity', 'Magnetism', 'Wind', 'Sunlight'], answer: 'Gravity' },
            { question: 'What makes paperclips stick to magnets?', choices: ['Magnets', 'Glue', 'Gravity', 'Static'], answer: 'Magnets' },
            { question: 'What does water turn into when you boil it?', choices: ['Steam / Gas', 'Ice', 'Cloud', 'Sand'], answer: 'Steam / Gas' },
            { question: 'Which planet do we live on?', choices: ['Earth', 'Mars', 'Saturn', 'Venus'], answer: 'Earth' },
            { question: 'Which star keeps our whole solar system warm?', choices: ['The Sun', 'The Moon', 'Polaris', 'Jupiter'], answer: 'The Sun' }
        ],
        default: [
            { question: 'Which planet has beautiful rings around it?', choices: ['Saturn', 'Mars', 'Mercury', 'Venus'], answer: 'Saturn' },
            { question: 'Which star gives warmth and light to Earth?', choices: ['The Sun', 'Polaris', 'Sirius', 'Vega'], answer: 'The Sun' },
            { question: 'Which organ pumps blood inside your body?', choices: ['Heart', 'Brain', 'Lungs', 'Stomach'], answer: 'Heart' },
            { question: 'How many colors make up a rainbow?', choices: ['7 colors', '5 colors', '10 colors', '3 colors'], answer: '7 colors' },
            { question: 'Which massive animal lived on Earth long ago?', choices: ['Dinosaurs', 'Lions', 'Elephants', 'Grizzlies'], answer: 'Dinosaurs' }
        ]
    },
    hi: {
        opposites: [
            { question: 'HOT (गर्म) का विपरीत शब्द क्या है?', choices: ['Cold (ठंडा)', 'Warm (गुनगुना)', 'Big (बड़ा)', 'Soft (नरम)'], answer: 'Cold (ठंडा)' },
            { question: 'BIG (बड़ा) का विपरीत शब्द क्या है?', choices: ['Small (छोटा)', 'Huge (विशाल)', 'Heavy (भारी)', 'Tall (लंबा)'], answer: 'Small (छोटा)' },
            { question: 'HAPPY (खुश) का विपरीत शब्द क्या है?', choices: ['Sad (दुखी)', 'Glad (प्रसन्न)', 'Funny (मजेदार)', 'Sweet (मीठा)'], answer: 'Sad (दुखी)' },
            { question: 'UP (ऊपर) का विपरीत शब्द क्या है?', choices: ['Down (नीचे)', 'Left (बाएं)', 'Right (दाएं)', 'High (उच्च)'], answer: 'Down (नीचे)' },
            { question: 'FAST (तेज़) का विपरीत शब्द क्या है?', choices: ['Slow (धीमा)', 'Quick (त्वरित)', 'Rapid (तेज़)', 'Zoom (ज़ूम)'], answer: 'Slow (धीमा)' }
        ],
        synonyms: [
            { question: 'LARGE (बड़ा) का पर्यायवाची शब्द क्या है?', choices: ['Huge (विशाल)', 'Tiny (नन्हा)', 'Small (छोटा)', 'Narrow (सँकरा)'], answer: 'Huge (विशाल)' },
            { question: 'HAPPY (खुश) का पर्यायवाची शब्द क्या है?', choices: ['Glad (प्रसन्न)', 'Sad (दुखी)', 'Angry (क्रोधित)', 'Scared (डरा हुआ)'], answer: 'Glad (प्रसन्न)' },
            { question: 'QUICK (तेज़) का पर्यायवाची शब्द क्या है?', choices: ['Fast (तेज़)', 'Slow (धीमा)', 'Quiet (शांत)', 'Soft (नरम)'], answer: 'Fast (तेज़)' },
            { question: 'YUMMY (स्वादिष्ट) का पर्यायवाची शब्द क्या है?', choices: ['Delicious (लज़ीज़)', 'Sour (खट्टा)', 'Salty (नमकीन)', 'Cold (ठंडा)'], answer: 'Delicious (लज़ीज़)' },
            { question: 'SMART (होशियार) का पर्यायवाची शब्द क्या है?', choices: ['Clever (चतुर)', 'Silly (मूर्ख)', 'Dull (सुस्त)', 'Sleepy (नींद में)'], answer: 'Clever (चतुर)' }
        ],
        decimal: [
            { question: '1/2 दशमलव में क्या होगा?', choices: ['0.5', '0.25', '0.75', '1.0'], answer: '0.5' },
            { question: '1/4 दशमलव में क्या होगा?', choices: ['0.25', '0.5', '0.1', '0.75'], answer: '0.25' },
            { question: '0.75 भिन्न में क्या होगा?', choices: ['3/4', '1/2', '1/4', '2/3'], answer: '3/4' },
            { question: '1/10 दशमलव में क्या होगा?', choices: ['0.1', '0.01', '1.0', '0.5'], answer: '0.1' },
            { question: '1.0 प्रतिशत में कितना होगा?', choices: ['100%', '10%', '50%', '1%'], answer: '100%' }
        ],
        clock: [
            { question: 'यदि छोटी सुई 3 पर और बड़ी सुई 12 पर हो, तो समय क्या है?', choices: ['3:00', '12:00', '6:00', '9:00'], answer: '3:00' },
            { question: 'यदि दोनों सुइयाँ सीधे 12 पर हों, तो समय क्या है?', choices: ['12:00', '6:00', '3:00', '1:00'], answer: '12:00' },
            { question: 'एक घंटे में कितने मिनट होते हैं?', choices: ['60 मिनट', '30 मिनट', '12 मिनट', '100 मिनट'], answer: '60 मिनट' },
            { question: 'यदि समय 4:30 है, तो बड़ी सुई कहाँ है?', choices: ['6 पर', '12 पर', '4 पर', '3 पर'], answer: '6 पर' },
            { question: 'साढ़े आठ (8:30) का क्या मतलब है?', choices: ['8:30', '8:00', '9:00', '7:30'], answer: '8:30' }
        ],
        measure: [
            { question: 'कौन सा जानवर सबसे लंबा है?', choices: ['🦒 जिराफ', '🐘 हाथी', '🦁 शेर', '🐒 बंदर'], answer: '🦒 जिराफ' },
            { question: 'कौन सा फल आमतौर पर सबसे छोटा होता है?', choices: ['🍒 चेरी', '🍎 सेब', '🍉 तरबूज', '🍍 अनानास'], answer: '🍒 चेरी' },
            { question: 'कौन सा भारी है?', choices: ['🐳 ब्लू व्हेल', '🐟 सुनहरी मछली', '🐦 सीगल', '🐇 खरगोश'], answer: '🐳 ब्लू व्हेल' },
            { question: 'इनमें से कौन सा सबसे लंबा उपकरण है?', choices: ['📏 मीटर स्केल', '✏️ पेंसिल', '🖍️ क्रेयॉन', '🩹 पट्टी'], answer: '📏 मीटर स्केल' },
            { question: 'किस बर्तन में सबसे अधिक पानी आता है?', choices: ['🫙 बड़ा जग', '☕ चाय का प्याला', '🥄 चम्मच', '🍼 बच्चों की बोतल'], answer: '🫙 बड़ा जग' }
        ],
        grammar: [
            { question: 'संज्ञा खोजें: "प्यारी बिल्ली सो रही है।"', choices: ['बिल्ली', 'प्यारी', 'सो रही है', 'है'], answer: 'बिल्ली' },
            { question: 'क्रिया खोजें: "खरगोश छलांग लगाता है।\"', choices: ['छलांग लगाता है', 'खरगोश', 'प्यारा', 'तेज़'], answer: 'छलांग लगाता है' },
            { question: 'विशेषण खोजें: "मैंने एक सुंदर इंद्रधनुष देखा।"', choices: ['सुंदर', 'देखा', 'इंद्रधनुष', 'मैंने'], answer: 'सुंदर' },
            { question: 'संज्ञा छाँटें: "हम अपनी मम्मी को प्यार करते हैं।"', choices: ['मम्मी', 'प्यार', 'हम', 'अपनी'], answer: 'मम्मी' },
            { question: 'सही शब्द चुनें: "पक्षी आकाश में उड़ ______ रहे हैं।"', choices: ['रहे', 'रहा', 'रही', 'था'], answer: 'रहे' }
        ],
        nouns: [
            { question: 'क्या "दौड़ना" एक संज्ञा है या क्रिया?', choices: ['क्रिया', 'संज्ञा'], answer: 'क्रिया' },
            { question: 'क्या "टेडी बियर" एक संज्ञा है या क्रिया?', choices: ['संज्ञा', 'क्रिया'], answer: 'संज्ञा' },
            { question: 'क्या "खाना" एक संज्ञा है या क्रिया?', choices: ['क्रिया', 'संज्ञा'], answer: 'क्रिया' },
            { question: 'क्या "स्कूल" एक संज्ञा है या क्रिया?', choices: ['संज्ञा', 'क्रिया'], answer: 'संज्ञा' },
            { question: 'क्या "खेलना" एक संज्ञा है या क्रिया?', choices: ['क्रिया', 'संज्ञा'], answer: 'क्रिया' }
        ],
        hidden: [
            { question: 'छिपी हुई चाबी खोजें: 🔑', choices: ['🔑', '🔒', '🚪', '🎁'], answer: '🔑' },
            { question: 'छिपा हुआ टेडी बियर खोजें: 🧸', choices: ['🧸', '🎈', '🚗', '🎨'], answer: '🧸' },
            { question: 'छिपी हुई जादुई छड़ी खोजें: 🪄', choices: ['🪄', '👑', '💎', '🎀'], answer: '🪄' },
            { question: 'छिपा हुआ मेंढक खोजें: 🐸', choices: ['🐸', '🐱', '🐶', '🐯'], answer: '🐸' },
            { question: 'छिपा हुआ सुनहरा तारा खोजें: ⭐', choices: ['⭐', '☁️', '☀️', '🌧️'], answer: '⭐' }
        ],
        diff: [
            { question: 'विषम का पता लगाएं!', choices: ['🐱', '🐱', '🐶', '🐱'], answer: '🐶' },
            { question: 'अलग फल को पहचानें!', choices: ['🍎', '🍎', '🍎', '🍌'], answer: '🍌' },
            { question: 'अलग इमोजी ढूंढें!', choices: ['❤️', '❤️', '💔', '❤️'], answer: '💔' },
            { question: 'अलग वाहन पहचानें!', choices: ['🏎️', '🏎️', '🚀', '🏎️'], answer: '🚀' },
            { question: 'अलग अक्षर बताएं!', choices: ['A', 'A', 'B', 'A'], answer: 'B' }
        ],
        logic: [
            { question: 'पैटर्न पूरा करें: 🔴, 🔵, 🔴, 🔵, ?', choices: ['🔴', '🔵', '🟢', '🟡'], answer: '🔴' },
            { question: 'अगली आकृति कौन सी होगी: 🔺, ⬜, 🔺, ⬜, ?', choices: ['🔺', '⬜', '🟡', '⭐'], answer: '🔺' },
            { question: 'संख्या श्रृंखला पूरी करें: 2, 4, 6, 8, ?', choices: ['10', '9', '11', '12'], answer: '10' },
            { question: 'कौन सा कीट शहद बनाता है?', choices: ['🐝 मधुमक्खी', '🦋 तितली', '🐞 लेडीबग', '🐜 चींटी'], answer: '🐝 मधुमक्खी' },
            { question: 'यदि आज सोमवार है, तो कल क्या है?', choices: ['मंगलवार', 'रविवार', 'बुधवार', 'शनिवार'], answer: 'मंगलवार' }
        ],
        dinos: [
            { question: 'किस डायनासोर के चेहरे पर तीन नुकीले सींग थे?', choices: ['Triceratops', 'T-Rex', 'Stegosaurus', 'Brachiosaurus'], answer: 'Triceratops' },
            { question: 'किस मांसाहारी के छोटे हाथ और नुकीले दांत थे?', choices: ['T-Rex', 'Velociraptor', 'Spinosaurus', 'Pterodactyl'], answer: 'T-Rex' },
            { question: 'किस डायनासोर की पीठ पर प्लेटें और कांटेदार पूंछ थी?', choices: ['Stegosaurus', 'Ankylosaurus', 'Diplodocus', 'T-Rex'], answer: 'Stegosaurus' },
            { question: 'क्या डायनासोर के जीवाश्म जमीन से खोदे जा सकते हैं?', choices: ['हाँ, हम उन्हें खोदते हैं!', 'नहीं, वे घुल गए!', 'हाँ, वे पेड़ों पर हैं!', 'नहीं, डायनासोर अंतरिक्ष में हैं!'], answer: 'हाँ, हम उन्हें खोदते हैं!' },
            { question: 'प्राचीन आकाश में कौन सा डायनासोर उड़ सकता था?', choices: ['Pterodactyl', 'Velociraptor', 'Brachiosaurus', 'Triceratops'], answer: 'Pterodactyl' }
        ],
        science: [
            { question: 'कौन सा बल हर चीज़ को ज़मीन की ओर खींचता है?', choices: ['गुरुत्वाकर्षण', 'चुंबकत्व', 'हवा', 'धूप'], answer: 'गुरुत्वाकर्षण' },
            { question: 'पेपरक्लिप चुंबक से क्यों चिपकते हैं?', choices: ['चुंबकत्व', 'गोंद', 'गुरुत्वाकर्षण', 'स्टेटिक'], answer: 'चुंबकत्व' },
            { question: 'पानी उबालने पर वह किसमें बदल जाता है?', choices: ['भाप / गैस', 'बर्फ', 'बादल', 'रेत'], answer: 'भाप / गैस' },
            { question: 'हम किस ग्रह पर रहते हैं?', choices: ['पृथ्वी', 'मंगल', 'शनि', 'शुक्र'], answer: 'पृथ्वी' },
            { question: 'कौन सा तारा पूरे सौरमंडल को गर्म रखता है?', choices: ['सूर्य', 'चंद्रमा', 'ध्रुव तारा', 'बृहस्पति'], answer: 'सूर्य' }
        ],
        default: [
            { question: 'किस ग्रह के चारों ओर सुंदर छल्ले हैं?', choices: ['शनि', 'मंगल', 'बुध', 'शुक्र'], answer: 'शनि' },
            { question: 'कौन सा तारा पृथ्वी को गर्मी और प्रकाश देता है?', choices: ['सूर्य', 'ध्रुव तारा', 'सीरियस', 'वेगा'], answer: 'सूर्य' },
            { question: 'कौन सा अंग आपके शरीर में रक्त पंप करता है?', choices: ['हृदय', 'मस्तिष्क', 'फेफड़े', 'पेट'], answer: 'हृदय' },
            { question: 'इंद्रधनुष में कितने रंग होते हैं?', choices: ['7 रंग', '5 रंग', '10 रंग', '3 रंग'], answer: '7 रंग' },
            { question: 'बहुत पहले पृथ्वी पर कौन सा विशाल जानवर रहता था?', choices: ['डायनासोर', 'शेर', 'हाथी', 'भालू'], answer: 'डायनासोर' }
        ]
    },
    ta: {
        opposites: [
            { question: 'HOT (சூடு) என்பதன் எதிர்ச்சொல் என்ன?', choices: ['Cold (குளிர்ச்சி)', 'Warm (மிதவெப்பம்)', 'Big (பெரிய)', 'Soft (மென்மையான)'], answer: 'Cold (குளிர்ச்சி)' },
            { question: 'BIG (பெரிய) என்பதன் எதிர்ச்சொல் என்ன?', choices: ['Small (சிறிய)', 'Huge (பிரம்மாண்ட)', 'Heavy (கனமான)', 'Tall (உயரமான)'], answer: 'Small (சிறிய)' },
            { question: 'HAPPY (மகிழ்ச்சி) என்பதன் எதிர்ச்சொல் என்ன?', choices: ['Sad (சோகம்)', 'Glad (உற்சாகம்)', 'Funny (வேடிக்கையான)', 'Sweet (இனிப்பான)'], answer: 'Sad (சோகம்)' },
            { question: 'UP (மேலே) என்பதன் எதிர்ச்சொல் என்ன?', choices: ['Down (கீழே)', 'Left (இடது)', 'Right (வலது)', 'High (உயர்ந்த)'], answer: 'Down (கீழே)' },
            { question: 'FAST (வேகமாக) என்பதன் எதிர்ச்சொல் என்ன?', choices: ['Slow (மெதுவாக)', 'Quick (விரைவாக)', 'Rapid (வேகமான)', 'Zoom (ஜூம்)'], answer: 'Slow (மெதுவாக)' }
        ],
        synonyms: [
            { question: 'LARGE (பெரிய) என்பதன் இணையான சொல் என்ன?', choices: ['Huge (பிரம்மாண்ட)', 'Tiny (சிறிய)', 'Small (சின்ன)', 'Narrow (குறுகிய)'], answer: 'Huge (பிரம்மாண்ட)' },
            { question: 'HAPPY (மகிழ்ச்சி) என்பதன் இணையான சொல் என்ன?', choices: ['Glad (மகிழ்வான)', 'Sad (சோகமான)', 'Angry (கோபமான)', 'Scared (பயந்த)'], answer: 'Glad (மகிழ்வான)' },
            { question: 'QUICK (வேகமாக) என்பதன் இணையான சொல் என்ன?', choices: ['Fast (விரைவாக)', 'Slow (மெதுவாக)', 'Quiet (அமைதியாக)', 'Soft (மென்மையான)'], answer: 'Fast (விரைவாக)' },
            { question: 'YUMMY (சுவையான) என்பதன் இணையான சொல் என்ன?', choices: ['Delicious (அருமையான)', 'Sour (புளிப்பான)', 'Salty (உவர்ப்பான)', 'Cold (குளிர்ந்த)'], answer: 'Delicious (அருமையான)' },
            { question: 'SMART (புத்திசாலி) என்பதன் இணையான சொல் என்ன?', choices: ['Clever (சாமர்த்தியமான)', 'Silly (அறிவற்ற)', 'Dull (மந்தமான)', 'Sleepy (தூக்கமான)'], answer: 'Clever (சாமர்த்தியமான)' }
        ],
        decimal: [
            { question: '1/2 என்பது தசமத்தில் என்ன?', choices: ['0.5', '0.25', '0.75', '1.0'], answer: '0.5' },
            { question: '1/4 என்பது தசமத்தில் என்ன?', choices: ['0.25', '0.5', '0.1', '0.75'], answer: '0.25' },
            { question: '0.75 என்பது பின்னத்தில் என்ன?', choices: ['3/4', '1/2', '1/4', '2/3'], answer: '3/4' },
            { question: '1/10 என்பது தசமத்தில் என்ன?', choices: ['0.1', '0.01', '1.0', '0.5'], answer: '0.1' },
            { question: '1.0 என்பது சதவீதத்தில் எவ்வளவு?', choices: ['100%', '10%', '50%', '1%'], answer: '100%' }
        ],
        clock: [
            { question: 'சிறிய முள் 3-லும் பெரிய முள் 12-லும் இருந்தால் மணி என்ன?', choices: ['3:00', '12:00', '6:00', '9:00'], answer: '3:00' },
            { question: 'இரு முட்களும் நேராக 12-ல் இருந்தால் மணி என்ன?', choices: ['12:00', '6:00', '3:00', '1:00'], answer: '12:00' },
            { question: 'ஒரு மணி நேரத்தில் எத்தனை நிமிடங்கள் உள்ளன?', choices: ['60 நிமிடங்கள்', '30 நிமிடங்கள்', '12 நிமிடங்கள்', '100 நிமிடங்கள்'], answer: '60 நிமிடங்கள்' },
            { question: 'நேரம் 4:30 என்றால், பெரிய முள் எங்கு இருக்கும்?', choices: ['6-ல்', '12-ல்', '4-ல்', '3-ல்'], answer: '6-ல்' },
            { question: 'எட்டரை (8:30) என்பது என்ன நேரம்?', choices: ['8:30', '8:00', '9:00', '7:30'], answer: '8:30' }
        ],
        measure: [
            { question: 'எந்த விலங்கு மிக உயரமானது?', choices: ['🦒 ஒட்டகச்சிவிங்கி', '🐘 யானை', '🦁 சிங்கம்', '🐒 குரங்கு'], answer: '🦒 ஒட்டகச்சிவிங்கி' },
            { question: 'எந்தப் பழம் மிகவும் சிறியது?', choices: ['🍒 செர்ரி', '🍎 ஆப்பிள்', '🍉 தர்பூசணி', '🍍 அன்னாசி'], answer: '🍒 செர்ரி' },
            { question: 'எது அதிக எடையுள்ளது?', choices: ['🐳 நீல திமிங்கலம்', '🐟 தங்க மீன்', '🐦 சீகல்', '🐇 முயல் குட்டி'], answer: '🐳 நீல திமிங்கலம்' },
            { question: 'இவற்றில் எது மிக நீளமான கருவி?', choices: ['📏 மீட்டர் அளவுக்கோல்', '✏️ பென்சில்', '🖍️ கிரேயான்', '🩹 கட்டுப்போடும் துணி'], answer: '📏 மீட்டர் அளவுக்கோல்' },
            { question: 'எந்தக் கொள்கலனில் அதிக நீர் பிடிக்கும்?', choices: ['🫙 பெரிய ஜாடி', '☕ தேநீர் கோப்பை', '🥄 ஸ்பூன்', '🍼 பால் பாட்டில்'], answer: '🫙 பெரிய ஜாடி' }
        ],
        grammar: [
            { question: 'பெயர்ச்சொல்லைக் கண்டுபிடி: "அழகான பூனை தூங்குகிறது."', choices: ['பூனை', 'அழகான', 'தூங்குகிறது', 'இல்லை'], answer: 'பூனை' },
            { question: 'வினைச்சொல்லைக் கண்டுபிடி: "முயல் வேகமாக ஓடுகிறது."', choices: ['ஓடுகிறது', 'முயல்', 'வேகமாக', 'அழகு'], answer: 'ஓடுகிறது' },
            { question: 'உரிச்சொல்லைக் கண்டுபிடி: "நான் ஒரு அழகான வானவில்லைக் கண்டேன்."', choices: ['அழகான', 'கண்டேன்', 'வானவில்', 'நான்'], answer: 'அழகான' },
            { question: 'பெயர்ச்சொல்லைக் கண்டுபிடி: "நாங்கள் எங்கள் அம்மாவை நேசிக்கிறோம்."', choices: ['அம்மா', 'நேசிக்கிறோம்', 'நாங்கள்', 'எங்கள்'], answer: 'அம்மா' },
            { question: 'சரியான சொல்லைத் தேர்ந்தெடு: "பறவைகள் வானத்தில் பறந்து ______."', choices: ['கொண்டிருக்கின்றன', 'கொண்டிருக்கிறது', 'கொண்டிருந்தான்', 'இல்லை'], answer: 'கொண்டிருக்கின்றன' }
        ],
        nouns: [
            { question: '"ஓடுதல்" என்பது பெயர்ச்சொல்லா அல்லது வினைச்சொல்லா?', choices: ['வினைச்சொல்', 'பெயர்ச்சொல்'], answer: 'வினைச்சொல்' },
            { question: '"டெடி பியர்" என்பது பெயர்ச்சொல்லா அல்லது வினைச்சொல்லா?', choices: ['பெயர்ச்சொல்', 'வினைச்சொல்'], answer: 'பெயர்ச்சொல்' },
            { question: '"சாப்பிடுதல்" என்பது பெயர்ச்சொல்லா அல்லது வினைச்சொல்லா?', choices: ['வினைச்சொல்', 'பெயர்ச்சொல்'], answer: 'வினைச்சொல்' },
            { question: '"பள்ளி" என்பது பெயர்ச்சொல்லா அல்லது வினைச்சொல்லா?', choices: ['பெயர்ச்சொல்', 'வினைச்சொல்'], answer: 'பெயர்ச்சொல்' },
            { question: '"விளையாடுதல்" என்பது பெயர்ச்சொல்லா அல்லது வினைச்சொல்லா?', choices: ['வினைச்சொல்', 'பெயர்ச்சொல்'], answer: 'வினைச்சொல்' }
        ],
        hidden: [
            { question: 'மறைந்திருக்கும் சாவியைக் கண்டுபிடி: 🔑', choices: ['🔑', '🔒', '🚪', '🎁'], answer: '🔑' },
            { question: 'மறைந்திருக்கும் பொம்மையைக் கண்டுபிடி: 🧸', choices: ['🧸', '🎈', '🚗', '🎨'], answer: '🧸' },
            { question: 'மறைந்திருக்கும் மந்திரக் கோலைக் கண்டுபிடி: 🪄', choices: ['🪄', '👑', '💎', '🎀'], answer: '🪄' },
            { question: 'மறைந்திருக்கும் தவளையைக் கண்டுபிடி: 🐸', choices: ['🐸', '🐱', '🐶', '🐯'], answer: '🐸' },
            { question: 'மறைந்திருக்கும் தங்க நட்சத்திரத்தைக் கண்டுபிடி: ⭐', choices: ['⭐', '☁️', '☀️', '🌧️'], answer: '⭐' }
        ],
        diff: [
            { question: 'வேறுபட்ட ஒன்றைக் கண்டுபிடி!', choices: ['🐱', '🐱', '🐶', '🐱'], answer: '🐶' },
            { question: 'வேறுபட்ட பழத்தைத் தேர்ந்தெடு!', choices: ['🍎', '🍎', '🍎', '🍌'], answer: '🍌' },
            { question: 'வேறுபட்ட ஈமோஜியைக் கண்டுபிடி!', choices: ['❤️', '❤️', '💔', '❤️'], answer: '💔' },
            { question: 'வேறுபட்ட வாகனத்தைக் கண்டுபிடி!', choices: ['🏎️', '🏎️', '🚀', '🏎️'], answer: '🚀' },
            { question: 'வேறுபட்ட எழுத்தைத் தேர்ந்தெடு!', choices: ['A', 'A', 'B', 'A'], answer: 'B' }
        ],
        logic: [
            { question: 'முறையை நிறைவு செய்: 🔴, 🔵, 🔴, 🔵, ?', choices: ['🔴', '🔵', '🟢', '🟡'], answer: '🔴' },
            { question: 'அடுத்து எந்த வடிவம் வரும்: 🔺, ⬜, 🔺, ⬜, ?', choices: ['🔺', '⬜', '🟡', '⭐'], answer: '🔺' },
            { question: 'எண் தொடரை நிறைவு செய்: 2, 4, 6, 8, ?', choices: ['10', '9', '11', '12'], answer: '10' },
            { question: 'எந்த விலங்கு தேன் சேகரிக்கிறது?', choices: ['🐝 தேனீ', '🦋 பட்டாம்பூச்சி', '🐞 பொன்வண்டு', '🐜 எறும்பு'], answer: '🐝 தேனீ' },
            { question: 'இன்று திங்கள் என்றால், நாளை என்ன கிழமை?', choices: ['செவ்வாய்', 'ஞாயிறு', 'புதன்', 'சனி'], answer: 'செவ்வாய்' }
        ],
        dinos: [
            { question: 'மூன்று கூர்மையான கொம்புகளைக் கொண்ட டைனோசர் எது?', choices: ['Triceratops', 'T-Rex', 'Stegosaurus', 'Brachiosaurus'], answer: 'Triceratops' },
            { question: 'சிறிய கைகளையும் கூர்மையான பற்களையும் கொண்ட ஊனுண்ணி எது?', choices: ['T-Rex', 'Velociraptor', 'Spinosaurus', 'Pterodactyl'], answer: 'T-Rex' },
            { question: 'முதுகில் ஓடுகளையும் முள் வாலையும் கொண்ட டைனோசர் எது?', choices: ['Stegosaurus', 'Ankylosaurus', 'Diplodocus', 'T-Rex'], answer: 'Stegosaurus' },
            { question: 'டைனோசர் எலும்புகளை நிலத்திலிருந்து தோண்டி எடுக்கலாமா?', choices: ['ஆம், நாம் தோண்டி எடுக்கிறோம்!', 'இல்லை, அவை கரைந்துவிட்டன!', 'ஆம், மரத்தில் உள்ளன!', 'இல்லை, விண்வெளியில் உள்ளன!'], answer: 'ஆம், நாம் தோண்டி எடுக்கிறோம்!' },
            { question: 'பழங்கால வானத்தில் பறக்கக்கூடிய டைனோசர் எது?', choices: ['Pterodactyl', 'Velociraptor', 'Brachiosaurus', 'Triceratops'], answer: 'Pterodactyl' }
        ],
        science: [
            { question: 'பொருட்களை பூமியை நோக்கி இழுக்கும் விசை எது?', choices: ['புவியீர்ப்பு விசை', 'காந்த விசை', 'காற்று', 'சூரிய ஒளி'], answer: 'புவியீர்ப்பு விசை' },
            { question: 'உலோகப் பொருட்கள் ஏன் காந்தத்துடன் ஒட்டிக்கொள்கின்றன?', choices: ['காந்த விசை', 'பசை', 'புவியீர்ப்பு', 'இல்லை'], answer: 'காந்த விசை' },
            { question: 'நீரைக் கொதிக்க வைத்தால் அது என்னவாக மாறும்?', choices: ['நீராவி / வாயு', 'பனி', 'மேகம்', 'மணல்'], answer: 'நீராவி / வாயு' },
            { question: 'நாம் எந்தக் கோளில் வாழ்கிறோம்?', choices: ['பூமி', 'செவ்வாய்', 'சனி', 'வெள்ளி'], answer: 'பூமி' },
            { question: 'சூரிய குடும்பத்திற்கு வெப்பத்தைத் தரும் விண்மீன் எது?', choices: ['சூரியன்', 'நிலா', 'துருவ விண்மீன்', 'வியாழன்'], answer: 'சூரியன்' }
        ],
        default: [
            { question: 'அழகான வளையங்களைக் கொண்ட கோள் எது?', choices: ['சனி', 'செவ்வாய்', 'புதன்', 'வெள்ளி'], answer: 'சனி' },
            { question: 'பூமிக்கு ஒளியும் வெப்பமும் தரும் விண்மீன் எது?', choices: ['சூரியன்', 'துருவ விண்மீன்', 'சிரியஸ்', 'வேகா'], answer: 'சூரியன்' },
            { question: 'உடலில் இரத்தத்தை செலுத்தும் உறுப்பு எது?', choices: ['இதயம்', 'மூளை', 'நுரையீரல்', 'வயிறு'], answer: 'இதயம்' },
            { question: 'வானவில்லில் எத்தனை வண்ணங்கள் உள்ளன?', choices: ['7 வண்ணங்கள்', '5 வண்ணங்கள்', '10 வண்ணங்கள்', '3 வண்ணங்கள்'], answer: '7 வண்ணங்கள்' },
            { question: 'பூமியில் வாழ்ந்த மிகப்பாரிய விலங்கு எது?', choices: ['டைனோசர்', 'சிங்கம்', 'யானை', 'கரடி'], answer: 'டைனோசர்' }
        ]
    }
};

function initGKGame() {
    gkQuizActiveIndex = 0;
    gkQuizScore = 0;
    
    const topic = (currentActiveGame && currentActiveGame.config && currentActiveGame.config.topic) ? currentActiveGame.config.topic : 'default';
    const lang = currentLanguage || 'en';
    
    gkTriviaPool = (GK_TRIVIA_LOCALIZED[lang] && GK_TRIVIA_LOCALIZED[lang][topic]) 
                   ? GK_TRIVIA_LOCALIZED[lang][topic] 
                   : (GK_TRIVIA_LOCALIZED['en'][topic] || GK_TRIVIA_LOCALIZED['en']['default']);
                   
    renderGKQuestion();
}

function renderGKQuestion() {
    const data = gkTriviaPool[gkQuizActiveIndex];
    
    // Update progress bar percentage
    const percent = ((gkQuizActiveIndex + 1) / gkTriviaPool.length) * 100;
    document.getElementById('gk-quiz-progress').style.width = `${percent}%`;
    
    document.getElementById('gk-question-num').innerText = gkQuizActiveIndex + 1;
    document.getElementById('gk-question-display').innerText = data.question;
    
    // Narrate active question
    speakSpeech(data.question);
    
    const answersGrid = document.getElementById('gk-answers-display');
    answersGrid.innerHTML = '';
    
    data.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'gk-answer-btn';
        btn.innerText = choice;
        btn.onclick = () => validateGKChoice(choice, btn);
        answersGrid.appendChild(btn);
    });
}

function validateGKChoice(choice, btnNode) {
    const correctAns = gkTriviaPool[gkQuizActiveIndex].answer;
    const isCorrect = choice === correctAns;
    
    if (isCorrect) {
        playPopSound();
        playCorrectChime();
        btnNode.style.background = 'var(--green-light)';
        btnNode.style.borderColor = 'var(--green-main)';
        spawnClickConfetti(btnNode);
        
        gkQuizScore++;
        awardStars(2);
        
        let correctSpeech = "";
        if (currentLanguage === 'hi') {
            correctSpeech = `बहुत बढ़िया! ${choice} बिल्कुल सही उत्तर है! 🚀`;
        } else if (currentLanguage === 'ta') {
            correctSpeech = `மிகவும் அற்புதம்! ${choice} என்பது சரியான விடை! 🚀`;
        } else {
            correctSpeech = `Spectacular! ${choice} is the correct answer! 🚀`;
        }
        setMascotSpeechBubble("monkey", correctSpeech);
    } else {
        playBuzzerWrong();
        btnNode.style.background = 'var(--rose-light)';
        btnNode.style.borderColor = 'var(--rose-main)';
        btnNode.classList.add('shake-bubble');
        setTimeout(() => { btnNode.classList.remove('shake-bubble'); }, 400);
        
        let wrongSpeech = "";
        if (currentLanguage === 'hi') {
            wrongSpeech = `लगभग सही! सही उत्तर ${correctAns} था!`;
        } else if (currentLanguage === 'ta') {
            wrongSpeech = `நெருங்கிவிட்டீர்கள்! சரியான விடை ${correctAns} ஆகும்!`;
        } else {
            wrongSpeech = `Almost! The correct answer was ${correctAns}!`;
        }
        setMascotSpeechBubble("monkey", wrongSpeech);
    }
    
    // Disable other buttons
    const allBtns = document.querySelectorAll('.gk-answer-btn');
    allBtns.forEach(b => b.disabled = true);
    
    setTimeout(() => {
        gkQuizActiveIndex++;
        if (gkQuizActiveIndex < gkTriviaPool.length) {
            renderGKQuestion();
        } else {
            playCorrectChime();
            
            let completeSpeech = "";
            if (currentLanguage === 'hi') {
                completeSpeech = `क्विज़ पूरा हुआ, प्यारे बच्चे! आपने ${gkTriviaPool.length} में से ${gkQuizScore} प्रश्नों के सही उत्तर दिए! ⭐`;
            } else if (currentLanguage === 'ta') {
                completeSpeech = `வினாடி வினா முடிந்தது, செல்லமே! நீ ${gkTriviaPool.length} கேள்விகளில் ${gkQuizScore} கேள்விகளுக்குச் சரியாகப் பதிலளித்துள்ளாய்! ⭐`;
            } else {
                completeSpeech = `Quiz completed, sweetheart! You answered ${gkQuizScore} out of ${gkTriviaPool.length} questions correctly! ⭐`;
            }
            setMascotSpeechBubble("monkey", completeSpeech);
            
            setTimeout(() => { triggerGameOver(gkQuizScore); }, 1500);
        }
    }, 1800);
}

/* ============================================================
   10. JUNGLE ADVENTURE GRID (CARROT QUEST)
   ============================================================ */
let bunnyCoords = { x: 0, y: 0 };
let carrotCoords = { x: 4, y: 4 };
let mudTiles = []; // coordinates lists

let advHeroEmoji = '🐇';
let advTargetEmoji = '🥕';
let advObstacleEmoji = '💩';
let advMudMessage = 'slipped on mud';
let advWinMessage = 'found the crunchy Golden Carrot';

let advHasKey = false;
let advKeyCoords = null;
let advChestUnlocked = false;

// Custom 5x5 structures for specific configs
let advWalls = []; // Coordinate mapping for maze walls {x, y}
let advPipesPath = [];

function initAdventureGame() {
    bunnyCoords = { x: 0, y: 0 };
    carrotCoords = { x: 4, y: 4 };
    mudTiles = [];
    advWalls = [];
    advPipesPath = [];
    
    advHasKey = false;
    advKeyCoords = null;
    advChestUnlocked = false;
    
    const config = (currentActiveGame && currentActiveGame.config) ? currentActiveGame.config : {};
    const gameId = currentActiveGame ? currentActiveGame.id : 'default';
    
    // Set custom visual emojis based on game theme
    if (gameId === 'space-mission') {
        advHeroEmoji = '🚜';
        advTargetEmoji = '💎';
        advObstacleEmoji = '🪨';
        advMudMessage = 'crashed into an asteroid rock';
        advWinMessage = 'collected the beautiful Martian space crystal';
        mudTiles = [{x: 1, y: 2}, {x: 3, y: 1}, {x: 2, y: 3}];
    }
    else if (gameId === 'pirate-island') {
        advHeroEmoji = '🚢';
        advTargetEmoji = '🏴‍☠️';
        advObstacleEmoji = '🌀';
        advMudMessage = 'swirled into a sea whirlpool';
        advWinMessage = 'anchored at the happy pirate treasure island';
        mudTiles = [{x: 0, y: 2}, {x: 3, y: 2}, {x: 2, y: 4}];
    }
    else if (gameId === 'ninja-runner') {
        advHeroEmoji = '🥷';
        advTargetEmoji = '🪙';
        advObstacleEmoji = '🕳️';
        advMudMessage = 'fell into a deep muddy pit trap';
        advWinMessage = 'secured the legendary golden ninja coin';
        mudTiles = [{x: 2, y: 1}, {x: 1, y: 3}, {x: 3, y: 3}];
    }
    else if (gameId === 'robot-rescue') {
        advHeroEmoji = '🤖';
        advTargetEmoji = '🔋';
        advObstacleEmoji = '🧱';
        advMudMessage = 'hit a magnetic block barrier';
        advWinMessage = 'safely reached the robot battery charging base';
        mudTiles = [{x: 1, y: 1}, {x: 3, y: 2}, {x: 2, y: 3}];
    }
    else if (gameId === 'dragon-adv') {
        advHeroEmoji = '🐉';
        advTargetEmoji = '🔥';
        advObstacleEmoji = '⚡';
        advMudMessage = 'got zapped by a storm thunder cloud';
        advWinMessage = 'absorbed the magical fire spark';
        mudTiles = [{x: 2, y: 0}, {x: 1, y: 2}, {x: 3, y: 3}];
    }
    else if (gameId === 'deep-dive') {
        advHeroEmoji = '🤿';
        advTargetEmoji = '🦪';
        advObstacleEmoji = '💣';
        advMudMessage = 'hit a dangerous sea mine bomb';
        advWinMessage = 'retrieved the sparkling ocean pearl clam';
        mudTiles = [{x: 0, y: 3}, {x: 2, y: 1}, {x: 4, y: 2}];
    }
    else if (gameId === 'jungle-escape') {
        advHeroEmoji = '🐒';
        advTargetEmoji = '🍌';
        advObstacleEmoji = '🕸️';
        advMudMessage = 'got tangled in a sticky spider trap';
        advWinMessage = 'harvested the delicious yellow bananas';
        mudTiles = [{x: 1, y: 1}, {x: 3, y: 1}, {x: 2, y: 4}];
    }
    else if (config.maze) {
        advHeroEmoji = '🐇';
        advTargetEmoji = '🥕';
        advObstacleEmoji = '🧱';
        advMudMessage = 'hit a wooden wall block';
        advWinMessage = 'navigated the twisty maze labyrinth to safety';
        
        // Define maze layout walls that bunny CANNOT walk on
        advWalls = [
            { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
            { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }
        ];
    }
    else if (config.pipes) {
        advHeroEmoji = '💧';
        advTargetEmoji = '🌸';
        advObstacleEmoji = '💩';
        advMudMessage = 'got blocked by mud plugs';
        advWinMessage = 'connected all pipeline streams to water the dry flower';
        
        mudTiles = [{ x: 1, y: 1 }, { x: 3, y: 3 }];
        // Render pipeline visual tracks
        advPipesPath = [
            { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 },
            { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },
            { x: 3, y: 4 }, { x: 4, y: 4 }
        ];
    }
    else if (config.escape) {
        advHeroEmoji = '🥷';
        advTargetEmoji = '🔒';
        advObstacleEmoji = '🕸️';
        advMudMessage = 'triggered a sneaky poison trap';
        advWinMessage = 'unlocked the locked chest and found the crown';
        
        mudTiles = [{ x: 2, y: 1 }, { x: 1, y: 3 }];
        advKeyCoords = { x: 0, y: 4 }; // Place key at bottom left
    }
    else {
        // Standard carrot adventure defaults
        advHeroEmoji = '🐇';
        advTargetEmoji = '🥕';
        advObstacleEmoji = '💩';
        advMudMessage = 'slipped on mud';
        advWinMessage = 'found the crunchy Golden Carrot';
        mudTiles = [{ x: 1, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 3 }];
    }
    
    renderAdventureGrid();
}

function renderAdventureGrid() {
    const grid = document.getElementById('adventure-grid-map');
    grid.innerHTML = '';
    
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const tile = document.createElement('div');
            tile.className = 'grid-tile';
            
            // Check entities
            const isHero = bunnyCoords.x === c && bunnyCoords.y === r;
            const isTarget = carrotCoords.x === c && carrotCoords.y === r;
            const isMud = mudTiles.some(m => m.x === c && m.y === r);
            const isWall = advWalls.some(w => w.x === c && w.y === r);
            const isPipe = advPipesPath.some(p => p.x === c && p.y === r);
            const isKey = advKeyCoords && advKeyCoords.x === c && advKeyCoords.y === r && !advHasKey;
            
            if (isHero) {
                tile.innerText = advHeroEmoji;
                tile.style.background = 'var(--pink-light)';
            }
            else if (isKey) {
                tile.innerText = '🔑';
                tile.style.background = 'var(--yellow-light)';
            }
            else if (isTarget) {
                tile.innerText = advHasKey && advHeroEmoji === '🥷' ? '🔓' : advTargetEmoji;
                tile.className += ' tile-carrot';
            }
            else if (isWall) {
                tile.innerText = '🧱';
                tile.style.background = 'var(--grey-200)';
            }
            else if (isMud) {
                tile.innerText = advObstacleEmoji;
                tile.className += ' tile-mud';
            }
            else if (currentActiveGame && currentActiveGame.config && currentActiveGame.config.pipes) {
                // Pipe flow lines visualization
                if (isPipe) {
                    tile.innerText = '🚰';
                    tile.style.background = 'var(--cyan-light)';
                } else {
                    tile.innerText = '🌳';
                }
            }
            
            grid.appendChild(tile);
        }
    }
}

function moveAdventureBunny(direction) {
    let nextX = bunnyCoords.x;
    let nextY = bunnyCoords.y;
    
    if (direction === 'up') nextY--;
    else if (direction === 'down') nextY++;
    else if (direction === 'left') nextX--;
    else if (direction === 'right') nextX++;
    
    // Bounds check
    if (nextX < 0 || nextX > 4 || nextY < 0 || nextY > 4) {
        playBuzzerWrong();
        return;
    }
    
    // Wall check for maze
    const hitWall = advWalls.some(w => w.x === nextX && w.y === nextY);
    if (hitWall) {
        playBuzzerWrong();
        setMascotSpeechBubble("bunny", `Boom! Ouch! Mommy Bear says: "You hit a wall block! Try another direction, sweetheart!"`);
        return;
    }
    
    // Obstacle mud check
    const hitMud = mudTiles.some(m => m.x === nextX && m.y === nextY);
    if (hitMud) {
        playBuzzerWrong();
        setMascotSpeechBubble("bunny", `Oh no, darling! Our explorer ${advMudMessage}! Let's restart from the beginning!`);
        bunnyCoords = { x: 0, y: 0 };
        renderAdventureGrid();
        return;
    }
    
    playFlipSound();
    bunnyCoords.x = nextX;
    bunnyCoords.y = nextY;
    
    // Key collection checking
    if (advKeyCoords && bunnyCoords.x === advKeyCoords.x && bunnyCoords.y === advKeyCoords.y && !advHasKey) {
        playPopSound();
        playCorrectChime();
        advHasKey = true;
        setMascotSpeechBubble("bunny", `Amazing, sweetheart! You found the Golden Key! 🔑 Now go open the locked chest!`);
    }
    
    renderAdventureGrid();
    
    // Win checking
    if (bunnyCoords.x === carrotCoords.x && bunnyCoords.y === carrotCoords.y) {
        if (advKeyCoords && !advHasKey) {
            playBuzzerWrong();
            setMascotSpeechBubble("bunny", `Oops, darling! The chest is locked 🔒! Go fetch the Golden Key 🔑 at the bottom corner first!`);
            return;
        }
        
        playPopSound();
        playCorrectChime();
        
        let rewardStarsCount = 3;
        let dialogue = "";
        if (currentLanguage === 'hi') {
            dialogue = `वाह! हमारे जाबांज साथी ने ${advWinMessage}! आपको 3 स्टार मिले! ⭐`;
        } else if (currentLanguage === 'ta') {
            dialogue = `அற்புதம்! நமது ஆராய்ச்சியாளர் வெற்றிகரமாக ${advWinMessage}! உனக்கு 3 நட்சத்திரங்கள் கிடைத்தன! ⭐`;
        } else {
            dialogue = `Hurray! Our brave explorer successfully ${advWinMessage}! You earned 3 stars! ⭐`;
        }
        setMascotSpeechBubble("bunny", dialogue);
        
        const grid = document.getElementById('adventure-grid-map');
        spawnClickConfetti(grid);
        
        setTimeout(() => { triggerGameOver(3); }, 1500);
    }
}

/* ============================================================
   11. AI BRANCHED STORY BUILDER
   ============================================================ */
let activeStoryStep = 'start';

const storyBranchLibrary = {
    start: {
        text: "Barnaby the Brave starts his travel inside the Forest of Lights. Suddenly, he discovers two mysterious trails. Which one should he follow?",
        emoji: '🌲',
        choices: [
            { text: "🌈 Climb the Rainbow Pathway upwards", next: 'rainbow' },
            { text: "🕳️ Slide down the Whispering Bunny Tunnel", next: 'tunnel' }
        ]
    },
    rainbow: {
        text: "Wow! The Rainbow Pathway leads Barnaby straight to a floating castle in the skies! A friendly pink dragon is baking giant cupcakes!",
        emoji: '🏰',
        choices: [
            { text: "🧁 Help the friendly dragon bake cupcakes", next: 'bake' },
            { text: "🚀 Jump on a flying rocket ship to stars", next: 'rocket' }
        ]
    },
    tunnel: {
        text: "Splendid! The tunnel sliding lands Barnaby in a sparkling diamond cavern! Inside, a sleeping bear is guarding a golden chest!",
        emoji: '💎',
        choices: [
            { text: "🔑 Quietly search for the golden chest key", next: 'chest' },
            { text: "🎵 Wake the bear up with a happy morning song", next: 'song' }
        ]
    },
    bake: {
        text: "Yummy! Barnaby and the dragon baked the biggest strawberry cupcake ever! They had a massive party and became best friends forever! THE END",
        emoji: '🧁',
        choices: [
            { text: "🔄 Play Magical Stories Again", next: 'start' }
        ]
    },
    rocket: {
        text: "Vroom! The rocket shoots high past the moon! Barnaby lands on Planet Sweets, where the mountains are made of ice cream! THE END",
        emoji: '🚀',
        choices: [
            { text: "🔄 Play Magical Stories Again", next: 'start' }
        ]
    },
    chest: {
        text: "Click! The golden chest opens, releasing thousands of flying glowing star sparkles that fill the forest with lights! THE END",
        emoji: '🎁',
        choices: [
            { text: "🔄 Play Magical Stories Again", next: 'start' }
        ]
    },
    song: {
        text: "Aww! The bear wakes up, starts dancing happily, and gives Barnaby a magical star badge for his beautiful singing! THE END",
        emoji: '🐻',
        choices: [
            { text: "🔄 Play Magical Stories Again", next: 'start' }
        ]
    }
};

function initStoryGame() {
    activeStoryStep = 'start';
    renderStoryStep();
}

function renderStoryStep() {
    const node = storyBranchLibrary[activeStoryStep];
    
    document.getElementById('story-illustrated-emoji').innerText = node.emoji;
    document.getElementById('story-narrative-box').innerText = node.text;
    
    // Narrate active story narrative
    speakSpeech(node.text);
    
    const choiceButtonsArea = document.getElementById('story-choice-buttons');
    choiceButtonsArea.innerHTML = '';
    
    node.choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'story-choice-btn';
        btn.innerText = ch.text;
        btn.onclick = () => selectStoryBranch(ch.next, btn);
        choiceButtonsArea.appendChild(btn);
    });
}

function selectStoryBranch(nextStep, btnNode) {
    playFlipSound();
    activeStoryStep = nextStep;
    
    if (nextStep.includes('start')) {
        renderStoryStep();
    } else {
        // If it's an ending step, reward stars
        const isEnding = ['bake', 'rocket', 'chest', 'song'].includes(nextStep);
        if (isEnding) {
            playCorrectChime();
            spawnClickConfetti(document.getElementById('story-illustrated-emoji'));
            awardStars(3);
        }
        renderStoryStep();
    }
}

/* ============================================================
   MASCOT DIALOGUE SPEECH INTERFACES
   ============================================================ */
function setMascotSpeechBubble(mascotType, text) {
    document.getElementById('mascot-speech-text').innerText = text;
    speakSpeech(text);
    
    // Toggles active emojis temporarily
    const node = document.getElementById('mascot-node');
    if (mascotType === 'koala') node.innerText = '🐨';
    else if (mascotType === 'elephant') node.innerText = '🐘';
    else if (mascotType === 'rabbit') node.innerText = '🐇';
    else if (mascotType === 'owl') node.innerText = '🦉';
    else if (mascotType === 'fox') node.innerText = '🦊';
    else if (mascotType === 'painter') node.innerText = '🐼';
    else if (mascotType === 'bee') node.innerText = '🐝';
    else if (mascotType === 'lion') node.innerText = '🦁';
    else if (mascotType === 'monkey') node.innerText = '🐵';
    else if (mascotType === 'bunny') node.innerText = '🐇';
}

/* ============================================================
   HTML5 CANVAS CONFETTI / PARTICLES ENGINE
   ============================================================ */
function initParticlesEngine() {
    starCanvas = document.getElementById('stars-particle-canvas');
    starCtx = starCanvas.getContext('2d');
    
    resizeParticleCanvas();
    window.addEventListener('resize', resizeParticleCanvas);
    
    requestAnimationFrame(renderParticlesLoop);
}

function resizeParticleCanvas() {
    if (!starCanvas) return;
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
}

function spawnClickConfetti(elementNode) {
    if (!elementNode) return;
    const rect = elementNode.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Spawn 15 colorful confetti flakes
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#8b5cf6', '#f97316'];
    for (let i = 0; i < 15; i++) {
        activeParticles.push({
            type: 'confetti',
            x: x, y: y,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: -4 + Math.random() * 8,
            vy: -6 - Math.random() * 5,
            width: 7 + Math.random() * 5,
            height: 9 + Math.random() * 5,
            alpha: 1.0,
            rotation: Math.random() * Math.PI,
            rotSpeed: -0.1 + Math.random() * 0.2,
            decay: 0.02 + Math.random() * 0.015,
            gravity: 0.22
        });
    }
}

function spawnStarSplashParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.2;
        const speed = 4 + Math.random() * 4;
        activeParticles.push({
            type: 'star',
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1.0,
            decay: 0.018,
            gravity: 0.12
        });
    }
}

function triggerLevelUpParticles() {
    speakSpeech("Wow! Level Up! You are a superstar explorer!");
    // Spawn 60 massive confetti and star cascades
    for (let i = 0; i < 40; i++) {
        activeParticles.push({
            type: 'confetti',
            x: window.innerWidth / 2,
            y: window.innerHeight / 3,
            color: ['#ec4899', '#38bdf8', '#eab308', '#10b981'][Math.floor(Math.random() * 4)],
            vx: -8 + Math.random() * 16,
            vy: -12 - Math.random() * 10,
            width: 10 + Math.random() * 6,
            height: 12 + Math.random() * 6,
            alpha: 1.0,
            rotation: Math.random() * Math.PI,
            rotSpeed: -0.2 + Math.random() * 0.4,
            decay: 0.012,
            gravity: 0.2
        });
    }
}

function renderParticlesLoop() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    
    activeParticles.forEach((p, index) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        
        if (p.alpha <= 0) {
            activeParticles.splice(index, 1);
            return;
        }
        
        starCtx.save();
        starCtx.globalAlpha = p.alpha;
        
        if (p.type === 'confetti') {
            starCtx.translate(p.x, p.y);
            p.rotation += p.rotSpeed;
            starCtx.rotate(p.rotation);
            starCtx.fillStyle = p.color;
            starCtx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        } else if (p.type === 'star') {
            // Render twinkling yellow text star
            starCtx.font = '24px Arial';
            starCtx.textBaseline = 'middle';
            starCtx.textAlign = 'center';
            starCtx.fillText('⭐', p.x, p.y);
        }
        
        starCtx.restore();
    });
    
    requestAnimationFrame(renderParticlesLoop);
}

// Drag Over prevention
function allowDrop(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('shape-slot') || e.currentTarget.classList.contains('habitat-box') || e.currentTarget.id === 'maker-canvas-area') {
        e.currentTarget.classList.add('drag-over');
    }
}

/* ============================================================
   TRANSLATION & LOCALIZATION ENGINE
   ============================================================ */
const KIDDY_TRANSLATIONS = {
    en: {
        brand: "KiddyQuest Arcade",
        explorer_lvl: "Explorer Lvl",
        score: "Score",
        read_out_loud: "Read Out Loud",
        voice_on: "Voice On",
        voice_off: "Voice Off",
        mascot_name: "Mommy Bear (Your Teacher)",
        home: "Home",
        clean_board: "Clean Board",
        save_art: "Save Art",
        show_mommy: "Show Mommy! ⭐",
        restart_experiment: "Restart Experiment",
        
        // Categories
        tab_learning: "🎓 Learning & Math",
        tab_english: "🔤 English & Vocab",
        tab_memory: "🧠 Memory & Brain",
        tab_puzzle: "🧩 Puzzle & Logic",
        tab_art: "🎨 Art & Creative",
        tab_animal: "🦁 Animal & Nature",
        tab_science: "🚀 Space & Science",
        tab_cooking: "🍰 Cooking & Dress-Up",
        tab_adventure: "🗺️ Adventure Trails",
        
        // Mascot Greetings
        lobby_welcome: "Hello sweetie! Welcome to our KiddyQuest Arcade! 🐻❤️ Pick any magical category tab below to start our fun games together! I am so proud of how much you are learning!",
        cat_learning: "Let's explore amazing numbers, shapes, and arithmetic together, sweetheart! You are doing so well!",
        cat_english: "Vocabulary and grammar are so wonderful, my darling! Let's trace letters and build beautiful words!",
        cat_memory: "Let's test our super bright minds with memory matching, darling! Flip the cards to find twins!",
        cat_puzzle: "Ooh, logic and puzzle mazes! I know you are a great problem solver, sweetheart! Let's solve them!",
        cat_art: "It's time to show your beautiful creativity, my little artist! Let's paint and create magic!",
        cat_animal: "Listen to the beautiful birds and beasts, darling! Let's learn about our animal friends!",
        cat_science: "Zoom into the stars and space, honey! Welcome to our science lab! Let's do fun experiments!",
        cat_cooking: "Yum! Let's decorate yummy pizza, cake, or dress up beautiful princesses together, sweetheart!",
        cat_adventure: "Adventure trails! Let's guide bunny past hurdles to collect golden carrots, honey!",
        lobby_headline: "Select Your Adventure! 🎨🎈"
    },
    hi: {
        brand: "किडीक्वेस्ट आर्केड",
        explorer_lvl: "खोजकर्ता स्तर",
        score: "अंक",
        read_out_loud: "ज़ोर से पढ़ें",
        voice_on: "आवाज़ चालू",
        voice_off: "आवाज़ बंद",
        mascot_name: "मम्मी भालू (आपकी शिक्षिका)",
        home: "मुख्य पृष्ठ",
        clean_board: "बोर्ड साफ़ करें",
        save_art: "कला सहेजें",
        show_mommy: "मम्मी को दिखाएं! ⭐",
        restart_experiment: "प्रयोग पुनरारंभ करें",
        
        // Categories
        tab_learning: "🎓 सीखना और गणित",
        tab_english: "🔤 अंग्रेजी और शब्दावली",
        tab_memory: "🧠 स्मृति और दिमाग",
        tab_puzzle: "🧩 पहेली और तर्क",
        tab_art: "🎨 कला और रचनात्मक",
        tab_animal: "🦁 पशु और प्रकृति",
        tab_science: "🚀 अंतरिक्ष और विज्ञान",
        tab_cooking: "🍰 खाना पकाना और ड्रेस-अप",
        tab_adventure: "🗺️ साहसिक मार्ग",
        
        // Mascot Greetings
        lobby_welcome: "नमस्ते प्यारे बच्चे! हमारे किडीक्वेस्ट आर्केड में आपका स्वागत है! 🐻❤️ हमारे साथ मजेदार खेल शुरू करने के लिए नीचे दिए गए किसी भी जादुई श्रेणी टैब को चुनें! मुझे आप पर बहुत गर्व है!",
        cat_learning: "आइए मिलकर अद्भुत संख्याएँ, आकृतियाँ और गणित सीखें, मेरे बच्चे! आप बहुत अच्छा कर रहे हैं!",
        cat_english: "शब्दावली और व्याकरण बहुत सुंदर हैं, मेरे प्यारे! आइए अक्षरों को ट्रेस करें और सुंदर शब्द बनाएं!",
        cat_memory: "आइए कार्ड मिलान के साथ हमारे तेज़ दिमाग का परीक्षण करें! जुड़वां बच्चों को खोजने के लिए कार्ड पलटें!",
        cat_puzzle: "ओह, तर्क और पहेली भूलभुलैया! मुझे पता है कि आप एक महान समस्या समाधानकर्ता हैं, प्रिय! आइए उन्हें हल करें!",
        cat_art: "यह आपकी सुंदर रचनात्मकता दिखाने का समय है, मेरे छोटे कलाकार! आइए पेंट करें और जादू बनाएं!",
        cat_animal: "सुंदर पक्षियों और जंगली जानवरों की आवाजें सुनें, प्यारे बच्चे! आइए हमारे पशु मित्रों के बारे में जानें!",
        cat_science: "सितारों और अंतरिक्ष में घूमें, प्रिय! हमारी विज्ञान प्रयोगशाला में आपका स्वागत है! आइए मजेदार प्रयोग करें!",
        cat_cooking: "स्वादिष्ट! आइए स्वादिष्ट पिज्जा, केक सजाएं या सुंदर राजकुमारियों को एक साथ तैयार करें, मेरे बच्चे!",
        cat_adventure: "साहसिक मार्ग! आइए खरगोश को बाधाओं से पार पाकर सुनहरी गाजर इकट्ठा करने में मदद करें, प्यारे बच्चे!",
        lobby_headline: "अपना साहसिक कार्य चुनें! 🎨🎈"
    },
    ta: {
        brand: "கிடிகுவெஸ்ட் ஆர்கேட்",
        explorer_lvl: "ஆராய்ச்சியாளர் நிலை",
        score: "மதிப்பெண்",
        read_out_loud: "சத்தமாகப் படிக்கவும்",
        voice_on: "குரல் ஆன்",
        voice_off: "குரல் ஆஃப்",
        mascot_name: "அம்மா கரடி (உங்கள் ஆசிரியர்)",
        home: "முகப்பு",
        clean_board: "பலகையை சுத்தம் செய்",
        save_art: "கலையைச் சேமி",
        show_mommy: "அம்மாவிடம் காட்டு! ⭐",
        restart_experiment: "பரிசோதனையை மீண்டும் தொடங்கு",
        
        // Categories
        tab_learning: "🎓 கற்றல் & கணிதம்",
        tab_english: "🔤 ஆங்கிலம் & சொற்கள்",
        tab_memory: "🧠 நினைவாற்றல் & மூளை",
        tab_puzzle: "🧩 புதிர் & தர்க்கம்",
        tab_art: "🎨 கலை & படைப்பாற்றல்",
        tab_animal: "🦁 விலங்கு & இயற்கை",
        tab_science: "🚀 விண்வெளி & அறிவியல்",
        tab_cooking: "🍰 சமையல் & ஆடை அலங்காரம்",
        tab_adventure: "🗺️ சாகசப் பாதைகள்",
        
        // Mascot Greetings
        lobby_welcome: "ஹலோ செல்லமே! நமது கிடிகுவெஸ்ட் ஆர்கேடிற்கு மீண்டும் வரவேற்கிறோம்! 🐻❤️ ஒன்றாக விளையாட கீழே உள்ள ஏதேனும் ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்! நீ கற்றுக்கொள்வதைப் பார்த்து எனக்கு மிகவும் பெருமையாக இருக்கிறது!",
        cat_learning: "அற்புதமான எண்கள், வடிவங்கள் மற்றும் கணிதத்தை ஒன்றாக ஆராய்வோம், செல்லமே! நீ நன்றாக படிக்கிறாய்!",
        cat_english: "சொற்களஞ்சியமும் இலக்கணமும் மிகவும் அருமையானவை, என் அன்பே! எழுத்துக்களை வரைந்து அழகான சொற்களை உருவாக்குவோம்!",
        cat_memory: "நினைவக அட்டைகளுடன் நமது பிரகாசமான மூளையை சோதிப்போம்! ஒரே மாதிரியான இணைகளைக் கண்டறிய அட்டைகளைத் திருப்புங்கள்!",
        cat_puzzle: "புதிர்கள் மற்றும் பிரமை விளையாட்டுகள்! நீ ஒரு சிறந்த புத்திசாலி என்று எனக்குத் தெரியும்! வா புதிர்களைத் தீர்க்கலாம்!",
        cat_art: "உன் படைப்பாற்றலை வெளிப்படுத்த இதுவே நேரம், என் குட்டி கலைஞனே! வண்ணம் தீட்டி மந்திரத்தை உருவாக்குவோம்!",
        cat_animal: "அழகான பறவைகள் மற்றும் காடுகளின் விலங்குகளின் குரல்களைக் கேளுங்கள்! நமது விலங்கு நண்பர்களைப் பற்றி அறிந்து கொள்வோம்!",
        cat_science: "விண்வெளி மற்றும் நட்சத்திரங்களுக்குப் பறப்போம், அன்பே! நமது அறிவியல் ஆய்வகத்திற்கு வரவேற்கிறோம்! வாருங்கள் பரிசோதனைகள் செய்யலாம்!",
        cat_cooking: "சுவையான பீட்சா, கேக் அல்லது அழகான இளவரசிகளுக்கு ஆடை அலங்காரம் செய்யலாம், செல்லமே!",
        cat_adventure: "சாகசப் பாதைகள்! முயல் குட்டிக்கு தடைகளை கடந்து தங்க கேரட்டை சேகரிக்க உதவுவோம், செல்லமே!",
        lobby_headline: "உங்கள் சாகசத்தைத் தேர்ந்தெடுங்கள்! 🎨🎈"
    }
};

const GAME_TRANSLATIONS = {
    hi: {
        'alpha-trace': { name: 'वर्णमाला अनुरेखण खेल', desc: 'चमकदार रंगों के साथ प्यारे वर्णमाला अक्षरों को ट्रेस करें!' },
        'abc-match': { name: 'एबीसी मिलान खेल', desc: 'छोटे अक्षरों के बुलबुले को बड़े बादलों से मिलाएं!' },
        'missing-letter': { name: 'लुप्त अक्षर चुनौती', desc: 'अंतर भरने के लिए लुप्त अक्षर बुलबुला खोजें!' },
        'alpha-pop': { name: 'वर्णमाला गुब्बारा पॉप', desc: 'जैसे ही वे आकाश में तैरते हैं अक्षरों को पॉप करें!' },
        'number-counting': { name: 'संख्या गणना खेल', desc: 'स्वादिष्ट कपकेक, डोनट्स और कुकीज़ गिनें!' },
        'number-trace': { name: 'संख्या अनुरेखण खेल', desc: 'चमकदार संख्याओं को चरण-दर-चरण बनाएं और ट्रेस करें!' },
        'missing-number': { name: 'लुप्त संख्या पहेली', desc: 'लुप्त अंकों को भरकर अनुक्रमों को हल करें!' },
        'addition-race': { name: 'जोड़ दौड़', desc: 'जोड़ के सवालों को हल करके खरगोश की दौड़ जीतने में मदद करें!' },
        'subtraction-race': { name: 'घटाव चुनौती', desc: 'घटाव समीकरणों को हल करके खरगोश को फिनिश लाइन पर लाएं!' },
        'multiplication-race': { name: 'गुणा लड़ाई', desc: 'मजेदार गुणा सवालों के साथ खरगोश को चुनौती दें!' },
        'division-race': { name: 'भाग पहेली', desc: 'सोना स्टार जीतने के लिए सही भागफल खोजें!' },
        'math-bingo': { name: 'गणित बिंगो', desc: 'अपने बिंगो कार्ड पर मिलान की गई संख्याओं को पॉप करें!' },
        'fraction-pizza': { name: 'भिन्न पिज्जा खेल', desc: 'एक स्वादिष्ट पिज्जा के अंशों को सजाएं!' },
        'decimal-match': { name: 'दशमलव मिलान खेल', desc: 'भिन्नों को उनके समकक्ष दशमलव से मिलाएँ!' },
        'shape-id': { name: 'आकृति पहचान खेल', desc: 'ज्यामितीय रूपरेखाओं को सितारों और हीरों से मिलाएँ!' },
        'color-recognize': { name: 'रंग पहचान खेल', desc: 'इस खूबसूरत आकाश क्षेत्र में गुब्बारे के रंगों को पॉप करें!' },
        'pattern-match': { name: 'पैटर्न मिलान खेल', desc: 'इमोजी ब्लॉक के रंगीन पैटर्न दोहराएं!' },
        'time-clock': { name: 'समय सीखें घड़ी खेल', desc: 'हमारी जादुई घड़ी की सुइयों को लक्षित समय पर सेट करें!' },
        'money-count': { name: 'पैसा गिनती खेल', desc: 'चमकदार खिलौने खरीदने के लिए सिक्कों को एक साथ जोड़ें!' },
        'measure-quiz': { name: 'मापन प्रश्नोत्तरी खेल', desc: 'अजीब जानवरों के आकार और लंबाई की तुलना करें!' },
        'word-search': { name: 'शब्द खोज खेल', desc: 'प्यारे जानवरों के नाम बनाने के लिए छिपे हुए अक्षरों को ढूंढें!' },
        'spelling-bee': { name: 'हिज्जे चुनौती', desc: 'शब्दों की स्पेलिंग लिखने के लिए अक्षरों के बुलबुले फोड़ें!' },
        'opposite-match': { name: 'विपरीत शब्द मिलान', desc: 'गर्म-ठंडे, बड़े-छोटे जैसे विपरीत शब्द कार्डों को जोड़ें!' },
        'synonym-finder': { name: 'समानार्थक शब्द खोजक', desc: 'उन शब्दों के जोड़ों को जोड़ें जिनका अर्थ बिल्कुल एक ही है!' },
        'vocab-flashcards': { name: 'शब्दावली फ़्लैशकार्ड', desc: 'सुंदर नए शब्द सीखने के लिए कार्ड पलटें!' },
        'sentence-builder': { name: 'वाक्य निर्माता', desc: 'सुंदर वाक्य बनाने के लिए शब्द ब्लॉकों को व्यवस्थित करें!' },
        'grammar-quiz': { name: 'व्याकरण प्रश्नोत्तरी खेल', desc: 'वाक्य में सही संज्ञा और क्रिया का चयन करें!' },
        'noun-verb': { name: 'संज्ञा बनाम क्रिया खेल', desc: 'शब्दों को क्रिया या संज्ञा में क्रमबद्ध करें!' },
        'rhyme-words': { name: 'तुकबंदी शब्द चुनौती', desc: 'उन शब्दों का मिलान करें जो अंत में बिल्कुल एक जैसे लगते हैं!' },
        'crosswords': { name: 'बच्चों के लिए वर्ग पहेली', desc: 'अक्षरों के ग्रिड को पूरा करने के लिए खाली ब्लॉक भरें!' },
        'animal-memory': { name: 'पशु स्मृति कार्ड', desc: 'शेर, बाघ और प्यारे बंदरों के जोड़े पलटें!' },
        'fruit-memory': { name: 'फल मिलान खेल', desc: 'केले, सेब, चेरी और जामुन का मिलान करें!' },
        'emoji-memory': { name: 'इमोजी स्मृति खेल', desc: 'जुड़वां मुस्कुराते चेहरे, दिल और सितारे खोजें!' },
        'toy-memory': { name: 'खिलौना मिलान खेल', desc: 'टेडी बियर, खिलौना रॉकेट और सेलबोट का मिलान करें!' },
        'shape-memory': { name: 'आकृति स्मृति चुनौती', desc: 'सर्कल, त्रिकोण और सुनहरे हेक्सागोन्स की जोड़ी बनाएं!' },
        'fast-flip': { name: 'फास्ट फ्लिप कार्ड खेल', desc: 'डुप्लिकेट कार्डों के वापस पलटने से पहले उन्हें टैप करें!' },
        'pattern-recall': { name: 'पैटर्न याद रखना खेल', desc: 'मम्मी को ब्लॉक जलाते हुए देखें और क्रम की नकल करें!' },
        'seq-memory': { name: 'अनुक्रम स्मृति खेल', desc: 'बढ़ते क्रम में संख्याओं को याद रखें और क्लिक करें!' },
        'iq-puzzle': { name: 'आईक्यू पहेली चुनौती', desc: 'चुनें कि लॉजिक रो में आगे कौन सा आकार ब्लॉक फिट बैठता है!' },
        'brain-mini': { name: 'मस्तिष्क मिनी खेल', desc: 'अपने दिमाग का परीक्षण करने के लिए त्वरित स्मृति पहेलियाँ पूरी करें!' },
        'jigsaw-puzzle': { name: 'जिग्सॉ पहेलियाँ', desc: 'खुश जानवरों के दृश्य बनाने के लिए टुकड़ों को खींचें!' },
        'maze-runner': { name: 'भूलभुलैया धावक', desc: 'खोजकर्ता को भूलभुलैया के माध्यम से मार्गदर्शित करें!' },
        'tangrams': { name: 'टेंग्राम पहेली', desc: 'आकृतियों से सुंदर जानवर बनाने के लिए ज्यामितीय ब्लॉकों को व्यवस्थित करें!' },
        'pipe-connect': { name: 'पाइप कनेक्टर', desc: 'फूलों को पानी देने के लिए पाइपों को घुमाएं और जोड़ें!' },
        'block-fit': { name: 'ब्लॉक फिटिंग', desc: 'एक लकड़ी के ग्रिड की रूपरेखा में रंगीन ब्लॉकों को फिट करें!' },
        'hidden-objects': { name: 'छिपी हुई वस्तुएँ', desc: 'रंगीन जंगल के अंदर छिपी हुई वस्तुओं को खोजें!' },
        'spot-diff': { name: 'अंतर पहचानें', desc: 'दो चित्रों की तुलना करें और अंतरों पर टैप करें!' },
        'kids-sudoku': { name: 'बच्चों का सुडोकू', desc: 'पंक्तियों को फलों के स्टिकर से भरें!' },
        'logic-grids': { name: 'तर्क ग्रिड', desc: 'पशु सुराग प्रकट करने के लिए मिलान पहेली को हल करें!' },
        'escape-adv': { name: 'पलायन रोमांच', desc: 'तिजोरी की चाबी खोजें और खजाना खोलें!' },
        'animal-coloring': { name: 'पशु रंग भरना', desc: 'प्यारे शेरों, पांडा और हाथियों में रंग भरें!' },
        'cartoon-book': { name: 'कार्टून बुक रंगना', desc: 'रंगीन चाक से कार्टून आकृतियों को भरें!' },
        'color-by-number': { name: 'संख्या के आधार पर रंग', desc: 'गुप्त चित्रों को प्रकट करने के लिए क्रमांकित ग्रिडों में रंग भरें!' },
        'magic-drawing': { name: 'जादुई ड्राइंग पैड', desc: 'हमारे चॉकबोर्ड कैनवास पर जो चाहें बनाएं!' },
        'finger-painting': { name: 'फिंगर पेंटिंग', desc: 'सुंदर फिंगर पेंट और ध्वनि संगीत बनाएं!' },
        'dot-to-dot': { name: 'बिंदु से बिंदु मिलाना', desc: 'गुप्त आकृतियों को प्रकट करने के लिए डॉट्स कनेक्ट करें!' },
        'pixel-art': { name: 'पिक्सेल कला', desc: 'ग्रिड सेल में पिक्सेल चित्र बनाने के लिए रंग भरें!' },
        'sand-art': { name: 'रेत कला सिम्युलेटर', desc: 'एक बोतल में रंगीन रेत की परतें डालें!' },
        'sticker-creator': { name: 'स्टिकर निर्माता', desc: 'स्टिकर डिज़ाइन करें और उन्हें दृश्यों पर रखें!' },
        'greeting-cards': { name: 'ग्रीटिंग कार्ड', desc: 'कार्डों पर बधाई संदेश और सजावट जोड़ें!' },
        'guess-sound': { name: 'आवाज़ पहचानो खेल', desc: 'पक्षियों और जानवरों की आवाज़ें सुनें और उनके नाम बताएं!' },
        'feed-animal': { name: 'जानवर को खिलाओ', desc: 'बंदरों को केले और पिल्लों को हड्डियाँ खिलाएँ!' },
        'pet-care': { name: 'पालतू जानवर की देखभाल', desc: 'एक शराबी बिल्ली या पिल्ले को दुलारें, नहलाएं और खिलाएं!' },
        'zoo-manager': { name: 'चिड़ियाघर प्रबंधक', desc: 'जानवरों के घर डिज़ाइन करें और शेरों-बंदरों को व्यवस्थित करें!' },
        'jungle-safari': { name: 'जंगल सफारी', desc: 'घने जंगल का अन्वेषण करें और छिपे हुए जानवरों को ढूंढें!' },
        'dino-explorer': { name: 'डायनासोर खोजकर्ता', desc: 'हड्डियों को खोदकर निकालें और डायनासोर कंकाल का मिलान करें!' },
        'aquarium-sim': { name: 'मछलीघर सिम्युलेटर', desc: 'एक मछलीघर बनाएं और रंगीन मछलियों से सजाएं!' },
        'bird-flight': { name: 'पक्षी की उड़ान', desc: 'एक छोटे पक्षी को ऊंचे पेड़ों से बचाकर उड़ाएं!' },
        'farm-match': { name: 'फार्म मिलान', desc: 'खेत के जानवरों को उनके सही बाड़ों में छाँटें!' },
        'wildlife-rescue': { name: 'वन्यजीव बचाव', desc: 'घायल जंगल जानवरों की पट्टी बांधकर उनकी मदद करें!' },
        'solar-system': { name: 'सौर मंडल', desc: 'घूमते ग्रहों को उनकी सही कक्षाओं में व्यवस्थित करें!' },
        'space-mission': { name: 'अंतरिक्ष मिशन', desc: 'क्रिस्टल पत्थर इकट्ठा करने के लिए रोवर का मार्गदर्शन करें!' },
        'rocket-builder': { name: 'रॉकेट निर्माता', desc: 'रॉकेट के हिस्सों, इंजनों और कैप्सूलों को जोड़ें!' },
        'human-body': { name: 'मानव शरीर', desc: 'खोपड़ी, पसलियों और हड्डियों को कंकाल पर व्यवस्थित करें!' },
        'plant-growing': { name: 'पौधा उगाना', desc: 'पानी डालें और धूप चमकाएं ताकि पौधा बड़ा हो सके!' },
        'water-cycle': { name: 'जल चक्र', desc: 'पानी उबालें और बादल बनाकर बारिश शुरू करें!' },
        'magnet-science': { name: 'चुंबक विज्ञान', desc: 'चुंबक का परीक्षण करें और धातु की क्लिप आकर्षित करें!' },
        'fossil-dig': { name: 'जीवाश्म खुदाई', desc: 'प्राचीन डायनासोर की हड्डियों को उजागर करने के लिए रेत को साफ करें!' },
        'weather-match': { name: 'मौसम मिलान', desc: 'मौसम के अनुसार सही कपड़ों का मिलान करें!' },
        'science-quizzes': { name: 'विज्ञान प्रश्नोत्तरी', desc: 'चुंबक, गुरुत्वाकर्षण और भौतिकी के प्रश्नों का परीक्षण करें!' },
        'pizza-maker': { name: 'पिज्जा बनाने वाला', desc: 'सॉस, पनीर और टॉपिंग की परतें लगाएं और बेक करें!' },
        'cake-decorator': { name: 'केक सजाने वाला', desc: 'क्रीम, स्प्रिंकल्स और मोमबत्तियाँ जोड़ें!' },
        'ice-cream': { name: 'आइसक्रीम बनाने वाला', desc: 'वैनिला, स्ट्रॉबेरी, चॉकलेट के स्कूप और चेरी जोड़ें!' },
        'burger-builder': { name: 'बर्गर बिल्डर', desc: 'हैमबर्गर पैटीज़, पनीर, लेट्यूस और टमाटर स्टैक करें!' },
        'candy-factory': { name: 'कैंडी फैक्टरी', desc: 'कारमेल पिघलाएं, लॉलीपॉप को आकार दें और रंगीन बूंदें जोड़ें!' },
        'bakery-shop': { name: 'बेकरी की दुकान', desc: 'स्वादिष्ट क्रोइसैन, डोनट्स और रोल बेक करें!' },
        'princess-dress': { name: 'राजकुमारी ड्रेस-अप', desc: 'सुंदर मुकुट, चमकदार कपड़े और सैंडल चुनें!' },
        'superhero-creator': { name: 'सुपरहीरो निर्माता', desc: 'मास्क, केप, बिजली के लोगो और जेटपैक से लैस करें!' },
        'fashion-designer': { name: 'फैशन डिजाइनर', desc: 'रनवे मॉडल पर कपड़े, बैग और जूते स्टाइल करें!' },
        'hair-salon': { name: 'हेयर सैलून', desc: 'बालों में रंगीन क्लिप और धनुष जोड़ें!' },
        'treasure-hunt': { name: 'खजाना खोज', desc: 'विभिन्न द्वीपों पर छिपे खजाने के बक्से उजागर करें!' },
        'pirate-island': { name: 'समुद्री डाकू द्वीप', desc: 'द्वीप तक पहुंचने के लिए चट्टानों से जहाज बचाएं!' },
        'ninja-runner': { name: 'निंजा रनर', desc: 'निंजा को ऊंची दीवारों और कीचड़ भरी खाइयों के पार ले जाएं!' },
        'robot-rescue': { name: 'रोबोट बचाव', desc: 'खोए हुए रोबोट को वापस लाने के लिए सही तीर पथ प्रोग्राम करें!' },
        'dragon-adv': { name: 'ड्रैगन एडवेंचर', desc: 'छोटे ड्रैगन को बादलों के बीच उड़ने में मदद करें!' },
        'deep-dive': { name: 'गहरा गोता', desc: 'मोती खोजने के लिए पनडुब्बी को समुद्री खदानों से बचाएं!' },
        'jungle-escape': { name: 'जंगल से पलायन', desc: 'हमारे नटखट बंदर को मीठे केले की ओर ले जाएँ!' },
        'magic-castle': { name: 'जादुई महल', desc: 'सुनहरे मुकुट खोजने के लिए एक जादुई महल का अन्वेषण करें!' },
        'time-travel': { name: 'समय यात्रा', desc: 'डायनासोर युग या भविष्य के शहरों की यात्रा करें!' },
        'alien-rescue': { name: 'एलियन बचाव', desc: 'अंतरिक्ष के रास्ते एलियन को घर वापस जाने में मदद करें!' }
    },
    ta: {
        'alpha-trace': { name: 'நெடுங்கணக்கு வரைதல் விளையாட்டு', desc: 'ஒளிரும் வண்ணங்களைக் கொண்டு அழகான எழுத்துக்களை வரையவும்!' },
        'abc-match': { name: 'ஏபிசி பொருத்துதல் விளையாட்டு', desc: 'சிறிய எழுத்துக் குமிழ்களை பெரிய எழுத்து மேகங்களுடன் பொருத்தவும்!' },
        'missing-letter': { name: 'விடுபட்ட எழுத்து சவால்', desc: 'இடைவெளியை நிரப்ப விடுபட்ட எழுத்துக் குமிழைக் கண்டறியவும்!' },
        'alpha-pop': { name: 'நெடுங்கணக்கு பலூன் பாப்', desc: 'வானத்தில் எழுத்துக்கள் மிதக்கும் போது அவற்றைப் பாப் செய்யவும்!' },
        'number-counting': { name: 'எண் எண்ணும் விளையாட்டு', desc: 'சுவையான கப்கேக்குகள், டோனட்ஸ் மற்றும் குக்கீகளை எண்ணுங்கள்!' },
        'number-trace': { name: 'எண் வரைதல் விளையாட்டு', desc: 'ஒளிரும் எண்களைப் படிப்படியாக வரைந்து பழகவும்!' },
        'missing-number': { name: 'விடுபட்ட எண் புதிர்', desc: 'விடுபட்ட எண்களை நிரப்பி வரிசைகளைத் தீர்க்கவும்!' },
        'addition-race': { name: 'கூட்டல் பந்தயம்', desc: 'கூட்டல் கணக்குகளைத் தீர்த்து முயல் பந்தயத்தில் வெற்றிபெற உதவவும்!' },
        'subtraction-race': { name: 'கழித்தல் சவால்', desc: 'கழித்தல் கணக்குகளைத் தீர்த்து முயலை பந்தய எல்லைக்கு கொண்டு வாருங்கள்!' },
        'multiplication-race': { name: 'பெருக்கல் போர்', desc: 'பெருக்கல் புதிர்களுடன் முயல் பந்தயத்தை வெல்லுங்கள்!' },
        'division-race': { name: 'வகுத்தல் புதிர்', desc: 'தங்க நட்சத்திரங்களை வெல்ல சரியான வகுத்தல் பதில்களைக் கண்டறியவும்!' },
        'math-bingo': { name: 'கணித பிங்கோ', desc: 'உங்கள் பிங்கோ அட்டையில் உள்ள எண்களைப் பொருத்தவும்!' },
        'fraction-pizza': { name: 'பின்ன பீட்சா விளையாட்டு', desc: 'ஒரு சுவையான பீட்சாவின் பின்னப் பகுதிகளை அலங்கரிக்கவும்!' },
        'decimal-match': { name: 'தசம பொருத்துதல் விளையாட்டு', desc: 'பின்னங்களை அவற்றின் தசம எண்களுடன் பொருத்தவும்!' },
        'shape-id': { name: 'வடிவம் கண்டறியும் விளையாட்டு', desc: 'வடிவங்களின் எல்லைகளை நட்சத்திரம் மற்றும் வைரங்களுடன் பொருத்தவும்!' },
        'color-recognize': { name: 'வண்ணம் கண்டறியும் விளையாட்டு', desc: 'வானத்தில் வண்ணப் பலூன்களைப் பாப் செய்யவும்!' },
        'pattern-match': { name: 'முறை பொருத்துதல் விளையாட்டு', desc: 'ஈமோஜி தொகுதிகளின் வண்ண முறைகளை மீண்டும் செய்யவும்!' },
        'time-clock': { name: 'நேரம் அறியும் கடிகார விளையாட்டு', desc: 'நமது கடிகார முட்களை இலக்கு நேரத்திற்கு அமைக்கவும்!' },
        'money-count': { name: 'பணம் எண்ணும் விளையாட்டு', desc: 'அழகான பொம்மைகளை வாங்க நாணயங்களை ஒன்றாக எண்ணுங்கள்!' },
        'measure-quiz': { name: 'அளவீட்டு வினாடி வினா', desc: 'விலங்குகளின் அளவுகள் மற்றும் நீளங்களை ஒப்பிட்டுப் பாருங்கள்!' },
        'word-search': { name: 'சொல் தேடல் விளையாட்டு', desc: 'மறைந்துள்ள எழுத்துக்களைக் கண்டறிந்து விலங்குகளின் பெயரை உருவாக்கு!' },
        'spelling-bee': { name: 'எழுத்துக்கூட்டு சவால்', desc: 'சொற்களை உருவாக்க எழுத்துப் பலூன்களை பாப் செய்யவும்!' },
        'opposite-match': { name: 'எதிர்ச்சொல் பொருத்துதல்', desc: 'வெப்பம்-குளிர், பெரிய-சிறிய போன்ற எதிர்ச்சொல் அட்டைகளை இணைக்கவும்!' },
        'synonym-finder': { name: 'ஒரேபொருள் சொற்கள் கண்டுபிடிப்பான்', desc: 'ஒரே பொருளைத் தரும் சொற்களை ஒன்றாக இணைக்கவும்!' },
        'vocab-flashcards': { name: 'சொல்லகராதி அட்டை விளையாட்டு', desc: 'அழகான புதிய சொற்களைக் கற்றுக்கொள்ள அட்டைகளைத் திருப்புங்கள்!' },
        'sentence-builder': { name: 'வாக்கியம் அமைப்பாளர்', desc: 'வாக்கியங்களை உருவாக்க வார்த்தைத் தொகுதிகளை வரிசைப்படுத்துங்கள்!' },
        'grammar-quiz': { name: 'இலக்கண வினாடி வினா', desc: 'வாக்கியத்தில் உள்ள பெயர்ச்சொல் மற்றும் வினைச்சொல்லைத் தேர்ந்தெடு!' },
        'noun-verb': { name: 'பெயர்ச்சொல் vs வினைச்சொல்', desc: 'வார்த்தைகளை பெயர்ச்சொல் அல்லது வினைச்சொல்லாக வகைப்படுத்து!' },
        'rhyme-words': { name: 'ஒரே ஓசைச் சொற்கள் சவால்', desc: 'முடிவில் ஒரே மாதிரியான ஓசையைத் தரும் சொற்களைப் பொருத்துக!' },
        'crosswords': { name: 'குழந்தைகளுக்கான குறுக்கெழுத்து', desc: 'எழுத்துக்களின் கட்டங்களை பூர்த்தி செய்ய காலியாக உள்ள கட்டங்களை நிரப்பு!' },
        'animal-memory': { name: 'விலங்கு நினைவக விளையாட்டு', desc: 'சிங்கம், புலி மற்றும் அழகான குரங்குகளின் இணைகளைத் திருப்புங்கள்!' },
        'fruit-memory': { name: 'பழம் பொருத்துதல் விளையாட்டு', desc: 'வாழைப்பழம், ஆப்பிள் மற்றும் செர்ரிகளைப் பொருத்தவும்!' },
        'emoji-memory': { name: 'ஈமோஜி நினைவக விளையாட்டு', desc: 'ஒரே மாதிரியான புன்னகை முகங்கள் மற்றும் இதயங்களை கண்டறியவும்!' },
        'toy-memory': { name: 'பொம்மை பொருத்துதல் விளையாட்டு', desc: 'டெடி பியர், விளையாட்டு ராக்கெட்டுகள் மற்றும் படகுகளைப் பொருத்தவும்!' },
        'shape-memory': { name: 'வடிவ நினைவக சவால்', desc: 'வட்டம், முக்கோணம் மற்றும் அறுகோணங்களின் இணைகளைத் திருப்புங்கள்!' },
        'fast-flip': { name: 'விரைவான அட்டைத் திருப்பு விளையாட்டு', desc: 'அட்டைகள் மீண்டும் திரும்புவதற்குள் அவற்றைப் பொருத்தவும்!' },
        'pattern-recall': { name: 'முறை நினைவு விளையாட்டு', desc: 'அம்மா கரடி ஒளிரச் செய்யும் முறையை அப்படியே பின்பற்றுங்கள்!' },
        'seq-memory': { name: 'எண் வரிசை நினைவக விளையாட்டு', desc: 'ஏறுவரிசையில் எண்களை நினைவில் வைத்துக் கொண்டு கிளிக் செய்யவும்!' },
        'iq-puzzle': { name: 'ஐக்யூ புதிர் சவால்', desc: 'அடுத்ததாக எந்த வடிவத் தொகுதி பொருந்தும் என்று கண்டறியவும்!' },
        'brain-mini': { name: 'மூளைக்கான மினி விளையாட்டு', desc: 'உன் மூளையைச் சோதிக்க விரைவான புதிர்களை முடி!' },
        'jigsaw-puzzle': { name: 'ஜிগ்சா புதிர்கள்', desc: 'விலங்குகளின் காட்சிகளை உருவாக்க புதிர்த் துண்டுகளை இழுக்கவும்!' },
        'maze-runner': { name: 'பிரமை ஓட்டப்பந்தயம்', desc: 'பிரமைகளின் வழியாக ஆராய்ச்சியாளரை வழிநடத்தவும்!' },
        'tangrams': { name: 'டான்கிராம் வடிவம்', desc: 'வடிவியல் தொகுதிகளை வரிசைப்படுத்தி விலங்குகளை உருவாக்குங்கள்!' },
        'pipe-connect': { name: 'குழாய் இணைப்பு விளையாட்டு', desc: 'பூக்களுக்கு நீர் பாய்ச்ச குழாய்களைத் திருப்பி இணைக்கவும்!' },
        'block-fit': { name: 'மரக்கட்டை பொருத்துதல்', desc: 'மரக் கட்டங்களின் எல்லைக்குள் வடிவங்களைப் பொருத்தவும்!' },
        'hidden-objects': { name: 'மறைந்திருக்கும் பொருட்கள்', desc: 'அடர்ந்த காடுகளுக்குள் மறைந்திருக்கும் பொருட்களைக் கண்டுபிடி!' },
        'spot-diff': { name: 'வேறுபாட்டைக் கண்டுபிடி', desc: 'இரண்டு படங்களை ஒப்பிட்டு வேறுபாடுகளைத் தட்டவும்!' },
        'kids-sudoku': { name: 'குழந்தைகளுக்கான சுடோகு', desc: 'வரிசைகளை பழங்களின் ஸ்டிக்கர்களால் நிரப்பவும்!' },
        'logic-grids': { name: 'தர்க்கக் கட்டம்', desc: 'விலங்குகளின் தடயங்களைக் கண்டறிய புதிர்களைத் தீர்க்கவும்!' },
        'escape-adv': { name: 'அறையிலிருந்து தப்பித்தல்', desc: 'சாவி இருக்கும் இடத்தை கண்டுபிடித்து பெட்டியைத் திறக்கவும்!' },
        'animal-coloring': { name: 'விலங்கு வண்ணம் தீட்டுதல்', desc: 'சிங்கம், பாண்டா மற்றும் யானைகளுக்கு வண்ணம் தீட்டுங்கள்!' },
        'cartoon-book': { name: 'கார்ட்டூன் புத்தக வண்ணம்', desc: 'கார்ட்டூன் வடிவங்களுக்கு வண்ணச் சாக்கைக் கொண்டு நிரப்புங்கள்!' },
        'color-by-number': { name: 'எண்களுக்கு ஏற்ப வண்ணம்', desc: 'படங்களை வெளிப்படுத்த எண்கள் கொண்ட கட்டங்களுக்கு வண்ணம் தீட்டவும்!' },
        'magic-drawing': { name: 'மந்திர வரைதல் பலகை', desc: 'நமது கரும்பலகையில் உங்களுக்கு விருப்பமானதை வரையவும்!' },
        'finger-painting': { name: 'விரல் ஓவியம்', desc: 'அழகான விரல் ஓவியங்கள் மற்றும் இசை ஒலிகளை உருவாக்கு!' },
        'dot-to-dot': { name: 'புள்ளிகளை இணைத்தல்', desc: 'மறைந்திருக்கும் உருவங்களை வெளிப்படுத்த புள்ளிகளை இணைக்கவும்!' },
        'pixel-art': { name: 'பிக்சல் கலை', desc: 'பிக்சல் ஓவியங்களை வரைய கட்டங்களில் வண்ணம் தீட்டவும்!' },
        'sand-art': { name: 'மணல் கலை உருவகப்படுத்துதல்', desc: 'ஒரு பாட்டிலுக்குள் வண்ண மணல் அடுக்குகளை ஊற்றவும்!' },
        'sticker-creator': { name: 'ஸ்டிக்கர் தயாரிப்பாளர்', desc: 'ஸ்டிக்கர்களை உருவாக்கி அவற்றை காட்சிகளில் வைக்கவும்!' },
        'greeting-cards': { name: 'வாழ்த்து அட்டை', desc: 'அட்டைகளில் வாழ்த்துச் செய்திகளையும் அலங்காரங்களையும் சேர்!' },
        'guess-sound': { name: 'விலங்கு குரல் கண்டுபிடி', desc: 'பறவைகள் மற்றும் விலங்குகளின் குரல்களைக் கேட்டுப் பெயரிடு!' },
        'feed-animal': { name: 'விலங்குக்கு உணவளி', desc: 'குரங்குகளுக்கு வாழைப்பழங்களையும் நாய்க்குட்டிகளுக்கு எலும்புகளையும் கொடு!' },
        'pet-care': { name: 'செல்லப்பிராணி பராமரிப்பு', desc: 'பூனை அல்லது நாய்க்குட்டியை குளிப்பாட்டி உணவளித்துப் பராமரி!' },
        'zoo-manager': { name: 'விலங்கியல் பூங்கா மேலாளர்', desc: 'விலங்குகளின் இருப்பிடங்களை உருவாக்கி அவற்றை ஒழுங்குபடுத்து!' },
        'jungle-safari': { name: 'காட்டுச் சவாரி', desc: 'காடுகளை ஆராய்ந்து மறைந்திருக்கும் விலங்குகளைத் தேடு!' },
        'dino-explorer': { name: 'டைனோசர் ஆராய்ச்சியாளர்', desc: 'மறைந்திருக்கும் எலும்புகளைத் தோண்டி எடுத்து कंகால் பொருத்து!' },
        'aquarium-sim': { name: 'மீன் தொட்டி உருவகப்படுத்துதல்', desc: 'மீன் தொட்டியை உருவாக்கி வண்ண மீன்களால் அலங்கரி!' },
        'bird-flight': { name: 'பறவையின் பறத்தல்', desc: 'குட்டிப் பறவையை மரங்கள் மீது மோதாமல் பறக்கச் செய்!' },
        'farm-match': { name: 'பண்ணை விலங்கு பொருத்துதல்', desc: 'பண்ணை விலங்குகளை அவற்றின் சரியான இருப்பிடத்தில் வகைப்படுத்து!' },
        'wildlife-rescue': { name: 'காட்டுவிலங்கு மீட்பு', desc: 'காயமடைந்த விலங்குகளுக்கு கட்டுப்போட்டு பராமரி!' },
        'solar-system': { name: 'சூரிய குடும்பம்', desc: 'கோள்களை அவற்றின் சரியான வட்டப்பாதையில் வரிசைப்படுத்து!' },
        'space-mission': { name: 'விண்வெளி பயணம்', desc: 'விண்வெளி படிகங்களை சேகரிக்க ரோவரை வழிநடத்து!' },
        'rocket-builder': { name: 'ராக்கெட் தயாரிப்பாளர்', desc: 'ராக்கெட்டின் பாகங்கள், என்ஜின்களை ஒன்றிணைத்து உருவாக்கு!' },
        'human-body': { name: 'மனித உடல்', desc: 'தலைமுடி, விலா எலும்பு மற்றும் எலும்புகளை கங்காலில் பொருத்து!' },
        'plant-growing': { name: 'செடி வளர்ப்பு', desc: 'நீர் ஊற்றி சூரிய ஒளியை பிரகாசிக்கச் செய்து செடியை வளர்க்கவும்!' },
        'water-cycle': { name: 'நீர் சுழற்சி', desc: 'நீரை கொதிக்க வைத்து மேகங்களை உருவாக்கி மழையை உருவாக்கு!' },
        'magnet-science': { name: 'காந்த அறிவியல்', desc: 'காந்தங்களைச் சோதித்து உலோகக் கவ்விகளை ஈர்க்கச் செய்!' },
        'fossil-dig': { name: 'புதைபடிவ அகழ்வாராய்ச்சி', desc: 'டைனோசரின் பழங்கால எலும்புகளை கண்டறிய மணலை சுத்தம் செய்!' },
        'weather-match': { name: 'வானிலை பொருத்துதல்', desc: 'வானிலைக்கு ஏற்ப சரியான ஆடைகளைப் பொருத்துக!' },
        'science-quizzes': { name: 'அறிவியல் வினாடி வினா', desc: 'காந்தங்கள், புவியீர்ப்பு மற்றும் இயற்பியல் கேள்விகளைச் சோதி!' },
        'pizza-maker': { name: 'பீட்சா தயாரிப்பாளர்', desc: 'சாஸ், சீஸ் மற்றும் டாப்பிங்ஸ்களை அடுக்கி சுட வைக்கவும்!' },
        'cake-decorator': { name: 'கேக் அலங்காரம்', desc: 'கிரீம், சாக்லேட் மற்றும் மெழுகுவர்த்திகளைச் சேர்!' },
        'ice-cream': { name: 'ஐஸ்கிரீம் தயாரிப்பாளர்', desc: 'வெண்ணிலா, செர்ரி மற்றும் பழங்களைச் சேர்த்து ஐஸ்கிரீம் செய்!' },
        'burger-builder': { name: 'பர்கர் தயாரிப்பாளர்', desc: 'பர்கர் இறைச்சி, சீஸ், கீரை மற்றும் தக்காளியை அடுக்கு!' },
        'candy-factory': { name: 'மிட்டாய் தொழிற்சாலை', desc: 'மிட்டாய்களை உருவாக்கி அவற்றுக்கு வண்ணம் சேர்!' },
        'bakery-shop': { name: 'பேக்கரி கடை', desc: 'சுவையான டோனட்ஸ் மற்றும் ரொட்டிகளை சுட்டு எடு!' },
        'princess-dress': { name: 'ராஜकुमारी ड्रेस-अप', desc: 'அழகான கிரீடம், ஆடைகள் மற்றும் செருப்புகளைத் தேர்ந்தெடு!' },
        'superhero-creator': { name: 'சூப்பர்ஹீரோ தயாரிப்பாளர்', desc: 'முகமூடி, ஆடை மற்றும் ராக்கெட்டுகளுடன் வடிவமைத்திடு!' },
        'fashion-designer': { name: 'ஆடை வடிவமைப்பாளர்', desc: 'ஃபேஷன் மாடலுக்கு ஆடைகள் மற்றும் காலணிகளைத் தேர்ந்தெடு!' },
        'hair-salon': { name: 'முடி அலங்கார நிலையம்', desc: 'தலைமுடிக்கு வண்ணக் கிளிப்புகள் மற்றும் வில்லுகளைச் சேர்!' },
        'treasure-hunt': { name: 'புதையல் தேடல்', desc: 'தீவுகளில் மறைந்திருக்கும் புதையல் பெட்டிகளைக் கண்டுபிடி!' },
        'pirate-island': { name: 'கொள்ளையர் தீவு', desc: 'பாறைகளைத் தவிர்த்து கப்பலை தீவுக்கு ஓட்டிச் செல்!' },
        'ninja-runner': { name: 'நிஞ்சா ஓட்டப்பந்தயம்', desc: 'நிஞ்சாவை சுவர்கள் மற்றும் சேற்றுப் பள்ளங்களுக்கு மேல் செலுத்து!' },
        'robot-rescue': { name: 'ரோபோ மீட்பு', desc: 'ரோபோவை வீட்டிற்கு கொண்டு சேர்க்க அம்புப் பாதையை அமை!' },
        'dragon-adv': { name: 'டிராகன் சாகசம்', desc: 'குட்டி டிராகன் மேகங்களுக்கு இடையே பறக்க உதவு!' },
        'deep-dive': { name: 'ஆழ்கடல் பயணம்', desc: 'முத்துக்களைக் கண்டறிய पनடுப்பியை வெடிகுண்டுகளில் இருந்து காப்பாற்று!' },
        'jungle-escape': { name: 'காட்டிலிருந்து தப்பித்தல்', desc: 'நமது குரங்கு குட்டிக்கு வாழைப்பழங்களைச் சேகரிக்க உதவு!' },
        'magic-castle': { name: 'மந்திர கோட்டை', desc: 'தங்கக் கிரீடங்களைக் கண்டறிய கோட்டையை ஆராய்!' },
        'time-travel': { name: 'காலப் பயணம்', desc: 'டைனோசர் காலத்திற்கோ அல்லது எதிர்காலத்திற்கோ பயணம் செய்!' },
        'alien-rescue': { name: 'ஏலியன் மீட்பு', desc: 'ஏலியன் விண்கலத்துடன் தன் வீட்டிற்குச் செல்ல உதவு!' }
    }
};

function getLocalizedGameValue(gameId, key) {
    const game = ARCADE_GAMES.find(g => g.id === gameId);
    if (!game) return "";
    
    if (GAME_TRANSLATIONS[currentLanguage] && GAME_TRANSLATIONS[currentLanguage][gameId]) {
        return GAME_TRANSLATIONS[currentLanguage][gameId][key] || game[key];
    }
    return game[key];
}

/* ============================================================
   PLAYFUL VOICE SYNTHESIS (Mommy Teacher Voice)
   ============================================================ */
function initSpeechVoice() {
    if (!window.speechSynthesis) return;
    
    const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        synthVoice = null;
        
        // Prioritize English India or standard female English voices (Heera, Aria, Samantha, Zira)
        const femaleVoiceNames = ['heera', 'aria', 'google us english', 'zira', 'samantha', 'susan', 'female', 'india'];
        for (let name of femaleVoiceNames) {
            let found = voices.find(v => v.name.toLowerCase().includes(name) && v.lang.startsWith('en'));
            if (found) {
                synthVoice = found;
                break;
            }
        }
        
        if (!synthVoice) {
            synthVoice = voices.find(v => v.lang.startsWith('en'));
        }
        
        if (!synthVoice) {
            synthVoice = voices[0];
        }
    };
    
    setVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = setVoice;
    }
}

function speakSpeech(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    if (voiceMuted) return; // Suppression toggle
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (synthVoice) {
        utterance.voice = synthVoice;
    }
    
    // Warm motherly teacher cartoon voice settings
    utterance.pitch = 1.25; 
    utterance.rate = 0.80;  
    
    window.speechSynthesis.speak(utterance);
}

function speakMascotSpeech() {
    const textNode = document.getElementById('mascot-speech-text');
    if (textNode) {
        speakSpeech(textNode.innerText);
    }
}

function toggleVoiceMute() {
    voiceMuted = !voiceMuted;
    playPopSound();
    
    const btn = document.getElementById('voice-toggle-btn');
    const tDict = KIDDY_TRANSLATIONS[currentLanguage] || KIDDY_TRANSLATIONS['en'];
    
    if (voiceMuted) {
        if (btn) {
            btn.classList.add('muted');
            btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> <span id="voice-btn-text">${tDict.voice_off}</span>`;
        }
        window.speechSynthesis.cancel();
    } else {
        if (btn) {
            btn.classList.remove('muted');
            btn.innerHTML = `<i class="fa-solid fa-volume-high"></i> <span id="voice-btn-text">${tDict.voice_on}</span>`;
        }
        speakMascotSpeech();
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    playPopSound();
    
    const selector = document.getElementById('lang-select');
    if (selector) selector.value = lang;
    
    const tDict = KIDDY_TRANSLATIONS[lang] || KIDDY_TRANSLATIONS['en'];
    
    // Basic Header elements
    const elementsToTranslate = {
        'brand-text': tDict.brand,
        'lbl-explorer-lvl': tDict.explorer_lvl,
        'lbl-score': tDict.score,
        'mascot-name-tag': tDict.mascot_name,
        'lbl-read-out-loud': tDict.read_out_loud
    };
    
    for (let id in elementsToTranslate) {
        const node = document.getElementById(id);
        if (node) node.innerText = elementsToTranslate[id];
    }
    
    // Translate the lobby main headline
    const headline = document.querySelector('.lobby-headline');
    if (headline) headline.innerText = tDict.lobby_headline || "Select Your Adventure! 🎨🎈";
    
    // Translate all Home buttons in every cabinet header
    const homeBtns = document.querySelectorAll('.back-lobby-btn');
    homeBtns.forEach(btn => {
        btn.innerHTML = `<i class="fa-solid fa-house"></i> ${tDict.home}`;
    });
    
    // Toggle selector button labels
    const btn = document.getElementById('voice-toggle-btn');
    if (btn) {
        const icon = voiceMuted ? 'fa-volume-xmark' : 'fa-volume-high';
        const label = voiceMuted ? tDict.voice_off : tDict.voice_on;
        btn.innerHTML = `<i class="fa-solid ${icon}"></i> <span id="voice-btn-text">${label}</span>`;
    }
    
    // Translate category tabs bar
    const categoryTabsBar = document.getElementById('category-tabs-bar');
    if (categoryTabsBar) {
        const buttons = categoryTabsBar.querySelectorAll('.category-tab');
        const categoriesMap = ['learning', 'english', 'memory', 'puzzle', 'art', 'animal', 'science', 'cooking', 'adventure'];
        buttons.forEach((btn, idx) => {
            const cat = categoriesMap[idx];
            if (cat) {
                const text = tDict[`tab_${cat}`];
                const iconSpan = btn.querySelector('.tab-emoji');
                btn.innerHTML = `<span class="tab-emoji">${iconSpan ? iconSpan.innerText : ""}</span> ${text.replace(/^[^\s]+\s+/, '')}`;
            }
        });
    }
    
    // Mascot Voice Synthesis initialization
    initSpeechVoice();
    
    if (activeZone === 'lobby') {
        setMascotState("🐻❤️", tDict.mascot_name, tDict.lobby_welcome);
    } else {
        if (currentActiveGame) {
            const localizedName = getLocalizedGameValue(currentActiveGame.id, 'name');
            const localizedDesc = getLocalizedGameValue(currentActiveGame.id, 'desc');
            
            // Also update the cabinet header title to the localized name
            const cabinet = document.getElementById(`zone-${currentActiveGame.engine}`);
            if (cabinet) {
                const titleEl = cabinet.querySelector('.cabinet-title');
                if (titleEl) {
                    titleEl.innerText = `${currentActiveGame.emoji} ${localizedName}`;
                }
            }
            
            let gameGreeting = "";
            if (currentLanguage === 'hi') {
                gameGreeting = `आइए ${localizedName} खेलें, प्यारे बच्चे! ${localizedDesc}`;
            } else if (currentLanguage === 'ta') {
                gameGreeting = `வா செல்லமே, ${localizedName} விளையாடலாம்! ${localizedDesc}`;
            } else {
                gameGreeting = `Let's play ${localizedName}, sweetheart! ${localizedDesc}`;
            }
            setMascotState("🐻❤️", tDict.mascot_name, gameGreeting);
        }
    }
    
    renderLobbyGames();
}

/* ============================================================
   100-GAME LOBBY TAB NAVIGATION & CARD INJECTION
   ============================================================ */
function switchLobbyCategory(cat, element) {
    currentLobbyCategory = cat;
    playPopSound();
    
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');
    
    const tDict = KIDDY_TRANSLATIONS[currentLanguage] || KIDDY_TRANSLATIONS['en'];
    const greeting = tDict[`cat_${cat}`] || tDict.lobby_welcome;
    
    setMascotState("🐻❤️", tDict.mascot_name, greeting);
    renderLobbyGames();
}

function renderLobbyGames() {
    const container = document.getElementById('lobby-games-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Filter games by current lobby category
    const filteredGames = ARCADE_GAMES.filter(g => g.category === currentLobbyCategory);
    
    // Group games by subgroup name
    const groups = {};
    filteredGames.forEach(game => {
        if (!groups[game.subgroup]) groups[game.subgroup] = [];
        groups[game.subgroup].push(game);
    });
    
    // Pastel color classes cycle
    const cardColors = ['purple', 'blue', 'pink', 'yellow', 'green', 'orange', 'indigo', 'lime', 'cyan', 'amber', 'rose'];
    let cardIndex = 0;
    
    // Inject grouped subheadings and cards grid
    for (let subgroupName in groups) {
        const block = document.createElement('div');
        block.className = 'lobby-subheading-block';
        
        // Dash subgroup heading
        const heading = document.createElement('h3');
        heading.className = 'lobby-category-subheading';
        heading.innerHTML = `<span>⭐</span> ${subgroupName}`;
        block.appendChild(heading);
        
        // Cards grid
        const grid = document.createElement('div');
        grid.className = 'lobby-grid';
        
        groups[subgroupName].forEach(game => {
            const cardColor = cardColors[cardIndex % cardColors.length];
            cardIndex++;
            
            const card = document.createElement('div');
            card.className = `lobby-card card-${cardColor}`;
            card.onclick = () => launchGame(game.id);
            
            card.innerHTML = `
                <div class="card-emoji">${game.emoji}</div>
                <h3 class="card-title">${game.name}</h3>
                <p class="card-desc">${game.desc}</p>
            `;
            grid.appendChild(card);
        });
        
        block.appendChild(grid);
        container.appendChild(block);
    }
}

function launchGame(gameId) {
    const game = ARCADE_GAMES.find(g => g.id === gameId);
    if (!game) return;
    
    currentActiveGame = game;
    playPopSound();
    
    // Dynamic mascot greeting
    const speechText = `Let's play ${game.name}, sweetheart! ${game.desc}`;
    setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", speechText);
    
    // Switch to corresponding cabinet route
    routeTo(game.engine);
    
    // Initialize specific cabinet config variables
    if (game.engine === 'maker') {
        initMakerStudio(game.config);
    } else if (game.engine === 'science') {
        initScienceSim(game.config);
    } else if (game.engine === 'paint') {
        if (game.config && game.config.template) {
            setTimeout(() => { loadCartoonTemplate(game.config.template); }, 200);
        } else {
            setTimeout(() => { clearMagicCanvas(); }, 200);
        }
    } else if (game.engine === 'alphabet') {
        if (game.config && game.config.mode) {
            switchAlphabetSubGame(game.config.mode);
        }
    } else if (game.engine === 'counting') {
        if (game.config && game.config.mode) {
            switchCountingSubGame(game.config.mode);
        }
    } else if (game.engine === 'math') {
        if (game.config && game.config.mode) {
            switchMathSubGame(game.config.mode);
        }
    } else if (game.engine === 'memory') {
        if (game.config && game.config.theme) {
            setMemoryTheme(game.config.theme);
        }
    } else if (game.engine === 'animal-sounds') {
        if (game.config && game.config.mode) {
            switchAnimalSubGame(game.config.mode);
        }
    }
}

/* ============================================================
   MODULE 12: DYNAMIC MAKER & STICKERS ENGINE
   ============================================================ */
function initMakerStudio(config) {
    document.getElementById('maker-title').innerText = currentActiveGame.name;
    document.getElementById('maker-instruction').innerText = config.instruction || "Drag or tap items to decorate your masterpiece!";
    
    document.getElementById('maker-base-element').innerText = config.base || "🍕";
    
    // Clear previously stamped items
    const placedItemsContainer = document.getElementById('maker-placed-items');
    placedItemsContainer.innerHTML = '';
    
    // Populate sidebar decorative palette
    const sidebarGrid = document.getElementById('maker-items-grid');
    sidebarGrid.innerHTML = '';
    
    config.items.forEach(emoji => {
        const itemNode = document.createElement('div');
        itemNode.className = 'maker-item-bubble';
        itemNode.innerText = emoji;
        itemNode.onclick = () => stampMakerItem(emoji);
        
        // Dragging support from sidebar palette to canvas
        itemNode.draggable = true;
        itemNode.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', emoji);
        };
        
        sidebarGrid.appendChild(itemNode);
    });
    
    // Setup drop-area event bindings on the canvas once
    const canvasArea = document.getElementById('maker-canvas-area');
    canvasArea.ondragover = (e) => { e.preventDefault(); };
    canvasArea.ondrop = (e) => {
        e.preventDefault();
        const emoji = e.dataTransfer.getData('text/plain');
        if (!emoji) return;
        
        const rect = canvasArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        
        stampMakerItem(emoji, percentX, percentY);
    };
}

function stampMakerItem(emoji, percentX = 50, percentY = 50) {
    playPopSound();
    
    const placedItemsContainer = document.getElementById('maker-placed-items');
    
    const item = document.createElement('div');
    item.className = 'maker-placed-item';
    item.innerText = emoji;
    item.style.left = `${percentX}%`;
    item.style.top = `${percentY}%`;
    
    // Delete sticker marker
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'maker-placed-item-delete';
    deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        playPopSound();
        placedItemsContainer.removeChild(item);
    };
    item.appendChild(deleteBtn);
    
    // Enable mouse and touch drag coordinates positioning
    enableMakerDrag(item);
    
    placedItemsContainer.appendChild(item);
}

function enableMakerDrag(node) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    
    const onStart = (clientX, clientY) => {
        isDragging = true;
        const rect = node.getBoundingClientRect();
        const canvasRect = document.getElementById('maker-canvas-area').getBoundingClientRect();
        
        startX = clientX - rect.left + rect.width / 2;
        startY = clientY - rect.top + rect.height / 2;
        node.style.cursor = 'grabbing';
    };
    
    const onMove = (clientX, clientY) => {
        if (!isDragging) return;
        
        const canvas = document.getElementById('maker-canvas-area');
        const canvasRect = canvas.getBoundingClientRect();
        
        let newX = clientX - canvasRect.left;
        let newY = clientY - canvasRect.top;
        
        newX = Math.max(0, Math.min(canvasRect.width, newX));
        newY = Math.max(0, Math.min(canvasRect.height, newY));
        
        const percentX = (newX / canvasRect.width) * 100;
        const percentY = (newY / canvasRect.height) * 100;
        
        node.style.left = `${percentX}%`;
        node.style.top = `${percentY}%`;
    };
    
    const onEnd = () => {
        if (isDragging) {
            isDragging = false;
            node.style.cursor = 'grab';
        }
    };
    
    node.onmousedown = (e) => {
        e.preventDefault();
        onStart(e.clientX, e.clientY);
        
        document.onmousemove = (e) => onMove(e.clientX, e.clientY);
        document.onmouseup = () => {
            onEnd();
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
    
    node.ontouchstart = (e) => {
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY);
    };
    
    node.ontouchmove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
    };
    
    node.ontouchend = () => {
        onEnd();
    };
}

function clearMakerPlate() {
    playPopSound();
    document.getElementById('maker-placed-items').innerHTML = '';
    setMascotSpeechBubble("koala", "Board cleared, sweetheart! Let's start decorating again!");
}

function saveMakerMasterpiece() {
    playCorrectChime();
    
    const canvasArea = document.getElementById('maker-canvas-area');
    spawnClickConfetti(canvasArea);
    
    setTimeout(() => {
        triggerGameOver(3);
    }, 1500);
}

/* ============================================================
   MODULE 13: SCIENCE SANDBOX SIMULATION
   ============================================================ */
function initScienceSim(config) {
    currentScienceConfig = config;
    exploredTriggers.clear();
    
    document.getElementById('science-title').innerText = currentActiveGame.name;
    document.getElementById('science-instruction').innerText = currentActiveGame.desc;
    
    const mainActor = document.getElementById('science-main-actor');
    mainActor.innerText = config.actor || "🔬";
    mainActor.style.transform = 'scale(1)';
    
    // Clear effects stage
    document.getElementById('science-bg-effects').innerHTML = '';
    
    // Populate panel trigger buttons
    const btnGrid = document.getElementById('science-buttons-grid');
    btnGrid.innerHTML = '';
    
    config.buttons.forEach((btnName, idx) => {
        const btn = document.createElement('button');
        btn.className = 'science-sim-btn';
        
        let bullet = '⚡';
        if (btnName.includes('Rain') || btnName.includes('Cool')) bullet = '💧';
        else if (btnName.includes('Sun') || btnName.includes('Heat')) bullet = '☀️';
        else if (btnName.includes('Bee') || btnName.includes('Fly')) bullet = '🐝';
        else if (btnName.includes('Orbit') || btnName.includes('Saturn')) bullet = '🪐';
        else if (btnName.includes('Earth')) bullet = '🌍';
        else if (btnName.includes('Clip')) bullet = '📎';
        else if (btnName.includes('Wood')) bullet = '🪵';
        else if (btnName.includes('Coin')) bullet = '🪙';
        else if (btnName.includes('Wind')) bullet = '💨';
        
        btn.innerHTML = `<span>${bullet}</span> ${btnName}`;
        btn.onclick = () => triggerScienceAction(config.type, btnName, idx, btn);
        btnGrid.appendChild(btn);
    });
}

function triggerScienceAction(type, name, idx, btnNode) {
    playPopSound();
    exploredTriggers.add(idx);
    
    const mainActor = document.getElementById('science-main-actor');
    
    if (type === 'plant') {
        if (name.includes('Rain')) {
            spawnScienceParticle('💧');
            spawnScienceParticle('💧');
            if (mainActor.innerText === '🌱') {
                mainActor.innerText = '🌿';
                mainActor.style.transform = 'scale(1.2)';
            }
            setMascotSpeechBubble("koala", "Look at the gentle rain nourishing our sprout! It's growing green leaves, sweetheart!");
        } else if (name.includes('Sun')) {
            spawnScienceParticle('☀️');
            if (mainActor.innerText === '🌿') {
                mainActor.innerText = '🌸';
                mainActor.style.transform = 'scale(1.4)';
            } else if (mainActor.innerText === '🌱') {
                mainActor.innerText = '🌿';
                mainActor.style.transform = 'scale(1.2)';
            }
            setMascotSpeechBubble("koala", "Sunlight is pure energy! Our plant is growing a beautiful pink flower, darling!");
        } else if (name.includes('Bee')) {
            spawnScienceParticle('🐝');
            spawnScienceParticle('🌸');
            if (mainActor.innerText === '🌸') {
                mainActor.innerText = '🌻';
                mainActor.style.transform = 'scale(1.5)';
            }
            setMascotSpeechBubble("koala", "Buzz! A happy little honeybee came to visit our blooming sunflower! Nature is wonderful!");
        }
    } 
    else if (type === 'space') {
        if (name.includes('Sun')) {
            spawnScienceParticle('☀️');
            mainActor.innerText = '☀️';
            setMascotSpeechBubble("monkey", "The Sun is our giant solar star! It keeps all the planets warm, honey!");
        } else if (name.includes('Earth')) {
            spawnScienceParticle('🌍');
            mainActor.innerText = '🌍';
            setMascotSpeechBubble("monkey", "Earth is our beautiful blue home! It revolves around the warm sun once every year!");
        } else if (name.includes('Saturn')) {
            spawnScienceParticle('🪐');
            mainActor.innerText = '🪐';
            setMascotSpeechBubble("monkey", "Saturn has millions of shining rings made of ice and rock! Isn't space magical, darling?");
        }
    } 
    else if (type === 'water') {
        if (name.includes('Heat')) {
            spawnScienceParticle('💨');
            spawnScienceParticle('💨');
            mainActor.innerText = '☁️';
            setMascotSpeechBubble("elephant", "Look! The heat evaporates liquid water into gas, forming a beautiful fluffy cloud!");
        } else if (name.includes('Cool')) {
            spawnScienceParticle('❄️');
            if (mainActor.innerText === '☁️') {
                mainActor.innerText = '🌧️';
            }
            setMascotSpeechBubble("elephant", "Brr! Cold air condenses the vapor back into heavy rain clouds! Perfect!");
        } else if (name.includes('Wind')) {
            spawnScienceParticle('💧');
            spawnScienceParticle('💧');
            spawnScienceParticle('💨');
            if (mainActor.innerText === '🌧️' || mainActor.innerText === '☁️') {
                mainActor.innerText = '💧';
            }
            setMascotSpeechBubble("elephant", "Splendid! The wind blows and triggers a fresh rainfall! The water cycle is complete!");
        }
    } 
    else if (type === 'magnet') {
        if (name.includes('Clip')) {
            spawnScienceParticle('📎');
            spawnScienceParticle('📎');
            mainActor.innerText = '🧲';
            playRaceBoost();
            setMascotSpeechBubble("fox", "Clink! The magnet attracts the steel paperclips! Magnetism is a strong force, honey!");
        } else if (name.includes('Wood')) {
            spawnScienceParticle('🪵');
            setMascotSpeechBubble("fox", "Look, darling! The wooden block does not stick. Magnets only attract metallic iron!");
        } else if (name.includes('Coin')) {
            spawnScienceParticle('🪙');
            spawnScienceParticle('🪙');
            playRaceBoost();
            setMascotSpeechBubble("fox", "Ding! Shiny metal coins are attracted to the magnet! You are a wonderful explorer!");
        }
    }
    
    awardStars(1);
    
    // Check completion when all triggers clicked
    if (exploredTriggers.size === currentScienceConfig.buttons.length) {
        setTimeout(() => {
            spawnClickConfetti(mainActor);
            triggerGameOver(3);
        }, 1500);
    }
}

function resetScienceSim() {
    playPopSound();
    if (currentScienceConfig) {
        initScienceSim(currentScienceConfig);
    }
}

function spawnScienceParticle(emoji) {
    const stage = document.getElementById('science-stage');
    const container = document.getElementById('science-bg-effects');
    if (!container || !stage) return;
    
    const el = document.createElement('div');
    el.className = 'science-effect-element';
    el.innerText = emoji;
    
    const left = Math.random() * (stage.clientWidth - 40);
    const top = Math.random() * (stage.clientHeight - 40);
    
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    
    container.appendChild(el);
    
    setTimeout(() => {
        if (el.parentNode) {
            container.removeChild(el);
        }
    }, 3000);
}

/* ============================================================
   PORTAL DYNAMIC GAME-OVER MODAL CONTROLLER & SECTION PROGRESS
   ============================================================ */
function triggerGameOver(starsEarned) {
    playCorrectChime();
    
    // Dashboard score increment
    awardStars(starsEarned);
    
    const modal = document.getElementById('game-over-modal');
    const modalStarsVal = document.getElementById('modal-stars-val');
    const modalLevelVal = document.getElementById('modal-level-val');
    
    if (modal) {
        modal.classList.remove('hidden');
    }
    if (modalStarsVal) {
        modalStarsVal.innerText = `+${starsEarned}`;
    }
    if (modalLevelVal) {
        modalLevelVal.innerText = document.getElementById('level-val') ? document.getElementById('level-val').innerText : '1';
    }
    
    // Label translations (pure English as preferred)
    const titleText = document.getElementById('modal-title-text');
    if (titleText) titleText.innerText = "Adventure Complete! 🎉";
    const lblStars = document.getElementById('lbl-modal-stars-earned');
    if (lblStars) lblStars.innerText = "You earned";
    const lblLvl = document.getElementById('lbl-modal-lvl');
    if (lblLvl) lblLvl.innerText = "Explorer Level:";
    const btnLobby = document.getElementById('btn-modal-lobby');
    if (btnLobby) btnLobby.innerHTML = `<i class="fa-solid fa-house"></i> Lobby`;
    const btnNext = document.getElementById('btn-modal-next');
    if (btnNext) btnNext.innerHTML = `Next Game <i class="fa-solid fa-circle-chevron-right"></i>`;
    
    // Celebrate with beautiful fireworks confetti sparks
    for (let k = 0; k < 3; k++) {
        setTimeout(() => {
            const rx = window.innerWidth * (0.25 + Math.random() * 0.5);
            const ry = window.innerHeight * (0.3 + Math.random() * 0.4);
            const colors = ['#ec4899', '#38bdf8', '#eab308', '#10b981', '#8b5cf6', '#f97316', '#ef4444'];
            for (let i = 0; i < 25; i++) {
                activeParticles.push({
                    type: 'confetti',
                    x: rx, y: ry,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: -6 + Math.random() * 12,
                    vy: -10 - Math.random() * 8,
                    width: 8 + Math.random() * 6,
                    height: 10 + Math.random() * 6,
                    alpha: 1.0,
                    rotation: Math.random() * Math.PI,
                    rotSpeed: -0.1 + Math.random() * 0.2,
                    decay: 0.015 + Math.random() * 0.01,
                    gravity: 0.2
                });
            }
        }, k * 300);
    }
    
    // Mascot congratulatory message
    const congrats = `Spectacular adventure, sweetheart! You earned +${starsEarned} golden stars! Mommy is so proud of you! ⭐`;
    setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", congrats);
}

function closeGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    playPopSound();
}

function launchNextGameInSection() {
    closeGameOverModal();
    if (!currentActiveGame) {
        routeTo('lobby');
        return;
    }
    
    const cat = currentActiveGame.category;
    const catGames = ARCADE_GAMES.filter(g => g.category === cat);
    if (catGames.length === 0) {
        routeTo('lobby');
        return;
    }
    
    // Find index of current game
    const currentIndex = catGames.findIndex(g => g.id === currentActiveGame.id);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= catGames.length) {
        nextIndex = 0; // Wrap around to first
    }
    
    const nextGame = catGames[nextIndex];
    if (nextGame) {
        launchGame(nextGame.id);
    } else {
        routeTo('lobby');
    }
}
