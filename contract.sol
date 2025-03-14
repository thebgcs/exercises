// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import OpenZeppelin's ReentrancyGuard for protection against reentrancy attacks.
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @notice Minimal ERC20 interface to check token balances.
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/// @title EthAndTokenWallet
/// @notice This contract holds ETH and ERC20 tokens, allowing deposits from anyone,
/// and implements a withdrawal function with different behavior for the owner and non-owners.
contract EthAndTokenWallet is ReentrancyGuard {
    address public owner;

    // Minimum ETH amount (in wei) that a non-owner withdrawal must meet.
    // This prevents situations where very small amounts are repeatedly withdrawn.
    uint256 public constant MIN_NON_OWNER_WITHDRAWAL = 0.01 ether;

    /// @notice Sets the contract deployer as the owner.
    constructor() {
        owner = msg.sender;
    }

    /// @notice Receive function to accept ETH transfers.
    receive() external payable {}

    /// @notice Fallback function to accept ETH.
    fallback() external payable {}

    /// @notice Returns the ETH balance held by the contract.
    function getEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Returns the balance of a specified ERC20 token held by the contract.
    /// @param tokenAddress The address of the ERC20 token.
    function getTokenBalance(address tokenAddress) public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    /// @notice Withdraws ETH from the contract.
    /// @dev The owner can withdraw all ETH. Non-owner wallets can only withdraw 10% of the total ETH,
    /// provided that 10% meets a minimum threshold.
    function withdraw() public nonReentrant {
        uint256 totalBalance = address(this).balance;
        require(totalBalance > 0, "No ETH available for withdrawal");

        if (msg.sender == owner) {
            // Owner withdrawal: send all available ETH.
            (bool success, ) = owner.call{value: totalBalance}("");
            require(success, "Owner transfer failed");
        } else {
            // Non-owner withdrawal: send only 10% of the total ETH.
            uint256 amountToWithdraw = totalBalance / 10;
            require(amountToWithdraw >= MIN_NON_OWNER_WITHDRAWAL, "Withdrawal amount is below the minimum threshold");
            (bool success, ) = msg.sender.call{value: amountToWithdraw}("");
            require(success, "Non-owner transfer failed");
        }
    }
}