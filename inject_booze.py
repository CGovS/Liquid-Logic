import json

new_cats = {
"Potent Potables": [
  {"question": "This clear spirit is the main ingredient in a classic Margarita.", "answer": "What is Tequila?", "difficulty": 1},
  {"question": "This dark liquor is made from fermented sugarcane juice or molasses.", "answer": "What is Rum?", "difficulty": 2},
  {"question": "This botanical-flavored spirit gets its predominant flavor from juniper berries.", "answer": "What is Gin?", "difficulty": 3},
  {"question": "This French liqueur is made with elderflowers and has a distinctively shaped bottle.", "answer": "What is St-Germain?", "difficulty": 4},
  {"question": "This Italian amaro has an artichoke base and literally translates to 'little artichoke'.", "answer": "What is Cynar?", "difficulty": 5},
  {"question": "This spirit is named after a county in Kentucky and must be made of at least 51% corn.", "answer": "What is Bourbon?", "difficulty": 1},
  {"question": "This green, anise-flavored spirit was famously banned in the US until 2007.", "answer": "What is Absinthe?", "difficulty": 2},
  {"question": "This Scottish whisky region is known for producing heavily peated, smoky single malts.", "answer": "What is Islay?", "difficulty": 3},
  {"question": "This popular bitter liqueur is an essential ingredient in a Negroni and a Boulevardier.", "answer": "What is Campari?", "difficulty": 4},
  {"question": "This traditional Scandinavian distilled spirit is flavored with caraway or dill.", "answer": "What is Aquavit?", "difficulty": 5},
  {"question": "This sweet, almond-flavored Italian liqueur is famously made from apricot kernels.", "answer": "What is Amaretto?", "difficulty": 1},
  {"question": "This Russian word for 'water' is the namesake of a globally popular clear alcohol.", "answer": "What is Vodka?", "difficulty": 2},
  {"question": "This specific type of brandy must be produced in the Charente-Maritime region of France.", "answer": "What is Cognac?", "difficulty": 3},
  {"question": "This Mexican spirit is similar to tequila but can be made from over 30 types of agave and has a smoky flavor.", "answer": "What is Mezcal?", "difficulty": 4},
  {"question": "This clear, high-proof spirit from the Balkans is traditionally made by distilling fermented fruit, often plums.", "answer": "What is Rakia (Rakija)?", "difficulty": 5},
  {"question": "This popular cocktail mixes rum, mint, lime juice, sugar, and club soda.", "answer": "What is a Mojito?", "difficulty": 1},
  {"question": "This orange-flavored liqueur is a vital component in Cosmopolitans and Sidecars.", "answer": "What is Cointreau (or Triple Sec)?", "difficulty": 2},
  {"question": "This dark brown, coffee-flavored liqueur is produced in Veracruz, Mexico.", "answer": "What is Kahlúa?", "difficulty": 3},
  {"question": "This clear spirit from Brazil is the key ingredient in a Caipirinha.", "answer": "What is Cachaça?", "difficulty": 4},
  {"question": "This historic liqueur, created by Carthusian Monks in the French Alps, is colored naturally green by its 130 herbal extracts.", "answer": "What is Chartreuse?", "difficulty": 5}
],
"Pub Grub": [
  {"question": "These deep-fried potatoes are a global pub staple, often served with ketchup or mayonnaise.", "answer": "What are French Fries (or Chips)?", "difficulty": 1},
  {"question": "This snack consists of tortilla chips covered with melted cheese and often jalapeños.", "answer": "What are Nachos?", "difficulty": 2},
  {"question": "This classic British dish features battered white fish served with fried potatoes.", "answer": "What is Fish and Chips?", "difficulty": 3},
  {"question": "This Canadian specialty features fries topped with cheese curds and brown gravy.", "answer": "What is Poutine?", "difficulty": 4},
  {"question": "This traditional Scottish dish is a savory pudding containing sheep's pluck (heart, liver, lungs) minced with onion and oatmeal.", "answer": "What is Haggis?", "difficulty": 5},
  {"question": "These bone-in chicken pieces are typically deep-fried and coated in a spicy vinegar-based cayenne pepper sauce.", "answer": "What are Buffalo Wings?", "difficulty": 1},
  {"question": "This circular dough item is boiled, baked, and often served warm with mustard or cheese dip in pubs.", "answer": "What is a Soft Pretzel?", "difficulty": 2},
  {"question": "These cheese-filled sticks are breaded, deep-fried, and typically served with marinara sauce.", "answer": "What are Mozzarella Sticks?", "difficulty": 3},
  {"question": "This pub favorite wraps a sausage in bacon and is particularly popular in the UK at Christmas.", "answer": "What are Pigs in Blankets?", "difficulty": 4},
  {"question": "This British pub snack consists of a hard-boiled egg wrapped in sausage meat, coated in breadcrumbs, and deep-fried.", "answer": "What is a Scotch Egg?", "difficulty": 5},
  {"question": "This popular pub sandwich features a ground beef patty served between two halves of a bun.", "answer": "What is a Hamburger?", "difficulty": 1},
  {"question": "This battered and deep-fried ring of a certain pungent vegetable is a common pub side dish.", "answer": "What is an Onion Ring?", "difficulty": 2},
  {"question": "This dish of loaded fries topped with chili con carne and cheese is named after a state down south.", "answer": "What are Chili Cheese Fries?", "difficulty": 3},
  {"question": "This English pub meal features sausages served over a bed of mashed potatoes, typically with onion gravy.", "answer": "What is Bangers and Mash?", "difficulty": 4},
  {"question": "This savory pie, a staple of English pubs, is filled with diced beef and gravy made from a dark stout.", "answer": "What is Steak and Ale Pie?", "difficulty": 5},
  {"question": "These small, bite-sized pieces of chicken breast are breaded, fried, and served with dipping sauces.", "answer": "What are Chicken Nuggets / Bites?", "difficulty": 1},
  {"question": "These spicy, hollowed-out chili peppers are stuffed with cheese, breaded, and deep-fried.", "answer": "What are Jalapeño Poppers?", "difficulty": 2},
  {"question": "This loaded potato dish features hollowed-out spud halves baked with cheese and bacon bits.", "answer": "What are Potato Skins?", "difficulty": 3},
  {"question": "This traditional Irish dish consisting of mashed potatoes mixed with cabbage or kale is heavily served in pubs on St. Patrick's Day.", "answer": "What is Colcannon?", "difficulty": 4},
  {"question": "This 'ploughman's lunch' staple is a sour, fermented vegetable relish typically eaten with cheddar cheese in British pubs.", "answer": "What is Branston Pickle?", "difficulty": 5}
],
"Beer Science": [
  {"question": "This single-celled fungus is the living organism responsible for converting sugars into alcohol during fermentation.", "answer": "What is Yeast?", "difficulty": 1},
  {"question": "These green, cone-shaped flowers are added to beer to provide bitterness, flavor, and aroma.", "answer": "What are Hops?", "difficulty": 2},
  {"question": "This process involves germinating cereal grains, then drying them with hot air to develop the enzymes required for brewing.", "answer": "What is Malting?", "difficulty": 3},
  {"question": "This metric scale, running roughly from 0 to 100+, measures the bitterness of a beer.", "answer": "What are IBUs (International Bitterness Units)?", "difficulty": 4},
  {"question": "This term refers to the sugar-rich liquid extracted from the mashing process before it is fermented into beer.", "answer": "What is Wort?", "difficulty": 5},
  {"question": "This abbreviation appearing on beer labels stands for 'Alcohol by Volume'.", "answer": "What is ABV?", "difficulty": 1},
  {"question": "This type of beer is fermented with top-fermenting yeast at warmer temperatures.", "answer": "What is an Ale?", "difficulty": 2},
  {"question": "This type of beer is fermented with bottom-fermenting yeast at colder temperatures.", "answer": "What is a Lager?", "difficulty": 3},
  {"question": "This chemical compound (C2H5OH) is the active recreational drug produced during fermentation.", "answer": "What is Ethanol (Ethyl Alcohol)?", "difficulty": 4},
  {"question": "This term describes the process of adding dry hops to the fermenter or keg to increase aroma without increasing bitterness.", "answer": "What is Dry Hopping?", "difficulty": 5},
  {"question": "This gas, a natural byproduct of fermentation, gives beer its carbonation and bubbly head.", "answer": "What is Carbon Dioxide (CO2)?", "difficulty": 1},
  {"question": "This dark style of beer, famous worldwide thanks to Guinness, gets its color from highly roasted malt or roasted barley.", "answer": "What is a Stout?", "difficulty": 2},
  {"question": "This phase of brewing involves boiling the wort and adding hops.", "answer": "What is the Boil?", "difficulty": 3},
  {"question": "This scale, measuring the density of the wort compared to water, is used by brewers to determine potential alcohol content.", "answer": "What is Specific Gravity?", "difficulty": 4},
  {"question": "This off-flavor in beer, often described as tasting like butter or butterscotch, is caused by a chemical compound that yeast usually cleans up.", "answer": "What is Diacetyl?", "difficulty": 5},
  {"question": "This ingredient makes up roughly 90 to 95 percent of beer by weight.", "answer": "What is Water?", "difficulty": 1},
  {"question": "This cloudy style of wheat beer from Belgium is traditionally spiced with coriander and orange peel.", "answer": "What is a Witbier?", "difficulty": 2},
  {"question": "This process of forcing carbon dioxide into beer inside a sealed keg is called 'forced' what?", "answer": "What is Carbonation?", "difficulty": 3},
  {"question": "This specific brewing vessel is where the grains are mixed with hot water to extract fermentable sugars.", "answer": "What is the Mash Tun?", "difficulty": 4},
  {"question": "This specific wild yeast, often responsible for the funky, 'horse blanket' flavors in Belgian Lambics, is named after a British genus.", "answer": "What is Brettanomyces?", "difficulty": 5}
],
"Alcohol Trivia": [
  {"question": "This constitutional amendment instituted the national Prohibition of alcohol in the United States in 1920.", "answer": "What is the 18th Amendment?", "difficulty": 1},
  {"question": "This is the legal drinking age in the United States.", "answer": "What is 21?", "difficulty": 2},
  {"question": "This country is famous for its Oktoberfest, the world's largest beer festival.", "answer": "What is Germany?", "difficulty": 3},
  {"question": "This cocktail, made with vodka, spicy tomato juice, and celery, is famously consumed as a hangover cure.", "answer": "What is a Bloody Mary?", "difficulty": 4},
  {"question": "This specific type of Japanese rice wine is brewed using a process closer to beer than wine.", "answer": "What is Sake?", "difficulty": 5},
  {"question": "This carbonated alcoholic beverage is synonymous with celebrations and NYE toasts.", "answer": "What is Champagne?", "difficulty": 1},
  {"question": "This term refers to a person who makes, repairs, or repairs wooden casks, kegs, and barrels used for aging liquor.", "answer": "What is a Cooper?", "difficulty": 2},
  {"question": "This classic cocktail, famously ordered 'shaken, not stirred' by James Bond, is traditionally made with gin and vermouth.", "answer": "What is a Martini?", "difficulty": 3},
  {"question": "This term refers to the portion of alcohol that evaporates from a barrel during the aging process.", "answer": "What is the Angel's Share?", "difficulty": 4},
  {"question": "This Greek anise-flavored aperitif famously turns cloudy white when water is added to it.", "answer": "What is Ouzo?", "difficulty": 5},
  {"question": "This type of bar served alcoholic beverages illegally during US Prohibition.", "answer": "What is a Speakeasy?", "difficulty": 1},
  {"question": "This unit of measure for the alcohol content of spirits is exactly twice the percentage of alcohol by volume (ABV).", "answer": "What is Proof?", "difficulty": 2},
  {"question": "This classic rum cocktail takes its name from a beach near Santiago de Cuba, heavily associated with the Bacardi family.", "answer": "What is a Daiquiri?", "difficulty": 3},
  {"question": "This cocktail consisting of bourbon, sugar, water, and crushed mint is the traditional drink of the Kentucky Derby.", "answer": "What is a Mint Julep?", "difficulty": 4},
  {"question": "This toxic, cheapest form of alcohol produced during distillation can cause blindness if consumed and is usually discarded as the 'heads'.", "answer": "What is Methanol?", "difficulty": 5},
  {"question": "This fruit is squeezed into a classic Corona beer.", "answer": "What is a Lime?", "difficulty": 1},
  {"question": "This blue-tinted cocktail is famously tropical, mixing rum, coconut cream, and pineapple juice.", "answer": "What is a Piña Colada?", "difficulty": 2},
  {"question": "This drink mixes equal parts Guinness stout and Bass ale (or another pale ale).", "answer": "What is a Black and Tan?", "difficulty": 3},
  {"question": "This classic cocktail mixes gin, lemon juice, sugar, and club soda.", "answer": "What is a Tom Collins?", "difficulty": 4},
  {"question": "This traditional Peruvian and Chilean brandy is the base spirit for a famous frothy, egg-white topped sour cocktail.", "answer": "What is Pisco?", "difficulty": 5}
],
"Famous Bars": [
  {"question": "This fictional Boston bar was the primary setting of a hit 1980s sitcom 'where everybody knows your name'.", "answer": "What is Cheers?", "difficulty": 1},
  {"question": "This legendary New York City venue, founded by Hilly Kristal, was the undeniable birthplace of American punk rock.", "answer": "What is CBGB?", "difficulty": 2},
  {"question": "This hotel bar in Singapore is the actual birthplace of the famous 'Singapore Sling' cocktail.", "answer": "What is the Long Bar (at the Raffles Hotel)?", "difficulty": 3},
  {"question": "This historic bar in Havana, Cuba, was famously frequented by Ernest Hemingway, who helped popularize its Daiquiris.", "answer": "What is El Floridita?", "difficulty": 4},
  {"question": "This historic Venice bar, opened in 1931, is the birthplace of the Bellini cocktail and the beef Carpaccio.", "answer": "What is Harry's Bar?", "difficulty": 5},
  {"question": "This fictional tavern is Homer Simpson's favorite drinking spot in Springfield.", "answer": "What is Moe's Tavern?", "difficulty": 1},
  {"question": "This famous strip of bars and music venues is located on Broadway in downtown Nashville.", "answer": "What is Honky Tonk Highway?", "difficulty": 2},
  {"question": "This Saloon on East 55th Street in NYC is one of the oldest in the city, famous for its sawdust floors and two ancient urinals.", "answer": "What is McSorley's Old Ale House?", "difficulty": 3},
  {"question": "This New Orleans establishment in the French Quarter claims to be the oldest continuously operating bar in the US, known for 'Purple Drank'.", "answer": "What is Lafitte's Blacksmith Shop?", "difficulty": 4},
  {"question": "This 'American Bar' in London, famous for its classic cocktail book written by Harry Craddock, is located inside which luxury hotel?", "answer": "What is The Savoy?", "difficulty": 5},
  {"question": "This fictional pub serves butterbeer and is owned by Madam Rosmerta in the Harry Potter series.", "answer": "What is The Three Broomsticks?", "difficulty": 1},
  {"question": "This real-life bar in Philadelphia serves as the central setting for the sitcom 'It's Always Sunny in Philadelphia'.", "answer": "What is Paddy's Pub?", "difficulty": 2},
  {"question": "This famous Key West bar was a favorite hangout for Ernest Hemingway and holds an annual look-alike contest in his honor.", "answer": "What is Sloppy Joe's?", "difficulty": 3},
  {"question": "This Paris bar, famous for patrons like F. Scott Fitzgerald, claims to have invented the Bloody Mary.", "answer": "What is Harry's New York Bar?", "difficulty": 4},
  {"question": "This historic tavern in Manhattan was George Washington's headquarters during the Revolutionary War.", "answer": "What is Fraunces Tavern?", "difficulty": 5},
  {"question": "This bar in the Star Wars universe is located in Mos Eisley and features a very catchy cantina band.", "answer": "What is Chalmun's Cantina?", "difficulty": 1},
  {"question": "This legendary Los Angeles rock club on the Sunset Strip launched bands like The Doors and Guns N' Roses.", "answer": "What is the Whisky a Go Go?", "difficulty": 2},
  {"question": "This historic New York bar located in the Algonquin Hotel was the meeting place of a famous literary 'Round Table' in the 1920s.", "answer": "What is the Blue Bar?", "difficulty": 3},
  {"question": "This iconic pub in Oxford, England, was the regular meeting place of the 'Inklings', including J.R.R. Tolkien and C.S. Lewis.", "answer": "What is The Eagle and Child?", "difficulty": 4},
  {"question": "This Dublin pub, established in 1198, officially holds the title of Ireland's oldest pub.", "answer": "What is The Brazen Head?", "difficulty": 5}
]
}

import re, json

with open("/Users/carter/.gemini/antigravity/scratch/Liquid Logic/v3.6/trivia_db.js", "r") as f:
    js_content = f.read()

# We need to find the `pool: {` and inject the categories at the end of it
last_brace = js_content.rfind('}')
second_to_last = js_content.rfind('}', 0, last_brace - 1)

injection = ""
for category, questions in new_cats.items():
    qs_str = ",\n            ".join([json.dumps(q) for q in questions])
    injection += f',\n        "{category}": [\n            {qs_str}\n        ]'

new_content = js_content[:second_to_last] + injection + '\n    ' + js_content[second_to_last:]

with open("/Users/carter/.gemini/antigravity/scratch/Liquid Logic/v3.6/trivia_db.js", "w") as f:
    f.write(new_content)

print(f"Successfully injected {sum(len(q) for q in new_cats.values())} questions for Booze!")
