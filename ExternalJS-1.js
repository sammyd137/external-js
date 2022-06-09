const { ethers } = require("ethers");

console.log("You ran an external JS file v1.01.03");

/* Functions Start */
const checkNetwork = async () => {
    try {
        const { ethereum } = window;
        if (ethereum) {
            console.log("Connected Network:", ethereum.networkVersion);
            window["network"] = ethereum.networkVersion;
        }
    } catch (error) {
        console.log(error);
    }
};

const checkConnection = async () => {
    try {
        const { ethereum } = window;
        if (!ethereum) {
            console.log("Make sure you have Metamask");
            return;
        } else {
            console.log("Ethereum object detected", ethereum);
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found authorized account:", account);
            window["account"] = account;
            const element = `
                ${account.substring(0, 5)}...${account.substring(
                account.length - 5,
                account.length
            )} Wallet Connected 
            `;
            document.getElementById("connect-wallet-button").innerHTML =
                element;
        } else {
            console.log("No authorized account found");
            window["account"] = null;
            const element = `
                No Wallet Connected 
            `;
            // document.getElementById("connected-wallet-div").innerHTML = element;
        }
    } catch (error) {
        console.log(error);
    }
};

const connectWallet = async () => {
    try {
        const { ethereum } = window;
        if (!ethereum) {
            console.log("Make sure you have Metamask");
            return;
        }

        const accounts = await ethereum.request({
            method: "eth_requestAccounts",
        });
        console.log("Connected", accounts[0]);
        window["currentAccount"] = accounts[0];
    } catch (error) {
        console.log(error);
    }
};

const attachConnectWalletButton = () => {
    document
        .getElementById("connect-wallet-button")
        .addEventListener("click", connectWallet);
};

const connectContract = async () => {
    const { ethereum } = window;
    if (ethereum) {
        if (window["account"]) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const mintingContract = new ethers.Contract(ADDRESS, abi, signer);
            console.log("Connected to contract:", mintingContract.address);
            window["contract"] = mintingContract;

            // insert into DOM
            const element = `
                ${window["contract"].address.substring(0, 5)}...${window[
                "contract"
            ].address.substring(
                window["contract"].address.length - 5,
                window["contract"].address.length
            )} Contract Connected 
            `;
            document.getElementById("connected-contract-p").innerHTML =
                element;
        } else {
            const element = `
                No Contract Connected 
            `;
            document.getElementById("connected-contract-p").innerHTML =
                element;
        }
    } else {
        console.log("Ethereum object not found");
    }
};

const getTotalMinted = async () => {
    const _totalMinted = await window["contract"].getCurrentSupply();
    window["totalMinted"] = _totalMinted.toNumber();
};

const getTotalSupply = async () => {
    const _totalSupply = await window["contract"].maxSupply();
    window["totalSupply"] = _totalSupply.toNumber();
};

const getCost = async () => {
    const _cost = await window["contract"].cost();
    window["cost"] = ethers.utils.formatEther(_cost);
};

const updateAmt = (event) => {
    window["amount"] = parseInt(event.target.value);
};

const attachInputListener = () => {
    document
        .getElementById("mint-amount-input")
        .addEventListener("change", updateAmt);
};

const mint = async () => {
    try {
        if (window["contract"]) {
            console.log(`Minting ${window["amount"]}`);
            const mintTxn = await window["contract"].mint(window["amount"], {
                value: ethers.utils.parseEther(
                    (window["amount"] * parseFloat(window["cost"])).toString()
                ),
                gasLimit: state["amount"] * 200000,
            });
            await mintTxn.wait();
            console.log("Mint transaction: ", mintTxn);
            await getTotalMinted();
        }
    } catch (error) {
        console.log("Minting transaction erorr", error);
    }
};

const attachMintListener = () => {
    document.getElementById("mint-button").addEventListener("click", mint);
};
/* Functions End */

/* Event Listeners Start */
window.addEventListener("load", async () => {
    // reload page on account / network change
    const { ethereum } = window;
    if (ethereum) {
        ethereum.on("chainChanged", () => {
            window.location.reload();
        });
        ethereum.on("accountsChanged", () => {
            window.location.reload();
        });
    }

    // on first load check if there is already a connected account / contract
    await checkNetwork();
    await checkConnection();
    
    // attach function to connect wallet button
    if (!window["account"]) {
        console.log("Attaching connect wallet function...");
        attachConnectWalletButton();
    }
    
    await connectContract();
    
    // attach contract details to mint section
    // if (window["contract"]) {
    //     await getTotalMinted();
    //     await getTotalSupply();
    //     await getCost();

    //     // add event listener to the input section
    //     attachInputListener();

    //     // add event listener to mint button
    //     attachMintListener();
    // }
});

/* Event Listeners End */
