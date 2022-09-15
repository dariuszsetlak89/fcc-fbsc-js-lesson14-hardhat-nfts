const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Unit Tests", () => {
          let randomIpfsNft, deployer, vrfCoordinatorV2Mock;

          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["mocks", "randomipfs"]);
              randomIpfsNft = await ethers.getContract("RandomIpfsNft");
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
          });

          describe("constructor", () => {
              it("Sets starting values correctly", async () => {
                  const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0);
                  const dogTokenUriOne = await randomIpfsNft.getDogTokenUris(1);
                  const dogTokenUriTwo = await randomIpfsNft.getDogTokenUris(2);
                  const isInitialized = await randomIpfsNft.getInitialized();
                  assert(dogTokenUriZero.includes("ipfs://"));
                  assert(dogTokenUriOne.includes("ipfs://"));
                  assert(dogTokenUriTwo.includes("ipfs://"));
                  assert.equal(isInitialized, true);
              }); // need more tests here
          });

          describe("requestNft", () => {
              it("Fails if payment isn't sent with the request", async () => {
                  const mintFee = 0; // optional - can be omitted
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  );
              });
              it("Reverts if payment amount is less than the mint fee", async () => {
                  const mintFee = (await randomIpfsNft.getMintFee()).sub(
                      ethers.utils.parseEther("0.001")
                  ); // mintFee is less than required
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  );
              });
              it("Emits an event and kicks off a random word request", async () => {
                  const mintFee = await randomIpfsNft.getMintFee();
                  await expect(randomIpfsNft.requestNft({ value: mintFee.toString() })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  ); // expect(function_call).to.emit(contractAddress, "message") - Waffle
              });
          });

          describe("fulfillRandomWords", () => {
              it("Mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI("0");
                              const tokenCounter = await randomIpfsNft.getTokenCounter();
                              assert.equal(tokenUri.toString().includes("ipfs://"), true);
                              assert.equal(tokenCounter.toString(), "1");
                              resolve();
                          } catch (e) {
                              console.log(e);
                              reject(e);
                          }
                      });
                      try {
                          const mintFee = await randomIpfsNft.getMintFee();
                          const requestNftResponse = await randomIpfsNft.requestNft({
                              value: mintFee.toString(),
                          });
                          const requestNftReceipt = await requestNftResponse.wait(1);
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          );
                      } catch (e) {
                          console.log(e);
                          reject(e);
                      }
                  });
              });
          });

          describe("getBreedFromModdedRng", () => {
              it("Should return pug if moddedRng < 10", async () => {
                  const expectedValue = await randomIpfsNft.getBreedFromModdedRng(9);
                  assert.equal(0, expectedValue);
              });
              it("Should return shiba-inu if moddedRng is between 10 - 39", async () => {
                  const expectedValue = await randomIpfsNft.getBreedFromModdedRng(39);
                  assert.equal(1, expectedValue);
              });
              it("Should return st. bernard if moddedRng is between 40 - 99", async () => {
                  const expectedValue = await randomIpfsNft.getBreedFromModdedRng(99);
                  assert.equal(2, expectedValue);
              });
              it("Should revert if moddedRng > 99", async () => {
                  await expect(randomIpfsNft.getBreedFromModdedRng(100)).to.be.revertedWith(
                      "RangeOutOfBounds"
                  );
              });
          });
      });
