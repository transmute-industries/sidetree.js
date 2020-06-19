pragma solidity 0.5.0;

contract SimpleSidetreeAnchor {
    uint256 public transactionNumber = 0;

    event Anchor(bytes32 anchorFileHash, uint256 indexed transactionNumber, uint numberOfOperations);

    function anchorHash(bytes32 _anchorHash, uint _numberOfOperations) public {
        emit Anchor(_anchorHash, transactionNumber, _numberOfOperations);
        transactionNumber = transactionNumber + 1;
    }
}
