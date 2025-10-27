const dev = {
    API_ENDPOINT: import.meta.env['VITE_API_ENDPOINT'],
    environment: 'development',
}

export let CONFIG_VARS

if (import.meta.env['VITE_APP_ENVIORNMENT'] === 'development') {
    CONFIG_VARS = dev
    console.log({ CONFIG_VARS })
}
