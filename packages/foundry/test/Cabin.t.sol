// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Cabin} from "../contracts/Cabin.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract CabinTest is Test {
    Cabin public cabin;
    MockERC20 public token;
    
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    
    uint256 constant ONE_DAY = 1 days;
    uint256 constant ONE_WEEK = 7 days;
    
    function setUp() public {
        cabin = new Cabin();
        token = new MockERC20("Test Token", "TEST", 18);
        
        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        token.mint(alice, 1000 ether);
        token.mint(bob, 1000 ether);
    }
    
    /*//////////////////////////////////////////////////////////////
                            ETH RETREATS
    //////////////////////////////////////////////////////////////*/
    
    function test_RetreatWithETH() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        assertEq(retreatId, 0);
        assertEq(cabin.activeRetreats(), 1);
        assertEq(cabin.totalRetreats(), 1);
        assertEq(address(cabin).balance, 1 ether);
        
        (address owner, address tkn, uint256 amount, uint256 returnTime, bool active) = cabin.getRetreat(retreatId);
        assertEq(owner, alice);
        assertEq(tkn, address(0));
        assertEq(amount, 1 ether);
        assertEq(returnTime, block.timestamp + ONE_WEEK);
        assertTrue(active);
    }
    
    function test_CannotWithdrawEarly() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        // Try to withdraw immediately
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(
            Cabin.StillOnRetreat.selector,
            block.timestamp + ONE_WEEK,
            block.timestamp
        ));
        cabin.returnToSociety(retreatId);
    }
    
    function test_WithdrawAfterRetreat() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        uint256 balanceBefore = alice.balance;
        
        // Fast forward past retreat
        vm.warp(block.timestamp + ONE_WEEK + 1);
        
        vm.prank(alice);
        cabin.returnToSociety(retreatId);
        
        assertEq(alice.balance, balanceBefore + 1 ether);
        assertEq(cabin.activeRetreats(), 0);
        assertEq(address(cabin).balance, 0);
    }
    
    function test_ExtendRetreat() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        uint256 originalReturn = block.timestamp + ONE_WEEK;
        
        // Extend by another week
        vm.prank(alice);
        cabin.extendRetreat(retreatId, ONE_WEEK);
        
        (,,,uint256 newReturnTime,) = cabin.getRetreat(retreatId);
        assertEq(newReturnTime, originalReturn + ONE_WEEK);
    }
    
    function test_AddSuppliesETH() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        vm.prank(alice);
        cabin.addSuppliesETH{value: 0.5 ether}(retreatId);
        
        (,,uint256 amount,,) = cabin.getRetreat(retreatId);
        assertEq(amount, 1.5 ether);
    }
    
    /*//////////////////////////////////////////////////////////////
                           TOKEN RETREATS
    //////////////////////////////////////////////////////////////*/
    
    function test_RetreatWithToken() public {
        vm.startPrank(alice);
        token.approve(address(cabin), 100 ether);
        uint256 retreatId = cabin.retreatWithToken(address(token), 100 ether, ONE_WEEK);
        vm.stopPrank();
        
        assertEq(retreatId, 0);
        assertEq(token.balanceOf(address(cabin)), 100 ether);
        
        (address owner, address tkn, uint256 amount,,) = cabin.getRetreat(retreatId);
        assertEq(owner, alice);
        assertEq(tkn, address(token));
        assertEq(amount, 100 ether);
    }
    
    function test_WithdrawTokenAfterRetreat() public {
        vm.startPrank(alice);
        token.approve(address(cabin), 100 ether);
        uint256 retreatId = cabin.retreatWithToken(address(token), 100 ether, ONE_WEEK);
        vm.stopPrank();
        
        uint256 balanceBefore = token.balanceOf(alice);
        
        vm.warp(block.timestamp + ONE_WEEK + 1);
        
        vm.prank(alice);
        cabin.returnToSociety(retreatId);
        
        assertEq(token.balanceOf(alice), balanceBefore + 100 ether);
    }
    
    /*//////////////////////////////////////////////////////////////
                            ACCESS CONTROL
    //////////////////////////////////////////////////////////////*/
    
    function test_OnlyOwnerCanWithdraw() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        vm.warp(block.timestamp + ONE_WEEK + 1);
        
        // Bob tries to withdraw Alice's retreat
        vm.prank(bob);
        vm.expectRevert(Cabin.NotYourRetreat.selector);
        cabin.returnToSociety(retreatId);
    }
    
    function test_OnlyOwnerCanExtend() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        vm.prank(bob);
        vm.expectRevert(Cabin.NotYourRetreat.selector);
        cabin.extendRetreat(retreatId, ONE_WEEK);
    }
    
    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function test_TimeUntilReturn() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        assertEq(cabin.timeUntilReturn(retreatId), ONE_WEEK);
        
        vm.warp(block.timestamp + 3 days);
        assertEq(cabin.timeUntilReturn(retreatId), 4 days);
        
        vm.warp(block.timestamp + 5 days);
        assertEq(cabin.timeUntilReturn(retreatId), 0);
    }
    
    function test_CanReturn() public {
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(ONE_WEEK);
        
        assertFalse(cabin.canReturn(retreatId));
        
        vm.warp(block.timestamp + ONE_WEEK + 1);
        assertTrue(cabin.canReturn(retreatId));
    }
    
    /*//////////////////////////////////////////////////////////////
                              EDGE CASES
    //////////////////////////////////////////////////////////////*/
    
    function test_CannotRetreatZeroETH() public {
        vm.prank(alice);
        vm.expectRevert(Cabin.ZeroAmount.selector);
        cabin.retreatWithETH{value: 0}(ONE_WEEK);
    }
    
    function test_CannotRetreatZeroDuration() public {
        vm.prank(alice);
        vm.expectRevert(Cabin.ZeroDuration.selector);
        cabin.retreatWithETH{value: 1 ether}(0);
    }
    
    function test_MultipleRetreats() public {
        vm.startPrank(alice);
        uint256 id1 = cabin.retreatWithETH{value: 1 ether}(ONE_DAY);
        uint256 id2 = cabin.retreatWithETH{value: 2 ether}(ONE_WEEK);
        vm.stopPrank();
        
        assertEq(id1, 0);
        assertEq(id2, 1);
        assertEq(cabin.activeRetreats(), 2);
        assertEq(address(cabin).balance, 3 ether);
    }
    
    function testFuzz_RetreatDuration(uint256 duration) public {
        duration = bound(duration, 1 hours, 1460 days);
        
        vm.prank(alice);
        uint256 retreatId = cabin.retreatWithETH{value: 1 ether}(duration);
        
        (,,,uint256 returnTime,) = cabin.getRetreat(retreatId);
        assertEq(returnTime, block.timestamp + duration);
    }
}
