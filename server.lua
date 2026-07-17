--[[
    Server stubs — wire these into your EMS / hospital / framework.
]]

local function getPlayerDisplayName(src)
    return GetPlayerName(src) or ('ID %s'):format(src)
end

CreateThread(function()
    print(('[emydigital-deathscreen] framework: %s'):format(GetFramework()))
end)

--[[
    Example open from another resource:
      TriggerClientEvent('emydigital-deathscreen:client:open', src, {
          timer = Config.BleedOutTime,
          playerName = 'John Doe',
      })

    Close:
      TriggerClientEvent('emydigital-deathscreen:client:close', src)
]]

RegisterNetEvent('emydigital-deathscreen:server:dispatch', function()
    local src = source
    -- Hook EMS / phone / ps-dispatch here. Spam guard: Config.DispatchCooldown (client)
    print(('[emydigital-deathscreen] dispatch from %s (%s)'):format(
        getPlayerDisplayName(src), src
    ))
end)

RegisterNetEvent('emydigital-deathscreen:server:respawn', function()
    local src = source
    -- Hook inventory loss / bill / hospital teleport / revive exports here
    print(('[emydigital-deathscreen] respawn from %s (%s)'):format(
        getPlayerDisplayName(src), src
    ))
end)

RegisterNetEvent('emydigital-deathscreen:server:timerExpired', function()
    local src = source
    -- Hook forced hospital / auto-respawn when the bleed-out timer hits 0
    print(('[emydigital-deathscreen] timer expired for %s (%s)'):format(
        getPlayerDisplayName(src), src
    ))
end)

--[[
    Framework death bridges (examples):

    ESX:
      AddEventHandler('esx:onPlayerDeath', function()
          local src = source
          TriggerClientEvent('emydigital-deathscreen:client:open', src, {
              timer = Config.BleedOutTime,
              playerName = getPlayerDisplayName(src),
          })
      end)

    QBCore / Qbox:
      -- Usually triggered from your ambulance / death handler via client:open
]]
