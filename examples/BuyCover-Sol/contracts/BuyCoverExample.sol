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

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import {ICover} from "./ICover.sol";

contract BuyCoverExample is OwnableUpgradeable {
    using SafeMathUpgradeable for uint256;

    function initializeLocalBuyCoverExample() public initializer {
        __Ownable_init();
    }

    address public coverContractAddress;

    function setup(address _coverContractAddress) external onlyOwner {
        require(_coverContractAddress != address(0), "S:1");
        coverContractAddress = _coverContractAddress;
    }

    function myOwnBuyCoverFunc(
        uint16[] memory products,
        uint16[] memory durationInDays,
        uint256[] memory amounts,
        address currency,
        address owner,
        uint256 referralCode,
        uint256 premiumAmount,
        uint256[] memory helperParameters,
        uint256[] memory securityParameters,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        require(coverContractAddress != address(0), "myOwnBuyCoverFunc:1");

        // ensure you have enough premium in current contract as the coverContract will utilize
        // safeTransferFrom for ERC20 token or
        // check msg.value in case you are using native token

        ICover(coverContractAddress).buyCover(
            products,
            durationInDays,
            amounts,
            currency,
            owner,
            referralCode,
            premiumAmount,
            helperParameters,
            securityParameters,
            v,
            r,
            s
        );
    }
}
