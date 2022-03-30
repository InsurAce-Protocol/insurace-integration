/*
    Copyright (C) 2020 InsurAce.io

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/
*/

// SPDX-License-Identifier: GPL-3.0

const { Contract, providers, Wallet } = require('ethers');

// -------------------------------------------------------------------------------------------------
// Configuration
// -------------------------------------------------------------------------------------------------

// The JSON RPC URL that connects to an Ethereum node.
const jsonRpcUrl = '';

// The private key of a wallet that is used to cancel the cover.
const privateKey = '';

// The address of InsurAce Cover contract. Please contact InsurAce team to get the contract address. Different chains have different addresses.
const contractAddress = '';

// The ID of the cover pending to be cancelled.
const coverId = '';

// -------------------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------------------

async function cancelCover(wallet, pendingCancelCoverId) {
  const contractAbi = [
    'function cancelCover(uint256 coverId)',
  ];

  const contract = new Contract(contractAddress, contractAbi, wallet);

  const response = await contract.cancelCover(pendingCancelCoverId);

  const receipt = await response.wait();

  return receipt;
}

// -------------------------------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------------------------------

async function main() {
  const provider = new providers.JsonRpcProvider(jsonRpcUrl);
  const wallet = new Wallet(privateKey, provider);

  console.log(`Cancel cover with ID ${coverId}`);

  const receipt = await cancelCover(wallet, coverId);

  console.log('Cover cancellation successful.');
  console.log(`Transaction hash: ${receipt.transactionHash}`);
}

main();
