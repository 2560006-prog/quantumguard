// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FarmerIdentity {
    
    struct Farmer {
        string  farmerId;
        bytes32 identityHash;
        uint256 registeredAt;
        bool    exists;
    }

    mapping(string => Farmer) private farmers;
    address public owner;

    event FarmerRegistered(
        string indexed farmerId,
        bytes32 identityHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Called when farmer completes registration
    function registerFarmer(
        string memory farmerId,
        string memory name,
        string memory mobile,
        string memory aadhaarLast4
    ) external onlyOwner {
        require(!farmers[farmerId].exists, "Farmer already registered");

        // Create identity hash from farmer data
        bytes32 hash = keccak256(
            abi.encodePacked(farmerId, name, mobile, aadhaarLast4, block.timestamp)
        );

        farmers[farmerId] = Farmer({
            farmerId:      farmerId,
            identityHash:  hash,
            registeredAt:  block.timestamp,
            exists:        true
        });

        emit FarmerRegistered(farmerId, hash, block.timestamp);
    }

    // Verify a farmer's identity — called from blockchain details page
    function verifyFarmer(string memory farmerId)
        external view
        returns (bool exists, bytes32 identityHash, uint256 registeredAt)
    {
        Farmer memory f = farmers[farmerId];
        return (f.exists, f.identityHash, f.registeredAt);
    }

    // Get owner address
    function getOwner() external view returns (address) {
        return owner;
    }
}