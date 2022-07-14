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

const axios = require('axios');
const { Contract, providers, utils, Wallet } = require('ethers');

// -------------------------------------------------------------------------------------------------
// Configuration
// -------------------------------------------------------------------------------------------------

// The JSON RPC URL that connects to an Ethereum node.
const jsonRpcUrl = '';

// The private key of a wallet that is used to purchase this cover.
const privateKey = '';

// The address of InsurAce Cover contract. Please contact InsurAce team to get the contract address.
// Different chains have different addresses.
const contractAddress = '';

// The URL of InsurAce API.
const httpApiUrl = 'https://api.insurace.io/ops/v1';

// The code that allows consumers to access InsurAce API.
const httpApiCode = '';

// The blockchain that the cover purchase transaction is sent to. Valid values are ETH, BSC,
// POLYGON, AVALANCHE.
const chain = 'ETH';

// The address of the token used to specify the cover amount. Please check
// https://api.insurace.io/docs for a list of tokens that can be used to purchase covers.
const coverCurrency = '';

// The address of the token used to purchase this cover. Must be the same as coverCurrency.
const premiumCurrency = '';

// The product IDs for this cover purchase. Can be more than 1 product IDs. Please check
// https://docs.insurace.io/landing-page/documentation/protocol-design/product-design/product-list
// for a complete list of products.
const productIds = [1, 2];

// The cover period (in days) for each product.
const coverDays = [30, 90];

// The cover amount for each product.
const coverAmounts = [utils.parseEther('1000').toString(), utils.parseEther('2000').toString()];

// The wallet addresses protected by the cover for each product. Each product must correspond to
// a wallet addresses (the same wallet address may be specified multiple times).
const coveredAddresses = [];

// The referral code used in this cover purchase, may be null.
const referralCode = null;

// -------------------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------------------

// Visit https://api.insurace.io/docs for detailed API documentation.
async function getCoverPremium(option) {
  const body = {
    chain: option.chain,
    owner: option.owner,
    coverCurrency: option.coverCurrency,
    premiumCurrency: option.premiumCurrency,
    productIds: option.productIds,
    coverDays: option.coverDays,
    coverAmounts: option.coverAmounts,
    coveredAddresses: option.coveredAddresses,
    referralCode: option.referralCode,
  };

  const options = {
    params: {
      code: httpApiCode,
    },
  };

  const { data } = await axios.post(httpApiUrl + '/getCoverPremiumV2', body, options);

  return {
    premium: data.premiumAmount,
    params: data.params,
  };
}

// Visit https://api.insurace.io/docs for detailed API documentation.
async function confirmCoverPremium(option) {
  const body = {
    chain: option.chain,
    params: option.params,
  };

  const options = {
    params: {
      code: httpApiCode,
    },
  };

  const { data } = await axios.post(httpApiUrl + '/confirmCoverPremiumV2', body, options);

  return {
    params: data,
  };
}

async function buyCover(wallet, params) {
  const contractAbi = [
    'function buyCoverV3(uint16[] products, uint16[] durationInDays, uint256[] amounts, address[] addresses, uint256 premiumAmount, uint256 referralCode, uint256[] helperParameters, uint256[] securityParameters, string freeText, uint8[] v, bytes32[] r, bytes32[] s) payable',
  ];

  const contract = new Contract(contractAddress, contractAbi, wallet);

  const response = await contract.buyCoverV3(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9], params[10], params[11]);

  const receipt = await response.wait();

  return receipt;
}

// -------------------------------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------------------------------

async function main() {
  const provider = new providers.JsonRpcProvider(jsonRpcUrl);
  const wallet = new Wallet(privateKey, provider);

  console.log('1. Get premium');

  const premiumInfo = await getCoverPremium({
    chain,
    owner: wallet.address,
    coverCurrency,
    premiumCurrency,
    productIds,
    coverDays,
    coverAmounts,
    coveredAddresses,
    referralCode,
  });

  console.log(`Premium = ${utils.formatEther(premiumInfo.premium)}`);

  console.log('2. Confirm premium');

  const confirmInfo = await confirmCoverPremium({
    chain,
    params: premiumInfo.params,
  });

  console.log('3. Purchase cover');

  const receipt = await buyCover(wallet, confirmInfo.params);

  console.log('Cover purchase successful.');
  console.log(`Transaction hash: ${receipt.transactionHash}`);
}

main();
