Solana course

get airdrop by solana cli:

```
solana airdrop 2 <pubkey> --url devnet
```

create token by spl-token-cli:

```
spl-token create-token --url devnet
```

create an account for storing the token

```
spl-token create-account <token_address> --url devnet
```

check account balance of the token

```
spl-token balance <token_address> --url devnet
```

mint the token to the account

```
spl-token mint <token_address> <amount> --url devnet
```

check the circulation supply of the token

```
spl-token supply <token_address> --url devnet
```

disable minting - limit the supply

```
spl-token authorize <token_address> mint --disable --url devnet
```

burn the token of specified account

```
spl-token burn <account> <amount> --url devnet
```

transfer token to other account

```
spl-token transfer <token_address> <amount> <recipient_pub_key> --url devnet --allow-unfunded-recipient --fund-recipient
```
