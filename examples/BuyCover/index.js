const axios = require('axios');
const { Contract, providers, utils, Wallet } = require('ethers');

// -------------------------------------------------------------------------------------------------
// Configuration
// -------------------------------------------------------------------------------------------------

// The JSON RPC URL that connects to an Ethereum node.
const jsonRpcUrl = '';

// The private key of a wallet that is used to purchase this cover.
const privateKey = '';

// The address of InsurAce Cover contract.
const contractAddress = '0x0921f628b8463227615D2199D0D3860E4fBcD411';

// The URL of InsurAce API.
const httpApiUrl = 'https://api.insurace.io/ops/v1';

// The code that allows consumers to access InsurAce API.
const httpApiCode = '';

// The blockchain that the cover purchase transaction is sent to. Valid values are ETH or BSC.
const chain = 'ETH';

// The product IDs for this cover purchase. Can be more than 1 product IDs. Please check https://docs.insurace.io/landing-page/documentation/protocol-design/product-design/product-list for a complete list of products.
const productIds = [1, 2];

// The cover period (in days) for each product.
const coverDays = [30, 365];

// The cover amount for each product.
const coverAmounts = [utils.parseEther('1000'), utils.parseEther('2000')];

// The address of the token used to purchase this cover. Please check https://api.insurace.io/docs for a list of tokens that can be used to purchase covers.
const coverCurrency = '';

// The referral code used in this cover purchase, may be null.
const referralCode = null;

// -------------------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------------------

async function getCoverPremium({ chain, productIds, coverDays, coverAmounts, coverCurrency, owner, referralCode }) {
  const body = {
    chain,
    productIds,
    coverDays,
    coverAmounts,
    coverCurrency,
    owner,
    referralCode,
  };

  const options = {
    params: {
      code: httpApiCode,
    },
  };

  const { data } = await axios.post(httpApiUrl + '/getCoverPremium', body, options);

  return {
    premium: data.premiumAmount,
    params: data.params,
  };
}

async function confirmCoverPremium({ chain, params }) {
  const body = {
    chain,
    params,
  };

  const options = {
    params: {
      code: httpApiCode,
    },
  };

  const { data } = await axios.post(httpApiUrl + '/confirmCoverPremium', body, options);

  return {
    params: data,
  };
}

async function buyCover(wallet, params) {
  const contractAbi = [
    'function buyCover(uint16[] products, uint16[] durationInDays, uint256[] amounts, address currency, address owner, uint256 referralCode, uint256 premiumAmount, uint256[] helperParameters, uint256[] securityParameters, uint8 v, bytes32 r, bytes32 s) payable',
  ];

  const contract = new Contract(contractAddress, contractAbi, wallet);

  const response = await contract.buyCover(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9], params[10], params[11]);

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
    owner: wallet.address,
    chain,
    productIds,
    coverDays,
    coverAmounts,
    coverCurrency,
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
