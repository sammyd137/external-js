const { ethers } = require("ethers");

console.log("You ran an external JS file");

/* State */
const state = {};

/* Functions Start */
const externalFunction = () => {
    console.log("You ran a function from an external JS file");
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
            state["account"] = account;
            const element = `
                ${account.substring(0, 5)}...${account.substring(
                account.length - 5,
                account.length
            )} Wallet Connected 
            `;
            document.getElementById("connected-wallet-div").innerHTML = element;
        } else {
            console.log("No authorized account found");
            state["account"] = null;
            const element = `
                No Wallet Connected 
            `;
            document.getElementById("connected-wallet-div").innerHTML = element;
        }
    } catch (error) {
        console.log(error);
    }
};

const checkNetwork = async () => {
    try {
        const { ethereum } = window;
        if (ethereum) {
            console.log("Connected Network:", ethereum.networkVersion);
            state["network"] = ethereum.networkVersion;
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
        setCurrentAccount(accounts[0]);
    } catch (error) {
        console.log(error);
    }
};

const connectContract = async () => {
    const { ethereum } = window;
    if (ethereum) {
        if (state["account"] !== null) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const mintingContract = new ethers.Contract(ADDRESS, abi, signer);
            console.log("Connected to contract:", mintingContract.address);
            state["contract"] = mintingContract;

            // insert into DOM
            const element = `
                ${state["contract"].address.substring(0, 5)}...${state[
                "contract"
            ].address.substring(
                state["contract"].address.length - 5,
                state["contract"].address.length
            )} Contract Connected 
            `;
            document.getElementById("connected-contract-div").innerHTML =
                element;
        } else {
            const element = `
                No Contract Connected 
            `;
            document.getElementById("connected-contract-div").innerHTML =
                element;
        }
    } else {
        console.log("Ethereum object not found");
    }
};

const getTotalMinted = async () => {
    const _totalMinted = await state["contract"].getCurrentSupply();
    state["totalMinted"] = _totalMinted.toNumber();
};

const getTotalSupply = async () => {
    const _totalSupply = await state["contract"].maxSupply();
    state["totalSupply"] = _totalSupply.toNumber();
};

const getCost = async () => {
    const _cost = await state["contract"].cost();
    state["cost"] = ethers.utils.formatEther(_cost);
};

const updateAmt = (event) => {
    state["amount"] = parseInt(event.target.value);
};

const renderMintComponent = async () => {
    await getTotalMinted();
    await getTotalSupply();
    await getCost();

    const mintComponent = `
    <div class="mint-container">
        <div class="mint-sub-container">Mint cost: ${state["cost"]} ETH</div>
        <div class="mint-sub-container">
            <input type="text" id="mint-input"/>
        </div>
        <div class="mint-sub-container">
            <button
                class="cta-button connect-wallet-button"
                id="mint-button"
            >
                Mint
            </button>
        </div>
        <div class="mint-sub-container">
            ${state["totalMinted"]}/${state["totalSupply"]} minted
        </div>
    </div>
    `;
    document.getElementById("mint-contract-div").innerHTML = mintComponent;

    // add on change listener on input
    document
        .getElementById("mint-input")
        .addEventListener("change", (event) => {
            state["amount"] = parseInt(event.target.value);
        });

    // add listener to mint button
    document
        .getElementById("mint-button")
        .addEventListener("click", async () => {
            await mint();
        });
};

const renderConnectButton = () => {
    const element = `
    <button class="cta-button connect-wallet-button" id="connect-wallet-button">
        Connect Wallet
    </button>
    `;
    document.getElementById("connect-wallet-container").innerHTML = element;
    document
        .getElementById("connect-wallet-button")
        .addEventListener("click", connectWallet);
};

const mint = async () => {
    try {
        if (state["contract"]) {
            console.log(`Minting ${state["amount"]}`);
            const mintTxn = await state["contract"].mint(state["amount"], {
                value: ethers.utils.parseEther(
                    (state["amount"] * parseFloat(state["cost"])).toString()
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
    await connectContract();

    // render connect button if no account is connected
    if (!state["account"]) {
        await renderConnectButton();
    }

    // render mint component if contract is connected
    if (!state["contract"]) {
        // add event listener to element if there is no contract connected yet
        const el = document.getElementById("connected-contract-div");
        el.addEventListener("change", async () => {
            await renderMintComponent();
        });
    } else {
        await renderMintComponent();
    }
});

/* Event Listeners End */
