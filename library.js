console.log("Data Module Evaluating...");
export const library = {
    boards: [
        {
            name: "Standard Jeopardy",
            description: "Classic trivia categories for the purists.",
            categories: [
                {
                    title: "Potent Potables",
                    clues: [
                        { value: 200, question: "This Japanese rice wine is often served warm.", answer: "What is Sake?", penalty: "1 sip" },
                        { value: 400, question: "This cocktail consists of vodka, ginger beer, and lime juice.", answer: "What is a Moscow Mule?", penalty: "2 sips" },
                        { value: 600, question: "The primary ingredient in a Screwdriver.", answer: "What is Vodka?", penalty: "3 sips" },
                        { value: 800, question: "This Scottish region is famous for its peat-smoked whiskies.", answer: "What is Islay?", penalty: "4 sips" },
                        { value: 1000, question: "A 'perfect' Manhattan uses equal parts of sweet and dry types of this wine.", answer: "What is Vermouth?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Before & After",
                    clues: [
                        { value: 200, question: "A high-ranking card in a deck joins forces with a common garden tool.", answer: "What is Ace of Spades?", penalty: "1 sip" },
                        { value: 400, question: "A breakfast pastry circle meets the capital of India.", answer: "What is New Delhi Bagel?", penalty: "2 sips" },
                        { value: 600, question: "A famous secret agent number combines with a convenience store chain.", answer: "What is 007-Eleven?", penalty: "3 sips" },
                        { value: 800, question: "A classic board game of property trading merges with a contagious disease.", answer: "What is Monopoly-nucleosis?", penalty: "4 sips" },
                        { value: 1000, question: "The King of Pop meets a delicious pepperoni pie.", answer: "What is Michael Jackson's Pizza?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "4-Letter Words",
                    clues: [
                        { value: 200, question: "Not far.", answer: "What is Near?", penalty: "1 sip" },
                        { value: 400, question: "To emit a loud, deep cry like a lion.", answer: "What is Roar?", penalty: "2 sips" },
                        { value: 600, question: "A large body of saltwater.", answer: "What is Seas (or 'Main')?", penalty: "3 sips" },
                        { value: 800, question: "To move rapidly on foot.", answer: "What is Race (or 'Dash')?", penalty: "4 sips" },
                        { value: 1000, question: "The highest point of something.", answer: "What is Apex (or 'Peak')?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Science",
                    clues: [
                        { value: 200, question: "The chemical symbol for Gold.", answer: "What is Au?", penalty: "1 sip" },
                        { value: 400, question: "The hardest natural substance on Earth.", answer: "What is Diamond?", penalty: "2 sips" },
                        { value: 600, question: "This planet is known as the Red Planet.", answer: "What is Mars?", penalty: "3 sips" },
                        { value: 800, question: "The process by which plants convert sunlight into energy.", answer: "What is Photosynthesis?", penalty: "4 sips" },
                        { value: 1000, question: "He developed the theory of relativity.", answer: "Who is Albert Einstein?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "US History",
                    clues: [
                        { value: 200, question: "The first President of the United States.", answer: "Who is George Washington?", penalty: "1 sip" },
                        { value: 400, question: "The year the Declaration of Independence was signed.", answer: "What is 1776?", penalty: "2 sips" },
                        { value: 600, question: "This war was fought between the North and South states.", answer: "What is The Civil War?", penalty: "3 sips" },
                        { value: 800, question: "He gave the 'I Have a Dream' speech.", answer: "Who is Martin Luther King Jr.?", penalty: "4 sips" },
                        { value: 1000, question: "The amendment that gave women the right to vote.", answer: "What is The 19th Amendment?", penalty: "1 shot" }
                    ]
                }
            ]
        },
        {
            name: "The History Vault",
            description: "Dive deep into the past.",
            categories: [
                {
                    title: "Wars",
                    clues: [
                        { value: 200, question: "The 'War to End All Wars'.", answer: "What is World War I?", penalty: "1 sip" },
                        { value: 400, question: "The longest war in US history (until Afghanistan).", answer: "What is The Vietnam War?", penalty: "2 sips" },
                        { value: 600, question: "The battle that ended Napoleon's rule.", answer: "What is Waterloo?", penalty: "3 sips" },
                        { value: 800, question: "The 100 Years War was fought between these two countries.", answer: "Who are England and France?", penalty: "4 sips" },
                        { value: 1000, question: "The treaty that ended the Revolutionary War.", answer: "What is The Treaty of Paris?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "America",
                    clues: [
                        { value: 200, question: "The capital of the United States.", answer: "What is Washington D.C.?", penalty: "1 sip" },
                        { value: 400, question: "The number of stars on the US flag.", answer: "What is 50?", penalty: "2 sips" },
                        { value: 600, question: "The purchase that doubled the size of the US in 1803.", answer: "What is The Louisiana Purchase?", penalty: "3 sips" },
                        { value: 800, question: "The only President to serve more than two terms.", answer: "Who is Franklin D. Roosevelt?", penalty: "4 sips" },
                        { value: 1000, question: "The site of the first English settlement in America.", answer: "What is Jamestown?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Ancient Greece",
                    clues: [
                        { value: 200, question: "The King of the Greek Gods.", answer: "Who is Zeus?", penalty: "1 sip" },
                        { value: 400, question: "This city-state was known for its military discipline.", answer: "What is Sparta?", penalty: "2 sips" },
                        { value: 600, question: "He wrote The Iliad and The Odyssey.", answer: "Who is Homer?", penalty: "3 sips" },
                        { value: 800, question: "The temple dedicated to Athena on the Acropolis.", answer: "What is The Parthenon?", penalty: "4 sips" },
                        { value: 1000, question: "The philosopher sentenced to death by hemlock.", answer: "Who is Socrates?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "The 1980s",
                    clues: [
                        { value: 200, question: "This wall came down in 1989.", answer: "What is The Berlin Wall?", penalty: "1 sip" },
                        { value: 400, question: "The US President for most of the decade.", answer: "Who is Ronald Reagan?", penalty: "2 sips" },
                        { value: 600, question: "The space shuttle that tragically exploded in 1986.", answer: "What is Challenger?", penalty: "3 sips" },
                        { value: 800, question: "This musical format overtook vinyl sales in 1988.", answer: "What are Cassette Tapes (or CDs later)?", penalty: "4 sips" },
                        { value: 1000, question: "The event held in Philadelphia and London to fight famine in Ethiopia.", answer: "What is Live Aid?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "English",
                    clues: [
                        { value: 200, question: "26 letters make up this set.", answer: "What is The Alphabet?", penalty: "1 sip" },
                        { value: 400, question: "A word that names a person, place, or thing.", answer: "What is a Noun?", penalty: "2 sips" },
                        { value: 600, question: "The past tense of 'run'.", answer: "What is Ran?", penalty: "3 sips" },
                        { value: 800, question: "A punctuation mark used to indicate a pause stronger than a comma.", answer: "What is a Semicolon?", penalty: "4 sips" },
                        { value: 1000, question: "The study of the origin of words.", answer: "What is Etymology?", penalty: "1 shot" }
                    ]
                }
            ]
        },
        {
            name: "Pop Culture Blender",
            description: "From memes to headlines.",
            categories: [
                {
                    title: "Memes",
                    clues: [
                        { value: 200, question: "This grumpy animal became an internet sensation.", answer: "Who is Grumpy Cat?", penalty: "1 sip" },
                        { value: 400, question: "This distracted boyfriend ignored his girlfriend for another woman in a stock photo.", answer: "What is The Distracted Boyfriend?", penalty: "2 sips" },
                        { value: 600, question: "'One does not simply walk into' this place.", answer: "What is Mordor?", penalty: "3 sips" },
                        { value: 800, question: "This green puppet sipping tea implies 'But that's none of my business'.", answer: "Who is Kermit the Frog?", penalty: "4 sips" },
                        { value: 1000, question: "The dress color debate: Blue and Black or White and...", answer: "What is Gold?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Reality TV",
                    clues: [
                        { value: 200, question: "This family has kept up with audiences for over a decade.", answer: "Who are The Kardashians?", penalty: "1 sip" },
                        { value: 400, question: "Contestants try to outwit, outplay, and outlast on this show.", answer: "What is Survivor?", penalty: "2 sips" },
                        { value: 600, question: "Gordon Ramsay yells at aspiring chefs in this kitchen.", answer: "What is Hell's Kitchen?", penalty: "3 sips" },
                        { value: 800, question: "This show features drag queens competing for the crown.", answer: "What is RuPaul's Drag Race?", penalty: "4 sips" },
                        { value: 1000, question: "The shore house in this MTV show was located in Seaside Heights.", answer: "What is Jersey Shore?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Viral Moments",
                    clues: [
                        { value: 200, question: "This challenge involved pouring cold water on your head.", answer: "What is The Ice Bucket Challenge?", penalty: "1 sip" },
                        { value: 400, question: "This Korean song broke YouTube view records in 2012.", answer: "What is Gangnam Style?", penalty: "2 sips" },
                        { value: 600, question: "The kid who just wanted to grow up to be a 'Berry' (Vine).", answer: "What is 'I love you b*tch, I ain't never gonna stop loving you b*tch'?", penalty: "3 sips" },
                        { value: 800, question: "This gorilla's death sparked a massive internet movement.", answer: "Who is Harambe?", penalty: "4 sips" },
                        { value: 1000, question: "The hawk tuah girl became famous for explaining an intimate act.", answer: "Who is Hailey Welch?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Current Events",
                    clues: [
                        { value: 200, question: "The platform formerly known as Twitter.", answer: "What is X?", penalty: "1 sip" },
                        { value: 400, question: "This AI chatbot started a revolution in 2022.", answer: "What is ChatGPT?", penalty: "2 sips" },
                        { value: 600, question: "This country hosted the 2024 Summer Olympics.", answer: "What is France?", penalty: "3 sips" },
                        { value: 800, question: "The movie that famously battled 'Barbie' at the box office.", answer: "What is Oppenheimer?", penalty: "4 sips" },
                        { value: 1000, question: "This crypto exchange collapsed spectacularly involving Sam Bankman-Fried.", answer: "What is FTX?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Famous People",
                    clues: [
                        { value: 200, question: "The founder of Tesla and SpaceX.", answer: "Who is Elon Musk?", penalty: "1 sip" },
                        { value: 400, question: "This singer is known for her 'Eras' tour.", answer: "Who is Taylor Swift?", penalty: "2 sips" },
                        { value: 600, question: "The actor who played Iron Man.", answer: "Who is Robert Downey Jr.?", penalty: "3 sips" },
                        { value: 800, question: "This British Prince released a memoir titled 'Spare'.", answer: "Who is Prince Harry?", penalty: "4 sips" },
                        { value: 1000, question: "He slapped Chris Rock at the Oscars.", answer: "Who is Will Smith?", penalty: "1 shot" }
                    ]
                }
            ]
        },
        {
            name: "Music Masters",
            description: "For the audiophiles.",
            categories: [
                {
                    title: "Rock n' Roll Riots",
                    clues: [
                        { value: 200, question: "This band sang 'I Wanna Be Sedated'.", answer: "Who are The Ramones?", penalty: "1 sip" },
                        { value: 400, question: "He smashed his guitar on stage, defining The Who.", answer: "Who is Pete Townshend?", penalty: "2 sips" },
                        { value: 600, question: "The lead singer of The Rolling Stones.", answer: "Who is Mick Jagger?", penalty: "3 sips" },
                        { value: 800, question: "This festival in 1999 ended in fires and riots.", answer: "What is Woodstock '99?", penalty: "4 sips" },
                        { value: 1000, question: "The band known for the song 'Smells Like Teen Spirit'.", answer: "Who are Nirvana?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Lyrics about Liquor",
                    clues: [
                        { value: 200, question: "'It's five o'clock somewhere'.", answer: "Who is Alan Jackson (and Jimmy Buffett)?", penalty: "1 sip" },
                        { value: 400, question: "'Tequila makes her clothes fall off'.", answer: "Who is Joe Nichols?", penalty: "2 sips" },
                        { value: 600, question: "'Red red wine, you make me feel so fine'.", answer: "Who are UB40 (or Neil Diamond)?", penalty: "3 sips" },
                        { value: 800, question: "'I got friends in low places, where the whiskey drowns and the beer chases'.", answer: "Who is Garth Brooks?", penalty: "4 sips" },
                        { value: 1000, question: "'One bourbon, one scotch, and one beer'.", answer: "Who is George Thorogood?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "80s One-Hit Wonders",
                    clues: [
                        { value: 200, question: "'Come on Eileen'.", answer: "Who are Dexys Midnight Runners?", penalty: "1 sip" },
                        { value: 400, question: "'Take On Me'.", answer: "Who are A-ha?", penalty: "2 sips" },
                        { value: 600, question: "'I melt with you'.", answer: "Who are Modern English?", penalty: "3 sips" },
                        { value: 800, question: "'867-5309/Jenny'.", answer: "Who are Tommy Tutone?", penalty: "4 sips" },
                        { value: 1000, question: "'Turning Japanese'.", answer: "Who are The Vapors?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Rap",
                    clues: [
                        { value: 200, question: "He is known as the 'Rap God'.", answer: "Who is Eminem?", penalty: "1 sip" },
                        { value: 400, question: "This Canadian rapper started on Degrassi.", answer: "Who is Drake?", penalty: "2 sips" },
                        { value: 600, question: "This group said 'Fight the Power'.", answer: "Who are Public Enemy?", penalty: "3 sips" },
                        { value: 800, question: "He released 'The Blueprint'.", answer: "Who is Jay-Z?", penalty: "4 sips" },
                        { value: 1000, question: "This Kendrick Lamar album won a Pulitzer Prize.", answer: "What is DAMN.?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Haus (House Music)",
                    clues: [
                        { value: 200, question: "This French duo wore robot helmets.", answer: "Who are Daft Punk?", penalty: "1 sip" },
                        { value: 400, question: "The city where House music originated.", answer: "What is Chicago?", penalty: "2 sips" },
                        { value: 600, question: "This DJ released 'Levels'.", answer: "Who is Avicii?", penalty: "3 sips" },
                        { value: 800, question: "'One More Time' is a hit by this group.", answer: "Who are Daft Punk?", penalty: "4 sips" },
                        { value: 1000, question: "The BPM range typical for House music.", answer: "What is 115-130 BPM?", penalty: "1 shot" }
                    ]
                }
            ]
        },
        {
            name: "Beers, Bars & Booze",
            description: "The original Liquid Logic set.",
            categories: [
                {
                    title: "Pub Grub",
                    clues: [
                        { value: 200, question: "This 'fishy' dish paired with chips is a staple of British pub culture.", answer: "What is Fish and Chips?", penalty: "1 sip" },
                        { value: 400, question: "Invented in Buffalo, NY, these spicy poultry pieces are a bar favorite.", answer: "What are Buffalo Wings?", penalty: "2 sips" },
                        { value: 600, question: "This purely Canadian dish features fries, cheese curds, and gravy.", answer: "What is Poutine?", penalty: "3 sips" },
                        { value: 800, question: "Typically pickled and served in massive jars on bars, these eggs are an acquired taste.", answer: "What are Pickled Eggs?", penalty: "4 sips" },
                        { value: 1000, question: "This 'Ploughman's' meal was promoted by the Milk Marketing Board in the 1950s to sell more of this dairy product.", answer: "What is Cheese?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Beer Science",
                    clues: [
                        { value: 200, question: "This four-letter ingredient provides bitterness and aroma to beer.", answer: "What are Hops?", penalty: "1 sip" },
                        { value: 400, question: "This microorganism is responsible for fermentation, converting sugar to alcohol.", answer: "What is Yeast?", penalty: "2 sips" },
                        { value: 600, question: "This scale, abbreviated IBU, measures the bitterness of beer.", answer: "What is International Bitterness Units?", penalty: "3 sips" },
                        { value: 800, question: "Ales are top-fermented, while lagers are fermented at this relative position.", answer: "What is Bottom-fermented?", penalty: "4 sips" },
                        { value: 1000, question: "The Reinheitsgebot is a purity law from this country.", answer: "What is Germany?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Alcohol Trivia",
                    clues: [
                        { value: 200, question: "Tequila must be made from this plant.", answer: "What is Blue Agave?", penalty: "1 sip" },
                        { value: 400, question: "This clear spirit is flavored with juniper berries.", answer: "What is Gin?", penalty: "2 sips" },
                        { value: 600, question: "Which country drinks the most wine per capita?", answer: "What is The Vatican City?", penalty: "3 sips" },
                        { value: 800, question: "Mead is an alcoholic beverage made by fermenting this sweet substance.", answer: "What is Honey?", penalty: "4 sips" },
                        { value: 1000, question: "What does the 'VSOP' stand for on a Cognac bottle?", answer: "What is Very Superior Old Pale?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Famous Bars",
                    clues: [
                        { value: 200, question: "The bar where everybody knows your name.", answer: "What is Cheers?", penalty: "1 sip" },
                        { value: 400, question: "Quant's favorite cantina in Star Wars.", answer: "What is Mos Eisley Cantina?", penalty: "2 sips" },
                        { value: 600, question: "The pub in Shaun of the Dead to wait for this all to blow over.", answer: "What is The Winchester?", penalty: "3 sips" },
                        { value: 800, question: "The iconic Irish pub in 'It's Always Sunny in Philadelphia'.", answer: "What is Paddy's Pub?", penalty: "4 sips" },
                        { value: 1000, question: "The bar in the Shining.", answer: "What is The Gold Room?", penalty: "1 shot" }
                    ]
                },
                {
                    title: "Barroom Physics",
                    clues: [
                        { value: 200, question: "The force that keeps foam at the top of a beer.", answer: "What is Buoyancy?", penalty: "1 sip" },
                        { value: 400, question: "Why a Guinness bubble sinks (circulation patterns).", answer: "What is Drag?", penalty: "2 sips" },
                        { value: 600, question: "The effect that causes wine legs (tears).", answer: "What is The Marangoni Effect?", penalty: "3 sips" },
                        { value: 800, question: "Condensation forms on the outside of a cold glass because of this property of air.", answer: "What is Dew Point?", penalty: "4 sips" },
                        { value: 1000, question: "The density of alcohol relative to water (less or more).", answer: "What is Less?", penalty: "1 shot" }
                    ]
                }
            ]
        }
    ]
};
