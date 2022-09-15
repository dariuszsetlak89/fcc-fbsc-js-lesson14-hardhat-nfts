const { network } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");

const FUND_AMOUNT = "1000000000000000000000"; // 10 LINK ethers.parseUnit
const imagesLocation = "./images/randomNft/";
let tokenUris = [
    "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
    "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
    "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
];

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
};

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let vrfCoordinatorV2Address, subscriptionId;

    // Get the IPFS hashes of our images:
    // 1. With our own IPFS node - manually or programaticly (docs.ipfs.io -> Command.line or scripts).
    //    But if we are only IPFS node, it's kind of centralized solution.
    //    Ideally we want our images, tokenURIs and token metadata on our own IPFS node and some other nodes.
    // 2. Pinata - https://www.pinata.cloud/
    //    It is a service, where you pay, and they pin your NFT - centralized service, have to trust them.
    // 3. NFT Storage - https://nft.storage/
    //    It is a service, which uses Filecoin in backend to pin our data and store decentralized data for us.
    //    /utils/uploadToNftStorage.js script
    //    NFT Storage is the most persistent way to keep our data up.

    // We use solution 2 - Pinata
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    if (developmentChains.includes(network.name)) {
        // Create VRFV2 Subscription
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait();
        subscriptionId = transactionReceipt.events[0].args.subId;
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    // Deploy contract
    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].mintFee,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
    ];
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(randomIpfsNft.address, args);
    }

    async function handleTokenUris() {
        tokenUris = [];
        // 1. Store the Image in IPFS / Pinata
        const { responses: imageUploadResponses, files } = await storeImages(imagesLocation);
        // 2. Store the metadata in IPFS / Pinata
        for (imageUploadResponseIndex in imageUploadResponses) {
            let tokenUriMetadata = { ...metadataTemplate };
            tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
            tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
            tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
            console.log(`Uploading ${tokenUriMetadata.name}...`);
            const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
            tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
        }
        console.log("Token URIs uploaded! They are:");
        console.log(tokenUris);
        return tokenUris;
    }

    log("-------------------------------------------------------");
};

module.exports.tags = ["all", "randomipfs", "main"];
