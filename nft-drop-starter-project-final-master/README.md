# Solana NFT Drop Project (adapted from Buildspace)

### Welcome 👋

To run this project, clone this repo and follow these commands:

1. cd into the `app` folder
2. Run `npm install` at the root of your directory
3. Set up your .env file in the `/app` directory as follows

```
REACT_APP_CANDY_MACHINE_ID=<YOUR CANDY MACHINE ID GOES HERE>
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_HOST=https://explorer-api.devnet.solana.com
```

4. Run `npm run start` to start the project

Metaplex version 2:
https://docs.metaplex.com/deprecated/candy-machine-js-cli/getting-started

upload command

```
ts-node <path-to-cli>/candy-machine-v2-cli.ts upload -e devnet -k <path-to-solana-devnet-config> -cp config.json ./assets
```

verify command

```
ts-node <path-to-cli>/candy-machine-v2-cli.ts verify_upload -e devnet -k <path-to-solana-devnet-config>
```

Sugar cli:
https://docs.metaplex.com/developer-tools/sugar/

create config

```
sugar create-config
```

upload command

```
suger upload
super deploy
```

verify command

```
sugar verify
```

Candy Machine UI template (TypeScript)
https://github.com/metaplex-foundation/candy-machine-ui
