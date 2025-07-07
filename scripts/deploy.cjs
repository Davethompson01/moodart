
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MoodArtNFT contract...");

  const MoodArtNFT = await ethers.getContractFactory("MoodArtNFT");

  const platformFeeRecipient = "0x5adec2c7e0ff1e400046a3e9ffa25a4ac66aa972";

  const moodArtNFT = await MoodArtNFT.deploy(platformFeeRecipient);

  await moodArtNFT.waitForDeployment();

  const contractAddress = await moodArtNFT.getAddress();
  console.log("MoodArtNFT deployed to:", contractAddress);
  console.log("Platform fee recipient:", platformFeeRecipient);
  console.log("Minting fee:", ethers.formatEther(await moodArtNFT.MINTING_FEE()), "MON");

  console.log("\nVerifying deployment...");
  console.log("Contract name:", await moodArtNFT.name());
  console.log("Contract symbol:", await moodArtNFT.symbol());
  console.log("Owner:", await moodArtNFT.owner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
