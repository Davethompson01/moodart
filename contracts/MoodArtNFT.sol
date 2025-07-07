
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MoodArtNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;

    uint256 public constant MINTING_FEE = 200000000000000000;
    
    address public platformFeeRecipient;
    
    struct NFTMetadata {
        string imageData;      
        string mood;           
        uint256 timestamp;     
        address creator;       
    }
    
    mapping(uint256 => NFTMetadata) public tokenMetadata;
    
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string mood,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(uint256 newFee);
    event PlatformFeeRecipientUpdated(address newRecipient);

    constructor(address _platformFeeRecipient) ERC721("MoodArtNFT", "MOOD") Ownable() {
        platformFeeRecipient = _platformFeeRecipient;
    }

    function mintNFT(
        string memory imageData,
        string memory mood,
        string memory metadataURI
    ) external payable {
        require(msg.value >= MINTING_FEE, "Insufficient minting fee");
        require(bytes(imageData).length > 0, "Image data cannot be empty");
        require(bytes(mood).length > 0, "Mood cannot be empty");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(msg.sender, newTokenId);
        
        tokenMetadata[newTokenId] = NFTMetadata({
            imageData: imageData,
            mood: mood,
            timestamp: block.timestamp,
            creator: msg.sender
        });
        
        if (bytes(metadataURI).length > 0) {
            _setTokenURI(newTokenId, metadataURI);
        }
        
        if (msg.value > 0) {
            (bool success, ) = platformFeeRecipient.call{value: msg.value}("");
            require(success, "Failed to transfer platform fee");
        }
        
        emit NFTMinted(newTokenId, msg.sender, mood, block.timestamp);
    }

    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenMetadata[tokenId];
    }

    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    function updatePlatformFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        platformFeeRecipient = newRecipient;
        emit PlatformFeeRecipientUpdated(newRecipient);
    }

    function withdrawExcessETH(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Failed to withdraw ETH");
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function emergencyPause() external onlyOwner {
    }
}
