import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("Donation", () => {
  async function setupFixture() {
    const [owner, john, alice] = await ethers.getSigners()
    const Donation = await ethers.getContractFactory("Donation")
    const donationContract = await Donation.deploy()
    await donationContract.deployed()
    return {
      donationContract,
      owner,
      john,
      alice,
    }
  }

  describe("Donation Receive", () => {
    it("should receive a donation", async () => {
      const { donationContract } = await loadFixture(setupFixture)

      const value = ethers.utils.parseEther("0.01")
      await donationContract.donate({ value })

      const total = await donationContract.total()
      expect(total).to.equal(value)
    })
    it("should not receive a donation if value is 0 or less", async () => {
      const { donationContract } = await loadFixture(setupFixture)

      const value = ethers.utils.parseEther("0")

      await expect(donationContract.donate({ value })).to.rejectedWith(
        "value cannot be 0 or less"
      )
    })
    it("should return balance equal 0 if hasn't donations", async () => {
      const { donationContract } = await loadFixture(setupFixture)

      const balance = await ethers.provider.getBalance(donationContract.address)
      expect(balance.toString()).to.equal("0")
    })
    it("should return balance equal 0.05", async () => {
      const { donationContract } = await loadFixture(setupFixture)

      const value = ethers.utils.parseEther("0.05")
      await donationContract.donate({ value })

      const balance = await ethers.provider.getBalance(donationContract.address)
      expect(balance).to.equal(value)
    })
  })
  describe("Donation List", () => {
    it("should have 2 donations", async () => {
      const { donationContract, alice, john } = await loadFixture(setupFixture)

      const value = ethers.utils.parseEther("0.01")
      await donationContract.connect(alice).donate({ value })
      await donationContract.connect(john).donate({ value })

      const donations = await donationContract.getDonations()
      expect(donations).to.have.length(2)
    })
    it("should have donor address is correct", async () => {
      const { donationContract, alice } = await loadFixture(setupFixture)

      const value = ethers.utils.parseEther("0.01")
      await donationContract.connect(alice).donate({ value })

      const [donation] = await donationContract.getDonations()
      expect(donation.donor).to.equal(alice.address)
      expect(donation.value).to.equal(value)
    })
  })
  describe("Donation Withdraw", () => {
    it("shouldn't withdraw if isn't owner", async () => {
      const { donationContract, alice } = await loadFixture(setupFixture)

      const value = ethers.utils.parseEther("0.01")
      await donationContract.connect(alice).donate({ value })

      await expect(donationContract.connect(alice).withdraw()).to.rejectedWith(
        "not owner"
      )
    })
    it("should return message 'balance not enough'", async () => {
      const { donationContract } = await loadFixture(setupFixture)

      await expect(donationContract.withdraw()).to.rejectedWith(
        "balance cannot be 0 or less"
      )
    })
    it("should do withdraw if is owner", async () => {
      const { donationContract, alice } = await loadFixture(setupFixture)

      const value = ethers.utils.parseEther("0.01")
      await donationContract.connect(alice).donate({ value })

      const balanceInit = await ethers.provider.getBalance(
        donationContract.address
      )
      expect(balanceInit).to.equal(value)

      await donationContract.withdraw()
      
      const balanceEnd = await ethers.provider.getBalance(
        donationContract.address
      )
      expect(balanceEnd.toString()).to.equal("0")
    })
  })
})
