QBCore = exports['qb-core']:GetCoreObject()

-- [ Code ] --

EscapeSqli = function(str)
    local replacements = { ['"'] = '\\"', ["'"] = "\\'" }
    return str:gsub( "['\"]", replacements)
end

LoadHouseData = function()
    local HouseGarages = {}
    local Houses = {}
    local result = exports['oxmysql']:executeSync('SELECT * FROM houselocations', {})
    if result[1] ~= nil then
        for k, v in pairs(result) do
            local owned = false
            if tonumber(v.owned) == 1 then
                owned = true
            end
            local garage = v.garage ~= nil and json.decode(v.garage) or {}
            Houses[v.name] = {
                coords = json.decode(v.coords),
                owned = v.owned,
                price = v.price,
                locked = true,
                adress = v.label, 
                tier = v.tier,
                garage = garage,
                decorations = {},
            }
            HouseGarages[v.name] = {
                label = v.label,
                takeVehicle = garage,
            }
        end
    end
    TriggerClientEvent("qb-garages:client:houseGarageConfig", -1, HouseGarages)
    TriggerClientEvent("qb-houses:client:setHouseConfig", -1, Houses)
end

UpdateInventory = function(source)
    local Player = QBCore.Functions.GetPlayer(source)
    local PlayerItems = Player.PlayerData.items
    if PlayerItems ~= nil then
        exports['oxmysql']:update("UPDATE players SET inventory = ? WHERE citizenid = ? ", {EscapeSqli(json.encode(PlayerItems)), Player.PlayerData.citizenid})
    else
        exports['oxmysql']:update("UPDATE players SET inventory = ? WHERE citizenid = ? ", {'{}', Player.PlayerData.citizenid})
    end
end

-- [ Events ] --

RegisterNetEvent('mr-characters:server:load:user:data', function(cData)
    local src = source
    if QBCore.Player.Login(src, cData.citizenid) then
        print('^2[mercy-characters]^7 '..GetPlayerName(src)..' (Citizen ID: '..cData.citizenid..') successfully loaded!')
        QBCore.Commands.Refresh(src)
        LoadHouseData()
        TriggerClientEvent('apartments:client:setupSpawnUI', src, cData)
        TriggerEvent("qb-log:server:CreateLog", "joinleave", "Loaded", "green", "**".. GetPlayerName(src) .. "** ("..cData.citizenid.." | "..src..") loaded..")
	end
end)

RegisterNetEvent('mr-characters:server:createCharacter', function(data)
    local src = source
    local newData = {}
    newData.cid = data.cid
    newData.charinfo = data
    if QBCore.Player.Login(src, false, newData) then
        print('^2[mercy-characters]^7 '..GetPlayerName(src)..' succesfully made a character!')
        QBCore.Commands.Refresh(src)
        LoadHouseData()
        TriggerClientEvent('apartments:client:setupSpawnUI', src, newData)
        GiveStarterItems(src)
	end
end)

RegisterNetEvent('mr-characters:server:deleteCharacter', function(citizenid)
    local src = source
    QBCore.Player.DeleteCharacter(src, citizenid)
end)

RegisterNetEvent('mr-characters:server:disconnect', function()
    local src = source
    DropPlayer(src, "[Mercy] You left the city!")
end)

-- [ Functions ] --

function GiveStarterItems(source)
    local Player = QBCore.Functions.GetPlayer(source)
    for k, v in pairs(QBCore.Shared.StarterItems) do
        local info = {}
        if v.item == "id_card" then
            info.citizenid = Player.PlayerData.citizenid
            info.firstname = Player.PlayerData.charinfo.firstname
            info.lastname = Player.PlayerData.charinfo.lastname
            info.birthdate = Player.PlayerData.charinfo.birthdate
            info.gender = Player.PlayerData.charinfo.gender
            info.nationality = Player.PlayerData.charinfo.nationality
        elseif v.item == "driver_license" then
            info.firstname = Player.PlayerData.charinfo.firstname
            info.lastname = Player.PlayerData.charinfo.lastname
            info.birthdate = Player.PlayerData.charinfo.birthdate
            info.type = "Class C Driver License"
        end
        Player.Functions.AddItem(v.item, v.amount, 'starteritems', info)
    end
end

-- [ Callbacks ] --

QBCore.Functions.CreateCallback("mr-characters:server:get:char:data", function(source, cb)
    local License = QBCore.Functions.GetIdentifier(source, 'license')
    local plyChars = {}
    exports['oxmysql']:execute('SELECT * FROM players WHERE license = ? ', {License}, function(result)
        for i = 1, (#result), 1 do
            result[i].charinfo = json.decode(result[i].charinfo)
            result[i].money = json.decode(result[i].money)
            result[i].job = json.decode(result[i].job)
            table.insert(plyChars, result[i])
        end
        cb(plyChars)
    end)
end)

QBCore.Functions.CreateCallback("mr-characters:server:getSkin", function(source, cb, cid)
    local result = exports['oxmysql']:executeSync('SELECT * FROM playerskins WHERE citizenid = ? AND active = ?', {cid, 1})
    if result[1] ~= nil then
        cb(result[1].model, result[1].skin)
    else
        cb(nil)
    end
end)

-- [ Commands ] --

QBCore.Commands.Add("quit", "Leave the city", {}, false, function(source, args)
    DropPlayer(source, "[Mercy] You left the city!")
end)

QBCore.Commands.Add("logout", "Go to character selection.", {}, false, function(source, args)
    UpdateInventory(source)
    QBCore.Player.Logout(source)
    Citizen.Wait(550)
    TriggerClientEvent('mr-characters:client:choose:char', source)
end, "admin")

QBCore.Commands.Add("char", "Choose a character", {{name="charnr", help="Number of character"}}, false, function(source, args)
    local Player = QBCore.Functions.GetPlayer(source)
    if args[1] then
        local CharId = tonumber(args[1])
        if CharId ~= nil and (CharId <= 4 and CharId >= 1) then
            local License = QBCore.Functions.GetIdentifier(source, 'license')
            exports['oxmysql']:execute("SELECT * FROM players WHERE license = ? AND cid = ? ", {License, CharId}, function(CharData)
                if CharData[1] ~= nil then
                    UpdateInventory(source)
                    QBCore.Player.Logout(source)
                    Citizen.Wait(650)
                    TriggerEvent('mr-characters:server:load:user:data', CharData[1])
                else
                    TriggerClientEvent('QBCore:Notify', source, 'You don\'t have this character..', 'error', 2500)
                end
            end)
        else
            TriggerClientEvent('QBCore:Notify', source, 'Are you stupid?', 'error', 2500)
        end
    else
        TriggerClientEvent('QBCore:Notify', source, 'Fill in a number..', 'error', 2500)
    end
end, "god")
