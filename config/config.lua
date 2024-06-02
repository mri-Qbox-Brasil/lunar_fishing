Config = {}

Config.progressPerCatch = 5 -- The progress per one fish caught

---@class Fish
---@field price integer | { min: integer, max: integer }
---@field chance integer Percentage chance
---@field skillcheck SkillCheckDifficulity }

---@type table<string, Fish>
Config.fish = {
    ['anchovy'] = { price = { min = 25, max = 50 }, chance = 35, skillcheck = { 'easy', 'easy' } },
    ['trout'] = { price = { min = 50, max = 100 }, chance = 35, skillcheck = { 'easy', 'easy' } },
    ['haddock'] = { price = { min = 150, max = 200 }, chance = 20, skillcheck = { 'easy', 'easy' } },
    ['salmon'] = { price = { min = 200, max = 250 }, chance = 10, skillcheck = { 'easy', 'easy', 'medium' } },
    ['grouper'] = { price = { min = 300, max = 350 }, chance = 25, skillcheck = { 'easy', 'easy', 'medium', 'medium' } },
    ['piranha'] = { price = { min = 350, max = 450 }, chance = 25, skillcheck = { 'easy', 'easy', 'hard' } },
    ['red_snapper'] = { price = { min = 400, max = 450 }, chance = 20, skillcheck = { 'easy', 'easy', 'medium', 'medium' } },
    ['mahi_mahi'] = { price = { min = 450, max = 500 }, chance = 20, skillcheck = { 'easy', 'easy', 'medium', 'medium' } },
    ['tuna'] = { price = { min = 1250, max = 1500 }, chance = 5, skillcheck = { 'easy', 'easy', 'hard' } },
    ['shark'] = { price = { min = 2250, max = 2750 }, chance = 1, skillcheck = { 'easy', 'easy', 'hard' } },
}

---@class FishingRod
---@field name string
---@field price integer
---@field minLevel integer The minimal level
---@field breakChance integer Percentage chance

---@type FishingRod[]
Config.fishingRods = {
    { name = 'basic_rod', price = 1000, minLevel = 0, breakChance = 20 },
    { name = 'graphite_rod', price = 2500, minLevel = 2, breakChance = 10 },
    { name = 'titanium_rod', price = 5000, minLevel = 4, breakChance = 1 },
}

---@class FishingBait
---@field name string
---@field price integer
---@field minLevel integer The minimal level
---@field waitDivisor number The total wait time gets divided by this value

---@type FishingBait[]
Config.baits = {
    { name = 'worms', price = 5, minLevel = 0, waitDivisor = 1.0 },
    { name = 'artificial_bait', price = 50, minLevel = 2, waitDivisor = 3.0 },
}

---@class FishingZone
---@field locations vector3[] One of these gets picked at random
---@field radius number
---@field minLevel integer
---@field waitTime { min: integer, max: integer }
---@field includeOutside boolean Whether you can also catch fish from Config.outside
---@field blip BlipData?
---@field message { enter: string, exit: string }?
---@field fishList string[]

---@type FishingZone[]
Config.fishingZones = {
    {
        blip = {
            name = 'Coral Reef',
            sprite = 317,
            color = 24,
            scale = 0.6
        },
        locations = {
            vector3(-1774.0654, -1796.2740, 0.0),
            vector3(2482.8589, -2575.6780, 0.0)
        },
        radius = 250.0,
        minLevel = 1,
        waitTime = { min = 5, max = 10 },
        includeOutside = true,
        message = { enter = 'Você entrou em um recife de coral.', exit = 'Você deixou o recife de coral.' },
        fishList = { 'mahi_mahi', 'red_snapper' }
    },
    {
        blip = {
            name = 'Deep Waters',
            sprite = 317,
            color = 29,
            scale = 0.6
        },
        locations = {
            vector3(-4941.7964, -2411.9146, 0.0),
        },
        radius = 1000.0,
        minLevel = 3,
        waitTime = { min = 20, max = 40 },
        includeOutside = false,
        message = { enter = 'Você entrou em águas profundas.', exit = 'Você deixou águas profundas.' },
        fishList = { 'grouper', 'tuna', 'shark' }
    },
    {
        blip = {
            name = 'Swamp',
            sprite = 317,
            color = 56,
            scale = 0.6
        },
        locations = {
            vector3(-2188.1182, 2596.9348, 0.0),
        },
        radius = 200.0,
        minLevel = 2,
        waitTime = { min = 10, max = 20 },
        includeOutside = true,
        message = { enter = 'Você entrou em um pântano.', exit = 'Você deixou o pântano.' },
        fishList = { 'piranha' }
    },
}

-- Outside of all zones
Config.outside = {
    waitTime = { min = 10, max = 25 },

    ---@type string[]
    fishList = {
        'trout', 'anchovy', 'haddock', 'salmon'
    }
}

Config.ped = {
    buyAccount = 'money',
    sellAccount = 'money',
    -- blip = {
    --     name = 'SeaTrade Corporation',
    --     sprite = 356,
    --     color = 74,
    --     scale = 0.75
    -- },

    -- TALK NPCS
    model = 's_m_m_cntrybar_01',
    name = 'João',
    tag = 'PESCADOR',
    startMSG = 'Vamos pescar?',
    message = "👋 Olá, me chamo 😃**João Luiz**, mas pode me chamar de **Tarzan da Pescaria**.  \nVou te explicar como 🎣 pescar.  \nPara isso, você vai precisar de uma 🪝 vara de pesca e isca de pesca. Depois, você pode ir até um lago ou ao mar e começar a pescar usando a vara de pesca. 🌊  \nLembrando que quanto mais experiência você adquirir, poderá pescar em áreas específicas, pegando peixes melhores e podendo comprar varas de pesca melhores para essa pescaria.  \nEntão, agora que você já sabe como faz, boa pescaria para você! 🎣🐟",

    ---@type vector4[]
    locations = {
        vector4(-2081.3831, 2614.3223, 3.0840, 112.7910),
        vector4(-1492.3639, -939.2579, 10.2140, 144.0305)
    }
}

Config.renting = {
    model = 's_m_m_dockwork_01', -- The ped model
    account = 'money',
    boats = {
        { model = `speeder`, price = 500, image = 'https://i.postimg.cc/mDSqWj4P/164px-Speeder.webp' },
        { model = `dinghy`, price = 750, image = 'https://i.postimg.cc/ZKzjZgj0/164px-Dinghy2.webp'  },
        { model = `tug`, price = 1250, image = 'https://i.postimg.cc/jq7vpKHG/164px-Tug.webp' }
    },
    blip = {
        name = 'Aluguel de Barcos',
        sprite = 410,
        color = 74,
        scale = 0.75
    },
    returnDivider = 5, -- Players can return it and get some cash back
    returnRadius = 30.0, -- The save radius

    -- TALK NPCS
    model = 's_m_m_dockwork_01',
    name = 'Trakinas',
    tag = 'PESCADOR APOSENTADO',
    startMSG = 'Tá precisando de um barco?',
    message = "👋 Olá, me chamo 😃**Alessandro Azevedo**, mas pode me chamar de **Trakinas**.  \nAqui você pode alugar barcos para pescar. Vai querer algum?",


    ---@type { coords: vector4, spawn: vector4 }[]
    locations = {
        { coords = vector4(-1434.4818, -1512.2745, 2.1486, 25.8666), spawn = vector4(-1494.4496, -1537.6943, 2.3942, 115.6015) }
    }
}