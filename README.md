# freeCodeCamp: Full Blockchain Solidity Course JavaScript - Lesson 14: Hardhat NFTs

# Created 3 different kinds of NFTs.

1. A Basic NFT
2. IPFS Hosted NFT 
   1. That uses Randomness to generate a unique NFT
3. SVG NFT (Hosted 100% on-chain) 
   1. Uses price feeds to be dynamic


# Minted NFTs - Goerli Testnet Network

## ✔️ Basic NFT: Dogie [DOG]

[https://goerli.etherscan.io/token/0x95854c1e5affce926426d85fe582bd90cb4e0bd4](https://goerli.etherscan.io/token/0x95854c1e5affce926426d85fe582bd90cb4e0bd4)


## ✔️ Random IPFS NFT: Random IPFS NFT [RIN]

[https://goerli.etherscan.io/token/0xd7685b88253a9535128372f4e79c0d488d95a837](https://goerli.etherscan.io/token/0xd7685b88253a9535128372f4e79c0d488d95a837)


## ✔️ Dynamic SVG NFT: Dynamic SVG NFT [DSN]

[https://goerli.etherscan.io/token/0xb09d609095d12d46d19c4a6cb95297b9dee2cd6e](https://goerli.etherscan.io/token/0xb09d609095d12d46d19c4a6cb95297b9dee2cd6e)


# Contents

- [freeCodeCamp: Full Blockchain Solidity Course JavaScript - Lesson 14: Hardhat NFTs](#freecodecamp-full-blockchain-solidity-course-javascript---lesson-14-hardhat-nfts)
- [Created 3 different kinds of NFTs.](#created-3-different-kinds-of-nfts)
- [Minted NFTs - Goerli Testnet Network](#minted-nfts---goerli-testnet-network)
  - [✔️ Basic NFT: Dogie [DOG]](#️-basic-nft-dogie-dog)
  - [✔️ Random IPFS NFT: Random IPFS NFT [RIN]](#️-random-ipfs-nft-random-ipfs-nft-rin)
  - [✔️ Dynamic SVG NFT: Dynamic SVG NFT [DSN]](#️-dynamic-svg-nft-dynamic-svg-nft-dsn)
- [Contents](#contents)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Quickstart](#quickstart)
- [Useage](#useage)
  - [Testing](#testing)
  - [Test Coverage](#test-coverage)
- [Deployment to a testnet or mainnet](#deployment-to-a-testnet-or-mainnet)
    - [Estimate gas cost in USD](#estimate-gas-cost-in-usd)
  - [Verify on etherscan](#verify-on-etherscan)
- [Linting](#linting)


# Getting Started

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`

## Quickstart

```
git clone git@github.com:dariuszsetlak89/fcc-fbsc-js-lesson14-hardhat-nfts.git
cd fcc-fbsc-js-lesson14-hardhat-nfts
yarn
```

# Useage

Deploy:

```
yarn hardhat deploy
```

## Testing

```
yarn hardhat test
```

## Test Coverage

```
yarn hardhat coverage
```


# Deployment to a testnet or mainnet

1. Setup environment variabltes

You'll want to set your `GOERLI_RPC_URL` and `PRIVATE_KEY` as environment variables. You can add them to a `.env` file.

- `PRIVATE_KEY`: The private key of your account (like from [metamask](https://metamask.io/)). **NOTE:** FOR DEVELOPMENT, PLEASE USE A KEY THAT DOESN'T HAVE ANY REAL FUNDS ASSOCIATED WITH IT.
  - You can [learn how to export it here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).
- `GOERLI_RPC_URL`: This is url of the goerli testnet node you're working with. You can get setup with one for free from [Alchemy](https://alchemy.com/?a=673c802981)

1. Get testnet ETH

Head over to [faucets.chain.link](https://faucets.chain.link/) and get some tesnet ETH & LINK. You should see the ETH and LINK show up in your metamask. [You can read more on setting up your wallet with LINK.](https://docs.chain.link/docs/deploy-your-first-contract/#install-and-fund-your-metamask-wallet)

3. Setup a Chainlink VRF Subscription ID

Head over to [vrf.chain.link](https://vrf.chain.link/) and setup a new subscription, and get a subscriptionId. You can reuse an old subscription if you already have one. 

[You can follow the instructions](https://docs.chain.link/docs/get-a-random-number/) if you get lost. You should leave this step with:

1. A subscription ID
2. Your subscription should be funded with LINK

3. Deploy

In your `helper-hardhat-config.js` add your `subscriptionId` under the section of the chainId you're using (aka, if you're deploying to goerli, add your `subscriptionId` in the `subscriptionId` field under the `5` section.)

Then run:
```
yarn hardhat deploy --network goerli --tags main
```

We only deploy the `main` tags, since we need to add our `RandomIpfsNft` contract as a consumer. 

4. Add your contract address as a Chainlink VRF Consumer

Go back to [vrf.chain.link](https://vrf.chain.link) and under your subscription add `Add consumer` and add your contract address. You should also fund the contract with a minimum of 1 LINK. 

5. Mint NFTs

Then run:

```
yarn hardhat deploy --network goerli --tags mint
```


### Estimate gas cost in USD

To get a USD estimation of gas cost, you'll need a `COINMARKETCAP_API_KEY` environment variable. You can get one for free from [CoinMarketCap](https://pro.coinmarketcap.com/signup). 

Then, uncomment the line `coinmarketcap: COINMARKETCAP_API_KEY,` in `hardhat.config.ts` to get the USD estimation. Just note, everytime you run your tests it will use an API call, so it might make sense to have using coinmarketcap disabled until you need it. You can disable it by just commenting the line back out. 


## Verify on etherscan

If you deploy to a testnet or mainnet, you can verify it if you get an [API Key](https://etherscan.io/myapikey) from Etherscan and set it as an environemnt variable named `ETHERSCAN_API_KEY`. You can pop it into your `.env` file as seen in the `.env.example`.

In it's current state, if you have your api key set, it will auto verify goerli contracts!

However, you can manual verify with:

```
yarn hardhat verify --constructor-args arguments.ts DEPLOYED_CONTRACT_ADDRESS
```

# Linting

To check linting / code formatting:
```
yarn lint
```
or, to fix: 
```
yarn lint:fix
```