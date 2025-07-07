import { useState, useEffect } from 'react';
import { useAccount, useBalance, useConfig, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Loader2, Wallet, Zap, CheckCircle, AlertCircle, RefreshCw, Minimize2 } from 'lucide-react';
import { contractService } from '@/services/ContractService';

interface MintNFTProps {
  imageUrl: string;
  metadata: any;
  mood: string;
  onMintSuccess?: () => void;
}

const Button = ({ children, onClick, disabled = false, className = "" }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }: any) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const MintNFT = ({ imageUrl, metadata, mood, onMintSuccess }: MintNFTProps) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintingFee, setMintingFee] = useState('0.2');
  const [estimatedGasPrice, setEstimatedGasPrice] = useState('0.001');
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState<string>('');
  const { address, isConnected } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const config = useConfig();
  const chainId = useChainId();

  useEffect(() => {
    const getFee = async () => {
      try {
        console.log('🔄 Fetching minting fee...');
        const fee = await contractService.getMintingFee(config);
        setMintingFee(fee);
        console.log('✅ Minting fee updated:', fee);
      } catch (error) {
        console.error('❌ Error getting minting fee:', error);
        setMintingFee('0.2'); // Fallback
      }
    };
    
    if (isConnected) {
      getFee();
    }
  }, [config, isConnected]);

  const totalCost = parseEther(mintingFee) + parseEther(estimatedGasPrice);

  const handleMint = async () => {
    if (!isConnected || !address) {
      setMintError('Please connect your wallet first');
      return;
    }

    // Refresh balance before checking
    await refetchBalance();

    if (!balance || balance.value < totalCost) {
      setMintError(`Insufficient balance to mint NFT. You need at least ${formatEther(totalCost)} MON`);
      return;
    }

    if (!imageUrl || !mood) {
      setMintError('Image and mood are required to mint NFT');
      return;
    }

    setIsMinting(true);
    setMintError(null);
    setMintSuccess(false);
    setCompressionStatus('');
    
    try {
      console.log('🚀 Starting NFT mint process...');
      console.log('📊 Pre-mint validation:', {
        imageUrl: imageUrl.substring(0, 50) + '...',
        mood,
        address,
        balance: balance.formatted,
        mintingFee,
        chainId
      });
      
      // Convert image to base64 with compression status
      console.log('🖼️ Converting and compressing image...');
      setCompressionStatus('Compressing image to reduce gas costs...');
      
      const imageData = await contractService.imageToBase64(imageUrl);
      
      console.log('✅ Image processed, proceeding with mint...');
      setCompressionStatus('Creating optimized NFT...');
      
      // Call the contract service with chainId
      const receipt = await contractService.mintNFT(imageData, mood, config, chainId);
      
      console.log('🎉 NFT minted successfully!', receipt);
      setMintSuccess(true);
      setRetryCount(0);
      setCompressionStatus('');
      onMintSuccess?.();
      
    } catch (error: any) {
      console.error('❌ Minting failed:', error);
      setRetryCount(prev => prev + 1);
      setCompressionStatus('');
      
      let errorMessage = 'Failed to mint NFT. Please try again.';
      
      // More specific error handling
      if (error.message?.includes('User rejected') || error.message?.includes('cancelled by user')) {
        errorMessage = 'Transaction was cancelled. Please try again when ready.';
      } else if (error.message?.includes('Insufficient MON balance')) {
        errorMessage = 'You need more MON tokens to complete this transaction.';
      } else if (error.message?.includes('switch to Monad Testnet')) {
        errorMessage = 'Please switch your wallet to Monad Testnet network.';
      } else if (error.message?.includes('Smart contract rejected')) {
        errorMessage = 'The smart contract rejected your transaction. Please check your inputs.';
      } else if (error.message?.includes('missing revert data') || error.message?.includes('simulation failed')) {
        errorMessage = 'Network error occurred. This might be temporary - please try again in a moment.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMintError(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  const handleRetry = () => {
    setMintError(null);
    handleMint();
  };

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet to Mint
          </CardTitle>
          <CardDescription className="text-purple-200">
            You need to connect your wallet before you can mint this NFT
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasInsufficientBalance = !balance || balance.value < totalCost;

  if (mintSuccess) {
    return (
      <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            NFT Minted Successfully!
          </CardTitle>
          <CardDescription className="text-green-200">
            Your mood art has been minted as an NFT on Monad testnet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {/* <Zap className="w-5 h-5" /> */}
          Mint Your NFT on Monad
        </CardTitle>
        <CardDescription className="text-white">
          Transform your mood art into a unique NFT on Monad testnet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network status indicator */}
        {/* <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2 text-center">
          <p className="text-white text-xs">
            🌐 Connected to Monad Testnet (Chain ID: {chainId})
          </p>
        </div> */}

        {/* Compression info */}
        {/* <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Minimize2 className="w-4 h-4 text-green-200" />
            <span className="text-white text-sm font-medium">Gas Optimization Enabled</span>
          </div>
          <p className="text-white text-xs">
            Images are automatically compressed to ~15KB to minimize gas costs and make minting affordable.
          </p>
        </div> */}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-white">Gas Fee (Est.)</p>
            <p className="text-white font-medium">{estimatedGasPrice} MON</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-white">Platform Fee</p>
            <p className="text-white font-medium">{mintingFee} MON</p>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-3 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <span className="text-white">Total Cost:</span>
            <span className="text-white font-bold">{formatEther(totalCost)} MON</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-white text-sm">Your Balance:</span>
            <span className={`text-sm ${hasInsufficientBalance ? 'text-red-400' : 'text-green-300'}`}>
              {balance ? formatEther(balance.value) : '0'} MON
            </span>
          </div>
        </div>

        {compressionStatus && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <p className="text-blue-200 text-sm">{compressionStatus}</p>
            </div>
          </div>
        )}

        {mintError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-200 text-sm">{mintError}</p>
                {retryCount > 0 && (
                  <p className="text-red-300 text-xs mt-1">
                    Attempt #{retryCount} - If this persists, try refreshing the page
                  </p>
                )}
              </div>
            </div>
            {retryCount < 3 && !mintError.includes('cancelled') && (
              <Button
                onClick={handleRetry}
                className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white text-xs h-8"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        )}

        {hasInsufficientBalance && !mintError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-white text-sm">
              ⚠️ Insufficient balance. You need at least {formatEther(totalCost)} MON to mint this NFT.
            </p>
          </div>
        )}

        <Button
          onClick={handleMint}
          disabled={isMinting || hasInsufficientBalance}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white"
        >
          {isMinting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {compressionStatus || 'Minting NFT...'}
            </>
          ) : hasInsufficientBalance ? (
            'Insufficient Balance'
          ) : (
            `Mint NFT for ${formatEther(totalCost)} MON`
          )}
        </Button>
        
        <p className="text-xs text-white text-center">
          * Images compressed for optimal gas efficiency • Gas fees may vary
          {retryCount > 0 && ` • Retries: ${retryCount}`}
        </p>
      </CardContent>
    </Card>
  );
};
