// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Donation {
    address owner;
    uint256 public total;
    uint256 private ids;
    Donor[] private donations;

    struct Donor {
        uint256 id;
        address donor;
        uint256 value;
    }

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function donate() external payable {
        require(msg.value > 0, "value cannot be 0 or less");
        ids++;
        Donor memory donation = Donor(ids, msg.sender, msg.value);
        donations.push(donation);
        total += msg.value;
    }

    function getDonations() external view returns (Donor[] memory) {
        return donations;
    }

    function withdraw() external payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "balance cannot be 0 or less");

        (bool success,) = (msg.sender).call{value: balance}("");
        require(success, "withdraw failed");
    }
}