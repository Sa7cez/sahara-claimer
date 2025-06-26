## Magic Newton

Magic Newton tools:

1. Login/Register
2. Claim quests
3. Play games (Dice & Minesweeper)

Setup config settings: copy and rename `config_example` to `config` folder and setup needed files

## Files

- `credentials/keys.txt` - private keys list
- `credentials/proxies.txt` - proxies list

## Database

- `stores` - this folder contains saved sessions and files, which may include PRIVATE KEYS. Delete files if you do not plan to use the script anymore.

## Start modes

- `npm run start` - register account from keys.txt
- `npm run stats` - show stats
- `npm run login` - login to accounts from database and create sessions
- `npm run full` - login/register, claim quests, play games
- `npm run games` - play games on accounts
- `npm run portal` - login/register and claim quests without games

## One line

```bash

cd magic-newton && pnpm install

```

## OR Setup bot

1. Download ZIP and extract it to a folder (or better use [git](https://git-scm.com/) for getting updates)
2. Install [node.js](https://nodejs.org/en/) (LTS) and [pnpm](https://pnpm.io/installation) package manager
3. Open folder with the bot in `terminal` or `cmd`

```bash

cd <path to folder with script>

```

4. Install dependencies

```bash

pnpm install

```

## Donate

EVM: `0xac1c08185ba23b28ac0c723abbb93ab9dc00dead`
SOL: `3zSUYrN8TkppuC9mCAzeaGYHgsZAn3n4rtCqxh9xhab8`
TRX: `TWFHnhMcYsRFTsjL1ADjMvVAX91TyuJFgq`
BYBIT: `750222`
