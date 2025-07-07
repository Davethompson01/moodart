import { getPublicClient, getWalletClient } from '@wagmi/core';
import { parseEther } from 'viem';
import { NETWORK_CONFIG, CONTRACT_ADDRESSES, PLATFORM_CONFIG } from '../config/networks';
import { ImageCompressionService } from './ImageCompressionService';

// Define Monad testnet chain
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
  testnet: true,
} as const;

// Simplified contract ABI - only essential functions
const NFT_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "imageData", "type": "string"},
      {"internalType": "string", "name": "mood", "type": "string"},
      {"internalType": "string", "name": "metadataURI", "type": "string"}
    ],
    "name": "mintNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINTING_FEE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export class ContractService {
  async mintNFT(imageData: string, mood: string, config: any, chainId: number) {
    try {
      console.log('🚀 Starting NFT mint process...');
      console.log('📋 Contract Address:', CONTRACT_ADDRESSES.MOOD_ART_NFT);
      
      // Get clients
      const walletClient = await getWalletClient(config);
      const publicClient = getPublicClient(config);
      
      if (!walletClient) {
        throw new Error('No wallet connected');
      }
      
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      console.log('💰 Wallet Address:', walletClient.account.address);
      console.log('🔗 Chain ID:', chainId);

      const contractAddress = CONTRACT_ADDRESSES.MOOD_ART_NFT as `0x${string}`;
      
      // Validate contract address format
      if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
        throw new Error(`Invalid contract address: ${contractAddress}`);
      }

      // Validate chain ID
      const expectedChainId = 10143;
      if (chainId !== expectedChainId) {
        throw new Error(`Wrong network. Expected Monad Testnet (${expectedChainId}), got ${chainId}`);
      }

      // Check wallet balance first
      const balance = await publicClient.getBalance({
        address: walletClient.account.address
      });
      console.log('💰 Current Balance:', balance.toString(), 'wei');

      // Get minting fee with better error handling
      let mintingFee: bigint;
      try {
        console.log('📊 Fetching minting fee from contract...');
        mintingFee = await publicClient.readContract({
          address: contractAddress,
          abi: NFT_CONTRACT_ABI,
          functionName: 'MINTING_FEE',
        }) as bigint;
        console.log('💸 Contract Minting Fee:', mintingFee.toString(), 'wei');
      } catch (feeError) {
        console.error('❌ Failed to get fee from contract:', feeError);
        // Use the known fee from the contract (0.2 MON)
        mintingFee = parseEther('0.2');
        console.log('💸 Using hardcoded fee:', mintingFee.toString(), 'wei');
      }

      // Validate sufficient balance
      if (balance < mintingFee) {
        const balanceEth = Number(balance) / 1e18;
        const feeEth = Number(mintingFee) / 1e18;
        throw new Error(`Insufficient balance. Need ${feeEth} MON, have ${balanceEth} MON`);
      }

      // Validate inputs more strictly
      if (!imageData || typeof imageData !== 'string' || imageData.length < 10) {
        throw new Error('Invalid image data - must be a valid base64 string');
      }
      
      if (!mood || typeof mood !== 'string' || mood.trim().length === 0) {
        throw new Error('Invalid mood - cannot be empty');
      }

      // COMPRESS IMAGE DATA TO REDUCE GAS COSTS
      console.log('🗜️ Compressing image data to reduce gas costs...');
      console.log('📊 Original image size:', imageData.length, 'bytes');
      
      const compressedImageData = await ImageCompressionService.compressImage(imageData);
      console.log('📊 Compressed image size:', compressedImageData.length, 'bytes');
      console.log('💰 Estimated gas cost:', ImageCompressionService.estimateGasCost(compressedImageData.length));

      console.log('📝 Final parameters:');
      console.log('- Compressed image data length:', compressedImageData.length);
      console.log('- Mood:', mood);
      console.log('- Fee:', mintingFee.toString());

      // Test contract call first (simulate)
      console.log('🧪 Simulating transaction...');
      try {
        await publicClient.simulateContract({
          address: contractAddress,
          abi: NFT_CONTRACT_ABI,
          functionName: 'mintNFT',
          args: [compressedImageData, mood, ''],
          value: mintingFee,
          account: walletClient.account.address,
        });
        console.log('✅ Transaction simulation successful');
      } catch (simError: any) {
        console.error('❌ Simulation failed:', simError);
        
        // More specific error messages based on simulation failure
        if (simError.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds for transaction');
        }
        if (simError.message?.includes('Image data cannot be empty')) {
          throw new Error('Image data validation failed');
        }
        if (simError.message?.includes('Mood cannot be empty')) {
          throw new Error('Mood validation failed');
        }
        if (simError.message?.includes('Insufficient minting fee')) {
          throw new Error('Minting fee too low');
        }
        
        throw new Error(`Contract simulation failed: ${simError.message || 'Unknown error'}`);
      }

      // Estimate gas with higher limit
      console.log('⛽ Estimating gas...');
      let gasEstimate: bigint;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          address: contractAddress,
          abi: NFT_CONTRACT_ABI,
          functionName: 'mintNFT',
          args: [compressedImageData, mood, ''],
          value: mintingFee,
          account: walletClient.account.address,
        });
        console.log('⛽ Gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.error('❌ Gas estimation failed:', gasError);
        // Use a reasonable default gas limit for compressed data
        gasEstimate = BigInt(150000);
        console.log('⛽ Using default gas limit:', gasEstimate.toString());
      }

      // Send transaction with explicit gas limit
      console.log('📤 Sending transaction...');
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: NFT_CONTRACT_ABI,
        functionName: 'mintNFT',
        args: [compressedImageData, mood, ''],
        value: mintingFee,
        gas: gasEstimate * BigInt(120) / BigInt(100), // Add 20% buffer
        account: walletClient.account,
        chain: monadTestnet,
      });

      console.log('✅ Transaction submitted:', hash);

      // Wait for confirmation
      console.log('⏳ Waiting for confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60000
      });
      
      console.log('🎉 Transaction confirmed!');
      console.log('📊 Gas used:', receipt.gasUsed?.toString());
      console.log('✅ Status:', receipt.status);
      
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted by network');
      }
      
      return receipt;
      
    } catch (error: any) {
      console.error('❌ Minting error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        cause: error.cause
      });
      
      // Enhanced error mapping
      if (error.message?.includes('User rejected')) {
        throw new Error('Transaction cancelled by user');
      }
      
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient MON balance for transaction');
      }
      
      if (error.message?.includes('Wrong network')) {
        throw new Error('Please switch to Monad Testnet in your wallet');
      }
      
      if (error.message?.includes('Contract simulation failed')) {
        throw new Error('Smart contract rejected the transaction. Please check your inputs.');
      }
      
      // Generic fallback
      throw new Error(error.message || 'Transaction failed. Please try again.');
    }
  }

  async getMintingFee(config: any) {
    try {
      const publicClient = getPublicClient(config);
      
      if (!publicClient) {
        console.log('📊 No public client, using fallback fee');
        return PLATFORM_CONFIG.MINTING_FEE_MON;
      }

      const fee = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.MOOD_ART_NFT as `0x${string}`,
        abi: NFT_CONTRACT_ABI,
        functionName: 'MINTING_FEE',
      }) as bigint;
      
      const feeInEther = (Number(fee) / 1e18).toString();
      console.log('📊 Minting fee from contract:', feeInEther, 'MON');
      return feeInEther;
    } catch (error) {
      console.error('❌ Error getting minting fee:', error);
      return PLATFORM_CONFIG.MINTING_FEE_MON;
    }
  }

  async imageToBase64(imageUrl: string): Promise<string> {
    try {
      console.log('🖼️ Converting image to base64:', imageUrl);
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('🖼️ Image blob size:', blob.size, 'bytes');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          console.log('🖼️ Base64 conversion complete, length:', result.length);
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to convert image to base64'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error converting image to base64:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();
