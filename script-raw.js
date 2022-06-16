const { ethers } = require("ethers");
const { ADDRESS, ABI } = require("./constants/writers-corner");

console.log("You ran an external JS file v1.01.14");
console.log("Imported address:", ADDRESS);

/* Functions Start */
const alertNetwork = (networkId, correctNetworkId) => {
    const networks = {
        1: "Mainnet",
        3: "Ropsten",
        4: "Rinkeby",
        5: "Goerli",
    };

    if (networkId === correctNetworkId) {
        console.log(
            "You are connected to the right network:",
            networks[network]
        );
    } else {
        alert(
            `You are connected to the wrong network - ${networks[network]}.\n Please connect to the right network: ${networks[correctNetworkId]}`
        );
    }
};

const checkNetwork = async () => {
    try {
        const { ethereum } = window;
        if (ethereum) {
            console.log("Connected Network:", ethereum.networkVersion);
            window["network"] = ethereum.networkVersion;
            // const element =
            //     window["network"] === "1"
            //         ? "Mainnet, please connect to Rinkeby"
            //         : window["network"] === "3"
            //         ? "Ropsten, please connect to Rinkeby"
            //         : window["network"] === "4"
            //         ? "Rinkeby"
            //         : window["network"] === "5"
            //         ? "Goerli, please connect to Rinkeby"
            //         : "No network, please connect to Rinkeby";
            // document.getElementById("network-message").innerHTML = element;

            // alert user if they are connected to the wrong network
            alertNetwork(window["network"], "4");
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
            )} Connected &#x1F44D
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
            const mintingContract = new ethers.Contract(ADDRESS, ABI, signer);
            console.log("Connected to contract:", mintingContract.address);
            window["contract"] = mintingContract;

            // insert into DOM
            // const element = `
            //     ${window["contract"].address.substring(0, 5)}...${window[
            //     "contract"
            // ].address.substring(
            //     window["contract"].address.length - 5,
            //     window["contract"].address.length
            // )} Contract Connected
            // `;
            // document.getElementById("connected-contract-p").innerHTML = element;
        } else {
            window["contract"] = null;
            // const element = `
            //     No Contract Connected
            // `;
            // document.getElementById("connected-contract-p").innerHTML = element;
        }
    } else {
        console.log("Ethereum object not found");
    }
};

const getTotalMinted = async () => {
    const _totalMinted = await window["contract"].totalSupply();
    window["totalMinted"] = _totalMinted.toNumber();
    document.getElementById("total-minted").innerHTML = window["totalMinted"];
};

const getTotalSupply = async () => {
    const _totalSupply = await window["contract"].maxSupply();
    window["totalSupply"] = _totalSupply.toNumber();
    document.getElementById("total-supply").innerHTML = window["totalSupply"];
};

const getCost = async () => {
    const _cost = await window["contract"].cost();
    window["cost"] = ethers.utils.formatEther(_cost);
    document.getElementById("mint-cost").innerHTML = window["cost"];
};

const getMaxMintAmount = async () => {
    const _maxMint = await window["contract"].maxMintAmount();
    window["maxMint"] = _maxMint.toNumber();
    document.getElementById("max-mint").innerHTML = window["maxMint"];
};

const getPaused = async () => {
    const _paused = await window["contract"].paused();
    window["paused"] = _paused;
    if (window["paused"]) {
        console.log("The contract is paused");
    } else {
        console.log("The contract is not paused");
    }
};

const updateAmt = (event) => {
    window["amount"] = parseInt(event.target.value);
};

const attachInputListener = (mintPaused) => {
    if (mintPaused) {
        document.getElementById("mint-amount-input").disabled = true;
    } else {
        document
            .getElementById("mint-amount-input")
            .addEventListener("change", updateAmt);
    }
};

const mint = async () => {
    try {
        if (window["amount"] < 1 || window["amount"] > window["maxMint"]) {
            alert("You are trying to mint an invalid amount of NFTs");
            return;
        }

        if (window["contract"]) {
            console.log(`Minting ${window["amount"]}`);
            const mintTxn = await window["contract"].mint(window["amount"], {
                value: ethers.utils.parseEther(
                    (window["amount"] * parseFloat(window["cost"])).toString()
                ),
                gasLimit: window["amount"] * 200000,
            });
            await mintTxn.wait();
            console.log("Mint transaction: ", mintTxn);
            await getTotalMinted();
            alert(`Congratulations! You just minted ${window["amount"]} NFTs`);
        }
    } catch (error) {
        console.log("Minting erorr", error);
        alert("Minting erorr", error);
    }
};

const attachMintListener = (mintPaused) => {
    if (mintPaused) {
        document.getElementById("mint-button").innerHTML = "Paused";
    } else {
        document.getElementById("mint-button").addEventListener("click", mint);
    }
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

    // check network and account
    await checkNetwork();
    await checkConnection();

    // attach function to connect wallet button
    if (!window["account"]) {
        console.log("Attaching connect wallet function...");
        attachConnectWalletButton();
    }

    // connect to contract
    await connectContract();

    // attach contract details to mint section
    if (window["contract"]) {
        await getTotalMinted();
        await getTotalSupply();
        await getCost();
        await getMaxMintAmount();
        await getPaused();

        // add event listener to the input section
        attachInputListener(window["paused"]);

        // add event listener to mint button
        attachMintListener(window["paused"]);
    }
});

/* Event Listeners End */
