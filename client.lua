--[[
    Client deathscreen: open/close NUI, freecam, action callbacks.
    Idle (alive): no Wait(0) thread — resmon ~0.00
]]

local isDead = false
local deathLoopActive = false
local freecamActive = false
local freecamCam = nil
local lastDispatchAt = 0
local bleedUnlockAt = 0

local startDeathLoop
local stopFreecam

local function sendNui(action, data)
    SendNUIMessage({
        action = action,
        data = data or {},
    })
end

local function openDeathScreen(payload)
    if isDead then return end
    isDead = true

    local data = payload or {}
    data.timer = data.timer or Config.BleedOutTime
    data.playerName = data.playerName or Config.Locale.titleLine1
    data.settings = {
        enableMinigame = Config.EnableMinigame,
        enableFreecam = Config.EnableFreecam,
        enableRespawn = Config.EnableRespawn,
        dispatchEnabled = Config.EnableDispatch,
        defaultTimer = data.timer,
    }
    data.translations = data.translations or {
        titleLine1 = data.playerName,
        titleLine2 = Config.Locale.titleLine2,
        timerLabel = Config.Locale.timerLabel,
        buttons = {
            press = Config.Locale.press,
            locked = Config.Locale.locked,
            freecam = Config.Locale.freecam,
            dispatch = Config.Locale.dispatch,
            respawn = Config.Locale.respawn,
            minigame = Config.Locale.minigame,
        },
    }

    -- E (respawn) stays locked until bleed-out timer ends
    bleedUnlockAt = GetGameTimer() + (math.max(0, data.timer) * 1000)

    SetNuiFocus(Config.NuiFocus, Config.NuiFocus)
    sendNui('open', data)
    startDeathLoop()
end

local function closeDeathScreen()
    if not isDead then return end
    stopFreecam()
    isDead = false
    bleedUnlockAt = 0
    SetNuiFocus(false, false)
    sendNui('close')
end

startDeathLoop = function()
    if deathLoopActive then return end
    deathLoopActive = true

    CreateThread(function()
        while isDead do
            if not freecamActive then
                DisableAllControlActions(0)
                EnableControlAction(0, 1, true)
                EnableControlAction(0, 2, true)
                EnableControlAction(0, 245, true)
            end
            Wait(0)
        end
        deathLoopActive = false
    end)
end

stopFreecam = function()
    if not freecamActive then return end
    freecamActive = false

    if freecamCam then
        RenderScriptCams(false, true, 400, true, true)
        DestroyCam(freecamCam, false)
        freecamCam = nil
    end

    if isDead then
        SetNuiFocus(Config.NuiFocus, Config.NuiFocus)
        sendNui('setFreecam', { active = false })
    end
end

local function startFreecam()
    if freecamActive or not Config.EnableFreecam or not isDead then return end

    freecamActive = true
    SetNuiFocus(false, false)
    sendNui('setFreecam', { active = true })

    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)

    freecamCam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true)
    SetCamCoord(freecamCam, coords.x, coords.y, coords.z + 0.6)
    SetCamRot(freecamCam, 0.0, 0.0, heading, 2)
    SetCamFov(freecamCam, 70.0)
    SetCamActive(freecamCam, true)
    RenderScriptCams(true, true, 400, true, true)

    CreateThread(function()
        local baseSpeed = 0.35

        while freecamActive and isDead do
            DisableAllControlActions(0)

            local camCoords = GetCamCoord(freecamCam)
            local camRot = GetCamRot(freecamCam, 2)

            local mouseX = GetDisabledControlNormal(0, 1) * 8.0
            local mouseY = GetDisabledControlNormal(0, 2) * 8.0
            local pitch = camRot.x - mouseY
            local yaw = camRot.z - mouseX
            if pitch > 89.0 then pitch = 89.0 end
            if pitch < -89.0 then pitch = -89.0 end
            SetCamRot(freecamCam, pitch, 0.0, yaw, 2)

            local radZ = math.rad(yaw)
            local radX = math.rad(pitch)
            local forward = vector3(
                -math.sin(radZ) * math.cos(radX),
                math.cos(radZ) * math.cos(radX),
                math.sin(radX)
            )
            local right = vector3(math.cos(radZ), math.sin(radZ), 0.0)

            local moveX, moveY, moveZ = 0.0, 0.0, 0.0
            if IsDisabledControlPressed(0, 32) then -- W
                moveX = moveX + forward.x
                moveY = moveY + forward.y
                moveZ = moveZ + forward.z
            end
            if IsDisabledControlPressed(0, 33) then -- S
                moveX = moveX - forward.x
                moveY = moveY - forward.y
                moveZ = moveZ - forward.z
            end
            if IsDisabledControlPressed(0, 34) then -- A
                moveX = moveX - right.x
                moveY = moveY - right.y
            end
            if IsDisabledControlPressed(0, 35) then -- D
                moveX = moveX + right.x
                moveY = moveY + right.y
            end
            if IsDisabledControlPressed(0, 22) then -- Space
                moveZ = moveZ + 1.0
            end
            if IsDisabledControlPressed(0, 36) then -- Ctrl
                moveZ = moveZ - 1.0
            end

            local len = math.sqrt(moveX * moveX + moveY * moveY + moveZ * moveZ)
            if len > 0.001 then
                local speed = baseSpeed
                if IsDisabledControlPressed(0, 21) then -- Shift
                    speed = speed * 3.0
                end
                speed = speed / len
                SetCamCoord(
                    freecamCam,
                    camCoords.x + moveX * speed,
                    camCoords.y + moveY * speed,
                    camCoords.z + moveZ * speed
                )
            end

            -- F exits freecam
            if IsDisabledControlJustPressed(0, 49) then
                stopFreecam()
                break
            end

            Wait(0)
        end

        if freecamActive then
            stopFreecam()
        end
    end)
end

local function toggleFreecam()
    if freecamActive then
        stopFreecam()
    else
        startFreecam()
    end
end

local function handleDispatch()
    if not Config.EnableDispatch or not isDead then
        return false, 'disabled'
    end

    local now = GetGameTimer()
    if now - lastDispatchAt < Config.DispatchCooldown then
        return false, 'cooldown'
    end
    lastDispatchAt = now

    TriggerServerEvent('emydigital-deathscreen:server:dispatch')

    local framework = GetFramework()
    if framework == 'qb' or framework == 'qbx' then
        TriggerServerEvent('hospital:server:ambulanceAlert', 'Injured Person')
    end

    return true
end

local function handleRespawn()
    if not Config.EnableRespawn or not isDead then
        return false
    end

    if GetGameTimer() < bleedUnlockAt then
        return false
    end

    local framework = GetFramework()

    if framework == 'qb' or framework == 'qbx' then
        TriggerEvent('hospital:client:RespawnAtHospital')
        closeDeathScreen()
        return true
    end

    if framework == 'esx' then
        TriggerServerEvent('emydigital-deathscreen:server:respawn')
        closeDeathScreen()
        return true
    end

    -- Standalone: revive + teleport to configured hospital coords
    local ped = PlayerPedId()
    local c = Config.RespawnCoords
    NetworkResurrectLocalPlayer(c.x, c.y, c.z, c.w, true, false)
    SetEntityCoordsNoOffset(ped, c.x, c.y, c.z, false, false, false)
    SetEntityHeading(ped, c.w)
    ClearPedBloodDamage(ped)
    SetEntityInvincible(ped, false)
    SetEntityHealth(ped, GetEntityMaxHealth(ped))
    TriggerServerEvent('emydigital-deathscreen:server:respawn')
    closeDeathScreen()
    return true
end

-- NUI callbacks

RegisterNUICallback('nuiReady', function(_, cb)
    cb({ ok = true })
end)

RegisterNUICallback('close', function(_, cb)
    closeDeathScreen()
    cb({ ok = true })
end)

RegisterNUICallback('freecam', function(_, cb)
    if not Config.EnableFreecam then
        cb({ ok = false })
        return
    end
    toggleFreecam()
    cb({ ok = true, active = freecamActive })
end)

RegisterNUICallback('dispatch', function(_, cb)
    local ok, reason = handleDispatch()
    cb({ ok = ok, reason = reason })
end)

RegisterNUICallback('respawn', function(_, cb)
    cb({ ok = handleRespawn() })
end)

RegisterNUICallback('timerExpired', function(_, cb)
    bleedUnlockAt = 0
    TriggerServerEvent('emydigital-deathscreen:server:timerExpired')
    cb({ ok = true })
end)

-- Public API

exports('OpenDeathScreen', openDeathScreen)
exports('CloseDeathScreen', closeDeathScreen)
exports('IsDeathScreenOpen', function()
    return isDead
end)

RegisterNetEvent('emydigital-deathscreen:client:open', openDeathScreen)
RegisterNetEvent('emydigital-deathscreen:client:close', closeDeathScreen)
RegisterNetEvent('emydigital-deathscreen:client:freecam', toggleFreecam)

RegisterNetEvent('emydigital-deathscreen:client:updateTimer', function(seconds)
    if not isDead then return end
    local remaining = math.max(0, tonumber(seconds) or 0)
    bleedUnlockAt = GetGameTimer() + (remaining * 1000)
    sendNui('updateTimer', { timer = remaining })
end)

-- Dev helper — remove in production if desired
RegisterCommand('testdeath', function()
    if isDead then
        closeDeathScreen()
    else
        openDeathScreen({
            timer = Config.BleedOutTime,
            playerName = GetPlayerName(PlayerId()) or 'Player',
        })
    end
end, false)
