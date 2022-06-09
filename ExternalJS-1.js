const { ethers } = require("ethers");

console.log("You ran an external JS file v1.01.02");

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
            document.getElementById("connect-wallet-button").innerHTML = element;
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
        window["currentAccount"] = (accounts[0]);
    } catch (error) {
        console.log(error);
    }
};

const attachConnectWalletButton = () => {
    // const element = `
    // <button class="cta-button connect-wallet-button" id="connect-wallet-button">
    //     Connect Wallet
    // </button>
    // `;
    // document.getElementById("connect-wallet-container").innerHTML = element;
    document
        .getElementById("connect-wallet-button")
        .addEventListener("click", connectWallet);
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
    // await connectContract();

    // attach function to connect wallet button
    if (!window.account) {
        console.log("Attaching connect wallet function...")
        attachConnectWalletButton();
    } else {

    }

});

/* Event Listeners End */