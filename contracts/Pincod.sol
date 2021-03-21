// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Pincod is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct Product {
        address ownerProduct;
        string title;
        string description;
        string brand;
        string category;
        string barcode;
    }
    
    Product[] products;
    mapping(uint256 => uint256) public usages;
    
    constructor() ERC721("PinCod", "PNC") {}
    

    function mint(string memory title, string memory description, string memory brand, string memory category, string memory barcode, string memory tokenURI) public returns (uint256) {

        bytes memory tempEmptyStringTest = bytes(title);
        require(tempEmptyStringTest.length != 0, "Title can't be empty");
        tempEmptyStringTest = bytes(description);
        require(tempEmptyStringTest.length != 0, "Description can't be empty");
        tempEmptyStringTest = bytes(brand);
        require(tempEmptyStringTest.length != 0, "Brand can't be empty");
        tempEmptyStringTest = bytes(category);
        require(tempEmptyStringTest.length != 0, "Category can't be empty");
        tempEmptyStringTest = bytes(barcode);
        require(tempEmptyStringTest.length != 0, "Barcode can't be empty");

        
        for (uint i = 0; i < products.length; i++) {
            require(keccak256(bytes(products[i].barcode)) != keccak256(bytes(barcode)), "Product already exists.");
        }
        
        Product memory product = Product(msg.sender, title, description, brand, category, barcode);
        products.push(product);

        uint256 tokenID = _tokenIds.current();
        usages[tokenID] = 0;                              //starts the usage of the current product at 0.
        
        _safeMint(owner(), tokenID);
        _setTokenURI(tokenID, tokenURI);
        _tokenIds.increment();

        return tokenID;
    }
    
    function getProductFromIndex(uint index) public returns(string memory name, string memory description,  string memory brand,  string memory category) {
        usages[index] = usages[index] + 1;
        return (products[index].title, products[index].description, products[index].brand, products[index].category);
    }
    
    function getWannabeOwnerOfIndex(uint index) public onlyOwner view returns(address) {
        return products[index].ownerProduct;
    }
    
}


