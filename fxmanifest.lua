fx_version 'cerulean'
game 'gta5'

name 'emydigital-deathscreen'
author 'EMY Digital'
description 'EMY Digital Death Screen V1'
version '1.0.1'

lua54 'yes'

shared_scripts {
    'config.lua',
}

client_scripts {
    'client.lua',
}

server_scripts {
    'server.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/**/*',
}
