QBCore = exports['qb-core']:GetCoreObject()
local SpawnCam, charPed = nil, nil

Citizen.CreateThread(function()
	while true do
		Citizen.Wait(4)
		if NetworkIsSessionStarted() then
			TriggerEvent('mr-characters:client:choose:char')
			return
		end
	end
end)

-- [ Code ] --

-- [ Events ] --

RegisterNetEvent('mr-characters:client:choose:char')
AddEventHandler('mr-characters:client:choose:char', function()
    StartCharScreen()
end)

-- [ NUI Callbacks ] --

RegisterNUICallback('CloseUI', function()
    OpenCharMenu(false)
end)

RegisterNUICallback('DisconnectButton', function()
    SetEntityAsMissionEntity(charPed, true, true)
    DeleteEntity(charPed)
    TriggerServerEvent('mr-characters:server:disconnect')
end)

RegisterNUICallback('cDataPed', function(Data)
    local cData = Data.cData
    if charPed ~= nil then
        TaskGoStraightToCoord(charPed, Config.Characters["StartPedCoords"].x, Config.Characters["StartPedCoords"].y, Config.Characters["StartPedCoords"].z - 0.98, 1.0, -1, Config.Characters["StartPedCoords"].h)
        Citizen.Wait(2500)
        SetEntityAsMissionEntity(charPed, true, true)
        DeleteEntity(charPed) 
        Citizen.Wait(150)
    end
    if cData ~= nil then
        QBCore.Functions.TriggerCallback('mr-characters:server:getSkin', function(model, data)
            model = model ~= nil and tonumber(model) or false
            if model ~= nil then
                Citizen.CreateThread(function()
                    RequestModel(model)
                    while not HasModelLoaded(model) do
                        Citizen.Wait(0)
                    end                    
                    charPed = CreatePed(2, model, Config.Characters["StartPedCoords"].x, Config.Characters["StartPedCoords"].y, Config.Characters["StartPedCoords"].z - 0.98, Config.Characters["StartPedCoords"].h, false, false)
                    data = json.decode(data)
                    TriggerEvent('qb-clothing:client:loadPlayerClothing', data, charPed)
                    SetEveryoneIgnorePlayer(charPed, true)
                    NetworkSetEntityInvisibleToNetwork(charPed, true)
                    SetEntityInvincible(charPed, true)
                    SetBlockingOfNonTemporaryEvents(charPed, true)
                    SetPedConfigFlag(charPed, 410, true)
                    SetEntityCanBeDamagedByRelationshipGroup(charPed, false, GetHashKey('PLAYER'))
                    FreezeEntityPosition(charPed, false)
                    SetEntityAsMissionEntity(charPed, true, true)
                    PlaceObjectOnGroundProperly(charPed)
                    TaskGoStraightToCoord(charPed, Config.Characters["PedCoords"].x, Config.Characters["PedCoords"].y, Config.Characters["PedCoords"].z - 0.98, 1.0, -1, Config.Characters["PedCoords"].h)
                    Citizen.SetTimeout(3000, function()
                        SendNUIMessage({
                            action = "EnableCharSelector"
                        })
                    end)
                end)
            end
        end, cData.citizenid)
    else
        SpawnDefaultPed()
    end
end)

function SpawnDefaultPed()
    Citizen.CreateThread(function()
        local model = GetHashKey("mp_m_freemode_01")
        RequestModel(model)
        while not HasModelLoaded(model) do
            Citizen.Wait(0)
        end
        charPed = CreatePed(2, model, Config.Characters["StartPedCoords"].x, Config.Characters["StartPedCoords"].y, Config.Characters["StartPedCoords"].z - 0.98, Config.Characters["StartPedCoords"].h, false, false)
        NetworkSetEntityInvisibleToNetwork(charPed, true)
        SetPedComponentVariation(charPed, 0, 0, 0, 2)
        FreezeEntityPosition(charPed, false)
        SetEntityInvincible(charPed, true)
        SetEntityCanBeDamagedByRelationshipGroup(charPed, false, `PLAYER`)
        PlaceObjectOnGroundProperly(charPed)
        SetBlockingOfNonTemporaryEvents(charPed, true)
        TaskGoStraightToCoord(charPed, Config.Characters["PedCoords"].x, Config.Characters["PedCoords"].y, Config.Characters["PedCoords"].z - 0.98, 1.0, -1, Config.Characters["PedCoords"].h)
        Citizen.SetTimeout(3000, function()
            SendNUIMessage({
                action = "EnableCharSelector"
            })
        end)
    end) 
end

function StartCharScreen()
    DoScreenFadeOut(10)
    Citizen.Wait(1000)
    local Interior = GetInteriorAtCoords(-1453.56, -551.53, 72.84)
    LoadInterior(Interior)
    while not IsInteriorReady(Interior) do
        Citizen.Wait(1000)
        print("[Interior loading..]")
    end
    OpenCharMenu(true)
    SetEntityCoords(PlayerPedId(), Config.Characters["HiddenCoords"].x, Config.Characters["HiddenCoords"].y, Config.Characters["HiddenCoords"].z)
    FreezeEntityPosition(PlayerPedId(), true)
    SetEntityVisible(PlayerPedId(), false)
    TriggerEvent('qb-weathersync:client:DisableSync')
    Citizen.Wait(750)
    ShutdownLoadingScreenNui()
    ShutdownLoadingScreen()
    DoScreenFadeIn(1000)
end

RegisterNUICallback('SetupCharacters', function()
    QBCore.Functions.TriggerCallback("mr-characters:server:get:char:data", function(result)
        SendNUIMessage({
            action = "SetupCharacters",
            characters = result
        })
    end)
end)

RegisterNUICallback('SelectCharacter', function(data)
    local cData = data.cData
    TaskGoStraightToCoord(charPed, Config.Characters["EndPedCoords"].x, Config.Characters["EndPedCoords"].y, Config.Characters["EndPedCoords"].z - 0.98, 1.0, -1, Config.Characters["EndPedCoords"].h)
    Citizen.SetTimeout(2000, function()
        DoScreenFadeOut(150)
        Citizen.Wait(150)
        NetworkRequestControlOfEntity(charPed)
        DeleteEntity(charPed)
        OpenCharMenu(false)
        charPed = nil
        TriggerServerEvent('mr-characters:server:load:user:data', cData)
    end)
end)

RegisterNUICallback('CreateNewCharacter', function(data)
    local cData = data
    if cData.gender == "man" then
        cData.gender = 0
    elseif cData.gender == "woman" then
        cData.gender = 1
    end
    TaskGoStraightToCoord(charPed, Config.Characters["EndPedCoordsCreated"].x, Config.Characters["EndPedCoordsCreated"].y, Config.Characters["EndPedCoordsCreated"].z - 0.98, 1.0, -1, Config.Characters["StartPedCoords"].h)
    Citizen.SetTimeout(2000, function()
        DoScreenFadeOut(150)
        Citizen.Wait(150)
        NetworkRequestControlOfEntity(charPed)
        DeleteEntity(charPed)
        OpenCharMenu(false)
        charPed = nil
        TriggerServerEvent('mr-characters:server:createCharacter', cData)
    end)
end)

RegisterNUICallback('RemoveCharacter', function(data)
    TaskGoStraightToCoord(charPed, Config.Characters["EndPedCoordsCreated"].x, Config.Characters["EndPedCoordsCreated"].y, Config.Characters["EndPedCoordsCreated"].z - 0.98, 1.0, -1, Config.Characters["StartPedCoords"].h)
    Citizen.SetTimeout(2500, function()
        DoScreenFadeOut(10)
        SetEntityAsMissionEntity(charPed, true, true)
        DeleteEntity(charPed)
        OpenCharMenu(false)
        charPed = nil
        TriggerServerEvent('mr-characters:server:deleteCharacter', data.citizenid)
        TriggerEvent('mr-characters:client:choose:char')
    end)
end)

-- [ Functions ] --

function SetCam(bool)
    DestroyAllCams()
    if SpawnCam == nil then
        SpawnCam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA",Config.Characters["CamCoords"].x, Config.Characters["CamCoords"].y, Config.Characters["CamCoords"].z, 0.00, 0.00, 248.17, 60.00, false, 0)
        SetCamActive(SpawnCam, true)
        RenderScriptCams(true, false, 1, true, true)
    else
        DestroyAllCams()
        SpawnCam = nil
    end
end

function OpenCharMenu(Bool)
    SetNuiFocus(Bool, Bool)
    SendNUIMessage({
        action = "ui",
        toggle = Bool,
    })
    SetCam(Bool)
end

-- Delete Ped
AddEventHandler("onResourceStop", function(resourceName)
    if resourceName == GetCurrentResourceName() then
        SetEntityAsMissionEntity(charPed, true, true)
        DeleteEntity(charPed)
    end
end)