fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Lunar Scripts'
description 'Advanced Fishing'
version '1.0.1'

ui_page {
	'web/index.html',
}
files {
    'locales/*.json',
    'web/*.js',
    'web/*.css',
    'web/*.html',
    'web/assets/*.svg'
}

shared_scripts {
    '@ox_lib/init.lua',
    'config/config.lua'
}

client_scripts {
    'framework/**/client.lua',
    'utils/cl_main.lua',
    'config/cl_edit.lua',
    'client/*.lua'
}

server_scripts {
    'framework/**/server.lua',
    '@oxmysql/lib/MySQL.lua',
    'utils/sv_main.lua',
    'config/sv_config.lua',
    'locales/*.lua',
    'server/*.lua'
}
