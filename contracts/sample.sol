// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract MultiTokenSwap {
    ISwapRouter public immutable swapRouter;

    constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

    function swapTokensForToken(
        address[] memory path,
        uint256[] memory amounts,
        //uint256 amountOutMin,
        uint24[] memory fees,
        address to
    ) external {
        require(path.length >= 2, "MultiTokenSwap: INVALID_PATH");

        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            address(this),
            amounts[0]
        );
        TransferHelper.safeApprove(path[0], address(swapRouter), amounts[0]);

        address inputToken = path[0];

        for (uint i; i < path.length - 1; i++) {
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams({
                    tokenIn: inputToken,
                    tokenOut: path[i + 1],
                    fee: fees[i],
                    recipient: address(this),
                    deadline: block.timestamp + 120,
                    amountIn: amounts[i],
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });

            swapRouter.exactInputSingle(params);
            inputToken = path[i + 1];
        }

        TransferHelper.safeTransfer(
            inputToken,
            to,
            IERC20(inputToken).balanceOf(address(this))
        );
    }
}
