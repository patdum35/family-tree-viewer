/**
 * Traductions des métiers et occupations pour l'application généalogique
 * Prend en charge le français (fr), l'anglais (en), l'espagnol (es) et le hongrois (hu)
 */

// Tableau original des occupations en français
export const frenchOccupations = ["laboureur", "cultivateur", "cultivatrice", "ecuyer", "ménagère", "chevalier", "journalier", "meunier", "notaire", "ingénieur", "tisserand", "baron de fougères", 
    "toilier", "marchand", "écuyer", "assistante maternelle", "maçon", "cordonnier", "seigneur de la bouteillerie", "baron de pontchâteau", "fileuse", "charron", "seigneur de l'hostellerie",
     "maire du palais d'austrasie", "menuisier", "domestique", "couturier", "meunière", "charpentier", "seigneur de matignon", "maréchal", "comte du maine", "roi des francs", 
     "seigneur de beaucorps", "seigneur du plessix", "modiste", "filandière", "propriétaire", "fendeur", "seigneur de lorgeril", "couturière", "artisan peintre", "marin", "instituteur", 
     "manouvrier", "employé de banque", "professeur", "baby", "marchand de bois", "marinier", "couvreur", "seigneur de la roche goyon", "vicomtesse de porhoët", "noble dame", 
     "comte de poher", "seigneur", "roi des bretons d'armorique", "roi de bretagne", "duc de bretagne", "roi de silurie", "noble de la lignée de david", 
     "sieur de saint-vreguet en saint-alban", "honorable homme", "seigneur de mayenne", "comte de vermandois", "princesse de france", "croisé", "seigneur de machecoul", 
     "comte de paris", "comte d'auxerre", "seigneur d'acigné", "seigneur d'enghien", "femme de ménage", "cadre infirmier", "dessinateur industriel", "puéricultrice", 
     "serrurier", "aubergiste", "procureur fiscal", "cloutier", "seigneur du bois de bintin", "sieur du boudou", "seigneur de jugon", "agriculteur", "seigneur du coudray",
      "sieur du bourgneuf", "facteur", "menuisier charpentier", "aide soignante", "entrepreneur de maçonnerie", "curé", "caissier", "seigneur de vaucottes", "boucher", 
      "responsable environnement de travail", "commerçant", "employée de banque", "carrossier", "institutrice", "agent logistique renault", "cadre pétrochimie", "comptable", 
      "imprimeur", "courtier en cidre", "marchand boucher", "berger", "garde moulin", "journalière", "tisserande", "couvreur en chaume", "tonnelier", "manoeuvrier", "ferrailleur", 
      "chartier", "femme de chambre", "cafetière", "servante", "sieur de pélien", "seigneur de goucon", "seigneur de la boutardaye", "seigneur de lanquenan", "seigneur de languenan",
       "seigneur de lanquénan pagalet", "seigneur de gayola", "seigneur de plévenon", "seigneur de la gouesnière", "seigneur de lanquenau", "chambellan de bretagne", 
       "employée assurance", "ouvrier aeronautique", "marechal-ferrant", "militaire", "sieur de fournel", "seigneur de la bouetardaye", "demoiselle de carmoran", 
       "dame de bretagne poher et domnonée", "abbesse", "comte de cornouaille", "princesse de cornouaille", "régent de bretagne", "reine prizel", "duc de domnonée", 
       "prince de cornouailless", "reine de bretagne armoricaine", "duc de cornouaille", "prince d'albanie", "roi des silures", "roi celtes de silures", "roi de galles", 
       "roi de domennée", "reine de brigantes", "reine de bretagne", "roi de britain", "roi d'ewyas", "roi de cambrie", "roi du pays de galles", "prince de léon", "législateur", 
       "membre du sanhédrin", "armateur", "prétendant au trone de judée", "dame de la grignardays", "seigneur de la ville roger", "sieur de la hautière", "dame de saint-vreguet", 
       "dame de la ville-roger", "sieur de la ville-hervé", "sieur de planguénoual", "demoiselle", "dame de saint-vreguet en saint-alban", 
       "ambassadeur du duc de bretagne à la cour de rome", "procureur-général au parlement de bretagne", "président et juge universel de bretagne", "sénéchal de la baillie", 
       "sénéchal de ploermel", "sénéchal de rennes", "capitaine de valenciennes", "jardinier", "charbonnier", "descendant de louis vi", "tailleur d'habits", "armurier", 
       "demoiselle de la ville battais", "sieur de la goupillière", "demoiselle de la goupillière badeau", "noble dame de la rogerais", "chambellan du duc françois", 
       "gouverneur de saint malo", "bailly du cotentin", "comte de fougères", "comte de laon", "comte de soisson", "seigneur du mans", "abesse de chelles", "abbesse de faremoutiers", 
       "maire du palais de neustrasie", "maire du palais de bourgogne", "duc des austrasiens", "maire de neustrie", "maire de bourgogne", "evêque de metz", 
       "conseiller de dagobert ier", "patricien ambassadeur", "maire du palais", "prétendant au trône austrasien", "sieur de beaucorps", 
       "capitaine et commandant du château de la roche goyon", "seigneur du vaurouault", "dame de beaucorps", "seigneur de molière", "seigneur de la roche-goyon", "maître", 
       "sieur de la ville bellanger écuyer", "demoiselle d'estandes", "chevalier croisé", "dame de rieux", "seigneur de rieux", "seigneur de saint-philbert-de-grand-lieu", 
       "seigneur de bourgneuf-en-retz", "seigneur de montaigu", "seigneur de la garnache", "seigneur de la bénate", "seigneur du coutumier", "baillistre de bretagne", 
       "duc consort de bretagne", "comte de dreux", "comte de braine", "comte de penthièvre", "comte de tréguier", "comte de richmond", "ducs des francs", "abbé laïc de paris",
        "duc des francs", "duc de bourgogne", "duc d'aquitaine", "roi de france", "comte d'anjou", "comte de nevers", "seigneur de la ville-tréhen", "dame de la ville-trehen", 
        "seigneur du plessix-brouelleux", "dame du plessix-brouelleux", "seigneur de la hauguemarays", "dame de calan", "seigneur du dieudit", "seigneur du chalonge-en-trébédan",
         "seigneur de vaumenoisel", "dame de la roche", "dame de la touche à vache", "dame de la guibonnaye", "dame de montigny", "dame de la tandourie", 
         "seigneur de la-touche-à-la-vache", "seigneur de coëtlogon", "sieur de montauban", "seigneur de la lande", "dame de lanvaux", "dame de la lande", 
         "maître d'hôtel du duc de bretagne", "chambellan du duc de bretagne", "gentilhomme ordinaire de la chambre du roi", "lieutenant-général du roi en bretagne", 
         "capitaine de cinquante hommes d'armes des ordo", "seigneur de ramerupt", "seigneur de lembech", "comte de brienne", "connétable de france", "countess consort of brienne",
          "giovanna of sanseverino", "countess consort of enghein", "seigneur de launay", "seigneur de la boutardais", "seigneur de carmorand", "panetier du roi",
           "colonel des suisses en piémont", "conseiller du roi", "gouverneur de guyenne", "capitaine de cherbourg", "capitaine de granville", "maréchal de camp du roi", 
           "remetteur", "ossier", "ingénieur logistique", "employé ambassade", "poseur storiste", "infirmière", "agent immobilier", "responsable des services généraux", 
           "ouvrier agro-alimentaire", "employée importexport", "bouchère", "fermier", "commerçante", "fabricant de chaux", "chauffournier", "procureur", "ferblantier", 
           "lingère", "gendarme", "métayer", "commis aux forges", "rentière", "receveur des domaines", "greffier", "maréchal-ferrant", "garde forêt", "garde", "marchand de toiles",
            "marchand de grains", "cabaretier", "sénéchal", "dame du breil", "seigneur de jarzé", "présidents des états de bretagne", "sieur des ruisseaux", "greffier de hédé", 
            "dame de repentigné", "seigneur du boudou", "sieur de repentigné", "sieur de lorgeril", "sieur du bodou", "seigneur de lorgeri", "sire de coëtquen", 
            "compagnon d'armes de bertrand duguesclin", "seigneur de pontchâteau", "chevalier banneret", "baronne de pontchâteau", "psycholoque", "maître monnayeur", 
            "sieur du coudray", "vicomte de dinan nord", "seigneur baron de dinan", "baron de dinan", "seigneur de dinan", "seigneur de pestel", "vicomte de thouars",
             "responsable services municipaux", "fonctionnaire", "maitre des écoles", "directrice d'école", "animatrice", "prêtre", "conseiller principal d'éducation", 
             "développeur", "responsable traitement des eaux", "photographe", "vidéaste", "tanneur", "laboureuse", "marchand tanneur", "avocat", "procureur d'office", 
             "filandier", "sieur de coudray", "vicomte du beso", "seigneur de la claye", "vicomte du besso saint-andre-des-eaux -", 
             "vicomte de besso fut chambellan du duc de bretagne et capitaine de vannes", "maréchal de bretagne", "de beaumanoir", 
             "baron présent aux etats de bretagne en près de pierre mauclerc à la création de st aubin du cormier en ", "baron", "chevalier-banneret avant ", 
             "présent avec chevaliers bannerets bretons à la bataille de bouvines assemblé à vannes il fait parti des principaux seigneurs afin de venger l'assassinat du duc arthur i",
              "chevalier croisé ème croisade - ", "transporteur", "sieur du closel", "héritière de duault", "st glen", "et de la motte frion", "laboureur demeurant au tail theil ", 
              "honorable femme", "homme honorable", "femme honorable", "télégraphiste", "commis ambulant des postes", "cultivatrice à la grand-touche", 
              "représentant de commerce"];

// Dictionnaire de traduction pour les métiers/occupations communs
const occupationTranslations = {
  // Métiers et occupations communes
  "responsable des services généraux": {
    en: "head of general services",
    es: "responsable de servicios generales",
    hu: "általános szolgáltatások vezetője"
  },
  "responsable environnement de travail": {
    en: "work environment manager",
    es: "responsable del medio ambiente laboral",
    hu: "munkahelyi környezetért felelős"
  },
  "agent logistique renault": {
    en: "Renault logistics agent",
    es: "agente logístico de Renault",
    hu: "Renault logisztikai ügynök"
  },
  "cadre pétrochimie": {
    en: "petrochemical manager",
    es: "gerente petroquímico",
    hu: "petrokémiai vezető"
  },
  "laboureur": {
    en: "farmer",
    es: "labrador",
    hu: "földműves"
  },
  "cultivateur": {
    en: "farmer",
    es: "agricultor",
    hu: "földművelő"
  },
  "cultivatrice": {
    en: "farmer",
    es: "agricultora",
    hu: "földművelőnő"
  },
  "ecuyer": {
    en: "squire",
    es: "escudero",
    hu: "fegyverhordozó"
  },
  "écuyer": {
    en: "squire",
    es: "escudero",
    hu: "fegyverhordozó"
  },
  "ménagère": {
    en: "housewife",
    es: "ama de casa",
    hu: "háziasszony"
  },
  "chevalier": {
    en: "knight",
    es: "caballero",
    hu: "lovag"
  },
  "journalier": {
    en: "day laborer",
    es: "jornalero",
    hu: "napszámos"
  },
  "journalière": {
    en: "day laborer",
    es: "jornalera",
    hu: "napszámosnő"
  },
  "meunier": {
    en: "miller",
    es: "molinero",
    hu: "molnár"
  },
  "meunière": {
    en: "miller",
    es: "molinera",
    hu: "molnárnő"
  },
  "notaire": {
    en: "notary",
    es: "notario",
    hu: "közjegyző"
  },
  "ingénieur": {
    en: "engineer",
    es: "ingeniero",
    hu: "mérnök"
  },
  "tisserand": {
    en: "weaver",
    es: "tejedor",
    hu: "takács"
  },
  "tisserande": {
    en: "weaver",
    es: "tejedora",
    hu: "takácsnő"
  },
  "marchand": {
    en: "merchant",
    es: "comerciante",
    hu: "kereskedő"
  },
  "assistante maternelle": {
    en: "childminder",
    es: "asistente maternal",
    hu: "gyermekgondozó"
  },
  "maçon": {
    en: "mason",
    es: "albañil",
    hu: "kőműves"
  },
  "cordonnier": {
    en: "shoemaker",
    es: "zapatero",
    hu: "cipész"
  },
  "fileuse": {
    en: "spinner",
    es: "hilandera",
    hu: "fonónő"
  },
  "charron": {
    en: "wheelwright",
    es: "carretero",
    hu: "kerékgyártó"
  },
  "menuisier": {
    en: "carpenter",
    es: "carpintero",
    hu: "asztalos"
  },
  "domestique": {
    en: "servant",
    es: "sirviente",
    hu: "háztartási alkalmazott"
  },
  "couturier": {
    en: "tailor",
    es: "sastre",
    hu: "szabó"
  },
  "couturière": {
    en: "seamstress",
    es: "costurera",
    hu: "varrónő"
  },
  "charpentier": {
    en: "carpenter",
    es: "carpintero",
    hu: "ács"
  },
  "maréchal": {
    en: "marshal",
    es: "mariscal",
    hu: "marsall"
  },
  "modiste": {
    en: "milliner",
    es: "modista",
    hu: "kalapos"
  },
  "filandière": {
    en: "spinner",
    es: "hilandera",
    hu: "fonónő"
  },
  "filandier": {
    en: "spinner (male)",
    es: "hilandero",
    hu: "fonó"
  },
  "propriétaire": {
    en: "owner",
    es: "propietario",
    hu: "tulajdonos"
  },
  "fendeur": {
    en: "splitter",
    es: "hendedor",
    hu: "hasítómunkás"
  },
  "artisan peintre": {
    en: "painter",
    es: "pintor artesano",
    hu: "festőművész"
  },
  "marin": {
    en: "sailor",
    es: "marinero",
    hu: "tengerész"
  },
  "instituteur": {
    en: "teacher",
    es: "maestro",
    hu: "tanító"
  },
  "institutrice": {
    en: "teacher",
    es: "maestra",
    hu: "tanítónő"
  },
  "manouvrier": {
    en: "laborer",
    es: "peón",
    hu: "napszámos"
  },
  "manoeuvrier": {
    en: "laborer",
    es: "peón",
    hu: "napszámos"
  },
  "employé de banque": {
    en: "bank clerk",
    es: "empleado de banco",
    hu: "banki alkalmazott"
  },
  "employée de banque": {
    en: "bank clerk",
    es: "empleada de banco",
    hu: "banki alkalmazott (nő)"
  },
  "professeur": {
    en: "professor",
    es: "profesor",
    hu: "professzor"
  },
  "marchand de bois": {
    en: "timber merchant",
    es: "comerciante de madera",
    hu: "fakereskedő"
  },
  "marinier": {
    en: "boatman",
    es: "marinero",
    hu: "hajós"
  },
  "couvreur": {
    en: "roofer",
    es: "techador",
    hu: "tetőfedő"
  },
  "couvreur en chaume": {
    en: "thatcher",
    es: "techador de paja",
    hu: "zsúpfedő"
  },
  "femme de ménage": {
    en: "housekeeper",
    es: "empleada doméstica",
    hu: "takarítónő"
  },
  "cadre infirmier": {
    en: "nursing manager",
    es: "supervisor de enfermería",
    hu: "ápolási vezető"
  },
  "dessinateur industriel": {
    en: "industrial designer",
    es: "diseñador industrial",
    hu: "ipari rajzoló"
  },
  "puéricultrice": {
    en: "childcare nurse",
    es: "puericultora",
    hu: "csecsemőgondozó"
  },
  "serrurier": {
    en: "locksmith",
    es: "cerrajero",
    hu: "lakatos"
  },
  "aubergiste": {
    en: "innkeeper",
    es: "posadero",
    hu: "fogadós"
  },
  "procureur fiscal": {
    en: "fiscal prosecutor",
    es: "procurador fiscal",
    hu: "pénzügyi ügyész"
  },
  "cloutier": {
    en: "nailer",
    es: "clavero",
    hu: "szögkovács"
  },
  "agriculteur": {
    en: "farmer",
    es: "agricultor",
    hu: "földműves"
  },
  "facteur": {
    en: "postman",
    es: "cartero",
    hu: "postás"
  },
  "menuisier charpentier": {
    en: "carpenter",
    es: "carpintero",
    hu: "ács-asztalos"
  },
  "aide soignante": {
    en: "nursing assistant",
    es: "auxiliar de enfermería",
    hu: "ápolási asszisztens"
  },
  "entrepreneur de maçonnerie": {
    en: "masonry contractor",
    es: "contratista de albañilería",
    hu: "kőműves vállalkozó"
  },
  "curé": {
    en: "priest",
    es: "cura",
    hu: "plébános"
  },
  "caissier": {
    en: "cashier",
    es: "cajero",
    hu: "pénztáros"
  },
  "boucher": {
    en: "butcher",
    es: "carnicero",
    hu: "hentes"
  },
  "bouchère": {
    en: "butcher",
    es: "carnicera",
    hu: "hentesfeleség"
  },
  "commerçant": {
    en: "shopkeeper",
    es: "comerciante",
    hu: "kereskedő"
  },
  "commerçante": {
    en: "shopkeeper",
    es: "comerciante (mujer)",
    hu: "kereskedőnő"
  },
  "carrossier": {
    en: "coachbuilder",
    es: "carrocero",
    hu: "karosszériakészítő"
  },
  "comptable": {
    en: "accountant",
    es: "contable",
    hu: "könyvelő"
  },
  "imprimeur": {
    en: "printer",
    es: "impresor",
    hu: "nyomdász"
  },
  "courtier en cidre": {
    en: "cider broker",
    es: "corredor de sidra",
    hu: "almaboralku"
  },
  "marchand boucher": {
    en: "butcher merchant",
    es: "comerciante carnicero",
    hu: "henteskereskedő"
  },
  "berger": {
    en: "shepherd",
    es: "pastor",
    hu: "pásztor"
  },
  "garde moulin": {
    en: "mill guard",
    es: "guardia de molino",
    hu: "malomőr"
  },
  "tonnelier": {
    en: "cooper",
    es: "tonelero",
    hu: "kádár"
  },
  "ferrailleur": {
    en: "scrap dealer",
    es: "chatarrero",
    hu: "ócskavas kereskedő"
  },
  "chartier": {
    en: "carter",
    es: "carretero",
    hu: "szekeres"
  },
  "femme de chambre": {
    en: "chambermaid",
    es: "camarera",
    hu: "szobalány"
  },
  "cafetière": {
    en: "coffee shop owner",
    es: "cafetera",
    hu: "kávéház tulajdonosnő"
  },
  "servante": {
    en: "maid",
    es: "sirvienta",
    hu: "szolgálólány"
  },
  "employée assurance": {
    en: "insurance employee",
    es: "empleada de seguros",
    hu: "biztosítási alkalmazott"
  },
  "ouvrier aeronautique": {
    en: "aeronautics worker",
    es: "obrero aeronáutico",
    hu: "repülőgépipari munkás"
  },
  "marechal-ferrant": {
    en: "blacksmith",
    es: "herrero",
    hu: "patkolókovács"
  },
  "maréchal-ferrant": {
    en: "blacksmith",
    es: "herrero",
    hu: "patkolókovács"
  },
  "militaire": {
    en: "military personnel",
    es: "militar",
    hu: "katona"
  },
  "législateur": {
    en: "legislator",
    es: "legislador",
    hu: "törvényhozó"
  },
  "armateur": {
    en: "shipowner",
    es: "armador",
    hu: "hajótulajdonos"
  },
  "jardinier": {
    en: "gardener",
    es: "jardinero",
    hu: "kertész"
  },
  "charbonnier": {
    en: "charcoal maker",
    es: "carbonero",
    hu: "szénégető"
  },
  "tailleur d'habits": {
    en: "tailor",
    es: "sastre",
    hu: "ruhaszabó"
  },
  "armurier": {
    en: "gunsmith",
    es: "armero",
    hu: "fegyverkovács"
  },
  "maître": {
    en: "master",
    es: "maestro",
    hu: "mester"
  },
  "remetteur": {
    en: "deliverer",
    es: "repartidor",
    hu: "kézbesítő"
  },
  "ingénieur logistique": {
    en: "logistics engineer",
    es: "ingeniero logístico",
    hu: "logisztikai mérnök"
  },
  "employé ambassade": {
    en: "embassy employee",
    es: "empleado de embajada",
    hu: "nagyköveti alkalmazott"
  },
  "poseur storiste": {
    en: "blind installer",
    es: "instalador de persianas",
    hu: "redőnyszerelő"
  },
  "infirmière": {
    en: "nurse",
    es: "enfermera",
    hu: "ápolónő"
  },
  "agent immobilier": {
    en: "real estate agent",
    es: "agente inmobiliario",
    hu: "ingatlanügynök"
  },
  "ouvrier agro-alimentaire": {
    en: "food industry worker",
    es: "obrero agroalimentario",
    hu: "élelmiszeripari munkás"
  },
  "employée importexport": {
    en: "import-export employee",
    es: "empleada de importación-exportación",
    hu: "export-import alkalmazott"
  },
  "fermier": {
    en: "farmer",
    es: "granjero",
    hu: "földbérlő"
  },
  "fabricant de chaux": {
    en: "lime manufacturer",
    es: "fabricante de cal",
    hu: "mészégető"
  },
  "chauffournier": {
    en: "lime kiln worker",
    es: "calero",
    hu: "mészégető"
  },
  "procureur": {
    en: "prosecutor",
    es: "procurador",
    hu: "ügyész"
  },
  "ferblantier": {
    en: "tinsmith",
    es: "hojalatero",
    hu: "bádogos"
  },
  "lingère": {
    en: "linen maid",
    es: "lencera",
    hu: "fehérneműkészítő"
  },
  "gendarme": {
    en: "police officer",
    es: "gendarme",
    hu: "csendőr"
  },
  "métayer": {
    en: "sharecropper",
    es: "aparcero",
    hu: "felesbérlő"
  },
  "commis aux forges": {
    en: "forge clerk",
    es: "empleado de forja",
    hu: "kovácsműhelyi alkalmazott"
  },
  "rentière": {
    en: "person of independent means",
    es: "rentista",
    hu: "járadékos"
  },
  "receveur des domaines": {
    en: "domain receiver",
    es: "receptor de dominios",
    hu: "birtokkezelő"
  },
  "greffier": {
    en: "clerk of court",
    es: "secretario judicial",
    hu: "bírósági írnok"
  },
  "garde forêt": {
    en: "forest guard",
    es: "guardabosques",
    hu: "erdőőr"
  },
  "garde": {
    en: "guard",
    es: "guardia",
    hu: "őr"
  },
  "marchand de toiles": {
    en: "cloth merchant",
    es: "comerciante de telas",
    hu: "vászonkereskedő"
  },
  "marchand de grains": {
    en: "grain merchant",
    es: "comerciante de granos",
    hu: "gabonakereskedő"
  },
  "cabaretier": {
    en: "tavern keeper",
    es: "tabernero",
    hu: "kocsmáros"
  },
  "psycholoque": {
    en: "psychologist",
    es: "psicólogo",
    hu: "pszichológus"
  },
  "maître monnayeur": {
    en: "master coiner",
    es: "maestro acuñador",
    hu: "pénzverőmester"
  },
  "responsable services municipaux": {
    en: "head of municipal services",
    es: "responsable de servicios municipales",
    hu: "önkormányzati szolgáltatások vezetője"
  },
  "fonctionnaire": {
    en: "civil servant",
    es: "funcionario",
    hu: "köztisztviselő"
  },
  "maitre des écoles": {
    en: "school master",
    es: "maestro de escuelas",
    hu: "iskolamester"
  },
  "directrice d'école": {
    en: "school principal",
    es: "directora de escuela",
    hu: "iskolaigazgatónő"
  },
  "animatrice": {
    en: "facilitator",
    es: "animadora",
    hu: "animátor"
  },
  "prêtre": {
    en: "priest",
    es: "sacerdote",
    hu: "pap"
  },
  "conseiller principal d'éducation": {
    en: "education advisor",
    es: "consejero principal de educación",
    hu: "oktatási tanácsadó"
  },
  "développeur": {
    en: "developer",
    es: "desarrollador",
    hu: "fejlesztő"
  },
  "responsable traitement des eaux": {
    en: "water treatment manager",
    es: "responsable de tratamiento de aguas",
    hu: "vízkezelési felelős"
  },
  "photographe": {
    en: "photographer",
    es: "fotógrafo",
    hu: "fényképész"
  },
  "vidéaste": {
    en: "videographer",
    es: "videógrafo",
    hu: "videós"
  },
  "tanneur": {
    en: "tanner",
    es: "curtidor",
    hu: "tímár"
  },
  "laboureuse": {
    en: "female farmer",
    es: "labradora",
    hu: "földművelőnő"
  },
  "marchand tanneur": {
    en: "tanner merchant",
    es: "comerciante curtidor",
    hu: "tímárkereskedő"
  },
  "avocat": {
    en: "lawyer",
    es: "abogado",
    hu: "ügyvéd"
  },
  "procureur d'office": {
    en: "public prosecutor",
    es: "procurador de oficio",
    hu: "hivatali ügyész"
  },
  "transporteur": {
    en: "carrier",
    es: "transportista",
    hu: "fuvarozó"
  },
  "honorable femme": {
    en: "honorable woman",
    es: "mujer honorable",
    hu: "tiszteletre méltó asszony"
  },
  "homme honorable": {
    en: "honorable man",
    es: "hombre honorable",
    hu: "tiszteletre méltó férfi"
  },
  "femme honorable": {
    en: "honorable woman",
    es: "mujer honorable",
    hu: "tiszteletre méltó asszony"
  },
  "télégraphiste": {
    en: "telegraph operator",
    es: "telegrafista",
    hu: "távírász"
  },
  "commis ambulant des postes": {
    en: "travelling postal clerk",
    es: "empleado ambulante de correos",
    hu: "mozgópostai alkalmazott"
  },
  "cultivatrice à la grand-touche": {
    en: "farmer at grand-touche",
    es: "agricultora en grand-touche",
    hu: "földművelőnő a grand-touche-nál"
  },
  "représentant de commerce": {
    en: "sales representative",
    es: "representante comercial",
    hu: "kereskedelmi képviselő"
  },
  
  // Titres nobiliaires et charges
  "baron": {
    en: "baron",
    es: "barón",
    hu: "báró"
  },
  "baron de fougères": {
    en: "Baron of Fougères",
    es: "Barón de Fougères",
    hu: "Fougères bárója"
  },
  "baron de pontchâteau": {
    en: "Baron of Pontchâteau",
    es: "Barón de Pontchâteau",
    hu: "Pontchâteau bárója"
  },
  "baronne de pontchâteau": {
    en: "Baroness of Pontchâteau",
    es: "Baronesa de Pontchâteau",
    hu: "Pontchâteau bárónője"
  },
  "baron de dinan": {
    en: "Baron of Dinan",
    es: "Barón de Dinan",
    hu: "Dinan bárója"
  },
  "comte": {
    en: "count",
    es: "conde",
    hu: "gróf"
  },
  "comte du maine": {
    en: "Count of Maine",
    es: "Conde de Maine",
    hu: "Maine grófja"
  },
  "comte de poher": {
    en: "Count of Poher",
    es: "Conde de Poher",
    hu: "Poher grófja"
  },
  "comte de paris": {
    en: "Count of Paris",
    es: "Conde de París",
    hu: "Párizs grófja"
  },
  "comte d'auxerre": {
    en: "Count of Auxerre",
    es: "Conde de Auxerre",
    hu: "Auxerre grófja"
  },
  "comte de vermandois": {
    en: "Count of Vermandois",
    es: "Conde de Vermandois",
    hu: "Vermandois grófja"
  },
  "comte de cornouaille": {
    en: "Count of Cornwall",
    es: "Conde de Cornualles",
    hu: "Cornwall grófja"
  },
  "comte de fougères": {
    en: "Count of Fougères",
    es: "Conde de Fougères",
    hu: "Fougères grófja"
  },
  "comte de laon": {
    en: "Count of Laon",
    es: "Conde de Laon",
    hu: "Laon grófja"
  },
  "comte de soisson": {
    en: "Count of Soisson",
    es: "Conde de Soisson",
    hu: "Soisson grófja"
  },
  "comte de dreux": {
    en: "Count of Dreux",
    es: "Conde de Dreux",
    hu: "Dreux grófja"
  },
  "comte de braine": {
    en: "Count of Braine",
    es: "Conde de Braine",
    hu: "Braine grófja"
  },
  "comte de penthièvre": {
    en: "Count of Penthièvre",
    es: "Conde de Penthièvre",
    hu: "Penthièvre grófja"
  },
  "comte de tréguier": {
    en: "Count of Tréguier",
    es: "Conde de Tréguier",
    hu: "Tréguier grófja"
  },
  "comte de richmond": {
    en: "Count of Richmond",
    es: "Conde de Richmond",
    hu: "Richmond grófja"
  },
  "comte d'anjou": {
    en: "Count of Anjou",
    es: "Conde de Anjou",
    hu: "Anjou grófja"
  },
  "comte de nevers": {
    en: "Count of Nevers",
    es: "Conde de Nevers",
    hu: "Nevers grófja"
  },
  "comte de brienne": {
    en: "Count of Brienne",
    es: "Conde de Brienne",
    hu: "Brienne grófja"
  },
  "vicomtesse de porhoët": {
    en: "Viscountess of Porhoët",
    es: "Vizcondesa de Porhoët",
    hu: "Porhoët algrófnője"
  },
  "vicomte de dinan nord": {
    en: "Viscount of North Dinan",
    es: "Vizconde de Dinan Norte",
    hu: "Észak-Dinan algrófja"
  },
  "vicomte de thouars": {
    en: "Viscount of Thouars",
    es: "Vizconde de Thouars",
    hu: "Thouars algrófja"
  },
  "vicomte du beso": {
    en: "Viscount of Beso",
    es: "Vizconde de Beso",
    hu: "Beso algrófja"
  },
  "vicomte du besso saint-andre-des-eaux -": {
    en: "Viscount of Besso Saint-Andre-des-Eaux",
    es: "Vizconde de Besso Saint-Andre-des-Eaux",
    hu: "Besso Saint-Andre-des-Eaux algrófja"
  },
  "seigneur": {
    en: "lord",
    es: "señor",
    hu: "földesúr"
  },
  "seigneur de la bouteillerie": {
    en: "Lord of La Bouteillerie",
    es: "Señor de La Bouteillerie",
    hu: "La Bouteillerie ura"
  },
  "seigneur de l'hostellerie": {
    en: "Lord of L'Hostellerie",
    es: "Señor de L'Hostellerie",
    hu: "L'Hostellerie ura"
  },
  "seigneur de matignon": {
    en: "Lord of Matignon",
    es: "Señor de Matignon",
    hu: "Matignon ura"
  },
  "seigneur de beaucorps": {
    en: "Lord of Beaucorps",
    es: "Señor de Beaucorps",
    hu: "Beaucorps ura"
  },
  "seigneur du plessix": {
    en: "Lord of Plessix",
    es: "Señor de Plessix",
    hu: "Plessix ura"
  },
  "seigneur de lorgeril": {
    en: "Lord of Lorgeril",
    es: "Señor de Lorgeril",
    hu: "Lorgeril ura"
  },
  "seigneur de la roche goyon": {
    en: "Lord of La Roche Goyon",
    es: "Señor de La Roche Goyon",
    hu: "La Roche Goyon ura"
  },
  "roi": {
    en: "king",
    es: "rey",
    hu: "király"
  },
  "roi des francs": {
    en: "King of the Franks",
    es: "Rey de los Francos",
    hu: "Frank király"
  },
  "roi des bretons d'armorique": {
    en: "King of the Bretons of Armorica",
    es: "Rey de los Bretones de Armórica",
    hu: "Armorikai breton király"
  },
  "roi de bretagne": {
    en: "King of Brittany",
    es: "Rey de Bretaña",
    hu: "Bretagne királya"
  },
  "roi de silurie": {
    en: "King of Siluria",
    es: "Rey de Siluria",
    hu: "Siluria királya"
  },
  "roi des silures": {
    en: "King of the Silures",
    es: "Rey de los Siluros",
    hu: "Silur király"
  },
  "roi celtes de silures": {
    en: "Celtic King of the Silures",
    es: "Rey Celta de los Siluros",
    hu: "Kelta silur király"
  },
  "roi de galles": {
    en: "King of Wales",
    es: "Rey de Gales",
    hu: "Wales királya"
  },
  "roi de domennée": {
    en: "King of Domennée",
    es: "Rey de Domennée",
    hu: "Domennée királya"
  },
  "roi de britain": {
    en: "King of Britain",
    es: "Rey de Britania",
    hu: "Britannia királya"
  },
  "roi d'ewyas": {
    en: "King of Ewyas",
    es: "Rey de Ewyas",
    hu: "Ewyas királya"
  },
  "roi de cambrie": {
    en: "King of Cambria",
    es: "Rey de Cambria",
    hu: "Cambria királya"
  },
  "roi du pays de galles": {
    en: "King of Wales",
    es: "Rey del País de Gales",
    hu: "Wales királya"
  },
  "roi de france": {
    en: "King of France",
    es: "Rey de Francia",
    hu: "Franciaország királya"
  },
  "reine": {
    en: "queen",
    es: "reina",
    hu: "királynő"
  },
  "reine prizel": {
    en: "Queen Prizel",
    es: "Reina Prizel",
    hu: "Prizel királynő"
  },
  "reine de brigantes": {
    en: "Queen of the Brigantes",
    es: "Reina de los Brigantes",
    hu: "Brigant királynő"
  },
  "reine de bretagne": {
    en: "Queen of Brittany",
    es: "Reina de Bretaña",
    hu: "Bretagne királynője"
  },
  "reine de bretagne armoricaine": {
    en: "Queen of Armorican Brittany",
    es: "Reina de la Bretaña Armoricana",
    hu: "Armoricai Bretagne királynője"
  },
  "duc": {
    en: "duke",
    es: "duque",
    hu: "herceg"
  },
  "duc de bretagne": {
    en: "Duke of Brittany",
    es: "Duque de Bretaña",
    hu: "Bretagne hercege"
  },
  "duc de domnonée": {
    en: "Duke of Domnonée",
    es: "Duque de Domnonée",
    hu: "Domnonée hercege"
  },
  "duc de cornouaille": {
    en: "Duke of Cornwall",
    es: "Duque de Cornualles",
    hu: "Cornwall hercege"
  },
  "duc consort de bretagne": {
    en: "Duke Consort of Brittany",
    es: "Duque Consorte de Bretaña",
    hu: "Bretagne hercegi házastársa"
  },
  "duc des francs": {
    en: "Duke of the Franks",
    es: "Duque de los Francos",
    hu: "Frank herceg"
  },
  "duc des austrasiens": {
    en: "Duke of the Austrasians",
    es: "Duque de los Austrasianos",
    hu: "Austrasiai herceg"
  },
  "duc de bourgogne": {
    en: "Duke of Burgundy",
    es: "Duque de Borgoña",
    hu: "Burgundia hercege"
  },
  "duc d'aquitaine": {
    en: "Duke of Aquitaine",
    es: "Duque de Aquitania",
    hu: "Aquitánia hercege"
  },
  "prince": {
    en: "prince",
    es: "príncipe",
    hu: "herceg"
  },
  "prince de cornouailless": {
    en: "Prince of Cornwall",
    es: "Príncipe de Cornualles",
    hu: "Cornwall hercege"
  },
  "prince d'albanie": {
    en: "Prince of Albany",
    es: "Príncipe de Albania",
    hu: "Albany hercege"
  },
  "prince de léon": {
    en: "Prince of Leon",
    es: "Príncipe de León",
    hu: "León hercege"
  },
  "princesse": {
    en: "princess",
    es: "princesa",
    hu: "hercegnő"
  },
  "princesse de france": {
    en: "Princess of France",
    es: "Princesa de Francia",
    hu: "Francia hercegnő"
  },
  "princesse de cornouaille": {
    en: "Princess of Cornwall",
    es: "Princesa de Cornualles",
    hu: "Cornwall hercegnője"
  }
};

/**
 * Fonction pour obtenir la traduction d'une occupation/métier
 * @param {string} occupation - Métier ou occupation en français
 * @param {string} targetLang - Langue cible (en, es, hu)
 * @returns {string} - Traduction dans la langue cible
 */
export function translateOccupation(occupation, targetLang = 'en') {
  // Vérifier si nous avons une traduction directe

  // console.log("Profession à traduire :", occupation, targetLang)

  if (occupationTranslations[occupation] && occupationTranslations[occupation][targetLang]) {
    return occupationTranslations[occupation][targetLang];
  }


  // console.log("Profession not found in  occupationTranslations :")
  
  // Pour les seigneurs, dames, sieurs et autres titres avec lieu
  // qui ne sont pas dans notre dictionnaire, essayons de traduire
  // la partie générique
  
  // Termes génériques à traduire
  const genericTerms = {
    "seigneur de": {
      en: "Lord of",
      es: "Señor de",
      hu: "Ura"
    },
    "seigneur du": {
      en: "Lord of",
      es: "Señor de",
      hu: "Ura"
    },
    "sieur de": {
      en: "Sire of",
      es: "Señor de",
      hu: "Ura"
    },
    "sieur du": {
      en: "Sire of",
      es: "Señor de",
      hu: "Ura"
    },
    "maire du palais": {
      en: "Mayor of the Palace",
      es: "Alcalde del Palacio",
      hu: "Palota polgármestere"
    },
    "maire de": {
      en: "Mayor of",
      es: "Alcalde de",
      hu: "Polgármestere"
    },
    "roi d'": {
      en: "King of",
      es: "Rey de",
      hu: "Király"
    },
    "roi des": {
      en: "King of",
      es: "Rey de",
      hu: "Király"
    },
    "roi de": {
      en: "King of",
      es: "Rey de",
      hu: "Király"
    },
    "roi du": {
      en: "King of",
      es: "Rey de",
      hu: "Király"
    },
    "empereur de": {
      en: "Emperor of",
      es: "Emperador de",
      hu: "Császár"
    },
    "empereur du": {
      en: "Emperor of",
      es: "Emperador de",
      hu: "Császár"
    },
    "empereur d'": {
      en: "Emperor of",
      es: "Emperador de",
      hu: "Császár"
    },

    "dame de": {
      en: "Lady of",
      es: "Dama de",
      hu: "Úrnője"
    },
    "dame du": {
      en: "Lady of",
      es: "Dama de",
      hu: "Úrnője"
    },
    "demoiselle de": {
      en: "Lady of",
      es: "Damisela de",
      hu: "Kisasszony"
    },
    "demoiselle du": {
      en: "Lady of",
      es: "Damisela de",
      hu: "Kisasszony"
    }
  };
  
  // Parcourir les termes génériques
  for (const [frTerm, translations] of Object.entries(genericTerms)) {

    // console.log('debug:', frTerm, translations)
    if (occupation.toLowerCase().startsWith(frTerm.toLowerCase())) {
      const placeName = occupation.substring(frTerm.length).trim();
      if (targetLang === 'fr') {
        // return occupation; // Pas de traduction nécessaire pour le français
        if (frTerm === "roi d'" || frTerm === "empereur d'") {
          return `${frTerm}${placeName}`;
        } else {
          return `${frTerm} ${placeName}`;
        }
      } else if (targetLang === 'hu') {
        // En hongrois, l'ordre est inversé: "Placename Ura"
        return `${placeName} ${translations[targetLang]}`;
      } else {
        return `${translations[targetLang]} ${placeName}`;
      }
    }
  }
  
  // Si l'occupation ressemble à "X de Y" mais n'est pas un titre, 
  // on traduit juste la partie X si possible
  if (occupation.includes(" de ")) {
    const parts = occupation.split(" de ");
    const mainOccupation = parts[0].trim();
    const location = parts.slice(1).join(" de ").trim();
    if (targetLang === 'fr') {
      return occupation; // Pas de traduction nécessaire pour le français}
    }
    if (occupationTranslations[mainOccupation] && occupationTranslations[mainOccupation][targetLang]) {
      if (targetLang === 'en') {
        return `${occupationTranslations[mainOccupation][targetLang]} of ${location}`;
      } else if (targetLang === 'es') {
        return `${occupationTranslations[mainOccupation][targetLang]} de ${location}`;
      } else if (targetLang === 'hu') {
        return `${location} ${occupationTranslations[mainOccupation][targetLang]}`;
      }
    }
  }
  
  // Si aucune traduction n'est trouvée, retourner l'occupation originale
  // console.warn(`Aucune traduction trouvée pour '${occupation}' en ${targetLang}`);
  return occupation;
}

/**
 * Fonction pour traduire tout le tableau des occupations
 * @param {string} targetLang - Langue cible (en, es, hu)
 * @returns {Array} - Tableau des occupations traduites
 */
export function translateAllOccupations(targetLang = 'en') {
  return frenchOccupations.map(occ => translateOccupation(occ, targetLang));
}

/**
 * Fonction pour obtenir toutes les traductions pour une occupation donnée
 * @param {string} occupation - Métier ou occupation en français
 * @returns {Object} - Objet contenant les traductions dans toutes les langues disponibles
 */
export function getOccupationTranslations(occupation) {
  const translations = {
    fr: occupation,
    en: translateOccupation(occupation, 'en'),
    es: translateOccupation(occupation, 'es'),
    hu: translateOccupation(occupation, 'hu')
  };
  
  return translations;
}

/**
 * Fonction pour générer un objet de toutes les occupations avec leurs traductions
 * @returns {Object} - Objet contenant toutes les occupations et leurs traductions
 */
export function generateOccupationsDictionary() {
  const dictionary = {};
  
  frenchOccupations.forEach(occupation => {
    dictionary[occupation] = getOccupationTranslations(occupation);
  });
  
  return dictionary;
}