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
    
    // Dynamic mascot welcome speeches
    let mascotSpeechText = "";
    if (zone === 'lobby') {
        mascotSpeechText = "Hello sweetie! Welcome back to our KiddyQuest Arcade! 🐻❤️ Pick any magical category tab below to start our fun games together! I am so proud of how much you are learning!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        renderLobbyGames();
    } else if (zone === 'alphabet') {
        mascotSpeechText = "Alphabet Land is full of wonderful letters, sweetheart! Let's pop some phonics sounds, match lowercase letters to their big clouds, or complete sequences together! You can do it!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initAlphabetGame();
    } else if (zone === 'counting') {
        mascotSpeechText = "Numbers are so fun to count, my darling! Let's count some delicious cupcakes or pop those pretty balloons in order!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initCountingGame();
    } else if (zone === 'math') {
        mascotSpeechText = "Vroom! Let's help Robbie the Rabbit race down the addition track, or try our exciting Math Quiz Battle! I'm cheering for you, honey!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initMathGame();
    } else if (zone === 'memory') {
        mascotSpeechText = "Let's match some cute cards, sweetheart! Flip them over to find identical animals, fruits, or emojis! This is great for your bright mind!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initMemoryGame();
    } else if (zone === 'shapes') {
        mascotSpeechText = "Look at these lovely shapes, darling! Drag the glowing blocks into their matching outline containers. Let's see them fit together!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initShapesGame();
    } else if (zone === 'paint') {
        mascotSpeechText = "Time to paint a beautiful masterpiece, my little artist! Pick bubble colors, use the cute caterpillar slider to change sizes, and let's save your gorgeous artwork!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initMagicCanvas();
    } else if (zone === 'spelling') {
        mascotSpeechText = "Bzzz! Let's spell some fun words together, darling! Unscramble the letters to match the target emoji! You are so smart!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initSpellingGame();
    } else if (zone === 'animal-sounds') {
        mascotSpeechText = "Roar! Wild animals are so amazing, sweetheart! Let's listen to their sounds and guess who is calling, or help sort them to their happy habitats!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initAnimalGame();
    } else if (zone === 'gk') {
        mascotSpeechText = "Zoom into the stars, honey! Welcome to our Space GK Quiz! Let's answer questions about planets, flags, and the human body!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initGKGame();
    } else if (zone === 'adventure') {
        mascotSpeechText = "Hop along, sweetheart! Guide our cute bunny across the jungle grid using the arrows to find sweet golden carrots! Watch out for the mud slides!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
        initAdventureGame();
    } else if (zone === 'story') {
        mascotSpeechText = "Once upon a time... 🔮 Let's read a magical fairytale together, sweetheart! You get to choose the path and decide the happy ending! Let's begin our story!";
        setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", mascotSpeechText);
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
    
    // Check if remaining lowercase bubbles are zero
    const count = document.getElementById('lowercase-bubbles').childElementCount;
    if (count === 0) {
        setMascotSpeechBubble("koala", "Splendid matching exploration! You linked all letter sizes!");
        setTimeout(() => { generateMatchingRound(); }, 1500);
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
    
    awardStars(2);
    spawnClickConfetti(slot);
    setMascotSpeechBubble("koala", `Fantastic sequence builder! ${targetSequenceLetter} is the missing puzzle bubble!`);
    
    setTimeout(() => { generateSequenceRound(); }, 1500);
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

function initCountingGame() {
    if (activeCountingSub === 'sweets') {
        generateCountingSweetsRound();
    } else if (activeCountingSub === 'order') {
        generateBalloonOrderRound();
    }
}

function generateCountingSweetsRound() {
    targetCountingSweetsNum = Math.floor(Math.random() * 8) + 1; // 1 to 8 sweets
    const sweetsEmojis = ['🧁', '🍩', '🍪', '🍬', '🍭', '🍓'];
    const emojiSelected = sweetsEmojis[Math.floor(Math.random() * sweetsEmojis.length)];
    
    const displayGrid = document.getElementById('sweets-display-grid');
    displayGrid.innerHTML = '';
    
    for (let i = 0; i < targetCountingSweetsNum; i++) {
        const item = document.createElement('span');
        item.className = 'bouncy-sweet';
        item.innerText = emojiSelected;
        displayGrid.appendChild(item);
    }
    
    // Generate answers list
    const options = [targetCountingSweetsNum];
    while(options.length < 4) {
        const distractingVal = Math.floor(Math.random() * 9) + 1;
        if (!options.includes(distractingVal)) options.push(distractingVal);
    }
    options.sort(() => Math.random() - 0.5);
    
    const answersContainer = document.getElementById('sweets-answer-bubbles');
    answersContainer.innerHTML = '';
    
    options.forEach(num => {
        const bubble = document.createElement('button');
        bubble.className = 'num-bubble-btn';
        bubble.innerText = num;
        bubble.onclick = () => validateSweetsCount(num, bubble);
        answersContainer.appendChild(bubble);
    });
}

function validateSweetsCount(chosenNum, node) {
    if (chosenNum === targetCountingSweetsNum) {
        playPopSound();
        playCorrectChime();
        node.style.background = 'var(--green-light)';
        node.style.borderColor = 'var(--green-main)';
        spawnClickConfetti(node);
        awardStars(1);
        setMascotSpeechBubble("elephant", `Sweet! You correctly counted ${targetCountingSweetsNum} yummy sweets! 🧁`);
        setTimeout(() => { generateCountingSweetsRound(); }, 1400);
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
    countingBalloonExpectedOrder = 1;
    document.getElementById('target-count-order').innerText = "1, 2, 3, 4";
    
    const arena = document.getElementById('counting-balloon-arena');
    arena.innerHTML = '';
    
    countingBalloonsStates = [];
    const values = [1, 2, 3, 4];
    values.sort(() => Math.random() - 0.5); // Shuffle balloon numbers
    
    const colors = ['#ef4444', '#38bdf8', '#10b981', '#f59e0b'];
    const colWidth = arena.clientWidth / 4;
    
    values.forEach((val, i) => {
        const bNode = document.createElement('div');
        bNode.className = 'balloon';
        bNode.innerText = val;
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        bNode.style.backgroundColor = color;
        bNode.style.borderColor = '#111827';
        
        // Spawn positions
        const left = 15 + (i * colWidth) + (Math.random() * (colWidth - 80));
        bNode.style.left = left + 'px';
        
        const startTop = 230 + (Math.random() * 20);
        bNode.style.top = startTop + 'px';
        
        const speed = 0.4 + Math.random() * 0.4;
        const string = document.createElement('div');
        string.className = 'balloon-string';
        bNode.appendChild(string);
        
        arena.appendChild(bNode);
        
        const state = {
            element: bNode,
            val: val,
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
    if (state.val === countingBalloonExpectedOrder) {
        playPopSound();
        state.element.classList.add('pop-out');
        
        const rect = state.element.getBoundingClientRect();
        spawnStarSplashParticles(rect.left + 30, rect.top + 36);
        awardStars(1);
        
        countingBalloonExpectedOrder += 1;
        
        if (countingBalloonExpectedOrder > 4) {
            cancelAnimationFrame(countingBalloonsPhysicsLoopId);
            playCorrectChime();
            setMascotSpeechBubble("elephant", "Phenomenal! You popped all order balloons correctly! 🌟");
            setTimeout(() => { generateBalloonOrderRound(); }, 1500);
        } else {
            setMascotSpeechBubble("elephant", `Yes! Now pop number ${countingBalloonExpectedOrder}!`);
        }
    } else {
        playBuzzerWrong();
        state.element.classList.add('shake-bubble');
        setTimeout(() => { state.element.classList.remove('shake-bubble'); }, 400);
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
    const val1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
    const val2 = Math.floor(Math.random() * 4) + 1; // 1 to 4
    mathRaceTargetAnswer = val1 + val2;
    
    document.getElementById('race-formula-text').innerText = `${val1} + ${val2} = ?`;
    
    const options = [mathRaceTargetAnswer];
    while(options.length < 3) {
        const distVal = Math.floor(Math.random() * 9) + 2;
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
        
        // Boost racer bunny
        mathRaceCurrentPos += 20;
        document.getElementById('bunny-racer').style.left = `${mathRaceCurrentPos}%`;
        
        if (mathRaceCurrentPos >= 100) {
            playCorrectChime();
            setMascotSpeechBubble("rabbit", "Hooray! Vroom! We hit the finish line and collected the golden carrot! 🥕");
            awardStars(3);
            setTimeout(() => {
                mathRaceCurrentPos = 0;
                document.getElementById('bunny-racer').style.left = '0%';
                generateMathRaceRound();
            }, 1800);
        } else {
            awardStars(1);
            setMascotSpeechBubble("rabbit", "Great boost! Another sum to accelerate faster!");
            setTimeout(() => { generateMathRaceRound(); }, 1200);
        }
    } else {
        playBuzzerWrong();
        node.classList.add('shake-bubble');
        setTimeout(() => { node.classList.remove('shake-bubble'); }, 400);
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
            playCorrectChime();
            setMascotSpeechBubble("rabbit", `Quiz time's up! Awesome job! You answered ${quizCorrectTotal} sums correctly!`);
            awardStars(quizCorrectTotal);
            document.getElementById('start-math-quiz-btn').classList.remove('hidden');
        }
    }, 1000);
}

function generateQuizSum() {
    const v1 = Math.floor(Math.random() * 8) + 1;
    const v2 = Math.floor(Math.random() * 7) + 1;
    const rand = Math.random();
    
    if (rand < 0.35) {
        quizTargetAnswer = v1 + v2;
        document.getElementById('quiz-formula-text').innerText = `${v1} + ${v2} = ?`;
    } else if (rand < 0.7) {
        const top = Math.max(v1, v2);
        const bot = Math.min(v1, v2);
        quizTargetAnswer = top - bot;
        document.getElementById('quiz-formula-text').innerText = `${top} - ${bot} = ?`;
    } else {
        // Multiplication! Keep values slightly smaller for fun kids multiplication
        const m1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        const m2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        quizTargetAnswer = m1 * m2;
        document.getElementById('quiz-formula-text').innerText = `${m1} × ${m2} = ?`;
    }
    
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
            
            // Check if all matched
            const matchedCount = document.querySelectorAll('#memory-grid .matched').length;
            if (matchedCount === 12) {
                setMascotSpeechBubble("owl", "Superb! Your memory is sparkling! You matched all pairs! 🦉");
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
    
    // Check if remaining blocks are zero
    const count = document.getElementById('jigsaw-blocks-row').childElementCount;
    if (count === 0) {
        setMascotSpeechBubble("fox", "Wonderful shape master! Every single puzzle piece snaps in correctly!");
        setTimeout(() => { initShapesGame(); }, 1600);
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

function initMagicCanvas() {
    sketchCanvas = document.getElementById('magic-drawing-board');
    sketchCtx = sketchCanvas.getContext('2d');
    
    resizeSketchCanvas();
    
    // Bind paints
    sketchCanvas.onmousedown = startDrawing;
    sketchCanvas.onmousemove = makeDrawing;
    sketchCanvas.onmouseup = stopDrawing;
    sketchCanvas.onmouseleave = stopDrawing;
    
    // touch
    sketchCanvas.ontouchstart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = sketchCanvas.getBoundingClientRect();
        isDrawing = true;
        sketchCtx.beginPath();
        sketchCtx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    };
    
    sketchCanvas.ontouchmove = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const touch = e.touches[0];
        const rect = sketchCanvas.getBoundingClientRect();
        sketchCtx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        sketchCtx.strokeStyle = brushColor;
        sketchCtx.lineWidth = brushSize;
        sketchCtx.lineCap = 'round';
        sketchCtx.stroke();
    };
    
    sketchCanvas.ontouchend = () => { isDrawing = false; };
}

function resizeSketchCanvas() {
    if (!sketchCanvas) return;
    const parent = sketchCanvas.parentNode;
    sketchCanvas.width = parent.clientWidth;
    sketchCanvas.height = parent.clientHeight;
    
    sketchCtx.lineCap = 'round';
    sketchCtx.lineJoin = 'round';
}

function startDrawing(e) {
    isDrawing = true;
    sketchCtx.beginPath();
    const rect = sketchCanvas.getBoundingClientRect();
    sketchCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function makeDrawing(e) {
    if (!isDrawing) return;
    const rect = sketchCanvas.getBoundingClientRect();
    sketchCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    sketchCtx.strokeStyle = brushColor;
    sketchCtx.lineWidth = brushSize;
    sketchCtx.stroke();
}

function stopDrawing() { isDrawing = false; }

function changeBrushColor(color, node) {
    brushColor = color;
    const bubbles = document.querySelectorAll('.color-bubble');
    bubbles.forEach(b => b.classList.remove('active'));
    node.classList.add('active');
    
    const dot = document.getElementById('brush-size-preview').firstElementChild;
    dot.style.background = color === '#ffffff' ? '#e5e7eb' : color;
}

function updateBrushSize(size) {
    brushSize = parseInt(size);
    const dot = document.getElementById('brush-size-preview').firstElementChild;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
}

function clearMagicCanvas() {
    sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    playPopSound();
    setMascotSpeechBubble("painter", "Magic board is perfectly clean! Start painting again! 🧼");
}

function saveDrawingImage() {
    playCorrectChime();
    const dataURL = sketchCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'KiddyQuest-Art.png';
    link.href = dataURL;
    link.click();
    awardStars(2);
    setMascotSpeechBubble("painter", "Wow! Masterpiece painting saved! You earned 2 golden stars! 🌟");
}

function loadCartoonTemplate(shape) {
    sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    const cx = sketchCanvas.width / 2;
    const cy = sketchCanvas.height / 2;
    
    sketchCtx.beginPath();
    sketchCtx.strokeStyle = '#374151';
    sketchCtx.lineWidth = 4;
    sketchCtx.setLineDash([6, 6]);
    
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
let spellingTargetWord = 'CAT';
let spellingConstructedWord = '';
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

function initSpellingGame() {
    spellingConstructedWord = '';
    const indexObj = spellingDictionary[Math.floor(Math.random() * spellingDictionary.length)];
    spellingTargetWord = indexObj.word;
    
    document.getElementById('spelling-target-emoji').innerText = indexObj.emoji;
    
    // Announce word speech synthesis
    speakSpeech(`Spell the word: ${spellingTargetWord}`);
    
    // Create empty text boxes slots
    const slotsRow = document.getElementById('spelling-word-slots');
    slotsRow.innerHTML = '';
    
    for (let i = 0; i < spellingTargetWord.length; i++) {
        const slot = document.createElement('span');
        slot.className = 'spell-slot';
        slot.id = `spell-slot-${i}`;
        slot.innerText = '_';
        slotsRow.appendChild(slot);
    }
    
    // Scramble letters
    const letters = spellingTargetWord.split('').sort(() => Math.random() - 0.5);
    const bubbleContainer = document.getElementById('spelling-letter-bubbles');
    bubbleContainer.innerHTML = '';
    
    letters.forEach(letter => {
        const bubble = document.createElement('button');
        bubble.className = 'spell-letter-bubble';
        bubble.innerText = letter;
        bubble.onclick = () => typeSpellingLetter(letter, bubble);
        bubbleContainer.appendChild(bubble);
    });
}

function typeSpellingLetter(letter, bubbleNode) {
    const expectedLetter = spellingTargetWord[spellingConstructedWord.length];
    
    if (letter === expectedLetter) {
        playPopSound();
        const slot = document.getElementById(`spell-slot-${spellingConstructedWord.length}`);
        slot.innerText = letter;
        
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
        setMascotSpeechBubble("lion", "Wonderful! Every single wild animal has returned to its happy habitat! 🏝️");
        setTimeout(() => { generateAnimalHabitatRound(); }, 1800);
    }
}

/* ============================================================
   9. GK SPACE KNOWLEDGE QUIZ
   ============================================================ */
let gkQuizActiveIndex = 0;
let gkQuizScore = 0;

const gkTriviaPool = [
    { question: 'Which planet has beautiful rings around it?', choices: ['Saturn', 'Mars', 'Mercury', 'Venus'], answer: 'Saturn' },
    { question: 'Which star gives warmth and light to Earth?', choices: ['The Sun', 'Polaris', 'Sirius', 'Vega'], answer: 'The Sun' },
    { question: 'Which organ pumps blood inside your body?', choices: ['Heart', 'Brain', 'Lungs', 'Stomach'], answer: 'Heart' },
    { question: 'How many colors make up a rainbow?', choices: ['7 colors', '5 colors', '10 colors', '3 colors'], answer: '7 colors' },
    { question: 'Which massive animal lived on Earth long ago?', choices: ['Dinosaurs', 'Lions', 'Elephants', 'Grizzlies'], answer: 'Dinosaurs' }
];

function initGKGame() {
    gkQuizActiveIndex = 0;
    gkQuizScore = 0;
    renderGKQuestion();
}

function renderGKQuestion() {
    const data = gkTriviaPool[gkQuizActiveIndex];
    
    // Update progress bar percentage
    const percent = ((gkQuizActiveIndex + 1) / gkTriviaPool.length) * 100;
    document.getElementById('gk-quiz-progress').style.width = `${percent}%`;
    
    document.getElementById('gk-question-num').innerText = gkQuizActiveIndex + 1;
    document.getElementById('gk-question-display').innerText = data.question;
    
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
    
    if (choice === correctAns) {
        playPopSound();
        playCorrectChime();
        btnNode.style.background = 'var(--green-light)';
        btnNode.style.borderColor = 'var(--green-main)';
        spawnClickConfetti(btnNode);
        
        gkQuizScore++;
        awardStars(2);
        
        setMascotSpeechBubble("monkey", `Spectacular! ${choice} is the correct answer! 🚀`);
    } else {
        playBuzzerWrong();
        btnNode.style.background = 'var(--rose-light)';
        btnNode.style.borderColor = 'var(--rose-main)';
        btnNode.classList.add('shake-bubble');
        setTimeout(() => { btnNode.classList.remove('shake-bubble'); }, 400);
        
        setMascotSpeechBubble("monkey", `Almost! The correct answer was ${correctAns}!`);
    }
    
    // Disable other buttons
    const allBtns = document.querySelectorAll('.gk-answer-btn');
    allBtns.forEach(b => b.disabled = true);
    
    setTimeout(() => {
        gkQuizActiveIndex++;
        if (gkQuizActiveIndex < gkTriviaPool.length) {
            renderGKQuestion();
        } else {
            // Completed GK quiz
            playCorrectChime();
            setMascotSpeechBubble("monkey", `Universe Tour complete! You answered ${gkQuizScore} out of ${gkTriviaPool.length} questions correctly! ⭐`);
            setTimeout(() => { initGKGame(); }, 2000);
        }
    }, 1800);
}

/* ============================================================
   10. JUNGLE ADVENTURE GRID (CARROT QUEST)
   ============================================================ */
let bunnyCoords = { x: 0, y: 0 };
let carrotCoords = { x: 4, y: 4 };
let mudTiles = []; // coordinates lists

function initAdventureGame() {
    bunnyCoords = { x: 0, y: 0 };
    carrotCoords = { x: 4, y: 4 };
    
    // Spawn 3 mud obstacles
    mudTiles = [
        { x: 1, y: 2 },
        { x: 3, y: 1 },
        { x: 2, y: 3 }
    ];
    
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
            const isBunny = bunnyCoords.x === c && bunnyCoords.y === r;
            const isCarrot = carrotCoords.x === c && carrotCoords.y === r;
            const isMud = mudTiles.some(m => m.x === c && m.y === r);
            
            if (isBunny) {
                tile.innerText = '🐇';
                tile.style.background = 'var(--pink-light)';
            } else if (isCarrot) {
                tile.innerText = '🥕';
                tile.className += ' tile-carrot';
            } else if (isMud) {
                tile.innerText = '💩';
                tile.className += ' tile-mud';
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
    
    // Collision checking
    const hitMud = mudTiles.some(m => m.x === nextX && m.y === nextY);
    if (hitMud) {
        playBuzzerWrong();
        setMascotSpeechBubble("bunny", "Oh no! Bunny slipped on mud! Returning back to starting tile!");
        bunnyCoords = { x: 0, y: 0 };
        renderAdventureGrid();
        return;
    }
    
    playFlipSound();
    bunnyCoords.x = nextX;
    bunnyCoords.y = nextY;
    renderAdventureGrid();
    
    // Win checking
    if (bunnyCoords.x === carrotCoords.x && bunnyCoords.y === carrotCoords.y) {
        playPopSound();
        playCorrectChime();
        setMascotSpeechBubble("bunny", "Delicious! Bunny found the crunchy Golden Carrot! You earned 3 stars! 🥕");
        
        const grid = document.getElementById('adventure-grid-map');
        spawnClickConfetti(grid);
        
        awardStars(3);
        setTimeout(() => { initAdventureGame(); }, 1800);
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
   PLAYFUL VOICE SYNTHESIS (Mommy Teacher Voice)
   ============================================================ */
function initSpeechVoice() {
    if (!window.speechSynthesis) return;
    
    const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // Priorities: Microsoft Aria, Google US English, Zira, Samantha, Susan, and fallback to any voice with 'female' or 'en-'
        const femaleVoiceNames = ['aria', 'google us english', 'zira', 'samantha', 'susan', 'female'];
        
        for (let name of femaleVoiceNames) {
            let found = voices.find(v => v.name.toLowerCase().includes(name) && v.lang.startsWith('en'));
            if (found) {
                synthVoice = found;
                break;
            }
        }
        
        if (!synthVoice) {
            synthVoice = voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) 
                         || voices.find(v => v.lang.startsWith('en')) 
                         || voices[0];
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
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (synthVoice) {
        utterance.voice = synthVoice;
    }
    
    // Motherly sweet voice parameters
    utterance.pitch = 1.25; 
    utterance.rate = 0.85;  
    
    window.speechSynthesis.speak(utterance);
}

function speakMascotSpeech() {
    const textNode = document.getElementById('mascot-speech-text');
    if (textNode) {
        speakSpeech(textNode.innerText);
    }
}

/* ============================================================
   100-GAME LOBBY TAB NAVIGATION & CARD INJECTION
   ============================================================ */
function switchLobbyCategory(cat, element) {
    currentLobbyCategory = cat;
    playPopSound();
    
    // Switch active tab css classes
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');
    
    // Dynamic Encouragement Category Audio Greetings
    let greeting = "";
    switch(cat) {
        case 'learning':
            greeting = "Let's explore amazing numbers, shapes, and arithmetic together, sweetheart! You are doing so well!";
            break;
        case 'english':
            greeting = "Vocabulary and grammar are so wonderful, my darling! Let's trace letters and build beautiful words!";
            break;
        case 'memory':
            greeting = "Let's test our super bright minds with memory matching, darling! Flip the cards to find twins!";
            break;
        case 'puzzle':
            greeting = "Ooh, logic and puzzle mazes! I know you are a great problem solver, sweetheart! Let's solve them!";
            break;
        case 'art':
            greeting = "It's time to show your beautiful creativity, my little artist! Let's paint and create magic!";
            break;
        case 'animal':
            greeting = "Listen to the beautiful birds and beasts, darling! Let's learn about our animal friends!";
            break;
        case 'science':
            greeting = "Zoom into the stars and space, honey! Welcome to our science lab! Let's do fun experiments!";
            break;
        case 'cooking':
            greeting = "Yum! Let's decorate yummy pizza, cake, or dress up beautiful princesses together, sweetheart!";
            break;
        case 'adventure':
            greeting = "Adventure trails! Let's guide bunny past hurdles to collect golden carrots, honey!";
            break;
        default:
            greeting = "Let's play some gorgeous games together, honey!";
    }
    
    setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", greeting);
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
    
    awardStars(3);
    
    const baseEmoji = document.getElementById('maker-base-element').innerText;
    const placedCount = document.getElementById('maker-placed-items').childElementCount;
    
    let completionSpeech = "";
    if (placedCount === 0) {
        completionSpeech = `Ooh! A simple and beautiful ${baseEmoji}! I love it so much, sweetheart! You earned 3 stars! ⭐`;
    } else {
        completionSpeech = `Wow, darling! Your decorated ${baseEmoji} looks absolutely delicious and beautiful! Mommy is so proud of you! You earned 3 stars! ⭐`;
    }
    
    setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", completionSpeech);
    
    setTimeout(() => {
        routeTo('lobby');
    }, 3500);
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
            playCorrectChime();
            spawnClickConfetti(mainActor);
            awardStars(2);
            setMascotState("🐻❤️", "Mommy Bear (Your Teacher)", `Incredible, sweetheart! You explored all operations in ${currentActiveGame.name}! Mommy is so proud of you! ⭐`);
            setTimeout(() => { routeTo('lobby'); }, 3800);
        }, 1200);
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
