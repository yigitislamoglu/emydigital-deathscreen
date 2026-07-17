Config = {}

-- Framework: 'auto' | 'standalone' | 'esx' | 'qb' | 'qbx'
-- 'auto' detects qbx_core → qb-core → es_extended → standalone
Config.Framework = 'auto'

-- Seconds until bleed-out / auto-respawn signal
Config.BleedOutTime = 300

-- Keep mouse + keyboard focus on the NUI while dead
Config.NuiFocus = true

Config.EnableMinigame = true
Config.EnableFreecam = true
Config.EnableDispatch = true
Config.EnableRespawn = true

-- Minimum time between dispatch calls (ms)
Config.DispatchCooldown = 30000

Config.RespawnKey = 'E'
Config.FreecamKey = 'F'
Config.DispatchKey = 'G'

-- Fallback hospital spawn (standalone revive)
Config.RespawnCoords = vector4(298.0, -584.0, 43.0, 70.0)

-- Keep in sync with web/src/utils/config.ts, or override via open payload
Config.Locale = {
    titleLine1 = 'PLAYER NAME',
    titleLine2 = 'UNCONSCIOUS',
    timerLabel = 'Time remaining until respawn:',
    press = 'Press',
    locked = 'Locked',
    freecam = 'Free Camera',
    dispatch = 'Send Signal',
    respawn = 'Give Up',
    minigame = 'Minigame',
}

local detectedFramework

--- Returns active framework. With Config.Framework = 'auto', resolves once from running resources.
function GetFramework()
    if Config.Framework ~= 'auto' then
        return Config.Framework
    end

    if detectedFramework then
        return detectedFramework
    end

    if GetResourceState('qbx_core') == 'started' then
        detectedFramework = 'qbx'
    elseif GetResourceState('qb-core') == 'started' then
        detectedFramework = 'qb'
    elseif GetResourceState('es_extended') == 'started' then
        detectedFramework = 'esx'
    else
        detectedFramework = 'standalone'
    end

    return detectedFramework
end
