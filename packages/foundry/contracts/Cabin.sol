// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

/**
 * @title Cabin
 * @author Ted (github.com/tedkaczynski-the-bot)
 * @notice Go off-grid with your tokens. A time-lock vault for those who need 
 *         to touch grass (or at least stop touching their portfolio).
 * @dev Deposit tokens, set a retreat duration, can't withdraw until it ends.
 *      The forest doesn't have a sell button.
 */
contract Cabin {
    
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when someone begins their retreat
    event RetreatStarted(
        address indexed hermit,
        address indexed token,
        uint256 amount,
        uint256 returnTime,
        uint256 retreatId
    );
    
    /// @notice Emitted when someone extends their retreat
    event RetreatExtended(
        address indexed hermit,
        uint256 indexed retreatId,
        uint256 newReturnTime
    );
    
    /// @notice Emitted when someone returns from their retreat
    event ReturnedToSociety(
        address indexed hermit,
        uint256 indexed retreatId,
        uint256 amount
    );
    
    /// @notice Emitted when someone adds more supplies to their retreat
    event SuppliesAdded(
        address indexed hermit,
        uint256 indexed retreatId,
        uint256 additionalAmount
    );
    
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    
    error StillOnRetreat(uint256 returnTime, uint256 currentTime);
    error RetreatNotFound();
    error CannotShortenRetreat();
    error ZeroAmount();
    error ZeroDuration();
    error TransferFailed();
    error NotYourRetreat();
    
    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    struct Retreat {
        address token;      // address(0) for ETH
        uint256 amount;
        uint256 returnTime; // timestamp when withdrawal unlocks
        bool active;
    }
    
    /*//////////////////////////////////////////////////////////////
                                 STATE
    //////////////////////////////////////////////////////////////*/
    
    /// @notice All retreats by ID
    mapping(uint256 => Retreat) public retreats;
    
    /// @notice Owner of each retreat
    mapping(uint256 => address) public retreatOwner;
    
    /// @notice Counter for retreat IDs
    uint256 public nextRetreatId;
    
    /// @notice Total value locked (for stats)
    uint256 public totalRetreats;
    uint256 public activeRetreats;
    
    /// @notice Minimum retreat duration (1 hour)
    uint256 public constant MIN_DURATION = 1 hours;
    
    /// @notice Maximum retreat duration (4 years - a full election cycle of peace)
    uint256 public constant MAX_DURATION = 1460 days;
    
    /*//////////////////////////////////////////////////////////////
                            RETREAT FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Begin an ETH retreat. Go off-grid.
     * @param duration How long to stay in the cabin (seconds)
     * @return retreatId The ID of your new retreat
     */
    function retreatWithETH(uint256 duration) external payable returns (uint256 retreatId) {
        if (msg.value == 0) revert ZeroAmount();
        if (duration < MIN_DURATION) revert ZeroDuration();
        if (duration > MAX_DURATION) duration = MAX_DURATION;
        
        retreatId = nextRetreatId++;
        uint256 returnTime = block.timestamp + duration;
        
        retreats[retreatId] = Retreat({
            token: address(0),
            amount: msg.value,
            returnTime: returnTime,
            active: true
        });
        
        retreatOwner[retreatId] = msg.sender;
        totalRetreats++;
        activeRetreats++;
        
        emit RetreatStarted(msg.sender, address(0), msg.value, returnTime, retreatId);
    }
    
    /**
     * @notice Begin a token retreat. The cabin accepts all tokens.
     * @param token The ERC20 token to lock
     * @param amount Amount to lock
     * @param duration How long to stay (seconds)
     * @return retreatId The ID of your new retreat
     */
    function retreatWithToken(
        address token,
        uint256 amount,
        uint256 duration
    ) external returns (uint256 retreatId) {
        if (amount == 0) revert ZeroAmount();
        if (duration < MIN_DURATION) revert ZeroDuration();
        if (duration > MAX_DURATION) duration = MAX_DURATION;
        
        // Transfer tokens to cabin
        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        
        retreatId = nextRetreatId++;
        uint256 returnTime = block.timestamp + duration;
        
        retreats[retreatId] = Retreat({
            token: token,
            amount: amount,
            returnTime: returnTime,
            active: true
        });
        
        retreatOwner[retreatId] = msg.sender;
        totalRetreats++;
        activeRetreats++;
        
        emit RetreatStarted(msg.sender, token, amount, returnTime, retreatId);
    }
    
    /**
     * @notice Extend your retreat. Sometimes you need more time in the woods.
     * @dev Can only extend, never shorten. The cabin doesn't negotiate.
     * @param retreatId Your retreat ID
     * @param additionalDuration Extra time to add (seconds)
     */
    function extendRetreat(uint256 retreatId, uint256 additionalDuration) external {
        if (retreatOwner[retreatId] != msg.sender) revert NotYourRetreat();
        
        Retreat storage r = retreats[retreatId];
        if (!r.active) revert RetreatNotFound();
        
        uint256 newReturnTime = r.returnTime + additionalDuration;
        
        // Cap at max duration from now
        uint256 maxReturn = block.timestamp + MAX_DURATION;
        if (newReturnTime > maxReturn) newReturnTime = maxReturn;
        
        r.returnTime = newReturnTime;
        
        emit RetreatExtended(msg.sender, retreatId, newReturnTime);
    }
    
    /**
     * @notice Add more supplies to an existing retreat.
     * @param retreatId Your retreat ID
     */
    function addSuppliesETH(uint256 retreatId) external payable {
        if (retreatOwner[retreatId] != msg.sender) revert NotYourRetreat();
        if (msg.value == 0) revert ZeroAmount();
        
        Retreat storage r = retreats[retreatId];
        if (!r.active) revert RetreatNotFound();
        if (r.token != address(0)) revert TransferFailed(); // Wrong token type
        
        r.amount += msg.value;
        
        emit SuppliesAdded(msg.sender, retreatId, msg.value);
    }
    
    /**
     * @notice Add more token supplies to an existing retreat.
     * @param retreatId Your retreat ID  
     * @param amount Additional tokens to add
     */
    function addSuppliesToken(uint256 retreatId, uint256 amount) external {
        if (retreatOwner[retreatId] != msg.sender) revert NotYourRetreat();
        if (amount == 0) revert ZeroAmount();
        
        Retreat storage r = retreats[retreatId];
        if (!r.active) revert RetreatNotFound();
        if (r.token == address(0)) revert TransferFailed(); // Wrong token type
        
        bool success = IERC20(r.token).transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        
        r.amount += amount;
        
        emit SuppliesAdded(msg.sender, retreatId, amount);
    }
    
    /**
     * @notice Return to society. Withdraw your tokens after the retreat ends.
     * @param retreatId Your retreat ID
     */
    function returnToSociety(uint256 retreatId) external {
        if (retreatOwner[retreatId] != msg.sender) revert NotYourRetreat();
        
        Retreat storage r = retreats[retreatId];
        if (!r.active) revert RetreatNotFound();
        
        if (block.timestamp < r.returnTime) {
            revert StillOnRetreat(r.returnTime, block.timestamp);
        }
        
        uint256 amount = r.amount;
        address token = r.token;
        
        // Clear retreat
        r.active = false;
        r.amount = 0;
        activeRetreats--;
        
        // Transfer back
        if (token == address(0)) {
            (bool success,) = msg.sender.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            bool success = IERC20(token).transfer(msg.sender, amount);
            if (!success) revert TransferFailed();
        }
        
        emit ReturnedToSociety(msg.sender, retreatId, amount);
    }
    
    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Check how much time is left on a retreat
     * @param retreatId The retreat to check
     * @return secondsRemaining Time until return (0 if ready)
     */
    function timeUntilReturn(uint256 retreatId) external view returns (uint256 secondsRemaining) {
        Retreat memory r = retreats[retreatId];
        if (!r.active) return 0;
        if (block.timestamp >= r.returnTime) return 0;
        return r.returnTime - block.timestamp;
    }
    
    /**
     * @notice Check if a retreat can be withdrawn
     * @param retreatId The retreat to check
     * @return canReturn True if the hermit can return to society
     */
    function canReturn(uint256 retreatId) external view returns (bool) {
        Retreat memory r = retreats[retreatId];
        return r.active && block.timestamp >= r.returnTime;
    }
    
    /**
     * @notice Get full retreat details
     * @param retreatId The retreat to query
     */
    function getRetreat(uint256 retreatId) external view returns (
        address owner,
        address token,
        uint256 amount,
        uint256 returnTime,
        bool active
    ) {
        Retreat memory r = retreats[retreatId];
        return (
            retreatOwner[retreatId],
            r.token,
            r.amount,
            r.returnTime,
            r.active
        );
    }
}
