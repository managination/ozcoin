import React, {PureComponent, PropTypes} from "react";

export default class NotFound extends PureComponent {

    render() {
        let headerText = null;
        if (this.props.params.firstTime) {
            headerText = <div>
                <h1>Congratulations, you have successfully opened your OzGLD wallet and YOU ARE LOGGED IN</h1>
                <h2 style={{color: "red"}}>Please read the following carefully to avoid loosing your money</h2>
            </div>
        }
        return (
            <div className="">
                {headerText}
                <h3>Security and Sign-In</h3>
                <h2>
                    The most important thing is to first copy your mnemonic and store it in a safe place.
                </h2>

                <p>
                    This is the ONLY way you can recreate your wallet or access it from a different device.
                    To copy your mnemonic, click on the menu (three dots) in the top right hand corner of your wallet
                    and select Copy mnemonic. Once you enter your password it displays and you can copy it.
                </p>

                <p style={{fontWeight: "bold", color: "red"}}>
                    PLEASE NOTE: If you clean all the cookies and browsing history from your browser, you will have to
                    use your mnemonic to re-open your wallet again. You CANNOT open your wallet without your Mnemonic
                    if you have deleted your cookies or browsing history.
                </p>

                {/*
                 <p>
                 If you do not close your OzGLD Wallet it will automatically close after some time and require that
                 you sign in with your OzGLD Wallet password again.
                 </p>
                 <p>
                 To sign out of your wallet, simply close the browser tab or click the Sign Out icon in the top right
                 of your window.
                 </p>
                 */}
                <p>
                    To access your wallet again, simply go to
                    <a target="_blank" href="https://app.ozgldwallet.com/wallet">https://app.ozgldwallet.com/wallet</a>
                    from
                    the same browser on the same computer and enter your OzGLD Wallet password.
                </p>

                <h3>Your Wallet Address & Account Reference</h3>
                <p>Your OzGLD Wallet Address is the long string of random characters appearing at the top of the
                    window after your name. To copy this address, simply click on it and your Acc Ref displays to
                    its right.</p>
                <h3>Buy OzGLD</h3>
                <p>You can get OzGLD in one of three ways.
                    See <a target="_blank" href="http://ozgld.com/get-ozcoingold/">http://ozgld.com/get-ozcoingold/</a>
                </p>

                <ol>
                    <li>
                        Deposit the money into the OZcoinGold Escrow bank account.
                        See <a target="_blank"
                               href="http://ozgld.com/get-ozcoingold/">http://ozgld.com/get-ozcoingold/</a> referencing
                        your Acc Ref. N.B. Without the Acc Ref OZcoinGold does not know which account to
                        deposit the OzGLD’s to. Your OzGLD will be transferred to your OzGLD wallet within 48 hours from
                        confirming fund clearance.
                    </li>
                    <li>
                        You can buy OzGLD from this wallet with Ether. But before you can do this you need to transfer
                        Ether to your wallet and register your OzGLD wallet with the smart contract. A menu entry will
                        appear as soon as your wallet contains some Ether
                        <ol type="a">
                            <li>To transfer Ether, copy your OzGLD Address by clicking on it. Transfer the Ether from
                                your exchange account, Mist wallet or other wallet, referencing your OzGLD Address as
                                the recipient address.
                            </li>
                            <li>The moment your OzGLD has an Ether balance you will notice an extra Registration icon in
                                your OzGLD Wallet’s left menu. Click on this, enter your OzGLD password and confirm
                                registration with smart contract.
                            </li>
                            <li>You are now ready to buy OzGLD from your OzGLD Wallet using ether.</li>
                        </ol>
                    </li>
                    <li>Shortly you’ll be able to buy OzGLD from a number of exchanges.</li>
                </ol>

                <h3>The OzGLD Transaction Window</h3>
                <p>
                    To open the OzGLD transaction window, click the Wallet option in your side menu. Your OzGLD Transfer
                    window displays as the default window. From here you can transfer OzGLD to any other blockchain
                    account or wallet. To do this:
                </p>
                <ol>
                    <li>Enter the recipient’s wallet address in the Recipient address field. Ensure that this is the
                        correct address or the OzGLD will be gone forever.
                    </li>
                    <li>Enter the amount of OzGLD you want to transfer and select TRANSFER. Note that every OzGLD
                        transfer transaction incurs a small OzGLD transaction fee that is subtracted from amount you are
                        sending. The amount that the recipient will receive is also displayed. Or you can simply enter
                        the amount they should receive in the second field and it will display the amount you’ll need to
                        send.
                    </li>
                    <li>Enter your OzGLD Password and select confirm.</li>
                </ol>
                <p>
                    To buy OzGLD click on the shopping cart icon. The Buy window displays.
                </p>
                <li>Leave the OZ Coin Account as the default account to buy from.</li>
                <li>Enter the number of OzGLD coins you want to purchase.</li>
                <li>Click BUY OZGLD and enter your OzGLD password in the confirmation window.</li>
                <li>Click Confirm. It may take as long as a couple of minutes for your transaction to be mined on the
                    blockchain and for your OzGLD to display in your wallet.
                </li>
                <p>
                    For any questions, please feel free to contact us on
                    <a target="_blank" href="http://ozgld.com/contact-us/">http://ozgld.com/contact-us/</a>
                </p>
            </div>
        );
    }
}
